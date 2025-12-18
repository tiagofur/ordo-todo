import { format } from 'date-fns';
export interface TaskDetailViewData {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    dueDate?: string | Date | null;
    subTasks?: Array<{
        id: string;
        title: string;
        status: string;
    }>;
}
interface TaskDetailViewProps {
    /** Task data to display */
    task?: TaskDetailViewData | null;
    /** Whether sheet is open */
    open: boolean;
    /** Called when open state changes */
    onOpenChange: (open: boolean) => void;
    /** Whether data is loading */
    isLoading?: boolean;
    /** Called when task completion is toggled */
    onComplete?: (taskId: string) => void;
    /** Date locale for formatting */
    dateLocale?: Locale;
    /** Custom labels for i18n */
    labels?: {
        title?: string;
        description?: string;
        noDate?: string;
        subtasksTitle?: string;
        subtasksEmpty?: string;
        timeTitle?: string;
        timeComingSoon?: string;
        notFound?: string;
    };
}
type Locale = Parameters<typeof format>[2] extends {
    locale?: infer L;
} ? L : never;
/**
 * TaskDetailView - Platform-agnostic task detail sheet
 *
 * Data fetching handled externally.
 *
 * @example
 * const { data: task, isLoading } = useTask(taskId);
 * const completeTask = useCompleteTask();
 *
 * <TaskDetailView
 *   task={task}
 *   open={!!taskId}
 *   onOpenChange={(open) => !open && setTaskId(null)}
 *   isLoading={isLoading}
 *   onComplete={(id) => completeTask.mutate(id)}
 *   labels={{ title: t('title') }}
 * />
 */
export declare function TaskDetailView({ task, open, onOpenChange, isLoading, onComplete, dateLocale, labels, }: TaskDetailViewProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=task-detail-view.d.ts.map