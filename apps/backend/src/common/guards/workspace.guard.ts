import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { MemberRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import {
  WORKSPACE_CONTEXT_KEY,
  WorkspaceContextConfig,
} from '../decorators/workspace-context.decorator';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  private readonly logger = new Logger(WorkspaceGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn('WorkspaceGuard: No user in request');
      return false;
    }

    // 1. Extract workspace context configuration
    const workspaceConfig = this.reflector.get<WorkspaceContextConfig>(
      WORKSPACE_CONTEXT_KEY,
      context.getHandler(),
    );

    // If no workspace context is configured, allow (guard not applicable)
    if (!workspaceConfig) {
      this.logger.debug('WorkspaceGuard: No workspace context configured');
      return true;
    }

    // 2. Extract workspace ID based on configuration
    const workspaceId = await this.extractWorkspaceId(request, workspaceConfig);

    if (!workspaceId) {
      throw new BadRequestException(
        'Workspace context could not be determined',
      );
    }

    // 3. Check workspace membership
    let membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    });

    // 4. Auto-repair for legacy workspaces (owner without membership)
    if (!membership) {
      membership = await this.handleLegacyWorkspace(workspaceId, user.id);
    }

    if (!membership) {
      this.logger.warn(
        `WorkspaceGuard: User ${user.id} is not a member of workspace ${workspaceId}`,
      );
      throw new ForbiddenException('You are not a member of this workspace');
    }

    // 5. Check role permissions (if defined)
    const requiredRoles = this.reflector.getAllAndOverride<MemberRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles && !requiredRoles.includes(membership.role)) {
      this.logger.warn(
        `WorkspaceGuard: User ${user.id} has role ${membership.role} but needs one of: ${requiredRoles.join(', ')}`,
      );
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredRoles.join(', ')}`,
      );
    }

    // 6. Attach membership to request for easier access in controller
    request.workspaceMember = membership;
    request.workspaceId = workspaceId;

    this.logger.debug(
      `WorkspaceGuard: Access granted to user ${user.id} for workspace ${workspaceId}`,
    );

    return true;
  }

  /**
   * Extracts workspace ID based on context configuration
   */
  private async extractWorkspaceId(
    request: any,
    config: WorkspaceContextConfig,
  ): Promise<string | null> {
    const params = request.params || {};

    switch (config.type) {
      case 'direct': {
        // Workspace ID is directly in params
        const paramName = config.paramName || 'id';
        return params[paramName] || null;
      }

      case 'from-project': {
        // Need to lookup workspace from project
        const projectId = params[config.paramName || 'projectId'];
        if (!projectId) return null;

        const project = await this.prisma.project.findUnique({
          where: { id: projectId },
          select: { workspaceId: true },
        });

        return project?.workspaceId || null;
      }

      case 'from-task': {
        // Need to lookup workspace from task
        const taskId = params[config.paramName || 'taskId'];
        if (!taskId) return null;

        const task = await this.prisma.task.findUnique({
          where: { id: taskId },
          include: {
            project: {
              select: { workspaceId: true },
            },
          },
        });

        return task?.project?.workspaceId || null;
      }

      default:
        this.logger.error(
          `Unknown workspace context type: ${String(config.type)}`,
        );
        return null;
    }
  }

  /**
   * Handles legacy workspaces where owner is not in members table
   */
  private async handleLegacyWorkspace(
    workspaceId: string,
    userId: string,
  ): Promise<{
    id: string;
    userId: string;
    workspaceId: string;
    role: MemberRole;
    joinedAt: Date;
  } | null> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    if (workspace?.ownerId === userId) {
      this.logger.log(
        `WorkspaceGuard: Auto-repairing legacy workspace ${workspaceId} - adding owner as member`,
      );

      try {
        // Auto-repair: Add owner as a member
        return await this.prisma.workspaceMember.create({
          data: {
            workspaceId,
            userId,
            role: MemberRole.OWNER,
          },
        });
      } catch (error) {
        // If creation fails (e.g., race condition), try to fetch again
        this.logger.error(
          `WorkspaceGuard: Failed to auto-repair workspace ${workspaceId}`,
          error,
        );
        return await this.prisma.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId,
              userId,
            },
          },
        });
      }
    }

    return null;
  }
}
