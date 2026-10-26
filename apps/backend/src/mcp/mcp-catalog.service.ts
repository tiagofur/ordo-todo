import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpProtocolService } from './mcp-protocol.service';
import { MCP_TOOL_SCOPES } from './mcp-tool-scopes';
import { mcpContext } from './mcp-context';
import { AuthAuditService } from '../auth/auth-audit.service';
import { AuthEventType } from '../auth/types/auth-event.types';
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
import { NotesService } from '../notes/notes.service';
import { TagsService } from '../tags/tags.service';
import { MeetingAssistantService } from '../meetings/meeting-assistant.service';
import { PrismaService } from '../database/prisma.service';

function text(data: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
  };
}

function toolError(message: string, extra?: Record<string, unknown>) {
  return {
    isError: true as const,
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({ error: message, ...extra }),
      },
    ],
  };
}

/**
 * MCP tool annotations: let clients classify calls before running them
 * (ChatGPT asks for less confirmation on reads and more on destructive
 * operations). Mutating-but-reversible tools (create/update/complete)
 * keep the spec defaults.
 */
const READ_ONLY = { annotations: { readOnlyHint: true } } as const;
const DESTRUCTIVE = {
  annotations: { readOnlyHint: false, destructiveHint: true },
} as const;

/** UTC-day boundaries for the due filters (prod runs UTC; see specs). */
function utcDayBounds(reference = new Date()) {
  const startOfToday = new Date(
    Date.UTC(
      reference.getUTCFullYear(),
      reference.getUTCMonth(),
      reference.getUTCDate(),
    ),
  );
  return {
    startOfToday,
    endOfToday: new Date(startOfToday.getTime() + 86_400_000),
  };
}

interface TaskDueFilter {
  due?: 'today' | 'overdue' | 'week';
}

function matchesDueFilter(
  task: { dueDate?: Date | null; doDate?: Date | null; status?: string },
  filter: TaskDueFilter,
  now = new Date(),
): boolean {
  if (!filter.due) return true;
  const { startOfToday, endOfToday } = utcDayBounds(now);
  const due = task.dueDate ?? task.doDate ?? null;
  if (filter.due === 'overdue') {
    return (
      task.status !== 'COMPLETED' &&
      task.status !== 'CANCELLED' &&
      task.dueDate !== null &&
      task.dueDate !== undefined &&
      task.dueDate.getTime() < startOfToday.getTime()
    );
  }
  if (!due) return false;
  const time = new Date(due).getTime();
  if (filter.due === 'today')
    return time >= startOfToday.getTime() && time < endOfToday.getTime();
  // week: due (or planned) from the start of the UTC day through +7 days
  // (includes tasks due earlier today).
  const start = startOfToday.getTime();
  return time >= start && time < start + 7 * 86_400_000;
}

/**
 * Registers the `ordo_*` domain tools on the MCP server (S3).
 *
 * Every tool resolves the token owner from the ambient {@link mcpContext}
 * (populated per-request by the controller after {@link McpAuthGuard}),
 * enforces its required scope from {@link MCP_TOOL_SCOPES}, and delegates
 * to the public `/v1` services — the same contract external REST clients
 * use, so behavior stays identical across transports.
 */
@Injectable()
export class McpCatalogService implements OnModuleInit {
  private readonly logger = new Logger(McpCatalogService.name);

  /**
   * Tools that mutate state. Every successful call is audit-logged
   * (S5); read tools are not logged to keep the audit signal clean.
   */
  private static readonly MUTATING_TOOLS = new Set([
    'ordo_task_create',
    'ordo_task_update',
    'ordo_task_complete',
    'ordo_task_delete',
    'ordo_project_create',
    'ordo_project_update',
    'ordo_comment_add',
    'ordo_habit_complete',
    'ordo_day_plan_apply',
    'ordo_timer_start',
    'ordo_timer_stop',
    'ordo_timer_pause',
    'ordo_timer_resume',
    'ordo_note_create',
    'ordo_habit_create',
    'ordo_tag_add_to_task',
  ]);

  constructor(
    private readonly protocol: McpProtocolService,
    private readonly v1Tasks: V1TasksService,
    private readonly v1Projects: V1ProjectsService,
    private readonly v1Comments: V1CommentsService,
    private readonly tasksService: TasksService,
    private readonly dayPlanService: DayPlanService,
    // ODD 005 S6+T4b: risks ride along with the plan. McpModule imports
    // SchedulingModule directly; no cycle (Scheduling never imports Mcp).
    private readonly riskAlerts: RiskAlertService,
    private readonly searchService: SemanticSearchService,
    private readonly habitsService: HabitsService,
    private readonly objectivesService: ObjectivesService,
    private readonly workspacesService: WorkspacesService,
    private readonly timersService: TimersService,
    private readonly notesService: NotesService,
    private readonly tagsService: TagsService,
    private readonly meetingsService: MeetingAssistantService,
    private readonly prisma: PrismaService,
    @Optional()
    @Inject(AuthAuditService)
    private readonly audit?: AuthAuditService,
  ) {}

  onModuleInit(): void {
    const server = this.protocol.getServer();
    this.registerSearchTools(server);
    this.registerWorkspaceTools(server);
    this.registerTaskTools(server);
    this.registerProjectTools(server);
    this.registerCommentTools(server);
    this.registerHabitTools(server);
    this.registerObjectiveTools(server);
    this.registerUserTools(server);
    this.registerDayPlanTools(server);
    this.registerTimerTools(server);
    this.registerNoteTools(server);
    this.registerTagTools(server);
    this.registerMeetingTools(server);
    this.logger.log('MCP catalog registered (34 domain tools)');
  }

  /**
   * Workspace membership gate for the workspace-scoped services (notes,
   * tags) whose own layer predates user checks. TagsService and the tag
   * repository take no userId at all, so the catalog is the gate.
   */
  private async assertWorkspaceMember(
    userId: string,
    workspaceId: string,
  ): Promise<void> {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
      select: { id: true },
    });
    if (!member) {
      throw new ForbiddenException('Not a member of this workspace');
    }
  }

  private requireScope(tool: string, scopes: string[]): void {
    const required = MCP_TOOL_SCOPES[tool];
    if (required && !scopes.includes(required)) {
      throw Object.assign(
        new Error(
          `Tool ${tool} requires scope "${required}" (granted: ${scopes.join(', ') || 'none'})`,
        ),
        { code: 'MCP_INSUFFICIENT_SCOPE', missingScopes: [required] },
      );
    }
  }

  private async guarded<T>(
    tool: string,
    fn: (userId: string) => Promise<T>,
  ): Promise<ReturnType<typeof text> | ReturnType<typeof toolError>> {
    try {
      const { userId, scopes } = mcpContext();
      this.requireScope(tool, scopes);
      const result = await fn(userId);
      if (McpCatalogService.MUTATING_TOOLS.has(tool)) {
        await this.audit?.logEvent({
          type: AuthEventType.MCP_TOOL_CALL,
          userId,
          timestamp: new Date(),
          metadata: { tool },
        });
      }
      return text(result);
    } catch (error) {
      const err = error as Error & {
        code?: string;
        missingScopes?: string[];
      };
      if (err.code === 'MCP_UNAUTHENTICATED') {
        return toolError('Not authenticated: call within an MCP request');
      }
      if (err.code === 'MCP_INSUFFICIENT_SCOPE') {
        return toolError(err.message, { missingScopes: err.missingScopes });
      }
      this.logger.warn(`Tool ${tool} failed: ${err.message}`);
      return toolError(err.message);
    }
  }

  /**
   * projectId → { name, workspaceId, workspaceName } for every project
   * the token owner can see. One round-trip per call, reused by the
   * task/project tools so agents always see human-readable names and
   * can disambiguate same-named projects across workspaces.
   */
  private async projectContext(
    userId: string,
  ): Promise<
    Map<
      string,
      { name: string; workspaceId: string; workspaceName: string | null }
    >
  > {
    const [projects, workspaces] = await Promise.all([
      this.v1Projects.list(userId),
      this.workspacesService.findAll(userId),
    ]);
    // Workspace entity ids are loosely typed upstream; every caller here
    // (and every project.workspaceId) is a DB cuid string.
    const workspaceNames = new Map(
      workspaces.map((workspace) => [String(workspace.id), workspace.name]),
    );
    return new Map(
      projects.map((project) => [
        String(project.id),
        {
          name: project.name,
          workspaceId: project.workspaceId,
          workspaceName: workspaceNames.get(project.workspaceId) ?? null,
        },
      ]),
    );
  }

  private registerSearchTools(server: McpServer): void {
    server.registerTool(
      'ordo_search',
      {
        title: 'Search Ordo',
        description:
          'Semantic search across tasks, projects and habits. Returns matching items with titles and ids.',
        ...READ_ONLY,
        inputSchema: z.object({
          query: z.string().min(1).describe('Natural language query'),
          limit: z.number().int().min(1).max(50).optional(),
        }).shape,
      },
      async (args) =>
        this.guarded('ordo_search', async (userId) => {
          const result = await this.searchService.search(userId, args.query, {
            limit: args.limit ?? 10,
          });
          return {
            results: result.results,
            totalCount: result.totalCount,
          };
        }),
    );
  }

  private registerWorkspaceTools(server: McpServer): void {
    server.registerTool(
      'ordo_workspace_list',
      {
        title: 'List workspaces',
        description:
          'List my workspaces (id, name, slug, tier, member count). Call this before creating projects or disambiguating same-named projects.',
        ...READ_ONLY,
        inputSchema: z.object({}).shape,
      },
      async () =>
        this.guarded('ordo_workspace_list', async (userId) => {
          const workspaces = await this.workspacesService.findAll(userId);
          return {
            workspaces: workspaces.map((workspace) => ({
              id: workspace.id,
              name: workspace.name,
              slug: workspace.slug,
              tier: workspace.tier,
              isArchived: workspace.isArchived,
              memberCount: workspace.stats?.memberCount ?? 1,
            })),
          };
        }),
    );
  }

  private registerTaskTools(server: McpServer): void {
    server.registerTool(
      'ordo_task_list',
      {
        title: 'List tasks',
        description:
          'List my tasks with project and workspace names. Filters: due (today/overdue/week, UTC days), status, priority, project, workspace.',
        ...READ_ONLY,
        inputSchema: z.object({
          projectId: z.string().optional(),
          workspaceId: z.string().optional(),
          due: z.enum(['today', 'overdue', 'week']).optional(),
          status: z
            .enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
            .optional(),
          priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
          assignedToMe: z.boolean().optional(),
          includeCompleted: z.boolean().optional(),
        }).shape,
      },
      async (args) =>
        this.guarded('ordo_task_list', async (userId) => {
          const [tasks, context] = await Promise.all([
            this.v1Tasks.list(userId, {
              projectId: args.projectId,
              assignedToMe: args.assignedToMe,
            }),
            this.projectContext(userId),
          ]);
          const enriched = tasks
            .filter((task) => {
              if (args.workspaceId) {
                const ctx = context.get(task.projectId);
                if (ctx?.workspaceId !== args.workspaceId) return false;
              }
              if (args.priority && task.priority !== args.priority) {
                return false;
              }
              if (args.status) {
                if (task.status !== args.status) return false;
              } else if (
                !args.includeCompleted &&
                (task.status === 'COMPLETED' || task.status === 'CANCELLED')
              ) {
                return false;
              }
              return matchesDueFilter(task, args);
            })
            .map((task) => {
              const ctx = context.get(task.projectId);
              return {
                ...task,
                projectName: ctx?.name ?? null,
                workspaceId: ctx?.workspaceId ?? null,
                workspaceName: ctx?.workspaceName ?? null,
              };
            });
          return { tasks: enriched, totalCount: enriched.length };
        }),
    );

    server.registerTool(
      'ordo_task_create',
      {
        title: 'Create task',
        description: 'Create a task owned by the token owner.',
        inputSchema: z.object({
          title: z.string().min(1),
          projectId: z.string().min(1),
          description: z.string().optional(),
          priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
          dueDate: z.string().optional(),
        }).shape,
      },
      async (args) =>
        this.guarded('ordo_task_create', (userId) =>
          this.v1Tasks.create(userId, {
            title: args.title,
            projectId: args.projectId,
            description: args.description,
            priority: args.priority,
            dueDate: args.dueDate ? new Date(args.dueDate) : undefined,
          }),
        ),
    );

    server.registerTool(
      'ordo_task_get',
      {
        title: 'Get task',
        description: 'Get a task by id.',
        ...READ_ONLY,
        inputSchema: z.object({ id: z.string().min(1) }).shape,
      },
      async (args) =>
        this.guarded('ordo_task_get', (userId) =>
          this.v1Tasks.get(userId, args.id),
        ),
    );

    server.registerTool(
      'ordo_task_update',
      {
        title: 'Update task',
        description:
          'Update a task I own (title, description, priority, status, due date, planned date).',
        inputSchema: z.object({
          id: z.string().min(1),
          title: z.string().optional(),
          description: z.string().optional(),
          priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
          status: z
            .enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
            .optional(),
          dueDate: z
            .string()
            .optional()
            .describe('ISO date; empty string clears it'),
          doDate: z
            .string()
            .optional()
            .describe('ISO date; empty string clears it'),
        }).shape,
      },
      async (args) =>
        this.guarded('ordo_task_update', (userId) =>
          this.v1Tasks.update(userId, args.id, {
            title: args.title,
            description: args.description,
            priority: args.priority,
            status: args.status,
            dueDate:
              args.dueDate === undefined
                ? undefined
                : args.dueDate === null || args.dueDate === ''
                  ? null
                  : new Date(args.dueDate),
            doDate:
              args.doDate === undefined
                ? undefined
                : args.doDate === null || args.doDate === ''
                  ? null
                  : new Date(args.doDate),
          }),
        ),
    );

    server.registerTool(
      'ordo_task_complete',
      {
        title: 'Complete task',
        description: 'Mark a task as completed.',
        inputSchema: z.object({ id: z.string().min(1) }).shape,
      },
      async (args) =>
        this.guarded('ordo_task_complete', (userId) =>
          this.tasksService.complete(args.id, userId),
        ),
    );

    server.registerTool(
      'ordo_task_delete',
      {
        title: 'Delete task',
        description:
          'Permanently delete a task I own. Prefer ordo_task_complete when the work is done.',
        ...DESTRUCTIVE,
        inputSchema: z.object({ id: z.string().min(1) }).shape,
      },
      async (args) =>
        this.guarded('ordo_task_delete', (userId) =>
          this.v1Tasks.remove(userId, args.id),
        ),
    );
  }

  private registerProjectTools(server: McpServer): void {
    server.registerTool(
      'ordo_project_list',
      {
        title: 'List projects',
        description:
          'List my projects with their workspace id and name (disambiguates same-named projects across workspaces).',
        ...READ_ONLY,
        inputSchema: z.object({
          workspaceId: z.string().optional(),
        }).shape,
      },
      async (args) =>
        this.guarded('ordo_project_list', async (userId) => {
          const [projects, workspaces] = await Promise.all([
            this.v1Projects.list(userId),
            this.workspacesService.findAll(userId),
          ]);
          const workspaceNames = new Map(
            workspaces.map((workspace) => [
              String(workspace.id),
              workspace.name,
            ]),
          );
          const enriched = projects
            .filter(
              (project) =>
                !args.workspaceId || project.workspaceId === args.workspaceId,
            )
            .map((project) => ({
              ...project,
              workspaceName: workspaceNames.get(project.workspaceId) ?? null,
            }));
          return { projects: enriched, totalCount: enriched.length };
        }),
    );

    server.registerTool(
      'ordo_project_create',
      {
        title: 'Create project',
        description: 'Create a project in one of my workspaces.',
        inputSchema: z.object({
          name: z.string().min(1),
          workspaceId: z.string().min(1),
          description: z.string().optional(),
        }).shape,
      },
      async (args) =>
        this.guarded('ordo_project_create', (userId) =>
          this.v1Projects.create(userId, {
            name: args.name,
            workspaceId: args.workspaceId,
            description: args.description,
          }),
        ),
    );

    server.registerTool(
      'ordo_project_get',
      {
        title: 'Get project',
        description: 'Get a project by id.',
        ...READ_ONLY,
        inputSchema: z.object({ id: z.string().min(1) }).shape,
      },
      async (args) =>
        this.guarded('ordo_project_get', (userId) =>
          this.v1Projects.get(userId, args.id),
        ),
    );

    server.registerTool(
      'ordo_project_update',
      {
        title: 'Update project',
        description: 'Update a project I own.',
        inputSchema: z.object({
          id: z.string().min(1),
          name: z.string().optional(),
          description: z.string().optional(),
        }).shape,
      },
      async (args) =>
        this.guarded('ordo_project_update', (userId) =>
          this.v1Projects.update(userId, args.id, {
            name: args.name,
            description: args.description,
          }),
        ),
    );
  }

  private registerCommentTools(server: McpServer): void {
    server.registerTool(
      'ordo_comment_list',
      {
        title: 'List comments',
        description: 'List the comments of a task I can access, oldest first.',
        ...READ_ONLY,
        inputSchema: z.object({ taskId: z.string().min(1) }).shape,
      },
      async (args) =>
        this.guarded('ordo_comment_list', async (userId) => {
          // CommentsService predates user checks; the task gate is here.
          await this.v1Tasks.get(userId, args.taskId);
          return { comments: await this.v1Comments.listByTask(args.taskId) };
        }),
    );

    server.registerTool(
      'ordo_comment_add',
      {
        title: 'Add comment',
        description: 'Add a comment to a task as the token owner.',
        inputSchema: z.object({
          taskId: z.string().min(1),
          content: z.string().min(1),
        }).shape,
      },
      async (args) =>
        this.guarded('ordo_comment_add', (userId) =>
          this.v1Comments.create(userId, {
            taskId: args.taskId,
            content: args.content,
          }),
        ),
    );
  }

  private registerHabitTools(server: McpServer): void {
    server.registerTool(
      'ordo_habit_today',
      {
        title: "Today's habits",
        description: 'List habits scheduled for today with completion status.',
        ...READ_ONLY,
        inputSchema: z.object({}).shape,
      },
      async () =>
        this.guarded('ordo_habit_today', (userId) =>
          this.habitsService.findForToday(userId),
        ),
    );

    server.registerTool(
      'ordo_habit_list',
      {
        title: 'List habits',
        description:
          'List all my habits with schedule and active/paused state.',
        ...READ_ONLY,
        inputSchema: z.object({
          includeArchived: z.boolean().optional(),
        }).shape,
      },
      async (args) =>
        this.guarded('ordo_habit_list', (userId) =>
          this.habitsService.findAll(userId, args.includeArchived ?? false),
        ),
    );

    server.registerTool(
      'ordo_habit_create',
      {
        title: 'Create habit',
        description: 'Create a habit for the token owner.',
        inputSchema: z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          frequency: z
            .enum(['DAILY', 'WEEKLY', 'SPECIFIC_DAYS', 'MONTHLY'])
            .optional(),
          targetDaysOfWeek: z
            .array(z.number().int().min(0).max(6))
            .optional()
            .describe('0=Sunday … 6=Saturday, for SPECIFIC_DAYS'),
          targetCount: z.number().int().min(1).optional(),
          timeOfDay: z
            .enum(['MORNING', 'AFTERNOON', 'EVENING', 'ANYTIME'])
            .optional(),
          preferredTime: z.string().optional().describe('HH:mm'),
        }).shape,
      },
      async (args) =>
        this.guarded('ordo_habit_create', (userId) =>
          this.habitsService.create(
            {
              name: args.name,
              description: args.description,
              frequency: args.frequency,
              targetDaysOfWeek: args.targetDaysOfWeek,
              targetCount: args.targetCount,
              timeOfDay: args.timeOfDay,
              preferredTime: args.preferredTime,
            },
            userId,
          ),
        ),
    );

    server.registerTool(
      'ordo_habit_complete',
      {
        title: 'Complete habit',
        description: 'Mark a habit complete for today.',
        inputSchema: z.object({
          id: z.string().min(1),
          note: z.string().optional(),
        }).shape,
      },
      async (args) =>
        this.guarded('ordo_habit_complete', (userId) =>
          this.habitsService.complete(args.id, { note: args.note }, userId),
        ),
    );
  }

  private registerObjectiveTools(server: McpServer): void {
    server.registerTool(
      'ordo_objective_progress',
      {
        title: 'Objective progress',
        description: 'Current OKR period summary: totals, completed, at risk.',
        ...READ_ONLY,
        inputSchema: z.object({}).shape,
      },
      async () =>
        this.guarded('ordo_objective_progress', (userId) =>
          this.objectivesService.getDashboardSummary(userId),
        ),
    );
  }

  private registerUserTools(server: McpServer): void {
    server.registerTool(
      'ordo_me',
      {
        title: 'Who am I',
        description: 'Identity of the token owner.',
        ...READ_ONLY,
        inputSchema: z.object({}).shape,
      },
      async () =>
        this.guarded('ordo_me', async (userId) => {
          const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, username: true, name: true },
          });
          if (!user) {
            throw new Error('Token owner not found');
          }
          return user;
        }),
    );
  }

  // ODD 005 S6 (T5): day-plan tools for remote agents (ODD 001).
  private registerDayPlanTools(server: McpServer): void {
    server.registerTool(
      'ordo_day_plan',
      {
        title: "Today's plan",
        // NOT read-only: getDayPlan persists a proposal row when none is
        // pending, so clients must treat it as potentially state-changing.
        description:
          'Get my day plan: proposed time blocks, frozen tasks, pending changes and risk alerts. May generate a new proposal.',
        inputSchema: z.object({}).shape,
      },
      async () =>
        this.guarded('ordo_day_plan', async (userId) => {
          const [plan, risks] = await Promise.all([
            this.dayPlanService.getDayPlan(userId),
            this.riskAlerts.assessForUser(userId),
          ]);
          return { ...plan, risks };
        }),
    );

    server.registerTool(
      'ordo_day_plan_apply',
      {
        title: 'Apply day plan',
        description:
          'Apply a proposed day plan onto my tasks (doDate + time blocks).',
        inputSchema: z.object({
          proposalId: z.string().min(1),
        }).shape,
      },
      async (args) =>
        this.guarded('ordo_day_plan_apply', (userId) =>
          this.dayPlanService.apply(userId, args.proposalId),
        ),
    );
  }

  /**
   * Time-tracking tools. Start auto-switches any previous active session
   * (the core use case marks it interrupted); the taskId pre-check is
   * mandatory because StartTimerUseCase trusts its caller and would
   * otherwise flip a foreign task to IN_PROGRESS.
   */
  private registerTimerTools(server: McpServer): void {
    server.registerTool(
      'ordo_timer_active',
      {
        title: 'Active timer',
        description:
          'Get the currently running timer session (task, type, elapsed seconds, paused) or confirm none is running.',
        ...READ_ONLY,
        inputSchema: z.object({}).shape,
      },
      async () =>
        this.guarded('ordo_timer_active', async (userId) => {
          const session = await this.timersService.getActive(userId);
          if (!session) {
            return { active: false };
          }
          let taskTitle: string | null = null;
          if (session.taskId) {
            try {
              const task = await this.v1Tasks.get(userId, session.taskId);
              taskTitle = task.title;
            } catch {
              taskTitle = null;
            }
          }
          return { active: true, taskTitle, ...session };
        }),
    );

    server.registerTool(
      'ordo_timer_start',
      {
        title: 'Start timer',
        description:
          'Start tracking time for a task (or free work without taskId). Stops any previous active session as interrupted.',
        inputSchema: z.object({
          taskId: z
            .string()
            .optional()
            .describe('Task to track; must be one the caller can access'),
          type: z
            .enum(['WORK', 'SHORT_BREAK', 'LONG_BREAK', 'CONTINUOUS'])
            .optional(),
        }).shape,
      },
      async (args) =>
        this.guarded('ordo_timer_start', async (userId) => {
          if (args.taskId) {
            // Ownership gate: the underlying use case would accept any
            // task id and flip it to IN_PROGRESS.
            await this.v1Tasks.get(userId, args.taskId);
          }
          return this.timersService.start(
            {
              taskId: args.taskId,
              type: args.type,
            },
            userId,
          );
        }),
    );

    server.registerTool(
      'ordo_timer_stop',
      {
        title: 'Stop timer',
        description:
          'Stop the active timer session and record it in the history.',
        inputSchema: z.object({
          wasCompleted: z
            .boolean()
            .optional()
            .describe('Whether the tracked work finished the task'),
        }).shape,
      },
      async (args) =>
        this.guarded('ordo_timer_stop', async (userId) => {
          const session = await this.timersService.stop(
            { wasCompleted: args.wasCompleted },
            userId,
          );
          // The service returns a phantom {id: ''} when nothing was
          // running; make that state explicit for the agent instead.
          if (session.id === '') {
            return { stopped: false };
          }
          return session;
        }),
    );

    server.registerTool(
      'ordo_timer_pause',
      {
        title: 'Pause timer',
        description: 'Pause the active timer session.',
        inputSchema: z.object({}).shape,
      },
      async () =>
        this.guarded('ordo_timer_pause', (userId) =>
          this.timersService.pause({}, userId),
        ),
    );

    server.registerTool(
      'ordo_timer_resume',
      {
        title: 'Resume timer',
        description: 'Resume a paused timer session.',
        inputSchema: z.object({}).shape,
      },
      async () =>
        this.guarded('ordo_timer_resume', (userId) =>
          this.timersService.resume({ pauseStartedAt: new Date() }, userId),
        ),
    );
  }

  /**
   * Sticky notes. The service is workspace-scoped and takes the caller's
   * userId for authorship; the catalog adds the membership gate because
   * the note repository itself trusts its caller.
   */
  private registerNoteTools(server: McpServer): void {
    server.registerTool(
      'ordo_note_list',
      {
        title: 'List notes',
        description: 'Search and list the sticky notes of a workspace.',
        ...READ_ONLY,
        inputSchema: z.object({
          workspaceId: z.string().min(1),
          search: z.string().optional().describe('Full-text search in content'),
          limit: z.number().int().min(1).max(100).optional(),
        }).shape,
      },
      async (args) =>
        this.guarded('ordo_note_list', async (userId) => {
          await this.assertWorkspaceMember(userId, args.workspaceId);
          return this.notesService.findAll(args.workspaceId, userId, {
            workspaceId: args.workspaceId,
            search: args.search,
            limit: args.limit,
          });
        }),
    );

    server.registerTool(
      'ordo_note_get',
      {
        title: 'Get note',
        description: 'Get a note by id (author or workspace member).',
        ...READ_ONLY,
        inputSchema: z.object({ id: z.string().min(1) }).shape,
      },
      async (args) =>
        this.guarded('ordo_note_get', (userId) =>
          this.notesService.findOne(args.id, userId),
        ),
    );

    server.registerTool(
      'ordo_note_create',
      {
        title: 'Create note',
        description: 'Create a sticky note in a workspace I belong to.',
        inputSchema: z.object({
          workspaceId: z.string().min(1),
          content: z.string().min(1),
          color: z.string().optional(),
        }).shape,
      },
      async (args) =>
        this.guarded('ordo_note_create', async (userId) => {
          await this.assertWorkspaceMember(userId, args.workspaceId);
          return this.notesService.create(
            {
              workspaceId: args.workspaceId,
              content: args.content,
              color: args.color,
            },
            userId,
          );
        }),
    );
  }

  /**
   * Tags. TagsService takes no userId anywhere, so every tool gates
   * here: workspace tools via membership, task tools via task access,
   * and the tag itself must live in a workspace the caller belongs to.
   */
  private registerTagTools(server: McpServer): void {
    server.registerTool(
      'ordo_tag_list',
      {
        title: 'List tags',
        description: 'List the tags of a workspace I belong to.',
        ...READ_ONLY,
        inputSchema: z.object({ workspaceId: z.string().min(1) }).shape,
      },
      async (args) =>
        this.guarded('ordo_tag_list', async (userId) => {
          await this.assertWorkspaceMember(userId, args.workspaceId);
          return { tags: await this.tagsService.findAll(args.workspaceId) };
        }),
    );

    server.registerTool(
      'ordo_task_tags',
      {
        title: 'Task tags',
        description: 'List the tags currently attached to a task.',
        ...READ_ONLY,
        inputSchema: z.object({ taskId: z.string().min(1) }).shape,
      },
      async (args) =>
        this.guarded('ordo_task_tags', async (userId) => {
          await this.v1Tasks.get(userId, args.taskId);
          return { tags: await this.tagsService.findByTask(args.taskId) };
        }),
    );

    server.registerTool(
      'ordo_tag_add_to_task',
      {
        title: 'Tag task',
        description: 'Attach an existing tag to a task I can access.',
        inputSchema: z.object({
          taskId: z.string().min(1),
          tagId: z.string().min(1),
        }).shape,
      },
      async (args) =>
        this.guarded('ordo_tag_add_to_task', async (userId) => {
          await this.v1Tasks.get(userId, args.taskId);
          const tag = await this.tagsService.findOne(args.tagId);
          if (!tag) {
            throw new ForbiddenException('Tag not found');
          }
          await this.assertWorkspaceMember(userId, tag.workspaceId);
          return this.tagsService.assignToTask(args.tagId, args.taskId);
        }),
    );
  }

  private registerMeetingTools(server: McpServer): void {
    server.registerTool(
      'ordo_meeting_list',
      {
        title: 'List meetings',
        description:
          'List my recent meetings, newest first (summary, transcript availability, linked project).',
        ...READ_ONLY,
        inputSchema: z.object({
          projectId: z.string().optional(),
          limit: z.number().int().min(1).max(50).optional(),
        }).shape,
      },
      async (args) =>
        this.guarded('ordo_meeting_list', (userId) =>
          this.meetingsService.getMeetings(userId, {
            projectId: args.projectId,
            limit: args.limit ?? 10,
          }),
        ),
    );
  }
}
