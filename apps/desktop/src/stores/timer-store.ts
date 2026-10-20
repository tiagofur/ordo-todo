/**
 * Timer Store for Desktop app
 *
 * @deprecated (ODD 014 T3) — The unified timer (`timer-context` +
 * `@ordo-todo/hooks useTimerBackend`) is the single owner of timer state.
 * This zustand store is no longer wired to any live UI; tray/mini-timer sync
 * lives in the `use-timer-backend` adapter and action handling in the
 * TimerProvider bridge. Removal belongs to T7 (dead-code cleanup).
 *
 * Re-exports the shared timer store from @ordo-todo/stores
 * and configures native desktop callbacks for tray, notifications, and floating timer window.
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
import { desktopBridge } from '@/lib/desktop-bridge';

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
 * Initialize Desktop timer callbacks
 * Integrates native system tray title updates, OS notifications, and floating timer window sync.
 */
export function initializeDesktopTimerCallbacks(): void {
  setTimerCallbacks({
    onPomodoroComplete: () => {
      desktopBridge.sendNotification(
        'Pomodoro completado',
        '¡Excelente trabajo! Tómate un merecido descanso.'
      );
    },
    onShortBreakComplete: () => {
      desktopBridge.sendNotification(
        'Descanso corto finalizado',
        'Hora de volver al enfoque y retomar tus tareas.'
      );
    },
    onLongBreakComplete: () => {
      desktopBridge.sendNotification(
        'Descanso largo finalizado',
        '¿Listo para arrancar un nuevo ciclo productivo?'
      );
    },
    onStateChange: (state: any) => {
      const formatted = typeof state.timeRemaining === 'number'
        ? formatTime(state.timeRemaining)
        : String(state.timeRemaining || '25:00');

      // Update macOS menu bar / tray title
      if (state.timerActive && !state.isPaused) {
        desktopBridge.updateTrayTitle(formatted);
      } else if (state.isPaused) {
        desktopBridge.updateTrayTitle(`⏸ ${formatted}`);
      } else {
        desktopBridge.updateTrayTitle('Ordo');
      }

      // Broadcast to floating mini-timer window
      desktopBridge.broadcastTimerState({
        timeRemaining: formatted,
        mode: state.mode as any,
        isRunning: !!state.timerActive,
        isPaused: !!state.isPaused,
        taskTitle: typeof state.currentTask === 'object' ? state.currentTask?.title : (state.currentTask ?? null),
        progress: 0,
      });
    },
  });
}
