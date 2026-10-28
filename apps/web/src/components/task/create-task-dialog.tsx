"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  CreateTaskDialog as SharedCreateTaskDialog,
  type CreateTaskFormData as SharedCreateTaskFormData,
  type CreateTaskDialogLabels,
  type ProjectOption,
} from "@ordo-todo/ui";
import { Sparkles } from "lucide-react";
import { serializeCalendarDateForApi } from "@ordo-todo/core";
import { useProject, useWorkspaceMembers, useProjects } from "@/lib/api-hooks";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { RecurrenceSelector, RecurrenceValue } from "./recurrence-selector";

export type { ProjectOption };
export interface CreateTaskFormData
  extends Omit<SharedCreateTaskFormData, "recurrence"> {
  recurrence?: RecurrenceValue;
}

export interface CreateTaskDialogProps {
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
  /** Called to request creating a new project */
  onRequestCreateProject?: () => void;
  /** Called when form is submitted */
  onSubmit: (data: CreateTaskFormData) => Promise<void> | void;
  /** Called to generate AI description */
  onGenerateAIDescription?: (title: string) => Promise<string>;
  /** Whether submission is pending */
  isPending?: boolean;
  /** Custom labels */
  labels?: Partial<CreateTaskDialogLabels>;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  projectId,
  projects: propProjects,
  onRequestCreateProject,
  onSubmit,
  onGenerateAIDescription,
  isPending = false,
  labels = {},
}: CreateTaskDialogProps) {
  const t = useTranslations("CreateTask");
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || "");
  const [recurrence, setRecurrence] = useState<RecurrenceValue | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedWorkspaceId = useWorkspaceStore((state) => state.selectedWorkspaceId);
  const { data: fetchedProjects } = useProjects(selectedWorkspaceId || "");
  const projects = useMemo(() => {
    if (propProjects && propProjects.length > 0) return propProjects;
    return (
      fetchedProjects?.map((p: any) => ({
        id: p.id,
        name: p.name,
        color: p.color,
      })) || []
    );
  }, [propProjects, fetchedProjects]);

  const activeProjectId = projectId || selectedProjectId;
  const { data: selectedProject } = useProject(activeProjectId || "");
  const { data: workspaceMembers = [] } = useWorkspaceMembers(
    selectedProject?.workspaceId ?? ""
  );

  // Helper that uses next-intl translation if available, or falls back to English default
  const resolve = (key: string, fallback: string): string => {
    try {
      const val = t(key);
      if (val && val !== key) return val;
    } catch {
      // ignore
    }
    return fallback;
  };

  const resolvedLabels: CreateTaskDialogLabels = {
    title: resolve("title", "Create Task"),
    description: resolve("description", "Add a new task to your project."),
    formTitle: resolve("formTitle", "Title"),
    formTitlePlaceholder: resolve("formTitlePlaceholder", "What needs to be done?"),
    formProject: resolve("formProject", "Project"),
    formNoProject: resolve("formNoProject", "No project (express)"),
    formCreateProject: resolve("formCreateProject", "Create new project"),
    formDescription: resolve("formDescription", "Description"),
    formDescriptionPlaceholder: resolve("formDescriptionPlaceholder", "Add details..."),
    formPriority: resolve("formPriority", "Priority"),
    formAssignee: resolve("formAssignee", "Assign to"),
    formUnassigned: resolve("formUnassigned", "Unassigned"),
    formEstimatedMinutes: resolve("formEstimatedMinutes", "Est. Minutes"),
    formDueDate: resolve("formDueDate", "Due Date"),
    formRecurrence: resolve("formRecurrence", "Recurrence"),
    formCustomFields: resolve("formCustomFields", "Custom fields"),
    cancel: resolve("cancel", "Cancel"),
    create: resolve("create", "Create Task"),
    creating: resolve("creating", "Creating..."),
    priorities: {
      low: resolve("priorities.low", "Low"),
      medium: resolve("priorities.medium", "Medium"),
      high: resolve("priorities.high", "High"),
      urgent: resolve("priorities.urgent", "Urgent"),
    },
    validation: {
      titleRequired: resolve("validation.titleRequired", "Title is required"),
    },
    ...labels,
  };

  const handleFormSubmit = async (data: SharedCreateTaskFormData) => {
    try {
      await onSubmit({
        ...data,
        dueDate: data.dueDate ? (serializeCalendarDateForApi(data.dueDate) as any) : undefined,
        recurrence,
      });
      setRecurrence(undefined);
      onOpenChange(false);
    } catch {
      toast.error(resolve("createError", "Error al crear la tarea"));
    }
  };

  return (
    <SharedCreateTaskDialog
      open={open}
      onOpenChange={onOpenChange}
      projectId={projectId}
      projects={projects}
      onProjectChange={setSelectedProjectId}
      onRequestCreateProject={onRequestCreateProject}
      assignableMembers={workspaceMembers}
      onSubmit={handleFormSubmit}
      isPending={isPending}
      labels={resolvedLabels}
      descriptionActions={
        onGenerateAIDescription
          ? ({ setValue, getValues }) => (
              <button
                type="button"
                onClick={async () => {
                  const title = getValues("title");
                  if (!title) return;
                  setIsGenerating(true);
                  try {
                    const desc = await onGenerateAIDescription(title);
                    setValue("description", desc);
                  } catch {
                    toast.error(resolve("createError", "Error al generar descripción"));
                  } finally {
                    setIsGenerating(false);
                  }
                }}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-500/10 rounded-full hover:bg-purple-500/20 transition-colors disabled:opacity-50"
              >
                <Sparkles
                  className={`w-3.5 h-3.5 ${
                    isGenerating ? "animate-spin" : "animate-pulse"
                  }`}
                />
                <span>
                  {isGenerating
                    ? resolve("aiGenerating", "Generating...")
                    : resolve("aiMagic", "AI Magic")}
                </span>
              </button>
            )
          : undefined
      }
      recurrenceNode={
        <RecurrenceSelector
          value={recurrence}
          onChange={setRecurrence}
        />
      }
    />
  );
}
