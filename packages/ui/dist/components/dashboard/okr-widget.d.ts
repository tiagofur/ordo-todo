/**
 * OKR Widget - Shared Dashboard Component
 *
 * Displays a summary of Objectives and Key Results with progress visualization.
 * This component is designed to be used across Web, Desktop, and potentially Mobile.
 *
 * @example
 * ```tsx
 * import { OkrWidget } from '@ordo-todo/ui';
 *
 * <OkrWidget
 *   summary={okrSummary}
 *   onNavigate={(path) => router.push(path)}
 *   labels={{ title: t('Goals.title') }}
 * />
 * ```
 */
/**
 * Single objective summary for display
 */
export interface ObjectiveSummary {
    id: string;
    title: string;
    progress: number;
    color?: string;
    daysRemaining: number;
    keyResultsCount: number;
}
/**
 * Dashboard summary data for OKRs
 */
export interface OkrDashboardSummary {
    total: number;
    completed: number;
    atRisk: number;
    averageProgress: number;
    objectives: ObjectiveSummary[];
}
/**
 * Labels for i18n - all are optional with English defaults
 */
interface OkrWidgetLabels {
    title?: string;
    averageProgress?: string;
    viewAll?: string;
    total?: string;
    completed?: string;
    okrsAtRisk?: string;
    left?: string;
    noObjectives?: string;
    createObjective?: string;
}
interface OkrWidgetProps {
    /** OKR dashboard summary data */
    summary?: OkrDashboardSummary | null;
    /** Loading state */
    isLoading?: boolean;
    /** Accent color for theming */
    accentColor?: string;
    /** Navigation callback - receives path like '/goals' or '/goals/:id' */
    onNavigate?: (path: string) => void;
    /** Labels for i18n translations */
    labels?: OkrWidgetLabels;
    /** Additional CSS class */
    className?: string;
}
export declare function OkrWidget({ summary, isLoading, accentColor, // Pink as default for Goals
onNavigate, labels, className, }: OkrWidgetProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=okr-widget.d.ts.map