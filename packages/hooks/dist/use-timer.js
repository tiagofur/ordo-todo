"use strict";
/**
 * Shared useTimer Hook for Ordo-Todo
 *
 * A React hook for managing Pomodoro and continuous timer functionality.
 * Can be used across web, mobile, and desktop applications.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTimer = useTimer;
const react_1 = require("react");
const core_1 = require("@ordo-todo/core");
function useTimer({ type, config, onSessionComplete, }) {
    const [isRunning, setIsRunning] = (0, react_1.useState)(false);
    const [isPaused, setIsPaused] = (0, react_1.useState)(false);
    const [timeLeft, setTimeLeft] = (0, react_1.useState)(config.workDuration * 60); // seconds
    const [mode, setMode] = (0, react_1.useState)('WORK');
    const [completedPomodoros, setCompletedPomodoros] = (0, react_1.useState)(0);
    const [pauseCount, setPauseCount] = (0, react_1.useState)(0);
    const [totalPauseTime, setTotalPauseTime] = (0, react_1.useState)(0);
    // Use refs to avoid stale closure issues
    const completedPomodorosRef = (0, react_1.useRef)(0);
    const isTransitioningRef = (0, react_1.useRef)(false);
    const sessionStartRef = (0, react_1.useRef)(null);
    const pauseStartRef = (0, react_1.useRef)(null);
    const intervalRef = (0, react_1.useRef)(null);
    const timeoutRef = (0, react_1.useRef)(null);
    const isMountedRef = (0, react_1.useRef)(true);
    // Cleanup on unmount
    (0, react_1.useEffect)(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, []);
    // Keep ref in sync with state
    (0, react_1.useEffect)(() => {
        completedPomodorosRef.current = completedPomodoros;
    }, [completedPomodoros]);
    const getDuration = (0, react_1.useCallback)((mode) => {
        switch (mode) {
            case 'WORK':
                return config.workDuration * 60;
            case 'SHORT_BREAK':
                return config.shortBreakDuration * 60;
            case 'LONG_BREAK':
                return config.longBreakDuration * 60;
        }
    }, [config]);
    const start = (0, react_1.useCallback)(() => {
        if (!sessionStartRef.current) {
            sessionStartRef.current = new Date();
        }
        if (isPaused && pauseStartRef.current) {
            // Calculate pause duration
            const pauseDuration = Math.floor((Date.now() - pauseStartRef.current.getTime()) / 1000);
            setTotalPauseTime((prev) => prev + pauseDuration);
            pauseStartRef.current = null;
        }
        setIsRunning(true);
        setIsPaused(false);
    }, [isPaused]);
    const pause = (0, react_1.useCallback)(() => {
        setIsPaused(true);
        setIsRunning(false);
        setPauseCount((prev) => prev + 1);
        pauseStartRef.current = new Date();
    }, []);
    const stop = (0, react_1.useCallback)((wasCompleted = false) => {
        if (sessionStartRef.current && onSessionComplete) {
            const sessionData = {
                startedAt: sessionStartRef.current,
                endedAt: new Date(),
                duration: Math.floor((Date.now() - sessionStartRef.current.getTime()) / 1000) - totalPauseTime,
                mode,
                wasCompleted,
                wasInterrupted: !wasCompleted,
                pauseCount,
                totalPauseTime,
            };
            onSessionComplete(sessionData);
        }
        setIsRunning(false);
        setIsPaused(false);
        sessionStartRef.current = null;
        pauseStartRef.current = null;
        setPauseCount(0);
        setTotalPauseTime(0);
    }, [mode, onSessionComplete, pauseCount, totalPauseTime]);
    const reset = (0, react_1.useCallback)(() => {
        stop(false);
        setTimeLeft(getDuration(mode));
    }, [mode, getDuration, stop]);
    const skipToNext = (0, react_1.useCallback)(() => {
        // Prevent multiple simultaneous transitions
        if (isTransitioningRef.current) {
            return;
        }
        isTransitioningRef.current = true;
        // Clear the interval immediately
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (type === 'POMODORO') {
            if (mode === 'WORK') {
                // Use ref for accurate count
                const newCount = completedPomodorosRef.current + 1;
                setCompletedPomodoros(newCount);
                completedPomodorosRef.current = newCount;
                const nextMode = newCount % config.pomodorosUntilLongBreak === 0
                    ? 'LONG_BREAK'
                    : 'SHORT_BREAK';
                // Stop current session first
                stop(true);
                // Then update mode and time for next session
                setMode(nextMode);
                setTimeLeft(getDuration(nextMode));
            }
            else {
                // Stop current break session
                stop(true);
                // Set up next work session
                setMode('WORK');
                setTimeLeft(getDuration('WORK'));
            }
        }
        else {
            stop(true);
        }
        isTransitioningRef.current = false;
    }, [type, mode, config.pomodorosUntilLongBreak, getDuration, stop]);
    // Timer countdown effect
    (0, react_1.useEffect)(() => {
        if (isRunning && !isPaused && !isTransitioningRef.current) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        // Timer completed - schedule transition outside setState
                        // Clear any existing timeout to prevent race conditions
                        if (timeoutRef.current) {
                            clearTimeout(timeoutRef.current);
                        }
                        timeoutRef.current = setTimeout(() => {
                            // Check if component is still mounted and not already transitioning
                            if (!isMountedRef.current || isTransitioningRef.current) {
                                return;
                            }
                            if (type === 'POMODORO') {
                                skipToNext();
                            }
                            else {
                                stop(true);
                            }
                        }, 0);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [isRunning, isPaused, type, skipToNext, stop]);
    const formatTime = (seconds) => {
        return (0, core_1.formatTimerDisplay)(seconds);
    };
    const getProgress = () => {
        const total = getDuration(mode);
        return ((total - timeLeft) / total) * 100;
    };
    const split = (0, react_1.useCallback)(() => {
        if (sessionStartRef.current && onSessionComplete) {
            // Log the completed portion
            const sessionData = {
                startedAt: sessionStartRef.current,
                endedAt: new Date(),
                duration: Math.floor((Date.now() - sessionStartRef.current.getTime()) / 1000) -
                    totalPauseTime,
                mode,
                wasCompleted: true, // Split sessions count as "good" time
                wasInterrupted: false,
                pauseCount,
                totalPauseTime,
            };
            onSessionComplete(sessionData);
            // Reset session tracking for the next portion
            sessionStartRef.current = new Date();
            pauseStartRef.current = null;
            setPauseCount(0);
            setTotalPauseTime(0);
        }
    }, [mode, onSessionComplete, pauseCount, totalPauseTime]);
    return {
        isRunning,
        isPaused,
        timeLeft,
        mode,
        completedPomodoros,
        pauseCount,
        totalPauseTime,
        start,
        pause,
        stop,
        reset,
        skipToNext,
        split,
        formatTime,
        getProgress,
    };
}
