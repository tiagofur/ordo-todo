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

  const labels = {
    stopwatch: t("Timer.modes.stopwatch", "Cronómetro"),
    pomodoroCount: (count: number) =>
      t("Timer.modes.pomodoroCount", `Pomodoro ${count}`, { count }),
    shortBreak: t("Timer.modes.shortBreak", "Descanso Corto"),
    longBreak: t("Timer.modes.longBreak", "Descanso Largo"),
    paused: t("Timer.paused", "En Pausa"),
    pauseCount: (count: number) =>
      t("Timer.pauses", `${count} pausa${count !== 1 ? "s" : ""}`, { count }),
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
