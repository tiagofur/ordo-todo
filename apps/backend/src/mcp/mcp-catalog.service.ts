import {
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
    'ordo_project_create',
    'ordo_project_update',
    'ordo_comment_add',
    'ordo_habit_complete',
    'ordo_day_plan_apply',
  ]);

  constructor(
    private readonly protocol: McpProtocolService,
    private readonly v1Tasks: V1TasksService,
    private readonly v1Projects: V1ProjectsService,
    private readonly v1Comments: V1CommentsService,
    private readonly tasksService: TasksService,
    private readonly dayPlanService: DayPlanService,
    // ODD 005 S6+T4b: risks ride along with the plan. No cycle: Scheduling
    // flows to McpModule via TasksModule (Tasks never imports Mcp).
    private readonly riskAlerts: RiskAlertService,
    private readonly searchService: SemanticSearchService,
    private readonly habitsService: HabitsService,
    private readonly objectivesService: ObjectivesService,
    private readonly prisma: PrismaService,
    @Optional()
    @Inject(AuthAuditService)
    private readonly audit?: AuthAuditService,
  ) {}

  onModuleInit(): void {
    const server = this.protocol.getServer();
    this.registerSearchTools(server);
    this.registerTaskTools(server);
    this.registerProjectTools(server);
    this.registerCommentTools(server);
    this.registerHabitTools(server);
    this.registerObjectiveTools(server);
    this.registerUserTools(server);
    this.registerDayPlanTools(server);
    this.logger.log('MCP catalog registered (17 domain tools)');
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

  private registerSearchTools(server: McpServer): void {
    server.registerTool(
      'ordo_search',
      {
        title: 'Search Ordo',
        description:
          'Semantic search across tasks, projects and habits. Returns matching items with titles and ids.',
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

  private registerTaskTools(server: McpServer): void {
    server.registerTool(
      'ordo_task_list',
      {
        title: 'List tasks',
        description: 'List my tasks, optionally filtered by project.',
        inputSchema: z.object({
          projectId: z.string().optional(),
        }).shape,
      },
      async (args) =>
        this.guarded('ordo_task_list', (userId) =>
          this.v1Tasks.list(userId, {
            projectId: args.projectId,
          }),
        ),
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
          } as never),
        ),
    );

    server.registerTool(
      'ordo_task_get',
      {
        title: 'Get task',
        description: 'Get a task by id.',
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
          'Update a task I own (title, description, priority, dates).',
        inputSchema: z.object({
          id: z.string().min(1),
          title: z.string().optional(),
          description: z.string().optional(),
          priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
        }).shape,
      },
      async (args) =>
        this.guarded('ordo_task_update', (userId) =>
          this.v1Tasks.update(userId, args.id, {
            title: args.title,
            description: args.description,
            priority: args.priority,
          } as never),
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
  }

  private registerProjectTools(server: McpServer): void {
    server.registerTool(
      'ordo_project_list',
      {
        title: 'List projects',
        description: 'List my projects.',
        inputSchema: z.object({}).shape,
      },
      async () =>
        this.guarded('ordo_project_list', (userId) =>
          this.v1Projects.list(userId),
        ),
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
          } as never),
        ),
    );

    server.registerTool(
      'ordo_project_get',
      {
        title: 'Get project',
        description: 'Get a project by id.',
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
          } as never),
        ),
    );
  }

  private registerCommentTools(server: McpServer): void {
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
          } as never),
        ),
    );
  }

  private registerHabitTools(server: McpServer): void {
    server.registerTool(
      'ordo_habit_today',
      {
        title: "Today's habits",
        description: 'List habits scheduled for today with completion status.',
        inputSchema: z.object({}).shape,
      },
      async () =>
        this.guarded('ordo_habit_today', (userId) =>
          this.habitsService.findForToday(userId),
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
        description:
          'Get my day plan: proposed time blocks, frozen tasks, pending changes and risk alerts.',
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
}
