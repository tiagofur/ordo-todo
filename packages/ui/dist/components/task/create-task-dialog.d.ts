import { RecurrenceValue } from './recurrence-selector.js';
interface ProjectOption {
    id: string;
    name: string;
}
interface CreateTaskFormData {
    title: string;
    description?: string;
    projectId: string;
    priority: string;
    dueDate?: string;
    estimatedMinutes?: number;
    recurrence?: RecurrenceValue;
}
interface CreateTaskDialogProps {
    /** Whether dialog is open */
    open: boolean;
    /** Called when open state changes */
    onOpenChange: (open: boolean) => void;
    /** Pre-selected project ID */
    projectId?: string;
    /** Available projects */
    projects?: ProjectOption[];
    /** Whether projects are loading */
    isLoadingProjects?: boolean;
    /** Called to request creating a new project (empty state action) */
    onRequestCreateProject?: () => void;
    /** Called when form is submitted */
    onSubmit: (data: CreateTaskFormData) => Promise<void> | void;
    /** Called to generate AI description */
    onGenerateAIDescription?: (title: string) => Promise<string>;
    /** Whether submission is pending */
    isPending?: boolean;
    /** Custom labels */
    labels?: {
        title?: string;
        description?: string;
        aiMagic?: string;
        aiGenerating?: string;
        formTitle?: string;
        formTitlePlaceholder?: string;
        formProject?: string;
        formSelectProject?: string;
        formDescription?: string;
        formDescriptionPlaceholder?: string;
        formPriority?: string;
        formEstimatedMinutes?: string;
        formDueDate?: string;
        priorities?: {
            low: string;
            medium: string;
            high: string;
        };
        buttons?: {
            cancel: string;
            create: string;
            creating: string;
        };
        emptyState?: {
            title: string;
            description: string;
            action: string;
        };
        validation?: {
            titleRequired: string;
            projectRequired: string;
        };
    };
}
export declare function CreateTaskDialog({ open, onOpenChange, projectId, projects, isLoadingProjects, onRequestCreateProject, onSubmit, onGenerateAIDescription, isPending, labels, }: CreateTaskDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=create-task-dialog.d.ts.map