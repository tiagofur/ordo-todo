export type TimerMode = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK' | 'CONTINUOUS';
interface TimerWidgetProps {
    /** Whether timer is currently running */
    isRunning: boolean;
    /** Time left in seconds */
    timeLeft: number;
    /** Current timer mode */
    mode: TimerMode;
    /** Default mode (POMODORO or CONTINUOUS) */
    defaultMode?: 'POMODORO' | 'CONTINUOUS';
    /** Whether this widget is currently active/selected */
    isActive?: boolean;
    /** Click handler - typically navigates to timer page */
    onClick?: () => void;
    /** Custom labels for i18n */
    labels?: {
        startTimer?: string;
    };
    className?: string;
}
/**
 * TimerWidget - Compact timer display for sidebar/navigation
 *
 * Platform-agnostic component. Navigation and timer state are passed via props.
 *
 * @example
 * // In web app with router
 * const { isRunning, timeLeft, mode } = useTimer();
 *
 * <TimerWidget
 *   isRunning={isRunning}
 *   timeLeft={timeLeft}
 *   mode={mode}
 *   isActive={pathname === '/timer'}
 *   onClick={() => router.push('/timer')}
 *   labels={{ startTimer: t('startTimer') }}
 * />
 */
export declare function TimerWidget({ isRunning, timeLeft, mode, defaultMode, isActive, onClick, labels, className, }: TimerWidgetProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=timer-widget.d.ts.map