/**
 * Project Type Enum - Matches Prisma schema
 * See: packages/db/prisma/schema.prisma
 */
export type ProjectType = 'STANDARD' | 'SERIES' | 'FOCUS' | 'CREATOR' | 'HYBRID';
/**
 * Task representation for different views
 */
export interface TaskData {
    id: string;
    title: string;
    status: string;
    description?: string;
    priority?: string;
    dueDate?: Date | string;
    stage?: string;
    category?: 'idea' | 'script' | 'filming' | 'editing' | 'publishing';
}
/**
 * Project data passed to the view switcher
 */
export interface ProjectViewData {
    id: string;
    name: string;
    description?: string;
    type: ProjectType;
    tasks: TaskData[];
}
/**
 * Props for the component containers that render the actual views
 */
export interface FocusViewProps {
    project: ProjectViewData;
    onTaskClick?: (taskId: string) => void;
    onTaskStatusChange?: (taskId: string, newStatus: string) => void;
    onCreateTask?: () => void;
    labels?: {
        createTask?: string;
        noTasks?: string;
        tasks?: string;
    };
}
export interface CreatorViewProps {
    project: ProjectViewData;
    onTaskClick?: (taskId: string) => void;
    onTaskStageChange?: (taskId: string, newStage: string) => void;
    onCreateTask?: () => void;
    labels?: {
        createIdea?: string;
        noIdeas?: string;
        ideas?: string;
        pipeline?: string;
    };
}
interface ProjectViewSwitcherProps {
    project: ProjectViewData;
    /** Component to render for FOCUS/STANDARD view */
    FocusViewComponent: React.ComponentType<FocusViewProps>;
    /** Component to render for CREATOR view */
    CreatorViewComponent: React.ComponentType<CreatorViewProps>;
    onTaskClick?: (taskId: string) => void;
    onTaskStatusChange?: (taskId: string, newStatus: string) => void;
    onTaskStageChange?: (taskId: string, newStage: string) => void;
    onCreateTask?: () => void;
    labels?: {
        focus?: string;
        creator?: string;
        both?: string;
        focusView?: FocusViewProps['labels'];
        creatorView?: CreatorViewProps['labels'];
    };
    className?: string;
}
/**
 * ProjectViewSwitcher - Conditional rendering based on project type
 *
 * Renders different views based on ProjectType:
 * - FOCUS/STANDARD/SERIES → Classic To-Do view (checkbox, kanban)
 * - CREATOR → Creator OS view (pipeline, scripting, publishing)
 * - HYBRID → Both views available via tabs
 */
export declare function ProjectViewSwitcher({ project, FocusViewComponent, CreatorViewComponent, onTaskClick, onTaskStatusChange, onTaskStageChange, onCreateTask, labels, className, }: ProjectViewSwitcherProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=project-view-switcher.d.ts.map