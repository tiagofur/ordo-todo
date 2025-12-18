export interface DayStats {
    date: string;
    completedTasks: number;
    totalMinutes: number;
    pomodoros: number;
}
interface WeeklyActivityWidgetProps {
    days: DayStats[];
    labels?: {
        title?: string;
        totalPomodoros?: string;
        totalTime?: string;
        dayLabels?: string[];
    };
}
export declare function WeeklyActivityWidget({ days, labels, }: WeeklyActivityWidgetProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=weekly-activity-widget.d.ts.map