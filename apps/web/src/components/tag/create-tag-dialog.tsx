"use client";

import { useCreateTag, useUpdateTag } from "@/lib/api-hooks";
import { notify } from "@/lib/notify";
import { useTranslations } from "next-intl";
import { CreateTagDialog as CreateTagDialogUI, type TagFormData } from "@ordo-todo/ui";

interface CreateTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string;
  tagToEdit?: { id: string; name: string; color?: string; workspaceId: string };
}

/**
 * CreateTagDialog - Web wrapper for the shared CreateTagDialog component
 * 
 * Integrates the platform-agnostic UI component with:
 * - useCreateTag and useUpdateTag hooks for API calls
 * - notify for toast notifications
 * - next-intl for translations
 */
export function CreateTagDialog({ open, onOpenChange, workspaceId, tagToEdit }: CreateTagDialogProps) {
  const t = useTranslations('CreateTagDialog');
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();

  const handleSubmit = (data: TagFormData, isEdit: boolean) => {
    // Cast TagFormData to API types
    const tagData = {
      name: data.name,
      color: data.color,
      workspaceId: data.workspaceId || workspaceId,
    };
    
    if (isEdit && tagToEdit) {
      updateTag.mutate({ tagId: tagToEdit.id, data: tagData as any }, {
        onSuccess: () => {
          notify.success(t('toast.updated'));
          onOpenChange(false);
        },
        onError: (error: any) => {
          notify.error(error.message || t('toast.updateError'));
        }
      });
    } else {
      createTag.mutate(tagData as any, {
        onSuccess: () => {
          notify.success(t('toast.created'));
          onOpenChange(false);
        },
        onError: (error: any) => {
          notify.error(error.message || t('toast.createError'));
        }
      });
    }
  };

  const labels = {
    titleCreate: t('title.create'),
    titleEdit: t('title.edit'),
    descriptionCreate: t('description.create'),
    descriptionEdit: t('description.edit'),
    colorLabel: t('form.color.label'),
    nameLabel: t('form.name.label'),
    namePlaceholder: t('form.name.placeholder'),
    nameRequired: t('form.name.required'),
    previewLabel: t('form.preview.label'),
    previewDefault: t('form.preview.default'),
    cancel: t('actions.cancel'),
    save: t('actions.save'),
    saving: t('actions.saving'),
    create: t('actions.create'),
    creating: t('actions.creating'),
  };

  return (
    <CreateTagDialogUI
      open={open}
      onOpenChange={onOpenChange}
      workspaceId={workspaceId}
      tagToEdit={tagToEdit}
      onSubmit={handleSubmit}
      isPending={createTag.isPending || updateTag.isPending}
      labels={labels}
    />
  );
}
