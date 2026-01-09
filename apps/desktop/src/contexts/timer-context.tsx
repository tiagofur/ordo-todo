
import { createContext, useContext, useEffect, useState } from "react";
import { useTimerBackend, TimerSessionMode } from "@/hooks/use-timer-backend";
import { useUserPreferences, useUpdateTask } from "@/hooks/api";
import { TaskStatus } from "@ordo-todo/api-client";

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
    formatTime: (seconds: number) => string;
    getProgress: () => number;
    activeSession: any;
    selectedTaskId: string | null;
    setSelectedTaskId: (taskId: string | null) => void;
    toggleTaskSelection: (taskId: string | null) => void;
    completeTask: () => void;
    pauseCount: number;
    config: TimerConfig;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
    const { data: preferences } = useUserPreferences();
    const updateTask = useUpdateTask();
    const [config, setConfig] = useState<TimerConfig>(DEFAULT_CONFIG);

    useEffect(() => {
        const prefs = preferences as any;
        if (prefs?.timerConfig) {
             setConfig({
                 ...DEFAULT_CONFIG,
                 ...prefs.timerConfig,
             });
        }
    }, [preferences]);
   
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    const timer = useTimerBackend({
        type: "POMODORO", // Default type
        config,
        taskId: selectedTaskId,
        onSessionComplete: () => {
             // Optional: native notification handled by main process if triggered by event
        }
    });

    // Sync selectedTaskId with activeSession
    useEffect(() => {
        if (timer.activeSession?.taskId) {
            setSelectedTaskId(timer.activeSession.taskId);
        }
    }, [timer.activeSession]);

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
                data: { status: "DONE" as TaskStatus } 
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
                pauseCount: 0, // Not currently tracked in backend hook return
                config,
            }}
        >
            {children}
        </TimerContext.Provider>
    );
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
