/**
 * MiniTimerWidget - Compact Timer Display for Mobile Home
 * 
 * Shows current timer status with play/pause controls.
 * Taps to expand to full timer screen.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/app/data/hooks/use-theme-colors.hook';
import { useActiveTimer, useStartTimer, usePauseTimer, useResumeTimer } from '@/app/lib/shared-hooks';

const TYPE_COLORS: Record<string, string> = {
  WORK: '#ef4444',
  SHORT_BREAK: '#22c55e',
  LONG_BREAK: '#3b82f6',
  CONTINUOUS: '#8b5cf6',
  DEFAULT: '#6b7280',
};

const TYPE_LABELS: Record<string, string> = {
  WORK: 'Trabajo',
  SHORT_BREAK: 'Descanso',
  LONG_BREAK: 'Descanso L.',
  CONTINUOUS: 'Continuo',
  DEFAULT: 'Timer',
};

interface MiniTimerWidgetProps {
  compact?: boolean;
}

export function MiniTimerWidget({ compact = false }: MiniTimerWidgetProps) {
  const colors = useThemeColors();
  const router = useRouter();
  const { data: activeTimer, isLoading } = useActiveTimer();
  const startTimer = useStartTimer();
  const pauseTimer = usePauseTimer();
  const resumeTimer = useResumeTimer();
  
  const [elapsedTime, setElapsedTime] = useState(0);

  const hasActiveTimer = !!activeTimer;
  const isPaused = activeTimer?.isPaused ?? false;
  const isRunning = hasActiveTimer && !isPaused;
  const timerType = activeTimer?.type || 'DEFAULT';
  const typeColor = TYPE_COLORS[timerType] || TYPE_COLORS.DEFAULT;

  // Update elapsed time every second
  useEffect(() => {
    if (!activeTimer || isPaused) return;
    
    const interval = setInterval(() => {
      if (activeTimer?.elapsedSeconds !== undefined) {
        setElapsedTime(activeTimer.elapsedSeconds);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer, isPaused]);

  // Sync with server elapsed time
  useEffect(() => {
    if (activeTimer?.elapsedSeconds !== undefined) {
      setElapsedTime(activeTimer.elapsedSeconds);
    }
  }, [activeTimer?.elapsedSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggle = async () => {
    try {
      if (isRunning) {
        // Pause with current timestamp
        await pauseTimer.mutateAsync({ pauseStartedAt: new Date() });
      } else if (isPaused && activeTimer) {
        // Resume with the stored pause start time
        const pauseStart = activeTimer.currentPauseStart 
          ? new Date(activeTimer.currentPauseStart) 
          : new Date();
        await resumeTimer.mutateAsync({ pauseStartedAt: pauseStart });
      } else {
        await startTimer.mutateAsync({});
      }
    } catch (error) {
      console.error('Timer action failed:', error);
    }
  };

  const handleNavigate = () => {
    router.push('/screens/(internal)/timer');
  };

  // Don't render if loading
  if (isLoading) return null;

  // Compact view for when no timer is active
  if (!hasActiveTimer && compact) {
    return (
      <Animated.View entering={FadeInRight.delay(350)}>
        <Pressable
          onPress={handleNavigate}
          style={[
            styles.compactContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="clock" size={18} color={colors.textMuted} />
          <Text style={[styles.compactText, { color: colors.textSecondary }]}>
            Iniciar timer
          </Text>
        </Pressable>
      </Animated.View>
    );
  }

  // Don't show widget if no active timer (unless compact mode)
  if (!hasActiveTimer) return null;

  return (
    <Animated.View entering={FadeInRight.delay(350)}>
      <Pressable
        onPress={handleNavigate}
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderColor: typeColor,
          },
        ]}
      >
        {/* Icon and Type */}
        <View style={styles.leftSection}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${typeColor}20` },
            ]}
          >
            <Feather name="clock" size={16} color={typeColor} />
          </View>
          <View>
            <Text style={[styles.typeLabel, { color: typeColor }]}>
              {TYPE_LABELS[timerType] || 'Timer'}
            </Text>
            <Text style={[styles.statusText, { color: colors.textMuted }]}>
              {isPaused ? 'Pausado' : 'Activo'}
            </Text>
          </View>
        </View>

        {/* Time Display */}
        <View style={styles.timeSection}>
          <Text
            style={[
              styles.timeDisplay,
              { color: isRunning ? typeColor : colors.text },
            ]}
          >
            {formatTime(elapsedTime)}
          </Text>
        </View>

        {/* Play/Pause Button */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            handleToggle();
          }}
          style={[styles.playButton, { backgroundColor: typeColor }]}
        >
          <Feather
            name={isRunning ? 'pause' : 'play'}
            size={16}
            color="#fff"
          />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  compactText: {
    fontSize: 13,
    fontWeight: '600',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusText: {
    fontSize: 11,
    marginTop: 2,
  },
  timeSection: {
    marginRight: 12,
  },
  timeDisplay: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
