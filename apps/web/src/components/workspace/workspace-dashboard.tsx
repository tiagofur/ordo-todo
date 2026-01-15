"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ordo-todo/ui";
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
  List,
} from "lucide-react";
import {
  useProjects,
  useWorkspaceAuditLogs,
  useDeleteWorkspace,
  useCreateProject,
  useWorkflows,
  useCreateWorkflow,
} from "@/lib/api-hooks";
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

export function WorkspaceDashboard({ workspace }: WorkspaceDashboardProps) {
  const router = useRouter();
  const t = useTranslations("WorkspaceDashboard");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  const { data: projects, isLoading: isLoadingProjects } = useProjects(
    workspace.id,
  );
  const { data: auditLogData, isLoading: isLoadingActivity } =
    useWorkspaceAuditLogs(workspace.id, { limit: 5 });
  const { mutateAsync: createProject } = useCreateProject();
  const { data: workflows } = useWorkflows(workspace.id);
  const { mutateAsync: createWorkflow } = useCreateWorkflow();

  const deleteWorkspace = useDeleteWorkspace();

  // Check permissions for current user
  const permissions = useWorkspacePermissions(workspace);

  const handleDelete = () => {
    if (confirm(t("deleteConfirmation"))) {
      deleteWorkspace.mutate(workspace.id, {
        onSuccess: () => {
          toast.success(t("deleteSuccess"));
          router.push("/workspaces");
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, t("deleteError")));
        },
      });
    }
  };

  const workspaceColor = workspace.color || "#06b6d4";
  const TypeIcon = Briefcase;
  // Backend returns { logs: [...], total: number }, extract logs array
  const logs = auditLogData?.logs || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl shadow-lg transition-transform hover:scale-105 flex-shrink-0"
            style={{
              backgroundColor: workspaceColor,
              boxShadow: `0 8px 16px -4px ${workspaceColor}40`,
            }}
          >
            <span className="text-2xl sm:text-3xl text-white">
              {workspace.icon || "🏢"}
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
              {workspace.name}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base font-medium truncate opacity-80">
              {workspace.description || t("workspaceDescription") || "Gestión del espacio de trabajo"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {permissions.canCreateProjects && (
            <Button
              onClick={() => setShowCreateProject(true)}
              className="gap-2 shadow-lg transition-all hover:scale-105 px-4 h-10 sm:h-11"
              style={{
                backgroundColor: workspaceColor,
                borderColor: workspaceColor,
                boxShadow: `0 4px 12px -2px ${workspaceColor}40`,
              }}
            >
              <Plus className="h-5 w-5" />
              <span className="font-semibold">{t("newProject")}</span>
            </Button>
          )}
          {(permissions.canViewSettings || permissions.canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-xl border-muted/20">
                {permissions.canViewSettings && (
                  <DropdownMenuItem onClick={() => setShowSettings(true)} className="rounded-lg gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    {t("settings")}
                  </DropdownMenuItem>
                )}
                {permissions.canDelete && (
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg gap-2 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("delete")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <StatCard
          title={t("stats.projects")}
          value={workspace.stats?.projectCount || 0}
          icon={FolderKanban}
          color="blue"
        />
        <StatCard
          title={t("stats.tasks")}
          value={workspace.stats?.taskCount || 0}
          icon={CheckSquare}
          color="green"
        />
        <StatCard
          title={t("stats.members")}
          value={workspace.stats?.memberCount || 0}
          icon={Users}
          color="purple"
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Main Content: Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FolderKanban className="h-5 w-5" style={{ color: workspaceColor }} />
              {t("projects")}
            </h2>
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
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
            <div
              className={cn(
                viewMode === "grid" ? "grid gap-4 sm:grid-cols-2" : "space-y-3",
              )}
            >
              {projects.map(
                (
                  project: {
                    id: string;
                    slug?: string;
                    name: string;
                    description?: string | null;
                    color?: string;
                    archived?: boolean;
                  },
                  index: number,
                ) => (
                  <ProjectCard
                    key={project.id}
                    project={
                      project as Parameters<typeof ProjectCard>[0]["project"]
                    }
                    index={index}
                    workspaceSlug={workspace.slug}
                    ownerUsername={workspace.owner?.username ?? undefined}
                  />
                ),
              )}
            </div>
          )}
        </div>

        {/* Sidebar: Activity & Quick Actions */}
        <div className="space-y-6">
          {/* Activity Feed */}
          <Card className="rounded-2xl bg-card border-muted/20 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" style={{ color: workspaceColor }} />
                {t("recentActivity")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-2">
              {isLoadingActivity ? (
                <div className="space-y-4 px-6 py-4">
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
                <div className="text-center py-10 text-muted-foreground text-sm px-6">
                  {t("noActivity")}
                </div>
              ) : (
                <div className="divide-y divide-muted/10">
                  {logs.map((log: WorkspaceAuditLog) => (
                    <div
                      key={log.id}
                      className="flex gap-3 p-4 hover:bg-muted/30 transition-colors animate-in fade-in slide-in-from-left-2 duration-300"
                    >
                      <div className="mt-0.5 text-lg flex-shrink-0">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-foreground/90">
                          {formatAction(log.action)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3 opacity-50" />
                          {formatDistanceToNow(new Date(log.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 bg-muted/10 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => setShowSettings(true)}
                    >
                      {t("viewAllActivity")}{" "}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <CreateProjectDialog
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
        workspaceId={workspace.id}
        workflows={workflows?.map((w) => ({ id: w.id, name: w.name })) || []}
        onSubmit={async (data, templateTasks) => {
          let workflowId = data.workflowId;

          // If workflowId is "NEW" or empty, we need to determine what to do
          if (!workflowId || workflowId === "NEW") {
            // If we have existing workflows, use first one
            if (workflows && workflows.length > 0) {
              workflowId = workflows[0].id;
            } else {
              // Otherwise create a default workflow
              const newWorkflow = await createWorkflow({
                name: "Default Workflow",
                workspaceId: workspace.id,
              });
              workflowId = newWorkflow.id;
            }
          }

          await createProject({
            name: data.name,
            description: data.description,
            color: data.color,
            workspaceId: data.workspaceId,
            workflowId: workflowId,
          });
          setShowCreateProject(false);
        }}
        onCreateWorkflow={async (wsId) => {
          const newWorkflow = await createWorkflow({
            name: "Default Workflow",
            workspaceId: wsId,
          });
          return newWorkflow.id;
        }}
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
  color: "blue" | "green" | "purple";
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorStyles: Record<StatCardProps["color"], string> = {
    blue: "bg-blue-500/10 text-blue-600",
    green: "bg-green-500/10 text-green-600",
    purple: "bg-purple-500/10 text-purple-600",
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
        <div
          className={cn(
            "p-2.5 sm:p-3 rounded-lg sm:rounded-xl",
            colorStyles[color],
          )}
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            {title}
          </p>
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
    <div
      className={cn(
        viewMode === "grid" ? "grid gap-4 sm:grid-cols-2" : "space-y-3",
      )}
    >
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
        Create your first project to start organizing your tasks and
        collaborating with your team.
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
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};
