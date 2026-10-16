
import { Flame } from 'lucide-react';
import { cn } from '../../utils/index.js';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animate?: boolean;
  className?: string;
  labels?: {
    day?: string;
    days?: string;
  };
}

const DEFAULT_LABELS = {
  day: 'day',
  days: 'days',
};

export function StreakBadge({
  streak,
  size = 'md',
  showLabel = true,
  animate = true,
  className,
  labels = {},
}: StreakBadgeProps) {
  const t = { ...DEFAULT_LABELS, ...labels };

  if (streak <= 0) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  // Determine streak tier for styling
  const getTier = (s: number) => {
    if (s >= 100) return 'legendary';
    if (s >= 30) return 'epic';
    if (s >= 7) return 'rare';
    return 'common';
  };

  const tier = getTier(streak);

  const tierStyles = {
    common: {
      bg: 'bg-amber-100/80 dark:bg-amber-950/50',
      text: 'text-amber-600 dark:text-amber-400',
      glow: 'shadow-none',
    },
    rare: {
      bg: 'bg-orange-100/80 dark:bg-orange-950/50',
      text: 'text-orange-600 dark:text-orange-400',
      glow: 'shadow-xs',
    },
    epic: {
      bg: 'bg-red-100/80 dark:bg-red-950/50',
      text: 'text-red-600 dark:text-red-400',
      glow: 'shadow-sm',
    },
    legendary: {
      bg: 'bg-red-100/90 dark:bg-red-950/70',
      text: 'text-red-600 dark:text-red-400',
      glow: 'shadow-sm shadow-red-500/20',
    },
  };

  const style = tierStyles[tier];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-semibold transition-transform hover:scale-105',
        sizeClasses[size],
        style.bg,
        animate ? 'animate-in fade-in zoom-in duration-300' : '',
        animate && tier !== 'common' && style.glow,
        className
      )}
    >
      {/* Flame icon */}
      <div
        className={cn(
            animate && tier !== 'common' ? 'animate-pulse' : ''
        )}
      >
        <Flame
          size={iconSizes[size]}
          className={style.text}
          fill="currentColor"
        />
      </div>

      {/* Streak count */}
      <span className={cn('font-bold', style.text)}>{streak}</span>

      {/* Optional label */}
      {showLabel && size !== 'sm' && (
        <span className={cn('text-muted-foreground', style.text)}>
          {streak === 1 ? t.day : t.days}
        </span>
      )}
    </div>
  );
}

// Animated streak counter for displaying streak increases
export interface StreakCounterProps {
  from: number;
  to: number;
  // duration is ignored in stateless version but kept for API compatibility
  duration?: number;
  // onComplete not used in stateless version
  onComplete?: () => void;
}

export function StreakCounter({
  to,
}: StreakCounterProps) {
  return (
    <div className="flex items-center gap-2 animate-in zoom-in duration-300">
      <div className="animate-pulse">
        <Flame className="h-8 w-8 text-amber-500" fill="#f59e0b" />
      </div>
      <span
        className="text-3xl font-bold text-amber-500 animate-in slide-in-from-bottom-2 fade-in duration-500"
      >
        {to}
      </span>
    </div>
  );
}
