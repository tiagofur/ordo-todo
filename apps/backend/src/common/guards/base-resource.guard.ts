import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { MemberRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class BaseResourceGuard implements CanActivate {
  constructor(
    protected reflector: Reflector,
    protected prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    const workspaceId = await this.getWorkspaceId(request);

    if (!workspaceId) {
      // Ideally we should default to false for security, but some endpoints might not have workspace context.
      // However, if this Guard is applied, it implies workspace context is expected.
      // For 'Create' operations, subclasses must extract workspaceId from body.
      // For 'List' operations, subclasses must extract from query.
      // If extraction fails, it usually means bad request or unauthorized access attempt.
      // Let's make it configurable or default to FALSE if the guard is meant to secure resources.

      // NOTE: If getWorkspaceId returns null, it means the specific guard (ProjectGuard/TaskGuard)
      // failed to find the resource or the ID.
      return false;
    }

    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You are not a member of the workspace for this resource',
      );
    }

    const requiredRoles = this.reflector.getAllAndOverride<MemberRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles && !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  protected async getWorkspaceId(request: any): Promise<string | null> {
    return null;
  }
}
