
import { cn } from '../../utils/index.js';
import { type ReactNode } from 'react';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  animate?: boolean;
  className?: string;
  children?: ReactNode;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#10B981',
  backgroundColor = 'currentColor', // Changed default to generic
  showLabel = true,
  animate = true,
  className,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        className
      )}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke={backgroundColor}
          className="text-muted/20"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: animate ? 'stroke-dashoffset 1s ease-out' : 'none',
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children ? (
          children
        ) : showLabel ? (
          <div
            className={cn(
                "text-center",
                animate && "animate-in zoom-in fade-in duration-500 delay-500"
            )}
          >
            <span className="text-2xl font-bold">{Math.round(progress)}%</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// Daily progress widget with animated ring
interface DailyProgressProps {
  completed: number;
  total: number;
  color?: string;
}

export function DailyProgress({
  completed,
  total,
  color = '#10B981',
}: DailyProgressProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = completed === total && total > 0;

  return (
    <div className="relative">
      <ProgressRing
        progress={percentage}
        size={100}
        strokeWidth={6}
        color={isComplete ? '#10B981' : color}
        animate
      >
        <div className="text-center animate-in zoom-in duration-500">
          <div
            className="text-lg font-bold"
          >
            {completed}/{total}
          </div>
          <div className="text-xs text-muted-foreground">today</div>
        </div>
      </ProgressRing>

      {/* Completion celebration pulse */}
      {isComplete && (
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            border: `2px solid ${color}`,
            opacity: 0.5
          }}
        />
      )}
    </div>
  );
}

// Mini progress bar for habit list items
interface MiniProgressBarProps {
  progress: number; // 0 - 100
  color?: string;
  height?: number;
  className?: string;
}

export function MiniProgressBar({
  progress,
  color = '#10B981',
  height = 4,
  className,
}: MiniProgressBarProps) {
  return (
    <div
      className={cn(
        'w-full rounded-full overflow-hidden bg-muted/50',
        className
      )}
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ 
            width: `${Math.min(100, progress)}%`,
            backgroundColor: color 
        }}
      />
    </div>
  );
}
