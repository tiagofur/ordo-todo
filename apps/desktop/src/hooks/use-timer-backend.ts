import { useState, useEffect, useRef, useCallback } from "react";
import { formatTimerDisplay } from "@ordo-todo/core";
import { useActiveTimer, useStartTimer, useStopTimer, usePauseTimer, useResumeTimer, useSwitchTask } from "@/hooks/api";
import { toast } from "sonner";


export type TimerSessionMode = "WORK" | "SHORT_BREAK" | "LONG_BREAK" | "IDLE" | "CONTINUOUS";
export type TimerType = "POMODORO" | "STOPWATCH" | "CONTINUOUS";

interface TimerConfig {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    pomodorosUntilLongBreak: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    soundEnabled: boolean;
    notificationsEnabled: boolean;
}

interface UseTimerBackendProps {
    type: TimerType;
    config: TimerConfig;
    taskId: string | null;
    onSessionComplete?: () => void;
}

export function useTimerBackend({ type, config, taskId, onSessionComplete }: UseTimerBackendProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [timeLeft, setTimeLeft] = useState(type === "CONTINUOUS" ? 0 : config.workDuration * 60);
    const [mode, setMode] = useState<TimerSessionMode>(type === "CONTINUOUS" ? "CONTINUOUS" : "WORK");
    const [completedPomodoros, setCompletedPomodoros] = useState(0);

    const isTransitioningRef = useRef(false);
    const [localPauseStartTime, setLocalPauseStartTime] = useState<Date | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Backend hooks
    const { data: activeSession, refetch: refetchActiveSession } = useActiveTimer();
    const startTimerMutation = useStartTimer();
    const stopTimerMutation = useStopTimer();
    const pauseTimerMutation = usePauseTimer();
    const resumeTimerMutation = useResumeTimer();

    const getDuration = useCallback((mode: TimerSessionMode): number => {
        switch (mode) {
            case "WORK": return config.workDuration * 60;
            case "SHORT_BREAK": return config.shortBreakDuration * 60;
            case "LONG_BREAK": return config.longBreakDuration * 60;
            case "CONTINUOUS": return 0;
            default: return 0;
        }
    }, [config]);

    // Sync to Electron
    useEffect(() => {
        if (typeof window !== 'undefined' && window.electronAPI) {
            window.electronAPI.sendTimerState({
                timerActive: isRunning,
                isPaused: isPaused,
                timeRemaining: formatTimerDisplay(timeLeft),
                currentTask: (activeSession as any)?.task || null,
                mode: mode as any,
            });
        }
    }, [isRunning, isPaused, timeLeft, mode, activeSession]);

    // Sync with backend active session
    useEffect(() => {
        if (activeSession) {
            setIsRunning(true);
            setIsPaused(activeSession.isPaused);
            const elapsed = activeSession.elapsedSeconds;

            if (activeSession.type === "CONTINUOUS") {
                setTimeLeft(elapsed);
                setMode("CONTINUOUS");
            } else {
                // Cast activeSession.type to TimerSessionMode
                // API likely returns matching strings
                const sessionType = activeSession.type as TimerSessionMode;
                const sessionDuration = getDuration(sessionType);
                const remaining = Math.max(0, sessionDuration - elapsed);
                setTimeLeft(remaining);
                setMode(sessionType);
            }

            if (activeSession.isPaused && activeSession.currentPauseStart) {
                setLocalPauseStartTime(new Date(activeSession.currentPauseStart));
            } else {
                setLocalPauseStartTime(null);
            }
        } else {
            // No active session logic
            if (!isRunning) { // Only reset if not running locally (race condition protection)
                if (type === "CONTINUOUS") {
                    // Logic to stay or switch mode
                }
                setIsRunning(false);
                setIsPaused(false);
            }
        }
    }, [activeSession, getDuration, type]); // removed isRunning to avoid loops, relying on activeSession change

    const start = useCallback(async () => {
        try {
            await startTimerMutation.mutateAsync({
                taskId: (taskId || undefined),
                type: type === "CONTINUOUS" ? "CONTINUOUS" : (mode === "IDLE" ? "WORK" : mode),
            });
            setIsRunning(true);
            setIsPaused(false);
            await refetchActiveSession();
            toast.success("Timer iniciado");
        } catch (error: any) {
            toast.error(error.message || "Error al iniciar timer");
        }
    }, [taskId, mode, type, startTimerMutation, refetchActiveSession]);

    const pause = useCallback(async () => {
        const pauseStart = new Date();
        setLocalPauseStartTime(pauseStart);
        try {
            await pauseTimerMutation.mutateAsync({ pauseStartedAt: pauseStart });
            setIsPaused(true);
            setIsRunning(false);
            await refetchActiveSession();
        } catch (error: any) {
            toast.error(error.message || "Error al pausar timer");
        }
    }, [pauseTimerMutation, refetchActiveSession]);

    const resume = useCallback(async () => {
        if (!localPauseStartTime) return;
        try {
            await resumeTimerMutation.mutateAsync({ pauseStartedAt: localPauseStartTime });
            setIsPaused(false);
            setIsRunning(true);
            setLocalPauseStartTime(null);
            await refetchActiveSession();
        } catch (error: any) {
            toast.error(error.message || "Error al reanudar timer");
        }
    }, [localPauseStartTime, resumeTimerMutation, refetchActiveSession]);

    const stop = useCallback(async (wasCompleted: boolean = false) => {
        try {
            await stopTimerMutation.mutateAsync({ wasCompleted });
            setIsRunning(false);
            setIsPaused(false);
            // Reset to default
            if (type === "POMODORO" && !wasCompleted) {
                setTimeLeft(getDuration(mode));
            } else if (type === "CONTINUOUS") {
                setTimeLeft(0);
            }

            await refetchActiveSession();
            if (onSessionComplete) onSessionComplete();
        } catch (error: any) {
            toast.error(error.message || "Error al detener timer");
        }
    }, [stopTimerMutation, refetchActiveSession, onSessionComplete, type, mode, getDuration]);

    const skipToNext = useCallback(async () => {
        await stop(true);
        if (type === "POMODORO") {
            if (mode === "WORK") {
                setMode("SHORT_BREAK");
                setTimeLeft(getDuration("SHORT_BREAK"));
            } else {
                setMode("WORK");
                setTimeLeft(getDuration("WORK"));
            }
        }
    }, [stop, type, mode, getDuration]);

    useEffect(() => {
        if (isRunning && !isPaused) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (type === "CONTINUOUS") return prev + 1;
                    if (prev <= 1) {
                        stop(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isRunning, isPaused, type, stop]);

    const getProgress = (): number => {
        if (mode === "CONTINUOUS") return 100;
        const total = getDuration(mode);
        return ((total - timeLeft) / total) * 100;
    };

    return {
        isRunning,
        isPaused,
        timeLeft,
        mode,
        completedPomodoros,
        start,
        pause,
        resume,
        stop,
        skipToNext,
        formatTime: formatTimerDisplay,
        getProgress,
        activeSession
    };
}
