"use client";

/**
 * DashboardTimerWidget - Web Wrapper
 * 
 * This is a wrapper around the shared DashboardTimerWidget from @ordo-todo/ui.
 * It provides:
 * - Timer state and config from context
 * - Control handlers  
 * - TaskSelector integration
 * - Navigation via Next.js router
 * - i18n translations via next-intl
 */

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTimer } from "@/components/providers/timer-provider";
import { TaskSelector } from "@/components/timer/task-selector";
import { DashboardTimerWidget as SharedTimerWidget } from "@ordo-todo/ui";

interface DashboardTimerWidgetProps {
  accentColor?: string;
  className?: string;
}

export function DashboardTimerWidget({ accentColor = "#f43f5e", className }: DashboardTimerWidgetProps) {
  const t = useTranslations("Timer");
  const pt = useTranslations("PomodoroTimer");
  const router = useRouter();
  
  const {
    mode,
    isRunning,
    isPaused,
    timeLeft,
    completedPomodoros,
    pauseCount,
    config,
    selectedTaskId,
    setSelectedTaskId,
    start,
    pause,
    resume,
    stop,
    skipToNext,
    formatTime,
    getProgress,
  } = useTimer();

  const handleToggle = async () => {
    if (isRunning && !isPaused) {
      await pause();
    } else if (isPaused) {
      await resume();
    } else {
      await start();
    }
  };

  const handleReset = async () => {
    await stop(false);
  };

  const handleSkip = async () => {
    await skipToNext();
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
      onClick={() => !isRunning && router.push("/timer")}
      onFocusModeClick={() => router.push("/focus")}
      formatTime={formatTime}
      TaskSelectorComponent={
        <TaskSelector
          selectedTaskId={selectedTaskId}
          onSelect={setSelectedTaskId}
          disabled={isRunning && !isPaused}
          className="h-8 text-xs py-1 px-2.5 bg-background/60"
        />
      }
      labels={{
        work: t("work"),
        shortBreak: t("shortBreak"),
        longBreak: t("longBreak"),
        continuous: t("continuous"),
        idle: t("idle"),
        completedPomodoros: t("completedPomodoros"),
        reset: t("reset"),
        start: t("start"),
        pause: t("pause"),
        skip: t("skip"),
        paused: pt.has("paused") ? pt("paused") : "En Pausa",
        focusMode: pt.has("enterFocusMode") ? pt("enterFocusMode") : "Enfoque",
        assignedTask: pt.has("currentTask") ? pt("currentTask") : "TAREA ASIGNADA",
        pomodoroCount: (count: number) => `Pomodoro #${count}`,
        pauseCount: (count: number) => pt.has("pauses") ? pt("pauses", { count }) : `${count} pausa${count !== 1 ? "s" : ""}`,
      }}
    />
  );
}
