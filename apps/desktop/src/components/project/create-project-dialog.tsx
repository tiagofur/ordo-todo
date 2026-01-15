import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateProject, useWorkspaces, useWorkflows, useCreateWorkflow } from "@/hooks/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  EmptyState,
} from "@ordo-todo/ui";
import { toast } from "sonner";
import { Briefcase, CheckSquare, Sparkles, Layers } from "lucide-react";

const createProjectSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  color: z.string().optional(),
  type: z.enum(["STANDARD", "SERIES", "FOCUS", "CREATOR", "HYBRID"]),
  workspaceId: z.string().min(1, "Workspace es requerido"),
  workflowId: z.string().optional(),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string;
}

const projectColors = [
  "#EF4444", // red
  "#F59E0B", // amber
  "#10B981", // emerald
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#6B7280", // gray
];

const projectTypes = [
  {
    value: "STANDARD",
    label: "Standard",
    description: "Classic To-Do with checklists and boards",
    icon: CheckSquare,
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-900",
    borderColor: "border-slate-200 dark:border-slate-800",
  },
  {
    value: "FOCUS",
    label: "Focus",
    description: "Personal productivity mode",
    icon: CheckSquare,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950",
    borderColor: "border-cyan-200 dark:border-cyan-800",
  },
  {
    value: "CREATOR",
    label: "Creator",
    description: "Content pipeline with scripting & publishing",
    icon: Sparkles,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  {
    value: "HYBRID",
    label: "Hybrid",
    description: "Both Focus and Creator modes available",
    icon: Layers,
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-950",
    borderColor: "border-violet-200 dark:border-violet-800",
  },
];

export function CreateProjectDialog({ open, onOpenChange, workspaceId }: CreateProjectDialogProps) {
  const [selectedColor, setSelectedColor] = useState(projectColors[3]);
  const [selectedType, setSelectedType] = useState<"STANDARD" | "SERIES" | "FOCUS" | "CREATOR" | "HYBRID">("STANDARD");

  const createWorkflow = useCreateWorkflow();

  // Fetch workspaces if not provided (to check if any exist)
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useWorkspaces();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      workspaceId: workspaceId || "",
      color: projectColors[3],
      type: "STANDARD",
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

  const createProject = useCreateProject();

  const onSubmit = async (data: CreateProjectForm) => {
    try {
        let finalWorkflowId = data.workflowId;

        // If no workflow ID provided (which is expected now as we removed the selector)
        if (!finalWorkflowId || finalWorkflowId === "NEW") {
            // 1. Try to find an existing "General" workflow in the current list
            const generalWorkflow = workflows?.find(w => w.name === "General");

            if (generalWorkflow) {
                finalWorkflowId = String(generalWorkflow.id);
            } else {
                // 2. If not found, create a new "General" workflow
                const newWorkflow = await createWorkflow.mutateAsync({
                    name: "General",
                    workspaceId: data.workspaceId,
                    color: "#3B82F6", // Default blue
                    icon: "layers"
                });
                finalWorkflowId = String(newWorkflow.id);
            }
        }

        await createProject.mutateAsync({
            ...data,
            workflowId: finalWorkflowId, // We ensure it's set above
            color: selectedColor,
        });
        toast.success("Proyecto creado exitosamente");
        reset();
        onOpenChange(false);
    } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error al asignar el flujo de trabajo");
    }
  };

  const showEmptyState = !workspaceId && !isLoadingWorkspaces && workspaces?.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Proyecto</DialogTitle>
          <DialogDescription>
            Organiza tus tareas en proyectos dentro de un flujo de trabajo
          </DialogDescription>
        </DialogHeader>

        {showEmptyState ? (
             <EmptyState
             icon={Briefcase}
             title="No hay espacios de trabajo"
             description="Para crear un proyecto, primero necesitas un espacio de trabajo (Workspace)."
             actionLabel="Crear Workspace"
             onAction={() => {
                 onOpenChange(false);
                 toast.info("Por favor crea un workspace desde la barra lateral");
             }}
           />
        ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Color Picker */}
            <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                {projectColors.map((color) => (
                    <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`h-8 w-8 rounded-lg transition-transform ${
                        selectedColor === color ? "scale-110 ring-2 ring-offset-2" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    />
                ))}
                </div>
            </div>

            {/* Project Type Selector */}
            <div className="space-y-2">
                <Label htmlFor="type">Tipo de Proyecto *</Label>
                <input type="hidden" {...register("type")} value={selectedType} />
                <div className="grid grid-cols-2 gap-2">
                    {projectTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                            <button
                                key={type.value}
                                type="button"
                                onClick={() => setSelectedType(type.value as any)}
                                className={`
                                    flex items-center gap-2 p-3 rounded-lg border-2 text-left
                                    transition-all duration-200
                                    ${selectedType === type.value
                                        ? "ring-2 ring-offset-2 " + type.borderColor + " " + type.bgColor
                                        : "border-border hover:bg-muted"
                                    }
                                `}
                            >
                                <Icon className={`h-5 w-5 flex-shrink-0 ${type.color}`} />
                                <div className="min-w-0">
                                    <div className={`font-medium text-sm ${type.color}`}>
                                        {type.label}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {type.description}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
                {errors.type && (
                    <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
            </div>

            {/* Name */}
            <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <input
                id="name"
                {...register("name")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Mi Proyecto"
                />
                {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
            </div>

            {/* Workspace Selection (if not provided) */}
            {!workspaceId && (
                 <div className="space-y-2">
                 <Label htmlFor="workspaceId">Workspace *</Label>
                 <select
                   id="workspaceId"
                   {...register("workspaceId")}
                   className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                 >
                   {workspaces?.map((ws) => (
                     <option key={ws.id} value={ws.id}>
                       {ws.name}
                     </option>
                   ))}
                 </select>
                 {errors.workspaceId && (
                   <p className="text-sm text-red-500">{errors.workspaceId.message}</p>
                 )}
               </div>
            )}

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <textarea
                id="description"
                {...register("description")}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Descripción opcional..."
                />
            </div>

            {/* Hidden workspace ID if provided */}
            {workspaceId && <input type="hidden" {...register("workspaceId")} />}

            <DialogFooter>
                <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                Cancelar
                </button>
                <button
                type="submit"
                disabled={createProject.isPending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                {createProject.isPending ? "Creando..." : "Crear Proyecto"}
                </button>
            </DialogFooter>
            </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
