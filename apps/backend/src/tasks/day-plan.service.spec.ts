import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DayPlanService, startOfTodayIn } from './day-plan.service';
import { PrismaService } from '../database/prisma.service';
import { SchedulingService } from '../scheduling/scheduling.service';

// ODD 005 S3 (T3b): day-plan proposal persistence + freeze/apply.
describe('DayPlanService (ODD 005 S3)', () => {
  let service: DayPlanService;
  let prisma: {
    dayPlanProposal: {
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
    task: { updateMany: jest.Mock; update: jest.Mock; findMany: jest.Mock };
    user: { findUnique: jest.Mock };
    $transaction: jest.Mock;
  };
  let scheduling: { replanOnDayStart: jest.Mock };

  const PROPOSAL = {
    id: 'prop-1',
    userId: 'user-1',
    date: new Date('2026-10-20T00:00:00.000Z'),
    blocks: [
      { taskId: 'a', start: '09:00', end: '10:00', reason: 'seed' },
      { taskId: 'b', start: '10:00', end: '11:00', reason: 'seed' },
    ],
    frozenTaskIds: [] as string[],
    changes: [
      {
        taskId: 'a',
        type: 'added',
        to: { start: '09:00', end: '10:00' },
        reason: 'r',
      },
    ],
    status: 'PROPOSED',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma = {
      dayPlanProposal: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      task: {
        updateMany: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      user: { findUnique: jest.fn().mockResolvedValue({ timezone: 'UTC' }) },
      $transaction: jest.fn(async (ops: unknown[]) => ops),
    };
    scheduling = { replanOnDayStart: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DayPlanService,
        { provide: PrismaService, useValue: prisma },
        { provide: SchedulingService, useValue: scheduling },
      ],
    }).compile();
    service = module.get<DayPlanService>(DayPlanService);
  });

  it('getDayPlan returns the latest PROPOSED proposal with blocks + changes', async () => {
    prisma.dayPlanProposal.findFirst.mockResolvedValue(PROPOSAL);
    const result = await service.getDayPlan('user-1');

    expect(prisma.dayPlanProposal.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'user-1',
          status: 'PROPOSED',
        }),
        orderBy: { createdAt: 'desc' },
      }),
    );
    expect(result).toMatchObject({
      proposalId: 'prop-1',
      status: 'PROPOSED',
      blocks: PROPOSAL.blocks,
      frozenTaskIds: [],
      changes: PROPOSAL.changes,
    });
  });

  it('getDayPlan builds a fresh proposal via replanOnDayStart when none exists', async () => {
    prisma.dayPlanProposal.findFirst.mockResolvedValue(null);
    scheduling.replanOnDayStart.mockResolvedValue({
      plan: {
        blocks: [{ taskId: 'a', start: '09:00', end: '10:00', reason: 'x' }],
        unscheduled: [],
      },
      changes: [{ taskId: 'a', type: 'added', reason: 'first plan' }],
    });
    prisma.dayPlanProposal.create.mockResolvedValue({
      ...PROPOSAL,
      blocks: [{ taskId: 'a', start: '09:00', end: '10:00', reason: 'x' }],
    });

    const result = await service.getDayPlan('user-1');

    expect(scheduling.replanOnDayStart).toHaveBeenCalledWith('user-1');
    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'user-1' } }),
    );
    expect(prisma.dayPlanProposal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          status: 'PROPOSED',
          // TZ-aware midnight: with the mocked 'UTC' user timezone this is
          // today's UTC midnight (a UTC-based impl would coincide here, but
          // the user.findUnique assertion above pins the TZ-aware path).
          date: startOfTodayIn('UTC'),
        }),
      }),
    );
    expect(result.proposalId).toBe('prop-1');
  });

  it('freeze adds the task to frozenTaskIds (idempotent)', async () => {
    prisma.dayPlanProposal.findFirst.mockResolvedValue(PROPOSAL);
    prisma.dayPlanProposal.update.mockResolvedValue({
      ...PROPOSAL,
      frozenTaskIds: ['b'],
    });

    const result = await service.freeze('user-1', 'b');

    expect(prisma.dayPlanProposal.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'prop-1', userId: 'user-1' },
        data: { frozenTaskIds: ['b'] },
      }),
    );
    expect(result.frozenTaskIds).toEqual(['b']);

    // Idempotent: freezing twice does not duplicate.
    prisma.dayPlanProposal.findFirst.mockResolvedValue({
      ...PROPOSAL,
      frozenTaskIds: ['b'],
    });
    prisma.dayPlanProposal.update.mockResolvedValue({
      ...PROPOSAL,
      frozenTaskIds: ['b'],
    });
    const again = await service.freeze('user-1', 'b');
    expect(again.frozenTaskIds).toEqual(['b']);
  });

  it('freeze rejects a task not in the plan', async () => {
    prisma.dayPlanProposal.findFirst.mockResolvedValue(PROPOSAL);
    await expect(service.freeze('user-1', 'zzz')).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.dayPlanProposal.update).not.toHaveBeenCalled();
  });

  it('unfreeze removes the task from frozenTaskIds', async () => {
    prisma.dayPlanProposal.findFirst.mockResolvedValue({
      ...PROPOSAL,
      frozenTaskIds: ['a', 'b'],
    });
    prisma.dayPlanProposal.update.mockResolvedValue({
      ...PROPOSAL,
      frozenTaskIds: ['a'],
    });

    const result = await service.unfreeze('user-1', 'b');
    expect(prisma.dayPlanProposal.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'prop-1', userId: 'user-1' },
        data: { frozenTaskIds: ['a'] },
      }),
    );
    expect(result.frozenTaskIds).toEqual(['a']);
  });

  it('apply writes doDate/scheduledTime per block and marks APPLIED atomically', async () => {
    prisma.dayPlanProposal.findFirst.mockResolvedValue(PROPOSAL);
    prisma.task.findMany.mockResolvedValue([{ id: 'a' }, { id: 'b' }]);
    prisma.task.update.mockImplementation((args: unknown) => args);
    prisma.dayPlanProposal.update.mockImplementation((args: unknown) => args);
    prisma.$transaction.mockImplementation(async (ops: unknown[]) => [
      ...ops.slice(0, -1),
      { ...PROPOSAL, status: 'APPLIED' },
    ]);

    const result = await service.apply('user-1', 'prop-1');

    // Tenant check: only tasks owned by the caller.
    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ ownerId: 'user-1' }),
      }),
    );
    // Atomic: N task updates + status flip in ONE transaction.
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    const ops = prisma.$transaction.mock.calls[0][0] as Array<{
      where: unknown;
      data: Record<string, unknown>;
    }>;
    expect(ops).toHaveLength(3); // 2 blocks + status flip
    // Payload pinned: doDate = plan day, times from each block.
    expect(ops[0]).toMatchObject({
      where: { id: 'a' },
      data: {
        doDate: PROPOSAL.date,
        scheduledTime: '09:00',
        scheduledEndTime: '10:00',
        isTimeBlocked: true,
      },
    });
    expect(ops[1]).toMatchObject({
      where: { id: 'b' },
      data: {
        doDate: PROPOSAL.date,
        scheduledTime: '10:00',
        scheduledEndTime: '11:00',
        isTimeBlocked: true,
      },
    });
    expect(result.status).toBe('APPLIED');
  });

  it('apply rejects when a blocked task is gone or foreign (409, no writes)', async () => {
    prisma.dayPlanProposal.findFirst.mockResolvedValue(PROPOSAL);
    prisma.task.findMany.mockResolvedValue([{ id: 'a' }]); // 'b' missing

    await expect(service.apply('user-1', 'prop-1')).rejects.toThrow(
      ConflictException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('apply rejects an already-APPLIED proposal', async () => {
    prisma.dayPlanProposal.findFirst.mockResolvedValue({
      ...PROPOSAL,
      status: 'APPLIED',
    });
    await expect(service.apply('user-1', 'prop-1')).rejects.toThrow(
      ConflictException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('apply rejects a proposal owned by another user (404, filtered by userId)', async () => {
    prisma.dayPlanProposal.findFirst.mockResolvedValue(null);
    await expect(service.apply('user-1', 'prop-x')).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.dayPlanProposal.findFirst).toHaveBeenCalledWith({
      where: { id: 'prop-x', userId: 'user-1' },
    });
  });

  // ODD 005 S6 (T5): dismiss flips PROPOSED → DISMISSED (reject UX).
  it('dismiss marks the latest PROPOSED proposal DISMISSED', async () => {
    prisma.dayPlanProposal.findFirst.mockResolvedValue(PROPOSAL);
    prisma.dayPlanProposal.update.mockResolvedValue({
      ...PROPOSAL,
      status: 'DISMISSED',
    });

    const result = await service.dismiss('user-1', 'prop-1');

    expect(prisma.dayPlanProposal.findFirst).toHaveBeenCalledWith({
      where: { id: 'prop-1', userId: 'user-1' },
    });
    expect(prisma.dayPlanProposal.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'prop-1', userId: 'user-1' },
        data: { status: 'DISMISSED' },
      }),
    );
    expect(result.status).toBe('DISMISSED');
    expect(result.proposalId).toBe('prop-1');
  });

  it('dismiss rejects a proposal owned by another user (404)', async () => {
    prisma.dayPlanProposal.findFirst.mockResolvedValue(null);

    await expect(service.dismiss('user-1', 'prop-x')).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.dayPlanProposal.update).not.toHaveBeenCalled();
  });

  it('dismiss rejects an already-APPLIED proposal (409, no writes)', async () => {
    prisma.dayPlanProposal.findFirst.mockResolvedValue({
      ...PROPOSAL,
      status: 'APPLIED',
    });

    await expect(service.dismiss('user-1', 'prop-1')).rejects.toThrow(
      ConflictException,
    );
    expect(prisma.dayPlanProposal.update).not.toHaveBeenCalled();
  });
});
