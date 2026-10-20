import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { AuthAuditService } from '../../auth/auth-audit.service';
import { AuthEventType } from '../../auth/types/auth-event.types';
import { TasksService } from '../../tasks/tasks.service';
import { ProjectsService } from '../../projects/projects.service';
import type { CreateTaskDto } from '../../tasks/dto/create-task.dto';
import type { UpdateTaskDto } from '../../tasks/dto/update-task.dto';
import type { CreateProjectDto } from '../../projects/dto/create-project.dto';
import {
  planReason,
  planRequiresConfirmation,
  type AgentExecuteResult,
  type AgentPlan,
  type AgentPlanStep,
  type AgentToolCall,
  type AgentToolName,
} from './agent-tool.types';

/**
 * Audited agent tools (ODD 004 S3).
 *
 * - Domain services are resolved lazily via ModuleRef (Slack precedent:
 *   `slack-actions.service.ts` — getters with `moduleRef.get(X,
 *   { strict: false })`, never module imports). The class imports below are
 *   DI tokens only: those files never import back into `ai/tools`, so there
 *   is no ES cycle.
 * - Successful steps are audit-logged as AGENT_TOOL_CALL (MCP precedent:
 *   `mcp-catalog.service.ts` guarded() — success only, failures not logged).
 * - Authz is enforced here per tool because the domain services do not check
 *   project membership themselves (verified).
 *
 * GOLDEN MCP RULE: each tool has a human `description` and plain-JSON args
 * so the shape is future-exposable as an MCP tool. No MCP code here (S3
 * out-of-scope by design).
 *
 * MVP limits (documented, not bugs): single-id tools only (no bulk
 * update_task); update_task cannot reassign (no assigneeId).
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
const STATUSES = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;

type ToolHandler = (
  userId: string,
  args: Record<string, unknown>,
) => Promise<{ description: string; run: () => Promise<unknown> }>;

@Injectable()
export class AgentToolsService {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly prisma: PrismaService,
    private readonly audit: AuthAuditService,
  ) {}

  private get tasks(): TasksService {
    return this.moduleRef.get(TasksService, { strict: false });
  }

  private get projects(): ProjectsService {
    return this.moduleRef.get(ProjectsService, { strict: false });
  }

  /**
   * Validate every call (args + authz) and build a human-described plan.
   * Pure derivation of `requiresConfirmation` — see `planRequiresConfirmation`.
   */
  async propose(userId: string, calls: AgentToolCall[]): Promise<AgentPlan> {
    const handlers = await Promise.all(
      calls.map((call) => this.prepare(call.tool, userId, call.args)),
    );
    const steps: AgentPlanStep[] = calls.map((call, i) => ({
      tool: call.tool,
      args: call.args,
      description: handlers[i].description,
    }));
    return {
      planId: randomUUID(),
      steps,
      requiresConfirmation: planRequiresConfirmation(calls),
      reason: planReason(calls),
    };
  }

  /**
   * Execute a plan's calls in order. A plan that requires confirmation and
   * is not confirmed throws WITHOUT executing anything (the S3 contract).
   * Steps run sequentially in try/catch: failures are recorded and execution
   * CONTINUES. Only successful steps are audit-logged.
   */
  async execute(
    userId: string,
    plan: AgentPlan,
    confirmed: boolean,
  ): Promise<AgentExecuteResult> {
    if (plan.requiresConfirmation && !confirmed) {
      throw new ForbiddenException('Plan requires confirmation');
    }
    const executed: AgentExecuteResult['executed'] = [];
    for (const [index, step] of plan.steps.entries()) {
      try {
        const { run } = await this.prepare(step.tool, userId, step.args);
        const result = await run();
        await this.audit.logEvent({
          type: AuthEventType.AGENT_TOOL_CALL,
          userId,
          timestamp: new Date(),
          metadata: {
            tool: step.tool,
            planId: plan.planId,
            step: index,
            resultId: extractId(result),
          },
        });
        executed.push({
          step: index,
          tool: step.tool,
          ok: true,
          result,
        });
      } catch (error) {
        executed.push({
          step: index,
          tool: step.tool,
          ok: false,
          error: (error as Error).message,
        });
      }
    }
    return { planId: plan.planId, executed };
  }

  private async prepare(
    tool: AgentToolName,
    userId: string,
    args: Record<string, unknown>,
  ): Promise<{ description: string; run: () => Promise<unknown> }> {
    const handler: ToolHandler | undefined = {
      create_task: (u, a) => this.prepareCreateTask(u, a),
      update_task: (u, a) => this.prepareUpdateTask(u, a),
      complete_task: (u, a) => this.prepareCompleteTask(u, a),
      create_project: (u, a) => this.prepareCreateProject(u, a),
      schedule_block: (u, a) => this.prepareScheduleBlock(u, a),
    }[tool];
    if (!handler) {
      throw new BadRequestException(`Unknown tool: ${String(tool)}`);
    }
    return handler(userId, args ?? {});
  }

  private async prepareCreateTask(
    userId: string,
    args: Record<string, unknown>,
  ): Promise<{ description: string; run: () => Promise<unknown> }> {
    const title = reqString(args, 'title', 'create_task');
    const projectId = reqString(args, 'projectId', 'create_task');
    const description = optString(args, 'description');
    const dueDate = optDate(args, 'dueDate', 'create_task');
    const priority = optEnum(args, 'priority', PRIORITIES, 'create_task');

    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        isDeleted: false,
        workspace: {
          isDeleted: false,
          members: {
            some: {
              userId,
              role: { in: ['OWNER', 'ADMIN', 'MEMBER'] },
            },
          },
        },
      },
      select: { id: true, name: true },
    });
    if (!project) {
      throw new ForbiddenException('No access to project');
    }

    const dto = {
      title,
      projectId,
      ...(description !== undefined ? { description } : {}),
      ...(dueDate !== undefined ? { dueDate } : {}),
      ...(priority !== undefined ? { priority } : {}),
    } as CreateTaskDto;
    return {
      description: `Crear tarea '${title}' en proyecto ${project.name}`,
      run: () => this.tasks.create(dto, userId),
    };
  }

  private async prepareUpdateTask(
    userId: string,
    args: Record<string, unknown>,
  ): Promise<{ description: string; run: () => Promise<unknown> }> {
    const taskId = reqString(args, 'taskId', 'update_task');
    const task = await this.requireVisibleTask(userId, taskId);

    const patch: UpdateTaskDto = {};
    const title = optString(args, 'title');
    if (title !== undefined) patch.title = title;
    const description = optString(args, 'description');
    if (description !== undefined) patch.description = description;
    if ('dueDate' in args) {
      const raw = args.dueDate;
      patch.dueDate =
        raw === null ? null : optDate(args, 'dueDate', 'update_task');
    }
    const priority = optEnum(args, 'priority', PRIORITIES, 'update_task');
    if (priority !== undefined) patch.priority = priority;
    const status = optEnum(args, 'status', STATUSES, 'update_task');
    if (status !== undefined) patch.status = status;

    const what =
      status === 'CANCELLED'
        ? `Cancelar tarea '${task.title}'`
        : `Actualizar tarea '${task.title}'`;
    return {
      description: what,
      run: () => this.tasks.update(taskId, patch, userId),
    };
  }

  private async prepareCompleteTask(
    userId: string,
    args: Record<string, unknown>,
  ): Promise<{ description: string; run: () => Promise<unknown> }> {
    const taskId = reqString(args, 'taskId', 'complete_task');
    const task = await this.requireVisibleTask(userId, taskId);
    // CompleteTaskUseCase rejects callers who are neither owner nor assignee;
    // fail here at propose time so propose/execute never disagree.
    const ownership = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        OR: [{ ownerId: userId }, { assigneeId: userId }],
      },
      select: { id: true },
    });
    if (!ownership) {
      throw new ForbiddenException(
        'Only the task owner or assignee can complete it',
      );
    }
    return {
      description: `Completar tarea '${task.title}'`,
      run: () => this.tasks.complete(taskId, userId),
    };
  }

  private async prepareCreateProject(
    userId: string,
    args: Record<string, unknown>,
  ): Promise<{ description: string; run: () => Promise<unknown> }> {
    const name = reqString(args, 'name', 'create_project');
    const workspaceId = reqString(args, 'workspaceId', 'create_project');
    const description = optString(args, 'description');

    const membership = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (
      !membership ||
      !['OWNER', 'ADMIN', 'MEMBER'].includes(membership.role)
    ) {
      throw new ForbiddenException('No access to workspace');
    }

    // Best-effort workspace name for the human description.
    const workspace = await this.prisma.workspace
      .findFirst({
        where: { id: workspaceId },
        select: { name: true },
      })
      .catch(() => null);
    const where = workspace?.name
      ? `en workspace ${workspace.name}`
      : `en workspace ${workspaceId}`;

    const dto = {
      name,
      workspaceId,
      ...(description !== undefined ? { description } : {}),
    } as CreateProjectDto;
    return {
      description: `Crear proyecto '${name}' ${where}`,
      run: () => this.projects.create(dto),
    };
  }

  private async prepareScheduleBlock(
    userId: string,
    args: Record<string, unknown>,
  ): Promise<{ description: string; run: () => Promise<unknown> }> {
    const taskId = reqString(args, 'taskId', 'schedule_block');
    const date = reqString(args, 'date', 'schedule_block');
    const startTime = reqString(args, 'startTime', 'schedule_block');
    const endTime = optString(args, 'endTime');
    if (!DATE_RE.test(date)) {
      throw new BadRequestException('schedule_block.date must be YYYY-MM-DD');
    }
    if (!TIME_RE.test(startTime)) {
      throw new BadRequestException('schedule_block.startTime must be HH:mm');
    }
    if (endTime !== undefined && !TIME_RE.test(endTime)) {
      throw new BadRequestException('schedule_block.endTime must be HH:mm');
    }

    const task = await this.requireVisibleTask(userId, taskId);
    const patch: UpdateTaskDto = {
      scheduledDate: new Date(date),
      scheduledTime: startTime,
      ...(endTime !== undefined ? { scheduledEndTime: endTime } : {}),
      isTimeBlocked: true,
    };
    const when =
      endTime !== undefined
        ? `${date} ${startTime}-${endTime}`
        : `${date} ${startTime}`;
    return {
      description: `Agendar bloque para '${task.title}' el ${when}`,
      run: () => this.tasks.update(taskId, patch, userId),
    };
  }

  /**
   * Canonical task visibility (same OR as retrieval.service taskVisibility):
   * owned, assigned, or in a non-deleted workspace the user belongs to.
   * Mutations additionally require a writer role (OWNER/ADMIN/MEMBER),
   * mirroring the REST @Roles guards — VIEWERs stay read-only.
   */
  private async requireVisibleTask(
    userId: string,
    taskId: string,
  ): Promise<{ id: string; title: string }> {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        isDeleted: false,
        OR: [
          { ownerId: userId },
          { assigneeId: userId },
          {
            project: {
              workspace: {
                members: {
                  some: {
                    userId,
                    role: { in: ['OWNER', 'ADMIN', 'MEMBER'] },
                    workspace: { isDeleted: false },
                  },
                },
              },
            },
          },
        ],
      },
      select: { id: true, title: true },
    });
    if (!task) {
      throw new ForbiddenException('No access to task');
    }
    return task;
  }
}

function extractId(result: unknown): string | undefined {
  if (typeof result === 'object' && result !== null && 'id' in result) {
    const id = (result as { id: unknown }).id;
    return typeof id === 'string' ? id : undefined;
  }
  return undefined;
}

function reqString(
  args: Record<string, unknown>,
  key: string,
  tool: string,
): string {
  const value = args[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new BadRequestException(`${tool}.${key} must be a non-empty string`);
  }
  return value;
}

function optString(
  args: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = args[key];
  if (value === undefined) return undefined;
  if (typeof value !== 'string') {
    throw new BadRequestException(`${key} must be a string`);
  }
  return value;
}

function optDate(
  args: Record<string, unknown>,
  key: string,
  tool: string,
): Date | undefined {
  const value = args[key];
  if (value === undefined) return undefined;
  if (typeof value !== 'string') {
    throw new BadRequestException(`${tool}.${key} must be an ISO date string`);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(`${tool}.${key} must be an ISO date string`);
  }
  return date;
}

function optEnum<T extends string>(
  args: Record<string, unknown>,
  key: string,
  allowed: readonly T[],
  tool: string,
): T | undefined {
  const value = args[key];
  if (value === undefined) return undefined;
  if (
    typeof value !== 'string' ||
    !(allowed as readonly string[]).includes(value)
  ) {
    throw new BadRequestException(
      `${tool}.${key} must be one of: ${allowed.join(', ')}`,
    );
  }
  return value as T;
}
