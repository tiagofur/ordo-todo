"use client";

import { useState, useEffect } from "react";
import { Label, EmptyState, ScrollArea, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@ordo-todo/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useWorkspaces,
  useWorkflows,
  useCreateProject,
  useCreateWorkflow,
  useCreateTask,
} from "@/lib/api-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Briefcase, Palette, LayoutTemplate } from "lucide-react";
import { useTranslations } from "next-intl";
import { PROJECT_TEMPLATES, ProjectTemplate } from "@/data/project-templates";
import { getErrorMessage } from "@/lib/error-handler";
import type { Workspace, Workflow } from "@ordo-todo/api-client";

import { TAG_COLORS, createProjectSchema } from "@ordo-todo/core";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  workspaceId,
}: CreateProjectDialogProps) {
  const t = useTranslations("CreateProjectDialog");
  const queryClient = useQueryClient();
  const [selectedColor, setSelectedColor] = useState<typeof TAG_COLORS[number]>(TAG_COLORS[3]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ProjectTemplate | null>(null);

  const createWorkflowMutation = useCreateWorkflow();
  const createTaskMutation = useCreateTask();

  // Fetch workspaces if not provided (to check if any exist)
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useWorkspaces();

  // Extend core schema with localized error messages
  const formSchema = createProjectSchema.extend({
    name: z.string().min(1, t("validation.nameRequired")),
    workspaceId: z.string().min(1, t("validation.workspaceRequired")),
  });

  type CreateProjectForm = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProjectForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workspaceId: workspaceId || "",
      color: TAG_COLORS[3],
      workflowId: "",
    },
  });

  const selectedWorkspaceId = watch("workspaceId");

  // Fetch workflows for the selected workspace
  const { data: workflows } = useWorkflows(selectedWorkspaceId);

  // Update default workflow when workflows change
  useEffect(() => {
    if (workflows && workflows.length > 0) {
      const firstWorkflow = workflows[0];
      if (firstWorkflow?.id) {
        setValue("workflowId", String(firstWorkflow.id));
      }
    } else if (workflows && workflows.length === 0) {
      // If no workflows, set to NEW to pass validation (we'll handle creation in submit)
      setValue("workflowId", "NEW");
    }
  }, [workflows, setValue]);

  // If we fetched workspaces and found some, set the first one as default if none selected
  useEffect(() => {
    if (!workspaceId && workspaces && workspaces.length > 0) {
      setValue("workspaceId", String(workspaces[0].id));
    }
  }, [workspaces, workspaceId, setValue]);

  // Sync workspaceId prop to form value
  useEffect(() => {
    if (workspaceId) {
      setValue("workspaceId", workspaceId);
    }
  }, [workspaceId, setValue]);

  const createProjectMutation = useCreateProject();

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setValue("name", template.name);
    setValue("description", template.description);
    setSelectedColor(template.color as typeof TAG_COLORS[number]);
    setSelectedTemplate(template);
    setShowTemplates(false);
    toast.success(t("toast.templateSelected", { name: template.name }));
  };

  const onSubmit = async (data: CreateProjectForm) => {
    try {
      let finalWorkflowId = data.workflowId;

      // If no workflow ID provided (which is expected now as we removed the selector)
      if (!finalWorkflowId || finalWorkflowId === "NEW") {
        // 1. Try to find an existing "General" workflow in the current list
        const generalWorkflow = workflows?.find(
          (w: Workflow) => w.name === "General"
        );

        if (generalWorkflow) {
          finalWorkflowId = String(generalWorkflow.id);
        } else {
          // 2. If not found, create a new "General" workflow
          const newWorkflow = await createWorkflowMutation.mutateAsync({
            name: "General",
            workspaceId: data.workspaceId,
            color: "#3B82F6", // Default blue
            icon: "layers",
          });
          finalWorkflowId = String(newWorkflow.id);
        }
      }

      const newProject = await createProjectMutation.mutateAsync({
        name: data.name,
        description: data.description,
        workspaceId: data.workspaceId,
        workflowId: finalWorkflowId!, // We ensure it's set above
        color: selectedColor,
        startDate: data.startDate ?? undefined,
        dueDate: data.endDate ?? undefined, // Map endDate form field to dueDate DTO field
        // Slug is optional and will be generated by backend if not provided
      });

      // Create seed tasks if a template was selected
      if (selectedTemplate && selectedTemplate.tasks.length > 0) {
        const taskPromises = selectedTemplate.tasks.map((task) =>
          createTaskMutation.mutateAsync({
            title: task.title,
            description: task.description,
            priority: task.priority,
            projectId: String(newProject.id),
          })
        );

        await Promise.all(taskPromises);
        toast.success(
          t("toast.successWithTasks", { count: selectedTemplate.tasks.length })
        );
      } else {
        toast.success(t("toast.success"));
      }

      reset();
      setSelectedTemplate(null);
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error, t("toast.error")));
    }
  };

  const showEmptyState =
    !workspaceId && !isLoadingWorkspaces && workspaces?.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden bg-background border-border">
        <div className="p-6 pb-0">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-foreground">
                {t("title")}
              </DialogTitle>
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors duration-200"
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                {showTemplates ? "Hide Templates" : "Use Template"}
              </button>
            </div>
            <DialogDescription className="text-muted-foreground">
              {t("description")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6">

          {showEmptyState ? (
            <EmptyState
              icon={Briefcase}
              title={t("emptyState.title")}
              description={t("emptyState.description")}
              actionLabel={t("emptyState.action")}
              onAction={() => {
                onOpenChange(false);
                toast.info(t("toast.createWorkspace"));
              }}
            />
          ) : (
            <>
              {showTemplates && (
                <div className="bg-muted/30 rounded-lg border border-border p-4 mb-4">
                  <h4 className="text-sm font-medium mb-3">
                    {t("templates.title")}
                  </h4>
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="grid grid-cols-2 gap-3">
                      {PROJECT_TEMPLATES.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template)}
                          className="flex flex-col items-start gap-2 p-3 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <div
                              className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: `${template.color}20`,
                                color: template.color,
                              }}
                            >
                              <template.icon className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-sm truncate">
                              {template.name}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {template.description}
                          </p>
                          <div className="text-xs text-primary/70 font-medium">
                            {t("templates.tasksCount", {
                              count: template.tasks.length,
                            })}
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <form id="project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                {/* Color Picker */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Palette className="w-4 h-4" /> {t("form.color")}
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
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-foreground"
                  >
                    {t("form.name")}
                  </Label>
                  <input
                    id="name"
                    {...register("name")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={t("form.namePlaceholder")}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Workspace Selection (if not provided) */}
                {!workspaceId && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="workspaceId"
                      className="text-sm font-medium text-foreground"
                    >
                      {t("form.workspace")}
                    </Label>
                    <select
                      id="workspaceId"
                      {...register("workspaceId")}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {workspaces?.map((ws: Workspace) => (
                        <option key={ws.id} value={ws.id}>
                          {ws.name}
                        </option>
                      ))}
                    </select>
                    {errors.workspaceId && (
                      <p className="text-sm text-red-500">
                        {errors.workspaceId.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-foreground"
                  >
                    {t("form.description")}
                  </Label>
                  <textarea
                    id="description"
                    {...register("description")}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    placeholder={t("form.descriptionPlaceholder")}
                  />
                </div>

                {/* Hidden workspace ID if provided */}
                {workspaceId && (
                  <input type="hidden" {...register("workspaceId")} />
                )}
              </form>
            </>
          )}
        </div>

        {!showEmptyState && (
          <div className="p-6 pt-4 border-t bg-background">
            <DialogFooter>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("buttons.cancel")}
              </button>
              <button
                type="submit"
                form="project-form"
                disabled={createProjectMutation.isPending}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {createProjectMutation.isPending
                  ? t("buttons.creating")
                  : t("buttons.create")}
              </button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
