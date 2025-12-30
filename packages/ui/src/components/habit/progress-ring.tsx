'use client';

import { motion } from 'framer-motion';
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
          className="opacity-10 text-muted-foreground" // Use text-muted-foreground via class
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={
            animate
              ? { strokeDashoffset: circumference }
              : { strokeDashoffset: offset }
          }
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: animate ? 1 : 0,
            ease: 'easeOut',
          }}
          style={{
            filter: `drop-shadow(0 0 6px ${color}40)`,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children ? (
          children
        ) : showLabel ? (
          <motion.div
            initial={animate ? { scale: 0.8, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: animate ? 0.5 : 0 }}
            className="text-center"
          >
            <span className="text-2xl font-bold">{Math.round(progress)}%</span>
          </motion.div>
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
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 0.3 }}
            className="text-lg font-bold"
          >
            {completed}/{total}
          </motion.div>
          <div className="text-xs text-muted-foreground">today</div>
        </div>
      </ProgressRing>

      {/* Completion celebration pulse */}
      {isComplete && (
        <motion.div
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: 'loop',
          }}
          className="absolute inset-0 rounded-full"
          style={{
            border: `2px solid ${color}`,
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
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, progress)}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
