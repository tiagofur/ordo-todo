import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Button,
  Input,
  ColorSwatchPicker,
  FORM_COLORS
} from "@ordo-todo/ui";

const createTagSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  color: z.string().optional(),
  workspaceId: z.string().optional(),
});

type CreateTagForm = z.infer<typeof createTagSchema>;

interface TagFormData {
  name: string;
  color: string;
  workspaceId?: string;
}

interface CreateTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string;
  tagToEdit?: { id: string; name: string; color?: string; workspaceId: string };
  onSubmit?: (data: TagFormData, isEdit: boolean) => void;
  isPending?: boolean;
}

// ODD 025: la paleta inline divergente (10) se elimina — ColorSwatchPicker
// usa la paleta canónica FORM_COLORS y muestra el color actual como swatch
// extra si es de datos previos.

export function CreateTagDialog({ 
  open, 
  onOpenChange, 
  workspaceId,
  tagToEdit,
  onSubmit, 
  isPending 
}: CreateTagDialogProps) {
  const [selectedColor, setSelectedColor] = useState<string>(tagToEdit?.color || FORM_COLORS[0]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTagForm>({
    resolver: zodResolver(createTagSchema),
    defaultValues: {
      workspaceId: workspaceId,
      name: tagToEdit?.name || "",
      color: tagToEdit?.color || FORM_COLORS[0],
    },
  });

  useEffect(() => {
    if (open) {
      if (tagToEdit) {
        setValue("name", tagToEdit.name);
        setSelectedColor(tagToEdit.color || FORM_COLORS[0]);
        setValue("workspaceId", tagToEdit.workspaceId);
      } else {
        reset({
          workspaceId: workspaceId,
          name: "",
          color: FORM_COLORS[0],
        });
        setSelectedColor(FORM_COLORS[0]);
      }
    }
  }, [open, tagToEdit, workspaceId, reset, setValue]);

  const tagName = watch("name");

  const handleFormSubmit = (data: CreateTagForm) => {
    if (onSubmit) {
      onSubmit(
        {
          name: data.name,
          color: selectedColor || FORM_COLORS[0],
          workspaceId: data.workspaceId,
        },
        !!tagToEdit
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{tagToEdit ? "Editar Etiqueta" : "Crear Etiqueta"}</DialogTitle>
          <DialogDescription>
            {tagToEdit ? "Modifica el nombre o color de la etiqueta" : "Organiza tus tareas con etiquetas personalizadas"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Color Picker — ODD 025: picker canónico */}
          <div className="space-y-2">
            <Label>Color</Label>
            <ColorSwatchPicker
              value={selectedColor}
              onChange={setSelectedColor}
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              {...register("name")}
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
                {tagName || "Etiqueta"}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
            >
              {isPending ? (tagToEdit ? "Guardando..." : "Creando...") : (tagToEdit ? "Guardar" : "Crear Etiqueta")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
