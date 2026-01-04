export interface ProductivityData {
    totalPomodoros: number;
    totalTasks: number;
    completedTasks: number;
    streak: number;
    avgPomodorosPerDay: number;
    peakHour: number;
    topProject?: {
        name: string;
        tasks: number;
    };
    weeklyData: {
        day: string;
        pomodoros: number;
        tasks: number;
    }[];
}
export interface AIReportSection {
    id: string;
    title: string;
    icon: React.ElementType;
    content: string[];
    type: 'success' | 'info' | 'warning' | 'tip';
}
interface AIWeeklyReportProps {
    data?: ProductivityData;
    onRefresh?: () => void;
    className?: string;
    labels?: {
        title?: string;
        subtitle?: string;
        generate?: string;
        analyzing?: string;
        regenerate?: string;
        export?: string;
        emptyState?: string;
        stats?: {
            pomodoros?: string;
            tasks?: string;
            streak?: string;
            average?: string;
        };
    };
    isGenerating?: boolean;
    hasGenerated?: boolean;
    report?: AIReportSection[];
    expandedSections?: string[];
    onGenerate?: () => void;
    onToggleSection?: (sectionId: string) => void;
}
/**
 * AIWeeklyReport - Platform-agnostic AI report component.
 * Purely presentational - state must be managed by parent.
 */
export declare function AIWeeklyReport({ data, onRefresh: _onRefresh, className, labels, isGenerating, hasGenerated, report, expandedSections, onGenerate, onToggleSection, }: AIWeeklyReportProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ai-weekly-report.d.ts.map