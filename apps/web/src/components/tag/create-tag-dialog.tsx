"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTag, useUpdateTag } from "@/lib/api-hooks";
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

const createTagSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  color: z.string().optional(),
  workspaceId: z.string().min(1, "Workspace es requerido"),
});

type CreateTagForm = z.infer<typeof createTagSchema>;

interface CreateTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string;
  tagToEdit?: { id: string; name: string; color?: string; workspaceId: string };
}

const tagColors = [
  "#EF4444", // red
  "#F59E0B", // amber
  "#10B981", // emerald
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#6366F1", // indigo
  "#14B8A6", // teal
  "#F97316", // orange
  "#84CC16", // lime
];

export function CreateTagDialog({ open, onOpenChange, workspaceId, tagToEdit }: CreateTagDialogProps) {
  const [selectedColor, setSelectedColor] = useState(tagToEdit?.color || tagColors[0]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTagForm>({
    resolver: zodResolver(createTagSchema),
    defaultValues: {
      name: tagToEdit?.name || "",
      workspaceId: workspaceId || tagToEdit?.workspaceId,
      color: tagToEdit?.color || tagColors[0],
    },
  });

  const watchedName = watch("name");

  // Update form when workspaceId or tagToEdit changes
  useEffect(() => {
    if (tagToEdit) {
      setValue("name", tagToEdit.name);
      setValue("workspaceId", tagToEdit.workspaceId);
      setSelectedColor(tagToEdit.color || tagColors[0]);
    } else if (workspaceId) {
      setValue("workspaceId", workspaceId);
      if (!open) {
        reset({ name: "", workspaceId, color: tagColors[0] });
        setSelectedColor(tagColors[0]);
      }
    }
  }, [workspaceId, tagToEdit, setValue, reset, open]);

  const createTag = useCreateTag();
  const updateTag = useUpdateTag();

  const onSubmit = (data: CreateTagForm) => {
    const payload = {
      ...data,
      color: selectedColor,
    };
    
    if (tagToEdit) {
      updateTag.mutate({ tagId: tagToEdit.id, data: payload }, {
        onSuccess: () => {
          toast.success("Etiqueta actualizada");
          reset();
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error(error.message || "Error al actualizar etiqueta");
        }
      });
    } else {
      createTag.mutate(payload, {
        onSuccess: () => {
          toast.success("Etiqueta creada exitosamente");
          reset();
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error(error.message || "Error al crear etiqueta");
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{tagToEdit ? "Editar Etiqueta" : "Crear Etiqueta"}</DialogTitle>
          <DialogDescription>
            {tagToEdit ? "Modifica los detalles de la etiqueta" : "Organiza tus tareas con etiquetas personalizadas"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Color Picker */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {tagColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-10 w-10 rounded-lg transition-all ${
                    selectedColor === color ? "scale-110 ring-2 ring-offset-2 ring-primary" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <input
              id="name"
              {...register("name")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Ej: Urgente, Personal, Trabajo..."
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Vista previa</Label>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
                style={{
                  backgroundColor: `${selectedColor}20`,
                  color: selectedColor,
                }}
              >
                {watchedName || "Etiqueta"}
              </span>
            </div>
          </div>

          {/* Hidden workspace ID */}
          <input type="hidden" {...register("workspaceId")} />

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
              disabled={createTag.isPending || updateTag.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {tagToEdit 
                ? (updateTag.isPending ? "Guardando..." : "Guardar Cambios") 
                : (createTag.isPending ? "Creando..." : "Crear Etiqueta")
              }
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
