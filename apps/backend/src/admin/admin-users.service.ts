import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type UserRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
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
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_PRO_DAYS = 3650;

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
    private readonly prisma: PrismaService,
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

    // Idempotent: re-blocking does not churn blockedAt nor duplicate the audit.
    if (user.status === BLOCKED) {
      return { id: user.id, status: BLOCKED };
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

    // Idempotent: re-unblocking an active account is a no-op (no audit churn).
    if (user.status !== BLOCKED) {
      return { id: user.id, status: ACTIVE };
    }

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

  /**
   * Grants Pro without Stripe (ODD 019 S4): flips the orphan Subscription row
   * that billing (#240) will own later. `days: null` = indefinite.
   */
  async grantPro(
    userId: string,
    days: number | null,
    admin: AdminIdentity,
    requestContext?: RequestContext,
  ): Promise<{ id: string; plan: 'PRO'; expiresAt: Date | null }> {
    const user = await this.requireUser(userId);

    if (
      days != null &&
      (!Number.isFinite(days) || days <= 0 || days > MAX_PRO_DAYS)
    ) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'INVALID_PRO_DAYS',
        message: `days must be a positive number up to ${MAX_PRO_DAYS}, or null for indefinite`,
      });
    }

    const expiresAt =
      days == null ? null : new Date(Date.now() + days * DAY_MS);

    await this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan: 'PRO',
        status: 'ACTIVE',
        stripeCurrentPeriodEnd: expiresAt,
      },
      update: {
        plan: 'PRO',
        status: 'ACTIVE',
        stripeCurrentPeriodEnd: expiresAt,
      },
    });

    await this.authAuditService.logEvent({
      type: AuthEventType.ADMIN_PRO_GRANTED,
      userId: user.id,
      email: user.email,
      ip: requestContext?.ip,
      userAgent: requestContext?.userAgent,
      timestamp: new Date(),
      metadata: { adminEmail: admin.email, days },
    });

    return { id: user.id, plan: 'PRO', expiresAt };
  }

  /** Revokes a gifted Pro: back to FREE (row kept — Stripe fields are null anyway). */
  async revokePro(
    userId: string,
    admin: AdminIdentity,
    requestContext?: RequestContext,
  ): Promise<{ id: string; plan: 'FREE' }> {
    const user = await this.requireUser(userId);

    await this.prisma.subscription.upsert({
      where: { userId },
      create: { userId, plan: 'FREE', status: 'ACTIVE' },
      update: { plan: 'FREE' },
    });

    await this.authAuditService.logEvent({
      type: AuthEventType.ADMIN_PRO_REVOKED,
      userId: user.id,
      email: user.email,
      ip: requestContext?.ip,
      userAgent: requestContext?.userAgent,
      timestamp: new Date(),
      metadata: { adminEmail: admin.email },
    });

    return { id: user.id, plan: 'FREE' };
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
