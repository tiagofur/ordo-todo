"use client";

import { useState } from "react";
import { Label, EmptyState, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Avatar, AvatarFallback, AvatarImage, Popover, PopoverContent, PopoverTrigger } from "@ordo-todo/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createTaskSchema } from "@ordo-todo/core";
import { useCreateTask, useAllProjects, useWorkspaceMembers } from "@/lib/api-hooks";
import { notify } from "@/lib/notify";
import { Briefcase, Sparkles, Calendar as CalendarIcon, Flag, Clock, User, Check, UserPlus } from "lucide-react";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { useTranslations } from "next-intl";
import { RecurrenceSelector } from "./recurrence-selector";
import { CustomFieldInputs, useCustomFieldForm } from "./custom-field-inputs";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { cn } from "@/lib/utils";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}
export function CreateTaskDialog({ open, onOpenChange, projectId }: CreateTaskDialogProps) {
  const t = useTranslations('CreateTaskDialog');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false);

  const { selectedWorkspaceId } = useWorkspaceStore();
  const { data: projects, isLoading: isLoadingProjects } = useAllProjects();
  const { data: members = [] } = useWorkspaceMembers(selectedWorkspaceId || "");

  // Only show assignee selector if workspace has more than 1 member
  const showAssigneeSelector = members.length > 1;

  // Get selected assignee from members
  const selectedAssignee = members.find((m: any) => m.user?.id === selectedAssigneeId);

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

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

  // Get selected project ID for custom fields (after watch is available)
  const selectedProjectId = projectId || watch("projectId");

  // Custom fields form state
  const customFieldsForm = useCustomFieldForm(selectedProjectId || "");

  const currentPriority = watch("priority");

  const createTaskMutation = useCreateTask();

  const onSubmit = async (data: CreateTaskForm) => {
    const { estimatedMinutes, ...taskData } = data;
    try {
      // Clean up null values to undefined for CreateTaskDto compatibility
      const cleanedData = {
        title: taskData.title,
        description: taskData.description || undefined,
        priority: taskData.priority,
        projectId: taskData.projectId,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        estimatedTime: estimatedMinutes ?? undefined,
        recurrence: taskData.recurrence,
        // Include assigneeId if selected (otherwise backend auto-assigns to creator)
        assigneeId: selectedAssigneeId || undefined,
      };
      const createdTask = await createTaskMutation.mutateAsync(cleanedData);

      // Save custom field values if any
      if (customFieldsForm.getValuesForSubmit().length > 0 && createdTask?.id) {
        await customFieldsForm.saveValues(createdTask.id);
      }

      notify.success(t('toast.success'));
      reset();
      setSelectedAssigneeId(null);
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
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden bg-background border-border">
        <div className="p-6 pb-0">
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
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          <form
            id="task-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(onSubmit)(e);
            }}
            className="space-y-6 py-4"
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

            {/* Assignee Selector - only show if workspace has multiple members */}
            {showAssigneeSelector && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('form.assignee') || 'Asignar a'}
                </Label>
                <Popover open={assigneePopoverOpen} onOpenChange={setAssigneePopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex h-10 w-full items-center gap-3 rounded-md border border-input bg-background px-3 py-2 text-sm",
                        "hover:bg-muted/50 transition-colors text-left"
                      )}
                    >
                      {selectedAssignee ? (
                        <>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={selectedAssignee.user?.image} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {getInitials(selectedAssignee.user?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1 truncate">
                            {selectedAssignee.user?.name || selectedAssignee.user?.email}
                          </span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {t('form.selectAssignee') || 'Seleccionar miembro (opcional)'}
                          </span>
                        </>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-2" align="start">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                        {t('form.workspaceMembers') || 'Miembros del workspace'}
                      </p>

                      {/* Option to not assign / auto-assign to me */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAssigneeId(null);
                          setAssigneePopoverOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors text-left",
                          !selectedAssigneeId ? "bg-primary/10 text-primary" : "hover:bg-muted/80"
                        )}
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                          <User className="h-3 w-3" />
                        </div>
                        <span className="text-sm">
                          {t('form.assignToMe') || 'Asignarme a mí (por defecto)'}
                        </span>
                        {!selectedAssigneeId && <Check className="h-4 w-4 ml-auto" />}
                      </button>

                      <div className="border-t border-border/50 my-1" />

                      {/* Members list */}
                      {members.map((member: any) => (
                        <button
                          type="button"
                          key={member.id}
                          onClick={() => {
                            setSelectedAssigneeId(member.user?.id);
                            setAssigneePopoverOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors text-left",
                            selectedAssigneeId === member.user?.id
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted/80"
                          )}
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.user?.image} />
                            <AvatarFallback
                              className={cn(
                                "text-xs",
                                selectedAssigneeId === member.user?.id
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              )}
                            >
                              {getInitials(member.user?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {member.user?.name || member.user?.email}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {member.role}
                            </p>
                          </div>
                          {selectedAssigneeId === member.user?.id && (
                            <Check className="h-4 w-4 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}

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

            {/* Custom Fields */}
            {selectedProjectId && (
              <CustomFieldInputs
                projectId={selectedProjectId}
                values={customFieldsForm.values}
                onChange={customFieldsForm.handleChange}
              />
            )}
          </form>
        </div>

        <div className="p-6 pt-4 border-t bg-background">
          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('buttons.cancel')}
            </button>
            <button
              type="submit"
              form="task-form"
              disabled={createTaskMutation.isPending}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {createTaskMutation.isPending ? t('buttons.creating') : t('buttons.create')}
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
