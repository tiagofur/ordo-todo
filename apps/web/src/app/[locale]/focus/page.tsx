"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Play, Pause, Square, X, Check, SkipForward, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@ordo-todo/ui";
import { cn } from "@/lib/utils";
import { useTimer } from "@/components/providers/timer-provider";
import { useTask, useCompleteTask } from "@/lib/api-hooks";
import { motion, AnimatePresence } from "framer-motion";
import { notify } from "@/lib/notify";

export default function FocusPage() {
  const t = useTranslations('FocusMode');
  const tTimer = useTranslations('PomodoroTimer');
  const router = useRouter();

  const {
    timeLeft,
    formatTime,
    isRunning,
    isPaused,
    mode,
    start,
    pause,
    stop,
    skipToNext,
    selectedTaskId,
    getProgress
  } = useTimer();

  const { data: task } = useTask(selectedTaskId || "");
  const completeTaskMutation = useCompleteTask();

  const percentage = getProgress();

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTaskId) return;
    
    try {
      await completeTaskMutation.mutateAsync(selectedTaskId);
      notify.success(tTimer('toast.taskCompleted') || "Task completed!");
      // Optionally stop timer or ask what to do
      stop(true);
    } catch (error) {
      notify.error("Error completing task");
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-8 relative overflow-hidden transition-colors duration-1000">
      {/* Background Ambient Effect */}
      <div 
        className={cn(
          "absolute inset-0 opacity-10 transition-colors duration-1000 blur-3xl",
          mode === 'WORK' ? "bg-red-500" : mode === 'SHORT_BREAK' ? "bg-green-500" : mode === 'LONG_BREAK' ? "bg-emerald-600" : "bg-blue-500"
        )} 
      />

      {/* Top Controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleFullscreen} 
          className="hover:bg-accent/20 text-muted-foreground hover:text-foreground transition-colors"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-6 h-6" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-accent/20 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => router.push('/')}
          title={t('exit')}
        >
          <X className="w-8 h-8" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="z-10 flex flex-col items-center w-full max-w-4xl mx-auto space-y-16">
        
        {/* Task Title */}
        <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          {selectedTaskId ? (
            <>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-[0.3em]">
                {mode === 'WORK' ? t('deepWork') : t('breakTime')}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground line-clamp-2 leading-tight max-w-3xl">
                {task?.title || <span className="text-muted-foreground animate-pulse">{t('loading')}</span>}
              </h1>
            </>
          ) : (
            <h1 className="text-4xl font-bold text-muted-foreground/50">{t('selectTask')}</h1>
          )}
        </div>

        {/* Timer Display */}
        <div className="relative group cursor-default select-none">
          <div className={cn(
            "text-[140px] md:text-[220px] font-black tabular-nums leading-none tracking-tighter transition-all duration-500",
            isPaused ? "text-muted-foreground opacity-50 scale-95" : "text-foreground scale-100"
          )}>
            {formatTime(timeLeft)}
          </div>
          
          {/* Progress Bar */}
          <div className="absolute -bottom-8 left-0 right-0 h-3 bg-secondary/20 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div 
              className={cn(
                "h-full rounded-full shadow-[0_0_15px_currentColor]",
                mode === 'WORK' ? "bg-red-500 text-red-500" : mode === 'SHORT_BREAK' ? "bg-green-500 text-green-500" : mode === 'LONG_BREAK' ? "bg-emerald-600 text-emerald-600" : "bg-blue-500 text-blue-500"
              )} 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          {!isRunning && !isPaused ? (
            <Button 
              size="lg" 
              onClick={() => start()} 
              className={cn(
                "h-24 w-24 rounded-full text-xl shadow-2xl hover:scale-110 transition-all duration-300",
                mode === 'WORK' ? "bg-red-500 hover:bg-red-600 shadow-red-500/30" : "bg-green-500 hover:bg-green-600 shadow-green-500/30"
              )}
            >
              <Play className="w-10 h-10 ml-1" />
            </Button>
          ) : (
            <>
              <Button 
                variant="outline"
                size="icon" 
                onClick={pause} 
                className="h-20 w-20 rounded-full border-2 hover:bg-accent/10 hover:border-foreground/50 transition-all"
                title={tTimer('pause')}
              >
                <Pause className="w-10 h-10" />
              </Button>
              
              <Button 
                variant="outline"
                size="icon" 
                onClick={() => stop()} 
                className="h-20 w-20 rounded-full border-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all"
                title={tTimer('stop')}
              >
                <Square className="w-8 h-8" />
              </Button>

              {mode === 'WORK' && (
                <Button 
                  variant="outline"
                  size="icon" 
                  onClick={skipToNext} 
                  className="h-20 w-20 rounded-full border-2 hover:bg-accent/10 hover:border-foreground/50 transition-all"
                  title={tTimer('skip')}
                >
                  <SkipForward className="w-8 h-8" />
                </Button>
              )}

              {selectedTaskId && mode === 'WORK' && (
                <Button 
                  variant="secondary"
                  size="icon" 
                  onClick={handleCompleteTask} 
                  className="h-20 w-20 rounded-full bg-green-500/10 text-green-500 hover:bg-green-500/20 shadow-none border-2 border-green-500/20 hover:border-green-500/50 transition-all"
                  title={t('completeTask')}
                >
                  <Check className="w-10 h-10" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
