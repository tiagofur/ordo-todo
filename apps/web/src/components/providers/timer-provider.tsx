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

// Default context for SSR
const defaultTimerContext: TimerContextType = {
  isRunning: false,
  isPaused: false,
  timeLeft: 0,
  mode: "WORK" as TimerMode,
  completedPomodoros: 0,
  pauseCount: 0,
  totalPauseTime: 0,
  start: async () => {},
  pause: async () => {},
  resume: async () => {},
  stop: async () => {},
  skipToNext: async () => {},
  switchTask: async () => {},
  formatTime: () => "00:00",
  getProgress: () => 0,
  activeSession: null,
  selectedTaskId: null,
  setSelectedTaskId: () => {},
  config: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    pomodorosUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
    notificationsEnabled: true,
    defaultMode: "POMODORO",
  },
  isLoaded: false,
};

const TimerContext = createContext<TimerContextType>(defaultTimerContext);

/**
 * Inner component that uses React Query hooks
 * Only rendered when mounted on client
 */
function TimerProviderInner({ children }: { children: React.ReactNode }) {
  const { settings: config, isLoaded } = useTimerSettings();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const timer = useTimerBackend({
    type: config.defaultMode,
    config,
    taskId: selectedTaskId,
    onSessionComplete: () => {
      notify.success("¡Sesión completada!");
    },
  });

  // Sync selectedTaskId with activeSession
  useEffect(() => {
    if (timer.activeSession?.taskId) {
      setSelectedTaskId(timer.activeSession.taskId);
    }
  }, [timer.activeSession]);

  if (!isLoaded) return <>{children}</>;

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

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR, just render children with default context
  if (!mounted) {
    return (
      <TimerContext.Provider value={defaultTimerContext}>
        {children}
      </TimerContext.Provider>
    );
  }

  // On client, use the full provider with React Query hooks
  return <TimerProviderInner>{children}</TimerProviderInner>;
}

export function useTimer() {
  return useContext(TimerContext);
}
