import type { ReactNode } from 'react';
export interface DashboardTimerWidgetProps {
    mode: string;
    isRunning: boolean;
    isPaused: boolean;
    timeLeft: number;
    completedPomodoros: number;
    progress: number;
    pauseCount?: number;
    accentColor?: string;
    className?: string;
    onToggle: () => void;
    onReset: () => void;
    onSkip: () => void;
    onClick?: () => void;
    onFocusModeClick?: () => void;
    TaskSelectorComponent?: ReactNode;
    taskTitle?: string;
    config?: {
        workDuration?: number;
        shortBreakDuration?: number;
        longBreakDuration?: number;
    };
    formatTime: (seconds: number) => string;
    labels?: {
        work?: string;
        shortBreak?: string;
        longBreak?: string;
        continuous?: string;
        idle?: string;
        completedPomodoros?: string;
        reset?: string;
        start?: string;
        pause?: string;
        skip?: string;
        paused?: string;
        focusMode?: string;
        assignedTask?: string;
        selectTaskPlaceholder?: string;
        pomodoroCount?: (count: number) => string;
        pauseCount?: (count: number) => string;
    };
}
export type TimerWidgetProps = DashboardTimerWidgetProps;
export declare function DashboardTimerWidget({ mode, isRunning, isPaused, timeLeft, completedPomodoros, progress, pauseCount, accentColor: customAccentColor, onToggle, onReset, onSkip, onClick, onFocusModeClick, TaskSelectorComponent, taskTitle, config, formatTime, className, labels, }: DashboardTimerWidgetProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=dashboard-timer-widget.d.ts.map