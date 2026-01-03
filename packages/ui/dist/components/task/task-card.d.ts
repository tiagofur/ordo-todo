import { type ReactNode } from 'react';
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
    /** Whether the detail view is currently shown (controlled externally) */
    isExpanded?: boolean;
    /** Called when the card is clicked to toggle details */
    onToggleExpand?: (task: TaskCardTask) => void;
    /** Called when edit action is clicked */
    onEdit?: (task: TaskCardTask) => void;
    /** Called when delete action is clicked */
    onDelete?: (task: TaskCardTask) => void;
    /** Optional detail panel to render when expanded */
    DetailPanel?: ReactNode;
    /** Formatted due date string - passed from caller to maintain platform agnosticism */
    formattedDueDate?: string | null;
    /** Whether the task is overdue - passed from caller */
    isOverdue?: boolean;
    /** Component labels for i18n */
    labels?: {
        priorityLow?: string;
        priorityMedium?: string;
        priorityHigh?: string;
        priorityUrgent?: string;
        viewEdit?: string;
        delete?: string;
        completed?: string;
        moreOptions?: string;
    };
    /** Pre-calculated priority info */
    priorityInfo?: {
        label: string;
        colorClass: string;
    };
    className?: string;
}
/**
 * TaskCard - Platform-agnostic task display card
 *
 * Shows task with priority, due date, tags, and subtask progress.
 * All state and complex logic (dates, progress) should be handled by the caller.
 */
export declare function TaskCard({ task, index, isExpanded, onToggleExpand, onEdit, onDelete, DetailPanel, formattedDueDate, isOverdue, priorityInfo, labels, className, }: TaskCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=task-card.d.ts.map