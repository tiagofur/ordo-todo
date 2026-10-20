/**
 * Pomodoro Timer Component for React Native
 *
 * Platform-agnostic timer display with circular progress and controls.
 * Uses SVG for circular progress animation.
 *
 * @example
 * ```tsx
 * import { PomodoroTimer } from '@ordo-todo/ui-mobile';
 *
 * <PomodoroTimer
 *   state={timerState}
 *   actions={timerActions}
 *   TaskSelectorComponent={<TaskSelector ... />}
 *   labels={{ ... }}
 * />
 * ```
 */

import React, { type ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Play, Pause, Square, SkipForward, RefreshCw } from 'lucide-react-native';

import { Text } from '../ui/text';
import { colors } from '@ordo-todo/styles/tokens';

// Mirrors the canonical TimerMode in @ordo-todo/core timer.constants
// (ui-mobile has no core dependency; keep in sync by value).
export type TimerMode = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK' | 'CONTINUOUS';

export interface TimerState {
  isLoaded: boolean;
  isRunning: boolean;
  isPaused: boolean;
  timeLeft: number;
  mode: TimerMode;
  completedPomodoros: number;
  pauseCount: number;
  defaultMode: 'POMODORO' | 'CONTINUOUS';
  selectedTaskId: string | null;
  progress: number; // 0-100
}

export interface TimerActions {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: (completed?: boolean) => void;
  skipToNext: () => void;
  switchTask: (taskId: string) => Promise<void>;
  setSelectedTaskId: (taskId: string | null) => void;
}

interface PomodoroTimerProps {
  /** Timer state - typically from useTimer hook */
  state: TimerState;
  /** Timer actions - typically from useTimer hook */
  actions: TimerActions;
  /** Task selector component - rendered inside timer */
  TaskSelectorComponent?: ReactNode;
  /** Custom labels for i18n */
  labels?: {
    stopwatch?: string;
    pomodoroCount?: (count: number) => string;
    shortBreak?: string;
    longBreak?: string;
    paused?: string;
    pauseCount?: (count: number) => string;
    /** 'Skip to {phase}?' dialog title. {phase} = skipTargetLabel. */
    skipConfirmTitle?: (phase: string) => string;
    skipConfirmDescription?: string;
    skipConfirmOk?: string;
    cancel?: string;
    /** Pre-computed next-phase label, e.g. 'Short break (5:00)'. */
    skipTargetLabel?: string;
  };
}

const MODE_COLORS = {
  WORK: '#ef4444',
  SHORT_BREAK: '#4ade80',
  LONG_BREAK: '#15803d',
  CONTINUOUS: '#3b82f6',
};

const SIZE = 280;
 const STROKE_WIDTH = 12;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Format time from seconds to MM:SS
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * PomodoroTimer - Mobile version with React Native
 */
export function PomodoroTimer({
  state,
  actions,
  TaskSelectorComponent,
  labels = {},
}: PomodoroTimerProps) {
  const {
    isLoaded,
    isRunning,
    isPaused,
    timeLeft,
    mode,
    completedPomodoros,
    pauseCount,
    defaultMode,
    progress,
  } = state;

  const { start, pause, resume, stop, skipToNext } = actions;

  const {
    stopwatch = 'Stopwatch',
    pomodoroCount = (count: number) => `Pomodoro ${count}`,
    shortBreak = 'Short Break',
    longBreak = 'Long Break',
    paused = 'Paused',
    pauseCount: pauseCountLabel = (count: number) => `${count} pause${count !== 1 ? 's' : ''}`,
    skipConfirmTitle = (phase: string) => `Skip to ${phase}?`,
    skipConfirmDescription = 'The current phase will close as completed.',
    skipConfirmOk = 'Skip',
    cancel = 'Cancel',
    skipTargetLabel,
  } = labels;

  const accentColor = MODE_COLORS[mode] || MODE_COLORS.WORK;

  const getModeLabel = () => {
    if (defaultMode === 'CONTINUOUS') return stopwatch;
    if (mode === 'WORK') return pomodoroCount(completedPomodoros + 1);
    if (mode === 'SHORT_BREAK') return shortBreak;
    if (mode === 'LONG_BREAK') return longBreak;
    return '';
  };

  const handlePlayPause = () => {
    if (isRunning && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      start();
    }
  };

  // Confirm only when there is focus time at stake: an early WORK skip.
  // Breaks and nearly-finished WORK skip straight through.
  const SKIP_CONFIRM_PROGRESS = 80;
  const handleSkip = () => {
    if (mode === 'WORK' && progress < SKIP_CONFIRM_PROGRESS) {
      Alert.alert(
        skipConfirmTitle(skipTargetLabel ?? shortBreak),
        skipConfirmDescription,
        [
          { text: cancel, style: 'cancel' },
          { text: skipConfirmOk, style: 'default', onPress: skipToNext },
        ],
      );
    } else {
      skipToNext();
    }
  };

  if (!isLoaded) return null;

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress / 100);

  return (
    <View style={styles.container}>
      {/* Mode Label */}
      <View style={styles.modeContainer}>
        <Text style={[styles.modeLabel, { color: accentColor }]}>
          {getModeLabel()}
        </Text>

        {/* Task Selector */}
        {TaskSelectorComponent}

        {/* Pause Metrics */}
        {isRunning && pauseCount > 0 && (
          <Text style={styles.pauseCount}>
            {pauseCountLabel(pauseCount)}
          </Text>
        )}
      </View>

      {/* Timer Display with Circular Progress */}
      <View style={styles.timerContainer}>
        <Svg
          width={SIZE}
          height={SIZE}
          style={styles.svg}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
        >
          {/* Background Circle */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={colors.mutedForeground}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            opacity={0.2}
          />

          {/* Progress Circle */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={accentColor}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>

        {/* Time Display */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {formatTime(timeLeft)}
          </Text>
          {isPaused && (
            <Text style={styles.pausedText}>{paused}</Text>
          )}
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          onPress={handlePlayPause}
          style={[
            styles.playButton,
            { backgroundColor: accentColor },
          ]}
          activeOpacity={0.8}
        >
          {isRunning && !isPaused ? (
            <Pause size={32} color="#FFFFFF" strokeWidth={3} />
          ) : (
            <Play size={32} color="#FFFFFF" strokeWidth={3} />
          )}
        </TouchableOpacity>

        {(isRunning || isPaused) && (
          <>
            <TouchableOpacity
              onPress={() => stop(false)}
              style={styles.secondaryButton}
              activeOpacity={0.7}
            >
              <Square size={24} color={colors.mutedForeground} strokeWidth={2.5} />
            </TouchableOpacity>

            {defaultMode === 'POMODORO' && (
              <TouchableOpacity
                onPress={handleSkip}
                style={styles.secondaryButton}
                activeOpacity={0.7}
                accessibilityLabel="Skip to next phase"
                accessibilityRole="button"
              >
                <SkipForward size={24} color={colors.mutedForeground} strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    padding: 16,
  },
  modeContainer: {
    alignItems: 'center',
    gap: 12,
  },
  modeLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  pauseCount: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  timerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  timeContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 56,
    fontWeight: '700',
    fontFamily: 'System',
    color: colors.foreground,
    fontVariant: ['tabular-nums'],
  },
  pausedText: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.muted + '40',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
