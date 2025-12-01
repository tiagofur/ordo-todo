"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase, Sparkles, Calendar as CalendarIcon, Flag } from "lucide-react";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";

const createTaskSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  projectId: z.string().min(1, "Proyecto es requerido"),
  dueDate: z.string().optional(),
});

type CreateTaskForm = z.infer<typeof createTaskSchema>;

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}

export function CreateTaskDialog({ open, onOpenChange, projectId }: CreateTaskDialogProps) {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: projects, isLoading: isLoadingProjects } = useAllProjects();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      priority: "MEDIUM",
      projectId: projectId || "",
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
      toast.success("Tarea creada exitosamente");
      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || "Error al crear tarea");
    }
  };

  const handleAIMagic = async () => {
    const title = watch("title");
    if (!title) {
      toast.error("Escribe un título primero para usar la IA");
      return;
    }

    setIsGenerating(true);
    // Simulate AI delay
    setTimeout(() => {
      setValue("description", `Descripción generada automáticamente para: ${title}\n\n- Paso 1: Investigar\n- Paso 2: Implementar\n- Paso 3: Probar`);
      setIsGenerating(false);
      toast.success("Descripción generada con IA");
    }, 1500);
  };

  const priorities = [
    { value: "LOW", label: "Baja", bg: "bg-blue-500", border: "border-blue-500" },
    { value: "MEDIUM", label: "Media", bg: "bg-yellow-500", border: "border-yellow-500" },
    { value: "HIGH", label: "Alta", bg: "bg-red-500", border: "border-red-500" },
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
                title="No hay proyectos"
                description="Para crear una tarea, primero necesitas un proyecto."
                actionLabel="Crear Proyecto"
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
                Nueva Tarea
              </DialogTitle>
              <button
                type="button"
                onClick={handleAIMagic}
                disabled={isGenerating}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors duration-200 disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : "animate-pulse"}`} />
                {isGenerating ? "Generando..." : "AI Magic"}

              </button>
            </div>
            <DialogDescription className="text-muted-foreground">
              Crea una nueva tarea y asígnala a un proyecto
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-foreground">Título *</Label>
              <input
                id="title"
                {...register("title")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Ej: Implementar autenticación"
                autoFocus
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Project Selection (if not provided) */}
            {!projectId && (
              <div className="space-y-2">
                <Label htmlFor="projectId" className="text-sm font-medium text-foreground">Proyecto *</Label>
                <select
                  id="projectId"
                  {...register("projectId")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecciona un proyecto</option>
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

            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Prioridad</Label>
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

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm font-medium text-foreground">Fecha de vencimiento</Label>
                <div className="relative">
                  <input
                    type="date"
                    id="dueDate"
                    {...register("dueDate")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">Descripción</Label>
              <textarea
                id="description"
                {...register("description")}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Detalles adicionales de la tarea..."
              />
            </div>

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createTaskMutation.isPending}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {createTaskMutation.isPending ? "Creando..." : "Crear Tarea"}
              </button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
