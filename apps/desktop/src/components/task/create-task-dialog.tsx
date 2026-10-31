import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  CreateTaskDialog as SharedCreateTaskDialog,
  type CreateTaskFormData,
  type CreateTaskDialogLabels,
  type ProjectOption,
  Button,
  Badge,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ordo-todo/ui";
import { Wand2, Sparkles, Tag, Check } from "lucide-react";
import {
  useCreateTask,
  useProjects,
  useProject,
  useWorkspaceMembers,
  useTags,
  useAssignTagToTask,
} from "@/lib/shared-hooks";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { parseTaskInput } from "@/utils/smart-capture";
import { TemplateSelector } from "./template-selector";
import { TaskTemplate } from "@/hooks/api";
import {
  formatCalendarDateInput,
  serializeCalendarDateForApi,
} from "@ordo-todo/core";
import {
  VoiceInputButton,
  type VoiceInputButtonLabels,
} from "@ordo-todo/ui";
import { CustomFieldInputs, useCustomFieldForm } from "./custom-field-inputs";

export type { CreateTaskFormData, ProjectOption };

export interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  projectId,
}: CreateTaskDialogProps) {
  const { t, i18n } = useTranslation();
  // ODD 025 S10: el dictado sigue la locale de la app, no un idioma fijo.
  const voiceLang =
    { es: "es-ES", en: "en-US", "pt-br": "pt-BR" }[i18n.language] ?? "es-ES";
  const voiceLabels: VoiceInputButtonLabels = {
    start: t("CreateTask.voice.start", "Voz"),
    stop: t("CreateTask.voice.stop", "Detener grabación"),
    listening: t("CreateTask.voice.listening", "Escuchando..."),
    transcribing: t("CreateTask.voice.transcribing", "Transcribiendo..."),
  };
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<
    string | undefined
  >(undefined);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projectId || ""
  );
  const [isEstimating, setIsEstimating] = useState(false);

  const selectedWorkspaceId = useWorkspaceStore(
    (state) => state.selectedWorkspaceId
  );
  const { data: rawProjects } = useProjects(selectedWorkspaceId || "");
  const projects = useMemo(
    () =>
      rawProjects?.map((p: any) => ({
        id: p.id,
        name: p.name,
        color: p.color,
      })) || [],
    [rawProjects]
  );

  const activeProjectId = projectId || selectedProjectId;
  const { data: currentProject } = useProject(activeProjectId || "");
  const { data: workspaceMembers = [] } = useWorkspaceMembers(
    currentProject?.workspaceId ?? ""
  );

  const customFieldsForm = useCustomFieldForm(activeProjectId || "");
  const createTask = useCreateTask();
  const assignTag = useAssignTagToTask();

  // ODD 025 S9: tags en el diálogo unificado. El DTO de creación no acepta
  // tags (forbidNonWhitelisted → 400): se asignan tras crear, igual que el
  // panel de detalle.
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const { data: availableTagsForProject } = useTags(
    currentProject?.workspaceId ?? selectedWorkspaceId ?? ""
  );
  const selectedTagObjects = (availableTagsForProject || []).filter((tag) =>
    selectedTagIds.includes(tag.id)
  );

  const labels: CreateTaskDialogLabels = {
    title: t("CreateTask.title", "Crear Tarea"),
    description: t(
      "CreateTask.description",
      "Añade una nueva tarea a tu proyecto."
    ),
    formTitle: t("CreateTask.formTitle", "Título"),
    formTitlePlaceholder: t(
      "CreateTask.formTitlePlaceholder",
      "¿Qué necesitas hacer?"
    ),
    formProject: t("CreateTask.formProject", "Proyecto"),
    formNoProject: t(
      "CreateTask.formNoProject",
      "Sin proyecto (express)"
    ),
    formCreateProject: t(
      "CreateTask.formCreateProject",
      "Crear nuevo proyecto"
    ),
    formDescription: t("CreateTask.formDescription", "Descripción"),
    formDescriptionPlaceholder: t(
      "CreateTask.formDescriptionPlaceholder",
      "Agrega detalles sobre esta tarea..."
    ),
    formPriority: t("CreateTask.formPriority", "Prioridad"),
    formAssignee: t("CreateTask.formAssignee", "Asignar a"),
    formUnassigned: t("CreateTask.formUnassigned", "Sin asignar"),
    formEstimatedMinutes: t(
      "CreateTask.formEstimatedMinutes",
      "Estimación (min)"
    ),
    formDueDate: t("CreateTask.formDueDate", "Fecha de vencimiento"),
    formRecurrence: t("CreateTask.formRecurrence", "Recurrencia"),
    formCustomFields: t("CreateTask.formCustomFields", "Campos personalizados"),
    cancel: t("CreateTask.cancel", "Cancelar"),
    create: t("CreateTask.create", "Crear Tarea"),
    creating: t("CreateTask.creating", "Creando..."),
    priorities: {
      low: t("CreateTask.priorities.low", "Baja"),
      medium: t("CreateTask.priorities.medium", "Media"),
      high: t("CreateTask.priorities.high", "Alta"),
      urgent: t("CreateTask.priorities.urgent", "Urgente"),
    },
    validation: {
      titleRequired: t(
        "CreateTask.validation.titleRequired",
        "El título es requerido"
      ),
    },
  };

  const onSubmit = async (data: CreateTaskFormData) => {
    try {
      const createdTask = await createTask.mutateAsync({
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate
          ? (serializeCalendarDateForApi(data.dueDate) as any)
          : undefined,
        projectId: data.projectId,
        estimatedMinutes: data.estimatedMinutes,
        assigneeId: data.assigneeId,
      } as any);

      if (customFieldsForm.getValuesForSubmit().length > 0 && createdTask?.id) {
        await customFieldsForm.saveValues(createdTask.id);
      }

      // ODD 025 S9: asignar tags tras crear (el DTO de creación no las acepta).
      if (selectedTagIds.length > 0 && createdTask?.id) {
        for (const tagId of selectedTagIds) {
          try {
            await assignTag.mutateAsync({ taskId: createdTask.id, tagId });
          } catch {
            toast.error(
              t("CreateTask.tagAssignError", "No se pudo asignar una etiqueta")
            );
          }
        }
      }
      setSelectedTagIds([]);
      toast.success(
        t("CreateTask.created", "Tarea creada exitosamente")
      );
      setSelectedTemplateId(undefined);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to create task:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        t("CreateTask.createError", "Error al crear tarea");
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    }
  };

  return (
    <>
      <SharedCreateTaskDialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setSelectedTagIds([]);
          onOpenChange(nextOpen);
        }}
        projectId={projectId}
        projects={projects}
        onProjectChange={setSelectedProjectId}
        onRequestCreateProject={() => setShowCreateProject(true)}
        assignableMembers={workspaceMembers}
        onSubmit={onSubmit}
        isPending={createTask.isPending}
        labels={labels}
        headerActions={({ setValue }) => (
          <div className="w-[220px]">
            <TemplateSelector
              selectedTemplateId={selectedTemplateId}
              onSelect={(template: TaskTemplate) => {
                setSelectedTemplateId(template.id);
                setValue("title", template.name);
                if (template.defaultDescription) {
                  setValue("description", template.defaultDescription);
                }
                if (template.defaultPriority) {
                  setValue("priority", template.defaultPriority as any);
                }
                if (template.defaultEstimatedMinutes) {
                  setValue("estimatedMinutes", template.defaultEstimatedMinutes);
                }
              }}
            />
          </div>
        )}
        titleActions={({ setValue, getValues }) => (
          <div className="flex items-center gap-1.5">
            <VoiceInputButton
              lang={voiceLang}
              labels={voiceLabels}
              onTranscript={(text: string) => {
                // ODD 025 S10: el parseo NL vive en el wrapper, no en el
                // primitivo compartido.
                const parsed = parseTaskInput(text);
                if (parsed.title) setValue("title", parsed.title);
                if (parsed.priority) setValue("priority", parsed.priority);
                if (parsed.dueDate) {
                  setValue(
                    "dueDate",
                    formatCalendarDateInput(parsed.dueDate)
                  );
                }
              }}
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-muted-foreground hover:text-foreground"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 hover:bg-purple-500/10"
              onClick={() => {
                const title = getValues("title");
                if (!title) return;
                try {
                  const parsed = parseTaskInput(title);
                  if (parsed.title) setValue("title", parsed.title);
                  if (parsed.priority) setValue("priority", parsed.priority);
                  if (parsed.dueDate) {
                    setValue(
                      "dueDate",
                      formatCalendarDateInput(parsed.dueDate)
                    );
                  }
                  toast.success(
                    t(
                      "CreateTask.smartParseSuccess",
                      "Tarea procesada con Smart Parse"
                    )
                  );
                } catch (err) {
                  console.error(err);
                  toast.error(
                    t(
                      "CreateTask.smartParseError",
                      "No se pudo procesar la entrada"
                    )
                  );
                }
              }}
            >
              <Wand2 className="w-3 h-3 mr-1" />
              <span>{t("CreateTask.smartParse", "Smart Parse")}</span>
            </Button>
          </div>
        )}
        autoEstimateAction={({ setValue, getValues }) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-5 text-[10px] px-2 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
            disabled={isEstimating}
            onClick={async () => {
              const { title, description } = getValues();
              if (!title) {
                toast.error(
                  t("CreateTask.titleFirst", "Ingresa un título primero")
                );
                return;
              }
              setIsEstimating(true);
              try {
                const prediction = await apiClient.predictTaskDuration({
                  title,
                  description,
                });
                if (prediction && prediction.estimatedMinutes) {
                  setValue("estimatedMinutes", prediction.estimatedMinutes);
                }
              } catch {
                setValue("estimatedMinutes", 30);
              } finally {
                setIsEstimating(false);
              }
            }}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            <span>
              {isEstimating ? "..." : t("CreateTask.auto", "Auto")}
            </span>
          </Button>
        )}
        customFieldsNode={
          activeProjectId ? (
            <CustomFieldInputs
              projectId={activeProjectId}
              values={customFieldsForm.values}
              onChange={customFieldsForm.handleChange}
            />
          ) : undefined
        }
        descriptionActions={() => (
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {selectedTagObjects.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4"
                style={{ backgroundColor: `${tag.color}25`, color: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {t("CreateTask.tags", "Etiquetas")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1" align="end">
                {(availableTagsForProject || []).length === 0 ? (
                  <p className="text-xs text-muted-foreground p-2">
                    {t("CreateTask.noTags", "Sin etiquetas aún")}
                  </p>
                ) : (
                  (availableTagsForProject || []).map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() =>
                        setSelectedTagIds((prev) =>
                          prev.includes(tag.id)
                            ? prev.filter((id) => id !== tag.id)
                            : [...prev, tag.id]
                        )
                      }
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-muted text-left"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="flex-1 truncate">{tag.name}</span>
                      {selectedTagIds.includes(tag.id) && (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      )}
                    </button>
                  ))
                )}
              </PopoverContent>
            </Popover>
          </div>
        )}
      />

      <CreateProjectDialog
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
      />
    </>
  );
}
