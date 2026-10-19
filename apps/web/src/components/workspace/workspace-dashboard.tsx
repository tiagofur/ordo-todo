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
import { useRouter } from "@/i18n/navigation";
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
  useCreateTask,
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
import { useConfirm } from "@/components/shared/confirm-dialog";
import type { Workspace, WorkspaceAuditLog, TaskPriority } from "@ordo-todo/api-client";
import type { LucideIcon } from "lucide-react";

interface WorkspaceDashboardProps {
  workspace: Workspace;
}

export function WorkspaceDashboard({ workspace }: WorkspaceDashboardProps) {
  const router = useRouter();
  const t = useTranslations("WorkspaceDashboard");
  const { confirm, ConfirmModal } = useConfirm();
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  const { data: projects, isLoading: isLoadingProjects } = useProjects(
    workspace.id,
  );
  const { data: auditLogData, isLoading: isLoadingActivity } =
    useWorkspaceAuditLogs(workspace.id, { limit: 5 });
  const { mutateAsync: createProject } = useCreateProject();
  const { mutateAsync: createTask } = useCreateTask();
  const { data: workflows } = useWorkflows(workspace.id);
  const { mutateAsync: createWorkflow } = useCreateWorkflow();

  const deleteWorkspace = useDeleteWorkspace();

  // Check permissions for current user
  const permissions = useWorkspacePermissions(workspace);

  const handleDelete = async () => {
    const ok = await confirm({
      title: t("delete"),
      description: t("deleteConfirmation"),
      variant: "destructive",
    });
    if (ok) {
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
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-6 shadow-xs">
        {/* Ambient glow top right */}
        <div
          className="absolute -top-12 -right-12 h-32 w-32 rounded-full blur-2xl opacity-15 pointer-events-none"
          style={{ backgroundColor: workspaceColor }}
        />
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div
              className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border shadow-xs transition-transform hover:scale-105 flex-shrink-0 text-2xl select-none"
              style={{
                backgroundColor: `${workspaceColor}14`,
                borderColor: `${workspaceColor}30`,
                color: workspaceColor,
              }}
            >
              {workspace.icon || <TypeIcon className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: workspaceColor }} />}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                {workspace.name}
              </h1>
              {workspace.description && (
                <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 line-clamp-1">
                  {workspace.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {permissions.canCreateProjects && (
              <Button
                onClick={() => setShowCreateProject(true)}
                className="gap-2 shadow-md transition-all hover:scale-105 flex-1 sm:flex-initial"
                size="sm"
                style={{
                  backgroundColor: workspaceColor,
                  borderColor: workspaceColor,
                }}
              >
                <Plus className="h-4 w-4" />
                {t("newProject")}
              </Button>
            )}
            {(permissions.canViewSettings || permissions.canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 flex-shrink-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {permissions.canViewSettings && (
                    <DropdownMenuItem onClick={() => setShowSettings(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      {t("settings")}
                    </DropdownMenuItem>
                  )}
                  {permissions.canDelete && (
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("delete")}
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
          title={t("stats.projects")}
          value={workspace.stats?.projectCount || 0}
          icon={FolderKanban}
          color="blue"
          delay={0}
        />
        <StatCard
          title={t("stats.tasks")}
          value={workspace.stats?.taskCount || 0}
          icon={CheckSquare}
          color="green"
          delay={0.05}
        />
        <StatCard
          title={t("stats.members")}
          value={workspace.stats?.memberCount || 0}
          icon={Users}
          color="purple"
          delay={0.1}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-primary" />
              {t("projects")}
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                {t("recentActivity")}
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
                  {t("noActivity")}
                </div>
              ) : (
                <div className="divide-y">
                  {logs.map((log: WorkspaceAuditLog) => (
                    <div
                      key={log.id}
                      className="flex gap-3 p-4 hover:bg-muted transition-colors"
                    >
                      <div className="mt-0.5 text-lg">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {formatAction(log.action)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(log.createdAt), {
                            addSuffix: true,
                          })}
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
                      {t("viewAllActivity")}{" "}
                      <ArrowRight className="h-3 w-3 ml-1" />
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

          const newProject = await createProject({
            name: data.name,
            description: data.description,
            color: data.color,
            workspaceId: data.workspaceId,
            workflowId: workflowId,
          });

          if (templateTasks && templateTasks.length > 0 && newProject?.id) {
            await Promise.all(
              templateTasks.map((task) =>
                createTask({
                  title: task.title,
                  description: task.description,
                  priority: (task.priority as TaskPriority) || 'MEDIUM',
                  projectId: newProject.id,
                })
              )
            );
          }

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
      <ConfirmModal />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: "blue" | "green" | "purple";
  delay?: number;
}

const colorConfig: Record<
  StatCardProps["color"],
  { hex: string; bg: string; text: string }
> = {
  blue: {
    hex: "#3b82f6",
    bg: "bg-blue-500/15",
    text: "text-blue-600 dark:text-blue-400",
  },
  green: {
    hex: "#10b981",
    bg: "bg-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  purple: {
    hex: "#8b5cf6",
    bg: "bg-purple-500/15",
    text: "text-purple-600 dark:text-purple-400",
  },
};

function StatCard({ title, value, icon: Icon, color, delay = 0 }: StatCardProps) {
  const cfg = colorConfig[color] || colorConfig.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        y: -4,
        borderColor: `${cfg.hex}70`,
        boxShadow: `0 12px 28px -6px ${cfg.hex}25`,
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 cursor-pointer shadow-xs transition-colors"
    >
      <div className="flex items-center gap-3.5">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-105",
            cfg.bg,
            cfg.text,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground tabular-nums mt-0.5">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
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
  const t = useTranslations("Projects");
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-border rounded-2xl bg-card">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
        <FolderKanban className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{t("noProjects")}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm text-sm">
        {t("noProjectsDescription")}
      </p>
      <Button onClick={onCreate} className="gap-2">
        <Plus className="h-4 w-4" />
        {t("createProject")}
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
