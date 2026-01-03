import { type ReactNode } from 'react';
interface ProjectBoardProps {
    /** Loading state */
    isLoading?: boolean;
    /** Content of the board (columns) */
    children?: ReactNode;
    /** Custom labels */
    labels?: {
        todo?: string;
        inProgress?: string;
        completed?: string;
    };
    className?: string;
}
/**
 * ProjectBoard - Platform-agnostic layout for Kanban board
 *
 * Behavior (DnD) should be implemented by the consuming application
 * by wrapping columns and tasks.
 */
export declare function ProjectBoard({ isLoading, children, className, }: ProjectBoardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=project-board.d.ts.map