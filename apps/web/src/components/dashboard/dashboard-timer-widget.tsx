"use client";

import { Timer, Play, Pause, SkipForward, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTimer } from "@/components/providers/timer-provider";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

const MODE_LABELS = {
  WORK: "Trabajo",
  SHORT_BREAK: "Descanso Corto",
  LONG_BREAK: "Descanso Largo",
  CONTINUOUS: "Continuo",
  POMODORO: "Pomodoro",
  STOPWATCH: "Cronómetro",
};

const MODE_COLORS = {
  WORK: "#ef4444",
  SHORT_BREAK: "#22c55e",
  LONG_BREAK: "#3b82f6",
  CONTINUOUS: "#8b5cf6",
  POMODORO: "#ef4444",
  STOPWATCH: "#f59e0b",
};

interface DashboardTimerWidgetProps {
  accentColor?: string;
}

export function DashboardTimerWidget({ accentColor = "#6b7280" }: DashboardTimerWidgetProps) {
  const t = useTranslations("Dashboard");
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

  const progress = getProgress();
  const timeFormatted = formatTime(timeLeft);
  const modeColor = MODE_COLORS[mode as keyof typeof MODE_COLORS] || accentColor;
  const modeLabel = MODE_LABELS[mode as keyof typeof MODE_LABELS] || "Inactivo";
  const isIdle = !isRunning && !isPaused;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border-2 bg-card p-6 transition-all duration-300 cursor-pointer",
        "hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
      )}
      style={{ borderColor: modeColor }}
      onClick={() => !isRunning && router.push("/timer")}
    >
      {/* Progress background */}
      <div
        className="absolute inset-0 opacity-10 transition-all duration-1000"
        style={{
          background: `linear-gradient(90deg, ${modeColor} ${progress}%, transparent ${progress}%)`,
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${modeColor}20`, color: modeColor }}
            >
              <Timer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{isIdle ? "Inactivo" : modeLabel}</h3>
              <p className="text-xs text-muted-foreground">
                {completedPomodoros} pomodoros completados
              </p>
            </div>
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-4">
          <p
            className="text-5xl font-bold font-mono tracking-wider"
            style={{ color: isRunning ? modeColor : undefined }}
          >
            {timeFormatted}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleReset}
            disabled={isIdle}
            className={cn(
              "h-10 w-10 flex items-center justify-center rounded-xl border border-border/50 bg-background transition-all duration-200",
              isIdle ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"
            )}
            title="Reiniciar"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={handleToggle}
            className="h-12 w-24 flex items-center justify-center rounded-xl text-white shadow-lg transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: modeColor,
              boxShadow: `0 4px 14px -3px ${modeColor}60`,
            }}
          >
            {isRunning && !isPaused ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-1" />
            )}
          </button>

          <button
            onClick={handleSkip}
            disabled={!isRunning}
            className={cn(
              "h-10 w-10 flex items-center justify-center rounded-xl border border-border/50 bg-background transition-all duration-200",
              !isRunning ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"
            )}
            title="Saltar"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Mode indicators */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {["WORK", "SHORT_BREAK", "LONG_BREAK"].map((m) => (
            <div
              key={m}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-300",
                mode === m ? "scale-125" : "opacity-30"
              )}
              style={{ backgroundColor: MODE_COLORS[m as keyof typeof MODE_COLORS] }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
