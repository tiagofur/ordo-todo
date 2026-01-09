import {
  Play,
  Pause,
  Square,
  SkipForward,
  Coffee,
  Zap,
  CheckSquare,
  Maximize2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTimerContext } from "@/contexts/timer-context";
import { TimerSessionMode as TimerMode, TimerType } from "@/hooks/use-timer-backend";
import { TaskSelector } from "./task-selector";

interface PomodoroTimerProps {
  taskId?: string; // Kept for interface compatibility but context takes precedence usually
  timerType?: TimerType;
}

export function PomodoroTimer({
  taskId: initialTaskId,
  timerType = "POMODORO",
}: PomodoroTimerProps) {
  const {
    isRunning,
    isPaused,
    timeLeft,
    mode,
    completedPomodoros,
    pauseCount,
    start,
    pause,
    stop,
    skipToNext,
    formatTime,
    getProgress,
    selectedTaskId,
    toggleTaskSelection,
    completeTask,
  } = useTimerContext();

  // Mode helpers
  const getModeColor = (mode: TimerMode): string => {
    switch (mode) {
      case "WORK":
      case "CONTINUOUS":
        return "bg-red-500";
      case "SHORT_BREAK":
        return "bg-blue-500";
      case "LONG_BREAK":
        return "bg-green-500";
      default:
        return "bg-slate-500";
    }
  };

  const getModeIcon = (mode: TimerMode) => {
    switch (mode) {
      case "WORK":
      case "CONTINUOUS":
        return <Zap className="h-5 w-5" />;
      case "SHORT_BREAK":
      case "LONG_BREAK":
        return <Coffee className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const getModeLabel = (mode: TimerMode): string => {
    switch (mode) {
      case "WORK":
        return "Tiempo de Trabajo";
      case "CONTINUOUS":
        return "Modo Continuo";
      case "SHORT_BREAK":
        return "Descanso Corto";
      case "LONG_BREAK":
        return "Descanso Largo";
      default:
        return "Listo";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl border bg-card p-8 shadow-lg">
        {/* Mode Indicator */}
        <div className="absolute top-4 right-4">
             <Link to="/focus" title="Enter Focus Mode">
                  <Maximize2 className="w-5 h-5 text-muted-foreground hover:text-foreground" />
             </Link>
        </div>

        <div className="mb-6 flex items-center justify-center gap-2">
          <div
            className={`flex items-center gap-2 rounded-full ${getModeColor(mode)} px-4 py-2 text-white`}
          >
            {getModeIcon(mode)}
            <span className="text-sm font-medium">{getModeLabel(mode)}</span>
          </div>
        </div>

        {/* Task Selector */}
        <div className="mb-8">
          <div className="flex gap-2">
            <TaskSelector
              selectedTaskId={selectedTaskId}
              onSelect={toggleTaskSelection}
              className="flex-1"
            />
            {selectedTaskId && (
              <button
                onClick={completeTask}
                className="flex items-center justify-center rounded-lg border border-green-500 bg-green-100 px-3 text-green-700 hover:bg-green-200 dark:border-green-600 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                title="Completar tarea y seguir trabajando"
              >
                <CheckSquare className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Timer Display */}
        <div className="relative mb-8">
          {/* Progress Ring */}
          <svg className="h-64 w-64 mx-auto -rotate-90 transform">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * (1 - getProgress() / 100)}`}
              className={`text-gradient transition-all duration-1000 ${
                mode === "WORK"
                  ? "text-red-500"
                  : mode === "SHORT_BREAK"
                    ? "text-blue-500"
                    : "text-green-500"
              }`}
              strokeLinecap="round"
            />
          </svg>

          {/* Time Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-bold tabular-nums">
                {formatTime(timeLeft)}
              </div>
              {timerType === "POMODORO" && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {completedPomodoros} pomodoros completados
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isRunning && !isPaused ? (
            <button
              onClick={() => start()}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
            >
              <Play className="h-6 w-6 ml-1" />
            </button>
          ) : (
            <>
              <button
                onClick={pause}
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
              >
                <Pause className="h-5 w-5" />
              </button>
              <button
                onClick={() => stop()}
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
              >
                <Square className="h-5 w-5" />
              </button>
              {timerType === "POMODORO" && (
                <button
                  onClick={skipToNext}
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
                >
                  <SkipForward className="h-5 w-5" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Stats */}
        {(pauseCount > 0 || isRunning || isPaused) && (
          <div className="mt-6 flex justify-around border-t pt-4 text-center text-sm">
            <div>
              <div className="text-muted-foreground">Pausas</div>
              <div className="font-semibold">{pauseCount}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Estado</div>
              <div className="font-semibold">
                {isRunning ? "Activo" : isPaused ? "Pausado" : "Detenido"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
