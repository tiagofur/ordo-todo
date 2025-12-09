"use client";

import { useTags, useAssignTagToTask, useRemoveTagFromTask } from "@/lib/api-hooks";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { TagSelector as TagSelectorUI, type TagType } from "@ordo-todo/ui";

interface TagSelectorProps {
  taskId: string;
  selectedTags?: Array<{ id?: string | number; name: string; color: string }>;
  workspaceId?: string;
  onTagsChange?: () => void;
}

/**
 * TagSelector - Web wrapper for the shared TagSelector component
 * 
 * Integrates the platform-agnostic UI component with:
 * - useTags, useAssignTagToTask, useRemoveTagFromTask hooks
 * - sonner toast for notifications
 * - next-intl for translations
 */
export function TagSelector({ taskId, selectedTags = [], workspaceId = "default", onTagsChange }: TagSelectorProps) {
  const t = useTranslations('TagSelector');
  const { data: availableTags, isLoading } = useTags(workspaceId);
  const assignTag = useAssignTagToTask();
  const removeTag = useRemoveTagFromTask();

  const handleTagToggle = (tag: TagType, isSelected: boolean) => {
    if (!tag.id) return;

    if (isSelected) {
      // Tag is currently selected, so remove it
      removeTag.mutate({ tagId: String(tag.id), taskId }, {
        onSuccess: () => {
          toast.success(t('toast.removed'));
          onTagsChange?.();
        },
        onError: (error: any) => {
          toast.error(error.message || t('toast.removeError'));
        }
      });
    } else {
      // Tag is not selected, so add it
      assignTag.mutate({ tagId: String(tag.id), taskId }, {
        onSuccess: () => {
          toast.success(t('toast.assigned'));
          onTagsChange?.();
        },
        onError: (error: any) => {
          toast.error(error.message || t('toast.assignError'));
        }
      });
    }
  };

  const handleTagRemove = (tag: TagType) => {
    if (!tag.id) return;
    removeTag.mutate({ tagId: String(tag.id), taskId }, {
      onSuccess: () => {
        toast.success(t('toast.removed'));
        onTagsChange?.();
      }
    });
  };

  // Map to TagType format
  const mappedSelectedTags: TagType[] = selectedTags.map(tag => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
  }));

  const mappedAvailableTags: TagType[] = (availableTags ?? []).map((tag: any) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
  }));

  const labels = {
    addTag: t('addTag'),
    loading: t('loading'),
    noTags: t('noTags'),
  };

  return (
    <TagSelectorUI
      selectedTags={mappedSelectedTags}
      availableTags={mappedAvailableTags}
      isLoading={isLoading}
      onTagToggle={handleTagToggle}
      onTagRemove={handleTagRemove}
      isPending={assignTag.isPending || removeTag.isPending}
      labels={labels}
    />
  );
}
