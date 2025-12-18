import { type ReactNode } from 'react';
import { format } from 'date-fns';
export interface ProjectTask {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate?: string | Date | null;
}
interface ProjectListProps {
    /** Tasks to display */
    tasks: ProjectTask[];
    /** Whether data is loading */
    isLoading?: boolean;
    /** Whether status update is pending */
    isUpdating?: boolean;
    /** Called when task status should toggle */
    onStatusToggle?: (task: ProjectTask) => void;
    /** Called when a task row is clicked */
    onTaskClick?: (task: ProjectTask) => void;
    /** Called when create task action is clicked */
    onCreateTask?: () => void;
    /** Task detail panel component (rendered when a task is selected) */
    TaskDetailPanel?: ReactNode;
    /** Create task dialog component */
    CreateTaskDialog?: ReactNode;
    /** Date locale for formatting */
    dateLocale?: Locale;
    /** Custom labels for i18n */
    labels?: {
        columnTask?: string;
        columnDueDate?: string;
        columnPriority?: string;
        emptyTitle?: string;
        emptyDescription?: string;
        emptyAction?: string;
    };
    className?: string;
}
type Locale = Parameters<typeof format>[2] extends {
    locale?: infer L;
} ? L : never;
/**
 * ProjectList - Platform-agnostic task list for a project
 *
 * Data fetching and mutations handled externally.
 *
 * @example
 * const { data: tasks, isLoading } = useTasks(projectId);
 * const updateTask = useUpdateTask();
 *
 * <ProjectList
 *   tasks={tasks || []}
 *   isLoading={isLoading}
 *   onStatusToggle={(task) => updateTask.mutate({
 *     taskId: task.id,
 *     data: { status: task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED' }
 *   })}
 *   onTaskClick={(task) => setSelectedTaskId(task.id)}
 *   labels={{ columnTask: t('task') }}
 * />
 */
export declare function ProjectList({ tasks, isLoading, isUpdating, onStatusToggle, onTaskClick, onCreateTask, TaskDetailPanel, CreateTaskDialog, dateLocale, labels, className, }: ProjectListProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=project-list.d.ts.map