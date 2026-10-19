/**
 * TimerWidget - Desktop Wrapper
 * 
 * This is a wrapper around the shared DashboardTimerWidget from @ordo-todo/ui.
 * It provides:
 * - Timer state and config from context
 * - Control handlers
 * - TaskSelector integration
 * - i18n translations via react-i18next
 */

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useTimer } from "@/contexts/timer-context";
import { TaskSelector } from "@/components/timer/task-selector";
import { DashboardTimerWidget as SharedTimerWidget } from "@ordo-todo/ui";

interface TimerWidgetProps {
  onExpand?: () => void;
  accentColor?: string;
  className?: string;
}

export function TimerWidget({ onExpand, accentColor = "#f43f5e", className }: TimerWidgetProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const {
    mode,
    isRunning,
    isPaused,
    timeLeft,
    formatTime,
    getProgress,
    start,
    pause,
    resume,
    stop,
    skipToNext,
    completedPomodoros,
    pauseCount,
    config,
    selectedTaskId,
    setSelectedTaskId,
  } = useTimer();

  const handleToggle = () => {
    if (isRunning && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      start();
    }
  };

  const handleReset = () => {
    stop();
  };

  const handleSkip = () => {
    skipToNext();
  };

  return (
    <SharedTimerWidget
      className={className}
      mode={mode}
      isRunning={isRunning}
      isPaused={isPaused}
      timeLeft={timeLeft}
      completedPomodoros={completedPomodoros}
      pauseCount={pauseCount}
      config={config}
      progress={getProgress()}
      accentColor={accentColor}
      onToggle={handleToggle}
      onReset={handleReset}
      onSkip={handleSkip}
      onClick={onExpand || (() => navigate("/timer"))}
      onFocusModeClick={() => navigate("/focus")}
      formatTime={formatTime}
      TaskSelectorComponent={
        <TaskSelector
          selectedTaskId={selectedTaskId}
          onSelect={setSelectedTaskId}
          className="h-8 text-xs py-1 px-2.5 bg-background/60"
        />
      }
      labels={{
        work: t("Timer.work", "Trabajo"),
        shortBreak: t("Timer.shortBreak", "Descanso Corto"),
        longBreak: t("Timer.longBreak", "Descanso Largo"),
        continuous: t("Timer.continuous", "Continuo"),
        idle: t("Timer.idle", "Inactivo"),
        completedPomodoros: t("Timer.completedPomodoros", "pomodoros completados"),
        reset: t("Timer.reset", "Reiniciar"),
        start: t("Timer.start", "Iniciar"),
        pause: t("Timer.pause", "Pausar"),
        skip: t("Timer.skip", "Saltar"),
        paused: t("Timer.paused", "En Pausa"),
        focusMode: t("Timer.enterFocusMode", "Enfoque"),
        assignedTask: t("Timer.currentTask", "TAREA ASIGNADA"),
        pomodoroCount: (count: number) => t("Timer.modes.pomodoroCount", `Pomodoro ${count}`, { count }),
        pauseCount: (count: number) => t("Timer.pauses", `${count} pausa${count !== 1 ? "s" : ""}`, { count }),
      }}
    />
  );
}
