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
export interface PomodoroTimerProps {
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
        currentTask?: string;
        completed?: string;
        horizontalView?: string;
        circularView?: string;
    };
    /** Dialog state controlled by parent */
    showSwitchDialog?: boolean;
    setShowSwitchDialog?: (show: boolean) => void;
    /** Layout variant: 'horizontal' (compact console) | 'circular' (classic ring). Defaults to 'horizontal' */
    variant?: 'horizontal' | 'circular';
    /** Allow user to toggle between horizontal and circular */
    allowVariantToggle?: boolean;
}
/**
 * PomodoroTimer - Platform-agnostic timer display with controls
 *
 * Supports both horizontal Apple-grade cockpit layout (compact, no scrolling needed)
 * and classic circular SVG ring layout.
 */
export declare function PomodoroTimer({ state, actions, TaskSelectorComponent, onFocusModeClick, labels, showSwitchDialog, setShowSwitchDialog, variant, allowVariantToggle, }: PomodoroTimerProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=pomodoro-timer.d.ts.map