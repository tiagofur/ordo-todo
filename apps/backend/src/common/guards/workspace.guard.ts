import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { MemberRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    // 1. Identify Workspace Context
    // We look for workspaceId in params, query, or body.
    // Or we infer it from other resources (like projectId or taskId).
    const workspaceId = await this.extractWorkspaceId(request);

    if (!workspaceId) {
      // If endpoint doesn't relate to a workspace, we might skip this guard or
      // assume it's a general endpoint. However, if this guard is applied,
      // we usually expect a workspace context.
      // For list endpoints that return "all workspaces", we shouldn't use this guard.
      return true;
    }

    // 2. Check Membership
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    // 3. Check Role Permissions (if defined)
    const requiredRoles = this.reflector.getAllAndOverride<MemberRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles && !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredRoles.join(', ')}`,
      );
    }

    // Attach membership to request for easier access in controller
    request.workspaceMember = membership;
    return true;
  }

  private async extractWorkspaceId(request: any): Promise<string | null> {
    const params = request.params || {};
    const query = request.query || {};
    const body = request.body || {};

    // Direct Workspace ID
    if (params.workspaceId) return params.workspaceId;
    if (query.workspaceId) return query.workspaceId;
    if (body.workspaceId) return body.workspaceId;

    // Sometimes it's passed as 'id' in WorkspacesController
    // We need to be careful not to mistake a taskId for a workspaceId.
    // This logic depends on where the guard is used.
    // Strategy: We will create specialized Guards if needed, or rely on naming conventions.

    // Ideally, we should fetch the resource to find the workspace ID if it's not direct.
    // But doing DB calls here for every resource type (Project, Task) makes this guard complex.
    // Better approach:
    // - WorkspaceGuard: expects 'workspaceId' in param/query OR 'id' if the controller is WorkspacesController.
    // - ProjectGuard: extends WorkspaceGuard or uses it, extracts workspaceId from Project.
    // - TaskGuard: extracts workspaceId from Task.

    // For now, let's keep it simple and focus on explicit 'workspaceId' or 'id' if route is /workspaces/:id
    if (request.route.path.includes('/workspaces/:id')) {
      return params.id;
    }

    return null;
  }
}
