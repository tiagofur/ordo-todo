"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTimer } from "@/components/providers/timer-provider";
import { TaskSelector } from "./task-selector";
import { useTranslations } from "next-intl";
import { PomodoroTimer as PomodoroTimerUI, type TimerState, type TimerActions } from "@ordo-todo/ui";

/**
 * PomodoroTimer - Web wrapper for the shared PomodoroTimer component
 * 
 * Integrates the platform-agnostic UI component with:
 * - useTimer hook for state management
 * - next-intl for translations
 * - Next.js router for navigation
 */
export function PomodoroTimer() {
  const t = useTranslations('PomodoroTimer');
  const router = useRouter();
  const { 
    config, 
    isLoaded,
    isRunning,
    isPaused,
    timeLeft,
    mode,
    completedPomodoros,
    pauseCount,
    start,
    pause,
    resume,
    stop,
    skipToNext,
    switchTask,
    getProgress,
    selectedTaskId,
    setSelectedTaskId
  } = useTimer();

  const [showSwitchDialog, setShowSwitchDialog] = useState(false);

  const handleSwitchTask = async (newTaskId: string | null) => {
    if (!newTaskId) return;
    await switchTask(newTaskId);
    setSelectedTaskId(newTaskId);
    setShowSwitchDialog(false);
  };

  // Map hook state to component props
  const timerState: TimerState = {
    isLoaded,
    isRunning,
    isPaused,
    timeLeft,
    mode,
    completedPomodoros,
    pauseCount,
    defaultMode: config.defaultMode,
    selectedTaskId,
    progress: getProgress(),
  };

  const timerActions: TimerActions = {
    start,
    pause,
    resume,
    stop,
    skipToNext,
    switchTask,
    setSelectedTaskId,
  };

  const labels = {
    stopwatch: t('modes.stopwatch'),
    pomodoroCount: (count: number) => t('modes.pomodoroCount', { count }),
    shortBreak: t('modes.shortBreak'),
    longBreak: t('modes.longBreak'),
    paused: t('paused'),
    pauseCount: (count: number) => t('pauses', { count }),
    switchTaskTitle: t('switchTask.title'),
    switchTaskDescription: t('switchTask.description'),
    switchTaskButtonTitle: t('switchTask.buttonTitle'),
    enterFocusMode: t('enterFocusMode') || "Enter Focus Mode",
  };

  return (
    <PomodoroTimerUI
      state={timerState}
      actions={timerActions}
      TaskSelectorComponent={
        <TaskSelector 
          selectedTaskId={selectedTaskId} 
          onSelect={setSelectedTaskId} 
          disabled={isRunning && !isPaused}
        />
      }
      onFocusModeClick={() => router.push('/focus')}
      labels={labels}
    />
  );
}
