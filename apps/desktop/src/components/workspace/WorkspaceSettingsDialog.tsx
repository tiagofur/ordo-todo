import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace, useUpdateWorkspace, useDeleteWorkspace, useWorkspaceMembers } from "@/hooks/api";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@ordo-todo/ui";
import { WorkspaceMembersSettings } from "./workspace-members-settings";
import { WorkspaceConfigurationSettings } from "./workspace-configuration-settings";
import { WorkspaceActivityLog } from "./workspace-activity-log";

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
  const { t } = (useTranslation as any)();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const { data: workspace, isLoading } = useWorkspace(workspaceId);
  const { data: members } = useWorkspaceMembers(workspaceId);

  // Determine if current user is owner (simple check - in real app use permissions hook)
  const isOwner = workspace?.ownerId === (workspace as any)?.currentUserId || members?.length === 0;

  const updateWorkspaceMutation = useUpdateWorkspace();
  const deleteWorkspaceMutation = useDeleteWorkspace();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#2563EB",
    icon: "🏠",
  });

  // Update form when workspace data loads
  useEffect(() => {
    if (workspace) {
      setFormData({
        name: (workspace as any).name || "",
        description: (workspace as any).description || "",
        color: (workspace as any).color || "#2563EB",
        icon: (workspace as any).icon || "🏠",
      });
    }
  }, [workspace]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateWorkspaceMutation.mutateAsync({
        workspaceId,
        data: formData as any,
      });
      toast.success(t('WorkspaceSettingsDialog.toast.updated') || "Workspace actualizado");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || t('WorkspaceSettingsDialog.toast.updateError') || "Error al actualizar workspace");
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    try {
      await deleteWorkspaceMutation.mutateAsync(workspaceId);
      toast.success(t('WorkspaceSettingsDialog.toast.deleted') || "Workspace eliminado");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || t('WorkspaceSettingsDialog.toast.deleteError') || "Error al eliminar workspace");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    handleUpdate(e);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] gap-0 p-0 overflow-hidden bg-background border-border shadow-lg">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] gap-0 p-0 overflow-hidden bg-background border-border shadow-2xl max-h-[85vh] flex flex-col">
        <div className="p-6 pb-2">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
              {t('WorkspaceSettingsDialog.title') || "Configuración del Workspace"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-base">
              {t('WorkspaceSettingsDialog.description') || "Administra la configuración, miembros y preferencias de tu workspace."}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full mb-4 overflow-x-auto scrollbar-none">
              <TabsTrigger value="general" className="flex-shrink-0">
                {t('WorkspaceSettingsDialog.tabs.general') || "General"}
              </TabsTrigger>
              <TabsTrigger value="members" className="flex-shrink-0">
                {t('WorkspaceSettingsDialog.tabs.members') || "Miembros"}
              </TabsTrigger>
              <TabsTrigger value="configuration" className="flex-shrink-0">
                {t('WorkspaceSettingsDialog.tabs.configuration') || "Configuración"}
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-shrink-0">
                {t('WorkspaceSettingsDialog.tabs.activity') || "Actividad"}
              </TabsTrigger>
            </TabsList>

            <div className="overflow-y-auto max-h-[50vh] pr-1">
              <TabsContent value="general" className="mt-0 space-y-6">
                <form id="workspace-settings-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                        {t('WorkspaceSettingsDialog.form.name.label') || "Nombre"}
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t('WorkspaceSettingsDialog.form.name.placeholder') || "Mi Workspace"}
                        required
                        className="h-10 bg-muted/30 border-input focus-visible:ring-primary/30 font-medium"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                        {t('WorkspaceSettingsDialog.form.description.label') || "Descripción"}
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder={t('WorkspaceSettingsDialog.form.description.placeholder') || "Describe tu workspace..."}
                        rows={3}
                        className="bg-muted/30 border-input focus-visible:ring-primary/30 resize-none"
                      />
                    </div>

                    {/* Color */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">
                        {t('WorkspaceSettingsDialog.form.color.label') || "Color"}
                      </Label>
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
                      <Label className="text-sm font-semibold text-foreground">
                        {t('WorkspaceSettingsDialog.form.icon.label') || "Icono"}
                      </Label>
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
                  </div>

                  {/* Danger Zone */}
                  <div className="rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 p-4 mt-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-red-900 dark:text-red-200">
                          {t('WorkspaceSettingsDialog.dangerZone.title') || "Zona de Peligro"}
                        </h4>
                        <p className="text-xs text-red-700 dark:text-red-300/70">
                          {t('WorkspaceSettingsDialog.dangerZone.description') || "Eliminar un workspace es permanente y no se puede deshacer."}
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
                          {t('WorkspaceSettingsDialog.dangerZone.delete') || "Eliminar Workspace"}
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
                            {deleteWorkspaceMutation.isPending
                              ? (t('WorkspaceSettingsDialog.dangerZone.deleting') || "Eliminando...")
                              : (t('WorkspaceSettingsDialog.dangerZone.confirm') || "Confirmar")
                            }
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
                </form>
              </TabsContent>

              <TabsContent value="members" className="mt-0">
                <WorkspaceMembersSettings
                  workspaceId={workspaceId}
                  owner={workspace?.owner}
                  workspaceCreatedAt={workspace?.createdAt}
                />
              </TabsContent>

              <TabsContent value="configuration" className="mt-0">
                <WorkspaceConfigurationSettings workspaceId={workspaceId} />
              </TabsContent>

              <TabsContent value="activity" className="mt-0">
                <WorkspaceActivityLog workspaceId={workspaceId} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-muted/10 border-t border-border flex justify-end gap-3 mt-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-6"
          >
            {t('WorkspaceSettingsDialog.actions.cancel') || "Cancelar"}
          </Button>
          {activeTab === "general" && (
            <Button
              type="submit"
              form="workspace-settings-form"
              disabled={updateWorkspaceMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 shadow-sm"
              style={{ backgroundColor: activeTab === "general" ? formData.color : undefined }}
            >
              <Save className="mr-2 h-4 w-4" />
              {updateWorkspaceMutation.isPending
                ? (t('WorkspaceSettingsDialog.actions.saving') || "Guardando...")
                : (t('WorkspaceSettingsDialog.actions.save') || "Guardar")
              }
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
