"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const react_1 = require("@testing-library/react");
const use_timer_1 = require("../use-timer");
(0, vitest_1.describe)('useTimer', () => {
    const defaultConfig = {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        pomodorosUntilLongBreak: 4,
    };
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.useFakeTimers();
    });
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.useRealTimers();
    });
    (0, vitest_1.it)('should initialize with correct default values', () => {
        const { result } = (0, react_1.renderHook)(() => (0, use_timer_1.useTimer)({
            type: 'POMODORO',
            config: defaultConfig,
        }));
        (0, vitest_1.expect)(result.current.isRunning).toBe(false);
        (0, vitest_1.expect)(result.current.isPaused).toBe(false);
        (0, vitest_1.expect)(result.current.timeLeft).toBe(25 * 60);
        (0, vitest_1.expect)(result.current.mode).toBe('WORK');
    });
    (0, vitest_1.it)('should start the timer', () => {
        const { result } = (0, react_1.renderHook)(() => (0, use_timer_1.useTimer)({
            type: 'POMODORO',
            config: defaultConfig,
        }));
        (0, react_1.act)(() => {
            result.current.start();
        });
        (0, vitest_1.expect)(result.current.isRunning).toBe(true);
        (0, vitest_1.expect)(result.current.isPaused).toBe(false);
    });
    (0, vitest_1.it)('should decrement timeLeft as time passes', () => {
        const { result } = (0, react_1.renderHook)(() => (0, use_timer_1.useTimer)({
            type: 'POMODORO',
            config: defaultConfig,
        }));
        (0, react_1.act)(() => {
            result.current.start();
        });
        (0, react_1.act)(() => {
            vitest_1.vi.advanceTimersByTime(1000);
        });
        (0, vitest_1.expect)(result.current.timeLeft).toBe(25 * 60 - 1);
        (0, react_1.act)(() => {
            vitest_1.vi.advanceTimersByTime(5000);
        });
        (0, vitest_1.expect)(result.current.timeLeft).toBe(25 * 60 - 6);
    });
    (0, vitest_1.it)('should pause the timer', () => {
        const { result } = (0, react_1.renderHook)(() => (0, use_timer_1.useTimer)({
            type: 'POMODORO',
            config: defaultConfig,
        }));
        (0, react_1.act)(() => {
            result.current.start();
        });
        (0, react_1.act)(() => {
            vitest_1.vi.advanceTimersByTime(5000);
        });
        (0, react_1.act)(() => {
            result.current.pause();
        });
        (0, vitest_1.expect)(result.current.isRunning).toBe(false);
        (0, vitest_1.expect)(result.current.isPaused).toBe(true);
        (0, vitest_1.expect)(result.current.timeLeft).toBe(25 * 60 - 5);
        (0, vitest_1.expect)(result.current.pauseCount).toBe(1);
        (0, react_1.act)(() => {
            vitest_1.vi.advanceTimersByTime(5000);
        });
        (0, vitest_1.expect)(result.current.timeLeft).toBe(25 * 60 - 5);
    });
    (0, vitest_1.it)('should resume from pause', () => {
        const { result } = (0, react_1.renderHook)(() => (0, use_timer_1.useTimer)({
            type: 'POMODORO',
            config: defaultConfig,
        }));
        (0, react_1.act)(() => {
            result.current.start();
        });
        (0, react_1.act)(() => {
            vitest_1.vi.advanceTimersByTime(1000);
        });
        (0, react_1.act)(() => {
            result.current.pause();
        });
        (0, vitest_1.expect)(result.current.timeLeft).toBe(25 * 60 - 1);
        (0, react_1.act)(() => {
            result.current.start();
        });
        (0, vitest_1.expect)(result.current.isRunning).toBe(true);
        (0, vitest_1.expect)(result.current.isPaused).toBe(false);
        (0, react_1.act)(() => {
            vitest_1.vi.advanceTimersByTime(1000);
        });
        (0, vitest_1.expect)(result.current.timeLeft).toBe(25 * 60 - 2);
    });
    (0, vitest_1.it)('should transition to break when work session completes', async () => {
        const onSessionComplete = vitest_1.vi.fn();
        const config = { ...defaultConfig, workDuration: 1 };
        const { result } = (0, react_1.renderHook)(() => (0, use_timer_1.useTimer)({
            type: 'POMODORO',
            config,
            onSessionComplete,
        }));
        (0, react_1.act)(() => {
            result.current.start();
        });
        (0, react_1.act)(() => {
            vitest_1.vi.advanceTimersByTime(60 * 1000);
        });
        (0, react_1.act)(() => {
            vitest_1.vi.runOnlyPendingTimers();
        });
        (0, vitest_1.expect)(result.current.mode).toBe('SHORT_BREAK');
    });
    (0, vitest_1.it)('should transition to long break after set pomodoros', () => {
        const config = {
            ...defaultConfig,
            workDuration: 1,
            shortBreakDuration: 1,
            pomodorosUntilLongBreak: 2
        };
        const { result } = (0, react_1.renderHook)(() => (0, use_timer_1.useTimer)({
            type: 'POMODORO',
            config,
        }));
        // 1st Pomodoro
        (0, react_1.act)(() => { result.current.start(); });
        (0, react_1.act)(() => { vitest_1.vi.advanceTimersByTime(60 * 1000); });
        (0, react_1.act)(() => { vitest_1.vi.runOnlyPendingTimers(); });
        (0, vitest_1.expect)(result.current.mode).toBe('SHORT_BREAK');
        // 1st Break
        (0, react_1.act)(() => { result.current.start(); });
        (0, react_1.act)(() => { vitest_1.vi.advanceTimersByTime(60 * 1000); });
        (0, react_1.act)(() => { vitest_1.vi.runOnlyPendingTimers(); });
        (0, vitest_1.expect)(result.current.mode).toBe('WORK');
        // 2nd Pomodoro
        (0, react_1.act)(() => { result.current.start(); });
        (0, react_1.act)(() => { vitest_1.vi.advanceTimersByTime(60 * 1000); });
        (0, react_1.act)(() => { vitest_1.vi.runOnlyPendingTimers(); });
        (0, vitest_1.expect)(result.current.mode).toBe('LONG_BREAK');
        (0, vitest_1.expect)(result.current.completedPomodoros).toBe(2);
    });
    (0, vitest_1.it)('should reset the timer', () => {
        const { result } = (0, react_1.renderHook)(() => (0, use_timer_1.useTimer)({
            type: 'POMODORO',
            config: defaultConfig,
        }));
        (0, react_1.act)(() => {
            result.current.start();
        });
        (0, react_1.act)(() => {
            vitest_1.vi.advanceTimersByTime(10000);
        });
        (0, vitest_1.expect)(result.current.timeLeft).toBe(25 * 60 - 10);
        (0, react_1.act)(() => {
            result.current.reset();
        });
        (0, vitest_1.expect)(result.current.isRunning).toBe(false);
        (0, vitest_1.expect)(result.current.timeLeft).toBe(25 * 60);
        (0, vitest_1.expect)(result.current.mode).toBe('WORK');
    });
});
