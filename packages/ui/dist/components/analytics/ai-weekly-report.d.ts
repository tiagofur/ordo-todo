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
interface AIReportSection {
    id: string;
    title: string;
    icon: any;
    content: string[];
    type: 'success' | 'info' | 'warning' | 'tip';
}
interface AIWeeklyReportProps {
    data?: ProductivityData;
    onRefresh?: () => void;
    className?: string;
    onGenerateReport?: (data: ProductivityData) => Promise<AIReportSection[]>;
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
}
export declare function AIWeeklyReport({ data, onRefresh, className, onGenerateReport, labels, }: AIWeeklyReportProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ai-weekly-report.d.ts.map