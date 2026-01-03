import { type ReactNode } from "react";
export interface KanbanTaskData {
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
}
interface KanbanTaskCardProps {
    task: KanbanTaskData;
    index?: number;
    /** Callback when task card is clicked */
    onTaskClick?: (taskId: string) => void;
    /** Callback when edit is clicked */
    onEditClick?: (taskId: string) => void;
    /** Callback when delete is clicked */
    onDeleteClick?: (taskId: string) => void;
    /** Optional detail panel/modal to render when requested */
    children?: ReactNode;
    /** Formatted due date string */
    formattedDueDate?: string | null;
    /** Whether the task is overdue */
    isOverdue?: boolean;
    /** Labels for i18n */
    labels?: {
        priorityLow?: string;
        priorityMedium?: string;
        priorityHigh?: string;
        priorityUrgent?: string;
        viewEdit?: string;
        delete?: string;
        moreOptions?: string;
    };
    /** Pre-calculated priority info */
    priorityInfo?: {
        label: string;
        colorClass: string;
        bgSolid: string;
    };
    className?: string;
    /** Style object for container (e.g. for drag and drop) */
    style?: React.CSSProperties;
}
export declare function KanbanTaskCard({ task, onTaskClick, onEditClick, onDeleteClick, children, formattedDueDate, isOverdue, priorityInfo, labels, className, style, }: KanbanTaskCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=kanban-task-card.d.ts.map