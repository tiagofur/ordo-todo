import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTask, useProjects, useTags, useWorkspaceMembers } from "@/hooks/api";
import { apiClient } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar, Flag, FolderKanban, Plus, Sparkles, Clock, Wand2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { parseTaskInput } from "@/utils/smart-capture";
import { TemplateSelector } from "./template-selector";
import { TaskTemplate } from "@/hooks/api/use-templates";

const createTaskSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  projectId: z.string().min(1, "El proyecto es requerido"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional(),
  estimatedMinutes: z.coerce.number().optional(),
});

type CreateTaskForm = z.infer<typeof createTaskSchema>;

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}

const priorities = [
  { value: "LOW", label: "Baja", color: "text-gray-500" },
  { value: "MEDIUM", label: "Media", color: "text-blue-500" },
  { value: "HIGH", label: "Alta", color: "text-orange-500" },
  { value: "URGENT", label: "Urgente", color: "text-red-500" },
];

export function CreateTaskDialog({ open, onOpenChange, projectId }: CreateTaskDialogProps) {
  const { selectedWorkspaceId } = useWorkspaceStore();
  const [selectedPriority, setSelectedPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
  const [isEstimating, setIsEstimating] = useState(false);

  // Fetch all projects if no projectId is provided
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const { data: tags } = useTags();
  const { data: members } = useWorkspaceMembers(selectedWorkspaceId || "");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      projectId: projectId || "",
      priority: "MEDIUM",
    },
  });

  const handleTemplateSelect = (template: TaskTemplate) => {
    setSelectedTemplateId(template.id);
    
    if (template.titlePattern) {
        const now = new Date();
        const title = template.titlePattern
            .replace('{date}', now.toLocaleDateString())
            .replace('{time}', now.toLocaleTimeString());
        setValue("title", title, { shouldDirty: true });
    }
    
    if (template.defaultDescription) {
        setValue("description", template.defaultDescription, { shouldDirty: true });
    }
    
    if (template.defaultPriority) {
        setSelectedPriority(template.defaultPriority as any);
        setValue("priority", template.defaultPriority as any, { shouldDirty: true });
    }
    
    // Also set estimatedMinutes if template has it (assuming template model supports it, irrelevant for now)
    
    toast.success(`Plantilla "${template.name}" aplicada`);
  };

  const handleSmartCapture = () => {
    const text = getValues("title");
    if (!text) return;

    const result = parseTaskInput(text, {
        projects: projects || [],
        members: members || [],
        tags: tags || [],
    });

    if (result.title !== text) {
        setValue("title", result.title, { shouldDirty: true });
    }

    if (result.projectId) {
        setValue("projectId", result.projectId, { shouldDirty: true });
        toast.success("Proyecto detectado");
    }

    if (result.priority) {
        setValue("priority", result.priority, { shouldDirty: true });
        setSelectedPriority(result.priority);
        toast.success(`Prioridad ${result.priority} detectada`);
    }

    if (result.dueDate) {
        const iso = result.dueDate.toISOString().split('T')[0];
        setValue("dueDate", iso, { shouldDirty: true });
        toast.success("Fecha detectada");
    }
  };

  const handleAIEstimate = async () => {
    const { title, description } = getValues();
    if (!title) {
        toast.error("Ingresa un título para estimar");
        return;
    }

    setIsEstimating(true);
    try {
        const result = await apiClient.predictTaskDuration({
            title,
            description,
            priority: selectedPriority
        });

        if (result && result.estimatedMinutes) {
            setValue("estimatedMinutes", result.estimatedMinutes, { shouldDirty: true });
            toast.success(`Estimación: ${result.estimatedMinutes} min`, {
                description: result.reasoning || "Basado en tareas similares e IA"
            });
        } else {
            toast.info("No se pudo generar una estimación precisa");
        }
    } catch (e) {
        toast.error("Error al conectar con el servicio de IA");
    } finally {
        setIsEstimating(false);
    }
  };

  const createTask = useCreateTask();

  const onSubmit = async (data: CreateTaskForm) => {
    try {
      await createTask.mutateAsync({
        ...data,
        priority: selectedPriority,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        projectId: data.projectId,
        estimatedTime: data.estimatedMinutes,
      });
      toast.success("Tarea creada exitosamente");
      reset();
      setSelectedTemplateId(undefined);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear tarea");
    }
  };

  const handleCreateProjectSuccess = () => {
    setShowCreateProject(false);
  };

  const showEmptyState = !projectId && !isLoadingProjects && projects?.length === 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Crear Tarea</DialogTitle>
          </DialogHeader>

          {showEmptyState ? (
            <EmptyState
              icon={FolderKanban}
              title="No hay proyectos creados"
              description="Para crear una tarea, primero necesitas crear un proyecto."
              actionLabel="Crear mi primer proyecto"
              onAction={() => setShowCreateProject(true)}
            />
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Template Selector */}
              <div className="flex justify-end mb-2">
                 <div className="w-[250px]">
                    <TemplateSelector 
                        onSelect={handleTemplateSelect} 
                        selectedTemplateId={selectedTemplateId} 
                    />
                 </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="title">Título *</Label>
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        onClick={handleSmartCapture}
                    >
                        <Wand2 className="w-3 h-3 mr-1" />
                        Smart Parse
                    </Button>
                </div>
                <input
                  id="title"
                  {...register("title")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="¿Qué necesitas hacer?"
                  autoFocus
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <textarea
                  id="description"
                  {...register("description")}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Agrega detalles sobre esta tarea..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    Prioridad
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                    {priorities.map((priority) => (
                        <button
                        key={priority.value}
                        type="button"
                        onClick={() => setSelectedPriority(priority.value as any)}
                        className={`flex items-center justify-center gap-2 rounded-lg border p-2 text-sm transition-colors ${
                            selectedPriority === priority.value
                            ? "border-primary bg-primary/5"
                            : "hover:bg-accent"
                        }`}
                        title={priority.label}
                        >
                        <Flag className={`h-4 w-4 ${priority.color}`} />
                        </button>
                    ))}
                    </div>
                </div>
                
                {/* Estimated Time */}
                <div className="space-y-2">
                    <Label htmlFor="estimatedMinutes" className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Estimación (min)
                        </div>
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            className="h-5 text-[10px] px-2 text-purple-600"
                            onClick={handleAIEstimate}
                            disabled={isEstimating}
                        >
                            <Sparkles className="w-3 h-3 mr-1" />
                            {isEstimating ? "..." : "Auto"}
                        </Button>
                    </Label>
                    <input
                        id="estimatedMinutes"
                        type="number"
                        {...register("estimatedMinutes")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="30"
                    />
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha de vencimiento
                </Label>
                <input
                  id="dueDate"
                  type="date"
                  {...register("dueDate")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Project Selection (if not provided) */}
              {!projectId && (
                <div className="space-y-2">
                  <Label htmlFor="projectId" className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4" />
                    Proyecto *
                  </Label>
                  <div className="flex gap-2">
                    <select
                        id="projectId"
                        {...register("projectId")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">Selecciona un proyecto</option>
                        {projects?.map((project) => (
                        <option key={project.id} value={project.id}>
                            {project.name}
                        </option>
                        ))}
                    </select>
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => setShowCreateProject(true)}
                        title="Crear nuevo proyecto"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.projectId && (
                    <p className="text-sm text-red-500">{errors.projectId.message}</p>
                  )}
                </div>
              )}

              {/* Hidden project ID if provided */}
              {projectId && <input type="hidden" {...register("projectId")} />}

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createTask.isPending}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {createTask.isPending ? "Creando..." : "Crear Tarea"}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Project Dialog */}
      <CreateProjectDialog 
        open={showCreateProject} 
        onOpenChange={setShowCreateProject}
        workspaceId={selectedWorkspaceId || undefined}
      />
    </>
  );
}
