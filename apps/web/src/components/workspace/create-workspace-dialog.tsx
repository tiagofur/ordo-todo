'use client';

import { useState } from 'react';
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
import { createWorkspaceSchema, generateSlug } from '@ordo-todo/core';

export interface CreateWorkspaceFormData {
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon: string;
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
      color?: string;
      icon?: string;
      name?: string;
      namePlaceholder?: string;
      description?: string;
      descriptionPlaceholder?: string;
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

const DEFAULT_LABELS = {
  title: 'Create Workspace',
  description: 'Create a new workspace to organize your projects and tasks.',
  form: {
    color: 'Color',
    icon: 'Icon',
    name: 'Name',
    namePlaceholder: 'Enter workspace name',
    description: 'Description',
    descriptionPlaceholder: 'Optional description...',
  },
  buttons: {
    cancel: 'Cancel',
    create: 'Create Workspace',
    creating: 'Creating...',
  },
  validation: {
    nameRequired: 'Name is required',
  },
};

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
  labels = {},
}: CreateWorkspaceDialogProps) {
  const t = {
    ...DEFAULT_LABELS,
    ...labels,
    form: { ...DEFAULT_LABELS.form, ...labels.form },
    buttons: { ...DEFAULT_LABELS.buttons, ...labels.buttons },
    validation: { ...DEFAULT_LABELS.validation, ...labels.validation },
  };

  const [selectedColor, setSelectedColor] = useState('#2563EB');
  const [selectedIcon, setSelectedIcon] = useState('🏠');

  const formSchema = createWorkspaceSchema.extend({
    name: z.string().min(1, t.validation.nameRequired),
  });

  type FormData = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleFormSubmit = async (data: FormData) => {
    try {
      const slug = generateSlug(data.name);
      await onSubmit({
        ...data,
        slug,
        color: selectedColor,
        icon: selectedIcon,
      });
      reset();
      setSelectedColor('#2563EB');
      setSelectedIcon('🏠');
    } catch (error) {
      console.error(error);
    }
  };

  const workspaceColors = [
    { name: 'Azul', value: '#2563EB' },
    { name: 'Púrpura', value: '#7C3AED' },
    { name: 'Rosa', value: '#DB2777' },
    { name: 'Rojo', value: '#DC2626' },
    { name: 'Naranja', value: '#EA580C' },
    { name: 'Amarillo', value: '#CA8A04' },
    { name: 'Verde', value: '#16A34A' },
    { name: 'Turquesa', value: '#0891B2' },
    { name: 'Gris', value: '#6B7280' },
  ];

  const workspaceIcons = ['🏠', '💼', '👥', '🚀', '🎯', '📊', '💡', '🔥', '⭐', '📁'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] gap-0 p-0 overflow-hidden bg-background border-border">
        <div className="p-6 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">
              {t.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t.description}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Color */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                {t.form.color}
              </Label>
              <div className="grid grid-cols-9 gap-2">
                {workspaceColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className="h-10 w-10 rounded-lg border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: color.value,
                      borderColor: selectedColor === color.value ? color.value : 'transparent',
                      opacity: selectedColor === color.value ? 1 : 0.6,
                    }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Icon */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                {t.form.icon}
              </Label>
              <div className="grid grid-cols-10 gap-2">
                {workspaceIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border-2 text-2xl transition-all hover:scale-110"
                    style={{
                      borderColor: selectedIcon === icon ? selectedColor : 'transparent',
                      backgroundColor: selectedIcon === icon ? `${selectedColor}15` : 'transparent',
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                {t.form.name}
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder={t.form.namePlaceholder}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-foreground"
              >
                {t.form.description}
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder={t.form.descriptionPlaceholder}
                className="min-h-[100px] resize-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                {t.buttons.cancel}
              </Button>
              <Button
                type="submit"
                disabled={isPending}
              >
                {isPending ? t.buttons.creating : t.buttons.create}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
