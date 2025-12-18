export interface TagFormData {
    name: string;
    color: string;
    workspaceId?: string;
}
interface CreateTagDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId?: string;
    tagToEdit?: {
        id: string;
        name: string;
        color?: string;
        workspaceId: string;
    };
    /** Called when form is submitted */
    onSubmit: (data: TagFormData, isEdit: boolean) => void;
    /** Whether submission is in progress */
    isPending?: boolean;
    /** Custom labels for i18n */
    labels?: {
        titleCreate?: string;
        titleEdit?: string;
        descriptionCreate?: string;
        descriptionEdit?: string;
        colorLabel?: string;
        nameLabel?: string;
        namePlaceholder?: string;
        nameRequired?: string;
        previewLabel?: string;
        previewDefault?: string;
        cancel?: string;
        save?: string;
        saving?: string;
        create?: string;
        creating?: string;
    };
}
/**
 * CreateTagDialog - Platform-agnostic tag creation/edit dialog
 *
 * Uses @ordo-todo/core for TAG_COLORS constant.
 * Form submission and API calls are handled externally via onSubmit.
 *
 * @example
 * const createTag = useCreateTag();
 *
 * <CreateTagDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   workspaceId={workspaceId}
 *   onSubmit={(data, isEdit) => {
 *     if (isEdit) {
 *       updateTag.mutate({ tagId, data });
 *     } else {
 *       createTag.mutate(data);
 *     }
 *   }}
 *   isPending={createTag.isPending}
 *   labels={{ titleCreate: t('title.create'), ... }}
 * />
 */
export declare function CreateTagDialog({ open, onOpenChange, workspaceId, tagToEdit, onSubmit, isPending, labels, }: CreateTagDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=create-tag-dialog.d.ts.map