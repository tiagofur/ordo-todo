"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTag, useUpdateTag } from "@/lib/api-hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { notify } from "@/lib/notify";
import { useTranslations } from "next-intl";

interface CreateTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string;
  tagToEdit?: { id: string; name: string; color?: string; workspaceId: string };
}

const tagColors = [
  "#EF4444", // red
  "#F59E0B", // amber
  "#10B981", // emerald
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#6366F1", // indigo
  "#14B8A6", // teal
  "#F97316", // orange
  "#84CC16", // lime
];

export function CreateTagDialog({ open, onOpenChange, workspaceId, tagToEdit }: CreateTagDialogProps) {
  const t = useTranslations('CreateTagDialog');
  const [selectedColor, setSelectedColor] = useState(tagToEdit?.color || tagColors[0]);

  const createTagSchema = z.object({
    name: z.string().min(1, t('form.name.required')),
    color: z.string().optional(),
    workspaceId: z.string().min(1, "Workspace es requerido"), // This is internal, maybe no need to translate error
  });

  type CreateTagForm = z.infer<typeof createTagSchema>;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTagForm>({
    resolver: zodResolver(createTagSchema),
    defaultValues: {
      name: tagToEdit?.name || "",
      workspaceId: workspaceId || tagToEdit?.workspaceId,
      color: tagToEdit?.color || tagColors[0],
    },
  });

  const watchedName = watch("name");

  // Update form when workspaceId or tagToEdit changes
  useEffect(() => {
    if (tagToEdit) {
      setValue("name", tagToEdit.name);
      setValue("workspaceId", tagToEdit.workspaceId);
      setSelectedColor(tagToEdit.color || tagColors[0]);
    } else if (workspaceId) {
      setValue("workspaceId", workspaceId);
      if (!open) {
        reset({ name: "", workspaceId, color: tagColors[0] });
        setSelectedColor(tagColors[0]);
      }
    }
  }, [workspaceId, tagToEdit, setValue, reset, open]);

  const createTag = useCreateTag();
  const updateTag = useUpdateTag();

  const onSubmit = (data: CreateTagForm) => {
    const payload = {
      ...data,
      color: selectedColor,
    };
    
    if (tagToEdit) {
      updateTag.mutate({ tagId: tagToEdit.id, data: payload }, {
        onSuccess: () => {
          notify.success(t('toast.updated'));
          reset();
          onOpenChange(false);
        },
        onError: (error: any) => {
          notify.error(error.message || t('toast.updateError'));
        }
      });
    } else {
      createTag.mutate(payload, {
        onSuccess: () => {
          notify.success(t('toast.created'));
          reset();
          onOpenChange(false);
        },
        onError: (error: any) => {
          notify.error(error.message || t('toast.createError'));
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{tagToEdit ? t('title.edit') : t('title.create')}</DialogTitle>
          <DialogDescription>
            {tagToEdit ? t('description.edit') : t('description.create')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Color Picker */}
          <div className="space-y-2">
            <Label>{t('form.color.label')}</Label>
            <div className="flex flex-wrap gap-2">
              {tagColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-10 w-10 rounded-lg transition-all ${
                    selectedColor === color ? "scale-110 ring-2 ring-offset-2 ring-primary" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('form.name.label')}</Label>
            <input
              id="name"
              {...register("name")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={t('form.name.placeholder')}
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>{t('form.preview.label')}</Label>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
                style={{
                  backgroundColor: `${selectedColor}20`,
                  color: selectedColor,
                }}
              >
                {watchedName || t('form.preview.default')}
              </span>
            </div>
          </div>

          {/* Hidden workspace ID */}
          <input type="hidden" {...register("workspaceId")} />

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              {t('actions.cancel')}
            </button>
            <button
              type="submit"
              disabled={createTag.isPending || updateTag.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {tagToEdit 
                ? (updateTag.isPending ? t('actions.saving') : t('actions.save')) 
                : (createTag.isPending ? t('actions.creating') : t('actions.create'))
              }
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
