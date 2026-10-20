import { useState, type ReactNode } from 'react';
import { Play, Pause, Square, SkipForward, RefreshCw, Maximize2, LayoutList, CircleDot } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog.js';
import { Button } from '../ui/button.js';
import type { TimerMode } from './timer-widget.js';
import { cn } from '../../utils/index.js';

export interface TimerState {
  isLoaded: boolean;
  isRunning: boolean;
  isPaused: boolean;
  timeLeft: number;
  mode: TimerMode;
  completedPomodoros: number;
  pauseCount: number;
  defaultMode: 'POMODORO' | 'CONTINUOUS';
  selectedTaskId: string | null;
  progress: number; // 0-100
}

export interface TimerActions {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: (completed?: boolean) => void;
  skipToNext: () => void;
  switchTask: (taskId: string) => Promise<void>;
  setSelectedTaskId: (taskId: string | null) => void;
}

export interface PomodoroTimerProps {
  /** Timer state - typically from useTimer hook */
  state: TimerState;
  /** Timer actions - typically from useTimer hook */
  actions: TimerActions;
  /** Task selector component - rendered inside timer */
  TaskSelectorComponent?: ReactNode;
  /** Click handler for focus mode link */
  onFocusModeClick?: () => void;
  /** Custom labels for i18n */
  labels?: {
    stopwatch?: string;
    pomodoroCount?: (count: number) => string;
    shortBreak?: string;
    longBreak?: string;
    paused?: string;
    pauseCount?: (count: number) => string;
    switchTaskTitle?: string;
    switchTaskDescription?: string;
    switchTaskButtonTitle?: string;
    enterFocusMode?: string;
    currentTask?: string;
    completed?: string;
    horizontalView?: string;
    circularView?: string;
    /** 'Skip to {phase}?' dialog title. {phase} = skipTargetLabel. */
    skipConfirmTitle?: (phase: string) => string;
    skipConfirmDescription?: string;
    skipConfirmOk?: string;
    cancel?: string;
    /** Pre-computed next-phase label, e.g. 'Descanso corto (5:00)'. */
    skipTargetLabel?: string;
    skipButtonTitle?: string;
  };
  /** Dialog state controlled by parent */
  showSwitchDialog?: boolean;
  setShowSwitchDialog?: (show: boolean) => void;
  /** Layout variant: 'horizontal' (compact console) | 'circular' (classic ring). Defaults to 'horizontal' */
  variant?: 'horizontal' | 'circular';
  /** Allow user to toggle between horizontal and circular */
  allowVariantToggle?: boolean;
}

const MODE_COLORS: Record<string, string> = {
  WORK: '#f43f5e',
  SHORT_BREAK: '#10b981',
  LONG_BREAK: '#0d9488',
  CONTINUOUS: '#3b82f6',
};

/**
 * Format time from seconds to MM:SS or HH:MM:SS
 */
function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * PomodoroTimer - Platform-agnostic timer display with controls
 * 
 * Supports both horizontal Apple-grade cockpit layout (compact, no scrolling needed)
 * and classic circular SVG ring layout.
 */
export function PomodoroTimer({
  state,
  actions,
  TaskSelectorComponent,
  onFocusModeClick,
  labels = {},
  showSwitchDialog = false,
  setShowSwitchDialog,
  variant,
  allowVariantToggle = true,
}: PomodoroTimerProps) {
  const [internalVariant, setInternalVariant] = useState<'horizontal' | 'circular'>(
    variant || 'horizontal'
  );
  const activeVariant = variant !== undefined ? variant : internalVariant;

  const {
    isLoaded,
    isRunning,
    isPaused,
    timeLeft,
    mode,
    completedPomodoros,
    pauseCount,
    defaultMode,
    progress,
  } = state;

  const { start, pause, resume, stop, skipToNext } = actions;

  const {
    stopwatch = 'Cronómetro',
    pomodoroCount = (count: number) => `Pomodoro ${count}`,
    shortBreak = 'Descanso Corto',
    longBreak = 'Descanso Largo',
    paused = 'En Pausa',
    pauseCount: pauseCountLabel = (count: number) => `${count} pausa${count !== 1 ? 's' : ''}`,
    switchTaskTitle = 'Cambiar Tarea',
    switchTaskDescription = 'Selecciona una tarea diferente para registrar tiempo.',
    switchTaskButtonTitle = 'Cambiar tarea',
    enterFocusMode = 'Modo Enfoque',
    currentTask = 'Tarea Asignada',
    horizontalView = 'Vista Horizontal',
    circularView = 'Vista Circular',
    skipConfirmTitle = (phase: string) => `¿Saltar a ${phase}?`,
    skipConfirmDescription = 'La fase actual se cerrará como completada.',
    skipConfirmOk = 'Saltar',
    cancel = 'Cancelar',
    skipTargetLabel,
    skipButtonTitle = 'Saltar al siguiente bloque',
  } = labels;

  const [showSkipDialog, setShowSkipDialog] = useState(false);

  // Confirm only when there is focus time at stake: an early WORK skip.
  // Breaks and nearly-finished WORK skip straight through.
  const SKIP_CONFIRM_PROGRESS = 80;
  const needsSkipConfirm =
    mode === 'WORK' && progress < SKIP_CONFIRM_PROGRESS;

  const handleSkip = () => {
    if (needsSkipConfirm) {
      setShowSkipDialog(true);
    } else {
      skipToNext();
    }
  };

  const confirmSkip = () => {
    setShowSkipDialog(false);
    skipToNext();
  };

  const accentColor = MODE_COLORS[mode] || '#f43f5e';

  const getModeLabel = () => {
    if (defaultMode === 'CONTINUOUS') return stopwatch;
    if (mode === 'WORK') return pomodoroCount(completedPomodoros + 1);
    if (mode === 'SHORT_BREAK') return shortBreak;
    if (mode === 'LONG_BREAK') return longBreak;
    return '';
  };

  const handlePlayPause = () => {
    if (isRunning && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      start();
    }
  };

  if (!isLoaded) return null;

  // Horizontal Cockpit (Apple-grade, compact, minimal vertical height)
  if (activeVariant === 'horizontal') {
    return (
      <div className="relative w-full overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-card/95 via-card/85 to-card p-5 sm:p-6 shadow-xs backdrop-blur-xs transition-all duration-300">
        {/* Ambient gradient glow in the corner corresponding to mode */}
        <div
          className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full blur-3xl opacity-15"
          style={{ backgroundColor: accentColor }}
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left: Time display, mode pill & horizontal progress */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border shadow-2xs"
                style={{
                  borderColor: `${accentColor}40`,
                  backgroundColor: `${accentColor}15`,
                  color: accentColor,
                }}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    isRunning && !isPaused ? "animate-pulse" : ""
                  )}
                  style={{ backgroundColor: accentColor }}
                />
                <span>{getModeLabel()}</span>
              </div>

              {isPaused && (
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                  {paused}
                </span>
              )}

              {isRunning && pauseCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {pauseCountLabel(pauseCount)}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3 my-0.5">
              <h1 className="text-5xl sm:text-6xl font-bold font-mono tracking-tight tabular-nums text-foreground leading-none">
                {formatTime(timeLeft)}
              </h1>
              <span className="text-sm font-medium text-muted-foreground tabular-nums">
                {Math.round(progress)}%
              </span>
            </div>

            {/* Sleek Horizontal Progress Bar */}
            <div className="space-y-1.5 w-full max-w-md">
              <div className="h-2.5 w-full rounded-full bg-muted/50 overflow-hidden relative border border-border/30">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.min(100, Math.max(0, progress))}%`,
                    backgroundColor: accentColor,
                    boxShadow: `0 0 10px ${accentColor}80`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Center: Tactile Controls */}
          <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-4 shrink-0 py-1">
            {/* Play / Pause Primary Button */}
            <button
              onClick={handlePlayPause}
              className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl text-white shadow-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 8px 24px -4px ${accentColor}60`,
              }}
              title={isRunning && !isPaused ? "Pausar" : "Iniciar"}
            >
              {isRunning && !isPaused ? (
                <Pause className="h-6 w-6 sm:h-7 sm:w-7" />
              ) : (
                <Play className="h-6 w-6 sm:h-7 sm:w-7 ml-0.5" />
              )}
            </button>

            {/* Secondary Controls */}
            {(isRunning || isPaused) && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => stop(false)}
                  className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 active:scale-95 cursor-pointer bg-card/80 shadow-xs"
                  title="Detener"
                >
                  <Square className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </button>

                {defaultMode === 'POMODORO' && (
                  <button
                    onClick={handleSkip}
                    className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 active:scale-95 cursor-pointer bg-card/80 shadow-xs"
                    title={skipButtonTitle}
                    aria-label={skipButtonTitle}
                  >
                    <SkipForward className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                  </button>
                )}

                <button
                  onClick={() => setShowSwitchDialog?.(true)}
                  className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 active:scale-95 cursor-pointer bg-card/80 shadow-xs"
                  title={switchTaskButtonTitle}
                >
                  <RefreshCw className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right: Task selector context & Actions */}
          {TaskSelectorComponent && (
            <div className="w-full lg:w-72 xl:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-border/50 pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  {currentTask}
                </span>
                <div className="flex items-center gap-2">
                  {allowVariantToggle && (
                    <button
                      onClick={() => setInternalVariant('circular')}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer p-1 rounded-lg hover:bg-muted/50"
                      title={circularView}
                    >
                      <CircleDot className="h-3.5 w-3.5" />
                      <span className="sr-only">Circular</span>
                    </button>
                  )}
                  {onFocusModeClick && (
                    <button
                      onClick={onFocusModeClick}
                      title={enterFocusMode}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer p-1 rounded-lg hover:bg-muted/50"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span>Enfoque</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="w-full">
                {TaskSelectorComponent}
              </div>
            </div>
          )}
        </div>

        {/* Switch Task Dialog */}
        <Dialog open={showSwitchDialog} onOpenChange={setShowSwitchDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{switchTaskTitle}</DialogTitle>
              <DialogDescription>{switchTaskDescription}</DialogDescription>
            </DialogHeader>
            <div className="py-4">{TaskSelectorComponent}</div>
          </DialogContent>
        </Dialog>

        {/* Skip Confirmation Dialog */}
        <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{skipConfirmTitle(skipTargetLabel ?? shortBreak)}</DialogTitle>
              <DialogDescription>{skipConfirmDescription}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSkipDialog(false)}>
                {cancel}
              </Button>
              <Button onClick={confirmSkip} autoFocus>
                {skipConfirmOk}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Circular Layout (Classic Mode)
  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-8 relative">
      {/* Top Controls: Switch Layout & Focus Mode */}
      <div className="absolute top-0 right-0 flex items-center gap-2">
        {allowVariantToggle && (
          <button
            onClick={() => setInternalVariant('horizontal')}
            title={horizontalView}
            className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <LayoutList className="w-5 h-5" />
          </button>
        )}
        {onFocusModeClick && (
          <button onClick={onFocusModeClick} title={enterFocusMode} className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-colors">
            <Maximize2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Mode & Settings Info */}
      <div className="text-center w-full max-w-sm">
        <p
          className="font-semibold text-lg mb-4 transition-colors duration-300 animate-in fade-in"
          style={{ color: accentColor }}
        >
          {getModeLabel()}
        </p>

        {TaskSelectorComponent}

        {/* Pause Metrics */}
        {isRunning && pauseCount > 0 && (
          <div
            className="mt-3 text-xs text-muted-foreground flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2"
          >
            <span>{pauseCountLabel(pauseCount)}</span>
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div
        className="relative animate-in zoom-in fade-in duration-500"
      >
        <svg className="h-80 w-80 -rotate-90 transform transition-rotate duration-500">
          <circle
            cx="160"
            cy="160"
            r="150"
            stroke="currentColor"
            strokeWidth="10"
            fill="none"
            className="text-muted/20"
          />
          <circle
            cx="160"
            cy="160"
            r="150"
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 150}`}
            style={{ 
                stroke: accentColor,
                strokeDashoffset: `${2 * Math.PI * 150 * (1 - progress / 100)}`,
                transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease'
            }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
          <h1 className="text-7xl font-bold tabular-nums text-foreground">
            {formatTime(timeLeft)}
          </h1>
          {isPaused && (
            <span className="text-sm text-muted-foreground animate-pulse">{paused}</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePlayPause}
          className="flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 10px 20px -5px ${accentColor}50`,
          }}
        >
          {isRunning && !isPaused ? (
            <Pause className="h-8 w-8" />
          ) : (
            <Play className="h-8 w-8 ml-1" />
          )}
        </button>

        {(isRunning || isPaused) && (
          <>
            <button
              onClick={() => stop(false)}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-muted/50 text-muted-foreground hover:border-muted-foreground transition-all duration-300 hover:scale-110 active:scale-95 bg-background cursor-pointer"
            >
              <Square className="h-6 w-6" />
            </button>

            {defaultMode === 'POMODORO' && (
              <button
                onClick={handleSkip}
                className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-muted/50 text-muted-foreground hover:border-muted-foreground transition-all duration-300 hover:scale-110 active:scale-95 bg-background cursor-pointer"
                title={skipButtonTitle}
                aria-label={skipButtonTitle}
              >
                <SkipForward className="h-6 w-6" />
              </button>
            )}

            <button
              onClick={() => setShowSwitchDialog?.(true)}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-muted/50 text-muted-foreground hover:border-muted-foreground transition-all duration-300 hover:scale-110 active:scale-95 bg-background cursor-pointer"
              title={switchTaskButtonTitle}
            >
              <RefreshCw className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Switch Task Dialog */}
      <Dialog open={showSwitchDialog} onOpenChange={setShowSwitchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{switchTaskTitle}</DialogTitle>
            <DialogDescription>{switchTaskDescription}</DialogDescription>
          </DialogHeader>
          <div className="py-4">{TaskSelectorComponent}</div>
        </DialogContent>
      </Dialog>

      {/* Skip Confirmation Dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{skipConfirmTitle(skipTargetLabel ?? shortBreak)}</DialogTitle>
            <DialogDescription>{skipConfirmDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSkipDialog(false)}>
              {cancel}
            </Button>
            <Button onClick={confirmSkip} autoFocus>
              {skipConfirmOk}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
