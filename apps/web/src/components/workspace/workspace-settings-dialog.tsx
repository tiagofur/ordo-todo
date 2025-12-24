"use client";

import { useState, useEffect } from "react";
import { Button, Input, Label, Textarea, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger } from "@ordo-todo/ui";
import { Trash2, Save, X } from "lucide-react";
import { useWorkspace, useUpdateWorkspace, useDeleteWorkspace } from "@/lib/api-hooks";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

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
  const t = useTranslations('WorkspaceSettingsDialog');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

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
      toast.success(t('toast.updated'));
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || t('toast.updateError'));
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
      // Redirect to first available workspace or create new one
      window.location.href = "/workspaces";
    } catch (error: any) {
      toast.error(error?.message || t('toast.deleteError'));
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
              <TabsTrigger value="members" className="flex-shrink-0">{t('tabs.members')}</TabsTrigger>
              <TabsTrigger value="configuration" className="flex-shrink-0">{t('tabs.configuration')}</TabsTrigger>
              <TabsTrigger value="activity" className="flex-shrink-0">{t('tabs.activity')}</TabsTrigger>
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
                        className="h-10 bg-muted/30 border-input focus-visible:ring-primary/30 font-medium"
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
                        className="bg-muted/30 border-input focus-visible:ring-primary/30 resize-none"
                      />
                    </div>

                    {/* Type */}
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm font-semibold text-foreground">
                        {t('form.type.label')}
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
                              👤 {t('form.type.options.PERSONAL')}
                            </span>
                          </SelectItem>
                          <SelectItem value="WORK">
                            <span className="flex items-center gap-2">
                              💼 {t('form.type.options.WORK')}
                            </span>
                          </SelectItem>
                          <SelectItem value="TEAM">
                            <span className="flex items-center gap-2">
                              👥 {t('form.type.options.TEAM')}
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[0.8rem] text-muted-foreground">
                        {t('form.type.helper')}
                      </p>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 p-4 mt-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-red-900 dark:text-red-200">{t('dangerZone.title')}</h4>
                        <p className="text-xs text-red-700 dark:text-red-300/70">
                          {t('dangerZone.description')}
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
                </form>
              </TabsContent>

              <TabsContent value="members" className="mt-0">
                <WorkspaceMembersSettings workspaceId={workspaceId} />
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
            {t('actions.cancel')}
          </Button>
          {activeTab === "general" && (
            <Button
              type="submit"
              form="workspace-settings-form"
              disabled={updateWorkspaceMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 shadow-sm"
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
