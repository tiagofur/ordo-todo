/**
 * Pomodoro cycle engine (ODD 014, T1/S1).
 *
 * Pure functions implementing the Pomodoro contract. No React, no I/O,
 * no Date.now(), no Node APIs — safe to import from web, desktop and mobile.
 * All durations in config are minutes; all computations return seconds.
 */
import {
  DEFAULT_POMODORO_SETTINGS,
  TIMER_LIMITS,
} from '../../shared/constants/timer.constants';
import type {
  CycleState,
  EngineConfig,
  EngineMode,
  PhaseResult,
  RemainingInput,
} from './types';

/** Default cycle configuration, aligned with the canonical Pomodoro settings. */
export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  workDuration: DEFAULT_POMODORO_SETTINGS.workDuration,
  shortBreakDuration: DEFAULT_POMODORO_SETTINGS.shortBreakDuration,
  longBreakDuration: DEFAULT_POMODORO_SETTINGS.longBreakDuration,
  pomodorosUntilLongBreak:
    DEFAULT_POMODORO_SETTINGS.pomodorosUntilLongBreak,
  autoStartBreaks: DEFAULT_POMODORO_SETTINGS.autoStartBreaks,
  autoStartPomodoros: DEFAULT_POMODORO_SETTINGS.autoStartPomodoros,
};

function clampInt(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(value)));
}

function clampCount(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.floor(value));
}

/**
 * Normalize a partial config: fill missing values with defaults and clamp
 * every field into TIMER_LIMITS. Never throws.
 */
export function clampConfig(partial: Partial<EngineConfig>): EngineConfig {
  return {
    workDuration: clampInt(
      partial.workDuration,
      TIMER_LIMITS.MIN_DURATION,
      TIMER_LIMITS.MAX_DURATION,
      DEFAULT_ENGINE_CONFIG.workDuration,
    ),
    shortBreakDuration: clampInt(
      partial.shortBreakDuration,
      TIMER_LIMITS.MIN_DURATION,
      TIMER_LIMITS.MAX_DURATION,
      DEFAULT_ENGINE_CONFIG.shortBreakDuration,
    ),
    longBreakDuration: clampInt(
      partial.longBreakDuration,
      TIMER_LIMITS.MIN_DURATION,
      TIMER_LIMITS.MAX_DURATION,
      DEFAULT_ENGINE_CONFIG.longBreakDuration,
    ),
    pomodorosUntilLongBreak: clampInt(
      partial.pomodorosUntilLongBreak,
      TIMER_LIMITS.MIN_POMODOROS_UNTIL_LONG_BREAK,
      TIMER_LIMITS.MAX_POMODOROS_UNTIL_LONG_BREAK,
      DEFAULT_ENGINE_CONFIG.pomodorosUntilLongBreak,
    ),
    autoStartBreaks:
      partial.autoStartBreaks ?? DEFAULT_ENGINE_CONFIG.autoStartBreaks,
    autoStartPomodoros:
      partial.autoStartPomodoros ?? DEFAULT_ENGINE_CONFIG.autoStartPomodoros,
  };
}

/** Duration in seconds for a phase under the given config. */
export function durationForMode(
  mode: EngineMode,
  config: EngineConfig,
): number {
  const safe = clampConfig(config);
  switch (mode) {
    case 'WORK':
      return safe.workDuration * 60;
    case 'SHORT_BREAK':
      return safe.shortBreakDuration * 60;
    case 'LONG_BREAK':
      return safe.longBreakDuration * 60;
  }
}

/**
 * Next phase after `mode`, given the pomodoros completed so far.
 * Completing WORK closes one more pomodoro: when the new total is a multiple
 * of pomodorosUntilLongBreak, the next phase is LONG_BREAK.
 */
export function nextMode(
  mode: EngineMode,
  completedPomodoros: number,
  config: EngineConfig,
): EngineMode {
  if (mode !== 'WORK') {
    return 'WORK';
  }
  const safe = clampConfig(config);
  const nextTotal = clampCount(completedPomodoros) + 1;
  return nextTotal % safe.pomodorosUntilLongBreak === 0
    ? 'LONG_BREAK'
    : 'SHORT_BREAK';
}

/**
 * Complete the current phase: returns the upcoming phase, the updated counter
 * (+1 only when completing WORK) and the upcoming phase duration in seconds.
 */
export function completePhase(
  mode: EngineMode,
  completedPomodoros: number,
  config: EngineConfig,
): PhaseResult {
  const safe = clampConfig(config);
  const count = clampCount(completedPomodoros);

  if (mode === 'WORK') {
    const next = nextMode('WORK', count, safe);
    return {
      nextMode: next,
      completedPomodoros: count + 1,
      durationSeconds: durationForMode(next, safe),
      autoStart: safe.autoStartBreaks,
    };
  }

  return {
    nextMode: 'WORK',
    completedPomodoros: count,
    durationSeconds: durationForMode('WORK', safe),
    autoStart: safe.autoStartPomodoros,
  };
}

function toMs(value: Date | number): number {
  const ms = value instanceof Date ? value.getTime() : value;
  return typeof ms === 'number' && Number.isFinite(ms) ? ms : NaN;
}

/**
 * Remaining seconds for a phase from wall-clock timestamps.
 * Discounts paused time; clamps to [0, duration].
 */
export function remainingSeconds(input: RemainingInput): number {
  const duration = durationForMode(input.mode, input.config);
  const startedMs = toMs(input.startedAt);
  const nowMs = toMs(input.now);
  if (!Number.isFinite(startedMs) || !Number.isFinite(nowMs)) {
    return duration;
  }
  const elapsed = Math.max(0, Math.floor((nowMs - startedMs) / 1000));
  const paused =
    typeof input.totalPauseSeconds === 'number' &&
    Number.isFinite(input.totalPauseSeconds)
      ? Math.max(0, Math.floor(input.totalPauseSeconds))
      : 0;
  return Math.min(duration, Math.max(0, duration - elapsed + paused));
}

/**
 * Adopt a config patch without breaking the active cycle (I10):
 * mode, countdown and counter are preserved; new durations apply to future
 * phases only. Out-of-range values are clamped.
 */
export function applyConfigChange(
  current: CycleState,
  patch: Partial<EngineConfig>,
): CycleState {
  return {
    ...current,
    config: clampConfig({ ...current.config, ...patch }),
  };
}

/**
 * Reset the current phase to its full duration, staying in the same phase
 * (I4: resetting during a break stays in the break, never jumps to WORK).
 */
export function resetPhase(state: CycleState): CycleState {
  return {
    ...state,
    timeLeftSeconds: durationForMode(state.mode, state.config),
  };
}
