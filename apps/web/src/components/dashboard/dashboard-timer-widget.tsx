"use client";

/**
 * DashboardTimerWidget - Web Wrapper
 * 
 * This is a wrapper around the shared DashboardTimerWidget from @ordo-todo/ui.
 * It provides:
 * - Timer state from context
 * - Control handlers  
 * - Navigation via Next.js router
 * - i18n translations via next-intl
 */

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTimer } from "@/components/providers/timer-provider";
import { DashboardTimerWidget as SharedTimerWidget } from "@ordo-todo/ui";

interface DashboardTimerWidgetProps {
  accentColor?: string;
  className?: string;
}

export function DashboardTimerWidget({ accentColor = "#6b7280", className }: DashboardTimerWidgetProps) {
  const t = useTranslations("Timer");
  const router = useRouter();
  
  const {
    mode,
    isRunning,
    isPaused,
    timeLeft,
    completedPomodoros,
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
      progress={getProgress()}
      accentColor={accentColor}
      onToggle={handleToggle}
      onReset={handleReset}
      onSkip={handleSkip}
      onClick={() => !isRunning && router.push("/timer")}
      formatTime={formatTime}
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
      }}
    />
  );
}
