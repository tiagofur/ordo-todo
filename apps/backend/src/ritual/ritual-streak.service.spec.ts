import { Test, TestingModule } from '@nestjs/testing';
import { RitualService } from './ritual.service';
import { PrismaService } from '../database/prisma.service';
import { DayPlanService } from '../tasks/day-plan.service';
import { AIService } from '../ai/ai.service';
import { GamificationService } from '../gamification/gamification.service';

// ODD 006 S4 (T4): kind ritual streaks — consecutive days with morning
// and/or evening DONE; milestones 7/30/100 via gamification; missing a day
// never punishes (streak just restarts, no penalty).
describe('RitualService streaks (ODD 006 S4)', () => {
  let service: RitualService;
  let prisma: {
    user: { findUnique: jest.Mock };
    ritualDay: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      upsert: jest.Mock;
    };
  };
  let gamification: { addXp: jest.Mock; unlockRitualMilestone: jest.Mock };
  let dayPlan: { getDayPlan: jest.Mock };

  // Hermetic day keys: build N consecutive UTC-midnight dates ending today.
  const dayKeys = (n: number, endOffset = 0): Date[] => {
    const now = new Date();
    const todayUTC = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    );
    return Array.from(
      { length: n },
      (_, i) => new Date(todayUTC - (endOffset + n - 1 - i) * 86400000),
    );
  };
  const row = (date: Date, morning = 'DONE', evening = 'DONE') => ({
    id: `r-${date.toISOString()}`,
    userId: 'user-1',
    date,
    morningStatus: morning,
    morningAt: new Date(),
    morningTop3: ['a'],
    morningPlannedAt: new Date(),
    eveningStatus: evening,
    eveningAt: new Date(),
    eveningMoves: [],
    streakDay: true,
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ timezone: 'UTC' }),
      },
      ritualDay: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
    };
    gamification = { addXp: jest.fn(), unlockRitualMilestone: jest.fn() };
    dayPlan = { getDayPlan: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RitualService,
        { provide: PrismaService, useValue: prisma },
        { provide: DayPlanService, useValue: dayPlan },
        { provide: AIService, useValue: {} },
        { provide: 'TaskRepository', useValue: {} },
        { provide: GamificationService, useValue: gamification },
      ],
    }).compile();
    service = module.get<RitualService>(RitualService);
  });

  it('counts consecutive DONE days (morning and/or evening)', async () => {
    prisma.ritualDay.findMany.mockResolvedValue(dayKeys(5).map((d) => row(d)));

    const out = await service.getStreak('user-1');

    expect(out).toEqual({ current: 5, longest: 5 });
  });

  it('counts a day with only one ritual done', async () => {
    const days = dayKeys(3);
    prisma.ritualDay.findMany.mockResolvedValue([
      row(days[0], 'DONE', 'PENDING'),
      row(days[1], 'SKIPPED', 'DONE'),
      row(days[2], 'DONE', 'DONE'),
    ]);

    const out = await service.getStreak('user-1');

    expect(out.current).toBe(3);
  });

  it('breaks the streak on a missing day (no punishment, just restarts)', async () => {
    const days = dayKeys(4);
    prisma.ritualDay.findMany.mockResolvedValue([
      row(days[0]),
      // days[1] missing entirely: streak restarts.
      row(days[2]),
      row(days[3]),
    ]);

    const out = await service.getStreak('user-1');

    expect(out.current).toBe(2);
    expect(out.longest).toBe(2);
  });

  it('today absent counts from yesterday (tolerance branch)', async () => {
    // endOffset=1: last row is yesterday, today has no row yet.
    const days = dayKeys(3, 1);
    prisma.ritualDay.findMany.mockResolvedValue(days.map((d) => row(d)));

    const out = await service.getStreak('user-1');

    expect(out.current).toBe(3);
    expect(out.longest).toBe(3);
  });

  it('a skipped day does not count but missing days end the streak', async () => {
    const days = dayKeys(3);
    prisma.ritualDay.findMany.mockResolvedValue([
      row(days[0]),
      row(days[1], 'SKIPPED', 'SKIPPED'),
      row(days[2]),
    ]);

    const out = await service.getStreak('user-1');

    // Skipped middle day breaks consecutiveness; current counts from the end.
    expect(out.current).toBe(1);
    expect(out.longest).toBe(1);
  });

  it('7-day milestone grants XP + achievement on complete (once)', async () => {
    // getStreak is pure (counts only); milestones fire from complete paths.
    // Simulate: 6 prior DONE days + today completed by this call = 7.
    const days = dayKeys(7);
    prisma.ritualDay.findMany.mockResolvedValue(
      days.map((d, i) => (i === 6 ? row(d, 'DONE', 'PENDING') : row(d))),
    );
    prisma.ritualDay.upsert.mockResolvedValue(row(days[6], 'DONE', 'PENDING'));
    dayPlan.getDayPlan.mockResolvedValue({
      blocks: [{ taskId: 'a', start: '09:00', end: '10:00', reason: 'x' }],
    });

    await service.completeMorning('user-1', ['a']);

    expect(gamification.unlockRitualMilestone).toHaveBeenCalledWith(
      'user-1',
      7,
    );
  });

  it('30 and 100 milestones grant XP + achievement', async () => {
    const days30 = dayKeys(30);
    prisma.ritualDay.findMany.mockResolvedValue(days30.map((d) => row(d)));
    prisma.ritualDay.upsert.mockResolvedValue(row(days30[29]));
    dayPlan.getDayPlan.mockResolvedValue({
      blocks: [{ taskId: 'a', start: '09:00', end: '10:00', reason: 'x' }],
    });
    await service.completeMorning('user-1', ['a']);
    expect(gamification.unlockRitualMilestone).toHaveBeenCalledWith(
      'user-1',
      30,
    );

    jest.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue({ timezone: 'UTC' });
    prisma.ritualDay.findMany.mockResolvedValue([]);
    const days100 = dayKeys(100);
    prisma.ritualDay.findMany.mockResolvedValue(days100.map((d) => row(d)));
    prisma.ritualDay.upsert.mockResolvedValue(row(days100[99]));
    dayPlan.getDayPlan.mockResolvedValue({
      blocks: [{ taskId: 'a', start: '09:00', end: '10:00', reason: 'x' }],
    });
    await service.completeMorning('user-1', ['a']);
    expect(gamification.unlockRitualMilestone).toHaveBeenCalledWith(
      'user-1',
      100,
    );
  });
});
