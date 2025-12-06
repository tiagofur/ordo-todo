import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TimerStore, TimerConfig, TimerMode } from './types';

/**
 * Default timer configuration (Pomodoro technique)
 */
export const defaultTimerConfig: TimerConfig = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  pomodorosUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
  notificationsEnabled: true,
};

/**
 * Get duration in seconds for a timer mode
 */
export function getDurationForMode(mode: TimerMode, config: TimerConfig): number {
  switch (mode) {
    case 'WORK':
      return config.workDuration * 60;
    case 'SHORT_BREAK':
      return config.shortBreakDuration * 60;
    case 'LONG_BREAK':
      return config.longBreakDuration * 60;
    default:
      return config.workDuration * 60;
  }
}

/**
 * Format seconds to MM:SS string
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Platform-specific callbacks that can be set by the app
 */
export interface TimerCallbacks {
  onPomodoroComplete?: () => void;
  onShortBreakComplete?: () => void;
  onLongBreakComplete?: () => void;
  onStateChange?: (state: {
    timerActive: boolean;
    isPaused: boolean;
    timeRemaining: string;
    currentTask: string | null;
    mode: TimerMode;
  }) => void;
}

let timerCallbacks: TimerCallbacks = {};

/**
 * Set platform-specific callbacks for timer events
 */
export function setTimerCallbacks(callbacks: TimerCallbacks): void {
  timerCallbacks = callbacks;
}

/**
 * Notify platform of state changes
 */
function notifyStateChange(state: TimerStore): void {
  timerCallbacks.onStateChange?.({
    timerActive: state.isRunning,
    isPaused: state.isPaused,
    timeRemaining: formatTime(state.timeLeft),
    currentTask: state.selectedTaskTitle,
    mode: state.mode,
  });
}

/**
 * Shared Timer store for Pomodoro technique across platforms.
 *
 * @example
 * ```tsx
 * import { useTimerStore, setTimerCallbacks } from '@ordo-todo/stores';
 *
 * // Set platform-specific callbacks (optional)
 * setTimerCallbacks({
 *   onPomodoroComplete: () => showNotification('Pomodoro complete!'),
 *   onStateChange: (state) => updateTrayIcon(state),
 * });
 *
 * function Timer() {
 *   const { timeLeft, isRunning, start, pause, getTimeFormatted } = useTimerStore();
 *
 *   return (
 *     <div>
 *       <span>{getTimeFormatted()}</span>
 *       <button onClick={isRunning ? pause : start}>
 *         {isRunning ? 'Pause' : 'Start'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      // Initial state
      mode: 'IDLE',
      isRunning: false,
      isPaused: false,
      timeLeft: defaultTimerConfig.workDuration * 60,
      completedPomodoros: 0,
      pauseCount: 0,
      selectedTaskId: null,
      selectedTaskTitle: null,
      config: defaultTimerConfig,

      // Actions
      start: () => {
        const { mode, config } = get();
        const newMode = mode === 'IDLE' ? 'WORK' : mode;
        const duration = getDurationForMode(newMode, config);

        set({
          mode: newMode,
          isRunning: true,
          isPaused: false,
          timeLeft: duration,
          pauseCount: 0,
        });

        notifyStateChange(get());
      },

      pause: () => {
        set((state) => ({
          isPaused: true,
          pauseCount: state.pauseCount + 1,
        }));
        notifyStateChange(get());
      },

      resume: () => {
        set({ isPaused: false });
        notifyStateChange(get());
      },

      stop: () => {
        const { config } = get();
        set({
          mode: 'IDLE',
          isRunning: false,
          isPaused: false,
          timeLeft: config.workDuration * 60,
          pauseCount: 0,
        });
        notifyStateChange(get());
      },

      skip: () => {
        const { mode, completedPomodoros, config } = get();
        let nextMode: TimerMode = 'WORK';
        let newCompletedPomodoros = completedPomodoros;

        if (mode === 'WORK') {
          newCompletedPomodoros = completedPomodoros + 1;
          if (newCompletedPomodoros % config.pomodorosUntilLongBreak === 0) {
            nextMode = 'LONG_BREAK';
          } else {
            nextMode = 'SHORT_BREAK';
          }
        }

        const duration = getDurationForMode(nextMode, config);

        set({
          mode: nextMode,
          timeLeft: duration,
          completedPomodoros: newCompletedPomodoros,
          pauseCount: 0,
          isRunning: config.autoStartBreaks || config.autoStartPomodoros,
          isPaused: false,
        });

        // Notify platform
        if (config.notificationsEnabled) {
          if (mode === 'WORK') {
            timerCallbacks.onPomodoroComplete?.();
          } else if (mode === 'SHORT_BREAK') {
            timerCallbacks.onShortBreakComplete?.();
          } else if (mode === 'LONG_BREAK') {
            timerCallbacks.onLongBreakComplete?.();
          }
        }

        notifyStateChange(get());
      },

      reset: () => {
        const { mode, config } = get();
        const duration = getDurationForMode(mode === 'IDLE' ? 'WORK' : mode, config);
        set({
          timeLeft: duration,
          pauseCount: 0,
          isPaused: false,
        });
        notifyStateChange(get());
      },

      tick: () => {
        const { timeLeft, isRunning, isPaused } = get();

        if (!isRunning || isPaused) return;

        if (timeLeft <= 1) {
          // Timer complete
          get().skip();
        } else {
          set({ timeLeft: timeLeft - 1 });
          notifyStateChange(get());
        }
      },

      setMode: (mode: TimerMode) => {
        const { config } = get();
        const duration = getDurationForMode(mode, config);
        set({
          mode,
          timeLeft: duration,
          isRunning: false,
          isPaused: false,
          pauseCount: 0,
        });
        notifyStateChange(get());
      },

      setSelectedTask: (taskId: string | null, taskTitle: string | null) => {
        set({
          selectedTaskId: taskId,
          selectedTaskTitle: taskTitle,
        });
        notifyStateChange(get());
      },

      updateConfig: (partialConfig: Partial<TimerConfig>) => {
        set((state) => ({
          config: { ...state.config, ...partialConfig },
        }));
      },

      // Computed
      getTimeFormatted: () => formatTime(get().timeLeft),

      getProgress: () => {
        const { mode, timeLeft, config } = get();
        const totalDuration = getDurationForMode(mode === 'IDLE' ? 'WORK' : mode, config);
        return ((totalDuration - timeLeft) / totalDuration) * 100;
      },
    }),
    {
      name: 'ordo-timer-store',
      partialize: (state) => ({
        config: state.config,
        completedPomodoros: state.completedPomodoros,
      }),
    }
  )
);

// ============ TIMER INTERVAL MANAGER ============

let timerInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start the timer interval (call this once on app mount)
 */
export function startTimerInterval(): void {
  if (timerInterval) return;

  timerInterval = setInterval(() => {
    useTimerStore.getState().tick();
  }, 1000);
}

/**
 * Stop the timer interval (call this on app unmount)
 */
export function stopTimerInterval(): void {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}
