import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer, type TimerConfig } from '../use-timer';

describe('useTimer', () => {
    const defaultConfig: TimerConfig = {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        pomodorosUntilLongBreak: 4,
    };

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should initialize with correct default values', () => {
        const { result } = renderHook(() => useTimer({
            type: 'POMODORO',
            config: defaultConfig,
        }));

        expect(result.current.isRunning).toBe(false);
        expect(result.current.isPaused).toBe(false);
        expect(result.current.timeLeft).toBe(25 * 60);
        expect(result.current.mode).toBe('WORK');
    });

    it('should start the timer', () => {
        const { result } = renderHook(() => useTimer({
            type: 'POMODORO',
            config: defaultConfig,
        }));

        act(() => {
            result.current.start();
        });

        expect(result.current.isRunning).toBe(true);
        expect(result.current.isPaused).toBe(false);
    });

    it('should decrement timeLeft as time passes', () => {
        const { result } = renderHook(() => useTimer({
            type: 'POMODORO',
            config: defaultConfig,
        }));

        act(() => {
            result.current.start();
        });

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(result.current.timeLeft).toBe(25 * 60 - 1);

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(result.current.timeLeft).toBe(25 * 60 - 6);
    });

    it('should pause the timer', () => {
        const { result } = renderHook(() => useTimer({
            type: 'POMODORO',
            config: defaultConfig,
        }));

        act(() => {
            result.current.start();
        });

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        act(() => {
            result.current.pause();
        });

        expect(result.current.isRunning).toBe(false);
        expect(result.current.isPaused).toBe(true);
        expect(result.current.timeLeft).toBe(25 * 60 - 5);
        expect(result.current.pauseCount).toBe(1);

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(result.current.timeLeft).toBe(25 * 60 - 5);
    });

    it('should resume from pause', () => {
        const { result } = renderHook(() => useTimer({
            type: 'POMODORO',
            config: defaultConfig,
        }));

        act(() => {
            result.current.start();
        });

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        act(() => {
            result.current.pause();
        });

        expect(result.current.timeLeft).toBe(25 * 60 - 1);

        act(() => {
            result.current.start();
        });

        expect(result.current.isRunning).toBe(true);
        expect(result.current.isPaused).toBe(false);

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(result.current.timeLeft).toBe(25 * 60 - 2);
    });

    it('should transition to break when work session completes', async () => {
        const onSessionComplete = vi.fn();
        const config = { ...defaultConfig, workDuration: 1 };

        const { result } = renderHook(() => useTimer({
            type: 'POMODORO',
            config,
            onSessionComplete,
        }));

        act(() => {
            result.current.start();
        });

        act(() => {
            vi.advanceTimersByTime(60 * 1000);
        });

        act(() => {
            vi.runOnlyPendingTimers();
        });

        expect(result.current.mode).toBe('SHORT_BREAK');
    });

    it('should transition to long break after set pomodoros', () => {
        const config = {
            ...defaultConfig,
            workDuration: 1,
            shortBreakDuration: 1,
            pomodorosUntilLongBreak: 2
        };

        const { result } = renderHook(() => useTimer({
            type: 'POMODORO',
            config,
        }));

        // 1st Pomodoro
        act(() => { result.current.start(); });
        act(() => { vi.advanceTimersByTime(60 * 1000); });
        act(() => { vi.runOnlyPendingTimers(); });
        expect(result.current.mode).toBe('SHORT_BREAK');

        // 1st Break
        act(() => { result.current.start(); });
        act(() => { vi.advanceTimersByTime(60 * 1000); });
        act(() => { vi.runOnlyPendingTimers(); });
        expect(result.current.mode).toBe('WORK');

        // 2nd Pomodoro
        act(() => { result.current.start(); });
        act(() => { vi.advanceTimersByTime(60 * 1000); });
        act(() => { vi.runOnlyPendingTimers(); });

        expect(result.current.mode).toBe('LONG_BREAK');
        expect(result.current.completedPomodoros).toBe(2);
    });

    it('should reset the timer', () => {
        const { result } = renderHook(() => useTimer({
            type: 'POMODORO',
            config: defaultConfig,
        }));

        act(() => {
            result.current.start();
        });

        act(() => {
            vi.advanceTimersByTime(10000);
        });

        expect(result.current.timeLeft).toBe(25 * 60 - 10);

        act(() => {
            result.current.reset();
        });

        expect(result.current.isRunning).toBe(false);
        expect(result.current.timeLeft).toBe(25 * 60);
        expect(result.current.mode).toBe('WORK');
    });
});
