import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateWorkspace } from "@/hooks/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  ColorSwatchPicker,
  IconPicker,
  FORM_COLORS,
} from "@ordo-todo/ui";
import { toast } from "sonner";

const createWorkspaceSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

type CreateWorkspaceForm = z.infer<typeof createWorkspaceSchema>;

// Helper function to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
};

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string; // Prop was unused in original likely, but kept for compatibility if needed
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
}: CreateWorkspaceDialogProps) {
  // ODD 025: azul canónico de la paleta única (antes #2563EB de la paleta 600).
  const [selectedColor, setSelectedColor] = useState<string>(FORM_COLORS[8]);
  const [selectedIcon, setSelectedIcon] = useState("🏠");
  const createWorkspaceMutation = useCreateWorkspace();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkspaceForm>({
    resolver: zodResolver(createWorkspaceSchema),
  });

  const onSubmit = async (data: CreateWorkspaceForm) => {
    try {
      await createWorkspaceMutation.mutateAsync({
        ...data,
        color: selectedColor,
        icon: selectedIcon,
        slug: generateSlug(data.name),
      });
      toast.success("Workspace creado exitosamente");
      reset();
      setSelectedColor(FORM_COLORS[8]);
      setSelectedIcon("🏠");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Error al crear workspace");
    }
  };

  // ODD 025: los nombres de color y la paleta 600-weight inline mueren —
  // ColorSwatchPicker e IconPicker usan las constantes canónicas.

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Workspace</DialogTitle>
          <DialogDescription>
            Organiza tus tareas en diferentes espacios de trabajo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <input
              id="name"
              {...register("name")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Mi Workspace"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

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
              disabled={createWorkspaceMutation.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {createWorkspaceMutation.isPending
                ? "Creando..."
                : "Crear Workspace"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
