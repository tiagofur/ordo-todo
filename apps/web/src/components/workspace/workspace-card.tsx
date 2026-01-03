"use client";

import { useRouter } from "@/i18n/navigation";
import { useDeleteWorkspace } from "@/lib/api-hooks";
import { WorkspaceCard as UIWorkspaceCard } from "@ordo-todo/ui";
import { toast } from "sonner";
import { useState } from "react";
import { WorkspaceSettingsDialog } from "./workspace-settings-dialog";
import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/lib/error-handler";
import { useWorkspacePermissions } from "@/hooks/use-workspace-permissions";
import type { Workspace } from "@ordo-todo/api-client";

interface WorkspaceCardProps {
  workspace: Workspace;
  index?: number;
}

/**
 * WorkspaceCard Container - Handles business logic and state for workspace display.
 * Uses UIWorkspaceCard from @ordo-todo/ui for presentation.
 */
export function WorkspaceCard({ workspace, index = 0 }: WorkspaceCardProps) {
  const t = useTranslations('WorkspaceCard');
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);

  const deleteWorkspaceMutation = useDeleteWorkspace();
  const permissions = useWorkspacePermissions(workspace);

  const handleCardClick = () => {
    // Navigate to workspace detail page using username/slug pattern
    if (workspace.owner?.username) {
      router.push(`/${workspace.owner.username}/${workspace.slug}`);
    } else {
      // Fallback to old route if owner username is not available
      router.push(`/workspaces/${workspace.slug}`);
    }
  };

  const handleDelete = async (workspaceId: string) => {
    if (confirm(t('confirmDelete', { name: workspace.name }))) {
      try {
        await deleteWorkspaceMutation.mutateAsync(workspaceId);
        toast.success(t('toast.deleted'));
      } catch (error) {
        toast.error(getErrorMessage(error, t('toast.deleteError')));
      }
    }
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  // Adapt data for UI component
  const workspaceData = {
    ...workspace,
    projectsCount: workspace.stats?.projectCount,
    tasksCount: workspace.stats?.taskCount,
  };

  // Permissions-based actions logic
  const canModify = permissions.canViewSettings || permissions.canDelete;

  return (
    <>
      <UIWorkspaceCard
        workspace={workspaceData}
        index={index}
        onWorkspaceClick={handleCardClick}
        onDelete={permissions.canDelete ? handleDelete : undefined}
        onOpenSettings={permissions.canViewSettings ? handleSettings : undefined}
        labels={{
          types: {
            PERSONAL: t('types.PERSONAL'),
            WORK: t('types.WORK'),
            TEAM: t('types.TEAM'),
          },
          status: {
            active: t('status.active'),
          },
          stats: {
            projects: (count) => t('stats.projects', { count }),
            tasks: (count) => t('stats.tasks', { count }),
          },
          actions: {
            settings: t('actions.settings'),
            delete: t('actions.delete'),
            moreOptions: t('actions.moreOptions'),
          },
        }}
      />

      <WorkspaceSettingsDialog
        workspaceId={workspace.id}
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </>
  );
}
