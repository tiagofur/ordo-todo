import { useState } from "react";
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
import { useWorkspaceBySlug, useWorkspaceAuditLogs, useDeleteWorkspace } from "@/hooks/api/use-workspaces";
import { useProjects } from "@/hooks/api/use-projects";
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

const typeConfig = {
  PERSONAL: { label: "Personal", color: "cyan", hexColor: "#06b6d4", icon: Briefcase },
  WORK: { label: "Work", color: "purple", hexColor: "#a855f7", icon: FolderKanban },
  TEAM: { label: "Team", color: "pink", hexColor: "#ec4899", icon: CheckSquare },
};

export function WorkspaceDetail() {
  const { workspaceSlug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const { data: workspace, isLoading: isLoadingWorkspace } = useWorkspaceBySlug(workspaceSlug || "");
  
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

  const typeInfo = typeConfig[workspace.type as keyof typeof typeConfig] || typeConfig.PERSONAL;
  const TypeIcon = typeInfo.icon;
  const logs = Array.isArray(activityData) ? activityData : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm">
        <div 
          className="absolute left-0 top-0 bottom-0 w-1.5" 
          style={{ backgroundColor: typeInfo.hexColor }} 
        />
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm transition-transform hover:scale-105"
              style={{
                backgroundColor: `${typeInfo.hexColor}15`,
                color: typeInfo.hexColor,
              }}
            >
              <TypeIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{workspace.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span 
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${typeInfo.hexColor}20`,
                    color: typeInfo.hexColor,
                  }}
                >
                  {typeInfo.label}
                </span>
                {workspace.description && (
                  <span className="text-muted-foreground text-sm border-l pl-2 ml-2">
                    {workspace.description}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setShowCreateProject(true)}
              className="gap-2 shadow-md transition-all hover:scale-105"
              style={{ 
                backgroundColor: typeInfo.hexColor,
                borderColor: typeInfo.hexColor,
              }}
            >
              <Plus className="h-4 w-4" />
              {t('projects.newProject') || "Nuevo Proyecto"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowSettings(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  {t('common.settings') || "Configuración"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('common.delete') || "Eliminar"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-primary" />
              {t('projects.title') || "Proyectos"}
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
              {projects.map((project: any) => (
                <ProjectCard key={project.id} project={project} /> // Removed index and workspaceSlug prop if not needed by desktop ProjectCard
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
                {t('activity.recent') || "Actividad Reciente"}
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
                  {t('activity.none') || "No hay actividad reciente"}
                </div>
              ) : (
                <div className="divide-y">
                  {logs.map((log: any) => (
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
                      {t('activity.viewAll') || "Ver toda la actividad"} <ArrowRight className="h-3 w-3 ml-1" />
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

function StatCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) {
  const colorStyles: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-600",
    green: "bg-green-500/10 text-green-600",
    purple: "bg-purple-500/10 text-purple-600",
  };

  return (
    <Card>
      <CardContent className="p-6 flex items-center gap-4">
        <div className={cn("p-3 rounded-xl", colorStyles[color])}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </CardContent>
    </Card>
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
