import type { ReactNode } from 'react';
import { Play, Pause, Square, SkipForward, Target, Maximize2, ChevronsUpDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/index.js';

export interface DashboardTimerWidgetProps {
  mode: string;
  isRunning: boolean;
  isPaused: boolean;
  timeLeft: number;
  completedPomodoros: number;
  progress: number;
  pauseCount?: number;
  accentColor?: string;
  className?: string;
  onToggle: () => void;
  onReset: () => void;
  onSkip: () => void;
  onClick?: () => void;
  onFocusModeClick?: () => void;
  TaskSelectorComponent?: ReactNode;
  taskTitle?: string;
  config?: {
    workDuration?: number;
    shortBreakDuration?: number;
    longBreakDuration?: number;
  };
  formatTime: (seconds: number) => string;
  labels?: {
    work?: string;
    shortBreak?: string;
    longBreak?: string;
    continuous?: string;
    idle?: string;
    completedPomodoros?: string;
    reset?: string;
    start?: string;
    pause?: string;
    skip?: string;
    paused?: string;
    focusMode?: string;
    assignedTask?: string;
    selectTaskPlaceholder?: string;
    pomodoroCount?: (count: number) => string;
    pauseCount?: (count: number) => string;
  };
}

export type TimerWidgetProps = DashboardTimerWidgetProps;

const MODE_COLORS: Record<string, string> = {
  WORK: '#f43f5e',
  POMODORO: '#f43f5e',
  SHORT_BREAK: '#10b981',
  LONG_BREAK: '#0d9488',
  CONTINUOUS: '#3b82f6',
  STOPWATCH: '#3b82f6',
};

const DEFAULT_LABELS = {
  work: 'Trabajo',
  shortBreak: 'Descanso Corto',
  longBreak: 'Descanso Largo',
  continuous: 'Continuo',
  idle: 'Inactivo',
  completedPomodoros: 'pomodoros completados',
  reset: 'Reiniciar',
  start: 'Iniciar',
  pause: 'Pausar',
  skip: 'Saltar',
  paused: 'En Pausa',
  focusMode: 'Enfoque',
  assignedTask: 'TAREA ASIGNADA',
  selectTaskPlaceholder: 'Seleccionar tarea para trabajar...',
  pomodoroCount: (count: number) => `Pomodoro ${count}`,
  pauseCount: (count: number) => `${count} pausa${count !== 1 ? 's' : ''}`,
};

export function DashboardTimerWidget({
  mode,
  isRunning,
  isPaused,
  timeLeft,
  completedPomodoros,
  progress,
  pauseCount = 0,
  accentColor: customAccentColor,
  onToggle,
  onReset,
  onSkip,
  onClick,
  onFocusModeClick,
  TaskSelectorComponent,
  taskTitle,
  config,
  formatTime,
  className,
  labels = {},
}: DashboardTimerWidgetProps) {
  const t = { ...DEFAULT_LABELS, ...labels };

  const activeModeColor = MODE_COLORS[mode] || customAccentColor || '#f43f5e';
  const isIdle = !isRunning && !isPaused;
  const isActiveRun = isRunning && !isPaused;

  const clampedProgress = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0;

  const getModeLabel = () => {
    if (mode === 'CONTINUOUS' || mode === 'STOPWATCH') return t.continuous;
    if (mode === 'WORK' || mode === 'POMODORO') return t.pomodoroCount(completedPomodoros + 1);
    if (mode === 'SHORT_BREAK') return t.shortBreak;
    if (mode === 'LONG_BREAK') return t.longBreak;
    return isIdle ? t.idle : mode;
  };

  return (
    <motion.div
      whileHover={{
        y: -2,
        borderColor: `${activeModeColor}60`,
        boxShadow: `0 12px 28px -6px ${activeModeColor}20`,
      }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/95 via-card/85 to-card text-card-foreground backdrop-blur-xl p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between shadow-xs h-full cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Ambient gradient glow in the corner */}
      <div
        className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full blur-3xl opacity-15 transition-colors duration-500"
        style={{ backgroundColor: activeModeColor }}
      />

      {/* Preset Mode Chips */}
      <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        {/* Trabajo */}
        <div
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all border shrink-0 whitespace-nowrap',
            mode === 'WORK' || mode === 'POMODORO'
              ? 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border-rose-500/30 shadow-2xs'
              : 'bg-muted/40 text-muted-foreground border-transparent hover:bg-muted/60'
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full shrink-0',
              mode === 'WORK' || mode === 'POMODORO'
                ? 'bg-rose-500 animate-pulse'
                : 'bg-muted-foreground/40'
            )}
          />
          <span>{t.work} ({config?.workDuration || 25}m)</span>
        </div>

        {/* Descanso Corto */}
        <div
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all border shrink-0 whitespace-nowrap',
            mode === 'SHORT_BREAK'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-2xs'
              : 'bg-muted/40 text-muted-foreground border-transparent hover:bg-muted/60'
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full shrink-0',
              mode === 'SHORT_BREAK'
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-muted-foreground/40'
            )}
          />
          <span>{t.shortBreak} ({config?.shortBreakDuration || 5}m)</span>
        </div>

        {/* Descanso Largo */}
        <div
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all border shrink-0 whitespace-nowrap',
            mode === 'LONG_BREAK'
              ? 'bg-teal-600/15 text-teal-600 dark:text-teal-400 border-teal-600/30 shadow-2xs'
              : 'bg-muted/40 text-muted-foreground border-transparent hover:bg-muted/60'
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full shrink-0',
              mode === 'LONG_BREAK'
                ? 'bg-teal-600 animate-pulse'
                : 'bg-muted-foreground/40'
            )}
          />
          <span>{t.longBreak} ({config?.longBreakDuration || 15}m)</span>
        </div>

        {/* Continuo */}
        <div
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all border shrink-0 whitespace-nowrap',
            mode === 'CONTINUOUS' || mode === 'STOPWATCH'
              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 shadow-2xs'
              : 'bg-muted/40 text-muted-foreground border-transparent hover:bg-muted/60'
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full shrink-0',
              mode === 'CONTINUOUS' || mode === 'STOPWATCH'
                ? 'bg-blue-500 animate-pulse'
                : 'bg-muted-foreground/40'
            )}
          />
          <span>{t.continuous}</span>
        </div>
      </div>

      {/* Cockpit Center / Main Display */}
      <div className="relative z-10 my-2 space-y-2.5">
        {/* Status Badge & Quick Actions */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border shadow-2xs"
              style={{
                borderColor: `${activeModeColor}40`,
                backgroundColor: `${activeModeColor}15`,
                color: activeModeColor,
              }}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  isActiveRun ? 'animate-pulse' : ''
                )}
                style={{ backgroundColor: activeModeColor }}
              />
              <span>{getModeLabel()}</span>
            </div>

            {isPaused && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                {t.paused}
              </span>
            )}

            {isRunning && pauseCount > 0 && (
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {t.pauseCount(pauseCount)}
              </span>
            )}
          </div>

          {onFocusModeClick && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFocusModeClick();
              }}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted/50 cursor-pointer"
              title={t.focusMode}
            >
              <Maximize2 className="h-3 w-3" />
              <span>{t.focusMode}</span>
            </button>
          )}
        </div>

        {/* Time and Tactile Controls Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Digits + percentage */}
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight tabular-nums text-foreground leading-none">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {Math.round(clampedProgress)}%
            </span>
          </div>

          {/* Tactile Play/Pause & Secondary Controls */}
          <div
            className="flex items-center gap-1.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {(isRunning || isPaused) && (
              <>
                <button
                  type="button"
                  onClick={onReset}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 active:scale-95 cursor-pointer bg-card/80 shadow-2xs"
                  title={t.reset}
                >
                  <Square className="h-3.5 w-3.5" />
                </button>

                {(mode === 'WORK' || mode === 'POMODORO') && (
                  <button
                    type="button"
                    onClick={onSkip}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 active:scale-95 cursor-pointer bg-card/80 shadow-2xs"
                    title={t.skip}
                  >
                    <SkipForward className="h-3.5 w-3.5" />
                  </button>
                )}
              </>
            )}

            {/* Signature Squircle Play Button */}
            <button
              type="button"
              onClick={onToggle}
              className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl text-white shadow-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              style={{
                backgroundColor: activeModeColor,
                boxShadow: `0 8px 20px -4px ${activeModeColor}60`,
              }}
              title={isActiveRun ? t.pause : t.start}
            >
              {isActiveRun ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Sleek Horizontal Progress Bar */}
        <div className="w-full">
          <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden relative border border-border/30">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${clampedProgress}%`,
                backgroundColor: activeModeColor,
                boxShadow: `0 0 10px ${activeModeColor}80`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom: Assigned Task */}
      <div
        className="relative z-10 pt-2.5 border-t border-border/50 space-y-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
          <span className="flex items-center gap-1.5">
            <Target className="h-3 w-3 text-muted-foreground" />
            <span>{t.assignedTask}</span>
          </span>
        </div>

        <div className="w-full">
          {TaskSelectorComponent ? (
            TaskSelectorComponent
          ) : (
            <button
              type="button"
              onClick={onClick}
              className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-background/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <span className="truncate">{taskTitle || t.selectTaskPlaceholder}</span>
              <ChevronsUpDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
