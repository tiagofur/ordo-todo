/**
 * Mobile timer hook (ODD 014, T2d/S2).
 *
 * Thin adapter over the shared `useTimerBackend` from `@ordo-todo/hooks`:
 * it wires React Query mutations, Toast messages and AsyncStorage-backed
 * counter persistence. All cycle logic lives in the shared hook + engine.
 */
import { useEffect, useMemo, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
    useSwitchTask
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
 * AsyncStorage-backed synchronous storage adapter: an in-memory cache serves
 * the shared hook's synchronous get/set, hydrated once from AsyncStorage on
 * mount and persisted back (fire-and-forget) on every write.
 */
function useAsyncStorageAdapter() {
    const cacheRef = useRef<Map<string, string>>(new Map());

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const pairs = await AsyncStorage.multiGet([
                    "ordo-completed-pomodoros",
                    "ordo-pomodoros-date",
                ]);
                if (cancelled) return;
                for (const [key, value] of pairs) {
                    if (value !== null) cacheRef.current.set(key, value);
                }
            } catch {
                // Best-effort: fall back to the in-memory cache.
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    return useMemo(() => ({
        get: (key: string): string | null => cacheRef.current.get(key) ?? null,
        set: (key: string, value: string): void => {
            cacheRef.current.set(key, value);
            AsyncStorage.setItem(key, value).catch(() => undefined);
        },
    }), []);
}

export function useTimerBackend({ type, config, taskId, onSessionComplete }: UseTimerBackendProps): UseTimerBackendReturn {
    const { data: activeSession, refetch: refetchActiveSession } = useActiveTimer();
    const startTimerMutation = useStartTimer();
    const stopTimerMutation = useStopTimer();
    const pauseTimerMutation = usePauseTimer();
    const resumeTimerMutation = useResumeTimer();
    const switchTaskMutation = useSwitchTask();

    const storage = useAsyncStorageAdapter();

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
