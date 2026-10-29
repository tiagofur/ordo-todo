"use client";

import * as React from "react";
import { useForm, type UseFormSetValue, type UseFormGetValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, Flag, FolderKanban, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog.js";
import { Label } from "../ui/label.js";
import { Input } from "../ui/input.js";
import { Textarea } from "../ui/textarea.js";
import { Button } from "../ui/button.js";
import { cn } from "../../utils/index.js";

export type TaskPriorityValue = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface CreateTaskDialogLabels {
  title?: string;
  description?: string;
  formTitle?: string;
  formTitlePlaceholder?: string;
  formProject?: string;
  formNoProject?: string;
  formCreateProject?: string;
  formDescription?: string;
  formDescriptionPlaceholder?: string;
  formPriority?: string;
  formAssignee?: string;
  formUnassigned?: string;
  formEstimatedMinutes?: string;
  formDueDate?: string;
  formRecurrence?: string;
  formCustomFields?: string;
  priorities?: {
    low?: string;
    medium?: string;
    high?: string;
    urgent?: string;
  };
  cancel?: string;
  create?: string;
  creating?: string;
  validation?: {
    titleRequired?: string;
  };
}

export const DEFAULT_CREATE_TASK_LABELS: Required<
  Omit<CreateTaskDialogLabels, "priorities" | "validation">
> & {
  priorities: Required<NonNullable<CreateTaskDialogLabels["priorities"]>>;
  validation: Required<NonNullable<CreateTaskDialogLabels["validation"]>>;
} = {
  title: "Create task",
  description: "Add a new task to your project.",
  formTitle: "Title",
  formTitlePlaceholder: "What needs to be done?",
  formProject: "Project",
  formNoProject: "No project (express)",
  formCreateProject: "Create new project",
  formDescription: "Description",
  formDescriptionPlaceholder: "Add details about this task...",
  formPriority: "Priority",
  formAssignee: "Assign to",
  formUnassigned: "Unassigned",
  formEstimatedMinutes: "Est. minutes",
  formDueDate: "Due date",
  formRecurrence: "Recurrence",
  formCustomFields: "Custom fields",
  priorities: {
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
  },
  cancel: "Cancel",
  create: "Create task",
  creating: "Creating...",
  validation: {
    titleRequired: "Title is required",
  },
};

export interface TaskRecurrenceValue {
  pattern: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
  interval?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number | null;
  endDate?: Date | string | null;
}

export interface CreateTaskFormData {
  title: string;
  description?: string;
  projectId?: string;
  priority: TaskPriorityValue;
  dueDate?: string;
  estimatedMinutes?: number;
  recurrence?: TaskRecurrenceValue | null;
  assigneeId?: string;
}

export interface FormActionHelpers {
  setValue: UseFormSetValue<CreateTaskFormData>;
  getValues: UseFormGetValues<CreateTaskFormData>;
}

export type ActionSlot =
  | React.ReactNode
  | ((helpers: FormActionHelpers) => React.ReactNode);

export interface ProjectOption {
  id: string;
  name: string;
  color?: string;
}

export interface AssignableMember {
  id: string;
  user?: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  } | null;
}

export interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  projects?: ProjectOption[];
  onProjectChange?: (projectId: string) => void;
  onRequestCreateProject?: () => void;
  assignableMembers?: AssignableMember[];
  /** ODD 024: valores iniciales de captura (prefill de página/selección). */
  initialTitle?: string;
  initialDescription?: string;
  onSubmit: (data: CreateTaskFormData) => Promise<void> | void;
  isPending?: boolean;
  labels?: CreateTaskDialogLabels;
  headerActions?: ActionSlot;
  titleActions?: ActionSlot;
  descriptionActions?: ActionSlot;
  autoEstimateAction?: ActionSlot;
  recurrenceNode?: React.ReactNode;
  customFieldsNode?: React.ReactNode;
  formError?: string | null;
}

const PRIORITIES: Array<{
  value: TaskPriorityValue;
  key: keyof NonNullable<CreateTaskDialogLabels["priorities"]>;
  activeClass: string;
  flagColor: string;
}> = [
  {
    value: "LOW",
    key: "low",
    activeClass: "bg-blue-600 text-white border-blue-600 shadow-sm",
    flagColor: "text-blue-500",
  },
  {
    value: "MEDIUM",
    key: "medium",
    activeClass: "bg-amber-500 text-white border-amber-500 shadow-sm",
    flagColor: "text-yellow-500",
  },
  {
    value: "HIGH",
    key: "high",
    activeClass: "bg-orange-600 text-white border-orange-600 shadow-sm",
    flagColor: "text-orange-500",
  },
  {
    value: "URGENT",
    key: "urgent",
    activeClass: "bg-red-600 text-white border-red-600 shadow-sm",
    flagColor: "text-red-500",
  },
];

export function CreateTaskDialog({
  open,
  onOpenChange,
  projectId,
  projects = [],
  onProjectChange,
  onRequestCreateProject,
  assignableMembers = [],
  initialTitle,
  initialDescription,
  onSubmit,
  isPending = false,
  labels = {},
  headerActions,
  titleActions,
  descriptionActions,
  autoEstimateAction,
  recurrenceNode,
  customFieldsNode,
  formError,
}: CreateTaskDialogProps) {
  const t = {
    ...DEFAULT_CREATE_TASK_LABELS,
    ...labels,
    priorities: {
      ...DEFAULT_CREATE_TASK_LABELS.priorities,
      ...(labels.priorities ?? {}),
    },
    validation: {
      ...DEFAULT_CREATE_TASK_LABELS.validation,
      ...(labels.validation ?? {}),
    },
  };

  const formSchema = React.useMemo(
    () =>
      z.object({
        title: z.string().trim().min(1, t.validation.titleRequired),
        description: z.string().optional(),
        projectId: z.string().optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
        dueDate: z.string().optional(),
        estimatedMinutes: z
          .preprocess(
            (val) =>
              val === "" || val === undefined || val === null || isNaN(Number(val))
                ? undefined
                : Math.round(Number(val)),
            z.number().int().min(1).optional()
          ),
        assigneeId: z.string().optional(),
      }),
    [t.validation.titleRequired]
  );

  type FormValues = {
    title: string;
    description?: string;
    projectId?: string;
    priority: TaskPriorityValue;
    dueDate?: string;
    estimatedMinutes?: number;
    assigneeId?: string;
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: initialTitle ?? "",
      description: initialDescription ?? "",
      projectId: projectId || "",
      priority: "MEDIUM",
      dueDate: "",
      estimatedMinutes: undefined,
      assigneeId: "",
    },
  });

  const currentPriority = watch("priority");
  const watchedProjectId = watch("projectId");

  // Keep form projectId aligned when caller provides or updates it
  React.useEffect(() => {
    if (open) {
      if (projectId) {
        setValue("projectId", projectId);
      }
    } else {
      reset();
    }
  }, [open, projectId, setValue, reset]);

  const formHelpers: FormActionHelpers = React.useMemo(
    () => ({
      setValue: (name, value, options) =>
        setValue(name as keyof FormValues, value as any, options),
      getValues: (field?: any) => getValues(field) as any,
    }),
    [setValue, getValues]
  );

  const renderSlot = (slot?: ActionSlot) => {
    if (!slot) return null;
    if (typeof slot === "function") {
      return slot(formHelpers);
    }
    return slot;
  };

  const handleFormSubmit = async (data: FormValues) => {
    const formatted: CreateTaskFormData = {
      title: data.title,
      description: data.description ? data.description.trim() : undefined,
      projectId: data.projectId || undefined,
      priority: data.priority,
      dueDate: data.dueDate ? data.dueDate : undefined,
      estimatedMinutes: data.estimatedMinutes,
      assigneeId: data.assigneeId || undefined,
    };
    await onSubmit(formatted);
  };

  const assignableUsers = React.useMemo(
    () => assignableMembers.filter((m) => !!m.user),
    [assignableMembers]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[92vh] flex flex-col gap-0 p-0 overflow-hidden bg-background border-border shadow-2xl">
        <div className="p-6 pb-4 border-b border-border shrink-0">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <DialogTitle className="text-xl font-semibold text-foreground tracking-tight">
                  {t.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {t.description}
                </DialogDescription>
              </div>
              {renderSlot(headerActions)}
            </div>
          </DialogHeader>
        </div>

        <form
          id="unified-create-task-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {formError && (
            <div
              role="alert"
              className="p-3 text-xs rounded-lg border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 font-medium"
            >
              {formError}
            </div>
          )}

          {/* Title input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <Label
                  htmlFor="create-task-title"
                  className="text-xs font-semibold text-foreground"
                >
                  {t.formTitle}
                </Label>
                <span className="text-red-500 text-xs font-bold leading-none" aria-hidden="true">
                  *
                </span>
              </div>
              {renderSlot(titleActions)}
            </div>
            <Input
              id="create-task-title"
              {...register("title")}
              placeholder={t.formTitlePlaceholder}
              autoFocus
              aria-required="true"
              aria-invalid={!!errors.title}
              className={cn(
                "h-10 text-sm bg-background border-input",
                "focus-visible:ring-2 focus-visible:ring-purple-500 dark:focus-visible:ring-purple-400 focus-visible:outline-none",
                errors.title && "border-red-500 focus-visible:ring-red-500"
              )}
            />
            {errors.title && (
              <p
                id="create-task-title-error"
                role="alert"
                className="text-xs text-red-500 font-medium"
              >
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Project selector */}
          {!projectId ? (
            <div className="space-y-1.5">
              <Label
                htmlFor="create-task-project"
                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
              >
                <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{t.formProject}</span>
              </Label>
              <div className="flex items-center gap-2">
                <select
                  id="create-task-project"
                  {...register("projectId")}
                  onChange={(e) => {
                    register("projectId").onChange(e);
                    onProjectChange?.(e.target.value);
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:focus-visible:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">{t.formNoProject}</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                {onRequestCreateProject && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={onRequestCreateProject}
                    title={t.formCreateProject}
                    className="h-10 w-10 shrink-0 border-input hover:bg-accent"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <input type="hidden" {...register("projectId")} />
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label
                htmlFor="create-task-description"
                className="text-xs font-semibold text-foreground"
              >
                {t.formDescription}
              </Label>
              {renderSlot(descriptionActions)}
            </div>
            <Textarea
              id="create-task-description"
              {...register("description")}
              placeholder={t.formDescriptionPlaceholder}
              className="min-h-[90px] text-sm resize-none bg-background border-input focus-visible:ring-2 focus-visible:ring-purple-500 dark:focus-visible:ring-purple-400 focus-visible:outline-none"
            />
          </div>

          {/* Priority & Estimation row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority buttons */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{t.formPriority}</span>
              </Label>
              <div
                role="radiogroup"
                aria-label={t.formPriority}
                className="grid grid-cols-4 gap-1.5"
              >
                {PRIORITIES.map((p) => {
                  const isSelected = currentPriority === p.value;
                  const labelText = t.priorities[p.key] || p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setValue("priority", p.value)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer",
                        isSelected
                          ? p.activeClass
                          : "bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                      )}
                      title={labelText}
                    >
                      <Flag
                        className={cn(
                          "w-3.5 h-3.5 shrink-0",
                          isSelected ? "fill-current" : p.flagColor
                        )}
                      />
                      <span className="text-[11px] truncate max-w-full">
                        {labelText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Estimation */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label
                  htmlFor="create-task-est-minutes"
                  className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                >
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{t.formEstimatedMinutes}</span>
                </Label>
                {renderSlot(autoEstimateAction)}
              </div>
              <div className="relative">
                <Input
                  id="create-task-est-minutes"
                  type="number"
                  min={1}
                  placeholder="30"
                  {...register("estimatedMinutes")}
                  className="pr-9 text-sm bg-background border-input focus-visible:ring-2 focus-visible:ring-purple-500 dark:focus-visible:ring-purple-400 focus-visible:outline-none"
                />
                <Clock className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <Label
              htmlFor="create-task-due-date"
              className="text-xs font-semibold text-foreground flex items-center gap-1.5"
            >
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{t.formDueDate}</span>
            </Label>
            <div className="relative">
              <Input
                id="create-task-due-date"
                type="date"
                {...register("dueDate")}
                className="pr-9 text-sm bg-background border-input focus-visible:ring-2 focus-visible:ring-purple-500 dark:focus-visible:ring-purple-400 focus-visible:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                  }
                }}
              />
              <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* Assignee (rendered when >1 member available) */}
          {assignableUsers.length > 1 && (
            <div className="space-y-1.5">
              <Label
                htmlFor="create-task-assignee"
                className="text-xs font-semibold text-foreground"
              >
                {t.formAssignee}
              </Label>
              <select
                id="create-task-assignee"
                {...register("assigneeId")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:focus-visible:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">{t.formUnassigned}</option>
                {assignableUsers.map((m) => {
                  const u = m.user!;
                  return (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Recurrence node slot */}
          {recurrenceNode && (
            <div className="space-y-1.5 pt-1 border-t border-border/50">
              {recurrenceNode}
            </div>
          )}

          {/* Custom fields slot (only when project is selected) */}
          {watchedProjectId && customFieldsNode && (
            <div className="space-y-1.5 pt-1 border-t border-border/50">
              <Label className="text-xs font-semibold text-foreground">
                {t.formCustomFields}
              </Label>
              {customFieldsNode}
            </div>
          )}
        </form>

        <DialogFooter className="p-4 border-t border-border bg-muted/20 shrink-0 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {t.cancel}
          </Button>
          <Button
            type="submit"
            form="unified-create-task-form"
            disabled={isPending}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm shadow-sm transition-colors border-0 disabled:opacity-50"
          >
            {isPending ? t.creating : t.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
