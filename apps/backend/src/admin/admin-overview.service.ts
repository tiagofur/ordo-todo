import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface ListUsersParams {
  search?: string;
  page?: number;
  limit?: number;
}

const DAY = 24 * 60 * 60 * 1000;

/**
 * Admin read model (ODD 019 S4 / A4): aggregate and identification data
 * only — never task titles, note bodies or any user content.
 */
@Injectable()
export class AdminOverviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const now = Date.now();
    const since = (days: number) => new Date(now - days * DAY);

    const [
      totalUsers,
      newUsers7d,
      newUsers30d,
      activeSessions30d,
      totalTasks,
      completedTasks,
      totalWorkspaces,
      planGroups,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: since(7) } } }),
      this.prisma.user.count({ where: { createdAt: { gte: since(30) } } }),
      this.prisma.authAuditLog.findMany({
        where: { type: 'LOGIN_SUCCESS', createdAt: { gte: since(30) } },
        select: { userId: true },
        distinct: ['userId'],
      }),
      this.prisma.task.count({ where: { isDeleted: false } }),
      this.prisma.task.count({
        where: { isDeleted: false, completedAt: { not: null } },
      }),
      this.prisma.workspace.count({ where: { isDeleted: false } }),
      this.prisma.subscription.groupBy({
        by: ['plan'],
        _count: { _all: true },
      }),
    ]);

    const planDistribution = Object.fromEntries(
      planGroups.map((group) => [group.plan, group._count._all]),
    );

    return {
      users: {
        total: totalUsers,
        newLast7Days: newUsers7d,
        newLast30Days: newUsers30d,
        activeLast30Days: activeSessions30d.length,
      },
      tasks: { total: totalTasks, completed: completedTasks },
      workspaces: { total: totalWorkspaces },
      planDistribution,
      generatedAt: new Date(),
    };
  }

  async listUsers({ search, page = 1, limit = 20 }: ListUsersParams) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safePage = Math.max(page, 1);
    const trimmed = search?.trim();

    const where = trimmed
      ? {
          OR: [
            { email: { contains: trimmed, mode: 'insensitive' as const } },
            { username: { contains: trimmed, mode: 'insensitive' as const } },
            { name: { contains: trimmed, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [total, rows] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          status: true,
          blockedAt: true,
          lastLoginAt: true,
          createdAt: true,
          subscription: { select: { plan: true, status: true } },
        },
      }),
    ]);

    return {
      total,
      page: safePage,
      limit: safeLimit,
      users: rows.map((row) => ({
        id: row.id,
        email: row.email,
        username: row.username,
        name: row.name,
        status: row.status,
        blockedAt: row.blockedAt,
        lastLoginAt: row.lastLoginAt,
        createdAt: row.createdAt,
        plan: row.subscription?.plan ?? 'FREE',
      })),
    };
  }

  async getUserDetail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        status: true,
        blockedAt: true,
        lastLoginAt: true,
        createdAt: true,
        locale: true,
        timezone: true,
        subscription: { select: { plan: true, status: true } },
        inviteRedemption: {
          select: { redeemedAt: true, inviteCode: { select: { code: true } } },
        },
        _count: { select: { ownedTasks: true, workspaces: true } },
      },
    });

    if (!user) {
      throw new NotFoundException({
        statusCode: 404,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      status: user.status,
      blockedAt: user.blockedAt,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      locale: user.locale,
      timezone: user.timezone,
      plan: user.subscription?.plan ?? 'FREE',
      inviteCode: user.inviteRedemption?.inviteCode.code ?? null,
      invitedAt: user.inviteRedemption?.redeemedAt ?? null,
      counts: {
        tasks: user._count.ownedTasks,
        workspaces: user._count.workspaces,
      },
    };
  }
}
