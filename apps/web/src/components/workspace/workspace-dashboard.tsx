"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@ordo-todo/ui";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  CheckSquare,
  Users,
  Plus,
  Clock,
  ArrowRight,
  MoreHorizontal,
  Settings,
  Trash2,
  Briefcase,
  LayoutGrid,
  List
} from "lucide-react";
import { useProjects, useWorkspaceAuditLogs, useDeleteWorkspace } from "@/lib/api-hooks";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { ProjectCard } from "@/components/project/project-card";
import { WorkspaceSettingsDialog } from "@/components/workspace/workspace-settings-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/lib/error-handler";
import { useWorkspacePermissions } from "@/hooks/use-workspace-permissions";
import type { Workspace, WorkspaceAuditLog } from "@ordo-todo/api-client";
import type { LucideIcon } from "lucide-react";

interface WorkspaceDashboardProps {
  workspace: Workspace;
}

const typeConfig = {
  PERSONAL: { label: "Personal", color: "cyan", hexColor: "#06b6d4", icon: Briefcase },
  WORK: { label: "Work", color: "purple", hexColor: "#a855f7", icon: FolderKanban },
  TEAM: { label: "Team", color: "pink", hexColor: "#ec4899", icon: CheckSquare },
};

export function WorkspaceDashboard({ workspace }: WorkspaceDashboardProps) {
  const router = useRouter();
  const t = useTranslations('WorkspaceDashboard');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  const { data: projects, isLoading: isLoadingProjects } = useProjects(workspace.id);
  const { data: auditLogData, isLoading: isLoadingActivity } = useWorkspaceAuditLogs(workspace.id, { limit: 5 });

  const deleteWorkspace = useDeleteWorkspace();

  // Check permissions for current user
  const permissions = useWorkspacePermissions(workspace);

  const handleDelete = () => {
    if (confirm(t('deleteConfirmation'))) {
      deleteWorkspace.mutate(workspace.id, {
        onSuccess: () => {
          toast.success(t('deleteSuccess'));
          router.push("/workspaces");
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, t('deleteError')));
        }
      });
    }
  };



  const typeInfo = typeConfig[workspace.type as keyof typeof typeConfig] || typeConfig.PERSONAL;
  const TypeIcon = typeInfo.icon;
  // Backend returns { logs: [...], total: number }, extract the logs array
  const logs = auditLogData?.logs || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl border bg-card p-4 sm:p-6 shadow-sm">
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ backgroundColor: typeInfo.hexColor }}
        />
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl shadow-sm transition-transform hover:scale-105 flex-shrink-0"
              style={{
                backgroundColor: `${typeInfo.hexColor}15`,
                color: typeInfo.hexColor,
              }}
            >
              <TypeIcon className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold tracking-tight truncate">{workspace.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span
                  className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${typeInfo.hexColor}20`,
                    color: typeInfo.hexColor,
                  }}
                >
                  {typeInfo.label}
                </span>
                {workspace.description && (
                  <span className="text-muted-foreground text-xs sm:text-sm hidden sm:inline border-l pl-2 ml-2">
                    {workspace.description}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {permissions.canCreateProjects && (
              <Button
                onClick={() => setShowCreateProject(true)}
                className="gap-2 shadow-md transition-all hover:scale-105 flex-1 sm:flex-initial"
                size="sm"
                style={{
                  backgroundColor: typeInfo.hexColor,
                  borderColor: typeInfo.hexColor,
                }}
              >
                <Plus className="h-4 w-4" />
                {t('newProject')}
              </Button>
            )}
            {(permissions.canViewSettings || permissions.canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {permissions.canViewSettings && (
                    <DropdownMenuItem onClick={() => setShowSettings(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      {t('settings')}
                    </DropdownMenuItem>
                  )}
                  {permissions.canDelete && (
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('delete')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title={t('stats.projects')} 
          value={workspace.stats?.projectCount || 0} 
          icon={FolderKanban}
          color="blue"
        />
        <StatCard 
          title={t('stats.tasks')} 
          value={workspace.stats?.taskCount || 0} 
          icon={CheckSquare}
          color="green"
        />
        <StatCard 
          title={t('stats.members')} 
          value={workspace.stats?.memberCount || 0} 
          icon={Users}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-primary" />
              {t('projects')}
            </h2>
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoadingProjects ? (
            <ProjectsSkeleton viewMode={viewMode} />
          ) : !projects || projects.length === 0 ? (
            <EmptyProjectsState onCreate={() => setShowCreateProject(true)} />
          ) : (
            <div className={cn(
              viewMode === "grid"
                ? "grid gap-4 sm:grid-cols-2"
                : "space-y-3"
            )}>
              {projects.map((project: { id: string; slug?: string; name: string; description?: string | null; color?: string; archived?: boolean }, index: number) => (
                <ProjectCard
                  key={project.id}
                  project={project as Parameters<typeof ProjectCard>[0]['project']}
                  index={index}
                  workspaceSlug={workspace.slug}
                  ownerUsername={workspace.owner?.username ?? undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Activity & Quick Actions */}
        <div className="space-y-6">
          {/* Activity Feed */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                {t('recentActivity')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {isLoadingActivity ? (
                <div className="space-y-4 px-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm px-6">
                  {t('noActivity')}
                </div>
              ) : (
                <div className="divide-y">
                  {logs.map((log: WorkspaceAuditLog) => (
                    <div key={log.id} className="flex gap-3 p-4 hover:bg-muted/50 transition-colors">
                      <div className="mt-0.5 text-lg">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {formatAction(log.action)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="p-2 text-center border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-xs text-muted-foreground hover:text-primary"
                      onClick={() => setShowSettings(true)}
                    >
                      {t('viewAllActivity')} <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateProjectDialog
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
        workspaceId={workspace.id}
      />

      <WorkspaceSettingsDialog
        workspaceId={workspace.id}
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorStyles: Record<StatCardProps['color'], string> = {
    blue: "bg-blue-500/10 text-blue-600",
    green: "bg-green-500/10 text-green-600",
    purple: "bg-purple-500/10 text-purple-600",
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
        <div className={cn("p-2.5 sm:p-3 rounded-lg sm:rounded-xl", colorStyles[color])}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-xl sm:text-2xl font-bold">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-32 rounded-2xl bg-muted animate-pulse" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-4">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
        <div className="col-span-1">
          <div className="h-64 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function ProjectsSkeleton({ viewMode }: { viewMode: "list" | "grid" }) {
  return (
    <div className={cn(
      viewMode === "grid" 
        ? "grid gap-4 sm:grid-cols-2"
        : "space-y-3"
    )}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

function EmptyProjectsState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed rounded-xl bg-muted/30">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <FolderKanban className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
      <p className="text-muted-foreground mb-6 max-w-sm text-sm">
        Create your first project to start organizing your tasks and collaborating with your team.
      </p>
      <Button onClick={onCreate}>
        <Plus className="h-4 w-4 mr-2" />
        Create Project
      </Button>
    </div>
  );
}

// Helper functions for activity log
const getActionIcon = (action: string) => {
  const iconMap: Record<string, string> = {
    WORKSPACE_CREATED: "✨",
    WORKSPACE_UPDATED: "✏️",
    MEMBER_ADDED: "👤",
    MEMBER_REMOVED: "👋",
    MEMBER_INVITED: "📧",
    INVITATION_ACCEPTED: "✅",
    PROJECT_CREATED: "📁",
    PROJECT_DELETED: "🗑️",
    SETTINGS_UPDATED: "⚙️",
    WORKSPACE_ARCHIVED: "📦",
    WORKSPACE_DELETED: "❌",
  };
  return iconMap[action] || "📝";
};

const formatAction = (action: string) => {
  return action
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};
