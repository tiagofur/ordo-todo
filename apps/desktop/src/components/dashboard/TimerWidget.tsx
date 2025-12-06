import { Timer, Play, Pause, SkipForward, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTimerStore, startTimerInterval, stopTimerInterval } from "@/stores/timer-store";

interface TimerWidgetProps {
  onExpand?: () => void;
}

const MODE_LABELS = {
  WORK: "Trabajo",
  SHORT_BREAK: "Descanso Corto",
  LONG_BREAK: "Descanso Largo",
  IDLE: "Inactivo",
};

const MODE_COLORS = {
  WORK: "#ef4444",
  SHORT_BREAK: "#22c55e",
  LONG_BREAK: "#3b82f6",
  IDLE: "#6b7280",
};

export function TimerWidget({ onExpand }: TimerWidgetProps) {
  const {
    mode,
    isRunning,
    isPaused,
    getTimeFormatted,
    getProgress,
    start,
    pause,
    resume,
    stop,
    skip,
    reset,
    selectedTaskTitle,
    completedPomodoros,
  } = useTimerStore();

  const handleToggle = () => {
    if (isRunning && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      start();
      startTimerInterval();
    }
  };

  const handleStop = () => {
    stop();
    stopTimerInterval();
  };

  const progress = getProgress();
  const timeFormatted = getTimeFormatted();
  const modeColor = MODE_COLORS[mode];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border-2 bg-card p-6 transition-all duration-300",
        "hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
      )}
      style={{ borderColor: modeColor }}
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
              <h3 className="text-lg font-semibold">{MODE_LABELS[mode]}</h3>
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
          {selectedTaskTitle && (
            <p className="text-sm text-muted-foreground mt-2 truncate">
              📋 {selectedTaskTitle}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={reset}
            disabled={!isRunning && mode === "IDLE"}
            className="h-10 w-10"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            size="lg"
            onClick={handleToggle}
            className="h-12 w-24"
            style={{
              backgroundColor: modeColor,
              color: "white",
            }}
          >
            {isRunning && !isPaused ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-1" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={skip}
            disabled={!isRunning}
            className="h-10 w-10"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
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
    </div>
  );
}
