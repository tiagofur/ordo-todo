import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Building2,
  LayoutList,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import {
  useDeletedTasks,
  useRestoreTask,
  usePermanentDeleteTask,
  useDeletedProjects,
  useRestoreProject,
  usePermanentDeleteProject,
  useDeletedWorkspaces,
  useRestoreWorkspace,
  usePermanentDeleteWorkspace,
  useWorkspaces,
  useAllProjects,
} from "@/lib/shared-hooks";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { es, enUS, ptBR } from "date-fns/locale";
import { cn, Tabs, TabsContent, TabsList, TabsTrigger, Button, Badge } from "@ordo-todo/ui";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";
import { PageTransition, SlideIn } from "@/components/motion";
import { useWorkspaceStore } from "@/stores/workspace-store";

export type TrashTab = "tasks" | "projects" | "workspaces";

export interface UnifiedTrashViewProps {
  defaultTab?: TrashTab;
  initialWorkspaceId?: string;
  initialProjectId?: string;
}

function formatDeletedAt(
  deletedAt: string | Date | null | undefined,
  locale: any,
  fallback: string
): string {
  if (!deletedAt) return fallback;
  try {
    const date = new Date(deletedAt);
    if (isNaN(date.getTime())) return fallback;
    return formatDistanceToNow(date, { addSuffix: true, locale });
  } catch {
    return fallback;
  }
}

export function TasksTrash({
  defaultTab = "tasks",
  initialWorkspaceId = "",
  initialProjectId = "",
}: UnifiedTrashViewProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";
  const dateLocale = currentLang.startsWith("es")
    ? es
    : currentLang.startsWith("pt")
      ? ptBR
      : enUS;
  const { confirm, ConfirmModal } = useConfirm();

  const { type } = useParams<{ type?: string }>();
  const navigate = useNavigate();

  const validTab: TrashTab =
    type === "projects" || type === "workspaces" || type === "tasks"
      ? type
      : defaultTab;

  const [activeTab, setActiveTab] = useState<TrashTab>(validTab);
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<string>(initialWorkspaceId);
  const [selectedProject, setSelectedProject] =
    useState<string>(initialProjectId);

  const { selectedWorkspaceId } = useWorkspaceStore();

  useEffect(() => {
    if (type && (type === "projects" || type === "workspaces" || type === "tasks")) {
      setActiveTab(type);
    }
  }, [type]);

  const handleTabChange = (newTab: TrashTab) => {
    setActiveTab(newTab);
    navigate(`/trash/${newTab}`);
  };

  // Workspaces
  const {
    data: deletedWorkspaces,
    isLoading: isLoadingWorkspaces,
    refetch: refetchWorkspaces,
  } = useDeletedWorkspaces();
  const restoreWorkspace = useRestoreWorkspace();
  const permanentDeleteWorkspace = usePermanentDeleteWorkspace();

  // Projects
  const { data: workspaces } = useWorkspaces();
  const {
    data: deletedProjects,
    isLoading: isLoadingProjects,
    refetch: refetchProjects,
  } = useDeletedProjects(selectedWorkspace);
  const restoreProject = useRestoreProject();
  const permanentDeleteProject = usePermanentDeleteProject();

  // Tasks
  const { data: allProjects } = useAllProjects();
  // ODD 021: el sentinel "__none__" (= "Sin proyecto") consulta sin projectId
  const NO_PROJECT_SENTINEL = "__none__";
  const isNoProjectSelection = selectedProject === NO_PROJECT_SENTINEL;
  const deletedTasksProjectId = isNoProjectSelection
    ? ""
    : selectedProject || undefined;
  const {
    data: deletedTasks,
    isLoading: isLoadingTasks,
    refetch: refetchTasks,
  } = useDeletedTasks(deletedTasksProjectId);
  const restoreTask = useRestoreTask();
  const permanentDeleteTask = usePermanentDeleteTask();

  const [itemToRestore, setItemToRestore] = useState<{
    type: TrashTab;
    id: string;
  } | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{
    type: TrashTab;
    id: string;
  } | null>(null);

  // Auto-select workspace and project if not provided
  useEffect(() => {
    if (!selectedWorkspace && workspaces && workspaces.length > 0) {
      const match =
        selectedWorkspaceId &&
        workspaces.some((w: any) => w.id === selectedWorkspaceId)
          ? selectedWorkspaceId
          : workspaces[0].id;
      setSelectedWorkspace(match);
    }
  }, [workspaces, selectedWorkspace, selectedWorkspaceId]);

  useEffect(() => {
    if (!selectedProject && allProjects && allProjects.length > 0) {
      setSelectedProject(allProjects[0].id);
    }
  }, [allProjects, selectedProject]);

  const handleRestore = async (type: TrashTab, id: string) => {
    setItemToRestore({ type, id });
    try {
      switch (type) {
        case "workspaces":
          await restoreWorkspace.mutateAsync(id);
          await refetchWorkspaces();
          toast.success(t("UnifiedTrash.restoreSuccess", "Espacio restaurado"));
          break;
        case "projects":
          await restoreProject.mutateAsync(id);
          await refetchProjects();
          toast.success(t("UnifiedTrash.restoreSuccess", "Proyecto restaurado"));
          break;
        case "tasks":
          await restoreTask.mutateAsync(id);
          await refetchTasks();
          toast.success(t("UnifiedTrash.restoreSuccess", "Tarea restaurada"));
          break;
      }
    } catch {
      toast.error(t("UnifiedTrash.restoreError", "Error al restaurar elemento"));
    } finally {
      setItemToRestore(null);
    }
  };

  const handlePermanentDelete = async (type: TrashTab, id: string) => {
    const confirmed = await confirm({
      title: t("UnifiedTrash.deletePermanently", "Eliminar permanentemente"),
      description: t(
        "UnifiedTrash.confirmDelete",
        "¿Estás seguro de que quieres eliminar permanentemente este elemento? Esta acción NO se puede deshacer."
      ),
      confirmLabel: t("UnifiedTrash.deletePermanently", "Eliminar permanentemente"),
      variant: "destructive",
    });
    if (!confirmed) return;

    setItemToDelete({ type, id });
    try {
      switch (type) {
        case "workspaces":
          await permanentDeleteWorkspace.mutateAsync(id);
          await refetchWorkspaces();
          toast.success(t("UnifiedTrash.deleteSuccess", "Espacio eliminado permanentemente"));
          break;
        case "projects":
          await permanentDeleteProject.mutateAsync(id);
          await refetchProjects();
          toast.success(t("UnifiedTrash.deleteSuccess", "Proyecto eliminado permanentemente"));
          break;
        case "tasks":
          await permanentDeleteTask.mutateAsync(id);
          await refetchTasks();
          toast.success(t("UnifiedTrash.deleteSuccess", "Tarea eliminada permanentemente"));
          break;
      }
    } catch {
      toast.error(t("UnifiedTrash.deleteError", "Error al eliminar permanentemente"));
    } finally {
      setItemToDelete(null);
    }
  };

  const isProcessing = (type: TrashTab, id: string) => {
    return (
      (itemToRestore?.type === type && itemToRestore?.id === id) ||
      (itemToDelete?.type === type && itemToDelete?.id === id)
    );
  };

  const selectedWorkspaceObj = workspaces?.find(
    (w: any) => w.id === selectedWorkspace
  );
  const selectedProjectObj = allProjects?.find(
    (p: any) => p.id === selectedProject
  );

  return (
    <PageTransition>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Apple Style Unified Header */}
        <SlideIn direction="top">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-sm shadow-rose-500/25 shrink-0">
                <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight truncate">
                  {t("UnifiedTrash.title", "Papelera")}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span>
                    {t(
                      "UnifiedTrash.subtitle",
                      "Recupera o elimina permanentemente tus elementos antes de 30 días"
                    )}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refetchWorkspaces();
                  refetchProjects();
                  refetchTasks();
                }}
                className="gap-2 rounded-xl border-border/60 hover:bg-muted/50 cursor-pointer shadow-xs"
              >
                <RefreshCw className="h-4 w-4 text-rose-500" />
                <span>{t("UnifiedTrash.refresh", "Actualizar")}</span>
              </Button>
            </div>
          </div>
        </SlideIn>

        {/* 4 Apple-Grade KPI Cards with Micro-Halos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total en Papelera */}
          <div
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#f43f5e70";
              e.currentTarget.style.boxShadow =
                "0 10px 25px -5px rgba(244, 63, 94, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Papelera
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 transition-transform duration-300 group-hover:scale-110">
                <Trash2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {(deletedTasks?.length || 0) +
                (deletedProjects?.length || 0) +
                (deletedWorkspaces?.length || 0)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground truncate">
              Elementos pendientes de purga
            </p>
          </div>

          {/* Card 2: Tareas */}
          <div
            onClick={() => handleTabChange("tasks")}
            role="button"
            tabIndex={0}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#a855f770";
              e.currentTarget.style.boxShadow =
                "0 10px 25px -5px rgba(168, 85, 247, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Tareas
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 transition-transform duration-300 group-hover:scale-110">
                <CheckCircle2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {deletedTasks?.length || 0}
            </p>
            <p className="mt-1 text-xs text-muted-foreground truncate">
              {selectedProjectObj ? selectedProjectObj.name : "Tareas eliminadas"}
            </p>
          </div>

          {/* Card 3: Proyectos */}
          <div
            onClick={() => handleTabChange("projects")}
            role="button"
            tabIndex={0}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#ec489970";
              e.currentTarget.style.boxShadow =
                "0 10px 25px -5px rgba(236, 72, 153, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Proyectos
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500 transition-transform duration-300 group-hover:scale-110">
                <LayoutList className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {deletedProjects?.length || 0}
            </p>
            <p className="mt-1 text-xs text-muted-foreground truncate">
              {selectedWorkspaceObj ? selectedWorkspaceObj.name : "Proyectos eliminados"}
            </p>
          </div>

          {/* Card 4: Espacios */}
          <div
            onClick={() => handleTabChange("workspaces")}
            role="button"
            tabIndex={0}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#f9731670";
              e.currentTarget.style.boxShadow =
                "0 10px 25px -5px rgba(249, 115, 22, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Espacios
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 transition-transform duration-300 group-hover:scale-110">
                <Building2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {deletedWorkspaces?.length || 0}
            </p>
            <p className="mt-1 text-xs text-muted-foreground truncate">
              Organizaciones eliminadas
            </p>
          </div>
        </div>

        {/* Apple Warning Banner */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 dark:border-amber-500/30 dark:bg-amber-500/5 transition-colors">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-amber-900 dark:text-amber-200 text-sm sm:text-base">
                {t("UnifiedTrash.warningTitle", "Zona de Recuperación")}
              </h3>
              <p className="text-xs sm:text-sm text-amber-800/90 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                {t(
                  "UnifiedTrash.warningDescription",
                  "Los elementos en la papelera se conservan durante 30 días antes de ser eliminados permanentemente. Puedes restaurarlos a su ubicación original en cualquier momento."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => handleTabChange(v as TrashTab)}
          className="w-full space-y-6"
        >
          <TabsList className="bg-card border border-border/60 p-1 rounded-2xl shadow-xs">
            <TabsTrigger
              value="tasks"
              className={cn(
                "flex items-center gap-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer",
                activeTab === "tasks"
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <CheckCircle2 className="h-4 w-4 text-purple-500" />
              <span>{t("UnifiedTrash.tabs.tasks", "Tareas")}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                {deletedTasks?.length || 0}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="projects"
              className={cn(
                "flex items-center gap-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer",
                activeTab === "projects"
                  ? "bg-pink-500/10 text-pink-600 dark:text-pink-400 shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <LayoutList className="h-4 w-4 text-pink-500" />
              <span>{t("UnifiedTrash.tabs.projects", "Proyectos")}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-pink-500/10 text-pink-600 dark:text-pink-400">
                {deletedProjects?.length || 0}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="workspaces"
              className={cn(
                "flex items-center gap-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer",
                activeTab === "workspaces"
                  ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Building2 className="h-4 w-4 text-orange-500" />
              <span>{t("UnifiedTrash.tabs.workspaces", "Espacios")}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400">
                {deletedWorkspaces?.length || 0}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: TAREAS */}
          <TabsContent value="tasks" className="space-y-4">
            {allProjects && allProjects.length > 0 && (
              <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label
                  htmlFor="project-filter"
                  className="text-xs sm:text-sm font-medium text-muted-foreground"
                >
                  {t("UnifiedTrash.filterByProject", "Filtrar por Proyecto")}
                </label>
                <div className="relative inline-flex items-center w-full sm:w-72">
                  <select
                    id="project-filter"
                    aria-label="Filtrar por Proyecto"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full appearance-none bg-muted/40 border border-border/60 rounded-xl pl-3.5 pr-9 py-2 text-sm font-medium text-foreground hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-colors cursor-pointer shadow-xs"
                  >
                    <option value="__none__">
                      {t("UnifiedTrash.noProject", "Sin proyecto")}
                    </option>
                    {allProjects.map((project: any) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}

            {isLoadingTasks ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-28 rounded-2xl bg-card border border-border/60"
                  />
                ))}
              </div>
            ) : deletedTasks && deletedTasks.length > 0 ? (
              <div className="space-y-3">
                {deletedTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="group relative rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-all duration-300 hover:border-purple-500/40 hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-foreground truncate">
                            {task.title}
                          </h3>
                        </div>

                        {task.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1">
                            {task.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2.5 mt-2.5 text-xs">
                          {task.status && (
                            <span className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-medium bg-muted text-muted-foreground border border-border/50">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>{task.status}</span>
                            </span>
                          )}

                          {task.priority && (
                            <span className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                              <span>{task.priority}</span>
                            </span>
                          )}

                          <div className="flex items-center gap-1 text-muted-foreground">
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                            <span>
                              {formatDeletedAt(
                                task.deletedAt,
                                dateLocale,
                                t("UnifiedTrash.unknownDate", "Fecha desconocida")
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleRestore("tasks", task.id)}
                          disabled={isProcessing("tasks", task.id)}
                          aria-label={`${t("UnifiedTrash.restore", "Restaurar")} ${task.title}`}
                          className="gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs shadow-emerald-500/20 cursor-pointer text-xs"
                        >
                          {isProcessing("tasks", task.id) &&
                          itemToRestore?.type === "tasks" ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="h-3.5 w-3.5" />
                          )}
                          <span>{t("UnifiedTrash.restore", "Restaurar")}</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePermanentDelete("tasks", task.id)}
                          disabled={isProcessing("tasks", task.id)}
                          aria-label={`${t("UnifiedTrash.deletePermanently", "Eliminar permanentemente")} ${task.title}`}
                          className="h-8 w-8 p-0 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border border-border/50 cursor-pointer"
                        >
                          {isProcessing("tasks", task.id) &&
                          itemToDelete?.type === "tasks" ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CheckCircle2}
                message={t(
                  "UnifiedTrash.noDeletedTasks",
                  "No hay tareas en la papelera"
                )}
                hint="Las tareas eliminadas de este proyecto aparecerán aquí"
              />
            )}
          </TabsContent>

          {/* TAB 2: PROYECTOS */}
          <TabsContent value="projects" className="space-y-4">
            {workspaces && workspaces.length > 0 && (
              <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label
                  htmlFor="workspace-filter"
                  className="text-xs sm:text-sm font-medium text-muted-foreground"
                >
                  {t("UnifiedTrash.filterByWorkspace", "Filtrar por Espacio")}
                </label>
                <div className="relative inline-flex items-center w-full sm:w-72">
                  <select
                    id="workspace-filter"
                    aria-label="Filtrar por Espacio"
                    value={selectedWorkspace}
                    onChange={(e) => setSelectedWorkspace(e.target.value)}
                    className="w-full appearance-none bg-muted/40 border border-border/60 rounded-xl pl-3.5 pr-9 py-2 text-sm font-medium text-foreground hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-colors cursor-pointer shadow-xs"
                  >
                    {workspaces.map((ws: any) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}

            {isLoadingProjects ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-44 rounded-2xl bg-card border border-border/60"
                  />
                ))}
              </div>
            ) : deletedProjects && deletedProjects.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {deletedProjects.map((project: any) => (
                  <div
                    key={project.id}
                    className="group relative rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-all duration-300 hover:border-pink-500/40 hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-xs"
                          style={{ backgroundColor: project.color || "#ec4899" }}
                        >
                          {project.name?.[0]?.toUpperCase() || "P"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-semibold text-foreground truncate">
                            {project.name}
                          </h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                            <span>
                              {formatDeletedAt(
                                project.deletedAt,
                                dateLocale,
                                t("UnifiedTrash.unknownDate", "Fecha desconocida")
                              )}
                            </span>
                          </p>
                        </div>
                      </div>

                      {project.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-4">
                          {project.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                      <Button
                        size="sm"
                        onClick={() => handleRestore("projects", project.id)}
                        disabled={isProcessing("projects", project.id)}
                        aria-label={`${t("UnifiedTrash.restore", "Restaurar")} ${project.name}`}
                        className="flex-1 gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs shadow-emerald-500/20 cursor-pointer text-xs"
                      >
                        {isProcessing("projects", project.id) &&
                        itemToRestore?.type === "projects" ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3.5 w-3.5" />
                        )}
                        <span>{t("UnifiedTrash.restore", "Restaurar")}</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePermanentDelete("projects", project.id)}
                        disabled={isProcessing("projects", project.id)}
                        aria-label={`${t("UnifiedTrash.deletePermanently", "Eliminar permanentemente")} ${project.name}`}
                        className="h-8 w-8 p-0 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border border-border/50 cursor-pointer"
                      >
                        {isProcessing("projects", project.id) &&
                        itemToDelete?.type === "projects" ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={LayoutList}
                message={t(
                  "UnifiedTrash.noDeletedProjects",
                  "No hay proyectos en la papelera"
                )}
                hint="Los proyectos eliminados de este espacio se mostrarán aquí"
              />
            )}
          </TabsContent>

          {/* TAB 3: ESPACIOS DE TRABAJO */}
          <TabsContent value="workspaces" className="space-y-4">
            {isLoadingWorkspaces ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-44 rounded-2xl bg-card border border-border/60"
                  />
                ))}
              </div>
            ) : deletedWorkspaces && deletedWorkspaces.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {deletedWorkspaces.map((workspace: any) => (
                  <div
                    key={workspace.id}
                    className="group relative rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-all duration-300 hover:border-orange-500/40 hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-xs"
                          style={{ backgroundColor: workspace.color || "#f97316" }}
                        >
                          {workspace.icon ||
                            workspace.name?.[0]?.toUpperCase() ||
                            "W"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-semibold text-foreground truncate">
                            {workspace.name}
                          </h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                            <span>
                              {formatDeletedAt(
                                workspace.deletedAt,
                                dateLocale,
                                t("UnifiedTrash.unknownDate", "Fecha desconocida")
                              )}
                            </span>
                          </p>
                        </div>
                      </div>

                      {workspace.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-4">
                          {workspace.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                      <Button
                        size="sm"
                        onClick={() => handleRestore("workspaces", workspace.id)}
                        disabled={isProcessing("workspaces", workspace.id)}
                        aria-label={`${t("UnifiedTrash.restore", "Restaurar")} ${workspace.name}`}
                        className="flex-1 gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs shadow-emerald-500/20 cursor-pointer text-xs"
                      >
                        {isProcessing("workspaces", workspace.id) &&
                        itemToRestore?.type === "workspaces" ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3.5 w-3.5" />
                        )}
                        <span>{t("UnifiedTrash.restore", "Restaurar")}</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePermanentDelete("workspaces", workspace.id)}
                        disabled={isProcessing("workspaces", workspace.id)}
                        aria-label={`${t("UnifiedTrash.deletePermanently", "Eliminar permanentemente")} ${workspace.name}`}
                        className="h-8 w-8 p-0 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border border-border/50 cursor-pointer"
                      >
                        {isProcessing("workspaces", workspace.id) &&
                        itemToDelete?.type === "workspaces" ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Building2}
                message={t(
                  "UnifiedTrash.noDeletedWorkspaces",
                  "No hay espacios en la papelera"
                )}
                hint="Los espacios eliminados aparecerán aquí durante 30 días"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
      <ConfirmModal />
    </PageTransition>
  );
}

function EmptyState({
  icon: Icon,
  message,
  hint,
}: {
  icon: any;
  message: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-border/60 bg-card/40">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 mb-3 shadow-xs">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1">
        {message}
      </h3>
      {hint && (
        <p className="text-xs text-muted-foreground max-w-sm">
          {hint}
        </p>
      )}
    </div>
  );
}
