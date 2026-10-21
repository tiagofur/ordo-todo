import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { Task } from '@ordo-todo/core';
import { RitualService } from './ritual.service';
import { PrismaService } from '../database/prisma.service';
import { DayPlanService } from '../tasks/day-plan.service';

// ODD 006 S1 (T1): morning ritual — plan + overdue + suggested top-3,
// complete/skip persisted per day.
describe('RitualService morning (ODD 006 S1)', () => {
  let service: RitualService;
  let prisma: {
    user: { findUnique: jest.Mock };
    ritualDay: {
      findUnique: jest.Mock;
      upsert: jest.Mock;
    };
  };
  let taskRepo: { findByOwnerId: jest.Mock };
  let dayPlan: { getDayPlan: jest.Mock };

  const PLAN = {
    proposalId: 'prop-1',
    status: 'PROPOSED',
    blocks: [
      { taskId: 'a', start: '09:00', end: '10:00', reason: 'due today' },
      { taskId: 'b', start: '10:00', end: '11:00', reason: 'priority high' },
      { taskId: 'c', start: '11:00', end: '12:00', reason: 'priority high' },
      { taskId: 'd', start: '14:00', end: '15:00', reason: 'no due date' },
    ],
    frozenTaskIds: [],
    changes: [],
  };

  const RITUAL_ROW = {
    id: 'ritual-1',
    userId: 'user-1',
    date: new Date('2026-10-21T06:00:00.000Z'),
    morningStatus: 'PENDING',
    morningAt: null,
    morningTop3: [],
    morningPlannedAt: null,
    eveningStatus: 'PENDING',
    eveningAt: null,
    eveningMoves: [],
    streakDay: false,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ timezone: 'UTC' }),
      },
      ritualDay: { findUnique: jest.fn(), upsert: jest.fn() },
    };
    taskRepo = { findByOwnerId: jest.fn().mockResolvedValue([]) };
    dayPlan = { getDayPlan: jest.fn().mockResolvedValue(PLAN) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RitualService,
        { provide: PrismaService, useValue: prisma },
        { provide: DayPlanService, useValue: dayPlan },
        { provide: 'TaskRepository', useValue: taskRepo },
      ],
    }).compile();
    service = module.get<RitualService>(RitualService);
  });

  const openTask = (
    id: string,
    dueDate: Date | null,
    status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' = 'TODO',
  ) =>
    new Task({
      id,
      title: id === 'old' ? 'Old thing' : id,
      status,
      priority: 'MEDIUM',
      projectId: 'p1',
      ownerId: 'user-1',
      isDeleted: false,
      dueDate,
    });

  it('getMorning returns plan + overdue + suggested top-3 + ritual state', async () => {
    prisma.ritualDay.findUnique.mockResolvedValue(RITUAL_ROW);
    taskRepo.findByOwnerId.mockResolvedValue([
      openTask('old', new Date('2026-10-01T00:00:00Z')),
    ]);

    const out = await service.getMorning('user-1');

    expect(dayPlan.getDayPlan).toHaveBeenCalledWith('user-1');
    expect(out.plan).toEqual(PLAN);
    expect(out.suggestedTop3).toEqual(['a', 'b', 'c']);
    expect(out.overdue).toHaveLength(1);
    expect(out.overdue[0]).toMatchObject({ taskId: 'old', title: 'Old thing' });
    expect(out.ritual).toMatchObject({ morningStatus: 'PENDING' });
  });

  it('complete persists DONE + top-3 when all ids are in the plan', async () => {
    prisma.ritualDay.upsert.mockResolvedValue({
      ...RITUAL_ROW,
      morningStatus: 'DONE',
      morningTop3: ['a', 'b', 'c'],
    });

    const out = await service.completeMorning('user-1', ['a', 'b', 'c']);

    expect(prisma.ritualDay.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId_date: expect.objectContaining({ userId: 'user-1' }),
        }),
        create: expect.objectContaining({
          morningStatus: 'DONE',
          morningTop3: ['a', 'b', 'c'],
        }),
        update: expect.objectContaining({
          morningStatus: 'DONE',
          morningTop3: ['a', 'b', 'c'],
        }),
      }),
    );
    expect(out).toMatchObject({ morningStatus: 'DONE' });
  });

  it('complete rejects a top-3 id outside the plan (400, no writes)', async () => {
    await expect(
      service.completeMorning('user-1', ['a', 'zzz']),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.ritualDay.upsert).not.toHaveBeenCalled();
  });

  it('complete rejects duplicate ids (400, no writes)', async () => {
    await expect(service.completeMorning('user-1', ['a', 'a'])).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.ritualDay.upsert).not.toHaveBeenCalled();
  });

  it('skip persists SKIPPED without top-3', async () => {
    prisma.ritualDay.upsert.mockResolvedValue({
      ...RITUAL_ROW,
      morningStatus: 'SKIPPED',
    });

    const out = await service.skipMorning('user-1');

    expect(prisma.ritualDay.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ morningStatus: 'SKIPPED' }),
        update: expect.objectContaining({
          morningStatus: 'SKIPPED',
          morningTop3: [],
          morningPlannedAt: null,
        }),
      }),
    );
    expect(out).toMatchObject({ morningStatus: 'SKIPPED' });
  });

  it('overdue excludes tasks due today or later (TZ-aware keys)', async () => {
    prisma.ritualDay.findUnique.mockResolvedValue(RITUAL_ROW);
    // dueDate equal to the (mocked UTC) today must NOT count as overdue.
    // Hermetic: build "today UTC midnight" without server-local getters.
    const now = new Date();
    const todayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    taskRepo.findByOwnerId.mockResolvedValue([openTask('today', todayStart)]);

    const out = await service.getMorning('user-1');

    expect(out.overdue).toHaveLength(0);
  });

  it('overdue includes IN_PROGRESS but excludes COMPLETED', async () => {
    prisma.ritualDay.findUnique.mockResolvedValue(RITUAL_ROW);
    const old = new Date('2026-10-01T00:00:00Z');
    taskRepo.findByOwnerId.mockResolvedValue([
      openTask('wip', old, 'IN_PROGRESS'),
      openTask('done', old, 'COMPLETED'),
    ]);

    const out = await service.getMorning('user-1');

    expect(out.overdue.map((t) => t.taskId)).toEqual(['wip']);
  });

  it('overdue uses the user timezone, not the server one', async () => {
    // User in Kiritimati (UTC+14): an instant that is "today" in UTC can
    // already be "tomorrow" there — or still "yesterday" behind. Build a
    // dueDate that is yesterday in Kiritimati but today in UTC: it MUST
    // count as overdue for this user.
    prisma.user.findUnique.mockResolvedValue({
      timezone: 'Pacific/Kiritimati',
    });
    prisma.ritualDay.findUnique.mockResolvedValue(RITUAL_ROW);
    const now = new Date();
    const kiritimatiToday = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Pacific/Kiritimati',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    const [y, mo, d] = kiritimatiToday.split('-').map(Number);
    // Yesterday 12:00 in Kiritimati (fixed UTC+14, no DST):
    // Date.UTC normalizes the hour underflow across the month boundary.
    const yesterdayKiritimati = new Date(
      Date.UTC(y, mo - 1, d - 1, 12 - 14, 0, 0),
    );
    taskRepo.findByOwnerId.mockResolvedValue([
      openTask('late', yesterdayKiritimati),
    ]);

    const out = await service.getMorning('user-1');

    expect(out.overdue.map((t) => t.taskId)).toEqual(['late']);
  });
});
