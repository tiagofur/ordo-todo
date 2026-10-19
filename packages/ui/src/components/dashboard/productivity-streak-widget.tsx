
import { Flame, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/index.js';

interface ProductivityStreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
  accentColor?: string;
  className?: string;
  labels?: {
    currentStreak?: string;
    day?: string;
    days?: string;
    personalBest?: string;
    bestStreak?: string;
  };
}

const DEFAULT_LABELS = {
  currentStreak: 'Current Streak',
  day: 'day',
  days: 'days',
  personalBest: 'Personal best!',
  bestStreak: 'Best streak:',
};

export function ProductivityStreakWidget({
  currentStreak,
  longestStreak,
  className,
  labels = {},
}: ProductivityStreakWidgetProps) {
  const t = { ...DEFAULT_LABELS, ...labels };
  const isOnStreak = currentStreak > 0;
  const isPersonalBest = currentStreak === longestStreak && currentStreak > 0;
  const streakColor = isOnStreak ? '#f97316' : '#6b7280';

  return (
    <motion.div
      whileHover={{
        y: -3,
        borderColor: `${streakColor}70`,
        boxShadow: `0 12px 28px -6px ${streakColor}25`,
      }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/60 bg-card/90 backdrop-blur-xl p-5 transition-all duration-300 flex flex-col justify-between shadow-xs h-full',
        className
      )}
    >
      {/* Subtle Ambient Glow */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-15"
        style={{ backgroundColor: streakColor }}
      />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 shrink-0',
              'group-hover:scale-105'
            )}
            style={{
              backgroundColor: `${streakColor}15`,
              color: streakColor,
              border: `1px solid ${streakColor}25`,
            }}
          >
            <Flame className={cn('h-5 w-5', isOnStreak && 'animate-pulse')} />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              {t.currentStreak}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t.bestStreak} <span className="font-medium text-foreground tabular-nums">{longestStreak}</span> {longestStreak !== 1 ? t.days : t.day}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 my-3 flex items-baseline gap-2">
        <p className="text-4xl font-bold tracking-tight tabular-nums text-foreground">
          {currentStreak}
        </p>
        <span className="text-sm font-medium text-muted-foreground">
          {currentStreak !== 1 ? t.days : t.day}
        </span>
      </div>

      <div className="relative z-10 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
        {isPersonalBest && currentStreak > 0 ? (
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{t.personalBest}</span>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-muted-foreground">{t.bestStreak}</span>
            <span className="font-semibold text-foreground tabular-nums">
              {longestStreak} {longestStreak !== 1 ? t.days : t.day}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
