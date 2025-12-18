interface SortableTaskProps {
    task: any;
    index: number;
    onTaskClick?: (taskId: string) => void;
    onEditClick?: (taskId: string) => void;
    onDeleteClick?: (taskId: string) => void;
    labels?: {
        priorityLow?: string;
        priorityMedium?: string;
        priorityHigh?: string;
        priorityUrgent?: string;
        viewEdit?: string;
        delete?: string;
    };
}
export declare function SortableTask({ task, index, onTaskClick, onEditClick, onDeleteClick, labels }: SortableTaskProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=sortable-task.d.ts.map