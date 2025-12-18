interface Task {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate?: string | Date;
}
interface ProjectTimelineProps {
    tasks?: Task[];
    isLoading?: boolean;
    dateLocale?: any;
    labels?: {
        emptyTitle?: string;
        emptyDescription?: string;
    };
}
export declare function ProjectTimeline({ tasks, isLoading, dateLocale, labels, }: ProjectTimelineProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=project-timeline.d.ts.map