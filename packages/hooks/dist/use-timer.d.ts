/**
 * Shared useTimer Hook for Ordo-Todo
 *
 * A React hook for managing Pomodoro and continuous timer functionality.
 * Can be used across web, mobile, and desktop applications.
 */
/**
 * Format time for timer display (MM:SS)
 * Note: Inlined from @ordo-todo/core to avoid importing Node.js dependencies
 */
export declare function formatTimerDisplay(seconds: number): string;
export type TimerMode = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';
export type TimerType = 'POMODORO' | 'CONTINUOUS';
export interface TimerConfig {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    pomodorosUntilLongBreak: number;
}
export interface UseTimerProps {
    type: TimerType;
    config: TimerConfig;
    onSessionComplete?: (data: SessionData) => void;
}
export interface SessionData {
    startedAt: Date;
    endedAt: Date;
    duration: number;
    mode: TimerMode;
    wasCompleted: boolean;
    wasInterrupted: boolean;
    pauseCount: number;
    totalPauseTime: number;
}
export interface UseTimerReturn {
    isRunning: boolean;
    isPaused: boolean;
    timeLeft: number;
    mode: TimerMode;
    completedPomodoros: number;
    pauseCount: number;
    totalPauseTime: number;
    start: () => void;
    pause: () => void;
    stop: (wasCompleted?: boolean) => void;
    reset: () => void;
    skipToNext: () => void;
    split: () => void;
    formatTime: (seconds: number) => string;
    getProgress: () => number;
}
export declare function useTimer({ type, config, onSessionComplete, }: UseTimerProps): UseTimerReturn;
//# sourceMappingURL=use-timer.d.ts.map