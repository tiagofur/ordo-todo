interface BoardColumnProps {
    id: string;
    title: string;
    color: string;
    tasks: any[];
    onAddTask: () => void;
    onTaskClick?: (taskId: string) => void;
    onEditClick?: (taskId: string) => void;
    onDeleteClick?: (taskId: string) => void;
    /** Labels for i18n */
    labels?: {
        addTask?: string;
        priorityLow?: string;
        priorityMedium?: string;
        priorityHigh?: string;
        priorityUrgent?: string;
        viewEdit?: string;
        delete?: string;
    };
}
export declare function BoardColumn({ id, title, color, tasks, onAddTask, onTaskClick, onEditClick, onDeleteClick, labels }: BoardColumnProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=board-column.d.ts.map