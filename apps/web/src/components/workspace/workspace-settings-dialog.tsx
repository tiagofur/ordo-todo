"use client";

import { useState, useEffect } from "react";
import { Trash2, Save, X, Check } from "lucide-react";
import { useWorkspace, useUpdateWorkspace, useDeleteWorkspace } from "@/lib/api-hooks";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "PERSONAL" as "PERSONAL" | "WORK" | "TEAM",
    color: "#2563EB",
    icon: "🏠",
  });

  // Update form when workspace data loads
  useEffect(() => {
    if (workspace) {
      setFormData({
        name: workspace.name,
        description: workspace.description || "",
        type: workspace.type,
        color: workspace.color,
        icon: workspace.icon || "🏠",
      });
    }
  }, [workspace]);

  const updateWorkspaceMutation = useUpdateWorkspace();
  const deleteWorkspaceMutation = useDeleteWorkspace();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateWorkspaceMutation.mutateAsync({
        workspaceId,
        data: formData,
      });
      toast.success("Workspace actualizado");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || "Error al actualizar workspace");
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
      // Redirect to first available workspace or create new one
      window.location.href = "/workspaces";
    } catch (error: any) {
      toast.error(error?.message || "Error al eliminar workspace");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    handleUpdate(e);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px] gap-0 p-0 overflow-hidden bg-background border-border">
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] gap-0 p-0 overflow-hidden bg-background border-border">
        <div className="p-6 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">
              Configuración del Workspace
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Edita los detalles de tu workspace. Los cambios se guardarán automáticamente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Mi Workspace"
                required
                className="bg-background border-input focus-visible:ring-primary"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe tu workspace..."
                rows={3}
                className="bg-background border-input focus-visible:ring-primary resize-none"
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium text-foreground">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as any })}
              >
                <SelectTrigger className="bg-background border-input focus:ring-primary">
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
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Color</Label>
              <div className="grid grid-cols-9 gap-2 p-3 rounded-lg border border-border bg-muted/20">
                {WORKSPACE_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`relative h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                      formData.color === color.value 
                        ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110" 
                        : "hover:opacity-80"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {formData.color === color.value && (
                      <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Icono</Label>
              <div className="grid grid-cols-10 gap-2 p-3 rounded-lg border border-border bg-muted/20">
                {WORKSPACE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-transform hover:scale-110 ${
                      formData.icon === icon
                        ? "bg-background shadow-sm ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                        : "hover:bg-background/50"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="flex-col gap-3 sm:flex-row pt-4 border-t border-border/10">
              {/* Delete Button */}
              <div className="flex-1">
                {!showDeleteConfirm ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleDelete}
                    className="w-full sm:w-auto text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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
                      {deleteWorkspaceMutation.isPending ? "Eliminando..." : "Confirmar"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
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
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateWorkspaceMutation.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  style={{ 
                    backgroundColor: formData.color,
                  }}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateWorkspaceMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
