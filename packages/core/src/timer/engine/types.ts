/**
 * Pomodoro engine types (ODD 014, T1/S1).
 *
 * Pure domain types for the Pomodoro cycle. No React, no I/O, no Node APIs —
 * safe to import from web, desktop and mobile.
 */

/** Phases of the Pomodoro cycle. IDLE/CONTINUOUS live in the hooks, not the engine. */
export type EngineMode = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';

/** Cycle configuration. Durations in minutes; integers expected. */
export interface EngineConfig {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  pomodorosUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

/** Result of completing a phase: what comes next and how long it lasts. */
export interface PhaseResult {
  nextMode: EngineMode;
  completedPomodoros: number;
  durationSeconds: number;
  /** Whether the upcoming phase should start automatically (from autoStart flags). */
  autoStart: boolean;
}

/** Minimal cycle state: current phase + countdown + counter + config. */
export interface CycleState {
  mode: EngineMode;
  timeLeftSeconds: number;
  completedPomodoros: number;
  config: EngineConfig;
}

/** Input for the remaining-time computation. */
export interface RemainingInput {
  startedAt: Date | number;
  now: Date | number;
  /** Seconds already spent paused (never negative after clamping). */
  totalPauseSeconds: number;
  mode: EngineMode;
  config: EngineConfig;
}
