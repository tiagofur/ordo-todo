"use client";

import { useState, useEffect } from "react";
import { Label, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@ordo-todo/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateProject, useProject } from "@/lib/api-hooks";
import { toast } from "sonner";
import { Palette, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/lib/error-handler";

import { TAG_COLORS, updateProjectSchema } from "@ordo-todo/core";

interface ProjectSettingsDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectSettingsDialog({ projectId, open, onOpenChange }: ProjectSettingsDialogProps) {
  const t = useTranslations('ProjectSettingsDialog');
  const { data: project } = useProject(projectId);
  const [selectedColor, setSelectedColor] = useState<typeof TAG_COLORS[number]>(TAG_COLORS[3]);

  const formSchema = updateProjectSchema.extend({
    name: z.string().min(1, t('form.name.required')),
  });

  type UpdateProjectForm = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProjectForm>({
    resolver: zodResolver(formSchema),
  });

  // Update form when project data loads
  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description || "",
        color: project.color,
      });
      setSelectedColor((project.color || TAG_COLORS[3]) as typeof TAG_COLORS[number]);
    }
  }, [project, reset]);

  const updateProjectMutation = useUpdateProject();

  const onSubmit = async (data: UpdateProjectForm) => {
    try {
      await updateProjectMutation.mutateAsync({
        projectId,
        data: {
          ...data,
          color: selectedColor,
        },
      });

      toast.success(t('toast.updated'));
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error, t('toast.updateError')));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden bg-background border-border">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">
              {t('title')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t('description')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          <form id="project-settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            {/* Color Picker */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Palette className="w-4 h-4" /> {t('form.color.label')}
              </Label>
              <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`h-10 w-10 rounded-lg transition-all ${
                      selectedColor === color
                        ? "scale-110 ring-2 ring-offset-2 ring-primary"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">{t('form.name.label')}</Label>
              <input
                id="name"
                {...register("name")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t('form.name.placeholder')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">{t('form.description.label')}</Label>
              <textarea
                id="description"
                {...register("description")}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder={t('form.description.placeholder')}
              />
            </div>
          </form>
        </div>

        <div className="p-6 pt-4 border-t bg-background">
          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('actions.cancel')}
            </button>
            <button
              type="submit"
              form="project-settings-form"
              disabled={updateProjectMutation.isPending}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {updateProjectMutation.isPending ? t('actions.saving') : t('actions.save')}
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
