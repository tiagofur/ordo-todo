import { useState } from "react";
import {
  Play,
  Pause,
  Square,
  SkipForward,
  Coffee,
  Zap,
  CheckSquare,
} from "lucide-react";
import { useTimer, TimerType, TimerMode, SessionData } from "@/hooks/use-timer";
import { api } from "@/utils/api";
import { toast } from "sonner";
import { TaskSelector } from "./task-selector";

interface PomodoroTimerProps {
  taskId?: string;
  timerType?: TimerType;
}

const DEFAULT_CONFIG = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  pomodorosUntilLongBreak: 4,
};

export function PomodoroTimer({
  taskId: initialTaskId,
  timerType = "POMODORO",
}: PomodoroTimerProps) {
  const [config] = useState(DEFAULT_CONFIG);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    initialTaskId || null
  );
  const utils = api.useUtils();

  const startTimer = api.timer.start.useMutation({
    onError: (error: Error) => {
      toast.error(error.message || "Error al iniciar timer");
    },
  });

  const stopTimer = api.timer.stop.useMutation({
    onSuccess: () => {
      utils.timer.active.invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al guardar sesión");
    },
  });

  const completeTask = api.task.complete.useMutation({
    onSuccess: () => {
      toast.success("Tarea completada");
      utils.task.list.invalidate();
    },
  });

  // This function is called when a session (or split part) ends
  const handleSessionComplete = async (data: SessionData) => {
    // Only save if we have a task selected
    if (selectedTaskId) {
      await stopTimer.mutateAsync({
        wasCompleted: data.wasCompleted,
      });
    }
  };

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
    split,
    skipToNext,
    formatTime,
    getProgress,
  } = useTimer({
    type: timerType,
    config,
    onSessionComplete: handleSessionComplete,
  });

  const handleStart = async () => {
    if (!isRunning && !isPaused && selectedTaskId) {
      await startTimer.mutateAsync({
        taskId: selectedTaskId,
        type: mode,
      });
    }
    start();
  };

  const handleStop = () => {
    stop(false);
  };

  const handleTaskSelect = async (newTaskId: string | null) => {
    if (isRunning && !isPaused) {
      // If timer is running, split the session
      split();

      // If we have a new task, start a new session immediately
      if (newTaskId) {
        await startTimer.mutateAsync({
          taskId: newTaskId,
          type: mode,
        });
      }
    }

    setSelectedTaskId(newTaskId);
  };

  const handleCompleteTask = async () => {
    if (selectedTaskId) {
      // Complete the task in backend
      await completeTask.mutateAsync({ id: selectedTaskId });

      // Split the timer session (log time for this task)
      if (isRunning) {
        split();
      }

      // Clear selection but keep timer running
      setSelectedTaskId(null);
      toast.success("Tarea completada! Selecciona otra para continuar.");
    }
  };

  const getModeColor = (mode: TimerMode): string => {
    switch (mode) {
      case "WORK":
        return "bg-red-500";
      case "SHORT_BREAK":
        return "bg-blue-500";
      case "LONG_BREAK":
        return "bg-green-500";
    }
  };

  const getModeIcon = (mode: TimerMode) => {
    switch (mode) {
      case "WORK":
        return <Zap className="h-5 w-5" />;
      case "SHORT_BREAK":
      case "LONG_BREAK":
        return <Coffee className="h-5 w-5" />;
    }
  };

  const getModeLabel = (mode: TimerMode): string => {
    switch (mode) {
      case "WORK":
        return "Tiempo de Trabajo";
      case "SHORT_BREAK":
        return "Descanso Corto";
      case "LONG_BREAK":
        return "Descanso Largo";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl border bg-card p-8 shadow-lg">
        {/* Mode Indicator */}
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
              onSelect={handleTaskSelect}
              className="flex-1"
            />
            {selectedTaskId && (
              <button
                onClick={handleCompleteTask}
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
              onClick={handleStart}
              disabled={startTimer.isPending}
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
                onClick={handleStop}
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
