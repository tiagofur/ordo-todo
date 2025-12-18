export interface WeeklyMetric {
    date: string;
    tasksCompleted: number;
    minutesWorked: number;
}
interface WeeklyChartProps {
    /** Weekly metrics data */
    metrics?: WeeklyMetric[];
    /** Whether data is loading */
    isLoading?: boolean;
    /** Start of the week to display */
    weekStart?: Date;
    /** Custom labels for i18n */
    labels?: {
        title?: string;
        description?: string;
        weekOf?: string;
        tasks?: string;
        minutes?: string;
        tasksCompleted?: string;
        minutesWorked?: string;
        tooltipTasks?: string;
        tooltipTime?: string;
    };
    /** Locale for date formatting */
    locale?: string;
    className?: string;
}
/**
 * WeeklyChart - Platform-agnostic weekly activity chart
 *
 * Data fetching handled externally.
 *
 * @example
 * const { data: metrics, isLoading } = useWeeklyMetrics({ weekStart });
 *
 * <WeeklyChart
 *   metrics={metrics}
 *   isLoading={isLoading}
 *   weekStart={weekStart}
 *   labels={{ title: t('title') }}
 * />
 */
export declare function WeeklyChart({ metrics, isLoading, weekStart, labels, locale, className, }: WeeklyChartProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=weekly-chart.d.ts.map