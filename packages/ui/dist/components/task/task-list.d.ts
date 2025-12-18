export interface TaskListItem {
    id: string | number;
    title: string;
    description?: string | null;
    status: string;
}
interface TaskListProps {
    /** Tasks to display */
    tasks: TaskListItem[];
    /** Whether data is loading */
    isLoading?: boolean;
    /** Error message if any */
    error?: string | null;
    /** Whether complete operation is pending */
    isCompleting?: boolean;
    /** Called when a task should be completed */
    onComplete?: (taskId: string) => void;
    /** Called when retry is clicked after error */
    onRetry?: () => void;
    /** Whether to show filter toggle */
    showFilter?: boolean;
    /** Whether showing user's tasks only */
    showMyTasks?: boolean;
    /** Called when filter is toggled */
    onFilterChange?: (showMyTasks: boolean) => void;
    /** Custom labels for i18n */
    labels?: {
        allTasks?: string;
        myTasks?: string;
        empty?: string;
        emptyMyTasks?: string;
        error?: (message: string) => string;
        retry?: string;
    };
    className?: string;
}
/**
 * TaskList - Platform-agnostic simple task list with checkboxes
 *
 * Data fetching and mutations handled externally.
 *
 * @example
 * const { data: tasks, isLoading, error, refetch } = useTasks(projectId);
 * const completeTask = useCompleteTask();
 *
 * <TaskList
 *   tasks={tasks || []}
 *   isLoading={isLoading}
 *   error={error?.message}
 *   isCompleting={completeTask.isPending}
 *   onComplete={(id) => completeTask.mutate(id)}
 *   onRetry={refetch}
 *   labels={{ allTasks: t('allTasks') }}
 * />
 */
export declare function TaskList({ tasks, isLoading, error, isCompleting, onComplete, onRetry, showFilter, showMyTasks: controlledShowMyTasks, onFilterChange, labels, className, }: TaskListProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=task-list.d.ts.map