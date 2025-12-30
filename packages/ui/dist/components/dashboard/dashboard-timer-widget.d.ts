interface TimerWidgetProps {
    mode: string;
    isRunning: boolean;
    isPaused: boolean;
    timeLeft: number;
    completedPomodoros: number;
    progress: number;
    accentColor?: string;
    onToggle: () => void;
    onReset: () => void;
    onSkip: () => void;
    onClick?: () => void;
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
    };
}
export declare function DashboardTimerWidget({ mode, isRunning, isPaused, timeLeft, completedPomodoros, progress, accentColor, onToggle, onReset, onSkip, onClick, formatTime, labels, }: TimerWidgetProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=dashboard-timer-widget.d.ts.map