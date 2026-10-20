/**
 * Pomodoro engine contract tests (ODD 014, T1/S1).
 *
 * These tests encode the Pomodoro contract invariants that the pure engine
 * must guarantee, independent of any React hook or platform:
 * I1 (WORK always transitions to BREAK), I2 (long break every N),
 * I4 (stop/reset in break stays in break), I5 (pauses don't lose time),
 * I10 (config change doesn't break the active cycle).
 */
import {
  DEFAULT_ENGINE_CONFIG,
  applyConfigChange,
  clampConfig,
  completePhase,
  durationForMode,
  nextMode,
  remainingSeconds,
  resetPhase,
  type CycleState,
  type EngineConfig,
} from '../index';

const config: EngineConfig = { ...DEFAULT_ENGINE_CONFIG };
const configN2: EngineConfig = {
  ...DEFAULT_ENGINE_CONFIG,
  pomodorosUntilLongBreak: 2,
};

describe('completePhase', () => {
  it('I1: completing WORK transitions to SHORT_BREAK with break duration (never WORK/25:00)', () => {
    const result = completePhase('WORK', 0, config);
    expect(result.nextMode).toBe('SHORT_BREAK');
    expect(result.completedPomodoros).toBe(1);
    expect(result.durationSeconds).toBe(5 * 60);
  });

  it('I2: 4th pomodoro (N=4) transitions to LONG_BREAK', () => {
    const result = completePhase('WORK', 3, config);
    expect(result.nextMode).toBe('LONG_BREAK');
    expect(result.completedPomodoros).toBe(4);
    expect(result.durationSeconds).toBe(15 * 60);
  });

  it('I2: pomodoros 1-3 (N=4) transition to SHORT_BREAK', () => {
    for (const completed of [0, 1, 2]) {
      expect(completePhase('WORK', completed, config).nextMode).toBe(
        'SHORT_BREAK',
      );
    }
  });

  it('I2: custom N=2 — 2nd pomodoro transitions to LONG_BREAK', () => {
    expect(completePhase('WORK', 0, configN2).nextMode).toBe('SHORT_BREAK');
    expect(completePhase('WORK', 1, configN2).nextMode).toBe('LONG_BREAK');
  });

  it('I2: completing a break returns to WORK without incrementing the counter', () => {
    for (const mode of ['SHORT_BREAK', 'LONG_BREAK'] as const) {
      const result = completePhase(mode, 2, config);
      expect(result.nextMode).toBe('WORK');
      expect(result.completedPomodoros).toBe(2);
      expect(result.durationSeconds).toBe(25 * 60);
    }
  });

  it('propagates autoStart flags for the upcoming phase', () => {
    const auto: EngineConfig = {
      ...config,
      autoStartBreaks: true,
      autoStartPomodoros: true,
    };
    expect(completePhase('WORK', 0, auto).autoStart).toBe(true);
    expect(completePhase('SHORT_BREAK', 1, auto).autoStart).toBe(true);
    expect(completePhase('WORK', 0, config).autoStart).toBe(false);
  });
});

describe('nextMode', () => {
  it('returns WORK after any break', () => {
    expect(nextMode('SHORT_BREAK', 5, config)).toBe('WORK');
    expect(nextMode('LONG_BREAK', 4, config)).toBe('WORK');
  });

  it('returns LONG_BREAK exactly when the next pomodoro closes the cycle', () => {
    expect(nextMode('WORK', 2, config)).toBe('SHORT_BREAK');
    expect(nextMode('WORK', 3, config)).toBe('LONG_BREAK');
  });

  it('clamps invalid cycle length instead of producing NaN', () => {
    const bad: EngineConfig = { ...config, pomodorosUntilLongBreak: 0 };
    expect(nextMode('WORK', 0, bad)).toBe('SHORT_BREAK');
  });
});

describe('durationForMode', () => {
  it('returns configured durations in seconds', () => {
    expect(durationForMode('WORK', config)).toBe(25 * 60);
    expect(durationForMode('SHORT_BREAK', config)).toBe(5 * 60);
    expect(durationForMode('LONG_BREAK', config)).toBe(15 * 60);
  });
});

describe('remainingSeconds', () => {
  const startedAt = new Date('2026-10-20T10:00:00.000Z').getTime();

  it('I5: counts elapsed wall-clock time against the phase duration', () => {
    expect(
      remainingSeconds({
        startedAt,
        now: startedAt + 60_000,
        totalPauseSeconds: 0,
        mode: 'WORK',
        config,
      }),
    ).toBe(25 * 60 - 60);
  });

  it('I5: discounts paused time', () => {
    expect(
      remainingSeconds({
        startedAt,
        now: startedAt + 120_000,
        totalPauseSeconds: 30,
        mode: 'WORK',
        config,
      }),
    ).toBe(25 * 60 - 90);
  });

  it('accepts Date objects', () => {
    expect(
      remainingSeconds({
        startedAt: new Date(startedAt),
        now: new Date(startedAt + 10_000),
        totalPauseSeconds: 0,
        mode: 'SHORT_BREAK',
        config,
      }),
    ).toBe(5 * 60 - 10);
  });

  it('clamps at zero on overrun and ignores negative pauses', () => {
    expect(
      remainingSeconds({
        startedAt,
        now: startedAt + 3600_000,
        totalPauseSeconds: 0,
        mode: 'WORK',
        config,
      }),
    ).toBe(0);
    expect(
      remainingSeconds({
        startedAt,
        now: startedAt + 60_000,
        totalPauseSeconds: -999,
        mode: 'WORK',
        config,
      }),
    ).toBe(25 * 60 - 60);
  });
});

describe('applyConfigChange', () => {
  const active: CycleState = {
    mode: 'WORK',
    timeLeftSeconds: 100,
    completedPomodoros: 2,
    config,
  };

  it('I10: preserves the active cycle while adopting the new config', () => {
    const next = applyConfigChange(active, { workDuration: 50 });
    expect(next.mode).toBe('WORK');
    expect(next.timeLeftSeconds).toBe(100);
    expect(next.completedPomodoros).toBe(2);
    expect(next.config.workDuration).toBe(50);
  });

  it('I10: new durations apply to future phases, not the running one', () => {
    const next = applyConfigChange(active, { workDuration: 50 });
    expect(next.timeLeftSeconds).toBe(100);
    expect(durationForMode('WORK', next.config)).toBe(50 * 60);
  });

  it('clamps out-of-range values', () => {
    const next = applyConfigChange(active, {
      workDuration: 0,
      pomodorosUntilLongBreak: 99,
    });
    expect(next.config.workDuration).toBe(1);
    expect(next.config.pomodorosUntilLongBreak).toBe(10);
  });
});

describe('resetPhase', () => {
  it('I4: resetting during a break stays in the break with full break duration', () => {
    const inBreak: CycleState = {
      mode: 'SHORT_BREAK',
      timeLeftSeconds: 42,
      completedPomodoros: 1,
      config,
    };
    const next = resetPhase(inBreak);
    expect(next.mode).toBe('SHORT_BREAK');
    expect(next.timeLeftSeconds).toBe(5 * 60);
    expect(next.completedPomodoros).toBe(1);
  });

  it('resetting WORK restores the full work duration', () => {
    const inWork: CycleState = {
      mode: 'WORK',
      timeLeftSeconds: 42,
      completedPomodoros: 1,
      config,
    };
    expect(resetPhase(inWork).timeLeftSeconds).toBe(25 * 60);
  });
});

describe('clampConfig', () => {
  it('fills missing values with defaults', () => {
    expect(clampConfig({})).toEqual(DEFAULT_ENGINE_CONFIG);
  });

  it('falls back on NaN/Infinity and rounds integers', () => {
    const clamped = clampConfig({
      workDuration: NaN,
      shortBreakDuration: Infinity,
      longBreakDuration: 7.6,
    });
    expect(clamped.workDuration).toBe(25);
    expect(clamped.shortBreakDuration).toBe(5);
    expect(clamped.longBreakDuration).toBe(8);
  });

  it('preserves valid values untouched', () => {
    const custom: EngineConfig = {
      workDuration: 50,
      shortBreakDuration: 10,
      longBreakDuration: 30,
      pomodorosUntilLongBreak: 3,
      autoStartBreaks: true,
      autoStartPomodoros: false,
    };
    expect(clampConfig(custom)).toEqual(custom);
  });
});
