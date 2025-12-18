export interface PeakHour {
    hour: number;
    label: string;
    score: number;
}
export interface PeakDay {
    day: number;
    label: string;
    score: number;
}
export interface OptimalScheduleData {
    recommendation: string;
    peakHours: PeakHour[];
    peakDays: PeakDay[];
}
interface ProductivityInsightsProps {
    /** Optimal schedule data */
    schedule?: OptimalScheduleData | null;
    /** Whether data is loading */
    isLoading?: boolean;
    /** Custom labels for i18n */
    labels?: {
        title?: string;
        description?: string;
        empty?: string;
        peakHoursTitle?: string;
        peakHoursDescription?: string;
        peakDaysTitle?: string;
        peakDaysDescription?: string;
        tip?: string;
    };
    className?: string;
}
/**
 * ProductivityInsights - Platform-agnostic AI productivity insights
 *
 * Data fetching handled externally.
 *
 * @example
 * const { data: schedule, isLoading } = useOptimalSchedule({ topN: 5 });
 *
 * <ProductivityInsights
 *   schedule={schedule}
 *   isLoading={isLoading}
 *   labels={{ title: t('title') }}
 * />
 */
export declare function ProductivityInsights({ schedule, isLoading, labels, className, }: ProductivityInsightsProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=productivity-insights.d.ts.map