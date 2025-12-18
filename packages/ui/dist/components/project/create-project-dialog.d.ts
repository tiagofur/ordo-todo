export interface WorkspaceOption {
    id: string;
    name: string;
}
export interface WorkflowOption {
    id: string;
    name: string;
}
export interface ProjectTemplateTask {
    title: string;
    description: string;
    priority: string;
}
export interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    icon: any;
    color: string;
    tasks: ProjectTemplateTask[];
}
export interface CreateProjectFormData {
    name: string;
    description?: string;
    color: string;
    workspaceId: string;
    workflowId?: string;
}
interface CreateProjectDialogProps {
    /** Whether dialog is open */
    open: boolean;
    /** Called when open state changes */
    onOpenChange: (open: boolean) => void;
    /** Pre-selected workspace ID */
    workspaceId?: string;
    /** Available workspaces */
    workspaces?: WorkspaceOption[];
    /** Whether workspaces are loading */
    isLoadingWorkspaces?: boolean;
    /** Available workflows for selected workspace */
    workflows?: WorkflowOption[];
    /** Available project templates */
    templates?: ProjectTemplate[];
    /** Whether create operation is pending */
    isPending?: boolean;
    /** Called when form is submitted */
    onSubmit: (data: CreateProjectFormData, templateTasks?: ProjectTemplateTask[]) => void;
    /** Called when workflow needs to be created (if none exists) */
    onCreateWorkflow?: (workspaceId: string) => Promise<string>;
    /** Custom labels for i18n */
    labels?: {
        title?: string;
        description?: string;
        descriptionPlaceholder?: string;
        nameRequired?: string;
        workspaceRequired?: string;
        templateSelected?: (name: string) => string;
        createWorkspace?: string;
        emptyTitle?: string;
        emptyDescription?: string;
        emptyAction?: string;
        templatesTitle?: string;
        tasksCount?: (count: number) => string;
        hideTemplates?: string;
        useTemplate?: string;
        colorLabel?: string;
        nameLabel?: string;
        namePlaceholder?: string;
        workspaceLabel?: string;
        descriptionLabel?: string;
        cancel?: string;
        create?: string;
        creating?: string;
    };
}
/**
 * CreateProjectDialog - Platform-agnostic project creation dialog
 *
 * Handles project creation with optional templates.
 * Data fetching and mutations are handled externally via props.
 */
export declare function CreateProjectDialog({ open, onOpenChange, workspaceId, workspaces, isLoadingWorkspaces, workflows, templates, isPending, onSubmit, onCreateWorkflow, labels, }: CreateProjectDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=create-project-dialog.d.ts.map