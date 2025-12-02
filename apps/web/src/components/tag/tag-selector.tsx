"use client";

import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { useTags, useAssignTagToTask, useRemoveTagFromTask } from "@/lib/api-hooks";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TagBadge } from "./tag-badge";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface TagSelectorProps {
  taskId: string;
  selectedTags?: Array<{ id?: string | number; name: string; color: string }>;
  workspaceId?: string;
  onTagsChange?: () => void;
}

export function TagSelector({ taskId, selectedTags = [], workspaceId = "default", onTagsChange }: TagSelectorProps) {
  const t = useTranslations('TagSelector');
  const [open, setOpen] = useState(false);

  const { data: availableTags, isLoading } = useTags(workspaceId);

  const assignTag = useAssignTagToTask();

  const removeTag = useRemoveTagFromTask();

  const isTagSelected = (tagId: string | number | undefined) => {
    return selectedTags.some((t) => t.id === tagId);
  };

  const handleToggleTag = (tag: { id?: string | number; name: string; color: string }) => {
    if (!tag.id) return;

    if (isTagSelected(tag.id)) {
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

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Selected Tags */}
      {selectedTags.map((tag) => (
        <TagBadge
          key={tag.id}
          tag={tag}
          removable
          onRemove={() => tag.id && removeTag.mutate({ tagId: String(tag.id), taskId }, {
            onSuccess: () => {
              toast.success(t('toast.removed'));
              onTagsChange?.();
            }
          })}
        />
      ))}

      {/* Add Tag Button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-0.5 text-xs font-medium hover:bg-accent">
            <Plus className="h-3 w-3" />
            {t('addTag')}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="space-y-1">
            {isLoading ? (
              <div className="p-2 text-sm text-muted-foreground">{t('loading')}</div>
            ) : availableTags && availableTags.length > 0 ? (
              availableTags.map((tag: any) => (
                <button
                  key={tag.id}
                  onClick={() => handleToggleTag(tag)}
                  disabled={assignTag.isPending || removeTag.isPending}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
                >
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </span>
                  {isTagSelected(tag.id) && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground">
                {t('noTags')}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
