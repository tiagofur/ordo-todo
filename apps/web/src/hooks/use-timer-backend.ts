import { useState, useEffect, useRef, useCallback } from "react";
import { formatTimerDisplay } from "@ordo-todo/hooks";
import { useActiveTimer, useStartTimer, useStopTimer, usePauseTimer, useResumeTimer, useSwitchTask } from "@/lib/api-hooks";
import { notify } from "@/lib/notify";
import { useTimerNotifications } from "./use-timer-notifications";

export type TimerMode = "WORK" | "SHORT_BREAK" | "LONG_BREAK" | "CONTINUOUS";
export type TimerType = "POMODORO" | "CONTINUOUS";
type SessionTypeValue = "WORK" | "SHORT_BREAK" | "LONG_BREAK" | "CONTINUOUS";

// Session type map for backend API - returns typed values
const SESSION_TYPE_MAP: Record<TimerMode, SessionTypeValue> = {
    WORK: "WORK",
    SHORT_BREAK: "SHORT_BREAK",
    LONG_BREAK: "LONG_BREAK",
    CONTINUOUS: "CONTINUOUS",
};

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
    const [completedPomodoros, setCompletedPomodoros] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("ordo-completed-pomodoros");
            const savedDate = localStorage.getItem("ordo-pomodoros-date");
            const today = new Date().toDateString();

            // Reset counter if it's a new day
            if (savedDate !== today) {
                localStorage.setItem("ordo-pomodoros-date", today);
                localStorage.setItem("ordo-completed-pomodoros", "0");
                return 0;
            }

            return saved ? parseInt(saved, 10) : 0;
        }
        return 0;
    });
    // Use a ref to track current completed pomodoros to avoid stale closure issues
    const completedPomodorosRef = useRef(completedPomodoros);
    // Flag to prevent multiple transitions
    const isTransitioningRef = useRef(false);

    useEffect(() => {
        completedPomodorosRef.current = completedPomodoros;
        if (typeof window !== "undefined") {
            const today = new Date().toDateString();
            localStorage.setItem("ordo-completed-pomodoros", completedPomodoros.toString());
            localStorage.setItem("ordo-pomodoros-date", today);
        }
    }, [completedPomodoros]);
    const [localPauseStartTime, setLocalPauseStartTime] = useState<Date | null>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Refs to hold latest function references to avoid stale closures in setInterval
    const skipToNextRef = useRef<(() => Promise<void>) | undefined>(undefined);
    const stopRef = useRef<((wasCompleted?: boolean) => Promise<void>) | undefined>(undefined);

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
                // If we are switching from CONTINUOUS to POMODORO, or if we are currently in CONTINUOUS mode
                // reset to WORK. Otherwise, keep current mode (WORK, SHORT_BREAK, LONG_BREAK) and update duration.
                if (mode === "CONTINUOUS") {
                    setTimeLeft(getDuration("WORK"));
                    setMode("WORK");
                } else {
                    setTimeLeft(getDuration(mode));
                }
            }
        }
    }, [config, getDuration, activeSession, isRunning, isPaused, type, mode]);

    const start = useCallback(async () => {
        try {
            await startTimerMutation.mutateAsync({
                taskId: (taskId || undefined) as any,
                type: type === "CONTINUOUS" ? "CONTINUOUS" : mode,
            });
            setIsRunning(true);
            setIsPaused(false);
            await refetchActiveSession();
            notify.success("Timer iniciado");
        } catch (error: any) {
            notify.error(error.message || "Error al iniciar timer");
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
            notify.error(error.message || "Error al pausar timer");
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
            notify.error(error.message || "Error al reanudar timer");
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
            notify.error(error.message || "Error al detener timer");
        }
    }, [stopTimerMutation, mode, type, getDuration, refetchActiveSession, onSessionComplete]);

    const skipToNext = useCallback(async () => {
        // Prevent multiple simultaneous transitions
        if (isTransitioningRef.current) {
            return;
        }
        isTransitioningRef.current = true;

        // Clear the interval immediately to prevent further countdown
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        try {
            if (type === "POMODORO") {
                const currentMode = mode;
                let nextMode: TimerMode;

                if (currentMode === "WORK") {
                    // Use ref to get current value (avoid stale closure)
                    const newCompletedCount = completedPomodorosRef.current + 1;
                    setCompletedPomodoros(newCompletedCount);
                    completedPomodorosRef.current = newCompletedCount;

                    // Determine next mode based on updated count
                    nextMode = newCompletedCount % config.pomodorosUntilLongBreak === 0
                        ? "LONG_BREAK"
                        : "SHORT_BREAK";

                    // Stop current work session (mark as completed)
                    await stopTimerMutation.mutateAsync({ wasCompleted: true });

                    // Notify session complete
                    notifySessionComplete(currentMode);

                    // Only show completion toast if NOT auto-starting break
                    if (!config.autoStartBreaks) {
                        notify.pomodoro("¡Pomodoro completado!", "Has terminado un pomodoro. ¡Bien hecho!");
                    }

                    // Update UI state for next mode
                    setMode(nextMode);
                    setTimeLeft(getDuration(nextMode));
                    setIsRunning(false);
                    setIsPaused(false);

                    // Auto-start break if enabled
                    if (config.autoStartBreaks) {
                        try {
                            await startTimerMutation.mutateAsync({
                                taskId: taskId || undefined,
                                type: SESSION_TYPE_MAP[nextMode],
                            });
                            setIsRunning(true);
                            await refetchActiveSession();
                            notifyAutoStart(nextMode);
                            // Combined notification
                            if (nextMode === "LONG_BREAK") {
                                notify.longBreak(
                                    `¡Pomodoro completado!`,
                                    `Iniciando descanso largo. Relájate un poco.`
                                );
                            } else {
                                notify.shortBreak(
                                    `¡Pomodoro completado!`,
                                    `Iniciando descanso corto. Relájate un poco.`
                                );
                            }
                        } catch (error: any) {
                            console.error("Error auto-starting break:", error);
                            notify.error("Error al auto-iniciar descanso");
                        }
                    } else {
                        await refetchActiveSession();
                    }
                } else {
                    // Completed a break session (SHORT_BREAK or LONG_BREAK)
                    nextMode = "WORK";

                    // Stop current break session (mark as completed)
                    await stopTimerMutation.mutateAsync({ wasCompleted: true });

                    // Notify session complete
                    notifySessionComplete(currentMode);

                    // Only show completion toast if NOT auto-starting pomodoro
                    if (!config.autoStartPomodoros) {
                        if (currentMode === "LONG_BREAK") {
                            notify.longBreak("¡Descanso largo completado!", "Hora de volver al trabajo.");
                        } else {
                            notify.shortBreak("¡Descanso corto completado!", "Hora de volver al trabajo.");
                        }
                    }

                    // Update UI state for next mode
                    setMode(nextMode);
                    setTimeLeft(getDuration(nextMode));
                    setIsRunning(false);
                    setIsPaused(false);

                    // Auto-start next pomodoro if enabled
                    if (config.autoStartPomodoros) {
                        try {
                            await startTimerMutation.mutateAsync({
                                taskId: taskId || undefined,
                                type: SESSION_TYPE_MAP[nextMode],
                            });
                            setIsRunning(true);
                            await refetchActiveSession();
                            notifyAutoStart(nextMode);
                            // Combined notification
                            notify.pomodoro(
                                "¡Descanso completado!",
                                "Iniciando siguiente Pomodoro. ¡A trabajar!"
                            );
                        } catch (error: any) {
                            console.error("Error auto-starting pomodoro:", error);
                            notify.error("Error al auto-iniciar Pomodoro");
                        }
                    } else {
                        await refetchActiveSession();
                    }
                }
            } else {
                // CONTINUOUS mode - just stop
                await stopTimerMutation.mutateAsync({ wasCompleted: true });
                notifySessionComplete("WORK");
                setIsRunning(false);
                setIsPaused(false);
                await refetchActiveSession();
            }
        } catch (error: any) {
            console.error("Error in skipToNext:", error);
            notify.error("Error al cambiar de modo");
        } finally {
            isTransitioningRef.current = false;
        }
    }, [type, mode, config, getDuration, taskId, startTimerMutation, stopTimerMutation, refetchActiveSession, notifySessionComplete, notifyAutoStart]);

    const switchTask = useCallback(async (newTaskId: string) => {
        try {
            await switchTaskMutation.mutateAsync({
                newTaskId,
                type: type === "CONTINUOUS" ? "CONTINUOUS" : mode,
                splitReason: "TASK_SWITCH",
            });
            await refetchActiveSession();
            notify.success("Tarea cambiada");
        } catch (error: any) {
            notify.error(error.message || "Error al cambiar de tarea");
        }
    }, [mode, type, switchTaskMutation, refetchActiveSession]);

    // Keep refs updated with latest function references
    useEffect(() => {
        skipToNextRef.current = skipToNext;
    }, [skipToNext]);

    useEffect(() => {
        stopRef.current = stop;
    }, [stop]);

    // Timer countdown/countup effect
    useEffect(() => {
        if (isRunning && !isPaused && !isTransitioningRef.current) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (mode === "CONTINUOUS") {
                        return prev + 1;
                    }

                    if (prev <= 1) {
                        // Timer completed - trigger transition
                        // Use refs to get latest function references and avoid stale closures
                        setTimeout(() => {
                            if (!isTransitioningRef.current) {
                                if (type === "POMODORO") {
                                    skipToNextRef.current?.();
                                } else {
                                    stopRef.current?.(true);
                                }
                            }
                        }, 0);
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
    }, [isRunning, isPaused, type, mode]); // Removed skipToNext and stop - using refs instead

    const formatTime = (seconds: number): string => {
        return formatTimerDisplay(seconds);
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
