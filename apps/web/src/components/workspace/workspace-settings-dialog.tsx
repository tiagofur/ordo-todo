"use client";

import { useState, useEffect } from "react";
import { Trash2, Save, X } from "lucide-react";
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
  });

  // Update form when workspace data loads
  useEffect(() => {
    if (workspace) {
      setFormData({
        name: workspace.name,
        description: workspace.description || "",
        type: workspace.type,
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
        <DialogContent className="sm:max-w-[500px] gap-0 p-0 overflow-hidden bg-background border-border shadow-lg">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] gap-0 p-0 overflow-hidden bg-background border-border shadow-2xl">
        <div className="p-6 pb-0">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
              Configuración del Workspace
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-base">
              Administra la información general de tu espacio de trabajo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                  Nombre del Workspace
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Mi Proyecto Personal"
                  required
                  className="h-10 bg-muted/30 border-input focus-visible:ring-primary/30 font-medium"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe brevemente el propósito de este espacio..."
                  rows={3}
                  className="bg-muted/30 border-input focus-visible:ring-primary/30 resize-none"
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-semibold text-foreground">
                  Tipo de Espacio
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                >
                  <SelectTrigger className="h-10 bg-muted/30 border-input focus:ring-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERSONAL">
                      <span className="flex items-center gap-2">
                        👤 Personal
                      </span>
                    </SelectItem>
                    <SelectItem value="WORK">
                      <span className="flex items-center gap-2">
                        💼 Trabajo
                      </span>
                    </SelectItem>
                    <SelectItem value="TEAM">
                      <span className="flex items-center gap-2">
                        👥 Equipo
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[0.8rem] text-muted-foreground">
                  El tipo define el color y el icono predeterminado del workspace.
                </p>
              </div>
            </div>

            <div className="pt-2"></div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-muted/10 border-t border-border flex flex-col gap-6">
           {/* Danger Zone */}
           <div className="rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-red-900 dark:text-red-200">Zona de Peligro</h4>
                  <p className="text-xs text-red-700 dark:text-red-300/70">
                    Esta acción no se puede deshacer.
                  </p>
                </div>
                {!showDeleteConfirm ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/40"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleteWorkspaceMutation.isPending}
                    >
                      {deleteWorkspaceMutation.isPending ? "Eliminando..." : "Confirmar"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={updateWorkspaceMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 shadow-sm"
              >
                <Save className="mr-2 h-4 w-4" />
                {updateWorkspaceMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
