"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button, Input, Label, Textarea, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger, ColorSwatchPicker } from "@ordo-todo/ui";
import { Trash2, Save, X } from "lucide-react";
import { useWorkspace, useUpdateWorkspace, useDeleteWorkspace } from "@/lib/api-hooks";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/lib/error-handler";
import { useWorkspacePermissions } from "@/hooks/use-workspace-permissions";

import { WorkspaceMembersSettings } from "./workspace-members-settings";
import { WorkspaceConfigurationSettings } from "./workspace-configuration-settings";
import { WorkspaceActivityLog } from "./workspace-activity-log";

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
  const router = useRouter();
  const t = useTranslations('WorkspaceSettingsDialog');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const { data: workspace, isLoading } = useWorkspace(workspaceId);

  // Check permissions for current user
  const permissions = useWorkspacePermissions(workspace);

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
        name: workspace.name,
        description: workspace.description || "",
        color: workspace.color || "#2563EB",
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
      toast.success(t('toast.updated'));
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error, t('toast.updateError')));
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    try {
      await deleteWorkspaceMutation.mutateAsync(workspaceId);
      toast.success(t('toast.deleted'));
      onOpenChange(false);
      // Redirect to workspaces list
      router.push("/workspaces");
    } catch (error) {
      toast.error(getErrorMessage(error, t('toast.deleteError')));
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
              {t('title')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-base">
              {t('description')}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full mb-4 overflow-x-auto scrollbar-none">
              <TabsTrigger value="general" className="flex-shrink-0">{t('tabs.general')}</TabsTrigger>
              {permissions.canManageMembers && (
                <TabsTrigger value="members" className="flex-shrink-0">{t('tabs.members')}</TabsTrigger>
              )}
              {permissions.canUpdateSettings && (
                <TabsTrigger value="configuration" className="flex-shrink-0">{t('tabs.configuration')}</TabsTrigger>
              )}
              {permissions.canViewAuditLogs && (
                <TabsTrigger value="activity" className="flex-shrink-0">{t('tabs.activity')}</TabsTrigger>
              )}
            </TabsList>
            
            <div className="overflow-y-auto max-h-[50vh] pr-1">
              <TabsContent value="general" className="mt-0 space-y-6">
                <form id="workspace-settings-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                        {t('form.name.label')}
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t('form.name.placeholder')}
                        required
                        disabled={!permissions.canEdit}
                        className="h-10 bg-muted border-input focus-visible:ring-primary font-medium"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                        {t('form.description.label')}
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder={t('form.description.placeholder')}
                        rows={3}
                        disabled={!permissions.canEdit}
                        className="bg-muted border-input focus-visible:ring-primary resize-none"
                      />
                    </div>

                    {/* Color — ODD 025: picker canónico (deshabilitado sin permiso) */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">
                        {t('form.color.label') || "Color"}
                      </Label>
                      <div
                        className={
                          permissions.canEdit
                            ? undefined
                            : "pointer-events-none opacity-60"
                        }
                      >
                        <ColorSwatchPicker
                          value={formData.color}
                          onChange={(color) => setFormData({ ...formData, color })}
                        />
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">
                        {t('form.icon.label') || "Icono"}
                      </Label>
                      <div className="grid grid-cols-10 gap-2">
                        {["🏠", "💼", "👥", "🚀", "🎯", "📊", "💡", "🔥", "⭐", "📁"].map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setFormData({ ...formData, icon })}
                            disabled={!permissions.canEdit}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border-2 text-2xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  {permissions.canDelete && (
                    <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4 mt-8">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-red-900 dark:text-red-200">{t('dangerZone.title')}</h4>
                          <p className="text-xs text-red-700 dark:text-red-300">
                            {t('dangerZone.description')}
                          </p>
                        </div>
                        {!showDeleteConfirm ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                            className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('dangerZone.delete')}
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
                              {deleteWorkspaceMutation.isPending ? t('dangerZone.deleting') : t('dangerZone.confirm')}
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
                  )}
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
        <div className="p-6 bg-muted border-t border-border flex justify-end gap-3 mt-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-6"
          >
            {t('actions.cancel')}
          </Button>
          {activeTab === "general" && permissions.canUpdateSettings && (
            <Button
              type="submit"
              form="workspace-settings-form"
              disabled={updateWorkspaceMutation.isPending}
              className="bg-primary text-primary-foreground hover:brightness-90 px-6 shadow-sm"
            >
              <Save className="mr-2 h-4 w-4" />
              {updateWorkspaceMutation.isPending ? t('actions.saving') : t('actions.save')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
