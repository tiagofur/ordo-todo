import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpProtocolService } from './mcp-protocol.service';
import { McpCatalogService } from './mcp-catalog.service';
import { V1TasksService } from '../v1/v1-tasks.service';
import { V1ProjectsService } from '../v1/v1-projects.service';
import { V1CommentsService } from '../v1/v1-comments.service';
import { TasksService } from '../tasks/tasks.service';
import { DayPlanService } from '../tasks/day-plan.service';
import { RiskAlertService } from '../scheduling/risk-alert.service';
import { SemanticSearchService } from '../search/semantic-search.service';
import { HabitsService } from '../habits/habits.service';
import { ObjectivesService } from '../objectives/objectives.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { TimersService } from '../timers/timers.service';
import { PrismaService } from '../database/prisma.service';
import { AuthAuditService } from '../auth/auth-audit.service';
import { AuthEventType } from '../auth/types/auth-event.types';
import { runWithMcpContext } from './mcp-context';

/**
 * S4 conformance: the agent only sees/operates what the token owner
 * can. Cross-workspace access surfaces as 403/not-found WITHOUT
 * leaking whether the resource exists, because the catalog delegates
 * to the `/v1` services that enforce ownership.
 *
 * S5: every successful mutating tool call is audit-logged; revoking
 * the underlying grant (PAT or OAuth refresh) makes subsequent calls
 * 401 at the guard layer (covered by guard specs + T1/T2 suites).
 */
describe('MCP permission conformance (S4/S5)', () => {
  let client: Client;

  const forbidden = new ForbiddenException('Only the task owner can modify it');
  const notFound = new NotFoundException('Task not found');

  const mockV1Tasks = {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const mockAudit = { logEvent: jest.fn() };
  const mockDayPlan = {
    apply: jest.fn().mockResolvedValue({ status: 'APPLIED' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McpProtocolService,
        McpCatalogService,
        { provide: V1TasksService, useValue: mockV1Tasks },
        {
          provide: V1ProjectsService,
          useValue: { list: jest.fn().mockResolvedValue([]) },
        },
        { provide: V1CommentsService, useValue: {} },
        { provide: TasksService, useValue: {} },
        { provide: DayPlanService, useValue: mockDayPlan },
        { provide: RiskAlertService, useValue: {} },
        { provide: SemanticSearchService, useValue: {} },
        { provide: HabitsService, useValue: {} },
        { provide: ObjectivesService, useValue: {} },
        {
          provide: WorkspacesService,
          useValue: { findAll: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: TimersService,
          useValue: { getActive: jest.fn().mockResolvedValue(null) },
        },
        {
          provide: PrismaService,
          useValue: { user: { findUnique: jest.fn() } },
        },
        { provide: AuthAuditService, useValue: mockAudit },
      ],
    }).compile();
    await module.init();

    const protocol = module.get<McpProtocolService>(McpProtocolService);
    const [serverTransport, clientTransport] =
      InMemoryTransport.createLinkedPair();
    await protocol.connect(serverTransport);

    client = new Client({ name: 'conformance-client', version: '0.0.0' });
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await client.close().catch(() => undefined);
    jest.clearAllMocks();
  });

  it('should surface cross-owner reads as tool errors without leaking data', async () => {
    mockV1Tasks.get.mockRejectedValue(notFound);

    const result = await runWithMcpContext(
      { userId: 'user-123', scopes: ['read'] },
      () =>
        client.callTool({ name: 'ordo_task_get', arguments: { id: 'task-9' } }),
    );

    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).not.toContain('task-9-secret');
    expect(mockAudit.logEvent).not.toHaveBeenCalled();
  });

  it('should surface cross-owner writes as errors and skip audit', async () => {
    mockV1Tasks.update.mockRejectedValue(forbidden);

    const result = await runWithMcpContext(
      { userId: 'user-123', scopes: ['read', 'tasks:write'] },
      () =>
        client.callTool({
          name: 'ordo_task_update',
          arguments: { id: 'task-9', title: 'hijack' },
        }),
    );

    expect(result.isError).toBe(true);
    expect(mockV1Tasks.update).toHaveBeenCalledWith(
      'user-123',
      'task-9',
      expect.anything(),
    );
    // Failed mutations are NOT audit-logged as MCP_TOOL_CALL.
    expect(mockAudit.logEvent).not.toHaveBeenCalled();
  });

  it('should audit-log successful mutating calls with tool + user', async () => {
    mockV1Tasks.create.mockResolvedValue({ id: 'task-9' });

    const result = await runWithMcpContext(
      { userId: 'user-123', scopes: ['read', 'tasks:write'] },
      () =>
        client.callTool({
          name: 'ordo_task_create',
          arguments: { title: 'x', projectId: 'proj-1' },
        }),
    );

    expect(result.isError).toBeFalsy();
    expect(mockAudit.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: AuthEventType.MCP_TOOL_CALL,
        userId: 'user-123',
        metadata: expect.objectContaining({ tool: 'ordo_task_create' }),
      }),
    );
  });

  it('should NOT audit-log successful read calls', async () => {
    mockV1Tasks.list.mockResolvedValue([{ id: 'task-1' }]);

    const result = await runWithMcpContext(
      { userId: 'user-123', scopes: ['read'] },
      () => client.callTool({ name: 'ordo_task_list', arguments: {} }),
    );

    expect(result.isError).toBeFalsy();
    expect(mockAudit.logEvent).not.toHaveBeenCalled();
  });

  it('should audit-log ordo_day_plan_apply (MUTATING_TOOLS membership)', async () => {
    const result = await runWithMcpContext(
      { userId: 'user-123', scopes: ['read', 'tasks:write'] },
      () =>
        client.callTool({
          name: 'ordo_day_plan_apply',
          arguments: { proposalId: 'prop-1' },
        }),
    );

    expect(result.isError).toBeFalsy();
    expect(mockAudit.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: AuthEventType.MCP_TOOL_CALL,
        userId: 'user-123',
        metadata: expect.objectContaining({ tool: 'ordo_day_plan_apply' }),
      }),
    );
  });
});
