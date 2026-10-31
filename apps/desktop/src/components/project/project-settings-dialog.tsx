import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateProject } from "@/hooks/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Input,
  Textarea,
  Button,
  ColorSwatchPicker,
  IconPicker,
} from "@ordo-todo/ui";

// ODD 025 S5: edición de proyecto en desktop (paridad con web) — nombre,
// descripción, color e icono con los primitivos canónicos.

const projectSettingsSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
});

type ProjectSettingsForm = z.infer<typeof projectSettingsSchema>;

interface ProjectSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    name: string;
    description?: string | null;
    color?: string | null;
    icon?: string | null;
  };
}

export function ProjectSettingsDialog({
  open,
  onOpenChange,
  project,
}: ProjectSettingsDialogProps) {
  const updateProject = useUpdateProject();
  const [selectedColor, setSelectedColor] = useState<string>("#3B82F6");
  const [selectedIcon, setSelectedIcon] = useState<string>("📁");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectSettingsForm>({
    resolver: zodResolver(projectSettingsSchema),
  });

  useEffect(() => {
    if (open) {
      reset({
        name: project.name,
        description: project.description || "",
      });
      setSelectedColor(project.color || "#3B82F6");
      setSelectedIcon(project.icon || "📁");
    }
  }, [open, project, reset]);

  const onSubmit = async (data: ProjectSettingsForm) => {
    try {
      await updateProject.mutateAsync({
        projectId: project.id,
        data: {
          name: data.name,
          description: data.description || undefined,
          color: selectedColor,
          icon: selectedIcon,
        },
      });
      toast.success("Proyecto actualizado");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar el proyecto");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajustes del Proyecto</DialogTitle>
          <DialogDescription>
            Nombre, descripción, color e icono del proyecto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="project-name">Nombre *</Label>
            <Input
              id="project-name"
              {...register("name")}
              placeholder="Nombre del proyecto"
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="project-description">Descripción</Label>
            <Textarea
              id="project-description"
              {...register("description")}
              placeholder="Descripción opcional..."
              rows={3}
            />
          </div>

          {/* Color — ODD 025: picker canónico */}
          <div className="space-y-2">
            <Label>Color</Label>
            <ColorSwatchPicker
              value={selectedColor}
              onChange={setSelectedColor}
            />
          </div>

          {/* Icon — ODD 025: picker canónico */}
          <div className="space-y-2">
            <Label>Icono</Label>
            <IconPicker
              value={selectedIcon}
              onChange={setSelectedIcon}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateProject.isPending}>
              {updateProject.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
