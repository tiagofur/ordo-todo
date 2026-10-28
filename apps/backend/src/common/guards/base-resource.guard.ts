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
      // Subclasses may authorize resources without workspace context (e.g. a
      // task express without project, ODD 021) by overriding the hook below.
      return this.authorizeWithoutWorkspace(request, user);
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

  /**
   * Fallback when the subclass cannot resolve a workspace for the request.
   * Default deny preserves the historical behavior for every subclass;
   * overrides must be strict (e.g. resource owner only).
   */
  protected async authorizeWithoutWorkspace(
    _request: any,
    _user: { id: string },
  ): Promise<boolean> {
    return false;
  }

  protected async getWorkspaceId(request: any): Promise<string | null> {
    return null;
  }
}
