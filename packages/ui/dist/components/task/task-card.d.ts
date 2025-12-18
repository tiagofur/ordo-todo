import { type ReactNode } from 'react';
import { format } from 'date-fns';
export interface TaskCardTask {
    id?: string | number;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    dueDate?: Date | string | null;
    tags?: Array<{
        id: string | number;
        name: string;
        color: string;
    }>;
    project?: {
        id: string;
        name: string;
        color: string;
    };
    subTasks?: Array<{
        id: string | number;
        title: string;
        status: string;
    }>;
}
interface TaskCardProps {
    task: TaskCardTask;
    index?: number;
    /** Called when task card is clicked */
    onClick?: (task: TaskCardTask) => void;
    /** Called when edit action is clicked */
    onEdit?: (task: TaskCardTask) => void;
    /** Called when delete action is clicked */
    onDelete?: (task: TaskCardTask) => void;
    /** Optional detail panel to render when clicked */
    DetailPanel?: ReactNode;
    /** Date locale for formatting */
    dateLocale?: Locale;
    /** Custom labels for i18n */
    labels?: {
        priorityLow?: string;
        priorityMedium?: string;
        priorityHigh?: string;
        priorityUrgent?: string;
        viewEdit?: string;
        delete?: string;
        completed?: string;
    };
    className?: string;
}
type Locale = Parameters<typeof format>[2] extends {
    locale?: infer L;
} ? L : never;
/**
 * TaskCard - Platform-agnostic task display card
 *
 * Shows task with priority, due date, tags, and subtask progress.
 * All actions handled via props.
 *
 * @example
 * <TaskCard
 *   task={task}
 *   onClick={(t) => setSelectedTask(t)}
 *   onEdit={(t) => openEditDialog(t)}
 *   onDelete={(t) => deleteTask.mutate(t.id)}
 *   labels={{ priorityHigh: t('priority.high') }}
 * />
 */
export declare function TaskCard({ task, index, onClick, onEdit, onDelete, DetailPanel, dateLocale, labels, className, }: TaskCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=task-card.d.ts.map