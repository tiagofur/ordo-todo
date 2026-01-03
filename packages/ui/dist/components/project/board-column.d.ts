import { type ReactNode } from "react";
interface BoardColumnProps {
    id: string;
    title: string;
    color: string;
    /** Tasks to display (already filtered for this column) */
    tasksCount?: number;
    /** Header color classes or hex (solid) */
    headerColorClass?: string;
    /** Callback to add task */
    onAddTask?: () => void;
    /** Content of the column (tasks) */
    children?: ReactNode;
    /** Labels for i18n */
    labels?: {
        addTask?: string;
    };
    className?: string;
    /** Style for container (e.g. for droppable ref) */
    style?: React.CSSProperties;
    /** Reference for droppable node - passed as callback/prop to be agnostic */
    setNodeRef?: (node: HTMLElement | null) => void;
}
/**
 * BoardColumn - Platform-agnostic Kanban column layout
 */
export declare function BoardColumn({ id, title, tasksCount, headerColorClass, onAddTask, children, labels, className, style, setNodeRef, }: BoardColumnProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=board-column.d.ts.map