export interface AIReport {
    id: string;
    scope: string;
    summary: string;
    productivityScore: number;
    generatedAt: Date | string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    metricsSnapshot: {
        tasksCompleted?: number;
        minutesWorked?: number;
        pomodorosCompleted?: number;
    };
}
interface ReportCardProps {
    report: AIReport;
    onClick?: () => void;
    locale?: string;
    labels?: {
        scopes?: {
            TASK_COMPLETION?: string;
            WEEKLY_SCHEDULED?: string;
            MONTHLY_SCHEDULED?: string;
            PROJECT_SUMMARY?: string;
            PERSONAL_ANALYSIS?: string;
            default?: string;
        };
        metrics?: {
            tasks?: string;
            hoursWorked?: string;
            pomodoros?: string;
        };
        stats?: {
            strengths?: string;
            weaknesses?: string;
            recommendations?: string;
        };
    };
}
export declare function ReportCard({ report, onClick, locale, labels, }: ReportCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=report-card.d.ts.map