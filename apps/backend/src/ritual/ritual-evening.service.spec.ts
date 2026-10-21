import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { Task } from '@ordo-todo/core';
import { RitualService } from './ritual.service';
import { PrismaService } from '../database/prisma.service';
import { DayPlanService } from '../tasks/day-plan.service';
import { AIService } from '../ai/ai.service';

// ODD 006 S2 (T2): evening ritual — what got done vs the plan, pending tasks
// moved with a destination + reason, shutdown complete + disconnect suggestion.
describe('RitualService evening (ODD 006 S2)', () => {
  let service: RitualService;
  let prisma: {
    user: { findUnique: jest.Mock };
    task: { update: jest.Mock };
    ritualDay: {
      findUnique: jest.Mock;
      upsert: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let taskRepo: { findByOwnerId: jest.Mock };
  let dayPlan: { getDayPlan: jest.Mock };
  let ai: { generateDailyReport: jest.Mock };

  const PLAN = {
    proposalId: 'prop-1',
    status: 'PROPOSED',
    blocks: [
      { taskId: 'a', start: '09:00', end: '10:00', reason: 'due today' },
      { taskId: 'b', start: '10:00', end: '11:00', reason: 'priority high' },
      { taskId: 'c', start: '11:00', end: '12:00', reason: 'priority high' },
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

  const REPORT = {
    format: 'daily/v1',
    kind: 'PM',
    date: '2026-10-21',
    tasksDue: 1,
    tasksCompleted: 1,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ timezone: 'UTC' }),
      },
      task: { update: jest.fn() },
      ritualDay: { findUnique: jest.fn(), upsert: jest.fn() },
      $transaction: jest.fn((ops: unknown[]) => Promise.resolve(ops)),
    };
    taskRepo = { findByOwnerId: jest.fn().mockResolvedValue([]) };
    dayPlan = { getDayPlan: jest.fn().mockResolvedValue(PLAN) };
    ai = { generateDailyReport: jest.fn().mockResolvedValue(REPORT) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RitualService,
        { provide: PrismaService, useValue: prisma },
        { provide: DayPlanService, useValue: dayPlan },
        { provide: 'TaskRepository', useValue: taskRepo },
        { provide: AIService, useValue: ai },
      ],
    }).compile();
    service = module.get<RitualService>(RitualService);
  });

  const coreTask = (
    id: string,
    status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
    extra: { completedAt?: Date } = {},
  ) =>
    new Task({
      id,
      title: id,
      status,
      priority: 'MEDIUM',
      projectId: 'p1',
      ownerId: 'user-1',
      isDeleted: false,
      ...(extra.completedAt ? { completedAt: extra.completedAt } : {}),
    });

  // Hermetic "today at noon UTC" — no server-local getters.
  const todayNoonUtc = (): Date => {
    const now = new Date();
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12),
    );
  };

  it('getEvening returns summary + completed + pending + ritual', async () => {
    prisma.ritualDay.findUnique.mockResolvedValue(RITUAL_ROW);
    taskRepo.findByOwnerId.mockResolvedValue([
      coreTask('a', 'COMPLETED', { completedAt: todayNoonUtc() }),
      coreTask('b', 'TODO'),
      coreTask('c', 'IN_PROGRESS'),
    ]);

    const out = await service.getEvening('user-1');

    expect(ai.generateDailyReport).toHaveBeenCalledWith('user-1', 'PM');
    expect(out.summary).toEqual(REPORT);
    expect(out.completed.map((t) => t.taskId)).toEqual(['a']);
    expect(out.pending.map((t) => t.taskId).sort()).toEqual(['b', 'c']);
    expect(out.ritual).toMatchObject({ eveningStatus: 'PENDING' });
  });

  it('completed only counts tasks finished today in the user timezone', async () => {
    prisma.ritualDay.findUnique.mockResolvedValue(RITUAL_ROW);
    taskRepo.findByOwnerId.mockResolvedValue([
      coreTask('old', 'COMPLETED', {
        completedAt: new Date('2026-10-01T00:00:00Z'),
      }),
    ]);

    const out = await service.getEvening('user-1');

    expect(out.completed).toHaveLength(0);
  });

  it('pending only includes open tasks still in the plan of today', async () => {
    prisma.ritualDay.findUnique.mockResolvedValue(RITUAL_ROW);
    taskRepo.findByOwnerId.mockResolvedValue([
      coreTask('a', 'COMPLETED', { completedAt: todayNoonUtc() }),
      coreTask('b', 'TODO'),
    ]);

    const out = await service.getEvening('user-1');

    // 'a' is done (not pending), 'b' is open and in the plan, 'c' is in the
    // plan but no longer open/known (completed elsewhere or deleted).
    expect(out.pending.map((t) => t.taskId)).toEqual(['b']);
    expect(out.completed.map((t) => t.taskId)).toEqual(['a']);
  });

  it('complete moves tomorrow-lo tasks to doDate=tomorrow (user TZ)', async () => {
    taskRepo.findByOwnerId.mockResolvedValue([coreTask('b', 'TODO')]);
    prisma.ritualDay.upsert.mockResolvedValue({
      ...RITUAL_ROW,
      eveningStatus: 'DONE',
    });

    const out = await service.completeEvening('user-1', [
      { taskId: 'b', destination: 'tomorrow', reason: 'overran' },
    ]);

    expect(prisma.$transaction).toHaveBeenCalled();
    const taskUpdate = prisma.task.update.mock.calls[0][0];
    expect(taskUpdate.where).toEqual({ id: 'b', ownerId: 'user-1' });
    const doDate: Date = taskUpdate.data.doDate;
    const tomorrowKey = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(Date.now() + 24 * 60 * 60 * 1000));
    expect(doDate).toBeInstanceOf(Date);
    expect(
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(doDate),
    ).toBe(tomorrowKey);
    expect(prisma.ritualDay.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ eveningStatus: 'DONE' }),
        update: expect.objectContaining({ eveningStatus: 'DONE' }),
      }),
    );
    expect(out.shutdownComplete).toBe(true);
    expect(typeof out.suggestion).toBe('string');
  });

  it('complete with destination date stores that day midnight (user TZ)', async () => {
    taskRepo.findByOwnerId.mockResolvedValue([coreTask('b', 'TODO')]);
    prisma.ritualDay.upsert.mockResolvedValue({
      ...RITUAL_ROW,
      eveningStatus: 'DONE',
    });
    // A future key relative to "now" (hermetic: +30d from the UTC today key).
    const now = new Date();
    const future = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 30),
    );
    const futureKey = future.toISOString().slice(0, 10);

    await service.completeEvening('user-1', [
      { taskId: 'b', destination: 'date', date: futureKey, reason: 'urgent' },
    ]);

    expect(prisma.task.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'b', ownerId: 'user-1' },
        data: expect.objectContaining({ doDate: expect.any(Date) }),
      }),
    );
    const doDate: Date = prisma.task.update.mock.calls[0][0].data.doDate;
    expect(
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(doDate),
    ).toBe(futureKey);
  });

  it('complete stores the requested key even behind UTC (Mexico City)', async () => {
    // Regression: storing UTC-midnight for a date move lands on the
    // PREVIOUS day for users behind UTC (e.g. America/Mexico_City).
    prisma.user.findUnique.mockResolvedValue({
      timezone: 'America/Mexico_City',
    });
    taskRepo.findByOwnerId.mockResolvedValue([coreTask('b', 'TODO')]);
    prisma.ritualDay.upsert.mockResolvedValue({
      ...RITUAL_ROW,
      eveningStatus: 'DONE',
    });
    const now = new Date();
    const future = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 30),
    );
    const futureKey = future.toISOString().slice(0, 10);

    await service.completeEvening('user-1', [
      { taskId: 'b', destination: 'date', date: futureKey, reason: 'urgent' },
    ]);

    const doDate: Date = prisma.task.update.mock.calls[0][0].data.doDate;
    expect(
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Mexico_City',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(doDate),
    ).toBe(futureKey);
  });

  it('complete persists the validated moves in eveningMoves', async () => {
    taskRepo.findByOwnerId.mockResolvedValue([
      coreTask('b', 'TODO'),
      coreTask('c', 'TODO'),
    ]);
    prisma.ritualDay.upsert.mockResolvedValue({
      ...RITUAL_ROW,
      eveningStatus: 'DONE',
    });

    await service.completeEvening('user-1', [
      { taskId: 'b', destination: 'tomorrow', reason: 'overran' },
      { taskId: 'c', destination: 'archived', reason: 'no-energy' },
    ]);

    expect(prisma.ritualDay.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          eveningStatus: 'DONE',
          eveningMoves: [
            { taskId: 'b', destination: 'tomorrow', reason: 'overran' },
            { taskId: 'c', destination: 'archived', reason: 'no-energy' },
          ],
        }),
      }),
    );
  });

  it('complete rejects a taskId outside today pendings (400, no writes)', async () => {
    taskRepo.findByOwnerId.mockResolvedValue([coreTask('b', 'TODO')]);

    await expect(
      service.completeEvening('user-1', [
        { taskId: 'zzz', destination: 'tomorrow', reason: 'urgent' },
      ]),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.ritualDay.upsert).not.toHaveBeenCalled();
  });

  it('complete rejects an invalid or past date (400, no writes)', async () => {
    taskRepo.findByOwnerId.mockResolvedValue([coreTask('b', 'TODO')]);

    for (const date of ['not-a-date', '2026-13-99', '2020-01-01']) {
      await expect(
        service.completeEvening('user-1', [
          { taskId: 'b', destination: 'date', date, reason: 'other' },
        ]),
      ).rejects.toThrow(BadRequestException);
    }
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.ritualDay.upsert).not.toHaveBeenCalled();
  });

  it('complete archives with status CANCELLED (not soft-delete)', async () => {
    taskRepo.findByOwnerId.mockResolvedValue([coreTask('b', 'TODO')]);
    prisma.ritualDay.upsert.mockResolvedValue({
      ...RITUAL_ROW,
      eveningStatus: 'DONE',
    });

    await service.completeEvening('user-1', [
      { taskId: 'b', destination: 'archived', reason: 'no-energy' },
    ]);

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.task.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'b', ownerId: 'user-1' },
        data: expect.objectContaining({ status: 'CANCELLED' }),
      }),
    );
  });

  it('complete requires a date when destination is date (400)', async () => {
    taskRepo.findByOwnerId.mockResolvedValue([coreTask('b', 'TODO')]);

    await expect(
      service.completeEvening('user-1', [
        { taskId: 'b', destination: 'date', reason: 'other' },
      ]),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('skip persists SKIPPED with a touch', async () => {
    prisma.ritualDay.upsert.mockResolvedValue({
      ...RITUAL_ROW,
      eveningStatus: 'SKIPPED',
    });

    const out = await service.skipEvening('user-1');

    expect(prisma.ritualDay.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ eveningStatus: 'SKIPPED' }),
        update: expect.objectContaining({
          eveningStatus: 'SKIPPED',
          eveningMoves: [],
        }),
      }),
    );
    expect(out).toMatchObject({ eveningStatus: 'SKIPPED' });
  });

  it('shutdown suggestion is deterministic for the same day', async () => {
    taskRepo.findByOwnerId.mockResolvedValue([coreTask('b', 'TODO')]);
    prisma.ritualDay.upsert.mockResolvedValue({
      ...RITUAL_ROW,
      eveningStatus: 'DONE',
    });
    const moves = [{ taskId: 'b', destination: 'tomorrow', reason: 'overran' }];

    const first = await service.completeEvening('user-1', moves);
    const second = await service.completeEvening('user-1', moves);

    expect(first.shutdownComplete).toBe(true);
    expect(second.shutdownComplete).toBe(true);
    expect(first.suggestion).toBe(second.suggestion);
    expect(first.suggestion.length).toBeGreaterThan(0);
  });

  it('evening honors the user timezone (Kiritimati)', async () => {
    prisma.user.findUnique.mockResolvedValue({
      timezone: 'Pacific/Kiritimati',
    });
    prisma.ritualDay.findUnique.mockResolvedValue(RITUAL_ROW);
    // Completed "today" in Kiritimati but possibly "yesterday" in UTC:
    // build noon in Kiritimati (fixed UTC+14, no DST) hermetically.
    const now = new Date();
    const kiritimatiToday = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Pacific/Kiritimati',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    const [y, mo, d] = kiritimatiToday.split('-').map(Number);
    const noonKiritimati = new Date(Date.UTC(y, mo - 1, d, 12 - 14, 0, 0));
    taskRepo.findByOwnerId.mockResolvedValue([
      coreTask('a', 'COMPLETED', { completedAt: noonKiritimati }),
    ]);

    const out = await service.getEvening('user-1');

    expect(out.completed.map((t) => t.taskId)).toEqual(['a']);
  });
});
