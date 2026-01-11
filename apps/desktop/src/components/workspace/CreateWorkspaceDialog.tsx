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
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
};

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string; // Prop was unused in original likely, but kept for compatibility if needed
}

export function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {
  const [selectedColor, setSelectedColor] = useState("#2563EB");
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
      setSelectedColor("#2563EB");
      setSelectedIcon("🏠");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Error al crear workspace");
    }
  };

  const workspaceColors = [
    { name: "Azul", value: "#2563EB" },
    { name: "Púrpura", value: "#7C3AED" },
    { name: "Rosa", value: "#DB2777" },
    { name: "Rojo", value: "#DC2626" },
    { name: "Naranja", value: "#EA580C" },
    { name: "Amarillo", value: "#CA8A04" },
    { name: "Verde", value: "#16A34A" },
    { name: "Turquesa", value: "#0891B2" },
    { name: "Gris", value: "#6B7280" },
  ];

  const workspaceIcons = ["🏠", "💼", "👥", "🚀", "🎯", "📊", "💡", "🔥", "⭐", "📁"];

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
          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-9 gap-2">
              {workspaceColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className="h-10 w-10 rounded-lg border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color.value,
                    borderColor: selectedColor === color.value ? color.value : "transparent",
                    opacity: selectedColor === color.value ? 1 : 0.6,
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label>Icono</Label>
            <div className="grid grid-cols-10 gap-2">
              {workspaceIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border-2 text-2xl transition-all hover:scale-110"
                  style={{
                    borderColor: selectedIcon === icon ? selectedColor : "transparent",
                    backgroundColor: selectedIcon === icon ? `${selectedColor}15` : "transparent",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
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
              {createWorkspaceMutation.isPending ? "Creando..." : "Crear Workspace"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
