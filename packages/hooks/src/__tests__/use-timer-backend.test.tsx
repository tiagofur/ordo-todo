/**
 * Shared useTimerBackend tests (ODD 014, T2a/S2).
 *
 * RED→GREEN suite for the unified timer hook. The first test reproduces the
 * reported symptom (WORK expiring resets to 25:00 instead of BREAK/5:00)
 * that affects all three current per-app copies (sync-reset + desktop-stop).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useTimerBackend,
  type TimerBackendApi,
  type TimerBackendConfig,
  type TimerBackendNotify,
  type TimerBackendStorage,
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

function createStorage(initial: Record<string, string> = {}): TimerBackendStorage {
  const map = new Map(Object.entries(initial));
  return {
    get: vi.fn((key: string) => (map.has(key) ? map.get(key)! : null)),
    set: vi.fn((key: string, value: string) => {
      map.set(key, value);
    }),
  };
}

interface Setup {
  api: ReturnType<typeof createApi>;
  notify: ReturnType<typeof createNotify>;
  storage: TimerBackendStorage;
}

function setupHook(
  parts: Partial<Setup> & {
    type?: 'POMODORO' | 'CONTINUOUS';
    config?: TimerBackendConfig;
    taskId?: string | null;
  } = {},
) {
  const api = parts.api ?? createApi();
  const notify = parts.notify ?? createNotify();
  const storage = parts.storage ?? createStorage();
  const utils = renderHook(() =>
    useTimerBackend({
      type: parts.type ?? 'POMODORO',
      config: parts.config ?? config,
      taskId: parts.taskId ?? null,
      api,
      notify,
      storage,
    }),
  );
  return { ...utils, api, notify, storage };
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

  it('counter survives remount within the same day via storage', async () => {
    const storage = createStorage({
      'ordo-completed-pomodoros': '3',
      'ordo-pomodoros-date': new Date('2026-10-20T10:00:00.000Z').toDateString(),
    });
    const first = setupHook({ storage, config: { ...config, workDuration: 1 } });
    expect(first.result.current.completedPomodoros).toBe(3);
    first.unmount();

    const second = setupHook({ storage, config: { ...config, workDuration: 1 } });
    expect(second.result.current.completedPomodoros).toBe(3);
    second.unmount();
  });

  it('counter resets on a new day', () => {
    const storage = createStorage({
      'ordo-completed-pomodoros': '5',
      'ordo-pomodoros-date': new Date('2026-10-19T10:00:00.000Z').toDateString(),
    });
    const hook = setupHook({ storage });
    expect(hook.result.current.completedPomodoros).toBe(0);
  });
});
