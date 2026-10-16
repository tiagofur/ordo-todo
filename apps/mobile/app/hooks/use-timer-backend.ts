import { useState, useEffect, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatTimerDisplay } from "@ordo-todo/hooks";
import {
    useActiveTimer,
    useStartTimer,
    useStopTimer,
    usePauseTimer,
    useResumeTimer,
    useSwitchTask
} from "@/app/lib/shared-hooks";
import Toast from "react-native-toast-message";

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

export interface TimerConfig {
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

    // Initial load for completed pomodoros from AsyncStorage
    useEffect(() => {
        const loadCompletedPomodoros = async () => {
            try {
                const saved = await AsyncStorage.getItem("ordo-completed-pomodoros");
                const savedDate = await AsyncStorage.getItem("ordo-pomodoros-date");
                const today = new Date().toDateString();

                // Reset counter if it's a new day
                if (savedDate !== today) {
                    await AsyncStorage.setItem("ordo-pomodoros-date", today);
                    await AsyncStorage.setItem("ordo-completed-pomodoros", "0");
                    setCompletedPomodoros(0);
                } else {
                    setCompletedPomodoros(saved ? parseInt(saved, 10) : 0);
                }
            } catch (e) {
                console.warn("Error loading timer stats", e);
            }
        };
        loadCompletedPomodoros();
    }, []);

    // Use a ref to track current completed pomodoros to avoid stale closure issues
    const completedPomodorosRef = useRef(completedPomodoros);
    // Flag to prevent multiple transitions
    const isTransitioningRef = useRef(false);

    useEffect(() => {
        completedPomodorosRef.current = completedPomodoros;
        const saveStats = async () => {
            try {
                const today = new Date().toDateString();
                await AsyncStorage.setItem("ordo-completed-pomodoros", completedPomodoros.toString());
                await AsyncStorage.setItem("ordo-pomodoros-date", today);
            } catch (e) {
                console.warn("Error saving timer stats", e);
            }
        };
        saveStats();
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

    const notifyInfo = (title: string, msg: string) => {
        Toast.show({ type: 'info', text1: title, text2: msg });
    };

    const start = useCallback(async () => {
        try {
            await startTimerMutation.mutateAsync({
                taskId: (taskId || undefined) as any,
                type: type === "CONTINUOUS" ? "CONTINUOUS" : mode,
            });
            setIsRunning(true);
            setIsPaused(false);
            await refetchActiveSession();
            Toast.show({ type: 'success', text1: "Timer iniciado" });
        } catch (error: any) {
            Toast.show({ type: 'error', text1: error.message || "Error al iniciar timer" });
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
            Toast.show({ type: 'error', text1: error.message || "Error al pausar timer" });
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
            Toast.show({ type: 'error', text1: error.message || "Error al reanudar timer" });
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
            Toast.show({ type: 'error', text1: error.message || "Error al detener timer" });
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

                    // Only show completion toast if NOT auto-starting break
                    if (!config.autoStartBreaks) {
                        Toast.show({ type: 'success', text1: "¡Pomodoro completado!", text2: "Has terminado un pomodoro." });
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

                            if (nextMode === "LONG_BREAK") {
                                notifyInfo("¡Pomodoro completado!", "Iniciando descanso largo.");
                            } else {
                                notifyInfo("¡Pomodoro completado!", "Iniciando descanso corto.");
                            }
                        } catch (error: any) {
                            console.error("Error auto-starting break:", error);
                            Toast.show({ type: 'error', text1: "Error al auto-iniciar descanso" });
                        }
                    } else {
                        await refetchActiveSession();
                    }
                } else {
                    // Completed a break session (SHORT_BREAK or LONG_BREAK)
                    nextMode = "WORK";

                    // Stop current break session (mark as completed)
                    await stopTimerMutation.mutateAsync({ wasCompleted: true });

                    // Only show completion toast if NOT auto-starting pomodoro
                    if (!config.autoStartPomodoros) {
                        Toast.show({ type: 'success', text1: "¡Descanso completado!", text2: "Hora de volver al trabajo." });
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
                            notifyInfo("¡Descanso completado!", "Iniciando siguiente Pomodoro.");
                        } catch (error: any) {
                            console.error("Error auto-starting pomodoro:", error);
                            Toast.show({ type: 'error', text1: "Error al auto-iniciar Pomodoro" });
                        }
                    } else {
                        await refetchActiveSession();
                    }
                }
            } else {
                // CONTINUOUS mode - just stop
                await stopTimerMutation.mutateAsync({ wasCompleted: true });
                setIsRunning(false);
                setIsPaused(false);
                await refetchActiveSession();
            }
        } catch (error: any) {
            console.error("Error in skipToNext:", error);
            Toast.show({ type: 'error', text1: "Error al cambiar de modo" });
        } finally {
            isTransitioningRef.current = false;
        }
    }, [type, mode, config, getDuration, taskId, startTimerMutation, stopTimerMutation, refetchActiveSession]);

    const switchTask = useCallback(async (newTaskId: string) => {
        try {
            await switchTaskMutation.mutateAsync({
                newTaskId,
                type: type === "CONTINUOUS" ? "CONTINUOUS" : mode,
                splitReason: "TASK_SWITCH",
            });
            await refetchActiveSession();
            Toast.show({ type: 'success', text1: "Tarea cambiada" });
        } catch (error: any) {
            Toast.show({ type: 'error', text1: error.message || "Error al cambiar de tarea" });
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
    }, [isRunning, isPaused, type, mode]);

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
