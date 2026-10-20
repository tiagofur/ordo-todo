/**
 * Desktop timer hook (ODD 014, T2c/S2).
 *
 * Thin adapter over the shared `useTimerBackend` from `@ordo-todo/hooks`:
 * it wires React Query mutations, sonner toasts + native notifications/tray
 * sync and localStorage. All cycle logic lives in the shared hook + engine.
 *
 * This replaces the former desktop copy, which never transitioned on expiry
 * (countdown called `stop()` directly), never incremented the counter and
 * never reached LONG_BREAK.
 */
import { useEffect, useMemo } from "react";
import { formatTimerDisplay } from "@ordo-todo/core";
import {
    useTimerBackend as useSharedTimerBackend,
    type TimerBackendMode,
    type TimerBackendSession,
    type UseTimerBackendReturn,
} from "@ordo-todo/hooks";
import { useActiveTimer, useStartTimer, useStopTimer, usePauseTimer, useResumeTimer, useSwitchTask } from "@/hooks/api";
import { toast } from "sonner";
import { desktopBridge } from "@/lib/desktop-bridge";

// Historical desktop names kept so existing consumers (timer-context)
// keep working untouched. IDLE is preserved as a type for the floating
// window / bridge, but the hook itself never reports it (initial mode is
// WORK, matching web/mobile).
export type TimerSessionMode = TimerBackendMode | "IDLE";
export type TimerType = "POMODORO" | "STOPWATCH" | "CONTINUOUS";
export type { UseTimerBackendReturn };

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

const storage = {
    get: (key: string): string | null => {
        try {
            return window.localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    set: (key: string, value: string): void => {
        try {
            window.localStorage.setItem(key, value);
        } catch {
            // Best-effort.
        }
    },
};

export function useTimerBackend({ type, config, taskId, onSessionComplete }: UseTimerBackendProps): UseTimerBackendReturn {
    // STOPWATCH is vestigial (no consumer passes it); treat it as CONTINUOUS.
    const sharedType = type === "POMODORO" ? "POMODORO" : "CONTINUOUS";

    const { data: activeSession, refetch: refetchActiveSession } = useActiveTimer();
    const startTimerMutation = useStartTimer();
    const stopTimerMutation = useStopTimer();
    const pauseTimerMutation = usePauseTimer();
    const resumeTimerMutation = useResumeTimer();
    const switchTaskMutation = useSwitchTask();

    const adaptedSession: TimerBackendSession | null = useMemo(() => {
        if (!activeSession) return null;
        return {
            type: activeSession.type as TimerBackendMode,
            elapsedSeconds: activeSession.elapsedSeconds,
            isPaused: activeSession.isPaused,
            taskId: activeSession.taskId ?? null,
            pauseCount: activeSession.pauseCount ?? 0,
            totalPauseTime: activeSession.totalPauseTime ?? 0,
            currentPauseStart: activeSession.currentPauseStart ?? null,
        };
    }, [activeSession]);

    const api = useMemo(() => ({
        activeSession: adaptedSession,
        start: async (input: { taskId?: string; type: TimerBackendMode }) => {
            await startTimerMutation.mutateAsync({
                taskId: input.taskId,
                type: input.type,
            });
        },
        stop: async (input: { wasCompleted: boolean }) => {
            await stopTimerMutation.mutateAsync({ wasCompleted: input.wasCompleted });
        },
        pause: async (input: { pauseStartedAt: Date }) => {
            await pauseTimerMutation.mutateAsync({ pauseStartedAt: input.pauseStartedAt });
        },
        resume: async (input: { pauseStartedAt: Date }) => {
            await resumeTimerMutation.mutateAsync({ pauseStartedAt: input.pauseStartedAt });
        },
        switchTask: async (input: { newTaskId: string; type: TimerBackendMode; splitReason: string }) => {
            await switchTaskMutation.mutateAsync({
                newTaskId: input.newTaskId,
                type: input.type,
                splitReason: input.splitReason,
            });
        },
        refetch: async () => {
            await refetchActiveSession();
        },
    }), [
        adaptedSession,
        startTimerMutation,
        stopTimerMutation,
        pauseTimerMutation,
        resumeTimerMutation,
        switchTaskMutation,
        refetchActiveSession,
    ]);

    const notifyAdapter = useMemo(() => ({
        sessionComplete: (mode: TimerBackendMode) => {
            // Native notification on every completed phase (new in T2c: the
            // former desktop copy never notified on expiry).
            if (mode === "WORK") {
                void desktopBridge.sendNotification(
                    "Pomodoro completado",
                    "¡Excelente trabajo! Tómate un merecido descanso.",
                );
            } else if (mode === "SHORT_BREAK") {
                void desktopBridge.sendNotification(
                    "Descanso corto finalizado",
                    "Hora de volver al enfoque y retomar tus tareas.",
                );
            } else if (mode === "LONG_BREAK") {
                void desktopBridge.sendNotification(
                    "Descanso largo finalizado",
                    "¿Listo para arrancar un nuevo ciclo productivo?",
                );
            }
        },
        autoStart: (mode: TimerBackendMode) => {
            if (mode === "WORK") {
                toast.success("Iniciando siguiente Pomodoro. ¡A trabajar!");
            } else if (mode === "SHORT_BREAK") {
                toast.success("Iniciando descanso corto. Relájate un poco.");
            } else if (mode === "LONG_BREAK") {
                toast.success("Iniciando descanso largo. Relájate un poco.");
            }
        },
        success: (message: string) => {
            toast.success(message);
        },
        error: (message: string) => {
            toast.error(message);
        },
    }), []);

    const timer = useSharedTimerBackend({
        type: sharedType,
        config,
        taskId,
        api,
        notify: notifyAdapter,
        storage,
        onSessionComplete,
    });

    // Tray title + floating mini-timer sync, preserved from the former
    // desktop copy.
    useEffect(() => {
        const formatted = formatTimerDisplay(timer.timeLeft);
        if (timer.isRunning && !timer.isPaused) {
            void desktopBridge.updateTrayTitle(formatted);
        } else if (timer.isPaused) {
            void desktopBridge.updateTrayTitle(`⏸ ${formatted}`);
        } else {
            void desktopBridge.updateTrayTitle('Ordo');
        }

        void desktopBridge.broadcastTimerState({
            timeRemaining: formatted,
            mode: timer.mode as "WORK" | "SHORT_BREAK" | "LONG_BREAK" | "IDLE",
            isRunning: timer.isRunning,
            isPaused: timer.isPaused,
            taskTitle: (timer.activeSession as { task?: { title?: string } } | null)?.task?.title || null,
            progress: 0,
        });
    }, [timer.isRunning, timer.isPaused, timer.timeLeft, timer.mode, timer.activeSession]);

    return timer;
}
