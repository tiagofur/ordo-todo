export interface ProjectDisplayData {
    id?: string | number;
    name: string;
    description?: string | null;
    color: string;
    archived: boolean;
    slug?: string;
    tasksCount?: number;
    completedTasksCount?: number;
}
interface ProjectCardProps {
    project: ProjectDisplayData;
    index?: number;
    /** Explicit click handler, overrides default navigation logic */
    onProjectClick?: (project: ProjectDisplayData) => void;
    /** Callback for archiving project */
    onArchive?: (projectId: string) => void;
    /** Callback for deleting project */
    onDelete?: (projectId: string) => void;
    /** Progress percentage (0-100) */
    progressPercent?: number;
    /** Formatted tasks progress string (e.g. "5 / 10") */
    formattedTasksProgress?: string;
    /** Labels for i18n */
    labels?: {
        actions?: {
            archive?: string;
            unarchive?: string;
            delete?: string;
        };
        progressLabel?: string;
        archived?: string;
        moreOptions?: string;
    };
    className?: string;
}
/**
 * ProjectCard - Platform-agnostic component for project summary
 */
export declare function ProjectCard({ project, onProjectClick, onArchive, onDelete, progressPercent, formattedTasksProgress, labels, className, }: ProjectCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=project-card.d.ts.map