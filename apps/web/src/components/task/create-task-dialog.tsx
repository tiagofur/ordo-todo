'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createTaskSchema } from '@ordo-todo/hooks';
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
import { EmptyState } from '@/components/ui';
import { Briefcase, Sparkles, Calendar as CalendarIcon, Flag, Clock } from 'lucide-react';
import { RecurrenceSelector, RecurrenceValue } from './recurrence-selector';


interface ProjectOption {
  id: string;
  name: string;
}

interface CreateTaskFormData {
  title: string;
  description?: string;
  projectId: string;
  priority: string;
  dueDate?: string;
  estimatedMinutes?: number;
  recurrence?: RecurrenceValue;
}

interface CreateTaskDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Called when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Pre-selected project ID */
  projectId?: string;
  /** Available projects */
  projects?: ProjectOption[];
  /** Whether projects are loading */
  isLoadingProjects?: boolean;
  /** Called to request creating a new project (empty state action) */
  onRequestCreateProject?: () => void;
  /** Called when form is submitted */
  onSubmit: (data: CreateTaskFormData) => Promise<void> | void;
  /** Called to generate AI description */
  onGenerateAIDescription?: (title: string) => Promise<string>;
  /** Whether submission is pending */
  isPending?: boolean;
  /** Custom labels */
  labels?: {
    title?: string;
    description?: string;
    aiMagic?: string;
    aiGenerating?: string;
    formTitle?: string;
    formTitlePlaceholder?: string;
    formProject?: string;
    formSelectProject?: string;
    formDescription?: string;
    formDescriptionPlaceholder?: string;
    formPriority?: string;
    formEstimatedMinutes?: string;
    formDueDate?: string;
    priorities?: { low: string; medium: string; high: string };
    buttons?: { cancel: string; create: string; creating: string };
    emptyState?: { title: string; description: string; action: string };
    validation?: { titleRequired: string; projectRequired: string };
  };
}

const DEFAULT_LABELS = {
  title: 'Create Task',
  description: 'Add a new task to your project.',
  aiMagic: 'AI Magic',
  aiGenerating: 'Generating...',
  formTitle: 'Title',
  formTitlePlaceholder: 'What needs to be done?',
  formProject: 'Project',
  formSelectProject: 'Select a project',
  formDescription: 'Description',
  formDescriptionPlaceholder: 'Add details...',
  formPriority: 'Priority',
  formEstimatedMinutes: 'Est. Minutes',
  formDueDate: 'Due Date',
  priorities: { low: 'Low', medium: 'Medium', high: 'High' },
  buttons: { cancel: 'Cancel', create: 'Create Task', creating: 'Creating...' },
  emptyState: {
    title: 'No Projects Found',
    description: 'You need a project to create tasks.',
    action: 'Create Project',
  },
  validation: { titleRequired: 'Title is required', projectRequired: 'Project is required' },
};

export function CreateTaskDialog({
  open,
  onOpenChange,
  projectId,
  projects = [],
  isLoadingProjects = false,
  onRequestCreateProject,
  onSubmit,
  onGenerateAIDescription,
  isPending = false,
  labels = {},
}: CreateTaskDialogProps) {
  const t = { ...DEFAULT_LABELS, ...labels };
  const [isGenerating, setIsGenerating] = useState(false);

  // Schema extension for form validation
  const formSchema = createTaskSchema.extend({
    title: z.string().min(1, t.validation.titleRequired),
    projectId: z.string().min(1, t.validation.projectRequired),
    recurrence: z.object({
      pattern: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM']),
      interval: z.number().optional(),
      daysOfWeek: z.array(z.number()).optional(),
      dayOfMonth: z.number().optional(),
      endDate: z.date().optional(),
    }).optional(),
  });

  type CreateTaskForm = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTaskForm>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      priority: 'MEDIUM',
      projectId: projectId || '',
      recurrence: undefined,
    },
  });

  const currentPriority = watch('priority');

  const handleFormSubmit = async (data: CreateTaskForm) => {
    // Adapter for form data to output data
    const outputData: CreateTaskFormData = {
      title: data.title,
      description: data.description || undefined,
      projectId: data.projectId,
      priority: data.priority,
      estimatedMinutes: data.estimatedMinutes || undefined,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      recurrence: data.recurrence as RecurrenceValue | undefined,
    };

    try {
      await onSubmit(outputData);
      reset();
      onOpenChange(false);
    } catch (error) {
       console.error(error);
    }
  };

  const handleAIMagic = async () => {
    const title = watch('title');
    if (!title || !onGenerateAIDescription) return;

    setIsGenerating(true);
    try {
      const description = await onGenerateAIDescription(title);
      setValue('description', description);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const priorities = [
    { value: 'LOW', label: t.priorities.low, bg: 'bg-blue-500', border: 'border-blue-500' },
    { value: 'MEDIUM', label: t.priorities.medium, bg: 'bg-yellow-500', border: 'border-yellow-500' },
    { value: 'HIGH', label: t.priorities.high, bg: 'bg-red-500', border: 'border-red-500' },
  ];

  const showEmptyState = !projectId && !isLoadingProjects && projects.length === 0;

  if (showEmptyState) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px] gap-0 p-0 overflow-hidden bg-background border-border">
          <div className="p-6">
            <EmptyState
              icon={Briefcase}
              title={t.emptyState.title}
              description={t.emptyState.description}
              actionLabel={t.emptyState.action}
              onAction={() => {
                 onOpenChange(false);
                 onRequestCreateProject?.();
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] gap-0 p-0 overflow-hidden bg-background border-border">
        <div className="p-6 space-y-6">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-foreground">
                {t.title}
              </DialogTitle>
              {onGenerateAIDescription && (
                <button
                  type="button"
                  onClick={handleAIMagic}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors duration-200 disabled:opacity-50"
                >
                  <Sparkles
                    className={`w-3.5 h-3.5 ${
                      isGenerating ? 'animate-spin' : 'animate-pulse'
                    }`}
                  />
                  {isGenerating ? t.aiGenerating : t.aiMagic}
                </button>
              )}
            </div>
            <DialogDescription className="text-muted-foreground">
              {t.description}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(handleFormSubmit)(e);
            }}
            className="space-y-6"
          >
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-foreground">
                {t.formTitle}
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder={t.formTitlePlaceholder}
                autoFocus
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            {/* Project Selection (if not provided) */}
            {!projectId && (
              <div className="space-y-2">
                <Label htmlFor="projectId" className="text-sm font-medium text-foreground">
                  {t.formProject}
                </Label>
                <select
                  id="projectId"
                  {...register('projectId')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">{t.formSelectProject}</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                {errors.projectId && (
                  <p className="text-sm text-red-500">{errors.projectId.message}</p>
                )}
              </div>
            )}

            {/* Hidden project ID if provided */}
            {projectId && <input type="hidden" {...register('projectId')} />}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                {t.formDescription}
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                className="min-h-[100px] resize-none"
                placeholder={t.formDescriptionPlaceholder}
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">{t.formPriority}</Label>
              <div className="flex gap-2">
                {priorities.map((p) => {
                  const isSelected = currentPriority === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setValue('priority', p.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-colors duration-200 ${
                        isSelected
                          ? `${p.bg} text-white shadow-md shadow-black/10 scale-105`
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {isSelected && <Flag className="w-3 h-3 fill-current" />}
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Estimated Minutes */}
              <div className="space-y-2">
                <Label htmlFor="estimatedMinutes" className="text-sm font-medium text-foreground">
                  {t.formEstimatedMinutes}
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    id="estimatedMinutes"
                    {...register('estimatedMinutes', { valueAsNumber: true })}
                    min={1}
                    placeholder="30"
                    className="pr-10"
                  />
                  <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm font-medium text-foreground">
                  {t.formDueDate}
                </Label>
                <div className="relative">
                  <Input
                    type="date"
                    id="dueDate"
                    {...register('dueDate')}
                    autoComplete="off"
                    className="pr-10"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                  />
                  <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Recurrence */}
            <RecurrenceSelector
              value={watch('recurrence')}
              onChange={(val) => setValue('recurrence', val)}
            />

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
