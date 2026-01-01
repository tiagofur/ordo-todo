interface KanbanTaskCardProps {
    task: {
        id?: string | number;
        title: string;
        description?: string | null;
        status: string;
        priority: string;
        dueDate?: Date | string | null;
        tags?: any[];
        project?: {
            id: string;
            name: string;
            color: string;
        };
    };
    index?: number;
    /** Callback when task card is clicked */
    onTaskClick?: (taskId: string) => void;
    /** Callback when edit is clicked */
    onEditClick?: (taskId: string) => void;
    /** Callback when delete is clicked */
    onDeleteClick?: (taskId: string) => void;
    /** Callback when detail panel should open/close */
    onDetailOpenChange?: (taskId: string, open: boolean) => void;
    /** Whether detail panel is open for this task */
    isDetailOpen?: boolean;
    /** Labels for i18n */
    labels?: {
        priorityLow?: string;
        priorityMedium?: string;
        priorityHigh?: string;
        priorityUrgent?: string;
        viewEdit?: string;
        delete?: string;
    };
}
export declare function KanbanTaskCard({ task, index, onTaskClick, onEditClick, onDeleteClick, onDetailOpenChange, isDetailOpen, labels, }: KanbanTaskCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=kanban-task-card.d.ts.map