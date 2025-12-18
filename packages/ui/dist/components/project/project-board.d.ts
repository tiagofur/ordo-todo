interface ProjectBoardProps {
    /** Tasks to display */
    tasks?: any[];
    /** Whether loading */
    isLoading?: boolean;
    /** Called when task is moved/updated */
    onUpdateTask?: (taskId: string, data: any) => void;
    /** Called when add task button is clicked in a column */
    onAddTaskClick?: (status: string) => void;
    /** Callback when task card is clicked */
    onTaskClick?: (taskId: string) => void;
    /** Callback when edit is clicked */
    onEditClick?: (taskId: string) => void;
    /** Callback when delete is clicked */
    onDeleteClick?: (taskId: string) => void;
    /** Custom labels */
    labels?: {
        todo?: string;
        inProgress?: string;
        completed?: string;
        addTask?: string;
        priorityLow?: string;
        priorityMedium?: string;
        priorityHigh?: string;
        priorityUrgent?: string;
        viewEdit?: string;
        delete?: string;
    };
}
export declare function ProjectBoard({ tasks: serverTasks, isLoading, onUpdateTask, onAddTaskClick, onTaskClick, onEditClick, onDeleteClick, labels, }: ProjectBoardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=project-board.d.ts.map