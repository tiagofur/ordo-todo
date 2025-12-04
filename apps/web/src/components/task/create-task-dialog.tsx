"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createTaskSchema } from "@ordo-todo/core";
import { useCreateTask, useAllProjects } from "@/lib/api-hooks";
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
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase, Sparkles, Calendar as CalendarIcon, Flag, Clock } from "lucide-react";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { useTranslations } from "next-intl";
import { RecurrenceSelector } from "./recurrence-selector";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}
export function CreateTaskDialog({ open, onOpenChange, projectId }: CreateTaskDialogProps) {
  const t = useTranslations('CreateTaskDialog');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: projects, isLoading: isLoadingProjects } = useAllProjects();

  const formSchema = createTaskSchema.extend({
    title: z.string().min(1, t('validation.titleRequired')),
    projectId: z.string().min(1, t('validation.projectRequired')),
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
    resolver: zodResolver(formSchema),
    defaultValues: {
      priority: "MEDIUM",
      projectId: projectId || "",
      recurrence: undefined,
    },
  });

  const currentPriority = watch("priority");

  const createTaskMutation = useCreateTask();

  const onSubmit = async (data: CreateTaskForm) => {
    try {
      await createTaskMutation.mutateAsync({
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      });
      notify.success(t('toast.success'));
      reset();
      onOpenChange(false);
    } catch (error: any) {
      notify.error(error?.message || t('toast.error'));
    }
  };

  const handleAIMagic = async () => {
    const title = watch("title");
    if (!title) {
      notify.error(t('toast.aiTitleRequired'));
      return;
    }

    setIsGenerating(true);
    // Simulate AI delay
    setTimeout(() => {
      setValue("description", t('ai.generatedDescription', { title }));
      setIsGenerating(false);
      notify.success(t('toast.aiSuccess'));
    }, 1500);
  };

  const priorities = [
    { value: "LOW", label: t('priorities.low'), bg: "bg-blue-500", border: "border-blue-500" },
    { value: "MEDIUM", label: t('priorities.medium'), bg: "bg-yellow-500", border: "border-yellow-500" },
    { value: "HIGH", label: t('priorities.high'), bg: "bg-red-500", border: "border-red-500" },
  ];

  const showEmptyState = !projectId && !isLoadingProjects && projects?.length === 0;

  if (showEmptyState) {
    return (
      <>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[550px] gap-0 p-0 overflow-hidden bg-background border-border">
            <div className="p-6">
              <EmptyState
                icon={Briefcase}
                title={t('emptyState.title')}
                description={t('emptyState.description')}
                actionLabel={t('emptyState.action')}
                onAction={() => setShowCreateProject(true)}
              />
            </div>
          </DialogContent>
        </Dialog>
        <CreateProjectDialog 
          open={showCreateProject} 
          onOpenChange={(open) => {
            setShowCreateProject(open);
            if (!open) onOpenChange(false); 
          }} 
        />
      </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] gap-0 p-0 overflow-hidden bg-background border-border">
        <div className="p-6 space-y-6">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-foreground">
                {t('title')}
              </DialogTitle>
              <button
                type="button"
                onClick={handleAIMagic}
                disabled={isGenerating}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors duration-200 disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : "animate-pulse"}`} />
                {isGenerating ? t('ai.generating') : t('ai.magic')}

              </button>
            </div>
            <DialogDescription className="text-muted-foreground">
              {t('description')}
            </DialogDescription>
          </DialogHeader>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(onSubmit)(e);
            }} 
            className="space-y-6"
          >
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-foreground">{t('form.title')}</Label>
              <input
                id="title"
                {...register("title")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t('form.titlePlaceholder')}
                autoFocus
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Project Selection (if not provided) */}
            {!projectId && (
              <div className="space-y-2">
                <Label htmlFor="projectId" className="text-sm font-medium text-foreground">{t('form.project')}</Label>
                <select
                  id="projectId"
                  {...register("projectId")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">{t('form.selectProject')}</option>
                  {projects?.map((project: any) => (
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
            {projectId && <input type="hidden" {...register("projectId")} />}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">{t('form.description')}</Label>
              <textarea
                id="description"
                {...register("description")}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder={t('form.descriptionPlaceholder')}
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">{t('form.priority')}</Label>
              <div className="flex gap-2">
                {priorities.map((p) => {
                  const isSelected = currentPriority === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setValue("priority", p.value as any)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-colors duration-200 ${
                        isSelected
                          ? `${p.bg} text-white shadow-md shadow-black/10 scale-105`
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
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
                <Label htmlFor="estimatedMinutes" className="text-sm font-medium text-foreground">{t('form.estimatedMinutes')}</Label>
                <div className="relative">
                  <input
                    type="number"
                    id="estimatedMinutes"
                    {...register("estimatedMinutes", { valueAsNumber: true })}
                    min="1"
                    placeholder="30"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm font-medium text-foreground">{t('form.dueDate')}</Label>
                <div className="relative">
                  <input
                    type="date"
                    id="dueDate"
                    {...register("dueDate")}
                    autoComplete="off"
                    onKeyDown={(e) => {
                      // Prevent Enter key from interfering
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                    onFocus={(e) => {
                      // Prevent auto-opening date picker on focus
                      e.target.blur();
                      setTimeout(() => e.target.focus(), 0);
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Recurrence */}
            <RecurrenceSelector
              value={watch("recurrence")}
              onChange={(val) => setValue("recurrence", val)}
            />

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('buttons.cancel')}
              </button>
              <button
                type="submit"
                disabled={createTaskMutation.isPending}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {createTaskMutation.isPending ? t('buttons.creating') : t('buttons.create')}
              </button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
