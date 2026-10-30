import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useTimerBackend, TimerSessionMode } from "@/hooks/use-timer-backend";
import { useUserPreferences, useUpdateTask } from "@/hooks/api";
import { desktopBridge, type TimerAction } from "@/lib/desktop-bridge";

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

const DEFAULT_CONFIG: TimerConfig = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    pomodorosUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
    notificationsEnabled: true,
};

const AUTOSTART_STORAGE_KEY = "ordo-timer-autostart";

interface AutoStartFlags {
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
}

function readAutoStartFlags(): AutoStartFlags {
    try {
        const raw = window.localStorage.getItem(AUTOSTART_STORAGE_KEY);
        if (!raw) return { autoStartBreaks: false, autoStartPomodoros: false };
        const parsed = JSON.parse(raw) as Partial<AutoStartFlags>;
        return {
            autoStartBreaks: parsed.autoStartBreaks === true,
            autoStartPomodoros: parsed.autoStartPomodoros === true,
        };
    } catch {
        return { autoStartBreaks: false, autoStartPomodoros: false };
    }
}

function writeAutoStartFlags(flags: AutoStartFlags): void {
    try {
        window.localStorage.setItem(AUTOSTART_STORAGE_KEY, JSON.stringify(flags));
    } catch {
        // Best-effort.
    }
}

interface TimerContextType {
    isRunning: boolean;
    isPaused: boolean;
    timeLeft: number;
    mode: TimerSessionMode;
    completedPomodoros: number;
    start: () => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    stop: (wasCompleted?: boolean) => Promise<void>;
    skipToNext: () => Promise<void>;
    goToPhase: (target: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK') => Promise<void>;
    formatTime: (seconds: number) => string;
    getProgress: () => number;
    activeSession: unknown;
    selectedTaskId: string | null;
    setSelectedTaskId: (taskId: string | null) => void;
    toggleTaskSelection: (taskId: string | null) => void;
    completeTask: () => void;
    pauseCount: number;
    config: TimerConfig;
    updateConfig: (patch: Partial<TimerConfig>) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
    const { data: preferences } = useUserPreferences();
    const updateTask = useUpdateTask();
    const [config, setConfig] = useState<TimerConfig>(() => ({
        ...DEFAULT_CONFIG,
        ...readAutoStartFlags(),
    }));
    const [timerType, setTimerType] = useState<"POMODORO" | "CONTINUOUS">("POMODORO");

    // Backend preferences use FLAT timer fields (pomodoroDuration,
    // shortBreakDuration, ...). There is no `timerConfig` object server-side.
    useEffect(() => {
        const prefs = preferences as unknown as Record<string, unknown> | undefined;
        if (!prefs) return;
        if (typeof prefs.timerMode === "string") {
             setTimerType(prefs.timerMode === "CONTINUOUS" ? "CONTINUOUS" : "POMODORO");
        }
        setConfig((prev) => ({
            ...prev,
            ...(typeof prefs.pomodoroDuration === "number" ? { workDuration: prefs.pomodoroDuration } : {}),
            ...(typeof prefs.shortBreakDuration === "number" ? { shortBreakDuration: prefs.shortBreakDuration } : {}),
            ...(typeof prefs.longBreakDuration === "number" ? { longBreakDuration: prefs.longBreakDuration } : {}),
            ...(typeof prefs.pomodorosUntilLongBreak === "number" ? { pomodorosUntilLongBreak: prefs.pomodorosUntilLongBreak } : {}),
            ...(typeof prefs.enableSounds === "boolean" ? { soundEnabled: prefs.enableSounds } : {}),
            ...(typeof prefs.enableNotifications === "boolean" ? { notificationsEnabled: prefs.enableNotifications } : {}),
        }));
    }, [preferences]);

    const updateConfig = useCallback((patch: Partial<TimerConfig>) => {
        setConfig((prev) => {
            const next = { ...prev, ...patch };
            // autoStart flags have no backend counterpart: persist locally so
            // they survive restarts (the legacy store persisted them).
            if (patch.autoStartBreaks !== undefined || patch.autoStartPomodoros !== undefined) {
                writeAutoStartFlags({
                    autoStartBreaks: next.autoStartBreaks,
                    autoStartPomodoros: next.autoStartPomodoros,
                });
            }
            return next;
        });
    }, []);

    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    const timer = useTimerBackend({
        type: timerType,
        config,
        taskId: selectedTaskId,
        onSessionComplete: () => {
             // Optional: native notification handled by main process if triggered by event
        }
    });

    // Sync selectedTaskId with activeSession
    useEffect(() => {
        const session = timer.activeSession as { taskId?: string | null } | null;
        if (session?.taskId) {
            setSelectedTaskId(session.taskId);
        }
    }, [timer.activeSession]);

    // Bridge: timer actions from the floating mini-timer window and the tray
    // operate on the unified timer (this provider is mounted on every
    // protected route, so actions work from any page).
    const { isRunning, isPaused } = timer;
    const startRef = useTimerActionRef(timer.start);
    const pauseRef = useTimerActionRef(timer.pause);
    const resumeRef = useTimerActionRef(timer.resume);
    const skipRef = useTimerActionRef(timer.skipToNext);
    const stopRef = useTimerActionRef(timer.stop);

    useEffect(() => {
        return desktopBridge.onTimerAction((action: TimerAction) => {
            switch (action.type) {
                case 'toggle':
                    if (isRunning && !isPaused) {
                        void pauseRef.current();
                    } else if (isPaused) {
                        void resumeRef.current();
                    } else {
                        void startRef.current();
                    }
                    break;
                case 'start':
                    void startRef.current();
                    break;
                case 'pause':
                    void pauseRef.current();
                    break;
                case 'resume':
                    void resumeRef.current();
                    break;
                case 'skip':
                    void skipRef.current();
                    break;
                case 'stop':
                    void stopRef.current(false);
                    break;
                default:
                    break;
            }
        });
    }, [isRunning, isPaused, startRef, pauseRef, resumeRef, skipRef, stopRef]);

    const toggleTaskSelection = (taskId: string | null) => {
        if (!taskId) {
            setSelectedTaskId(null);
            return;
        }
        setSelectedTaskId(prev => prev === taskId ? null : taskId);
    };

    const completeTask = () => {
        if (selectedTaskId) {
            updateTask.mutate({
                taskId: selectedTaskId,
                data: { status: "COMPLETED" }
            });
            timer.stop(true);
            setSelectedTaskId(null);
        }
    };

    return (
        <TimerContext.Provider
            value={{
                ...timer,
                selectedTaskId,
                setSelectedTaskId,
                toggleTaskSelection,
                completeTask,
                config,
                updateConfig,
            }}
        >
            {children}
        </TimerContext.Provider>
    );
}

/** Stable ref mirror for async timer actions used by the bridge effect. */
function useTimerActionRef<T extends (...args: never[]) => Promise<unknown>>(fn: T) {
    const ref = useRef(fn);
    ref.current = fn;
    return ref;
}

export function useTimer() {
    const context = useContext(TimerContext);
    if (context === undefined) {
        throw new Error("useTimer must be used within a TimerProvider");
    }
    return context;
}

// Legacy alias if needed, or update consumers
export const useTimerContext = useTimer;
