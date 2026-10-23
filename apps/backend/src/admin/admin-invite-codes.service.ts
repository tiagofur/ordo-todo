import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  CreateInviteCodeUseCase,
  DeactivateInviteCodeUseCase,
  type InviteCodeRepository,
} from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import { AuthAuditService } from '../auth/auth-audit.service';
import { AuthEventType } from '../auth/types/auth-event.types';
import type { AdminIdentity } from './admin-users.service';

interface RequestContext {
  ip?: string;
  userAgent?: string;
}

export interface CreateInviteCodeInput {
  label?: string;
  maxUses?: number;
  expiresAt?: string;
}

/** Admin lifecycle for platform invite codes (ODD 019 S4). */
@Injectable()
export class AdminInviteCodesService {
  constructor(
    @Inject('InviteCodeRepository')
    private readonly inviteCodeRepository: InviteCodeRepository,
    private readonly prisma: PrismaService,
    private readonly authAuditService: AuthAuditService,
  ) {}

  async create(
    input: CreateInviteCodeInput,
    admin: AdminIdentity,
    requestContext?: RequestContext,
  ) {
    const invite = await new CreateInviteCodeUseCase(
      this.inviteCodeRepository,
    ).execute({
      label: input.label,
      maxUses: input.maxUses,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      createdById: admin.id,
    });

    await this.authAuditService.logEvent({
      type: AuthEventType.INVITE_CODE_CREATED,
      userId: admin.id,
      email: admin.email,
      ip: requestContext?.ip,
      userAgent: requestContext?.userAgent,
      timestamp: new Date(),
      metadata: { adminEmail: admin.email, code: invite.code },
    });

    return this.toListItem(invite.id);
  }

  async list() {
    const invites = await this.inviteCodeRepository.listAll();
    return Promise.all(invites.map((invite) => this.toListItem(invite.id)));
  }

  async deactivate(
    inviteCodeId: string,
    admin: AdminIdentity,
    requestContext?: RequestContext,
  ) {
    const before = await this.inviteCodeRepository.findById(inviteCodeId);
    const invite = await new DeactivateInviteCodeUseCase(
      this.inviteCodeRepository,
    ).execute(inviteCodeId);

    if (before?.isActive && !invite.isActive) {
      await this.authAuditService.logEvent({
        type: AuthEventType.INVITE_CODE_DEACTIVATED,
        userId: admin.id,
        email: admin.email,
        ip: requestContext?.ip,
        userAgent: requestContext?.userAgent,
        timestamp: new Date(),
        metadata: { adminEmail: admin.email, code: invite.code },
      });
    }

    return this.toListItem(invite.id);
  }

  /** Read model with live redemption counts (A4-safe: no user identities). */
  private async toListItem(inviteCodeId: string) {
    const invite = await this.prisma.inviteCode.findUniqueOrThrow({
      where: { id: inviteCodeId },
      select: {
        id: true,
        code: true,
        label: true,
        maxUses: true,
        usedCount: true,
        expiresAt: true,
        isActive: true,
        createdAt: true,
      },
    });

    return {
      ...invite,
      redemptions: await this.prisma.inviteRedemption.count({
        where: { inviteCodeId },
      }),
    };
  }
}
