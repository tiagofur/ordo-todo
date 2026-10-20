import type { ReactNode } from 'react';
import { Play, Pause, Square, SkipForward, Target, Maximize2, ChevronsUpDown, Coffee, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/index.js';
import { TomatoIcon } from '../ui/custom-icons.js';

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
  /** Jump to an explicit phase. Chips render as buttons only when provided. */
  onPhaseSelect?: (phase: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK') => void;
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
    freeFlow?: string;
    goToPhase?: (phase: string) => string;
    stopToSwitchPhase?: string;
  };
}

export type TimerWidgetProps = DashboardTimerWidgetProps;

interface PhaseChipProps {
  phase: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';
  label: string;
  name: string;
  isActive: boolean;
  activeClassName: string;
  disabled: boolean;
  disabledTitle: string;
  goToPhaseTitle: string;
  onSelect?: (phase: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK') => void;
}

/**
 * Duration chip: a button jumping to its phase when the timer is stopped,
 * a plain indicator otherwise (running/paused, or no handler wired).
 */
function PhaseChip({
  phase,
  label,
  name,
  isActive,
  activeClassName,
  disabled,
  disabledTitle,
  goToPhaseTitle,
  onSelect,
}: PhaseChipProps) {
  const className = cn(
    'px-1 py-0.5 rounded transition-colors',
    isActive ? activeClassName : 'opacity-60',
    !disabled && !isActive && 'hover:opacity-100 hover:bg-muted cursor-pointer'
  );
  if (disabled) {
    return (
      <span className={className} title={isActive ? name : disabledTitle}>
        {label}
      </span>
    );
  }
  return (
    <button
      type="button"
      className={className}
      title={isActive ? name : goToPhaseTitle}
      aria-label={isActive ? name : goToPhaseTitle}
      aria-current={isActive ? 'true' : undefined}
      onClick={() => onSelect?.(phase)}
    >
      {label}
    </button>
  );
}

const MODE_COLORS: Record<string, string> = {
  WORK: '#f43f5e',
  POMODORO: '#f43f5e',
  SHORT_BREAK: '#10b981',
  LONG_BREAK: '#0d9488',
  CONTINUOUS: '#3b82f6',
  STOPWATCH: '#3b82f6',
};

const DEFAULT_LABELS = {
  work: 'Enfoque',
  shortBreak: 'Pausa Corta',
  longBreak: 'Pausa Larga',
  continuous: 'Continuo',
  freeFlow: 'Libre',
  idle: 'Inactivo',
  completedPomodoros: 'pomodoros completados',
  reset: 'Reiniciar',
  start: 'Iniciar',
  pause: 'Pausar',
  skip: 'Saltar',
  paused: 'En Pausa',
  focusMode: 'Modo Enfoque',
  assignedTask: 'TAREA ASIGNADA',
  selectTaskPlaceholder: 'Seleccionar tarea para trabajar...',
  pomodoroCount: (count: number) => `Pomodoro #${count}`,
  pauseCount: (count: number) => `${count} pausa${count !== 1 ? 's' : ''}`,
  goToPhase: (phase: string) => `Ir a ${phase}`,
  stopToSwitchPhase: 'Detén el temporizador para cambiar de fase',
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
  onPhaseSelect,
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
  const isActiveRun = isRunning && !isPaused;
  const isContinuous = mode === 'CONTINUOUS' || mode === 'STOPWATCH';
  const isIconOnlyBadge =
    mode === 'SHORT_BREAK' || mode === 'LONG_BREAK' || isContinuous;

  const clampedProgress = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0;

  const getModeLabel = () => {
    if (mode === 'CONTINUOUS' || mode === 'STOPWATCH') return t.continuous;
    if (mode === 'WORK' || mode === 'POMODORO') return t.pomodoroCount(completedPomodoros + 1);
    if (mode === 'SHORT_BREAK') return t.shortBreak;
    if (mode === 'LONG_BREAK') return t.longBreak;
    return mode;
  };

  return (
    <motion.div
      whileHover={{
        y: -2,
        borderColor: `${activeModeColor}60`,
        boxShadow: `0 12px 28px -6px ${activeModeColor}20`,
      }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/95 via-card/85 to-card text-card-foreground backdrop-blur-xl p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between shadow-xs h-full cursor-pointer gap-3',
        className
      )}
      onClick={onClick}
    >
      {/* Ambient gradient glow in the corner */}
      <div
        className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full blur-3xl opacity-15 transition-colors duration-500"
        style={{ backgroundColor: activeModeColor }}
      />

      {/* Row 1: Header - Clean Single Line with Active Mode Badge & Compact Presets + Focus */}
      <div className="relative z-10 flex items-center justify-between gap-2 w-full">
        {/* Left: Mode Badge */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full py-0.5 text-xs font-semibold border shadow-2xs shrink-0 select-none',
              isIconOnlyBadge ? 'px-1.5' : 'px-2.5'
            )}
            style={{
              borderColor: `${activeModeColor}40`,
              backgroundColor: `${activeModeColor}15`,
              color: activeModeColor,
            }}
            title={getModeLabel()}
            aria-label={getModeLabel()}
          >
            {mode === 'WORK' || mode === 'POMODORO' ? (
              <>
                <TomatoIcon className={cn('h-3.5 w-3.5 shrink-0', isActiveRun ? 'animate-pulse' : '')} />
                <span className="font-semibold tabular-nums text-xs">#{completedPomodoros + 1}</span>
              </>
            ) : mode === 'SHORT_BREAK' || mode === 'LONG_BREAK' ? (
              // Icon-only: the break label overlapped the duration chips on
              // narrow cards. Full label stays in title/aria-label.
              <Coffee className="h-3.5 w-3.5 shrink-0" />
            ) : mode === 'CONTINUOUS' || mode === 'STOPWATCH' ? (
              // Icon-only, same reason as breaks.
              <Timer className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <>
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full shrink-0',
                    isActiveRun ? 'animate-pulse' : ''
                  )}
                  style={{ backgroundColor: activeModeColor }}
                />
                <span className="truncate">{getModeLabel()}</span>
              </>
            )}
          </div>

          {isPaused && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse shrink-0">
              {t.paused}
            </span>
          )}

          {isRunning && pauseCount > 0 && (
            <span className="text-[10px] text-muted-foreground tabular-nums shrink-0 hidden sm:inline">
              {t.pauseCount(pauseCount)}
            </span>
          )}
        </div>

        {/* Right: Compact Duration Chips & Focus Icon Button */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Subtle duration preset indicator (Pomodoro) or Free flow indicator (Continuous) */}
          {isContinuous ? (
            <div className="flex items-center bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg border border-blue-500/20 text-[10px] font-semibold gap-1 select-none">
              <span className="font-mono text-xs leading-none">∞</span>
              <span>{t.freeFlow}</span>
            </div>
          ) : (
            <div className="flex items-center bg-muted/40 px-1.5 py-0.5 rounded-lg border border-border/40 text-[10px] font-semibold text-muted-foreground gap-1 select-none">
              <PhaseChip
                phase="WORK"
                label={`${config?.workDuration || 25}m`}
                name={t.work}
                isActive={mode === 'WORK' || mode === 'POMODORO'}
                activeClassName="text-rose-500 font-bold bg-rose-500/10"
                disabled={isRunning || isPaused || !onPhaseSelect}
                disabledTitle={t.stopToSwitchPhase}
                goToPhaseTitle={t.goToPhase(t.work)}
                onSelect={onPhaseSelect}
              />
              <span className="opacity-30">•</span>
              <PhaseChip
                phase="SHORT_BREAK"
                label={`${config?.shortBreakDuration || 5}m`}
                name={t.shortBreak}
                isActive={mode === 'SHORT_BREAK'}
                activeClassName="text-emerald-500 font-bold bg-emerald-500/10"
                disabled={isRunning || isPaused || !onPhaseSelect}
                disabledTitle={t.stopToSwitchPhase}
                goToPhaseTitle={t.goToPhase(t.shortBreak)}
                onSelect={onPhaseSelect}
              />
              <span className="opacity-30">•</span>
              <PhaseChip
                phase="LONG_BREAK"
                label={`${config?.longBreakDuration || 15}m`}
                name={t.longBreak}
                isActive={mode === 'LONG_BREAK'}
                activeClassName="text-teal-500 font-bold bg-teal-500/10"
                disabled={isRunning || isPaused || !onPhaseSelect}
                disabledTitle={t.stopToSwitchPhase}
                goToPhaseTitle={t.goToPhase(t.longBreak)}
                onSelect={onPhaseSelect}
              />
            </div>
          )}

          {/* Focus Mode Icon Button */}
          {onFocusModeClick && (
            <button
              type="button"
              onClick={onFocusModeClick}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
              title={t.focusMode}
              aria-label={t.focusMode}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Hero Digits & Tactile Action Buttons with Generous Spacing */}
      <div className="relative z-10 flex items-center justify-between gap-3 my-0.5">
        {/* Large Monospace Tabular Digits */}
        <span className="text-3.5xl sm:text-4xl font-extrabold font-mono tracking-tight tabular-nums text-foreground leading-none">
          {formatTime(timeLeft)}
        </span>

        {/* Action Controls */}
        <div
          className="flex items-center gap-1.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Secondary Controls: Stop & Skip (shown when active) */}
          {(isRunning || isPaused) && (
            <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={onReset}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 active:scale-95 cursor-pointer bg-card/80 shadow-2xs"
                title={t.reset}
                aria-label={t.reset}
              >
                <Square className="h-3.5 w-3.5" />
              </button>

              {(mode === 'WORK' || mode === 'POMODORO') && (
                <button
                  type="button"
                  onClick={onSkip}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 active:scale-95 cursor-pointer bg-card/80 shadow-2xs"
                  title={t.skip}
                  aria-label={t.skip}
                >
                  <SkipForward className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Primary Squircle Play/Pause Button */}
          <button
            type="button"
            onClick={onToggle}
            className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl text-white shadow-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            style={{
              backgroundColor: activeModeColor,
              boxShadow: `0 8px 20px -4px ${activeModeColor}60`,
            }}
            title={isActiveRun ? t.pause : t.start}
            aria-label={isActiveRun ? t.pause : t.start}
          >
            {isActiveRun ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Row 3: Horizontal Progress Bar with Integrated Percentage */}
      <div className="relative z-10 flex items-center gap-2.5 w-full">
        <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden relative border border-border/30">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              isContinuous && isActiveRun ? 'animate-pulse' : ''
            )}
            style={{
              width: isContinuous ? '100%' : `${clampedProgress}%`,
              backgroundColor: activeModeColor,
              boxShadow: `0 0 10px ${activeModeColor}${isActiveRun ? '80' : '20'}`,
              opacity: isContinuous && !isActiveRun ? 0.35 : 1,
            }}
          />
        </div>
        <span className="text-xs font-semibold tabular-nums text-muted-foreground shrink-0 min-w-[28px] text-right font-mono">
          {isContinuous ? '∞' : `${Math.round(clampedProgress)}%`}
        </span>
      </div>

      {/* Row 4: Assigned Task Section */}
      <div
        className="relative z-10 pt-2 border-t border-border/50 space-y-1.5"
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
