import { useState, useEffect, useRef, useCallback } from "react";
import { useActiveTimer, useStartTimer, useStopTimer, usePauseTimer, useResumeTimer, useSwitchTask } from "@/lib/api-hooks";
import { toast } from "sonner";
import { useTimerNotifications } from "./use-timer-notifications";

export type TimerMode = "WORK" | "SHORT_BREAK" | "LONG_BREAK" | "CONTINUOUS";
export type TimerType = "POMODORO" | "CONTINUOUS";

interface TimerConfig {
    workDuration: number; // minutes
    shortBreakDuration: number; // minutes
    longBreakDuration: number; // minutes
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
    const [mode, setMode] = useState<TimerMode>(type === "CONTINUOUS" ? "CONTINUOUS" : "WORK");
    const [completedPomodoros, setCompletedPomodoros] = useState(0);
    const [localPauseStartTime, setLocalPauseStartTime] = useState<Date | null>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Backend hooks
    const { data: activeSession, refetch: refetchActiveSession } = useActiveTimer();
    const startTimerMutation = useStartTimer();
    const stopTimerMutation = useStopTimer();
    const pauseTimerMutation = usePauseTimer();
    const resumeTimerMutation = useResumeTimer();
    const switchTaskMutation = useSwitchTask();

    // Notifications hook
    const { notifySessionComplete, notifyAutoStart } = useTimerNotifications({
        soundEnabled: config.soundEnabled,
        notificationsEnabled: config.notificationsEnabled,
    });

    const getDuration = useCallback((mode: TimerMode): number => {
        switch (mode) {
            case "WORK":
                return config.workDuration * 60;
            case "SHORT_BREAK":
                return config.shortBreakDuration * 60;
            case "LONG_BREAK":
                return config.longBreakDuration * 60;
            case "CONTINUOUS":
                return 0; // Continuous mode has no fixed duration
        }
    }, [config]);

    // Sync with backend active session
    useEffect(() => {
        if (activeSession) {
            setIsRunning(true);
            setIsPaused(activeSession.isPaused);

            // Use backend calculated elapsed time
            const elapsed = activeSession.elapsedSeconds;

            if (activeSession.type === "CONTINUOUS") {
                setTimeLeft(elapsed);
                setMode("CONTINUOUS");
            } else {
                const sessionDuration = getDuration(activeSession.type as TimerMode);
                const remaining = Math.max(0, sessionDuration - elapsed);
                setTimeLeft(remaining);
                setMode(activeSession.type as TimerMode);
            }

            // Sync local pause start time if paused
            if (activeSession.isPaused && activeSession.currentPauseStart) {
                setLocalPauseStartTime(new Date(activeSession.currentPauseStart));
            } else {
                setLocalPauseStartTime(null);
            }
        } else {
            setIsRunning(false);
            setIsPaused(false);
            setLocalPauseStartTime(null);
            // Reset to default if no active session
            if (!isRunning) {
                if (type === "CONTINUOUS") {
                    setTimeLeft(0);
                    setMode("CONTINUOUS");
                } else {
                    setTimeLeft(getDuration("WORK"));
                    setMode("WORK");
                }
            }
        }
    }, [activeSession, getDuration, type]);

    // Reset when config changes (e.g. duration updated in settings)
    useEffect(() => {
        if (!activeSession && !isRunning && !isPaused) {
            if (type === "CONTINUOUS") {
                setTimeLeft(0);
                setMode("CONTINUOUS");
            } else {
                setTimeLeft(getDuration("WORK"));
                setMode("WORK");
            }
        }
    }, [config, getDuration, activeSession, isRunning, isPaused, type]);

    const start = useCallback(async () => {
        try {
            await startTimerMutation.mutateAsync({
                taskId: (taskId || undefined) as any,
                type: type === "CONTINUOUS" ? "CONTINUOUS" : mode,
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
            setLocalPauseStartTime(null);

            if (type === "CONTINUOUS") {
                setTimeLeft(0);
            } else {
                setTimeLeft(getDuration(mode));
            }

            await refetchActiveSession();

            if (onSessionComplete) {
                onSessionComplete();
            }
        } catch (error: any) {
            toast.error(error.message || "Error al detener timer");
        }
    }, [stopTimerMutation, mode, type, getDuration, refetchActiveSession, onSessionComplete]);

    const skipToNext = useCallback(async () => {
        if (type === "POMODORO") {
            let nextMode: TimerMode;

            if (mode === "WORK") {
                // Completed a work session
                setCompletedPomodoros(prev => prev + 1);
                nextMode = (completedPomodoros + 1) % config.pomodorosUntilLongBreak === 0
                    ? "LONG_BREAK"
                    : "SHORT_BREAK";

                // Stop current session
                await stop(true);

                // Notify session complete
                notifySessionComplete(mode);

                // Auto-start break if enabled
                if (config.autoStartBreaks && taskId) {
                    setMode(nextMode);
                    setTimeLeft(getDuration(nextMode));

                    try {
                        await startTimerMutation.mutateAsync({
                            taskId,
                            type: nextMode,
                        });
                        setIsRunning(true);
                        setIsPaused(false);
                        await refetchActiveSession();
                        notifyAutoStart(nextMode);
                        toast.success(`Iniciando ${nextMode === "LONG_BREAK" ? "descanso largo" : "descanso corto"}`);
                    } catch (error: any) {
                        toast.error("Error al auto-iniciar descanso");
                    }
                } else {
                    setMode(nextMode);
                    setTimeLeft(getDuration(nextMode));
                }
            } else {
                // Completed a break session
                nextMode = "WORK";

                // Stop current session
                await stop(true);

                // Notify session complete
                notifySessionComplete(mode);

                // Auto-start next pomodoro if enabled
                if (config.autoStartPomodoros && taskId) {
                    setMode(nextMode);
                    setTimeLeft(getDuration(nextMode));

                    try {
                        await startTimerMutation.mutateAsync({
                            taskId,
                            type: nextMode,
                        });
                        setIsRunning(true);
                        setIsPaused(false);
                        await refetchActiveSession();
                        notifyAutoStart(nextMode);
                        toast.success("Iniciando siguiente Pomodoro");
                    } catch (error: any) {
                        toast.error("Error al auto-iniciar Pomodoro");
                    }
                } else {
                    setMode(nextMode);
                    setTimeLeft(getDuration(nextMode));
                }
            }
        } else {
            // CONTINUOUS mode - just stop
            await stop(true);
            notifySessionComplete("WORK");
        }
    }, [type, mode, completedPomodoros, config, getDuration, stop, taskId, startTimerMutation, refetchActiveSession, notifySessionComplete, notifyAutoStart]);

    const switchTask = useCallback(async (newTaskId: string) => {
        try {
            await switchTaskMutation.mutateAsync({
                newTaskId,
                type: type === "CONTINUOUS" ? "CONTINUOUS" : mode,
                splitReason: "TASK_SWITCH",
            });
            await refetchActiveSession();
            toast.success("Tarea cambiada");
        } catch (error: any) {
            toast.error(error.message || "Error al cambiar de tarea");
        }
    }, [mode, type, switchTaskMutation, refetchActiveSession]);

    // Timer countdown/countup effect
    useEffect(() => {
        if (isRunning && !isPaused) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (mode === "CONTINUOUS") {
                        return prev + 1;
                    }

                    if (prev <= 1) {
                        // Timer completed - trigger skip to next
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
    }, [isRunning, isPaused, type, mode, skipToNext, stop]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const getProgress = (): number => {
        if (mode === "CONTINUOUS") return 100; // Full circle for continuous
        const total = getDuration(mode);
        return ((total - timeLeft) / total) * 100;
    };

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
