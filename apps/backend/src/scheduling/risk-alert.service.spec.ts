import { Test, TestingModule } from '@nestjs/testing';
import { Task } from '@ordo-todo/core';
// Pin server TZ so "today" math is hermetic (same pattern as T3 specs).
process.env.TZ = 'America/Mexico_City';
import { RiskAlertService } from './risk-alert.service';
import { SchedulingService } from './scheduling.service';
import { PrismaService } from '../database/prisma.service';
import type { DayPlan } from './day-planner';

// ODD 005 S4 (T4): RiskAlertService wraps the pure assessRisks with the live
// plan (via SchedulingService.replanOnDayStart, in-memory) + task due dates,
// and notifies deadline risks proactively (dedup by type+resourceId).
describe('RiskAlertService (ODD 005 S4)', () => {
  let service: RiskAlertService;
  let prisma: {
    user: { findUnique: jest.Mock; findMany: jest.Mock };
    notification: { findFirst: jest.Mock; create: jest.Mock };
  };
  let scheduling: { replanOnDayStart: jest.Mock };
  let taskRepo: { findByOwnerId: jest.Mock };

  const TZ = 'America/Mexico_City';
  // Hermetic wall-clock helper (precedent: scheduling-triggers.spec.ts):
  // instant of HH:MM on "today" (or ±days) in CDMX, process-TZ independent.
  // setHours/new Date(y,m,d) silently shift when TZ != CDMX — never used here.
  const cdmxOffsetMs = (around: Date): number => {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: TZ,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const parts = dtf.formatToParts(around);
    const get = (t: string): number =>
      Number(parts.find((p) => p.type === t)?.value ?? 0);
    const wallAsUtc = Date.UTC(
      get('year'),
      get('month') - 1,
      get('day'),
      get('hour') % 24,
      get('minute'),
      get('second'),
    );
    return wallAsUtc - around.getTime();
  };
  const cdmxAt = (dayOffset: number, h: number, m = 0): Date => {
    const now = new Date();
    const todayKey = new Intl.DateTimeFormat('en-CA', {
      timeZone: TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    const [y, mo, d] = todayKey.split('-').map(Number);
    const guess = new Date(Date.UTC(y, mo - 1, d + dayOffset, h, m, 0));
    return new Date(guess.getTime() - cdmxOffsetMs(guess));
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
      ...overrides,
    });

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ timezone: TZ }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      notification: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'n1' }),
      },
    };
    scheduling = { replanOnDayStart: jest.fn() };
    taskRepo = { findByOwnerId: jest.fn().mockResolvedValue([]) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RiskAlertService,
        { provide: SchedulingService, useValue: scheduling },
        { provide: 'TaskRepository', useValue: taskRepo },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<RiskAlertService>(RiskAlertService);
  });

  it('assessForUser maps an overloaded live plan to an overload alert', async () => {
    const plan: DayPlan = {
      blocks: [{ taskId: 'a', start: '09:00', end: '10:00', reason: 'seed' }],
      unscheduled: [{ taskId: 'b', reason: 'no free slot fits today' }],
    };
    scheduling.replanOnDayStart.mockResolvedValue({ plan, changes: [] });
    taskRepo.findByOwnerId.mockResolvedValue([
      openTask('a'),
      openTask('b', { title: 'Big report' }),
    ]);

    const alerts = await service.assessForUser('user-1');

    expect(scheduling.replanOnDayStart).toHaveBeenCalledWith('user-1');
    const overload = alerts.filter((a) => a.kind === 'overload');
    expect(overload).toHaveLength(1);
    expect(overload[0].taskIds).toEqual(['b']);
    expect(overload[0].options.length).toBeGreaterThanOrEqual(2);
  });

  it('assessForUser flags a dueDate in 2 days with no room (TZ-hermetic)', async () => {
    scheduling.replanOnDayStart.mockResolvedValue({
      plan: {
        blocks: [],
        unscheduled: [{ taskId: 'b', reason: 'no free slot fits today' }],
      },
      changes: [],
    });
    taskRepo.findByOwnerId.mockResolvedValue([
      openTask('b', { title: 'Renew cert', dueDate: cdmxAt(2, 12) }),
    ]);

    const alerts = await service.assessForUser('user-1');

    const deadlines = alerts.filter((a) => a.kind === 'deadline-at-risk');
    expect(deadlines).toHaveLength(1);
    expect(deadlines[0].taskIds).toEqual(['b']);
    expect(deadlines[0].options.length).toBeGreaterThanOrEqual(2);
  });

  it('notifyDeadlineRisks persists once per task and dedups repeats', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 'user-1' }]);
    scheduling.replanOnDayStart.mockResolvedValue({
      plan: { blocks: [], unscheduled: [] },
      changes: [],
    });
    taskRepo.findByOwnerId.mockResolvedValue([
      openTask('b', { title: 'Renew cert', dueDate: cdmxAt(1, 12) }),
    ]);

    await service.notifyDeadlineRisks();

    expect(prisma.notification.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'user-1',
          type: 'DUE_DATE_APPROACHING',
          resourceId: 'b',
        }),
      }),
    );
    expect(prisma.notification.create).toHaveBeenCalledTimes(1);

    // Second run within 24h: existing notification -> no duplicate.
    prisma.notification.findFirst.mockResolvedValue({ id: 'n1' });
    prisma.notification.create.mockClear();
    await service.notifyDeadlineRisks();
    expect(prisma.notification.create).not.toHaveBeenCalled();
  });

  it('notifyDeadlineRisks uses NotificationsService when it resolves (@Optional)', async () => {
    const notifications = { create: jest.fn().mockResolvedValue({}) };
    const withNotif = new RiskAlertService(
      scheduling as unknown as SchedulingService,
      taskRepo as never,
      prisma as unknown as PrismaService,
      notifications as never,
    );

    prisma.user.findMany.mockResolvedValue([{ id: 'user-1' }]);
    scheduling.replanOnDayStart.mockResolvedValue({
      plan: { blocks: [], unscheduled: [] },
      changes: [],
    });
    taskRepo.findByOwnerId.mockResolvedValue([
      openTask('b', { title: 'Renew cert', dueDate: cdmxAt(1, 12) }),
    ]);

    await withNotif.notifyDeadlineRisks();

    expect(notifications.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        type: 'DUE_DATE_APPROACHING',
        resourceId: 'b',
      }),
    );
    expect(prisma.notification.create).not.toHaveBeenCalled();
  });
});
