'use client';

import * as React from 'react';
import { cn } from '../../../utils/index.js';
import { Card } from '../../ui/card.js';
import { Progress } from '../../ui/progress.js';
import { Flame, TrendingUp, Target } from 'lucide-react';
import type { ConsistencyScoreProps, StreakBadgeProps, GoalProgressProps } from '@ordo-todo/ui-shared';

/**
 * ConsistencyStreakBadge component for displaying current streak in consistency context
 * Uses different name to avoid conflict with habit/StreakBadge
 */
export function ConsistencyStreakBadge({
  streak,
  size = 'md',
  animated = true,
  className,
}: StreakBadgeProps) {
  const sizeClasses = {
    sm: 'text-sm gap-1',
    md: 'text-base gap-1.5',
    lg: 'text-lg gap-2',
  };

  const iconSizes = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
  };

  return (
    <div
      className={cn(
        'flex items-center font-bold text-orange-400',
        sizeClasses[size],
        className
      )}
    >
      <Flame
        className={cn(
          iconSizes[size],
          animated && streak > 0 && 'animate-pulse'
        )}
      />
      <span>{streak}</span>
    </div>
  );
}

/**
 * GoalProgress component for displaying weekly/monthly goals
 */
export function GoalProgress({
  current,
  target,
  label,
  period = 'weekly',
  showPercentage = true,
  className,
}: GoalProgressProps) {
  const percentage = Math.min(100, (current / target) * 100);
  const isComplete = current >= target;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="size-4 text-cyan-400" />
          <span className="text-sm text-gray-300">
            {label || `${period.charAt(0).toUpperCase() + period.slice(1)} Goal`}
          </span>
        </div>
        <div className="text-sm">
          <span className={cn(isComplete ? 'text-green-400' : 'text-gray-200')}>
            {current}
          </span>
          <span className="text-gray-500">/{target}</span>
          {showPercentage && (
            <span className="text-gray-500 ml-1">
              ({Math.round(percentage)}%)
            </span>
          )}
        </div>
      </div>
      <Progress
        value={percentage}
        className={cn(
          'h-2',
          isComplete && '[&>div]:bg-green-500'
        )}
      />
    </div>
  );
}

/**
 * ConsistencyScore component - main dashboard widget for creator consistency
 */
export function ConsistencyScore({
  score,
  currentStreak,
  longestStreak,
  publishedThisWeek,
  targetThisWeek,
  compact = false,
  className,
}: ConsistencyScoreProps) {
  const scoreColor = 
    score >= 80 ? 'text-green-400' :
    score >= 50 ? 'text-yellow-400' :
    'text-red-400';

  return (
    <Card className={cn('p-4', compact ? 'p-3' : 'p-5', className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-1">
            Consistency Score
          </h3>
          <div className={cn('text-4xl font-bold', scoreColor)}>
            {score}%
          </div>
        </div>
        <ConsistencyStreakBadge streak={currentStreak} size="lg" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-800">
        <div>
          <div className="text-xs text-gray-500 mb-1">Current Streak</div>
          <div className="flex items-center gap-1">
            <Flame className="size-4 text-orange-400" />
            <span className="text-lg font-semibold text-gray-200">
              {currentStreak} weeks
            </span>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Longest Streak</div>
          <div className="flex items-center gap-1">
            <TrendingUp className="size-4 text-purple-400" />
            <span className="text-lg font-semibold text-gray-200">
              {longestStreak} weeks
            </span>
          </div>
        </div>
      </div>

      {/* Weekly goal progress */}
      <GoalProgress
        current={publishedThisWeek}
        target={targetThisWeek}
        period="weekly"
      />

      {/* Motivational message */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-400 text-center">
          {score >= 100 ? (
            '🎉 Perfect week! You\'re crushing it!'
          ) : score >= 80 ? (
            '🔥 Great consistency! Keep it up!'
          ) : score >= 50 ? (
            '💪 You\'re making progress. Push a bit more!'
          ) : (
            '📈 Time to step up your content game!'
          )}
        </p>
      </div>
    </Card>
  );
}

export default ConsistencyScore;
