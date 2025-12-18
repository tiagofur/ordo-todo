export interface PeakHoursData {
    [hour: string]: number;
}
interface PeakHoursChartProps {
    /** Peak hours data - object with hour keys and score values */
    peakHours?: PeakHoursData | null;
    /** Whether data is loading */
    isLoading?: boolean;
    /** Custom labels for i18n */
    labels?: {
        title?: string;
        description?: string;
        empty?: string;
        yAxis?: string;
        tooltip?: string;
        legendHigh?: string;
        legendGood?: string;
        legendFair?: string;
        legendLow?: string;
    };
    className?: string;
}
/**
 * PeakHoursChart - Platform-agnostic peak productivity hours chart
 *
 * Data fetching handled externally.
 *
 * @example
 * const { data: profile, isLoading } = useAIProfile();
 *
 * <PeakHoursChart
 *   peakHours={profile?.peakHours}
 *   isLoading={isLoading}
 *   labels={{ title: t('title') }}
 * />
 */
export declare function PeakHoursChart({ peakHours, isLoading, labels, className, }: PeakHoursChartProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=peak-hours-chart.d.ts.map