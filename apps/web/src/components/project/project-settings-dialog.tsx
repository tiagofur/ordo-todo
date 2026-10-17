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
} from '@/components/ui';
import { Label } from '@/components/ui';
import { Input } from '@/components/ui';
import { Textarea } from '@/components/ui';
import { Button } from '@/components/ui';
import { Palette, Check } from 'lucide-react';
import { PROJECT_COLORS, updateProjectSchema } from '@ordo-todo/core';

export interface ProjectSettingsData {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  settings?: {
    wipLimits?: {
      TODO?: number;
      IN_PROGRESS?: number;
      COMPLETED?: number;
      CANCELLED?: number;
      [key: string]: number | undefined;
    };
    columnTitles?: {
      TODO?: string;
      IN_PROGRESS?: string;
      COMPLETED?: string;
      CANCELLED?: string;
      [key: string]: string | undefined;
    };
    [key: string]: any;
  } | null;
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
  onSubmit?: (data: {
    name: string;
    description?: string;
    color: string;
    settings?: any;
  }) => void;
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

  const handleFormSubmit = (data: UpdateProjectForm, e?: React.BaseSyntheticEvent) => {
    const formElement = e?.target as HTMLFormElement | undefined;
    const wipInProgressInput = formElement?.querySelector<HTMLInputElement>('[name="wipLimitInProgress"]');
    const wipTodoInput = formElement?.querySelector<HTMLInputElement>('[name="wipLimitTodo"]');
    const titleTodoInput = formElement?.querySelector<HTMLInputElement>('[name="columnTitleTodo"]');
    const titleInProgressInput = formElement?.querySelector<HTMLInputElement>('[name="columnTitleInProgress"]');
    const titleCompletedInput = formElement?.querySelector<HTMLInputElement>('[name="columnTitleCompleted"]');

    const parsedWipInProgress = wipInProgressInput ? parseInt(wipInProgressInput.value, 10) : undefined;
    const parsedWipTodo = wipTodoInput && wipTodoInput.value ? parseInt(wipTodoInput.value, 10) : undefined;

    const currentSettings = project?.settings || {};
    const updatedSettings = {
      ...currentSettings,
      wipLimits: {
        ...(currentSettings.wipLimits || {}),
        TODO: parsedWipTodo && !isNaN(parsedWipTodo) ? parsedWipTodo : undefined,
        IN_PROGRESS: isNaN(parsedWipInProgress as number) ? 5 : parsedWipInProgress,
      },
      columnTitles: {
        ...(currentSettings.columnTitles || {}),
        TODO: titleTodoInput?.value?.trim() || undefined,
        IN_PROGRESS: titleInProgressInput?.value?.trim() || undefined,
        COMPLETED: titleCompletedInput?.value?.trim() || undefined,
      },
    };

    onSubmit?.({
      ...data,
      color: selectedColor,
      settings: updatedSettings,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] gap-0 p-0 overflow-hidden bg-background border-border">
        <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
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
              <div className="flex gap-3 flex-wrap p-3 rounded-lg border border-border bg-muted">
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
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Kanban Settings */}
            <div className="space-y-3 pt-2 border-t border-border">
              <Label className="text-sm font-semibold text-foreground">
                Kanban & Workflow Stages
              </Label>
              <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/40">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="wipLimitTodo" className="text-xs font-medium text-muted-foreground">
                      WIP Limit (To Do)
                    </Label>
                    <Input
                      id="wipLimitTodo"
                      type="number"
                      min={1}
                      max={100}
                      placeholder="Optional"
                      defaultValue={project?.settings?.wipLimits?.TODO ?? ''}
                      name="wipLimitTodo"
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="wipLimitInProgress" className="text-xs font-medium text-muted-foreground">
                      WIP Limit (In Progress)
                    </Label>
                    <Input
                      id="wipLimitInProgress"
                      type="number"
                      min={1}
                      max={50}
                      defaultValue={project?.settings?.wipLimits?.IN_PROGRESS ?? 5}
                      name="wipLimitInProgress"
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="space-y-1">
                    <Label htmlFor="columnTitleTodo" className="text-[11px] font-medium text-muted-foreground">
                      Stage 1 Title
                    </Label>
                    <Input
                      id="columnTitleTodo"
                      name="columnTitleTodo"
                      placeholder="To Do"
                      defaultValue={project?.settings?.columnTitles?.TODO ?? ''}
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="columnTitleInProgress" className="text-[11px] font-medium text-muted-foreground">
                      Stage 2 Title
                    </Label>
                    <Input
                      id="columnTitleInProgress"
                      name="columnTitleInProgress"
                      placeholder="In Progress"
                      defaultValue={project?.settings?.columnTitles?.IN_PROGRESS ?? ''}
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="columnTitleCompleted" className="text-[11px] font-medium text-muted-foreground">
                      Stage 3 Title
                    </Label>
                    <Input
                      id="columnTitleCompleted"
                      name="columnTitleCompleted"
                      placeholder="Completed"
                      defaultValue={project?.settings?.columnTitles?.COMPLETED ?? ''}
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                </div>
              </div>
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
