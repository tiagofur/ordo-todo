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
  Label,
  Input,
  Textarea,
  Button,
} from '@ordo-todo/ui';
import { Building2, Home, Users } from 'lucide-react';
import { createWorkspaceSchema, generateSlug } from '@ordo-todo/core';

export interface CreateWorkspaceFormData {
  name: string;
  slug: string;
  description?: string;
  type: 'PERSONAL' | 'WORK' | 'TEAM';
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
      type?: string;
      name?: string;
      namePlaceholder?: string;
      description?: string;
      descriptionPlaceholder?: string;
    };
    types?: {
      personal?: string;
      personalDesc?: string;
      work?: string;
      workDesc?: string;
      team?: string;
      teamDesc?: string;
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
    type: 'Workspace Type',
    name: 'Name',
    namePlaceholder: 'Enter workspace name',
    description: 'Description',
    descriptionPlaceholder: 'Optional description...',
  },
  types: {
    personal: 'Personal',
    personalDesc: 'For personal projects',
    work: 'Work',
    workDesc: 'For professional work',
    team: 'Team',
    teamDesc: 'For team collaboration',
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
    types: { ...DEFAULT_LABELS.types, ...labels.types },
    buttons: { ...DEFAULT_LABELS.buttons, ...labels.buttons },
    validation: { ...DEFAULT_LABELS.validation, ...labels.validation },
  };

  const [selectedType, setSelectedType] = useState<'PERSONAL' | 'WORK' | 'TEAM'>('PERSONAL');

  const formSchema = createWorkspaceSchema.extend({
    name: z.string().min(1, t.validation.nameRequired),
  });

  type FormData = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'PERSONAL',
    },
  });

  const handleFormSubmit = async (data: FormData) => {
    try {
      const slug = generateSlug(data.name);
      await onSubmit({
        ...data,
        slug,
        type: selectedType,
      });
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const workspaceTypes = [
    {
      value: 'PERSONAL' as const,
      label: t.types.personal,
      description: t.types.personalDesc,
      icon: Home,
      color: '#06b6d4',
      bgColor: 'bg-cyan-500/10',
      textColor: 'text-cyan-500',
      borderColor: 'border-cyan-500',
    },
    {
      value: 'WORK' as const,
      label: t.types.work,
      description: t.types.workDesc,
      icon: Building2,
      color: '#a855f7',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-500',
      borderColor: 'border-purple-500',
    },
    {
      value: 'TEAM' as const,
      label: t.types.team,
      description: t.types.teamDesc,
      icon: Users,
      color: '#ec4899',
      bgColor: 'bg-pink-500/10',
      textColor: 'text-pink-500',
      borderColor: 'border-pink-500',
    },
  ];

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
            {/* Workspace Type */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                {t.form.type}
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {workspaceTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setSelectedType(type.value);
                        setValue('type', type.value);
                      }}
                      className={`flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 ${
                        isSelected
                          ? `${type.borderColor} ${type.bgColor} shadow-lg`
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 ${
                          isSelected ? type.bgColor : 'bg-muted'
                        }`}
                        style={
                          isSelected ? { backgroundColor: `${type.color}20` } : {}
                        }
                      >
                        <Icon
                          className={`w-6 h-6 transition-all duration-200 ${
                            isSelected ? type.textColor : 'text-muted-foreground'
                          }`}
                          style={isSelected ? { color: type.color } : {}}
                        />
                      </div>
                      <div className="text-center space-y-1">
                        <p
                          className={`text-sm font-semibold ${
                            isSelected ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {type.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-tight px-1">
                          {type.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
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
