"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTimer } from "@/components/providers/timer-provider";
import { TaskSelector } from "./task-selector";
import { useTranslations } from "next-intl";
import { PomodoroTimer as PomodoroTimerUI, type TimerState, type TimerActions } from "@ordo-todo/ui";
import { nextMode, durationForMode } from "@ordo-todo/core";

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
    defaultMode: config?.defaultMode || 'POMODORO', // Safety check
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

  // Next-phase label for the skip confirmation ("Descanso corto (5:00)").
  const shortBreakLabel = t('modes.shortBreak');
  const longBreakLabel = t('modes.longBreak');
  const skipTargetLabel = (() => {
    if (!config || mode !== 'WORK') return undefined;
    try {
      const next = nextMode('WORK', completedPomodoros, config);
      const secs = durationForMode(next, config);
      const mm = String(Math.floor(secs / 60)).padStart(2, '0');
      const ss = String(secs % 60).padStart(2, '0');
      const name = next === 'LONG_BREAK' ? longBreakLabel : shortBreakLabel;
      return `${name} (${mm}:${ss})`;
    } catch {
      return undefined;
    }
  })();

  const labels = {
    stopwatch: t('modes.stopwatch'),
    pomodoroCount: (count: number) => t('modes.pomodoroCount', { count }),
    shortBreak: shortBreakLabel,
    longBreak: longBreakLabel,
    paused: t('paused'),
    pauseCount: (count: number) => t('pauses', { count }),
    skipConfirmTitle: (phase: string) => t.has('skipConfirm.title')
      ? t('skipConfirm.title', { phase })
      : `¿Saltar a ${phase}?`,
    skipConfirmDescription: t.has('skipConfirm.description')
      ? t('skipConfirm.description')
      : 'La fase actual se cerrará como completada.',
    skipConfirmDescriptionNoCredit: t.has('skipConfirm.descriptionNoCredit')
      ? t('skipConfirm.descriptionNoCredit')
      : 'Saltar ahora no contará como pomodoro completado.',
    skipConfirmOk: t.has('skipConfirm.ok') ? t('skipConfirm.ok') : 'Saltar',
    cancel: t.has('cancel') ? t('cancel') : 'Cancelar',
    skipTargetLabel,
    skipButtonTitle: t.has('skipButton') ? t('skipButton') : 'Saltar al siguiente bloque',
    switchTaskTitle: t.has('switchTask.title') ? t('switchTask.title') : 'Cambiar Tarea',
    switchTaskDescription: t.has('switchTask.description') ? t('switchTask.description') : 'Selecciona una nueva tarea para continuar.',
    switchTaskButtonTitle: t.has('switchTask.buttonTitle') ? t('switchTask.buttonTitle') : 'Cambiar tarea',
    enterFocusMode: t.has('enterFocusMode') ? t('enterFocusMode') : "Entrar al Modo Enfoque",
    currentTask: t.has('currentTask') ? t('currentTask') : "Tarea Asignada",
    horizontalView: t.has('horizontalView') ? t('horizontalView') : "Vista Horizontal",
    circularView: t.has('circularView') ? t('circularView') : "Vista Circular",
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
      showSwitchDialog={showSwitchDialog}
      setShowSwitchDialog={setShowSwitchDialog}
    />
  );
}
