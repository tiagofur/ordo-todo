import { type ReactNode } from 'react';
import { format } from 'date-fns';
type ViewMode = 'list' | 'grid';
export interface TaskCompactData {
    id?: string | number;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    dueDate?: Date | string | null;
    estimatedTime?: number | null;
    tags?: Array<{
        id: string;
        name: string;
        color: string;
    }>;
    project?: {
        id: string;
        name: string;
        color: string;
    };
}
interface TaskCardCompactProps {
    /** Task data */
    task: TaskCompactData;
    /** Index for animation delay */
    index?: number;
    /** View mode: list or grid */
    viewMode?: ViewMode;
    /** Whether to show project info */
    showProject?: boolean;
    /** Whether to show gradient effect */
    showGradient?: boolean;
    /** Called when task is clicked */
    onTaskClick?: (taskId: string) => void;
    /** Called when status changes */
    onStatusChange?: (taskId: string, status: string) => void;
    /** Called when delete is requested */
    onDelete?: (taskId: string) => void;
    /** Detail panel component to render when needed */
    DetailPanel?: ReactNode;
    /** Function to control DetailPanel visibility if passing it as ReactNode is not enough */
    onToggleDetail?: (open: boolean) => void;
    /** Date locale */
    dateLocale?: Locale;
    /** Custom labels for i18n */
    labels?: {
        statusTodo?: string;
        statusInProgress?: string;
        statusCompleted?: string;
        statusOnHold?: string;
        statusLabel?: string;
        changeStatus?: string;
        priorityUrgent?: string;
        priorityHigh?: string;
        priorityMedium?: string;
        priorityLow?: string;
        priorityNormal?: string;
        viewDetails?: string;
        delete?: string;
    };
}
type Locale = Parameters<typeof format>[2] extends {
    locale?: infer L;
} ? L : never;
export declare function TaskCardCompact({ task, index, viewMode, showProject, showGradient, onTaskClick, onStatusChange, onDelete, DetailPanel, onToggleDetail, dateLocale, labels, }: TaskCardCompactProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=task-card-compact.d.ts.map