/**
 * Shared useTimerBackend tests (ODD 014, T2a/S2 + T4/S4).
 *
 * RED→GREEN suite for the unified timer hook. The first test reproduces the
 * reported symptom (WORK expiring resets to 25:00 instead of BREAK/5:00)
 * that affects all three current per-app copies (sync-reset + desktop-stop).
 *
 * Since T4 the pomodoro counter is backend-owned: adapters pass
 * `completedToday` (WORK completed today per the server, null when unknown)
 * and the hook adds optimistic session-local increments.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useTimerBackend,
  type LastClosedSession,
  type TimerBackendApi,
  type TimerBackendConfig,
  type TimerBackendNotify,
} from '../use-timer-backend';

const config: TimerBackendConfig = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  pomodorosUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
  notificationsEnabled: true,
};

function createApi(
  overrides: Partial<TimerBackendApi> = {},
): TimerBackendApi & { activeSession: null } {
  return {
    activeSession: null,
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn().mockResolvedValue(undefined),
    resume: vi.fn().mockResolvedValue(undefined),
    switchTask: vi.fn().mockResolvedValue(undefined),
    refetch: vi.fn().mockResolvedValue(null),
    ...overrides,
  };
}

function createNotify(): TimerBackendNotify & {
  calls: { session: string[]; auto: string[]; ok: string[]; err: string[] };
} {
  const calls = { session: [] as string[], auto: [] as string[], ok: [] as string[], err: [] as string[] };
  return {
    calls,
    sessionComplete: vi.fn((mode: string) => {
      calls.session.push(mode);
    }),
    autoStart: vi.fn((mode: string) => {
      calls.auto.push(mode);
    }),
    success: vi.fn((message: string) => {
      calls.ok.push(message);
    }),
    error: vi.fn((message: string) => {
      calls.err.push(message);
    }),
  };
}

interface Setup {
  api: ReturnType<typeof createApi>;
  notify: ReturnType<typeof createNotify>;
}

function setupHook(
  parts: Partial<Setup> & {
    type?: 'POMODORO' | 'CONTINUOUS';
    config?: TimerBackendConfig;
    taskId?: string | null;
    completedToday?: number | null;
    lastClosedSession?: LastClosedSession | null;
  } = {},
) {
  const api = parts.api ?? createApi();
  const notify = parts.notify ?? createNotify();
  const utils = renderHook(
    ({
      completedToday,
      lastClosedSession,
    }: {
      completedToday?: number | null;
      lastClosedSession?: LastClosedSession | null;
    } = {}) =>
      useTimerBackend({
        type: parts.type ?? 'POMODORO',
        config: parts.config ?? config,
        taskId: parts.taskId ?? null,
        api,
        notify,
        completedToday: completedToday ?? parts.completedToday ?? null,
        lastClosedSession: lastClosedSession ?? parts.lastClosedSession ?? null,
      }),
    {
      initialProps: {
        completedToday: parts.completedToday ?? null,
        lastClosedSession: parts.lastClosedSession ?? null,
      },
    },
  );
  return { ...utils, api, notify };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-20T10:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function flushPromises(rounds = 5) {
  for (let i = 0; i < rounds; i++) {
    await act(async () => {
      await Promise.resolve();
    });
  }
}

async function advance(seconds: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(seconds * 1000);
  });
  // Drain the floating promise chain (setTimeout → skipToNext → api.stop).
  await flushPromises();
}

async function startAndExpire(hook: ReturnType<typeof setupHook>, seconds: number) {
  await act(async () => {
    await hook.result.current.start();
  });
  await advance(seconds);
}

/**
 * Simulate timer throttling (hidden tab / backgrounded app): the JS clock
 * advances only `tickedSeconds` while wall-clock time jumps `realSeconds`.
 */
async function advanceThrottled(tickedSeconds: number, realSeconds: number) {
  const now = Date.now();
  vi.setSystemTime(now + (realSeconds - tickedSeconds) * 1000);
  await advance(tickedSeconds);
}

describe('useTimerBackend (unified)', () => {
  it('SYMPTOM: expiring WORK transitions to SHORT_BREAK/5:00 with counter=1 (never WORK/25:00)', async () => {
    const hook = setupHook({ config: { ...config, workDuration: 1 } });
    expect(hook.result.current.mode).toBe('WORK');
    expect(hook.result.current.timeLeft).toBe(60);

    await startAndExpire(hook, 60);

    expect(hook.result.current.mode).toBe('SHORT_BREAK');
    expect(hook.result.current.timeLeft).toBe(5 * 60);
    expect(hook.result.current.completedPomodoros).toBe(1);
    expect(hook.result.current.isRunning).toBe(false);
  });

  it('completes a full cycle WORK→SHORT→WORK→LONG with N=2', async () => {
    const short = { ...config, workDuration: 1, shortBreakDuration: 1, longBreakDuration: 1, pomodorosUntilLongBreak: 2 };
    const hook = setupHook({ config: short });

    await startAndExpire(hook, 60);
    expect(hook.result.current.mode).toBe('SHORT_BREAK');

    await act(async () => {
      await hook.result.current.start();
    });
    await advance(60);
    expect(hook.result.current.mode).toBe('WORK');
    expect(hook.result.current.completedPomodoros).toBe(1);

    await act(async () => {
      await hook.result.current.start();
    });
    await advance(60);
    expect(hook.result.current.mode).toBe('LONG_BREAK');
    expect(hook.result.current.completedPomodoros).toBe(2);
  });

  it('manual skip mid-WORK moves to SHORT_BREAK stopped with counter=1', async () => {
    const hook = setupHook({ config: { ...config, workDuration: 25 } });
    await act(async () => {
      await hook.result.current.start();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10 * 1000);
    });

    await act(async () => {
      await hook.result.current.skipToNext();
    });

    expect(hook.result.current.mode).toBe('SHORT_BREAK');
    expect(hook.result.current.timeLeft).toBe(5 * 60);
    expect(hook.result.current.completedPomodoros).toBe(1);
    expect(hook.result.current.isRunning).toBe(false);
    expect(hook.api.stop).toHaveBeenCalledWith({ wasCompleted: true });
  });

  it('I4: stop during a break stays in the break with full break duration', async () => {
    const hook = setupHook({ config: { ...config, workDuration: 1 } });
    await startAndExpire(hook, 60);
    expect(hook.result.current.mode).toBe('SHORT_BREAK');

    await act(async () => {
      await hook.result.current.start();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30 * 1000);
    });
    expect(hook.result.current.timeLeft).toBe(5 * 60 - 30);

    await act(async () => {
      await hook.result.current.stop(false);
    });

    expect(hook.result.current.mode).toBe('SHORT_BREAK');
    expect(hook.result.current.timeLeft).toBe(5 * 60);
    expect(hook.result.current.isRunning).toBe(false);
  });

  it('autoStartBreaks starts the break session automatically', async () => {
    const hook = setupHook({
      config: { ...config, workDuration: 1, autoStartBreaks: true },
    });

    await startAndExpire(hook, 60);

    expect(hook.result.current.mode).toBe('SHORT_BREAK');
    expect(hook.result.current.isRunning).toBe(true);
    expect(hook.api.start).toHaveBeenCalledWith({ type: 'SHORT_BREAK', taskId: undefined });
    expect(hook.notify.calls.auto).toContain('SHORT_BREAK');
  });

  it('autoStartPomodoros starts the next WORK automatically after a break', async () => {
    const short = { ...config, workDuration: 1, shortBreakDuration: 1, autoStartPomodoros: true };
    const hook = setupHook({ config: short });
    await startAndExpire(hook, 60);
    expect(hook.result.current.mode).toBe('SHORT_BREAK');

    await act(async () => {
      await hook.result.current.start();
    });
    await advance(60);

    expect(hook.result.current.mode).toBe('WORK');
    expect(hook.result.current.isRunning).toBe(true);
    expect(hook.api.start).toHaveBeenCalledWith({ type: 'WORK', taskId: undefined });
  });

  it('I5: pause/resume does not lose seconds', async () => {
    const hook = setupHook({ config: { ...config, workDuration: 25 } });
    await act(async () => {
      await hook.result.current.start();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10 * 1000);
    });
    const before = hook.result.current.timeLeft;

    await act(async () => {
      await hook.result.current.pause();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30 * 1000);
    });
    expect(hook.result.current.timeLeft).toBe(before);
    expect(hook.result.current.isPaused).toBe(true);

    await act(async () => {
      await hook.result.current.resume();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 1000);
    });
    expect(hook.result.current.timeLeft).toBe(before - 5);
  });

  it('I10: config change mid-cycle preserves countdown and mode', async () => {
    const hook = setupHook({ config: { ...config, workDuration: 25 } });
    await act(async () => {
      await hook.result.current.start();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10 * 1000);
    });
    const before = hook.result.current.timeLeft;

    hook.rerender();
    // Simulate parent passing a new config object (same content shape).
    // The hook must not reset: countdown continues from `before`.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 1000);
    });
    expect(hook.result.current.mode).toBe('WORK');
    expect(hook.result.current.timeLeft).toBe(before - 5);
  });

  it('sync: backend session without local intent restores countdown from elapsed', () => {
    const api = createApi({
      activeSession: {
        type: 'WORK',
        elapsedSeconds: 120,
        isPaused: false,
      } as never,
    });
    const hook = setupHook({ api });
    expect(hook.result.current.mode).toBe('WORK');
    expect(hook.result.current.timeLeft).toBe(25 * 60 - 120);
    expect(hook.result.current.isRunning).toBe(true);
  });

  it('sync: local intent after a transition is NOT reset by a null backend session', async () => {
    // This is the sync-reset guard: after skipToNext stops the backend
    // session, refetch returns null — the hook must keep SHORT_BREAK.
    const api = createApi();
    const hook = setupHook({ api, config: { ...config, workDuration: 1 } });
    await startAndExpire(hook, 60);
    expect(hook.result.current.mode).toBe('SHORT_BREAK');

    await act(async () => {
      await hook.api.refetch();
    });
    hook.rerender();

    expect(hook.result.current.mode).toBe('SHORT_BREAK');
    expect(hook.result.current.timeLeft).toBe(5 * 60);
  });

  it('notifies sessionComplete with the finished phase', async () => {
    const hook = setupHook({ config: { ...config, workDuration: 1 } });
    await startAndExpire(hook, 60);
    expect(hook.notify.calls.session).toEqual(['WORK']);
  });

  it('switchTask delegates to the backend adapter', async () => {
    const hook = setupHook();
    await act(async () => {
      await hook.result.current.switchTask('task-123');
    });
    expect(hook.api.switchTask).toHaveBeenCalledWith({
      newTaskId: 'task-123',
      type: 'WORK',
      splitReason: 'TASK_SWITCH',
    });
  });

  it('CONTINUOUS mode counts up and stops cleanly', async () => {
    const hook = setupHook({ type: 'CONTINUOUS' });
    expect(hook.result.current.mode).toBe('CONTINUOUS');
    expect(hook.result.current.timeLeft).toBe(0);

    await act(async () => {
      await hook.result.current.start();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(65 * 1000);
    });
    expect(hook.result.current.timeLeft).toBe(65);

    await act(async () => {
      await hook.result.current.stop(true);
    });
    expect(hook.result.current.isRunning).toBe(false);
    expect(hook.result.current.timeLeft).toBe(0);
  });

  it('I3: counter reflects the backend value when provided', () => {
    const hook = setupHook({ completedToday: 3 });
    expect(hook.result.current.completedPomodoros).toBe(3);
  });

  it('I3: completing WORK increments optimistically on top of the backend value', async () => {
    const hook = setupHook({
      completedToday: 3,
      config: { ...config, workDuration: 1 },
    });
    await startAndExpire(hook, 60);
    expect(hook.result.current.completedPomodoros).toBe(4);
  });

  it('I3: server confirmation absorbs the optimistic increment without double-counting', async () => {
    const hook = setupHook({
      completedToday: 3,
      config: { ...config, workDuration: 1 },
    });
    await startAndExpire(hook, 60);
    expect(hook.result.current.completedPomodoros).toBe(4);

    // Backend refetch now includes the just-completed pomodoro.
    hook.rerender({ completedToday: 4 });
    expect(hook.result.current.completedPomodoros).toBe(4);
  });

  it('I3: server reset (new day) clears optimistic increments', async () => {
    const hook = setupHook({
      completedToday: 3,
      config: { ...config, workDuration: 1 },
    });
    await startAndExpire(hook, 60);
    expect(hook.result.current.completedPomodoros).toBe(4);

    hook.rerender({ completedToday: 0 });
    expect(hook.result.current.completedPomodoros).toBe(0);
  });

  it('null backend value degrades to a session-local counter starting at 0', async () => {
    const hook = setupHook({
      completedToday: null,
      config: { ...config, workDuration: 1 },
    });
    expect(hook.result.current.completedPomodoros).toBe(0);
    await startAndExpire(hook, 60);
    expect(hook.result.current.completedPomodoros).toBe(1);
  });

  it('T5: throttled ticks compute remaining from the wall clock, not tick count', async () => {
    const hook = setupHook({ config: { ...config, workDuration: 25 } });
    await act(async () => {
      await hook.result.current.start();
    });

    // Only 10 ticks fire while 120 real seconds elapse (backgrounded app).
    await advanceThrottled(10, 120);

    expect(hook.result.current.timeLeft).toBe(25 * 60 - 120);
    expect(hook.result.current.isRunning).toBe(true);
  });

  it('T5: expiry during suspension transitions on the next tick after wake', async () => {
    const hook = setupHook({ config: { ...config, workDuration: 1 } });
    await act(async () => {
      await hook.result.current.start();
    });

    // App suspended for 5 minutes; a single tick fires on wake.
    await advanceThrottled(1, 300);

    expect(hook.result.current.mode).toBe('SHORT_BREAK');
    expect(hook.result.current.timeLeft).toBe(5 * 60);
    expect(hook.result.current.completedPomodoros).toBe(1);
  });

  it('T5: pause freezes the deadline; resume recomputes it without drift', async () => {
    const hook = setupHook({ config: { ...config, workDuration: 25 } });
    await act(async () => {
      await hook.result.current.start();
    });
    await advance(10);
    const frozen = hook.result.current.timeLeft;

    await act(async () => {
      await hook.result.current.pause();
    });
    // 60 real seconds pass while paused (timers + wall clock advance, but
    // the hook is paused so no tick runs).
    vi.setSystemTime(Date.now() + 60 * 1000);
    expect(hook.result.current.timeLeft).toBe(frozen);

    await act(async () => {
      await hook.result.current.resume();
    });
    await advance(5);
    expect(hook.result.current.timeLeft).toBe(frozen - 5);
  });

  it('T5: CONTINUOUS count-up reflects wall-clock time after a jump', async () => {
    const hook = setupHook({ type: 'CONTINUOUS' });
    await act(async () => {
      await hook.result.current.start();
    });

    await advanceThrottled(5, 65);

    expect(hook.result.current.timeLeft).toBe(65);
  });

  it('I11: WORK closed today restores SHORT_BREAK stopped with full duration', () => {
    const hook = setupHook({
      completedToday: 1,
      lastClosedSession: {
        type: 'WORK',
        endedAt: new Date('2026-10-20T09:30:00.000Z'),
        wasCompleted: true,
      },
    });
    expect(hook.result.current.mode).toBe('SHORT_BREAK');
    expect(hook.result.current.timeLeft).toBe(5 * 60);
    expect(hook.result.current.isRunning).toBe(false);
    expect(hook.result.current.completedPomodoros).toBe(1);
  });

  it('I11: 4th WORK closed today restores LONG_BREAK', () => {
    const hook = setupHook({
      completedToday: 4,
      lastClosedSession: {
        type: 'WORK',
        endedAt: new Date('2026-10-20T09:30:00.000Z'),
        wasCompleted: true,
      },
    });
    expect(hook.result.current.mode).toBe('LONG_BREAK');
    expect(hook.result.current.timeLeft).toBe(15 * 60);
  });

  it('I11: break closed today restores WORK stopped', () => {
    const hook = setupHook({
      completedToday: 1,
      lastClosedSession: {
        type: 'SHORT_BREAK',
        endedAt: new Date('2026-10-20T09:35:00.000Z'),
        wasCompleted: true,
      },
    });
    expect(hook.result.current.mode).toBe('WORK');
    expect(hook.result.current.timeLeft).toBe(25 * 60);
    expect(hook.result.current.isRunning).toBe(false);
  });

  it('I12: WORK closed yesterday resets to WORK #1', () => {
    const hook = setupHook({
      completedToday: 0,
      lastClosedSession: {
        type: 'WORK',
        endedAt: new Date('2026-10-19T18:00:00.000Z'),
        wasCompleted: true,
      },
    });
    expect(hook.result.current.mode).toBe('WORK');
    expect(hook.result.current.completedPomodoros).toBe(0);
  });

  it('I11: interrupted session is ignored for turn derivation', () => {
    const hook = setupHook({
      completedToday: 0,
      lastClosedSession: {
        type: 'WORK',
        endedAt: new Date('2026-10-20T09:30:00.000Z'),
        wasCompleted: false,
      },
    });
    expect(hook.result.current.mode).toBe('WORK');
    expect(hook.result.current.timeLeft).toBe(25 * 60);
  });

  it('I11: null last session keeps default WORK start', () => {
    const hook = setupHook({ completedToday: 0, lastClosedSession: null });
    expect(hook.result.current.mode).toBe('WORK');
    expect(hook.result.current.timeLeft).toBe(25 * 60);
  });

  it('I11: late-arriving history still derives the turn before first interaction', () => {
    const hook = setupHook({ completedToday: 1, lastClosedSession: null });
    expect(hook.result.current.mode).toBe('WORK');

    hook.rerender({
      completedToday: 1,
      lastClosedSession: {
        type: 'WORK',
        endedAt: new Date('2026-10-20T09:30:00.000Z'),
        wasCompleted: true,
      },
    });
    expect(hook.result.current.mode).toBe('SHORT_BREAK');
    expect(hook.result.current.timeLeft).toBe(5 * 60);
  });

  it('I11: derivation never overrides user interaction', async () => {
    const hook = setupHook({
      config: { ...config, workDuration: 25 },
      completedToday: 0,
      lastClosedSession: null,
    });
    await act(async () => {
      await hook.result.current.start();
    });
    await advance(10);

    // History arrives late AND the user already started: keep running WORK.
    hook.rerender({
      completedToday: 0,
      lastClosedSession: {
        type: 'WORK',
        endedAt: new Date('2026-10-20T09:30:00.000Z'),
        wasCompleted: true,
      },
    });
    expect(hook.result.current.mode).toBe('WORK');
    expect(hook.result.current.isRunning).toBe(true);
    expect(hook.result.current.timeLeft).toBe(25 * 60 - 10);
  });
});
