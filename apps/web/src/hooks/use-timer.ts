import { useState, useEffect, useRef, useCallback } from "react";

export type TimerMode = "WORK" | "SHORT_BREAK" | "LONG_BREAK";
export type TimerType = "POMODORO" | "CONTINUOUS";

interface TimerConfig {
    workDuration: number; // minutes
    shortBreakDuration: number; // minutes
    longBreakDuration: number; // minutes
    pomodorosUntilLongBreak: number;
}

interface UseTimerProps {
    type: TimerType;
    config: TimerConfig;
    onSessionComplete?: (data: SessionData) => void;
}

export interface SessionData {
    startedAt: Date;
    endedAt: Date;
    duration: number; // seconds
    mode: TimerMode;
    wasCompleted: boolean;
    wasInterrupted: boolean;
    pauseCount: number;
    totalPauseTime: number; // seconds
}

export function useTimer({ type, config, onSessionComplete }: UseTimerProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [timeLeft, setTimeLeft] = useState(config.workDuration * 60); // seconds
    const [mode, setMode] = useState<TimerMode>("WORK");
    const [completedPomodoros, setCompletedPomodoros] = useState(0);
    const [pauseCount, setPauseCount] = useState(0);
    const [totalPauseTime, setTotalPauseTime] = useState(0);

    const sessionStartRef = useRef<Date | null>(null);
    const pauseStartRef = useRef<Date | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const getDuration = useCallback((mode: TimerMode): number => {
        switch (mode) {
            case "WORK":
                return config.workDuration * 60;
            case "SHORT_BREAK":
                return config.shortBreakDuration * 60;
            case "LONG_BREAK":
                return config.longBreakDuration * 60;
        }
    }, [config]);

    const start = useCallback(() => {
        if (!sessionStartRef.current) {
            sessionStartRef.current = new Date();
        }

        if (isPaused && pauseStartRef.current) {
            // Calculate pause duration
            const pauseDuration = Math.floor((Date.now() - pauseStartRef.current.getTime()) / 1000);
            setTotalPauseTime(prev => prev + pauseDuration);
            pauseStartRef.current = null;
        }

        setIsRunning(true);
        setIsPaused(false);
    }, [isPaused]);

    const pause = useCallback(() => {
        setIsPaused(true);
        setIsRunning(false);
        setPauseCount(prev => prev + 1);
        pauseStartRef.current = new Date();
    }, []);

    const stop = useCallback((wasCompleted: boolean = false) => {
        if (sessionStartRef.current && onSessionComplete) {
            const sessionData: SessionData = {
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

    const reset = useCallback(() => {
        stop(false);
        setTimeLeft(getDuration(mode));
    }, [mode, getDuration, stop]);

    const skipToNext = useCallback(() => {
        if (type === "POMODORO") {
            if (mode === "WORK") {
                setCompletedPomodoros(prev => prev + 1);
                const nextMode = (completedPomodoros + 1) % config.pomodorosUntilLongBreak === 0
                    ? "LONG_BREAK"
                    : "SHORT_BREAK";
                setMode(nextMode);
                setTimeLeft(getDuration(nextMode));
            } else {
                setMode("WORK");
                setTimeLeft(getDuration("WORK"));
            }
        }
        stop(true);
    }, [type, mode, completedPomodoros, config.pomodorosUntilLongBreak, getDuration, stop]);

    // Timer countdown effect
    useEffect(() => {
        if (isRunning && !isPaused) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        // Timer completed
                        if (type === "POMODORO") {
                            skipToNext();
                        } else {
                            stop(true);
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, isPaused, type, skipToNext, stop]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const getProgress = (): number => {
        const total = getDuration(mode);
        return ((total - timeLeft) / total) * 100;
    };

    const split = useCallback(() => {
        if (sessionStartRef.current && onSessionComplete) {
            // Log the completed portion
            const sessionData: SessionData = {
                startedAt: sessionStartRef.current,
                endedAt: new Date(),
                duration: Math.floor((Date.now() - sessionStartRef.current.getTime()) / 1000) - totalPauseTime,
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
