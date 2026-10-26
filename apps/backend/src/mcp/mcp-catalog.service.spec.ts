import { Test, TestingModule } from '@nestjs/testing';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpProtocolService } from './mcp-protocol.service';
import { McpCatalogService } from './mcp-catalog.service';
import { V1TasksService } from '../v1/v1-tasks.service';
import { TasksService } from '../tasks/tasks.service';
import { DayPlanService } from '../tasks/day-plan.service';
import { RiskAlertService } from '../scheduling/risk-alert.service';
import { V1ProjectsService } from '../v1/v1-projects.service';
import { V1CommentsService } from '../v1/v1-comments.service';
import { SemanticSearchService } from '../search/semantic-search.service';
import { HabitsService } from '../habits/habits.service';
import { ObjectivesService } from '../objectives/objectives.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { PrismaService } from '../database/prisma.service';
import { runWithMcpContext } from './mcp-context';

const EXPECTED_TOOLS = [
  'ordo_search',
  'ordo_workspace_list',
  'ordo_task_list',
  'ordo_task_create',
  'ordo_task_get',
  'ordo_task_update',
  'ordo_task_complete',
  'ordo_task_delete',
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
  const mockRisks = {
    assessForUser: jest.fn().mockResolvedValue([
      {
        kind: 'overload',
        taskIds: ['b'],
        message: 'Tight day',
        options: [{ label: 'Move', action: 'reschedule' }],
      },
    ]),
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
  const mockWorkspaces = {
    findAll: jest.fn().mockResolvedValue([
      {
        id: 'ws-1',
        name: 'Creapolis',
        slug: 'creapolis',
        tier: 'FREE',
        isArchived: false,
        stats: { memberCount: 3 },
      },
      {
        id: 'ws-2',
        name: 'Personal',
        slug: 'personal',
        tier: 'FREE',
        isArchived: false,
        stats: { memberCount: 1 },
      },
    ]),
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
        { provide: WorkspacesService, useValue: mockWorkspaces },
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
        { provide: DayPlanService, useValue: mockDayPlan },
        { provide: RiskAlertService, useValue: mockRisks },
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

  // Agent-context tools: workspace disambiguation + readable names.
  describe('workspace disambiguation', () => {
    beforeEach(() => {
      mockV1Projects.list.mockResolvedValue([
        {
          id: 'proj-1',
          name: 'Pepinillo',
          workspaceId: 'ws-1',
        },
        {
          id: 'proj-2',
          name: 'Pepinillo',
          workspaceId: 'ws-2',
        },
      ]);
      mockV1Tasks.list.mockResolvedValue([
        {
          id: 'task-1',
          projectId: 'proj-1',
          status: 'TODO',
          priority: 'HIGH',
          dueDate: new Date('2026-10-26T10:00:00.000Z'),
        },
        {
          id: 'task-2',
          projectId: 'proj-2',
          status: 'COMPLETED',
          priority: 'LOW',
          dueDate: new Date('2026-10-26T10:00:00.000Z'),
        },
      ]);
    });

    it('lists workspaces with the fields agents need to disambiguate', async () => {
      const result = await runWithMcpContext(
        { userId: 'user-123', scopes: ['read'] },
        () => client.callTool({ name: 'ordo_workspace_list', arguments: {} }),
      );

      const payload = JSON.parse(result.content[0].text);
      expect(mockWorkspaces.findAll).toHaveBeenCalledWith('user-123');
      expect(payload.workspaces).toEqual([
        expect.objectContaining({
          id: 'ws-1',
          name: 'Creapolis',
          memberCount: 3,
        }),
        expect.objectContaining({
          id: 'ws-2',
          name: 'Personal',
          memberCount: 1,
        }),
      ]);
    });

    it('enriches tasks with project and workspace names and hides completed by default', async () => {
      const result = await runWithMcpContext(
        { userId: 'user-123', scopes: ['read'] },
        () => client.callTool({ name: 'ordo_task_list', arguments: {} }),
      );

      const payload = JSON.parse(result.content[0].text);
      expect(payload.totalCount).toBe(1);
      expect(payload.tasks[0]).toEqual(
        expect.objectContaining({
          id: 'task-1',
          projectName: 'Pepinillo',
          workspaceId: 'ws-1',
          workspaceName: 'Creapolis',
        }),
      );
    });

    it('disambiguates same-named projects by workspace filter', async () => {
      const result = await runWithMcpContext(
        { userId: 'user-123', scopes: ['read'] },
        () =>
          client.callTool({
            name: 'ordo_project_list',
            arguments: { workspaceId: 'ws-2' },
          }),
      );

      const payload = JSON.parse(result.content[0].text);
      expect(payload.totalCount).toBe(1);
      expect(payload.projects[0]).toEqual(
        expect.objectContaining({
          id: 'proj-2',
          name: 'Pepinillo',
          workspaceName: 'Personal',
        }),
      );
    });

    it('keeps only tasks due today when due=today (UTC day)', async () => {
      mockV1Tasks.list.mockResolvedValue([
        {
          id: 'due-today',
          projectId: 'proj-1',
          status: 'TODO',
          priority: 'MEDIUM',
          dueDate: new Date('2026-10-26T23:59:00.000Z'),
        },
        {
          id: 'due-later',
          projectId: 'proj-1',
          status: 'TODO',
          priority: 'MEDIUM',
          dueDate: new Date('2026-11-01T10:00:00.000Z'),
        },
        {
          id: 'planned-today',
          projectId: 'proj-1',
          status: 'TODO',
          priority: 'MEDIUM',
          dueDate: null,
          doDate: new Date('2026-10-26T08:00:00.000Z'),
        },
      ]);

      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-10-26T12:00:00.000Z'));
      try {
        const result = await runWithMcpContext(
          { userId: 'user-123', scopes: ['read'] },
          () =>
            client.callTool({
              name: 'ordo_task_list',
              arguments: { due: 'today' },
            }),
        );

        const payload = JSON.parse(result.content[0].text);
        expect(payload.tasks.map((t: { id: string }) => t.id).sort()).toEqual([
          'due-today',
          'planned-today',
        ]);
      } finally {
        jest.useRealTimers();
      }
    });
  });

  it('deletes a task the token owner owns', async () => {
    mockV1Tasks.remove = jest.fn().mockResolvedValue({ id: 'task-1' });
    const result = await runWithMcpContext(
      { userId: 'user-123', scopes: ['tasks:write'] },
      () =>
        client.callTool({
          name: 'ordo_task_delete',
          arguments: { id: 'task-1' },
        }),
    );

    expect(mockV1Tasks.remove).toHaveBeenCalledWith('user-123', 'task-1');
    expect(result.isError).toBeUndefined();
  });

  it('exposes tool annotations so clients can pre-classify calls', async () => {
    const { tools } = await client.listTools();
    const byName = new Map(tools.map((tool) => [tool.name, tool]));

    expect(byName.get('ordo_task_list')?.annotations).toMatchObject({
      readOnlyHint: true,
    });
    expect(byName.get('ordo_workspace_list')?.annotations).toMatchObject({
      readOnlyHint: true,
    });
    expect(byName.get('ordo_task_delete')?.annotations).toMatchObject({
      readOnlyHint: false,
      destructiveHint: true,
    });
    expect(byName.get('ordo_task_create')?.annotations).toBeUndefined();
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
    expect(mockRisks.assessForUser).toHaveBeenCalledWith('user-123');
    expect(result.isError).toBeFalsy();
    expect(JSON.stringify(result.content)).toContain('prop-1');
    expect(JSON.stringify(result.content)).toContain('Tight day');
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
