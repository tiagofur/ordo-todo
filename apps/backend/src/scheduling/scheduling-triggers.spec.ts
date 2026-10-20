import { Test, TestingModule } from '@nestjs/testing';
import { Task } from '@ordo-todo/core';
// Pin server TZ so "today" math is hermetic (same pattern as T2 specs).
process.env.TZ = 'America/Mexico_City';
import { SchedulingService } from './scheduling.service';
import { PrismaService } from '../database/prisma.service';
import type { DayPlan } from './day-planner';

// ODD 005 S3 (T3): explicit replan triggers on SchedulingService.
// No EventEmitter in the backend (verified) — these methods are called
// explicitly and wired later by ritual/T5/cron (see TODOs in service).
describe('SchedulingService replan triggers (ODD 005 S3)', () => {
  let service: SchedulingService;
  let prisma: {
    user: { findUnique: jest.Mock };
    task: { findMany: jest.Mock };
    externalCalendarBlock: { findMany: jest.Mock };
  };

  const openTask = (
    id: string,
    overrides: Record<string, unknown> = {},
  ): Task =>
    new Task({
      id,
      title: id,
      status: 'TODO',
      priority: 'MEDIUM',
      projectId: 'p1',
      ownerId: 'user-1',
      isDeleted: false,
      estimatedMinutes: 60,
      doDate: new Date(),
      ...overrides,
    });

  const EMPTY_PLAN: DayPlan = { blocks: [], unscheduled: [] };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma = {
      user: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ timezone: 'America/Mexico_City' }),
      },
      task: { findMany: jest.fn().mockResolvedValue([]) },
      externalCalendarBlock: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulingService,
        { provide: 'TaskRepository', useValue: { findByOwnerId: jest.fn() } },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<SchedulingService>(SchedulingService);
  });

  const repos = () => ({
    findByOwnerId: (
      service as unknown as { taskRepository: { findByOwnerId: jest.Mock } }
    ).taskRepository.findByOwnerId,
  });

  it('replanOnDayStart with no previous plan returns all-added changes', async () => {
    repos().findByOwnerId.mockResolvedValue([openTask('a'), openTask('b')]);
    const { plan, changes } = await service.replanOnDayStart('user-1');

    expect(plan.blocks).toHaveLength(2);
    expect(changes).toHaveLength(2);
    expect(changes.every((c) => c.type === 'added')).toBe(true);
    expect(changes[0].reason).toMatch(/first plan|day start/i);
  });

  it('replanOnTaskCompleted drops the task and advances the rest', async () => {
    // 'a' is STILL returned as open by the repo (read-your-write race):
    // the trigger filter must drop it regardless.
    repos().findByOwnerId.mockResolvedValue([
      openTask('a', { doDate: new Date() }),
      openTask('b', { doDate: new Date() }),
      openTask('c', { doDate: new Date() }),
    ]);
    const previous: DayPlan = {
      blocks: [
        { taskId: 'a', start: '09:00', end: '10:00', reason: 'seed' },
        { taskId: 'b', start: '10:00', end: '11:00', reason: 'seed' },
        { taskId: 'c', start: '11:00', end: '12:00', reason: 'seed' },
      ],
      unscheduled: [],
    };
    const { plan, changes } = await service.replanOnTaskCompleted(
      'user-1',
      'a',
      { previous, frozenTaskIds: [] },
    );

    expect(plan.blocks[0]).toMatchObject({ taskId: 'b', start: '09:00' });
    expect(changes).toContainEqual(
      expect.objectContaining({ taskId: 'a', type: 'removed' }),
    );
    expect(changes.find((c) => c.taskId === 'b')).toMatchObject({
      type: 'moved',
    });
  });

  it('replanOnTaskOverrun grows the block and pushes later ones', async () => {
    repos().findByOwnerId.mockResolvedValue([
      openTask('a', { estimatedMinutes: 60 }),
      openTask('b', { estimatedMinutes: 60 }),
    ]);
    const previous: DayPlan = {
      blocks: [
        { taskId: 'a', start: '09:00', end: '10:00', reason: 'seed' },
        { taskId: 'b', start: '10:00', end: '11:00', reason: 'seed' },
      ],
      unscheduled: [],
    };
    const { plan, changes } = await service.replanOnTaskOverrun(
      'user-1',
      'a',
      90,
      { previous, frozenTaskIds: [] },
    );

    expect(plan.blocks).toMatchObject([
      { taskId: 'a', start: '09:00', end: '10:30' },
      { taskId: 'b', start: '10:30', end: '11:30' },
    ]);
    expect(changes.find((c) => c.taskId === 'a')).toMatchObject({
      type: 'resized',
    });
    expect(changes.find((c) => c.taskId === 'b')).toMatchObject({
      type: 'moved',
    });
  });

  it('respects frozenTaskIds: frozen blocks never move', async () => {
    repos().findByOwnerId.mockResolvedValue([
      openTask('a', { estimatedMinutes: 60 }),
      openTask('b', { estimatedMinutes: 60 }),
    ]);
    const previous: DayPlan = {
      blocks: [
        { taskId: 'a', start: '09:00', end: '10:00', reason: 'seed' },
        { taskId: 'b', start: '10:00', end: '11:00', reason: 'seed' },
      ],
      unscheduled: [],
    };
    const { plan, changes } = await service.replanOnTaskOverrun(
      'user-1',
      'a',
      90,
      { previous, frozenTaskIds: ['b'] },
    );

    expect(plan.blocks.find((b) => b.taskId === 'b')).toMatchObject({
      start: '10:00',
      end: '11:00',
    });
    expect(changes.find((c) => c.taskId === 'b')).toBeUndefined();
  });

  it('passes real calendar events as busy time (read-only)', async () => {
    repos().findByOwnerId.mockResolvedValue([openTask('a')]);
    const startAt = new Date();
    startAt.setHours(9, 30, 0, 0);
    const endAt = new Date();
    endAt.setHours(10, 0, 0, 0);
    prisma.externalCalendarBlock.findMany.mockResolvedValue([
      { title: 'Standup', startAt, endAt },
    ]);

    const { plan } = await service.replanOnDayStart('user-1');

    expect(prisma.externalCalendarBlock.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'user-1' }),
      }),
    );
    // Single 60min task must start at 10:00 (after the 09:30-10:00 meeting),
    // not at 09:00 overlapping it.
    expect(plan.blocks).toMatchObject([{ taskId: 'a', start: '10:00' }]);
  });

  it('clamps cross-midnight events to today (never an inverted range)', async () => {
    repos().findByOwnerId.mockResolvedValue([openTask('a')]);
    // Event started yesterday 22:00, ends today 10:00 -> must block 00:00-10:00
    // today, not map to the inverted 22:00-10:00 (which the engine discards).
    const startAt = new Date();
    startAt.setDate(startAt.getDate() - 1);
    startAt.setHours(22, 0, 0, 0);
    const endAt = new Date();
    endAt.setHours(10, 0, 0, 0);
    prisma.externalCalendarBlock.findMany.mockResolvedValue([
      { title: 'Overnight on-call', startAt, endAt },
    ]);

    const { plan } = await service.replanOnDayStart('user-1');

    expect(plan.blocks).toMatchObject([{ taskId: 'a', start: '10:00' }]);
  });

  it('rebuilds candidates with the documented T2 criterion (doDate today or undated+due<=7d)', async () => {
    const now = Date.now();
    const in2d = new Date(now + 2 * 24 * 60 * 60 * 1000);
    const in30d = new Date(now + 30 * 24 * 60 * 60 * 1000);
    repos().findByOwnerId.mockResolvedValue([
      openTask('today', { doDate: new Date() }),
      openTask('undated-due-soon', { doDate: null, dueDate: in2d }),
      openTask('undated-due-late', { doDate: null, dueDate: in30d }),
      openTask('other-day', { doDate: in2d }),
      openTask('done', { doDate: new Date(), status: 'COMPLETED' }),
    ]);

    const { plan } = await service.replanOnDayStart('user-1');
    const ids = plan.blocks.map((b) => b.taskId);

    expect(ids).toContain('today');
    expect(ids).toContain('undated-due-soon');
    expect(ids).not.toContain('undated-due-late');
    expect(ids).not.toContain('other-day');
    expect(ids).not.toContain('done');
  });

  it('uses the EMPTY_PLAN default when no previous plan is passed', async () => {
    repos().findByOwnerId.mockResolvedValue([openTask('a')]);
    const { changes } = await service.replanOnTaskCompleted('user-1', 'zzz', {
      previous: EMPTY_PLAN,
      frozenTaskIds: [],
    });
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({ taskId: 'a', type: 'added' });
  });
});
