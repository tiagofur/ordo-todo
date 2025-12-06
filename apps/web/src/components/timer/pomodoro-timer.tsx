"use client";

import { useState } from "react";
import { Play, Pause, Square, SkipForward, RefreshCw, Maximize2 } from "lucide-react";
import Link from "next/link";
import { useTimer } from "@/components/providers/timer-provider";
import { TaskSelector } from "./task-selector";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

export function PomodoroTimer() {
  const t = useTranslations('PomodoroTimer');
  const { 
    config, 
    isLoaded,
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
    switchTask,
    formatTime,
    getProgress,
    activeSession,
    selectedTaskId,
    setSelectedTaskId
  } = useTimer();

  const [showSwitchDialog, setShowSwitchDialog] = useState(false);

  const MODE_COLORS = {
    WORK: "#ef4444", // Red
    SHORT_BREAK: "#4ade80", // Light Green (Leaves)
    LONG_BREAK: "#15803d", // Dark Green (Branches)
    CONTINUOUS: "#3b82f6", // Blue
  };

  const accentColor = MODE_COLORS[mode] || "#ef4444";

  const getModeLabel = () => {
    if (config.defaultMode === "CONTINUOUS") {
      return t('modes.stopwatch');
    }
    if (mode === "WORK") {
      // Show the current pomodoro being worked on
      return t('modes.pomodoroCount', { count: completedPomodoros + 1 });
    }
    if (mode === "SHORT_BREAK") return t('modes.shortBreak');
    if (mode === "LONG_BREAK") return t('modes.longBreak');
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
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-8 relative">
       {/* Focus Mode Link */}
       <div className="absolute top-0 right-0">
          <Link href="/focus" title={t('enterFocusMode') || "Enter Focus Mode"}>
            <Maximize2 className="w-6 h-6 text-muted-foreground/50 hover:text-foreground transition-colors" />
          </Link>
       </div>

      {/* Mode & Settings Info */}
      <div className="text-center w-full max-w-sm">


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
            <span>{t('pauses', { count: pauseCount })}</span>
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
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 150}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 150, stroke: MODE_COLORS["WORK"] }}
            animate={{ 
              strokeDashoffset: `${2 * Math.PI * 150 * (1 - getProgress() / 100)}`,
              stroke: accentColor 
            }}
            transition={{ duration: 1 }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
          <h1 className="text-7xl font-bold tabular-nums text-foreground">
            {formatTime(timeLeft)}
          </h1>
          {isPaused && (
            <span className="text-sm text-muted-foreground animate-pulse">
              {t('paused')}
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
              title={t('switchTask.buttonTitle')}
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
            <DialogTitle>{t('switchTask.title')}</DialogTitle>
            <DialogDescription>
              {t('switchTask.description')}
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
