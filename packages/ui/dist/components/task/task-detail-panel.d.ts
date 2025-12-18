import { type ReactNode } from 'react';
export interface TaskTag {
    id: string;
    name: string;
    color: string;
}
export interface TaskDetailData {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    dueDate?: string | Date | null;
    estimatedTime?: number | null;
    createdAt?: string | Date;
    tags?: TaskTag[];
    assignee?: any;
    publicToken?: string | null;
    subTasks?: any[];
    comments?: any[];
    attachments?: any[];
    activities?: any[];
}
interface TaskDetailPanelProps {
    taskId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Task Data and State */
    task?: TaskDetailData;
    isLoading?: boolean;
    /** Current User Info */
    currentUserId?: string;
    /** Available Tags for assignment */
    availableTags?: TaskTag[];
    /** Actions */
    onUpdate?: (taskId: string, data: any) => Promise<void> | void;
    onDelete?: (taskId: string) => Promise<void> | void;
    onAssignTag?: (taskId: string, tagId: string) => Promise<void> | void;
    onRemoveTag?: (taskId: string, tagId: string) => Promise<void> | void;
    onShare?: (taskId: string) => Promise<void> | void;
    /** Render Props for Sub-components to avoid huge dependency tree */
    renderSubtaskList?: (taskId: string, subtasks: any[]) => ReactNode;
    renderComments?: (taskId: string) => ReactNode;
    renderAttachments?: (taskId: string) => ReactNode;
    renderActivity?: (taskId: string) => ReactNode;
    renderAssigneeSelector?: (taskId: string, currentAssignee: any) => ReactNode;
    renderCreateTagDialog?: (open: boolean, onOpenChange: (open: boolean) => void) => ReactNode;
    /** Labels */
    labels?: {
        title?: string;
        titlePlaceholder?: string;
        descriptionLabel?: string;
        descriptionPlaceholder?: string;
        descriptionEmpty?: string;
        statusTodo?: string;
        statusInProgress?: string;
        statusCompleted?: string;
        statusCancelled?: string;
        priorityLow?: string;
        priorityMedium?: string;
        priorityHigh?: string;
        priorityUrgent?: string;
        dueDate?: string;
        estimation?: string;
        detailsTitle?: string;
        tabsSubtasks?: string;
        tabsComments?: string;
        tabsAttachments?: string;
        tabsActivity?: string;
        tagsNone?: string;
        tagsAdd?: string;
        tagsAvailable?: string;
        tagsNoAvailable?: string;
        tagsCreate?: string;
        btnSave?: string;
        btnDelete?: string;
        footerCreated?: string;
        confirmDelete?: string;
        toastUpdated?: string;
        toastDeleted?: string;
        toastTagAssigned?: (name: string) => string;
        shareTitle?: string;
        shareDescription?: string;
    };
}
export declare function TaskDetailPanel({ taskId, open, onOpenChange, task, isLoading, availableTags, onUpdate, onDelete, onAssignTag, onRemoveTag, onShare, renderSubtaskList, renderComments, renderAttachments, renderActivity, renderAssigneeSelector, renderCreateTagDialog, labels, }: TaskDetailPanelProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=task-detail-panel.d.ts.map