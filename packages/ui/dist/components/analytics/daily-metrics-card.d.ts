export interface DailyMetricsData {
    tasksCompleted?: number;
    tasksCreated?: number;
    focusScore?: number;
}
export interface TimerStatsData {
    totalMinutesWorked?: number;
    pomodorosCompleted?: number;
}
interface DailyMetricsCardProps {
    /** Daily metrics data */
    metrics?: DailyMetricsData | null;
    /** Timer stats data */
    timerStats?: TimerStatsData | null;
    /** Whether data is loading */
    isLoading?: boolean;
    /** Optional date to display */
    date?: Date;
    /** Format duration function (minutes to string) */
    formatDuration?: (minutes: number) => string;
    /** Get focus score color class */
    getFocusScoreColorClass?: (score: number) => string;
    /** Custom labels for i18n */
    labels?: {
        title?: string;
        today?: string;
        completed?: string;
        time?: string;
        pomodoros?: string;
        focus?: string;
    };
    className?: string;
}
/**
 * DailyMetricsCard - Platform-agnostic daily metrics display
 *
 * Data fetching handled externally.
 *
 * @example
 * const { data: metrics } = useDailyMetrics({ startDate, endDate });
 * const { data: timerStats } = useTimerStats({ startDate, endDate });
 *
 * <DailyMetricsCard
 *   metrics={metrics?.[0]}
 *   timerStats={timerStats}
 *   isLoading={isLoading}
 *   formatDuration={formatDuration}
 *   labels={{ title: t('title') }}
 * />
 */
export declare function DailyMetricsCard({ metrics, timerStats, isLoading, date, formatDuration, getFocusScoreColorClass, labels, className, }: DailyMetricsCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=daily-metrics-card.d.ts.map