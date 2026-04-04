"use client";

import { useState } from "react";
import { Settings, Plus, Users, ChevronDown, ChevronUp } from "lucide-react";
import { useWorkspace, useProjects, useTasks } from "@/lib/api-hooks";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { cn } from "@/lib/utils";
import { Button } from "@ordo-todo/ui";
import { WorkspaceSettingsDialog } from "./workspace-settings-dialog";
import { useTranslations } from "next-intl";
import { useWorkspacePermissions } from "@/hooks/use-workspace-permissions";
import type { Task } from "@ordo-todo/api-client";

interface WorkspaceInfoBarProps {
  onCreateProject?: () => void;
  onOpenSettings?: () => void;
}

export function WorkspaceInfoBar({
  onCreateProject,
  onOpenSettings,
}: WorkspaceInfoBarProps) {
  const t = useTranslations("WorkspaceInfoBar");
  const { selectedWorkspaceId } = useWorkspaceStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const { data: workspace } = useWorkspace(selectedWorkspaceId as string);
  const permissions = useWorkspacePermissions(workspace);

  const { data: projects } = useProjects(selectedWorkspaceId as string);

  // We want all tasks to count them, but useTasks usually filters by project.
  // If useTasks without args returns all tasks, we can use it.
  // Looking at api-hooks.ts: useTasks(projectId?: string) calls getTasks(projectId).
  // If projectId is undefined, it fetches all tasks (presumably for user/workspace context).
  const { data: tasks } = useTasks();

  if (!selectedWorkspaceId || !workspace) {
    return null;
  }

  const projectCount = projects?.length || 0;
  const taskCount = tasks?.length || 0;
  const activeTaskCount =
    tasks?.filter((t: Task) => t.status !== "COMPLETED").length || 0;

  return (
    <div
      className={cn(
        "relative mb-8 overflow-hidden rounded-2xl border transition-all duration-500",
        "bg-card text-card-foreground shadow-sm",
        isExpanded ? "p-6" : "p-4",
      )}
      style={{
        borderColor: `${workspace.color}30`,
      }}
    >
      {/* Left Accent Line */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300"
        style={{ backgroundColor: workspace.color }}
      />

      {/* Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl text-3xl shrink-0 border shadow-sm transition-transform hover:scale-105"
            style={{
              backgroundColor: `${workspace.color}10`,
              borderColor: `${workspace.color}20`,
              color: workspace.color,
            }}
          >
            {workspace.icon || "📁"}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold tracking-tight truncate">
                {workspace.name}
              </h2>
            </div>

            {isExpanded && workspace.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {workspace.description}
              </p>
            )}

            {/* Stats */}
            <div className="mt-4 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary/50" />
                <span className="font-medium text-foreground">
                  {projectCount}
                </span>
                {t("stats.projects", { count: projectCount })}
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-orange-400" />
                <span className="font-medium text-foreground">
                  {activeTaskCount}
                </span>
                {t("stats.activeTasks", { count: activeTaskCount })}
              </div>

              {taskCount > activeTaskCount && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="font-medium text-foreground">
                    {taskCount - activeTaskCount}
                  </span>
                  {t("stats.completed")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onCreateProject && permissions.canCreateProjects && (
            <Button
              onClick={onCreateProject}
              size="sm"
              className="gap-2"
              style={{
                backgroundColor: workspace.color,
                color: "white",
              }}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("actions.newProject")}
              </span>
            </Button>
          )}

          {onOpenSettings && permissions.canViewSettings && (
            <Button
              onClick={() => setShowSettings(true)}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{t("actions.settings")}</span>
            </Button>
          )}

          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Settings Dialog */}
      {selectedWorkspaceId && (
        <WorkspaceSettingsDialog
          workspaceId={selectedWorkspaceId}
          open={showSettings}
          onOpenChange={setShowSettings}
        />
      )}
    </div>
  );
}
