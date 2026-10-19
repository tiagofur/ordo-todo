import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
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
  Loader2
} from "lucide-react";
import { useWorkspace, useDesktopWorkspaceBySlug, useUpdateWorkspace, useDeleteWorkspace, useWorkspaceAuditLogs } from "@/hooks/api";
import { useProjects } from "@/hooks/api";
import {
  cn,
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
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { ProjectCard } from "@/components/project/project-card";
import { WorkspaceSettingsDialog } from "@/components/workspace/WorkspaceSettingsDialog";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";

export function WorkspaceDetail() {
  const { workspaceSlug, username, slug, id } = useParams();
  const navigate = useNavigate();
  const { t } = (useTranslation as any)();

  // Determine which method to use based on available params:
  // 1. If we have an ID parameter (old Desktop route: /workspaces/:id), use useWorkspace(id)
  // 2. If we have username + slug (new route: /:username/:slug), use by username/slug
  // 3. Otherwise use the old by-slug method
  const workspaceId = id || workspaceSlug;
  const actualSlug = slug || workspaceSlug || "";

  // Use the appropriate query based on what params exist
  const workspaceByIdQuery = useWorkspace(workspaceId || "");
  const workspaceBySlugQuery = useDesktopWorkspaceBySlug(workspaceId ? "" : actualSlug, username);

  const workspace = workspaceId ? workspaceByIdQuery.data : workspaceBySlugQuery.data;
  const isLoadingWorkspace = workspaceId ? workspaceByIdQuery.isLoading : workspaceBySlugQuery.isLoading;

  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  const { data: projects, isLoading: isLoadingProjects } = useProjects(workspace?.id);
  const { data: activityData, isLoading: isLoadingActivity } = useWorkspaceAuditLogs(workspace?.id || "", { limit: 5 });

  const deleteWorkspace = useDeleteWorkspace();

  const handleDelete = () => {
    if (confirm(t('common.deleteConfirmation') || "¿Estás seguro de eliminar este workspace?")) {
      deleteWorkspace.mutate(workspace!.id, {
        onSuccess: () => {
          toast.success(t('common.deleteSuccess') || "Workspace eliminado correctamente");
          navigate("/workspaces");
        }
      });
    }
  };

  if (isLoadingWorkspace) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-2xl font-bold">{t('errors.notFound') || "Workspace no encontrado"}</h2>
        <Button onClick={() => navigate("/workspaces")} className="mt-4">
          {t('common.backToWorkspaces') || "Volver a Workspaces"}
        </Button>
      </div>
    );
  }

  // Use custom color and icon from workspace
  const workspaceColor = workspace.color || "#2563EB";
  const workspaceIcon = workspace.icon || "🏠";
  const logs = Array.isArray(activityData) ? activityData : [];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-transform hover:scale-105 flex-shrink-0"
            style={{
              backgroundColor: workspaceColor,
              boxShadow: `0 8px 16px -4px ${workspaceColor}40`,
            }}
          >
            <span className="text-3xl text-white">{workspaceIcon}</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold tracking-tight truncate">{workspace.name}</h1>
            <p className="text-muted-foreground font-medium opacity-80 truncate">
              {workspace.description || t('workspace.manageDescription') || "Gestión del espacio de trabajo"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowCreateProject(true)}
            className="gap-2 shadow-lg transition-all hover:scale-105 h-11 px-4"
            style={{
              backgroundColor: workspaceColor,
              borderColor: workspaceColor,
              boxShadow: `0 4px 12px -2px ${workspaceColor}40`,
            }}
          >
            <Plus className="h-5 w-5" />
            <span className="font-semibold">{t('projects.newProject') || "Nuevo Proyecto"}</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-xl border-muted/20">
              <DropdownMenuItem onClick={() => setShowSettings(true)} className="rounded-lg gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                {t('common.settings') || "Configuración"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg gap-2 cursor-pointer">
                <Trash2 className="h-4 w-4" />
                {t('common.delete') || "Eliminar"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          title={t('stats.projects') || "Proyectos"} 
          value={workspace.stats?.projectCount || 0} 
          icon={FolderKanban}
          color="blue"
        />
        <StatCard 
          title={t('stats.tasks') || "Tareas"} 
          value={workspace.stats?.taskCount || 0} 
          icon={CheckSquare}
          color="green"
        />
        <StatCard 
          title={t('stats.members') || "Miembros"} 
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
              {t('projects.title') || "Proyectos"}
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
            <div className={cn(
              viewMode === "grid" 
                ? "grid gap-4 sm:grid-cols-2"
                : "space-y-3"
            )}>
              {projects.map((project: any) => (
                <ProjectCard key={project.id} project={project} /> // Removed index and workspaceSlug prop if not needed by desktop ProjectCard
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Activity & Quick Actions */}
        <div className="space-y-6">
          {/* Activity Feed */}
          <Card className="rounded-2xl border-muted/20 shadow-sm overflow-hidden bg-card">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" style={{ color: workspaceColor }} />
                {t('activity.recent') || "Actividad Reciente"}
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
                  {t('activity.none') || "No hay actividad reciente"}
                </div>
              ) : (
                <div className="divide-y divide-muted/10">
                  {logs.map((log: any) => (
                    <div key={log.id} className="flex gap-3 p-4 hover:bg-muted/30 transition-colors animate-in fade-in slide-in-from-left-2 duration-300">
                      <div className="mt-0.5 text-lg flex-shrink-0">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-foreground/90">
                          {formatAction(log.action)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3 opacity-50" />
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
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
                      {t('activity.viewAll') || "Ver toda la actividad"} <ArrowRight className="h-3 w-3 ml-1" />
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
      />

      <WorkspaceSettingsDialog
        workspaceId={workspace.id}
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  );
}

const statColorConfig: Record<
  string,
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

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) {
  const cfg = statColorConfig[color] || statColorConfig.blue;

  return (
    <motion.div
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
            cfg.text
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
