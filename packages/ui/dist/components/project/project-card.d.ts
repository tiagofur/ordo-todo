interface ProjectDisplayData {
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
    onArchive?: (projectId: string) => Promise<void> | void;
    /** Callback for deleting project */
    onDelete?: (projectId: string) => Promise<void> | void;
    /** Custom labels */
    labels?: {
        actions?: {
            archive?: string;
            unarchive?: string;
            delete?: string;
        };
        progress?: string;
        tasksProgress?: string;
        archived?: string;
        confirmDelete?: string;
    };
}
export declare function ProjectCard({ project, index, onProjectClick, onArchive, onDelete, labels, }: ProjectCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=project-card.d.ts.map