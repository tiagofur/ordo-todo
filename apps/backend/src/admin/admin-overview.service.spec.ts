import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminOverviewService } from './admin-overview.service';
import { PrismaService } from '../database/prisma.service';

// TZ-hermetic: relative offsets from Date.now(), no local midnights.
const DAY = 24 * 60 * 60 * 1000;

describe('AdminOverviewService (ODD 019 S4 / A4)', () => {
  let service: AdminOverviewService;

  const prisma = {
    user: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
    authAuditLog: { findMany: jest.fn() },
    task: { count: jest.fn() },
    workspace: { count: jest.fn() },
    subscription: { groupBy: jest.fn() },
    inviteCode: { findUniqueOrThrow: jest.fn() },
    inviteRedemption: { count: jest.fn() },
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminOverviewService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = moduleRef.get(AdminOverviewService);
    jest.clearAllMocks();
  });

  describe('getOverview', () => {
    beforeEach(() => {
      prisma.user.count.mockImplementation(({ where } = {}) => {
        if (!where?.createdAt) return Promise.resolve(10);
        return Promise.resolve(
          where.createdAt.gte > new Date(Date.now() - 7 * DAY) ? 2 : 4,
        );
      });
      prisma.authAuditLog.findMany.mockResolvedValue([
        { userId: 'u1' },
        { userId: 'u2' },
      ]);
      prisma.task.count.mockResolvedValueOnce(100).mockResolvedValueOnce(40);
      prisma.workspace.count.mockResolvedValue(5);
      prisma.subscription.groupBy.mockResolvedValue([
        { plan: 'FREE', _count: { _all: 8 } },
        { plan: 'PRO', _count: { _all: 2 } },
      ]);
    });

    it('aggregates platform metrics without exposing content', async () => {
      const overview = await service.getOverview();

      expect(overview.users).toMatchObject({
        total: 10,
        activeLast30Days: 2,
      });
      expect(overview.tasks).toEqual({ total: 100, completed: 40 });
      expect(overview.workspaces).toEqual({ total: 5 });
      expect(overview.planDistribution).toEqual({ FREE: 8, PRO: 2 });
      // No content-bearing fields leak through.
      expect(JSON.stringify(overview)).not.toMatch(/title|body|description/);
    });

    it('queries LOGIN_SUCCESS distinct users for the 30-day window', async () => {
      await service.getOverview();

      expect(prisma.authAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'LOGIN_SUCCESS' }),
          distinct: ['userId'],
        }),
      );
    });
  });

  describe('listUsers', () => {
    it('searches email/username/name case-insensitively and paginates', async () => {
      prisma.user.count.mockResolvedValue(1);
      prisma.user.findMany.mockResolvedValue([
        {
          id: 'u1',
          email: 'Ann@Example.com',
          username: 'ann',
          name: 'Ann',
          status: 'ACTIVE',
          blockedAt: null,
          lastLoginAt: null,
          createdAt: new Date(),
          subscription: { plan: 'PRO', status: 'ACTIVE' },
        },
      ]);

      const result = await service.listUsers({
        search: 'ann',
        page: 2,
        limit: 10,
      });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { email: { contains: 'ann', mode: 'insensitive' } },
              { username: { contains: 'ann', mode: 'insensitive' } },
              { name: { contains: 'ann', mode: 'insensitive' } },
            ],
          },
          skip: 10,
          take: 10,
        }),
      );
      expect(result.users[0]).toMatchObject({ plan: 'PRO', id: 'u1' });
    });

    it('falls back to FREE when the user has no subscription row', async () => {
      prisma.user.count.mockResolvedValue(0);
      prisma.user.findMany.mockResolvedValue([
        {
          id: 'u2',
          email: 'b@x.com',
          username: 'b',
          name: 'B',
          status: 'ACTIVE',
          blockedAt: null,
          lastLoginAt: null,
          createdAt: new Date(),
          subscription: null,
        },
      ]);

      const result = await service.listUsers({});
      expect(result.users[0].plan).toBe('FREE');
    });

    it('caps the page size at 100', async () => {
      prisma.user.count.mockResolvedValue(0);
      prisma.user.findMany.mockResolvedValue([]);

      await service.listUsers({ limit: 5000 });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });
  });

  describe('getUserDetail', () => {
    it('returns aggregates and invite provenance, never content', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@x.com',
        username: 'a',
        name: 'A',
        status: 'ACTIVE',
        blockedAt: null,
        lastLoginAt: null,
        createdAt: new Date(),
        locale: 'es',
        timezone: 'UTC',
        subscription: null,
        inviteRedemption: {
          redeemedAt: new Date(),
          inviteCode: { code: 'ORDO-7KM2-QP9X' },
        },
        _count: { ownedTasks: 7, workspaces: 2 },
      });

      const detail = await service.getUserDetail('u1');

      expect(detail).toMatchObject({
        inviteCode: 'ORDO-7KM2-QP9X',
        counts: { tasks: 7, workspaces: 2 },
      });
    });

    it('throws 404 USER_NOT_FOUND for unknown ids', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const error = (await service
        .getUserDetail('nope')
        .catch((e: unknown) => e)) as NotFoundException;

      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.getResponse()).toMatchObject({ code: 'USER_NOT_FOUND' });
    });
  });
});
