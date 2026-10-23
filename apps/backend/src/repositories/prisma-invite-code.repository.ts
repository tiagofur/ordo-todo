import { Injectable } from '@nestjs/common';
import { InviteCode as PrismaInviteCode } from '@prisma/client';
import {
  InviteCode,
  InviteCodeRepository,
  InviteRedemptionData,
} from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaInviteCodeRepository implements InviteCodeRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(row: PrismaInviteCode): InviteCode {
    return new InviteCode({
      id: row.id,
      code: row.code,
      label: row.label,
      maxUses: row.maxUses,
      usedCount: row.usedCount,
      expiresAt: row.expiresAt,
      isActive: row.isActive,
      createdById: row.createdById,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async save(invite: InviteCode): Promise<InviteCode> {
    const row = await this.prisma.inviteCode.create({
      data: {
        id: invite.id,
        code: invite.code,
        label: invite.label ?? null,
        maxUses: invite.maxUses,
        usedCount: invite.usedCount,
        expiresAt: invite.expiresAt ?? null,
        isActive: invite.isActive,
        createdById: invite.createdById ?? null,
      },
    });
    return this.toDomain(row);
  }

  async update(invite: InviteCode): Promise<InviteCode> {
    const row = await this.prisma.inviteCode.update({
      where: { id: invite.id },
      data: {
        label: invite.label ?? null,
        isActive: invite.isActive,
      },
    });
    return this.toDomain(row);
  }

  async findById(id: string): Promise<InviteCode | null> {
    const row = await this.prisma.inviteCode.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByCode(code: string): Promise<InviteCode | null> {
    const row = await this.prisma.inviteCode.findUnique({
      where: { code: InviteCode.normalize(code) },
    });
    return row ? this.toDomain(row) : null;
  }

  async listAll(): Promise<InviteCode[]> {
    const rows = await this.prisma.inviteCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  /**
   * Atomic conditional increment. Prisma's `where` cannot compare two columns
   * (`usedCount < maxUses`), so the guard runs as a single raw UPDATE: the
   * row is only mutated while every redeemability rule still holds, and the
   * affected-rows count tells the caller whether it won the race.
   */
  async consume(id: string, now: Date = new Date()): Promise<boolean> {
    const updated = await this.prisma.$executeRaw`
      UPDATE "InviteCode"
      SET "usedCount" = "usedCount" + 1, "updatedAt" = NOW()
      WHERE "id" = ${id}
        AND "isActive" = true
        AND ("expiresAt" IS NULL OR "expiresAt" > ${now})
        AND "usedCount" < "maxUses"
    `;
    return updated > 0;
  }

  async release(id: string): Promise<void> {
    // Floor at 0: never let a compensating decrement go negative.
    await this.prisma.inviteCode.updateMany({
      where: { id, usedCount: { gt: 0 } },
      data: { usedCount: { decrement: 1 } },
    });
  }

  async recordRedemption(
    inviteCodeId: string,
    userId: string,
  ): Promise<InviteRedemptionData> {
    const row = await this.prisma.inviteRedemption.create({
      data: { inviteCodeId, userId },
    });
    return {
      id: row.id,
      inviteCodeId: row.inviteCodeId,
      userId: row.userId,
      redeemedAt: row.redeemedAt,
    };
  }

  async findRedemptionByUserId(
    userId: string,
  ): Promise<InviteRedemptionData | null> {
    const row = await this.prisma.inviteRedemption.findUnique({
      where: { userId },
    });
    return row
      ? {
          id: row.id,
          inviteCodeId: row.inviteCodeId,
          userId: row.userId,
          redeemedAt: row.redeemedAt,
        }
      : null;
  }

  async countRedemptions(inviteCodeId: string): Promise<number> {
    return this.prisma.inviteRedemption.count({ where: { inviteCodeId } });
  }
}
