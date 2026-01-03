interface TimelineTask {
    id: string;
    title: string;
    description?: string;
    isCompleted: boolean;
    priorityLabel: string;
    priorityColorClass: string;
    formattedDate: string;
}
interface ProjectTimelineProps {
    tasks?: TimelineTask[];
    isLoading?: boolean;
    labels?: {
        emptyTitle?: string;
        emptyDescription?: string;
    };
    className?: string;
}
/**
 * ProjectTimeline - Platform-agnostic component for displaying tasks chronologically
 */
export declare function ProjectTimeline({ tasks, isLoading, labels, className, }: ProjectTimelineProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=project-timeline.d.ts.map