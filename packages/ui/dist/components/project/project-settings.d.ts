interface ProjectSettingsProps {
    project: {
        id: string;
        name: string;
        description?: string | null;
        color: string;
        archived?: boolean;
        slug?: string;
    };
    onUpdate: (projectId: string, data: any) => Promise<void> | void;
    onArchive: (projectId: string) => Promise<void> | void;
    onDelete: (projectId: string) => Promise<void> | void;
    isUpdating?: boolean;
    isArchiving?: boolean;
    isDeleting?: boolean;
    labels?: {
        general?: {
            title: string;
            description: string;
        };
        form?: {
            name: {
                label: string;
                placeholder: string;
                required: string;
            };
            description: {
                label: string;
                placeholder: string;
            };
            color: {
                label: string;
            };
        };
        danger?: {
            title: string;
            description: string;
            archive: {
                title: string;
                description: string;
            };
            unarchive: {
                title: string;
                description: string;
            };
            delete: {
                title: string;
                description: string;
            };
        };
        actions?: {
            save: string;
            saving: string;
            archive: string;
            unarchive: string;
            delete: string;
        };
        deleteDialog?: {
            title: string;
            description: string;
            cancel: string;
            confirm: string;
        };
    };
}
export declare function ProjectSettings({ project, onUpdate, onArchive, onDelete, isUpdating, isArchiving, isDeleting, labels, }: ProjectSettingsProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=project-settings.d.ts.map