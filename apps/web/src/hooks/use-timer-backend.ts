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
import { useActiveTimer, useStartTimer, useStopTimer, usePauseTimer, useResumeTimer, useSwitchTask, useTimerStats, useSessionHistory } from "@/lib/api-hooks";
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

/**
 * Start of the current local day as an ISO string (for the day-scoped stats
 * query that feeds the backend-owned pomodoro counter, ODD 014 T4).
 */
function startOfTodayISO(): string {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
}

export function useTimerBackend({ type, config, taskId, onSessionComplete }: UseTimerBackendProps): UseTimerBackendReturn {
    const { data: activeSession, refetch: refetchActiveSession } = useActiveTimer();
    const { data: todayStats } = useTimerStats({ startDate: startOfTodayISO() });
    // Last closed session for initial turn derivation (ODD 015, I11/I12).
    const { data: lastClosedPage } = useSessionHistory({ completedOnly: true, limit: 1 });
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

    const lastClosed = lastClosedPage?.sessions?.[0];
    return useSharedTimerBackend({
        type,
        config,
        taskId,
        api,
        notify: notifyAdapter,
        completedToday: todayStats?.pomodorosCompleted ?? null,
        lastClosedSession: lastClosed?.endedAt
            ? {
                type: lastClosed.type as TimerBackendMode,
                endedAt: lastClosed.endedAt,
                wasCompleted: lastClosed.wasCompleted,
            }
            : null,
        onSessionComplete,
    });
}
