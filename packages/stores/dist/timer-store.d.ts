import type { TimerStore, TimerConfig, TimerMode } from './types.js';
/**
 * Default timer configuration (Pomodoro technique)
 */
export declare const defaultTimerConfig: TimerConfig;
/**
 * Get duration in seconds for a timer mode
 */
export declare function getDurationForMode(mode: TimerMode, config: TimerConfig): number;
/**
 * Format seconds to MM:SS string
 */
export declare function formatTime(seconds: number): string;
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
/**
 * Set platform-specific callbacks for timer events
 */
export declare function setTimerCallbacks(callbacks: TimerCallbacks): void;
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
export declare const useTimerStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<TimerStore>, "setState" | "persist"> & {
    setState(partial: TimerStore | Partial<TimerStore> | ((state: TimerStore) => TimerStore | Partial<TimerStore>), replace?: false | undefined): unknown;
    setState(state: TimerStore | ((state: TimerStore) => TimerStore), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<TimerStore, {
            config: TimerConfig;
        }, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: TimerStore) => void) => () => void;
        onFinishHydration: (fn: (state: TimerStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<TimerStore, {
            config: TimerConfig;
        }, unknown>>;
    };
}>;
/**
 * Start the timer interval (call this once on app mount)
 */
export declare function startTimerInterval(): void;
/**
 * Stop the timer interval (call this on app unmount)
 */
export declare function stopTimerInterval(): void;
//# sourceMappingURL=timer-store.d.ts.map