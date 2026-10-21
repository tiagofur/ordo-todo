import { Test, TestingModule } from '@nestjs/testing';
import { Task, TimeSession } from '@ordo-todo/core';
// Pin server TZ so date math is hermetic (same pattern as T3 specs).
process.env.TZ = 'America/Mexico_City';
import { DurationLearningService } from './duration-learning.service';

// ODD 005 S5 (T4): learn durations from real timer history.
// The service reads Work/CONTINUOUS sessions via TimerRepository (read-only)
// and crosses them with Task category/tags/priority via TaskRepository.
describe('DurationLearningService (ODD 005 S5)', () => {
  let service: DurationLearningService;
  let timerRepo: { findByUserIdAndDateRange: jest.Mock };
  let taskRepo: { findById: jest.Mock };

  const session = (
    id: string,
    taskId: string | undefined,
    durationMinutes: number | undefined,
    overrides: Record<string, unknown> = {},
  ): TimeSession =>
    new TimeSession({
      id,
      taskId,
      userId: 'user-1',
      startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endedAt:
        durationMinutes === undefined
          ? undefined
          : new Date(Date.now() - 23 * 60 * 60 * 1000),
      duration: durationMinutes,
      type: 'WORK',
      wasCompleted: true,
      wasInterrupted: false,
      ...overrides,
    });

  const task = (id: string, overrides: Record<string, unknown> = {}): Task =>
    new Task({
      id,
      title: id,
      status: 'COMPLETED',
      priority: 'MEDIUM',
      projectId: 'p1',
      ownerId: 'user-1',
      isDeleted: false,
      estimatedMinutes: 30,
      ...overrides,
    });

  beforeEach(async () => {
    jest.clearAllMocks();
    timerRepo = { findByUserIdAndDateRange: jest.fn().mockResolvedValue([]) };
    taskRepo = { findById: jest.fn().mockResolvedValue(null) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DurationLearningService,
        { provide: 'TimerRepository', useValue: timerRepo },
        { provide: 'TaskRepository', useValue: taskRepo },
      ],
    }).compile();
    service = module.get<DurationLearningService>(DurationLearningService);
  });

  it('with enough same-category history, predicts the median (outliers trimmed)', async () => {
    // 6 completed dev sessions: 38,40,42,44,46 + a 300min outlier.
    // With trim: median of 5 = 42 -> 40. Without trim: median of 6 = 43 -> 45.
    // The exact assertion pins the trim (a broken/missing IQR fails).
    const durations = [38, 40, 42, 44, 46, 300];
    timerRepo.findByUserIdAndDateRange.mockResolvedValue(
      durations.map((d, i) => session(`s${i}`, `t${i}`, d)),
    );
    taskRepo.findById.mockImplementation((id: string) =>
      Promise.resolve(task(id, { tags: [{ name: 'dev', color: '#000' }] })),
    );

    const out = await service.predict('user-1', { category: 'dev' });

    expect(out.source).toBe('history');
    expect(out.estimatedMinutes).toBe(40);
    expect(out.sampleSize).toBe(6);
    expect(out.confidence).not.toBe('LOW');
    expect(out.reasoning).toMatch(/atípicas/i);
  });

  it('mean error vs baseline improves with real history (ODD S5 check)', async () => {
    // Baseline: the old static default (30min). History says ~120min.
    const durations = [110, 115, 120, 125, 130];
    timerRepo.findByUserIdAndDateRange.mockResolvedValue(
      durations.map((d, i) => session(`s${i}`, `t${i}`, d)),
    );
    taskRepo.findById.mockImplementation((id: string) =>
      Promise.resolve(task(id)),
    );

    const out = await service.predict('user-1', {});
    const baseline = 30;
    const actualMean = 120;

    expect(out.source).toBe('history');
    expect(Math.abs(out.estimatedMinutes - actualMean)).toBeLessThan(
      Math.abs(baseline - actualMean),
    );
  });

  it('with no history, returns an honest fallback (never invents precision)', async () => {
    timerRepo.findByUserIdAndDateRange.mockResolvedValue([]);

    const out = await service.predict('user-1', {});

    expect(out.source).toBe('fallback');
    expect(out.confidence).toBe('LOW');
    expect(out.sampleSize).toBe(0);
    expect(out.estimatedMinutes).toBe(30);
    expect(out.reasoning).toMatch(/sin datos suficientes/i);
  });

  it('with too few comparable sessions, falls back honestly', async () => {
    // 2 dev sessions (< MIN_COMPARABLE=5) + 4 noise sessions from other tags:
    // 6 total, so a matching that ignores the filter would return history.
    // Correct behavior returns fallback (only 2 comparable).
    timerRepo.findByUserIdAndDateRange.mockResolvedValue([
      session('s1', 't1', 60),
      session('s2', 't2', 65),
      session('s3', 't3', 20),
      session('s4', 't4', 25),
      session('s5', 't5', 30),
      session('s6', 't6', 35),
    ]);
    taskRepo.findById.mockImplementation((id: string) =>
      Promise.resolve(
        task(id, {
          tags: [
            {
              name: id === 't1' || id === 't2' ? 'dev' : 'other',
              color: '#000',
            },
          ],
        }),
      ),
    );

    const out = await service.predict('user-1', { category: 'dev' });

    expect(out.source).toBe('fallback');
    expect(out.confidence).toBe('LOW');
    expect(out.reasoning).toMatch(/sin datos suficientes/i);
  });

  it('ignores unfinished sessions and non-work session types', async () => {
    timerRepo.findByUserIdAndDateRange.mockResolvedValue([
      session('s1', 't1', undefined, { endedAt: undefined }), // still running
      session('s2', 't2', 15, { type: 'SHORT_BREAK' }), // a break, not work
      ...[50, 52, 55, 58, 60].map((d, i) => session(`w${i}`, `t${i}`, d)),
    ]);
    taskRepo.findById.mockImplementation((id: string) =>
      Promise.resolve(task(id)),
    );

    const out = await service.predict('user-1', {});

    expect(out.source).toBe('history');
    expect(out.sampleSize).toBe(5);
    expect(out.estimatedMinutes).toBeGreaterThanOrEqual(50);
    expect(out.estimatedMinutes).toBeLessThanOrEqual(60);
  });

  it('matches category against tag names and project names', async () => {
    timerRepo.findByUserIdAndDateRange.mockResolvedValue(
      [44, 45, 46, 47, 48].map((d, i) => session(`s${i}`, `t${i}`, d)),
    );
    taskRepo.findById.mockImplementation((id: string) =>
      Promise.resolve(
        task(id, {
          tags: [],
          project: { id: 'p9', name: 'Backend API', color: '#000' },
        }),
      ),
    );

    const out = await service.predict('user-1', { category: 'backend api' });

    expect(out.source).toBe('history');
    expect(out.sampleSize).toBe(5);
  });

  it('confidence grows with sample size (documented ladder)', async () => {
    const run = async (n: number) => {
      timerRepo.findByUserIdAndDateRange.mockResolvedValue(
        Array.from({ length: n }, (_, i) =>
          session(`s${i}`, `t${i}`, 45 + (i % 5)),
        ),
      );
      taskRepo.findById.mockImplementation((id: string) =>
        Promise.resolve(task(id)),
      );
      return service.predict('user-1', {});
    };

    expect((await run(4)).confidence).toBe('LOW');
    expect((await run(4)).source).toBe('fallback');
    expect((await run(5)).confidence).toBe('MEDIUM');
    expect((await run(14)).confidence).toBe('MEDIUM');
    expect((await run(15)).confidence).toBe('HIGH');
  });

  it('treats a blank-only category as no filter (all history counts)', async () => {
    timerRepo.findByUserIdAndDateRange.mockResolvedValue(
      [44, 45, 46, 47, 48].map((d, i) => session(`s${i}`, `t${i}`, d)),
    );
    taskRepo.findById.mockImplementation((id: string) =>
      Promise.resolve(task(id)),
    );

    const out = await service.predict('user-1', { category: '   ' });

    expect(out.source).toBe('history');
    expect(out.sampleSize).toBe(5);
  });
});
