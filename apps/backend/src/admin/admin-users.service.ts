import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type UserRepository } from '@ordo-todo/core';
import { AuthAuditService } from '../auth/auth-audit.service';
import { AuthEventType } from '../auth/types/auth-event.types';

export interface AdminIdentity {
  id: string;
  email: string;
}

interface RequestContext {
  ip?: string;
  userAgent?: string;
}

const BLOCKED = 'BLOCKED' as const;
const ACTIVE = 'ACTIVE' as const;

/**
 * Platform user lifecycle (ODD 019 S3). Blocking flips `User.status`; the JWT
 * strategy re-validates the account on every request, so the block takes
 * effect on the victim's very next call without session bookkeeping.
 */
@Injectable()
export class AdminUsersService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly authAuditService: AuthAuditService,
  ) {}

  async blockUser(
    userId: string,
    admin: AdminIdentity,
    requestContext?: RequestContext,
  ): Promise<{ id: string; status: typeof BLOCKED }> {
    const user = await this.requireUser(userId);
    if (user.id === admin.id) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'ADMIN_SELF_BLOCK',
        message: 'You cannot block your own account',
      });
    }

    await this.userRepository.updateProps(user, {
      status: BLOCKED,
      blockedAt: new Date(),
    });

    await this.authAuditService.logEvent({
      type: AuthEventType.ADMIN_USER_BLOCKED,
      userId: user.id,
      email: user.email,
      ip: requestContext?.ip,
      userAgent: requestContext?.userAgent,
      timestamp: new Date(),
      metadata: { adminEmail: admin.email },
    });

    return { id: user.id, status: BLOCKED };
  }

  async unblockUser(
    userId: string,
    admin: AdminIdentity,
    requestContext?: RequestContext,
  ): Promise<{ id: string; status: typeof ACTIVE }> {
    const user = await this.requireUser(userId);

    await this.userRepository.updateProps(user, {
      status: ACTIVE,
      blockedAt: null,
    });

    await this.authAuditService.logEvent({
      type: AuthEventType.ADMIN_USER_UNBLOCKED,
      userId: user.id,
      email: user.email,
      ip: requestContext?.ip,
      userAgent: requestContext?.userAgent,
      timestamp: new Date(),
      metadata: { adminEmail: admin.email },
    });

    return { id: user.id, status: ACTIVE };
  }

  private async requireUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException({
        statusCode: 404,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }
    return user;
  }
}
