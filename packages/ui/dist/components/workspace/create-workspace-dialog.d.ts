export interface CreateWorkspaceFormData {
    name: string;
    slug: string;
    description?: string;
    type: 'PERSONAL' | 'WORK' | 'TEAM';
}
interface CreateWorkspaceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateWorkspaceFormData) => Promise<void> | void;
    isPending?: boolean;
    labels?: {
        title?: string;
        description?: string;
        form?: {
            type?: string;
            name?: string;
            namePlaceholder?: string;
            description?: string;
            descriptionPlaceholder?: string;
        };
        types?: {
            personal?: string;
            personalDesc?: string;
            work?: string;
            workDesc?: string;
            team?: string;
            teamDesc?: string;
        };
        buttons?: {
            cancel?: string;
            create?: string;
            creating?: string;
        };
        validation?: {
            nameRequired?: string;
        };
    };
}
export declare function CreateWorkspaceDialog({ open, onOpenChange, onSubmit, isPending, labels, }: CreateWorkspaceDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=create-workspace-dialog.d.ts.map