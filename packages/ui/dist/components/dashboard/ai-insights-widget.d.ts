export interface Insight {
    type: 'PRODUCTIVITY_PEAK' | 'UPCOMING_DEADLINES' | 'SUGGESTED_BREAKS' | 'COMPLETION_CELEBRATION' | 'WORKLOAD_IMBALANCE' | 'ENERGY_OPTIMIZATION' | 'REST_SUGGESTION' | 'ACHIEVEMENT_CELEBRATION';
    message: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    actionLabel?: string;
    actionUrl?: string;
    data?: any;
}
interface AIInsightsWidgetProps {
    insights: Insight[];
    isLoading?: boolean;
    isRefreshing?: boolean;
    onRefresh?: () => void;
    onDismiss?: (index: number) => void;
    onAction?: (insight: Insight) => void;
    className?: string;
    labels?: {
        title?: string;
        emptyTitle?: string;
        emptyDescription?: string;
        viewAll?: string;
    };
}
export declare function AIInsightsWidget({ insights, isLoading, isRefreshing, onRefresh, onDismiss, onAction, className, labels, }: AIInsightsWidgetProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ai-insights-widget.d.ts.map