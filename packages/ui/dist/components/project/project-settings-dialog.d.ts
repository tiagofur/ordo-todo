export interface ProjectSettingsData {
    id: string;
    name: string;
    description?: string | null;
    color?: string | null;
}
interface ProjectSettingsDialogProps {
    /** Project data to edit */
    project?: ProjectSettingsData | null;
    /** Whether dialog is open */
    open: boolean;
    /** Called when open state changes */
    onOpenChange: (open: boolean) => void;
    /** Whether update is pending */
    isPending?: boolean;
    /** Called when form is submitted */
    onSubmit?: (data: {
        name: string;
        description?: string;
        color: string;
    }) => void;
    /** Custom labels for i18n */
    labels?: {
        title?: string;
        description?: string;
        colorLabel?: string;
        nameLabel?: string;
        namePlaceholder?: string;
        nameRequired?: string;
        descriptionLabel?: string;
        descriptionPlaceholder?: string;
        cancel?: string;
        save?: string;
        saving?: string;
    };
}
/**
 * ProjectSettingsDialog - Platform-agnostic project settings edit dialog
 *
 * Data fetching and mutations handled externally.
 *
 * @example
 * const { data: project } = useProject(projectId);
 * const updateProject = useUpdateProject();
 *
 * <ProjectSettingsDialog
 *   project={project}
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   isPending={updateProject.isPending}
 *   onSubmit={(data) => updateProject.mutate({ projectId, data })}
 *   labels={{ title: t('title') }}
 * />
 */
export declare function ProjectSettingsDialog({ project, open, onOpenChange, isPending, onSubmit, labels, }: ProjectSettingsDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=project-settings-dialog.d.ts.map