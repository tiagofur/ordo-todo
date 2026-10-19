
import { Timer, Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/index.js';

interface TimerWidgetProps {
  mode: string;
  isRunning: boolean;
  isPaused: boolean;
  timeLeft: number;
  completedPomodoros: number;
  progress: number;
  accentColor?: string;
  className?: string;
  onToggle: () => void;
  onReset: () => void;
  onSkip: () => void;
  onClick?: () => void;
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
  };
}

const MODE_COLORS: Record<string, string> = {
  WORK: '#ef4444',
  SHORT_BREAK: '#22c55e',
  LONG_BREAK: '#3b82f6',
  CONTINUOUS: '#8b5cf6',
  POMODORO: '#ef4444',
  STOPWATCH: '#f59e0b',
};

const DEFAULT_LABELS = {
  work: 'Work',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
  continuous: 'Continuous',
  idle: 'Idle',
  completedPomodoros: 'pomodoros completed',
  reset: 'Reset',
  start: 'Start',
  pause: 'Pause',
  skip: 'Skip',
};

export function DashboardTimerWidget({
  mode,
  isRunning,
  isPaused,
  timeLeft,
  completedPomodoros,
  progress,
  accentColor = '#06b6d4',
  onToggle,
  onReset,
  onSkip,
  onClick,
  formatTime,
  className,
  labels = {},
}: TimerWidgetProps) {
  const t = { ...DEFAULT_LABELS, ...labels };

  const modeColor = MODE_COLORS[mode] || accentColor;
  const isIdle = !isRunning && !isPaused;
  const isActiveRun = isRunning && !isPaused;

  // Starts 100% full when idle or at 0% elapsed progress, and drains vertically to 0% as progress reaches 100%
  const clampedProgress = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0;
  const fillPercent = isIdle
    ? 100
    : mode === 'CONTINUOUS'
      ? 100
      : Math.max(0, Math.min(100, 100 - clampedProgress));

  const getModeLabel = (m: string) => {
    switch (m) {
      case 'WORK': return t.work;
      case 'SHORT_BREAK': return t.shortBreak;
      case 'LONG_BREAK': return t.longBreak;
      case 'CONTINUOUS': return t.continuous;
      default: return isIdle ? t.idle : m;
    }
  };

  return (
    <motion.div
      whileHover={{
        y: -3,
        borderColor: `${modeColor}70`,
        boxShadow: `0 12px 28px -6px ${modeColor}25`,
      }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/60 bg-card/90 text-card-foreground backdrop-blur-xl p-5 transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-xs h-full',
        className
      )}
      onClick={onClick}
    >
      {/* Subtle Glass Gauge Marks on Right Edge */}
      <div className="pointer-events-none absolute inset-y-6 right-2.5 z-10 flex flex-col justify-between items-end opacity-25">
        <span className="h-[1px] w-2 bg-foreground/60 rounded-full" />
        <span className="h-[1px] w-1.5 bg-foreground/40 rounded-full" />
        <span className="h-[1px] w-2.5 bg-foreground/60 rounded-full" />
        <span className="h-[1px] w-1.5 bg-foreground/40 rounded-full" />
        <span className="h-[1px] w-2 bg-foreground/60 rounded-full" />
      </div>

      {/* Emptying Glass Vertical Liquid Container (Drains Top -> Bottom) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 transition-[height] duration-1000 ease-linear"
        style={{
          height: `${fillPercent}%`,
        }}
      >
        {/* Animated Wave Meniscus at Top of Liquid */}
        <div
          className={cn(
            'absolute -top-3 inset-x-0 h-3.5 overflow-hidden transition-opacity duration-500',
            fillPercent <= 0 ? 'opacity-0' : isActiveRun ? 'opacity-100' : 'opacity-60'
          )}
        >
          {/* Primary Wave */}
          <svg
            className="absolute top-0 left-0 h-full w-[200%]"
            style={{
              color: modeColor,
              opacity: isActiveRun ? 0.24 : 0.14,
              animation: isActiveRun
                ? 'ordoLiquidWave 3.6s linear infinite'
                : 'ordoLiquidWave 9s linear infinite',
            }}
            viewBox="0 0 1200 24"
            preserveAspectRatio="none"
          >
            <path
              d="M0,12 C150,24 300,0 450,12 C600,24 750,0 900,12 C1050,24 1200,0 1200,12 L1200,24 L0,24 Z"
              fill="currentColor"
            />
          </svg>
          {/* Secondary Counter-Wave for Depth */}
          <svg
            className="absolute top-0.5 left-0 h-full w-[200%]"
            style={{
              color: modeColor,
              opacity: isActiveRun ? 0.18 : 0.1,
              animation: isActiveRun
                ? 'ordoLiquidWaveReverse 5.2s linear infinite'
                : 'ordoLiquidWaveReverse 12s linear infinite',
            }}
            viewBox="0 0 1200 24"
            preserveAspectRatio="none"
          >
            <path
              d="M0,12 C200,0 400,24 600,12 C800,0 1000,24 1200,12 L1200,24 L0,24 Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Main Liquid Body */}
        <div
          className="h-full w-full transition-colors duration-500"
          style={{
            background: `linear-gradient(to top, ${modeColor}${isActiveRun ? '28' : '1c'} 0%, ${modeColor}${isActiveRun ? '18' : '10'} 70%, ${modeColor}${isActiveRun ? '24' : '14'} 100%)`,
          }}
        />

        {/* Top Meniscus Highlight Line */}
        {fillPercent > 1 && fillPercent < 99 && (
          <div
            className="absolute top-0 inset-x-0 h-[1.5px] transition-opacity duration-300"
            style={{
              backgroundColor: modeColor,
              opacity: isActiveRun ? 0.45 : 0.25,
            }}
          />
        )}

        {/* Rising Micro-Bubbles when Running */}
        {isActiveRun && fillPercent > 10 && (
          <div className="absolute inset-0 overflow-hidden">
            <span
              className="absolute bottom-2 left-[22%] h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: modeColor,
                opacity: 0.35,
                animation: 'ordoBubbleRise 2.8s ease-in infinite',
              }}
            />
            <span
              className="absolute bottom-1 left-[54%] h-1 w-1 rounded-full"
              style={{
                backgroundColor: modeColor,
                opacity: 0.3,
                animation: 'ordoBubbleRise 3.4s ease-in 0.9s infinite',
              }}
            />
            <span
              className="absolute bottom-3 left-[76%] h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: modeColor,
                opacity: 0.28,
                animation: 'ordoBubbleRise 2.5s ease-in 1.5s infinite',
              }}
            />
          </div>
        )}
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 shrink-0"
              style={{
                backgroundColor: `${modeColor}15`,
                color: modeColor,
                border: `1px solid ${modeColor}25`,
              }}
            >
              <Timer className={cn('h-5 w-5', isActiveRun && 'animate-pulse')} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold tracking-tight text-foreground truncate">
                {getModeLabel(mode)}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {completedPomodoros} {t.completedPomodoros}
              </p>
            </div>
          </div>

          {/* Mode Dots / Fill Badge */}
          <div className="flex items-center gap-1.5">
            {!isIdle && mode !== 'CONTINUOUS' ? (
              <span
                className="text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${modeColor}15`,
                  color: modeColor,
                }}
              >
                {Math.round(fillPercent)}%
              </span>
            ) : (
              <div className="flex items-center gap-1.5 px-1">
                {['WORK', 'SHORT_BREAK', 'LONG_BREAK'].map((m) => (
                  <div
                    key={m}
                    className={cn(
                      'h-1.5 w-1.5 rounded-full transition-all duration-300',
                      mode === m ? 'scale-125 opacity-100' : 'opacity-30'
                    )}
                    style={{
                      backgroundColor: MODE_COLORS[m] || '#6b7280',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center my-3">
          <p
            className="text-4xl font-bold font-mono tracking-tight tabular-nums transition-colors duration-300 text-foreground"
            style={{ color: isActiveRun ? modeColor : 'var(--foreground)' }}
          >
            {formatTime(timeLeft)}
          </p>
        </div>

        {/* Controls */}
        <div
          className="flex items-center justify-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onReset}
            disabled={isIdle}
            className={cn(
              'h-9 w-9 flex items-center justify-center rounded-xl border border-border/60 bg-background/70 backdrop-blur-md transition-all duration-200',
              isIdle ? 'opacity-40 cursor-not-allowed' : 'hover:bg-muted active:scale-95'
            )}
            title={t.reset}
          >
            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          <button
            onClick={onToggle}
            className="h-10 px-6 flex items-center justify-center rounded-xl text-white font-medium shadow-sm transition-all duration-200 hover:brightness-105 active:scale-95"
            style={{
              backgroundColor: modeColor,
              boxShadow: `0 4px 12px -2px ${modeColor}45`,
            }}
            title={isActiveRun ? t.pause : t.start}
          >
            {isActiveRun ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={onSkip}
            disabled={!isRunning}
            className={cn(
              'h-9 w-9 flex items-center justify-center rounded-xl border border-border/60 bg-background/70 backdrop-blur-md transition-all duration-200',
              !isRunning ? 'opacity-40 cursor-not-allowed' : 'hover:bg-muted active:scale-95'
            )}
            title={t.skip}
          >
            <SkipForward className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes ordoLiquidWave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes ordoLiquidWaveReverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes ordoBubbleRise {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          30% { opacity: 0.4; }
          100% { transform: translateY(-90px) scale(1.2); opacity: 0; }
        }
      `}</style>
    </motion.div>
  );
}
