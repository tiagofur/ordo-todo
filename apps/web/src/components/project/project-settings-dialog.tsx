'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Input,
  Textarea,
  Button,
} from '@ordo-todo/ui';
import { Palette, Check } from 'lucide-react';
import { PROJECT_COLORS, updateProjectSchema } from '@ordo-todo/core';

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
  onSubmit?: (data: { name: string; description?: string; color: string }) => void;
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
export function ProjectSettingsDialog({
  project,
  open,
  onOpenChange,
  isPending = false,
  onSubmit,
  labels = {},
}: ProjectSettingsDialogProps) {
  const {
    title = 'Project Settings',
    description = 'Update project name, description and color',
    colorLabel = 'Color',
    nameLabel = 'Name',
    namePlaceholder = 'Project name',
    nameRequired = 'Name is required',
    descriptionLabel = 'Description',
    descriptionPlaceholder = 'Project description (optional)',
    cancel = 'Cancel',
    save = 'Save',
    saving = 'Saving...',
  } = labels;

  const [selectedColor, setSelectedColor] = useState<(typeof PROJECT_COLORS)[number]>(
    PROJECT_COLORS[3]
  );

  const formSchema = updateProjectSchema.extend({
    name: z.string().min(1, nameRequired),
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
        description: project.description || '',
        color: project.color || undefined,
      });
      setSelectedColor(
        (project.color || PROJECT_COLORS[3]) as (typeof PROJECT_COLORS)[number]
      );
    }
  }, [project, reset]);

  const handleFormSubmit = (data: UpdateProjectForm) => {
    onSubmit?.({
      ...data,
      color: selectedColor,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] gap-0 p-0 overflow-hidden bg-background border-border">
        <div className="p-6 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">{title}</DialogTitle>
            <DialogDescription className="text-muted-foreground">{description}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Color Picker */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Palette className="w-4 h-4" /> {colorLabel}
              </Label>
              <div className="flex gap-3 flex-wrap p-3 rounded-lg border border-border bg-muted/20">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`relative h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                      selectedColor === color
                        ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110'
                        : 'hover:opacity-80'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === color && (
                      <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                {nameLabel}
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder={namePlaceholder}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                {descriptionLabel}
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder={descriptionPlaceholder}
                className="min-h-[100px] resize-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                {cancel}
              </Button>
              <Button
                type="submit"
                disabled={isPending}
              >
                {isPending ? saving : save}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
