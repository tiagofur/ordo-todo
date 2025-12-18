export interface UpcomingTask {
    id: string;
    title: string;
    dueDate: Date | string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    project?: {
        name: string;
        color: string;
    };
}
interface UpcomingTasksWidgetProps {
    tasks: UpcomingTask[];
    onTaskClick?: (taskId: string) => void;
    labels?: {
        title?: string;
        empty?: string;
        overdueAgo?: (days: number) => string;
        dueToday?: string;
        dueTomorrow?: string;
        inDays?: (days: number) => string;
    };
}
export declare function UpcomingTasksWidget({ tasks, onTaskClick, labels, }: UpcomingTasksWidgetProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=upcoming-tasks-widget.d.ts.map