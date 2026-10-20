import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTimerContext } from "@/contexts/timer-context";
import { TaskSelector } from "./task-selector";
import { useTranslation } from "react-i18next";
import {
  PomodoroTimer as PomodoroTimerUI,
  type TimerState,
  type TimerActions,
} from "@ordo-todo/ui";
import { nextMode, durationForMode } from "@ordo-todo/core";

export function PomodoroTimer() {
  const { t } = (useTranslation as any)();
  const navigate = useNavigate();
  const {
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
    getProgress,
    selectedTaskId,
    setSelectedTaskId,
    config,
  } = useTimerContext();

  const [showSwitchDialog, setShowSwitchDialog] = useState(false);

  const handleSwitchTask = async (newTaskId: string) => {
    setSelectedTaskId(newTaskId);
    setShowSwitchDialog(false);
  };

  const timerState: TimerState = {
    isLoaded: true,
    isRunning,
    isPaused,
    timeLeft,
    mode: mode as any,
    completedPomodoros,
    pauseCount,
    defaultMode: "POMODORO",
    selectedTaskId,
    progress: getProgress(),
  };

  const timerActions: TimerActions = {
    start,
    pause,
    resume,
    stop,
    skipToNext,
    switchTask: handleSwitchTask,
    setSelectedTaskId,
  };

  // Next-phase label for the skip confirmation ("Descanso corto (5:00)").
  const shortBreakLabel = t("Timer.modes.shortBreak", "Descanso Corto");
  const longBreakLabel = t("Timer.modes.longBreak", "Descanso Largo");
  const skipTargetLabel = (() => {
    if (!config || mode !== "WORK") return undefined;
    try {
      const next = nextMode("WORK", completedPomodoros, config);
      const secs = durationForMode(next, config);
      const mm = String(Math.floor(secs / 60)).padStart(2, "0");
      const ss = String(secs % 60).padStart(2, "0");
      const name = next === "LONG_BREAK" ? longBreakLabel : shortBreakLabel;
      return `${name} (${mm}:${ss})`;
    } catch {
      return undefined;
    }
  })();

  const labels = {
    stopwatch: t("Timer.modes.stopwatch", "Cronómetro"),
    pomodoroCount: (count: number) =>
      t("Timer.modes.pomodoroCount", `Pomodoro ${count}`, { count }),
    shortBreak: shortBreakLabel,
    longBreak: longBreakLabel,
    paused: t("Timer.paused", "En Pausa"),
    pauseCount: (count: number) =>
      t("Timer.pauses", `${count} pausa${count !== 1 ? "s" : ""}`, { count }),
    skipConfirmTitle: (phase: string) =>
      t("Timer.skipConfirm.title", `¿Saltar a ${phase}?`, { phase }),
    skipConfirmDescription: t(
      "Timer.skipConfirm.description",
      "La fase actual se cerrará como completada."
    ),
    skipConfirmOk: t("Timer.skipConfirm.ok", "Saltar"),
    cancel: t("Timer.cancel", "Cancelar"),
    skipTargetLabel,
    skipButtonTitle: t("Timer.skipButton", "Saltar al siguiente bloque"),
    switchTaskTitle: t("Timer.switchTask.title", "Cambiar Tarea"),
    switchTaskDescription: t(
      "Timer.switchTask.description",
      "Selecciona una tarea diferente para registrar tiempo."
    ),
    switchTaskButtonTitle: t("Timer.switchTask.buttonTitle", "Cambiar tarea"),
    enterFocusMode: t("Timer.enterFocusMode", "Modo Enfoque"),
    currentTask: t("Timer.currentTask", "Tarea Asignada"),
    horizontalView: t("Timer.horizontalView", "Vista Horizontal"),
    circularView: t("Timer.circularView", "Vista Circular"),
  };

  return (
    <PomodoroTimerUI
      state={timerState}
      actions={timerActions}
      TaskSelectorComponent={
        <TaskSelector
          selectedTaskId={selectedTaskId}
          onSelect={setSelectedTaskId}
        />
      }
      onFocusModeClick={() => navigate("/focus")}
      labels={labels}
      showSwitchDialog={showSwitchDialog}
      setShowSwitchDialog={setShowSwitchDialog}
    />
  );
}
