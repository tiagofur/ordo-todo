
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
      bg: 'bg-amber-100 dark:bg-amber-900', // Solid background for platform-agnostic
      text: 'text-amber-500',
      glow: 'shadow-none',
    },
    rare: {
      bg: 'bg-orange-100 dark:bg-orange-900',
      text: 'text-orange-500',
      glow: 'shadow-md shadow-orange-500/30',
    },
    epic: {
      bg: 'bg-red-100 dark:bg-red-900',
      text: 'text-red-500',
      glow: 'shadow-lg shadow-red-500/40',
    },
    legendary: {
      bg: 'bg-gradient-to-r from-amber-100 via-red-100 to-purple-100 dark:from-amber-900 dark:via-red-900 dark:to-purple-900',
      text: 'text-transparent bg-gradient-to-r from-amber-500 via-red-500 to-purple-500 bg-clip-text',
      glow: 'shadow-xl shadow-red-500/50',
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
          className={cn(tier === 'legendary' ? 'text-red-500' : style.text)}
          fill={tier === 'legendary' ? 'url(#flameGradient)' : 'currentColor'}
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

      {/* SVG gradient for legendary tier */}
      {tier === 'legendary' && (
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient
              id="flameGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
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
      <div className="animate-bounce">
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
