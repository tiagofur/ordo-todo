'use client';

import { motion, AnimatePresence } from 'framer-motion';
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
      bg: 'bg-amber-500/10',
      text: 'text-amber-500',
      glow: 'shadow-amber-500/20',
    },
    rare: {
      bg: 'bg-orange-500/10',
      text: 'text-orange-500',
      glow: 'shadow-orange-500/30',
    },
    epic: {
      bg: 'bg-red-500/10',
      text: 'text-red-500',
      glow: 'shadow-red-500/40',
    },
    legendary: {
      bg: 'bg-gradient-to-r from-amber-500/20 via-red-500/20 to-purple-500/20',
      text: 'text-transparent bg-gradient-to-r from-amber-500 via-red-500 to-purple-500 bg-clip-text',
      glow: 'shadow-red-500/50',
    },
  };

  const style = tierStyles[tier];

  return (
    <motion.div
      initial={animate ? { scale: 0.8, opacity: 0 } : false}
      animate={animate ? { scale: 1, opacity: 1 } : false}
      whileHover={animate ? { scale: 1.05 } : undefined}
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        sizeClasses[size],
        style.bg,
        animate && tier !== 'common' && `shadow-lg ${style.glow}`,
        className
      )}
    >
      {/* Animated flame icon */}
      <motion.div
        animate={
          animate && tier !== 'common'
            ? {
                rotate: [-5, 5, -5],
                scale: [1, 1.1, 1],
              }
            : {}
        }
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        <Flame
          size={iconSizes[size]}
          className={cn(tier === 'legendary' ? 'text-red-500' : style.text)}
          fill={tier === 'legendary' ? 'url(#flameGradient)' : 'currentColor'}
        />
      </motion.div>

      {/* Streak count */}
      <span className={cn('font-bold', style.text)}>{streak}</span>

      {/* Optional label */}
      {showLabel && size !== 'sm' && (
        <span className={cn('opacity-70', style.text)}>
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
    </motion.div>
  );
}

// Animated streak counter for displaying streak increases
interface StreakCounterProps {
  from: number;
  to: number;
  duration?: number;
  onComplete?: () => void;
}

export function StreakCounter({
  from,
  to,
  duration = 1,
  onComplete,
}: StreakCounterProps) {
  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      onAnimationComplete={onComplete}
    >
      <motion.div
        animate={{
          rotate: [-10, 10, -10],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.3,
          repeat: 3,
          repeatType: 'reverse',
        }}
      >
        <Flame className="h-8 w-8 text-amber-500" fill="#f59e0b" />
      </motion.div>
      <motion.span
        className="text-3xl font-bold text-amber-500"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {to}
      </motion.span>
    </motion.div>
  );
}
