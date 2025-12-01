"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Square, SkipForward, RefreshCw, Timer } from "lucide-react";
import { useTimerBackend } from "@/hooks/use-timer-backend";
import { toast } from "sonner";
import { TaskSelector } from "./task-selector";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTimerSettings } from "@/hooks/use-timer-settings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PomodoroTimer() {
  const { settings: config, isLoaded } = useTimerSettings();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);

  const {
    isRunning,
    isPaused,
    timeLeft,
    mode,
    pauseCount,
    start,
    pause,
    resume,
    stop,
    skipToNext,
    switchTask,
    formatTime,
    getProgress,
    activeSession,
  } = useTimerBackend({
    type: config.defaultMode, // POMODORO or CONTINUOUS from settings
    config,
    taskId: selectedTaskId,
    onSessionComplete: () => {
      toast.success("¡Sesión completada!");
    },
  });

  // Sync selected task with active session
  useEffect(() => {
    if (activeSession?.taskId) {
        setSelectedTaskId(activeSession.taskId);
    }
  }, [activeSession]);

  const accentColor = config.defaultMode === "POMODORO" ? "#ef4444" : "#3b82f6";
  const modeLabel = config.defaultMode === "POMODORO" ? "Pomodoro" : "Tiempo Corrido";

  const getModeLabel = () => {
    if (config.defaultMode === "CONTINUOUS") {
      return "Cronómetro";
    }
    if (mode === "WORK") return `Pomodoro #${Math.floor((activeSession?.duration ?? 0) / config.workDuration) + 1}`;
    if (mode === "SHORT_BREAK") return "Descanso Corto";
    if (mode === "LONG_BREAK") return "Descanso Largo";
    return "";
  };

  const handleStart = () => {
    start();
  };

  const handleSwitchTask = async (newTaskId: string | null) => {
    if (!newTaskId) return;
    await switchTask(newTaskId);
    setSelectedTaskId(newTaskId);
    setShowSwitchDialog(false);
  };

  if (!isLoaded) return null;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-8">
      {/* Mode & Settings Info */}
      <div className="text-center w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Timer className="w-5 h-5" style={{ color: accentColor }} />
          <span className="text-sm font-medium text-muted-foreground">
            Modo: {modeLabel}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={mode}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="font-semibold text-lg mb-4"
            style={{ color: accentColor }}
          >
            {getModeLabel()}
          </motion.p>
        </AnimatePresence>

        <TaskSelector 
            selectedTaskId={selectedTaskId} 
            onSelect={setSelectedTaskId} 
            disabled={isRunning && !isPaused}
        />

        {/* Pause Metrics */}
        {isRunning && pauseCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 text-xs text-muted-foreground flex items-center justify-center gap-3"
          >
            <span>Pausas: {pauseCount}</span>
          </motion.div>
        )}
      </div>

      {/* Timer Display */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative"
      >
        <svg className="h-80 w-80 -rotate-90 transform">
          <circle cx="160" cy="160" r="150" stroke="currentColor" strokeWidth="10" fill="none" className="text-muted/20" />
          <motion.circle
            cx="160"
            cy="160"
            r="150"
            stroke="currentColor"
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 150}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 150 }}
            animate={{ strokeDashoffset: `${2 * Math.PI * 150 * (1 - getProgress() / 100)}` }}
            transition={{ duration: 1 }}
            style={{ color: accentColor }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
          <h1 className="text-7xl font-bold tabular-nums text-foreground">
            {formatTime(timeLeft)}
          </h1>
          {isPaused && (
            <span className="text-sm text-muted-foreground animate-pulse">
              En pausa
            </span>
          )}
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={isRunning && !isPaused ? pause : isPaused ? resume : handleStart}
          disabled={isRunning && !isPaused ? false : false}
          className="flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: accentColor, boxShadow: `0 10px 20px -5px ${accentColor}50`}}
        >
          {isRunning && !isPaused ? (
            <Pause className="h-8 w-8" />
          ) : isPaused ? (
            <Play className="h-8 w-8 ml-1" />
          ) : (
            <Play className="h-8 w-8 ml-1" />
          )}
        </motion.button>

        {(isRunning || isPaused) && (
          <>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => stop(false)}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-muted/50 text-muted-foreground hover:border-muted-foreground"
            >
              <Square className="h-6 w-6" />
            </motion.button>

            {config.defaultMode === "POMODORO" && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={skipToNext}
                className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-muted/50 text-muted-foreground hover:border-muted-foreground"
              >
                <SkipForward className="h-6 w-6" />
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSwitchDialog(true)}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-muted/50 text-muted-foreground hover:border-muted-foreground"
              title="Cambiar de tarea"
            >
              <RefreshCw className="h-6 w-6" />
            </motion.button>
          </>
        )}
      </div>

      {/* Switch Task Dialog */}
      <Dialog open={showSwitchDialog} onOpenChange={setShowSwitchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar de Tarea</DialogTitle>
            <DialogDescription>
              El tiempo trabajado en la tarea actual se guardará como completado.
              Selecciona la nueva tarea para continuar.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <TaskSelector
              selectedTaskId={null}
              onSelect={handleSwitchTask}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
