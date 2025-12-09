import { useState, useEffect } from "react";
import { Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace, useUpdateWorkspace, useDeleteWorkspace } from "@/hooks/api/use-workspaces";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ordo-todo/ui";

interface WorkspaceSettingsDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WORKSPACE_COLORS = [
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

const WORKSPACE_ICONS = ["🏠", "💼", "👥", "🚀", "🎯", "📊", "💡", "🔥", "⭐", "📁"];

export function WorkspaceSettingsDialog({
  workspaceId,
  open,
  onOpenChange,
}: WorkspaceSettingsDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: workspace, isLoading } = useWorkspace(workspaceId);
  const updateWorkspaceMutation = useUpdateWorkspace();
  const deleteWorkspaceMutation = useDeleteWorkspace();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "PERSONAL",
    color: "#2563EB",
    icon: "🏠",
  });

  // Update form when workspace data loads
  useEffect(() => {
    if (workspace) {
      setFormData({
        name: (workspace as any).name || "",
        description: (workspace as any).description || "",
        type: (workspace as any).type || "PERSONAL",
        color: (workspace as any).color || "#2563EB",
        icon: (workspace as any).icon || "🏠",
      });
    }
  }, [workspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateWorkspaceMutation.mutateAsync({
        workspaceId,
        data: {
            ...formData,
            type: formData.type as any,
        } as any,
      });
      toast.success("Workspace actualizado");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar workspace");
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    try {
      await deleteWorkspaceMutation.mutateAsync(workspaceId);
      toast.success("Workspace eliminado");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar workspace");
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configuración del Workspace</DialogTitle>
          <DialogDescription>
            Edita los detalles de tu workspace. Los cambios se guardarán automáticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Mi Workspace"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe tu workspace..."
              rows={3}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERSONAL">Personal</SelectItem>
                <SelectItem value="WORK">Trabajo</SelectItem>
                <SelectItem value="TEAM">Equipo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-9 gap-2">
              {WORKSPACE_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className="h-10 w-10 rounded-lg border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color.value,
                    borderColor: formData.color === color.value ? color.value : "transparent",
                    opacity: formData.color === color.value ? 1 : 0.6,
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
              {WORKSPACE_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border-2 text-2xl transition-all hover:scale-110"
                  style={{
                    borderColor: formData.icon === icon ? formData.color : "transparent",
                    backgroundColor: formData.icon === icon ? `${formData.color}15` : "transparent",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            {/* Delete Button */}
            <div className="flex-1">
              {!showDeleteConfirm ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar Workspace
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteWorkspaceMutation.isPending}
                    className="flex-1"
                  >
                    {deleteWorkspaceMutation.isPending ? "Eliminando..." : "Confirmar Eliminación"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Save/Cancel Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateWorkspaceMutation.isPending}
                style={{ backgroundColor: formData.color, color: "white" }}
              >
                <Save className="mr-2 h-4 w-4" />
                {updateWorkspaceMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
