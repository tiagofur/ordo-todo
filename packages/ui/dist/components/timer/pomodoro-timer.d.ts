import { type ReactNode } from 'react';
import type { TimerMode } from './timer-widget.js';
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
    progress: number;
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
    /** Click handler for focus mode link */
    onFocusModeClick?: () => void;
    /** Custom labels for i18n */
    labels?: {
        stopwatch?: string;
        pomodoroCount?: (count: number) => string;
        shortBreak?: string;
        longBreak?: string;
        paused?: string;
        pauseCount?: (count: number) => string;
        switchTaskTitle?: string;
        switchTaskDescription?: string;
        switchTaskButtonTitle?: string;
        enterFocusMode?: string;
    };
    /** Dialog state controlled by parent */
    showSwitchDialog?: boolean;
    setShowSwitchDialog?: (show: boolean) => void;
}
/**
 * PomodoroTimer - Platform-agnostic timer display with controls
 *
 * All state and actions are passed via props for maximum flexibility.
 *
 * @example
 * // In web app
 * const timerContext = useTimer();
 *
 * <PomodoroTimer
 *   state={{
 *     isLoaded: timerContext.isLoaded,
 *     isRunning: timerContext.isRunning,
 *     // ... other state
 *   }}
 *   actions={{
 *     start: timerContext.start,
 *     pause: timerContext.pause,
 *     // ... other actions
 *   }}
 *   TaskSelectorComponent={<TaskSelector ... />}
 *   onFocusModeClick={() => router.push('/focus')}
 *   labels={{ ... }}
 * />
 */
export declare function PomodoroTimer({ state, actions, TaskSelectorComponent, onFocusModeClick, labels, showSwitchDialog, setShowSwitchDialog, }: PomodoroTimerProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=pomodoro-timer.d.ts.map