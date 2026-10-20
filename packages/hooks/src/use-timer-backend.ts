/**
 * Shared timer hook for Ordo-Todo (ODD 014, T2a/S2).
 *
 * The single `useTimerBackend` implementation for web, desktop and mobile.
 * Cycle logic is delegated to the pure engine (`@ordo-todo/core`); this hook
 * owns React state, the countdown interval and backend synchronization.
 *
 * Platform differences (toasts, sounds) are injected via props —
 * this module imports nothing from any app.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  DEFAULT_ENGINE_CONFIG,
  completePhase,
  durationForMode,
  nextMode,
  resetPhase,
  type EngineConfig,
  type EngineMode,
} from '@ordo-todo/core';

export type TimerBackendMode = EngineMode | 'CONTINUOUS';
export type TimerBackendType = 'POMODORO' | 'CONTINUOUS';
export type TimerBackendConfig = EngineConfig;

/** Minimal active-session shape the hook needs from the backend. */
export interface TimerBackendSession {
  type: TimerBackendMode;
  elapsedSeconds: number;
  isPaused: boolean;
  taskId?: string | null;
  pauseCount?: number;
  totalPauseTime?: number;
  currentPauseStart?: string | Date | null;
}

/** Backend operations, adapted per platform from React Query mutations. */
export interface TimerBackendApi {
  activeSession: TimerBackendSession | null;
  start: (input: { taskId?: string; type: TimerBackendMode }) => Promise<unknown>;
  stop: (input: { wasCompleted: boolean }) => Promise<unknown>;
  pause: (input: { pauseStartedAt: Date }) => Promise<unknown>;
  resume: (input: { pauseStartedAt: Date }) => Promise<unknown>;
  switchTask: (input: {
    newTaskId: string;
    type: TimerBackendMode;
    splitReason: string;
  }) => Promise<unknown>;
  refetch: () => Promise<unknown>;
}

/** UI feedback, adapted per platform (toast / sound / OS notification). */
export interface TimerBackendNotify {
  sessionComplete: (mode: TimerBackendMode) => void;
  autoStart: (mode: TimerBackendMode) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

/** Last closed session of the day, for initial turn derivation (I11/I12). */
export interface LastClosedSession {
  type: TimerBackendMode;
  endedAt: string | Date;
  wasCompleted: boolean;
}

export interface UseTimerBackendProps {
  type: TimerBackendType;
  config: TimerBackendConfig;
  taskId: string | null;
  api: TimerBackendApi;
  notify: TimerBackendNotify;
  /**
   * WORK sessions completed today per the backend (I3). Null while unknown
   * (query loading / error / offline) — the hook then counts session-locally
   * from zero until the server value arrives.
   */
  completedToday: number | null;
  /**
   * Most recent closed session (ODD 015, I11/I12). When there is no active
   * session and the user hasn't interacted yet, the initial turn is derived
   * from it: last WORK closed today → BREAK, last BREAK → WORK, anything
   * older than today (or null) → fresh WORK #1.
   */
  lastClosedSession?: LastClosedSession | null;
  onSessionComplete?: () => void;
}

export interface UseTimerBackendReturn {
  isRunning: boolean;
  isPaused: boolean;
  timeLeft: number;
  mode: TimerBackendMode;
  completedPomodoros: number;
  pauseCount: number;
  totalPauseTime: number;
  start: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: (wasCompleted?: boolean) => Promise<void>;
  skipToNext: () => Promise<void>;
  switchTask: (newTaskId: string) => Promise<void>;
  formatTime: (seconds: number) => string;
  getProgress: () => number;
  activeSession: TimerBackendSession | null;
}

function durationOf(mode: TimerBackendMode, config: TimerBackendConfig): number {
  if (mode === 'CONTINUOUS') return 0;
  return durationForMode(mode, config);
}

export function formatTimerBackendDisplay(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function isToday(value: string | Date): boolean {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.toDateString() === new Date().toDateString();
}

export function useTimerBackend({
  type,
  config,
  taskId,
  api,
  notify,
  completedToday,
  lastClosedSession = null,
  onSessionComplete,
}: UseTimerBackendProps): UseTimerBackendReturn {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() =>
    type === 'CONTINUOUS' ? 0 : durationOf('WORK', config),
  );
  const [mode, setMode] = useState<TimerBackendMode>(() =>
    type === 'CONTINUOUS' ? 'CONTINUOUS' : 'WORK',
  );
  // Optimistic session-local increments on top of the server count, so the
  // UI updates instantly while the backend confirms asynchronously.
  const [optimisticExtra, setOptimisticExtra] = useState(0);
  const [localPauseStartTime, setLocalPauseStartTime] = useState<Date | null>(
    null,
  );

  const serverCount = completedToday ?? 0;
  const completedPomodoros = serverCount + optimisticExtra;
  const completedPomodorosRef = useRef(completedPomodoros);
  completedPomodorosRef.current = completedPomodoros;

  // Absorb server confirmations: when the backend count grows, it includes
  // our optimistic completions — shrink the extra accordingly. When it drops
  // (new day / reset), clear the extra entirely.
  const prevServerCountRef = useRef(serverCount);
  useEffect(() => {
    const prev = prevServerCountRef.current;
    prevServerCountRef.current = serverCount;
    if (serverCount === prev) return;
    if (serverCount > prev) {
      setOptimisticExtra((extra) => Math.max(0, extra - (serverCount - prev)));
    } else {
      setOptimisticExtra(0);
    }
  }, [serverCount]);

  const isTransitioningRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /**
   * Local intent: set by skipToNext/stop when the user lands on a phase with
   * no backend session (manual transitions with autoStart off). While set,
   * the backend-sync effect must NOT reset the local mode — this is the
   * sync-reset guard (ODD 014 root cause).
   */
  const pendingModeRef = useRef<TimerBackendMode | null>(null);

  const modeRef = useRef(mode);
  modeRef.current = mode;
  const configRef = useRef(config);
  configRef.current = config;
  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;
  const typeRef = useRef(type);
  typeRef.current = type;

  const { activeSession } = api;

  const clearLocalInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Sync with the backend active session.
  useEffect(() => {
    if (activeSession) {
      pendingModeRef.current = null;
      setIsRunning(true);
      setIsPaused(activeSession.isPaused);

      if (activeSession.type === 'CONTINUOUS') {
        setTimeLeft(activeSession.elapsedSeconds);
        setMode('CONTINUOUS');
      } else {
        const remaining = Math.max(
          0,
          durationOf(activeSession.type, configRef.current) -
            activeSession.elapsedSeconds,
        );
        setTimeLeft(remaining);
        setMode(activeSession.type);
      }

      if (activeSession.isPaused && activeSession.currentPauseStart) {
        setLocalPauseStartTime(new Date(activeSession.currentPauseStart));
      } else {
        setLocalPauseStartTime(null);
      }
      return;
    }

    // No backend session: respect a pending local intent (post-transition
    // landing phase). Only reset to the initial state when there is no
    // intent and nothing is running locally.
    if (pendingModeRef.current) {
      setMode(pendingModeRef.current);
      setTimeLeft(durationOf(pendingModeRef.current, configRef.current));
      setIsRunning(false);
      setIsPaused(false);
      setLocalPauseStartTime(null);
      return;
    }
    setIsRunning(false);
    setIsPaused(false);
    setLocalPauseStartTime(null);
    if (type === 'CONTINUOUS') {
      setTimeLeft(0);
      setMode('CONTINUOUS');
    } else {
      setTimeLeft((prev) => {
        const current = modeRef.current;
        if (current === 'CONTINUOUS') {
          setMode('WORK');
          return durationOf('WORK', configRef.current);
        }
        return prev;
      });
    }
  }, [activeSession, type]);

  // Initial turn derivation (ODD 015, I11/I12): with no active session and
  // no user interaction yet, restore the turn from today's last closed
  // session so a restart never loses an earned break. Runs on every change
  // of its inputs until the first interaction (queries resolve async).
  const hasInteractedRef = useRef(false);
  useEffect(() => {
    if (type !== 'POMODORO') return;
    if (activeSession || hasInteractedRef.current || isTransitioningRef.current) return;
    if (pendingModeRef.current) return;
    if (
      !lastClosedSession ||
      !lastClosedSession.wasCompleted ||
      !isToday(lastClosedSession.endedAt)
    ) {
      return;
    }
    const closedType =
      lastClosedSession.type === 'CONTINUOUS' ? 'WORK' : lastClosedSession.type;
    // nextMode() adds +1 for the closing WORK itself, but the server count
    // already includes it — subtract to avoid double-counting.
    const countBeforeClose =
      closedType === 'WORK'
        ? Math.max(0, completedPomodorosRef.current - 1)
        : completedPomodorosRef.current;
    const derived = nextMode(
      closedType,
      countBeforeClose,
      configRef.current,
    );
    pendingModeRef.current = derived;
    setMode(derived);
    setTimeLeft(durationOf(derived, configRef.current));
    setIsRunning(false);
    setIsPaused(false);
  }, [activeSession, lastClosedSession, completedPomodoros, type]);

  // Midnight rollover watch (ODD 015, I12): if the local day changes while
  // idle with no active session, reset to a fresh WORK #1. A running or
  // paused cycle is never touched — it resolves when the phase closes.
  const dayRef = useRef(new Date().toDateString());
  useEffect(() => {
    const id = setInterval(() => {
      if (new Date().toDateString() === dayRef.current) return;
      dayRef.current = new Date().toDateString();
      if (api.activeSession || isRunningRef.current || isPausedRef.current) return;
      pendingModeRef.current = null;
      hasInteractedRef.current = false;
      setOptimisticExtra(0);
      if (typeRef.current !== 'CONTINUOUS') {
        setMode('WORK');
        setTimeLeft(durationOf('WORK', configRef.current));
      } else {
        setMode('CONTINUOUS');
        setTimeLeft(0);
      }
      setIsRunning(false);
      setIsPaused(false);
      setLocalPauseStartTime(null);
    }, 30_000);
    return () => clearInterval(id);
  }, [api]);

  // Adopt config changes without breaking an active cycle (I10): when idle,
  // refresh the current phase duration; when running, leave it untouched —
  // new durations apply to future phases via the engine.
  const initialConfigRef = useRef(config);
  useEffect(() => {
    if (activeSession || isRunning || isPaused) return;
    if (initialConfigRef.current === config) return;
    initialConfigRef.current = config;
    if (type === 'CONTINUOUS') {
      setTimeLeft(0);
      setMode('CONTINUOUS');
    } else if (modeRef.current === 'CONTINUOUS') {
      setTimeLeft(durationOf('WORK', config));
      setMode('WORK');
    } else {
      setTimeLeft(durationOf(modeRef.current, config));
    }
  }, [config, activeSession, isRunning, isPaused, type]);

  const start = useCallback(async () => {
    hasInteractedRef.current = true;
    pendingModeRef.current = null;
    try {
      await api.start({
        taskId: taskId ?? undefined,
        type: type === 'CONTINUOUS' ? 'CONTINUOUS' : modeRef.current,
      });
      setIsRunning(true);
      setIsPaused(false);
      await api.refetch();
      notify.success('Timer iniciado');
    } catch (error: unknown) {
      notify.error(
        error instanceof Error ? error.message : 'Error al iniciar timer',
      );
    }
  }, [api, notify, taskId, type]);

  const pause = useCallback(async () => {
    hasInteractedRef.current = true;
    const pauseStart = new Date();
    setLocalPauseStartTime(pauseStart);
    try {
      await api.pause({ pauseStartedAt: pauseStart });
      setIsPaused(true);
      setIsRunning(false);
      await api.refetch();
    } catch (error: unknown) {
      notify.error(
        error instanceof Error ? error.message : 'Error al pausar timer',
      );
    }
  }, [api, notify]);

  const resume = useCallback(async () => {
    if (!localPauseStartTime) return;
    try {
      await api.resume({ pauseStartedAt: localPauseStartTime });
      setIsPaused(false);
      setIsRunning(true);
      setLocalPauseStartTime(null);
      await api.refetch();
    } catch (error: unknown) {
      notify.error(
        error instanceof Error ? error.message : 'Error al reanudar timer',
      );
    }
  }, [api, localPauseStartTime, notify]);

  const stop = useCallback(
    async (wasCompleted: boolean = false) => {
      hasInteractedRef.current = true;
      clearLocalInterval();
      try {
        await api.stop({ wasCompleted });
      } catch (error: unknown) {
        // A failed stop must not leave the UI running against a dead session.
        notify.error(
          error instanceof Error ? error.message : 'Error al detener timer',
        );
      }
      const stoppedMode =
        type === 'CONTINUOUS' ? ('CONTINUOUS' as const) : modeRef.current;
      // I4: stopping stays in the current phase with its full duration —
      // the engine's resetPhase never jumps across phases.
      const reset =
        stoppedMode === 'CONTINUOUS'
          ? { timeLeftSeconds: 0 }
          : resetPhase({
              mode: stoppedMode,
              timeLeftSeconds: 0,
              completedPomodoros: completedPomodorosRef.current,
              config: configRef.current,
            });
      pendingModeRef.current = stoppedMode;
      setMode(stoppedMode);
      setTimeLeft(reset.timeLeftSeconds);
      setIsRunning(false);
      setIsPaused(false);
      setLocalPauseStartTime(null);
      await api.refetch().catch(() => undefined);
      onSessionComplete?.();
    },
    [api, clearLocalInterval, notify, onSessionComplete, type],
  );

  const skipToNext = useCallback(async () => {
    if (isTransitioningRef.current) return;
    hasInteractedRef.current = true;
    isTransitioningRef.current = true;
    clearLocalInterval();

    try {
      if (type === 'CONTINUOUS') {
        await api.stop({ wasCompleted: true });
        notify.sessionComplete('CONTINUOUS');
        pendingModeRef.current = 'CONTINUOUS';
        setIsRunning(false);
        setIsPaused(false);
        await api.refetch().catch(() => undefined);
        return;
      }

      const currentMode = modeRef.current === 'CONTINUOUS' ? 'WORK' : modeRef.current;
      const result = completePhase(
        currentMode,
        completedPomodorosRef.current,
        configRef.current,
      );
      // Optimistic increment only when a WORK phase completes (the engine
      // only bumps the counter for WORK). The server value absorbs it once
      // the stats query refetches after stop.
      if (currentMode === 'WORK') {
        setOptimisticExtra((extra) => extra + 1);
      }

      await api.stop({ wasCompleted: true });
      notify.sessionComplete(currentMode);

      // Land on the next phase BEFORE refetching: the sync effect will see
      // activeSession === null and must respect this local intent.
      pendingModeRef.current = result.nextMode;
      setMode(result.nextMode);
      setTimeLeft(result.durationSeconds);
      setIsRunning(false);
      setIsPaused(false);

      if (result.autoStart) {
        try {
          await api.start({
            taskId: taskId ?? undefined,
            type: result.nextMode,
          });
          pendingModeRef.current = null;
          setIsRunning(true);
          await api.refetch();
          notify.autoStart(result.nextMode);
        } catch (error: unknown) {
          notify.error('Error al auto-iniciar la siguiente fase');
        }
      } else {
        await api.refetch().catch(() => undefined);
      }
    } catch (error: unknown) {
      notify.error('Error al cambiar de modo');
    } finally {
      isTransitioningRef.current = false;
    }
  }, [api, clearLocalInterval, notify, taskId, type]);

  const skipToNextRef = useRef(skipToNext);
  skipToNextRef.current = skipToNext;
  const stopRef = useRef(stop);
  stopRef.current = stop;

  const switchTask = useCallback(
    async (newTaskId: string) => {
      try {
        await api.switchTask({
          newTaskId,
          type: type === 'CONTINUOUS' ? 'CONTINUOUS' : modeRef.current,
          splitReason: 'TASK_SWITCH',
        });
        await api.refetch();
        notify.success('Tarea cambiada');
      } catch (error: unknown) {
        notify.error(
          error instanceof Error ? error.message : 'Error al cambiar de tarea',
        );
      }
    },
    [api, notify, type],
  );

  // Wall-clock countdown / count-up (ODD 014 T5). Ticks recompute the
  // remaining time from a fixed deadline instead of decrementing by one, so
  // throttled timers (hidden tab, backgrounded app, locked screen) and
  // per-tick drift can never desync the clock: the first tick after a gap
  // lands on the correct value, or fires the transition if the phase
  // expired while suspended. Expiry fires synchronously in the tick — no
  // nested setTimeout.
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;
  // Deadline for POMODORO phases (ms epoch), or anchor for CONTINUOUS
  // count-up (Date.now() - elapsedSeconds * 1000 at (re)start).
  const deadlineRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning || isPaused || isTransitioningRef.current) {
      clearLocalInterval();
      return;
    }
    // (Re)anchor the deadline from the current remainder every time the
    // countdown (re)starts: start, resume, auto-start, backend sync.
    if (modeRef.current === 'CONTINUOUS') {
      deadlineRef.current = Date.now() - timeLeftRef.current * 1000;
    } else {
      deadlineRef.current = Date.now() + timeLeftRef.current * 1000;
    }
    intervalRef.current = setInterval(() => {
      const deadline = deadlineRef.current;
      if (deadline === null) return;
      if (modeRef.current === 'CONTINUOUS') {
        const elapsed = Math.max(0, Math.floor((Date.now() - deadline) / 1000));
        timeLeftRef.current = elapsed;
        setTimeLeft(elapsed);
        return;
      }
      const remaining = Math.max(
        0,
        Math.round((deadline - Date.now()) / 1000),
      );
      if (remaining <= 0) {
        clearLocalInterval();
        deadlineRef.current = null;
        timeLeftRef.current = 0;
        setTimeLeft(0);
        if (!isTransitioningRef.current) {
          if (type === 'POMODORO') {
            void skipToNextRef.current();
          } else {
            void stopRef.current(true);
          }
        }
        return;
      }
      timeLeftRef.current = remaining;
      setTimeLeft(remaining);
    }, 1000);
    return () => {
      clearLocalInterval();
    };
  }, [isRunning, isPaused, type, clearLocalInterval]);

  const formatTime = useCallback(
    (seconds: number) => formatTimerBackendDisplay(seconds),
    [],
  );

  const getProgress = useCallback(() => {
    const current = modeRef.current;
    if (current === 'CONTINUOUS') return 100;
    const total = durationOf(current, configRef.current);
    if (total <= 0) return 0;
    return ((total - timeLeft) / total) * 100;
  }, [timeLeft]);

  return {
    isRunning,
    isPaused,
    timeLeft,
    mode,
    completedPomodoros,
    pauseCount: activeSession?.pauseCount ?? 0,
    totalPauseTime: activeSession?.totalPauseTime ?? 0,
    start,
    pause,
    resume,
    stop,
    skipToNext,
    switchTask,
    formatTime,
    getProgress,
    activeSession,
  };
}

export { DEFAULT_ENGINE_CONFIG };
export type { EngineConfig, EngineMode };
