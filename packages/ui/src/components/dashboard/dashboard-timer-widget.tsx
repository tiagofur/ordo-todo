'use client';

import { Timer, Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/index.js';

interface TimerWidgetProps {
  mode: string;
  isRunning: boolean;
  isPaused: boolean;
  timeLeft: number;
  completedPomodoros: number;
  progress: number;
  accentColor?: string;
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
  accentColor = '#6b7280',
  onToggle,
  onReset,
  onSkip,
  onClick,
  formatTime,
  labels = {},
}: TimerWidgetProps) {
  const t = { ...DEFAULT_LABELS, ...labels };

  const modeColor = MODE_COLORS[mode] || accentColor;
  const isIdle = !isRunning && !isPaused;

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
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border-2 bg-card p-6 transition-all duration-300 cursor-pointer',
        'hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20'
      )}
      style={{ borderColor: modeColor, transition: 'border-color 0.5s' }}
      onClick={onClick}
    >
      {/* Progress background */}
      <div
        className="absolute inset-0 opacity-10 transition-all duration-1000 ease-linear"
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
              <h3 className="text-lg font-semibold">{getModeLabel(mode)}</h3>
              <p className="text-xs text-muted-foreground">
                {completedPomodoros} {t.completedPomodoros}
              </p>
            </div>
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-4">
          <p
            className="text-5xl font-bold font-mono tracking-wider transition-colors duration-300"
            style={{ color: isRunning ? modeColor : undefined }}
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
              'h-10 w-10 flex items-center justify-center rounded-xl border border-border/50 bg-background transition-all duration-200',
              isIdle ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'
            )}
            title={t.reset}
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={onToggle}
            className="h-12 w-24 flex items-center justify-center rounded-xl text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: modeColor,
              boxShadow: `0 4px 14px -3px ${modeColor}60`,
            }}
            title={isRunning && !isPaused ? t.pause : t.start}
          >
            {isRunning && !isPaused ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-1" />
            )}
          </button>

          <button
            onClick={onSkip}
            disabled={!isRunning}
            className={cn(
              'h-10 w-10 flex items-center justify-center rounded-xl border border-border/50 bg-background transition-all duration-200',
              !isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'
            )}
            title={t.skip}
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Mode indicators */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {['WORK', 'SHORT_BREAK', 'LONG_BREAK'].map((m) => (
            <div
              key={m}
              className={cn(
                'h-2 w-2 rounded-full transition-all duration-300',
                mode === m ? 'scale-125' : 'opacity-30'
              )}
              style={{
                backgroundColor: MODE_COLORS[m] || '#6b7280',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
