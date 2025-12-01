"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateProject, useProject } from "@/lib/api-hooks";
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
import { Palette, Check } from "lucide-react";

const updateProjectSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  color: z.string().optional(),
});

type UpdateProjectForm = z.infer<typeof updateProjectSchema>;

interface ProjectSettingsDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function ProjectSettingsDialog({ projectId, open, onOpenChange }: ProjectSettingsDialogProps) {
  const { data: project } = useProject(projectId);
  const [selectedColor, setSelectedColor] = useState(projectColors[3]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProjectForm>({
    resolver: zodResolver(updateProjectSchema),
  });

  // Update form when project data loads
  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description || "",
        color: project.color,
      });
      setSelectedColor(project.color || projectColors[3]);
    }
  }, [project, reset]);

  const updateProjectMutation = useUpdateProject();

  const onSubmit = async (data: UpdateProjectForm) => {
    try {
      await updateProjectMutation.mutateAsync({
        projectId,
        data: {
          ...data,
          color: selectedColor,
        },
      });

      toast.success("Proyecto actualizado exitosamente");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al actualizar proyecto");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] gap-0 p-0 overflow-hidden bg-background border-border">
        <div className="p-6 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">
              Configuración del Proyecto
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Actualiza la información de tu proyecto
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Color Picker */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Palette className="w-4 h-4" /> Color del Proyecto
              </Label>
              <div className="flex gap-3 flex-wrap p-3 rounded-lg border border-border bg-muted/20">
                {projectColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`relative h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                      selectedColor === color 
                        ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110" 
                        : "hover:opacity-80"
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === color && (
                      <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">Nombre *</Label>
              <input
                id="name"
                {...register("name")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Ej: Rediseño Web, Marketing Q4"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">Descripción</Label>
              <textarea
                id="description"
                {...register("description")}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Descripción opcional del proyecto..."
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
                disabled={updateProjectMutation.isPending}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {updateProjectMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
