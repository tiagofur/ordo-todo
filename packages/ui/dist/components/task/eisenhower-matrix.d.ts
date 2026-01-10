interface Task {
    id: string;
    title: string;
    priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW";
    dueDate?: string | Date | null;
    isUrgent?: boolean;
    isImportant?: boolean;
    completed: boolean;
    project?: {
        id: string;
        name: string;
        color: string;
    } | null;
}
interface EisenhowerMatrixProps {
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
    onTaskComplete?: (taskId: string, completed: boolean) => void;
    onTaskMove?: (taskId: string, quadrant: "DO" | "SCHEDULE" | "DELEGATE" | "DELETE") => void;
}
export declare function EisenhowerMatrix({ tasks, onTaskClick, onTaskComplete, onTaskMove, }: EisenhowerMatrixProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=eisenhower-matrix.d.ts.map