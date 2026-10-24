/**
 * Mobile timer hook (ODD 014, T2d/S2).
 *
 * Thin adapter over the shared `useTimerBackend` from `@ordo-todo/hooks`:
 * it wires React Query mutations, Toast messages and AsyncStorage-backed
 * counter persistence. All cycle logic lives in the shared hook + engine.
 */
import { useEffect, useMemo, useRef } from "react";
import * as Notifications from "expo-notifications";
import {
    useTimerBackend as useSharedTimerBackend,
    type TimerBackendMode,
    type TimerBackendSession,
    type TimerBackendType,
    type UseTimerBackendReturn,
} from "@ordo-todo/hooks";
import {
    useActiveTimer,
    useStartTimer,
    useStopTimer,
    usePauseTimer,
    useResumeTimer,
    useSwitchTask,
    useTimerStats,
    useSessionHistory
} from "@/app/lib/shared-hooks";
import Toast from "react-native-toast-message";

// Re-export shared types under the historical mobile names so the existing
// screen keeps working untouched.
export type TimerMode = TimerBackendMode;
export type TimerType = TimerBackendType;
export type { UseTimerBackendReturn };

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
                taskId: (input.taskId || undefined) as string,
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
            // Toasts preserved from the pre-unification mobile hook.
            if (mode === "WORK") {
                if (!config.autoStartBreaks) {
                    Toast.show({ type: 'success', text1: "¡Pomodoro completado!", text2: "Has terminado un pomodoro." });
                }
            } else if (mode === "SHORT_BREAK" || mode === "LONG_BREAK") {
                if (!config.autoStartPomodoros) {
                    Toast.show({ type: 'success', text1: "¡Descanso completado!", text2: "Hora de volver al trabajo." });
                }
            }
        },
        autoStart: (mode: TimerBackendMode) => {
            if (mode === "LONG_BREAK") {
                Toast.show({ type: 'info', text1: "¡Pomodoro completado!", text2: "Iniciando descanso largo." });
            } else if (mode === "SHORT_BREAK") {
                Toast.show({ type: 'info', text1: "¡Pomodoro completado!", text2: "Iniciando descanso corto." });
            } else if (mode === "WORK") {
                Toast.show({ type: 'info', text1: "¡Descanso completado!", text2: "Iniciando siguiente Pomodoro." });
            }
        },
        success: (message: string) => {
            Toast.show({ type: 'success', text1: message });
        },
        error: (message: string) => {
            Toast.show({ type: 'error', text1: message });
        },
    }), [config.autoStartBreaks, config.autoStartPomodoros]);

    const lastClosed = lastClosedPage?.sessions?.[0];
    const timer = useSharedTimerBackend({
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

    // Background completion notification (ODD 014 T5): while a timed phase
    // runs, schedule an OS notification at its deadline so the user is told
    // even with the app backgrounded. Cancelled on pause/stop/transition/
    // unmount. Depends on run-state only — never on timeLeft (no reschedule
    // per tick).
    const scheduledIdRef = useRef<string | null>(null);
    const { isRunning, isPaused, mode, timeLeft } = timer;
    useEffect(() => {
        const cancelScheduled = () => {
            if (scheduledIdRef.current) {
                const id = scheduledIdRef.current;
                scheduledIdRef.current = null;
                Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
            }
        };

        if (!isRunning || isPaused || mode === "CONTINUOUS" || timeLeft <= 0) {
            cancelScheduled();
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const { status } = await Notifications.getPermissionsAsync();
                if (status !== "granted" || cancelled) return;
                const id = await Notifications.scheduleNotificationAsync({
                    content: {
                        title: mode === "WORK" ? "🍅 Pomodoro completado" : "☕ Descanso terminado",
                        body: mode === "WORK"
                            ? "Excelente trabajo. Hora de tomar un descanso."
                            : "Hora de volver al trabajo.",
                        sound: "default",
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                        date: new Date(Date.now() + timeLeft * 1000),
                    },
                });
                if (!cancelled) {
                    scheduledIdRef.current = id;
                } else {
                    Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
                }
            } catch {
                // Best-effort: foreground Toasts still fire on completion.
            }
        })();

        return () => {
            cancelled = true;
            cancelScheduled();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRunning, isPaused, mode]);

    return timer;
}
