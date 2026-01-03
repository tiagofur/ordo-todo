'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '../ui/label.js';
import { Palette, Check, Archive, Trash2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog.js';

import { PROJECT_COLORS, updateProjectSchema } from '@ordo-todo/core';

interface ProjectSettingsProps {
  project: {
    id: string;
    name: string;
    description?: string | null;
    color: string;
    archived?: boolean;
    slug?: string;
  };
  onUpdate: (projectId: string, data: Record<string, unknown>) => Promise<void> | void;
  onArchive: (projectId: string) => Promise<void> | void;
  onDelete: (projectId: string) => Promise<void> | void;
  isUpdating?: boolean;
  isArchiving?: boolean;
  isDeleting?: boolean;
  labels?: {
    general?: { title: string; description: string };
    form?: {
      name: { label: string; placeholder: string; required: string };
      description: { label: string; placeholder: string };
      color: { label: string };
    };
    danger?: {
      title: string;
      description: string;
      archive: { title: string; description: string };
      unarchive: { title: string; description: string };
      delete: { title: string; description: string };
    };
    actions?: {
      save: string;
      saving: string;
      archive: string;
      unarchive: string;
      delete: string;
    };
    deleteDialog?: {
      title: string;
      description: string;
      cancel: string;
      confirm: string;
    };
  };
}

const DEFAULT_LABELS = {
  general: {
    title: 'General Settings',
    description: 'Manage your project settings and preferences.',
  },
  form: {
    name: {
      label: 'Project Name',
      placeholder: 'Enter project name',
      required: 'Project name is required',
    },
    description: {
      label: 'Description',
      placeholder: 'Enter project description',
    },
    color: { label: 'Color' },
  },
  danger: {
    title: 'Danger Zone',
    description: 'Irreversible and destructive actions.',
    archive: {
      title: 'Archive Project',
      description: 'Archived projects are hidden from the dashboard but not deleted.',
    },
    unarchive: {
      title: 'Unarchive Project',
      description: 'Restore this project to the dashboard.',
    },
    delete: {
      title: 'Delete Project',
      description: 'Permanently delete this project and all its tasks.',
    },
  },
  actions: {
    save: 'Save Changes',
    saving: 'Saving...',
    archive: 'Archive',
    unarchive: 'Unarchive',
    delete: 'Delete Project',
  },
  deleteDialog: {
    title: 'Are you absolutely sure?',
    description:
      'This action cannot be undone. This will permanently delete your project and remove your data from our servers.',
    cancel: 'Cancel',
    confirm: 'Delete',
  },
};

export function ProjectSettings({
  project,
  onUpdate,
  onArchive,
  onDelete,
  isUpdating = false,
  isArchiving = false,
  isDeleting = false,
  labels = {},
}: ProjectSettingsProps) {
  // Deep merge labels
  const t = {
    ...DEFAULT_LABELS,
    ...labels,
    general: { ...DEFAULT_LABELS.general, ...labels.general },
    form: {
      name: { ...DEFAULT_LABELS.form.name, ...labels.form?.name },
      description: {
        ...DEFAULT_LABELS.form.description,
        ...labels.form?.description,
      },
      color: { ...DEFAULT_LABELS.form.color, ...labels.form?.color },
    },
    danger: {
      ...DEFAULT_LABELS.danger,
      ...labels.danger,
      archive: { ...DEFAULT_LABELS.danger.archive, ...labels.danger?.archive },
      unarchive: {
        ...DEFAULT_LABELS.danger.unarchive,
        ...labels.danger?.unarchive,
      },
      delete: { ...DEFAULT_LABELS.danger.delete, ...labels.danger?.delete },
    },
    actions: { ...DEFAULT_LABELS.actions, ...labels.actions },
    deleteDialog: {
      ...DEFAULT_LABELS.deleteDialog,
      ...labels.deleteDialog,
    },
  };

  const [selectedColor, setSelectedColor] = useState(
    project.color || PROJECT_COLORS[3]
  );

  const formSchema = updateProjectSchema.extend({
    name: z.string().min(1, t.form.name.required),
  });

  type UpdateProjectForm = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProjectForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project.name,
      description: project.description || '',
      color: project.color,
    },
  });

  useEffect(() => {
    reset({
      name: project.name,
      description: project.description || '',
      color: project.color,
    });
    setSelectedColor(project.color || PROJECT_COLORS[3]);
  }, [project, reset]);

  const onSubmit = async (data: UpdateProjectForm) => {
    try {
      await onUpdate(project.id, {
        ...data,
        color: selectedColor,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleArchive = async () => {
    try {
      await onArchive(project.id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(project.id);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      {/* General Settings */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">{t.general.title}</h3>
          <p className="text-sm text-muted-foreground">
            {t.general.description}
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Color Picker */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Palette className="w-4 h-4" /> {t.form.color.label}
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
            <Label
              htmlFor="name"
              className="text-sm font-medium text-foreground"
            >
              {t.form.name.label}
            </Label>
            <input
              id="name"
              {...register('name')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={t.form.name.placeholder}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-foreground"
            >
              {t.form.description.label}
            </Label>
            <textarea
              id="description"
              {...register('description')}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder={t.form.description.placeholder}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                isUpdating || (!isDirty && selectedColor === project.color)
              }
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {isUpdating ? t.actions.saving : t.actions.save}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-destructive/50 bg-card text-card-foreground shadow-sm">
        <div className="p-6 border-b border-destructive/50">
          <h3 className="text-lg font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {t.danger.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t.danger.description}
          </p>
        </div>
        <div className="p-6 space-y-4">
          {/* Archive */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
            <div>
              <h4 className="font-medium">
                {project.archived
                  ? t.danger.unarchive.title
                  : t.danger.archive.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                {project.archived
                  ? t.danger.unarchive.description
                  : t.danger.archive.description}
              </p>
            </div>
            <button
              onClick={handleArchive}
              disabled={isArchiving}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2"
            >
              <Archive className="w-4 h-4" />
              {project.archived ? t.actions.unarchive : t.actions.archive}
            </button>
          </div>

          {/* Delete */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
            <div>
              <h4 className="font-medium text-destructive">
                {t.danger.delete.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t.danger.delete.description}
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2 gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t.actions.delete}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.deleteDialog.title}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.deleteDialog.description}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.deleteDialog.cancel}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t.deleteDialog.confirm}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
