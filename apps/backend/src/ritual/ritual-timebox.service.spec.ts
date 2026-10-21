import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { Task } from '@ordo-todo/core';
import { RitualService } from './ritual.service';
import { PrismaService } from '../database/prisma.service';
import { DayPlanService } from '../tasks/day-plan.service';
import { AIService } from '../ai/ai.service';

// ODD 006 S3 (T3): light time-boxing for the morning top-3 — manual blocks
// or accept-the-proposal, visible in the day calendar. No replanning (005).
describe('RitualService timebox (ODD 006 S3)', () => {
  let service: RitualService;
  let prisma: {
    user: { findUnique: jest.Mock };
    ritualDay: { findUnique: jest.Mock };
    task: { findMany: jest.Mock; update: jest.Mock };
    $transaction: jest.Mock;
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
    ],
    frozenTaskIds: [],
    changes: [],
  };

  const RITUAL_DONE = {
    id: 'ritual-1',
    userId: 'user-1',
    date: new Date('2026-10-21T06:00:00.000Z'),
    morningStatus: 'DONE',
    morningAt: new Date(),
    morningTop3: ['a', 'b', 'c'],
    morningPlannedAt: new Date(),
    eveningStatus: 'PENDING',
    eveningAt: null,
    eveningMoves: [],
    streakDay: false,
  };

  const coreTask = (id: string, estimatedMinutes = 60) =>
    new Task({
      id,
      title: id,
      status: 'TODO',
      priority: 'MEDIUM',
      projectId: 'p1',
      ownerId: 'user-1',
      isDeleted: false,
      estimatedMinutes,
    });

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ timezone: 'UTC' }),
      },
      ritualDay: {
        findUnique: jest.fn().mockResolvedValue(RITUAL_DONE),
      },
      task: {
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn((args: unknown) => args),
      },
      $transaction: jest.fn((ops: unknown[]) => Promise.resolve(ops)),
    };
    taskRepo = { findByOwnerId: jest.fn().mockResolvedValue([]) };
    dayPlan = { getDayPlan: jest.fn().mockResolvedValue(PLAN) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RitualService,
        { provide: PrismaService, useValue: prisma },
        { provide: DayPlanService, useValue: dayPlan },
        { provide: AIService, useValue: {} },
        { provide: 'TaskRepository', useValue: taskRepo },
      ],
    }).compile();
    service = module.get<RitualService>(RitualService);
  });

  it('timebox writes scheduledDate/Time + isTimeBlocked for top-3 tasks', async () => {
    taskRepo.findByOwnerId.mockResolvedValue([
      coreTask('a'),
      coreTask('b'),
      coreTask('c'),
    ]);
    prisma.task.findMany.mockResolvedValue([
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
    ]);

    const out = await service.timeboxMorning('user-1', [
      { taskId: 'a', start: '09:00', end: '09:30' },
      { taskId: 'b', start: '10:00' }, // end defaults: start + estimated
    ]);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    const ops = prisma.$transaction.mock.calls[0][0] as Array<{
      where: unknown;
      data: Record<string, unknown>;
    }>;
    expect(ops).toHaveLength(2);
    expect(ops[0]).toMatchObject({
      where: { id: 'a', ownerId: 'user-1' },
      data: {
        scheduledTime: '09:00',
        scheduledEndTime: '09:30',
        isTimeBlocked: true,
      },
    });
    expect(ops[0].data.scheduledDate).toBeInstanceOf(Date);
    // b: 60min estimated → 10:00–11:00.
    expect(ops[1]).toMatchObject({
      where: { id: 'b', ownerId: 'user-1' },
      data: {
        scheduledTime: '10:00',
        scheduledEndTime: '11:00',
        isTimeBlocked: true,
      },
    });
    expect(out).toEqual([
      { taskId: 'a', start: '09:00', end: '09:30' },
      { taskId: 'b', start: '10:00', end: '11:00' },
    ]);
  });

  it('timebox rejects a taskId outside the morning top-3 (400, no writes)', async () => {
    // Owned, so the top-3 check (not ownership) is what rejects.
    prisma.task.findMany.mockResolvedValue([{ id: 'zzz' }]);

    await expect(
      service.timeboxMorning('user-1', [{ taskId: 'zzz', start: '09:00' }]),
    ).rejects.toThrow(/not in the morning top-3/);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('timebox requires a completed morning ritual (400 when PENDING)', async () => {
    prisma.ritualDay.findUnique.mockResolvedValue({
      ...RITUAL_DONE,
      morningStatus: 'PENDING',
      morningTop3: [],
    });

    await expect(
      service.timeboxMorning('user-1', [{ taskId: 'a', start: '09:00' }]),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('timebox rejects malformed times and end <= start (400, no writes)', async () => {
    // Owned + in top-3, so the TIME checks (not top-3/ownership) reject.
    taskRepo.findByOwnerId.mockResolvedValue([coreTask('a')]);
    prisma.task.findMany.mockResolvedValue([{ id: 'a' }]);

    const cases: Array<{
      block: { taskId: string; start: string; end?: string };
      why: RegExp;
    }> = [
      { block: { taskId: 'a', start: '9am' }, why: /Invalid start time/ },
      { block: { taskId: 'a', start: '25:00' }, why: /Invalid start time/ },
      { block: { taskId: 'a', start: '10:60' }, why: /Invalid start time/ },
      {
        block: { taskId: 'a', start: '10:00', end: '09:00' },
        why: /Invalid end time/,
      },
      {
        block: { taskId: 'a', start: '10:00', end: '10:00' },
        why: /Invalid end time/,
      },
    ];
    for (const { block, why } of cases) {
      await expect(service.timeboxMorning('user-1', [block])).rejects.toThrow(
        why,
      );
    }
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('timebox rejects duplicate taskIds (400, no writes)', async () => {
    await expect(
      service.timeboxMorning('user-1', [
        { taskId: 'a', start: '09:00' },
        { taskId: 'a', start: '10:00' },
      ]),
    ).rejects.toThrow(/Duplicate block/);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('timebox rejects a default end past midnight (400, no writes)', async () => {
    taskRepo.findByOwnerId.mockResolvedValue([coreTask('a')]);
    prisma.task.findMany.mockResolvedValue([{ id: 'a' }]);

    // 60min estimated: 23:30 + 60min would write invalid 24:30.
    await expect(
      service.timeboxMorning('user-1', [{ taskId: 'a', start: '23:30' }]),
    ).rejects.toThrow(/past midnight/);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('acceptTimeboxProposal copies the plan blocks for the top-3', async () => {
    taskRepo.findByOwnerId.mockResolvedValue([
      coreTask('a'),
      coreTask('b'),
      coreTask('c'),
    ]);
    prisma.task.findMany.mockResolvedValue([
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
    ]);

    const out = await service.acceptTimeboxProposal('user-1');

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(out).toEqual([
      { taskId: 'a', start: '09:00', end: '10:00' },
      { taskId: 'b', start: '10:00', end: '11:00' },
      { taskId: 'c', start: '11:00', end: '12:00' },
    ]);
  });

  it('acceptTimeboxProposal skips top-3 tasks missing from the plan', async () => {
    prisma.ritualDay.findUnique.mockResolvedValue({
      ...RITUAL_DONE,
      morningTop3: ['a', 'ghost'],
    });
    taskRepo.findByOwnerId.mockResolvedValue([coreTask('a')]);
    prisma.task.findMany.mockResolvedValue([{ id: 'a' }]);

    const out = await service.acceptTimeboxProposal('user-1');

    expect(out).toEqual([{ taskId: 'a', start: '09:00', end: '10:00' }]);
  });

  it('acceptTimeboxProposal 400s without a DONE ritual (like manual)', async () => {
    prisma.ritualDay.findUnique.mockResolvedValue({
      ...RITUAL_DONE,
      morningStatus: 'PENDING',
      morningTop3: [],
    });

    await expect(service.acceptTimeboxProposal('user-1')).rejects.toThrow(
      /Complete the morning ritual first/,
    );
    expect(dayPlan.getDayPlan).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
