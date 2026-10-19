/**
 * TimerWidget - Desktop Wrapper
 * 
 * This is a wrapper around the shared DashboardTimerWidget from @ordo-todo/ui.
 * It provides:
 * - Timer state from context
 * - Control handlers
 * - i18n translations via react-i18next
 */

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useTimer } from "@/contexts/timer-context";
import { DashboardTimerWidget as SharedTimerWidget } from "@ordo-todo/ui";

interface TimerWidgetProps {
  onExpand?: () => void;
  accentColor?: string;
  className?: string;
}

export function TimerWidget({ onExpand, accentColor = "#06b6d4", className }: TimerWidgetProps) {
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
      progress={getProgress()}
      accentColor={accentColor}
      onToggle={handleToggle}
      onReset={handleReset}
      onSkip={handleSkip}
      onClick={onExpand || (() => navigate("/timer"))}
      formatTime={formatTime}
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
      }}
    />
  );
}
