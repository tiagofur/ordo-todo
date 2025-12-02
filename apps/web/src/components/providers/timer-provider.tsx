"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useTimerBackend, TimerMode, TimerType } from "@/hooks/use-timer-backend";
import { useTimerSettings } from "@/hooks/use-timer-settings";
import { notify } from "@/lib/notify";

interface TimerContextType {
  isRunning: boolean;
  isPaused: boolean;
  timeLeft: number;
  mode: TimerMode;
  completedPomodoros: number;
  pauseCount: number;
  totalPauseTime: number;
  start: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: (wasCompleted?: boolean) => Promise<void>;
  skipToNext: () => Promise<void>;
  switchTask: (taskId: string) => Promise<void>;
  formatTime: (seconds: number) => string;
  getProgress: () => number;
  activeSession: any;
  selectedTaskId: string | null;
  setSelectedTaskId: (taskId: string | null) => void;
  config: any;
  isLoaded: boolean;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const { settings: config, isLoaded } = useTimerSettings();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const timer = useTimerBackend({
    type: config.defaultMode,
    config,
    taskId: selectedTaskId,
    onSessionComplete: () => {
      // Toast is already handled in useTimerBackend for some cases, but we can add a generic one here if needed
      // Actually useTimerBackend calls notifySessionComplete which might handle notifications
      // But PomodoroTimer had: toast.success("¡Sesión completada!");
      // We can keep it here.
      notify.success("¡Sesión completada!");
    },
  });

  // Sync selectedTaskId with activeSession
  useEffect(() => {
    if (timer.activeSession?.taskId) {
      setSelectedTaskId(timer.activeSession.taskId);
    }
  }, [timer.activeSession]);

  if (!isLoaded) return null;

  return (
    <TimerContext.Provider
      value={{
        ...timer,
        selectedTaskId,
        setSelectedTaskId,
        config,
        isLoaded,
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
