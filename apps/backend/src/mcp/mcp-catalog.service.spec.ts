import { Test, TestingModule } from '@nestjs/testing';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpProtocolService } from './mcp-protocol.service';
import { McpCatalogService } from './mcp-catalog.service';
import { V1TasksService } from '../v1/v1-tasks.service';
import { TasksService } from '../tasks/tasks.service';
import { DayPlanService } from '../tasks/day-plan.service';
import { V1ProjectsService } from '../v1/v1-projects.service';
import { V1CommentsService } from '../v1/v1-comments.service';
import { SemanticSearchService } from '../search/semantic-search.service';
import { HabitsService } from '../habits/habits.service';
import { ObjectivesService } from '../objectives/objectives.service';
import { PrismaService } from '../database/prisma.service';
import { runWithMcpContext } from './mcp-context';

const EXPECTED_TOOLS = [
  'ordo_search',
  'ordo_task_list',
  'ordo_task_create',
  'ordo_task_get',
  'ordo_task_update',
  'ordo_task_complete',
  'ordo_project_list',
  'ordo_project_create',
  'ordo_project_get',
  'ordo_project_update',
  'ordo_comment_add',
  'ordo_habit_today',
  'ordo_habit_complete',
  'ordo_objective_progress',
  'ordo_me',
  'ordo_ping',
  'ordo_day_plan',
  'ordo_day_plan_apply',
];

describe('McpCatalogService (against official SDK client)', () => {
  let client: Client;
  let clientTransport: InstanceType<typeof InMemoryTransport>;

  const mockV1Tasks = {
    list: jest.fn().mockResolvedValue([{ id: 'task-1' }]),
    get: jest.fn().mockResolvedValue({ id: 'task-1' }),
    create: jest.fn().mockResolvedValue({ id: 'task-9' }),
    update: jest.fn().mockResolvedValue({ id: 'task-1' }),
  };
  const mockTasksService = {
    complete: jest.fn().mockResolvedValue({ id: 'task-1' }),
  };
  const mockDayPlan = {
    getDayPlan: jest.fn().mockResolvedValue({
      proposalId: 'prop-1',
      status: 'PROPOSED',
      blocks: [],
      frozenTaskIds: [],
      changes: [],
    }),
    apply: jest.fn().mockResolvedValue({
      proposalId: 'prop-1',
      status: 'APPLIED',
      blocks: [],
      frozenTaskIds: [],
      changes: [],
    }),
  };
  const mockV1Projects = {
    list: jest.fn().mockResolvedValue([{ id: 'proj-1' }]),
    get: jest.fn().mockResolvedValue({ id: 'proj-1' }),
    create: jest.fn().mockResolvedValue({ id: 'proj-9' }),
    update: jest.fn().mockResolvedValue({ id: 'proj-1' }),
  };
  const mockV1Comments = {
    create: jest.fn().mockResolvedValue({ id: 'comment-1' }),
  };
  const mockSearch = {
    search: jest.fn().mockResolvedValue({ results: [], totalCount: 0 }),
  };
  const mockHabits = {
    findForToday: jest.fn().mockResolvedValue([]),
    complete: jest.fn().mockResolvedValue({ id: 'habit-1' }),
  };
  const mockObjectives = {
    getDashboardSummary: jest.fn().mockResolvedValue({ objectives: [] }),
  };
  const mockPrisma = { user: { findUnique: jest.fn() } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McpProtocolService,
        McpCatalogService,
        { provide: V1TasksService, useValue: mockV1Tasks },
        { provide: V1ProjectsService, useValue: mockV1Projects },
        { provide: V1CommentsService, useValue: mockV1Comments },
        { provide: SemanticSearchService, useValue: mockSearch },
        { provide: HabitsService, useValue: mockHabits },
        { provide: ObjectivesService, useValue: mockObjectives },
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
        { provide: DayPlanService, useValue: mockDayPlan },
      ],
    }).compile();

    await module.init();
    const protocol = module.get<McpProtocolService>(McpProtocolService);

    const [serverTransport, linkedClientTransport] =
      InMemoryTransport.createLinkedPair();
    clientTransport = linkedClientTransport;
    await protocol.connect(serverTransport);

    client = new Client({ name: 'test-client', version: '0.0.0' });
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await client.close().catch(() => undefined);
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clientTransport?.close().catch(() => undefined);
  });

  it('should list the full ordo_* catalog', async () => {
    const { tools } = await client.listTools();
    const names = tools.map((tool) => tool.name);

    for (const expected of EXPECTED_TOOLS) {
      expect(names).toContain(expected);
    }
  });

  it('should call ordo_task_list scoped to the context user', async () => {
    const result = await runWithMcpContext(
      { userId: 'user-123', scopes: ['read'] },
      () =>
        client.callTool({
          name: 'ordo_task_list',
          arguments: { projectId: 'proj-1' },
        }),
    );

    expect(mockV1Tasks.list).toHaveBeenCalledWith(
      'user-123',
      expect.objectContaining({ projectId: 'proj-1' }),
    );
    expect(result.content).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'text' })]),
    );
  });

  it('should reject tool calls outside an authenticated context', async () => {
    const result = await client.callTool({
      name: 'ordo_task_list',
      arguments: {},
    });

    expect(result.isError).toBe(true);
  });

  it('should reject calls missing the required scope', async () => {
    const result = await runWithMcpContext(
      { userId: 'user-123', scopes: ['read'] },
      () =>
        client.callTool({
          name: 'ordo_task_create',
          arguments: { title: 'x', projectId: 'proj-1' },
        }),
    );

    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain('tasks:write');
    expect(mockV1Tasks.create).not.toHaveBeenCalled();
  });

  // ODD 005 S6 (T5): day-plan tools for remote agents (ODD 001).
  it('should call ordo_day_plan scoped to the context user', async () => {
    const result = await runWithMcpContext(
      { userId: 'user-123', scopes: ['read'] },
      () => client.callTool({ name: 'ordo_day_plan', arguments: {} }),
    );

    expect(mockDayPlan.getDayPlan).toHaveBeenCalledWith('user-123');
    expect(result.isError).toBeFalsy();
    expect(JSON.stringify(result.content)).toContain('prop-1');
  });

  it('should call ordo_day_plan_apply with proposalId', async () => {
    const result = await runWithMcpContext(
      { userId: 'user-123', scopes: ['read', 'tasks:write'] },
      () =>
        client.callTool({
          name: 'ordo_day_plan_apply',
          arguments: { proposalId: 'prop-1' },
        }),
    );

    expect(mockDayPlan.apply).toHaveBeenCalledWith('user-123', 'prop-1');
    expect(result.isError).toBeFalsy();
    expect(JSON.stringify(result.content)).toContain('APPLIED');
  });

  it('should reject ordo_day_plan_apply missing tasks:write (no mutation)', async () => {
    const result = await runWithMcpContext(
      { userId: 'user-123', scopes: ['read'] },
      () =>
        client.callTool({
          name: 'ordo_day_plan_apply',
          arguments: { proposalId: 'prop-1' },
        }),
    );

    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain('tasks:write');
    expect(mockDayPlan.apply).not.toHaveBeenCalled();
  });
});
