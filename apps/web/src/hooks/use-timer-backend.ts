"use client";

/**
 * Web timer hook (ODD 014, T2b/S2).
 *
 * Thin adapter over the shared `useTimerBackend` from `@ordo-todo/hooks`:
 * it wires React Query mutations, web toasts + sounds/OS notifications and
 * localStorage. All cycle logic lives in the shared hook + pure engine.
 */
import { useMemo } from "react";
import {
    useTimerBackend as useSharedTimerBackend,
    type TimerBackendMode,
    type TimerBackendSession,
    type TimerBackendType,
    type UseTimerBackendReturn,
} from "@ordo-todo/hooks";
import { useActiveTimer, useStartTimer, useStopTimer, usePauseTimer, useResumeTimer, useSwitchTask } from "@/lib/api-hooks";
import { notify } from "@/lib/notify";
import { useTimerNotifications } from "./use-timer-notifications";

// Re-export shared types under the historical web names so existing
// consumers (timer-provider) keep working untouched.
export type TimerMode = TimerBackendMode;
export type TimerType = TimerBackendType;
export type { UseTimerBackendReturn };

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

const storage = {
    get: (key: string): string | null => {
        if (typeof window === "undefined") return null;
        try {
            return window.localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    set: (key: string, value: string): void => {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.setItem(key, value);
        } catch {
            // Best-effort (e.g. private mode).
        }
    },
};

export function useTimerBackend({ type, config, taskId, onSessionComplete }: UseTimerBackendProps): UseTimerBackendReturn {
    const { data: activeSession, refetch: refetchActiveSession } = useActiveTimer();
    const startTimerMutation = useStartTimer();
    const stopTimerMutation = useStopTimer();
    const pauseTimerMutation = usePauseTimer();
    const resumeTimerMutation = useResumeTimer();
    const switchTaskMutation = useSwitchTask();

    const { notifySessionComplete, notifyAutoStart } = useTimerNotifications({
        soundEnabled: config.soundEnabled,
        notificationsEnabled: config.notificationsEnabled,
    });

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
            notifySessionComplete(mode);
            // Phase toasts preserved from the pre-unification web hook.
            if (mode === "WORK") {
                if (!config.autoStartBreaks) {
                    notify.pomodoro("¡Pomodoro completado!", "Has terminado un pomodoro. ¡Bien hecho!");
                }
            } else if (mode === "SHORT_BREAK") {
                if (!config.autoStartPomodoros) {
                    notify.shortBreak("¡Descanso corto completado!", "Hora de volver al trabajo.");
                }
            } else if (mode === "LONG_BREAK") {
                if (!config.autoStartPomodoros) {
                    notify.longBreak("¡Descanso largo completado!", "Hora de volver al trabajo.");
                }
            }
        },
        autoStart: (mode: TimerBackendMode) => {
            notifyAutoStart(mode);
            if (mode === "LONG_BREAK") {
                notify.longBreak("¡Pomodoro completado!", "Iniciando descanso largo. Relájate un poco.");
            } else if (mode === "SHORT_BREAK") {
                notify.shortBreak("¡Pomodoro completado!", "Iniciando descanso corto. Relájate un poco.");
            } else if (mode === "WORK") {
                notify.pomodoro("¡Descanso completado!", "Iniciando siguiente Pomodoro. ¡A trabajar!");
            }
        },
        success: (message: string) => {
            notify.success(message);
        },
        error: (message: string) => {
            notify.error(message);
        },
    }), [config.autoStartBreaks, config.autoStartPomodoros, notifySessionComplete, notifyAutoStart]);

    return useSharedTimerBackend({
        type,
        config,
        taskId,
        api,
        notify: notifyAdapter,
        storage,
        onSessionComplete,
    });
}
