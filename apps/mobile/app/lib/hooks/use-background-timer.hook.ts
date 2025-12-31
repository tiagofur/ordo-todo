/**
 * Background Timer Hook for Mobile (Expo)
 *
 * Allows the timer to continue running when the app is in background.
 * Uses expo-notifications to schedule notifications when timer completes.
 *
 * @example
 * ```tsx
 * import { useBackgroundTimer } from '@/app/lib/hooks/use-background-timer.hook';
 *
 * function TimerScreen() {
 *   const { startBackgroundTimer, stopBackgroundTimer, isRunning } = useBackgroundTimer();
 *
 *   const handleStart = () => {
 *     startBackgroundTimer({
 *       duration: 25 * 60 * 1000, // 25 minutes
 *       title: "Pomodoro completado",
 *       body: "¡Hora de un descanso!",
 *       onComplete: () => {
 *         console.log("Timer completed!");
 *       },
 *     });
 *   };
 *
 *   // ...
 * }
 * ```
 */

import { useState, useCallback, useRef, useEffect } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export interface BackgroundTimerConfig {
  duration: number; // Duration in milliseconds
  title: string; // Notification title
  body: string; // Notification body
  onComplete?: () => void;
  onTick?: (remaining: number) => void; // Called every second
}

interface BackgroundTimerState {
  remaining: number;
  total: number;
  isRunning: boolean;
}

/**
 * Hook to manage timer that works in background
 */
export function useBackgroundTimer() {
  const [state, setState] = useState<BackgroundTimerState>({
    remaining: 0,
    total: 0,
    isRunning: false,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const notificationIdRef = useRef<string | null>(null);

  const stopBackgroundTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Cancel scheduled notification
    if (notificationIdRef.current) {
      Notifications.cancelScheduledNotificationAsync(
        notificationIdRef.current,
      ).catch(console.error);
      notificationIdRef.current = null;
    }

    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const startBackgroundTimer = useCallback(
    async (config: BackgroundTimerConfig) => {
      // Stop any existing timer
      stopBackgroundTimer();

      const { duration, title, body, onComplete, onTick } = config;

      // Calculate target time
      const targetTime = Date.now() + duration;

      // Schedule notification at completion
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: "default",
        },
        trigger: {
          date: targetTime,
        },
      });

      notificationIdRef.current = notificationId;

      // Start interval
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, targetTime - now);
        const elapsed = now - startTime;

        // Update state
        setState({
          remaining: Math.ceil(remaining / 1000),
          total: Math.ceil(duration / 1000),
          isRunning: true,
        });

        // Call onTick if provided
        if (onTick) {
          onTick(Math.ceil(remaining / 1000));
        }

        // Check if timer completed
        if (remaining <= 0) {
          stopBackgroundTimer();
          if (onComplete) {
            onComplete();
          }
        }
      }, 1000);

      // Also update UI state immediately
      setState({
        remaining: Math.ceil(duration / 1000),
        total: Math.ceil(duration / 1000),
        isRunning: true,
      });
    },
    [stopBackgroundTimer],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (notificationIdRef.current) {
        Notifications.cancelScheduledNotificationAsync(
          notificationIdRef.current,
        ).catch(console.error);
      }
    };
  }, []);

  return {
    ...state,
    startBackgroundTimer,
    stopBackgroundTimer,
    isRunning: state.isRunning,
  };
}
