/**
 * Timer Store for Desktop app
 *
 * Re-exports the shared timer store from @ordo-todo/stores
 * and configures Electron-specific callbacks for tray and notifications.
 */

import {
  useTimerStore,
  setTimerCallbacks,
  startTimerInterval,
  stopTimerInterval,
  formatTime,
  getDurationForMode,
  defaultTimerConfig,
} from '@ordo-todo/stores';

export type { TimerStore, TimerConfig, TimerMode, TimerCallbacks } from '@ordo-todo/stores';

// Re-export everything from shared store
export {
  useTimerStore,
  setTimerCallbacks,
  startTimerInterval,
  stopTimerInterval,
  formatTime,
  getDurationForMode,
  defaultTimerConfig,
};

/**
 * Initialize Electron-specific timer callbacks
 * Call this once when the app starts (e.g., in App.tsx or main entry)
 */
export function initializeDesktopTimerCallbacks(): void {
  setTimerCallbacks({
    onPomodoroComplete: () => {
      if (typeof window !== 'undefined' && window.electronAPI) {
        window.electronAPI.notifyPomodoroComplete();
      }
    },
    onShortBreakComplete: () => {
      if (typeof window !== 'undefined' && window.electronAPI) {
        window.electronAPI.notifyShortBreakComplete();
      }
    },
    onLongBreakComplete: () => {
      if (typeof window !== 'undefined' && window.electronAPI) {
        window.electronAPI.notifyLongBreakComplete();
      }
    },
    onStateChange: (state) => {
      if (typeof window !== 'undefined' && window.electronAPI) {
        window.electronAPI.sendTimerState({
          timerActive: state.timerActive,
          isPaused: state.isPaused,
          timeRemaining: state.timeRemaining,
          currentTask: state.currentTask,
          mode: state.mode,
        });
      }
    },
  });
}
