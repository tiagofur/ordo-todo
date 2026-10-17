"use client";

import { useState, type ReactNode } from "react";
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Building2,
  LayoutList,
  ChevronDown,
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
} from "@/lib/api-hooks";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { es, enUS, ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { AppLayout } from "@/components/shared/app-layout";
import { useConfirm } from "@/components/shared/confirm-dialog";

export type TrashTab = "tasks" | "projects" | "workspaces";

export interface UnifiedTrashViewProps {
  defaultTab?: TrashTab;
  initialWorkspaceId?: string;
  initialProjectId?: string;
  wrapInAppLayout?: boolean;
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

export function UnifiedTrashView({
  defaultTab = "workspaces",
  initialWorkspaceId = "",
  initialProjectId = "",
  wrapInAppLayout = false,
}: UnifiedTrashViewProps) {
  const t = useTranslations("UnifiedTrash");
  const locale = useLocale();
  const dateLocale =
    locale === "es"
      ? es
      : locale === "pt-br" || locale === "pt"
        ? ptBR
        : enUS;
  const { confirm, ConfirmModal } = useConfirm();

  const [activeTab, setActiveTab] = useState<TrashTab>(defaultTab);
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<string>(initialWorkspaceId);
  const [selectedProject, setSelectedProject] =
    useState<string>(initialProjectId);

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
  const {
    data: deletedTasks,
    isLoading: isLoadingTasks,
    refetch: refetchTasks,
  } = useDeletedTasks(selectedProject);
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

  const handleRestore = async (type: TrashTab, id: string) => {
    setItemToRestore({ type, id });
    try {
      switch (type) {
        case "workspaces":
          await restoreWorkspace.mutateAsync(id);
          await refetchWorkspaces();
          break;
        case "projects":
          await restoreProject.mutateAsync(id);
          await refetchProjects();
          break;
        case "tasks":
          await restoreTask.mutateAsync(id);
          await refetchTasks();
          break;
      }
    } finally {
      setItemToRestore(null);
    }
  };

  const handlePermanentDelete = async (type: TrashTab, id: string) => {
    const confirmed = await confirm({
      title: t("deletePermanently"),
      description: t("confirmDelete"),
      confirmLabel: t("deletePermanently"),
      variant: "destructive",
    });
    if (!confirmed) return;

    setItemToDelete({ type, id });
    try {
      switch (type) {
        case "workspaces":
          await permanentDeleteWorkspace.mutateAsync(id);
          await refetchWorkspaces();
          break;
        case "projects":
          await permanentDeleteProject.mutateAsync(id);
          await refetchProjects();
          break;
        case "tasks":
          await permanentDeleteTask.mutateAsync(id);
          await refetchTasks();
          break;
      }
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

  const renderWrapper = (content: ReactNode) =>
    wrapInAppLayout ? <AppLayout>{content}</AppLayout> : <>{content}</>;

  return renderWrapper(
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-sm shadow-rose-500/25"
              >
                <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.div>
              {t("title")}
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              {t("subtitle")}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              refetchWorkspaces();
              refetchProjects();
              refetchTasks();
            }}
            className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-accent hover:border-border/80 shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{t("refresh")}</span>
          </motion.button>
        </div>

        {/* Warning Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 dark:border-amber-500/30 dark:bg-amber-500/5 transition-colors"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-200 text-sm sm:text-base">
                {t("warningTitle")}
              </h3>
              <p className="text-xs sm:text-sm text-amber-800/90 dark:text-amber-300/80 mt-1">
                {t("warningDescription")}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TrashTab)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 h-auto p-1.5 bg-muted/60 rounded-2xl border border-border/40 gap-1">
            <TabsTrigger
              value="workspaces"
              className={cn(
                "gap-2 rounded-xl py-2.5 font-medium transition-all duration-200",
                activeTab === "workspaces"
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">{t("tabs.workspaces")}</span>
              <span
                className={cn(
                  "ml-auto text-xs px-2 py-0.5 rounded-full font-semibold transition-colors",
                  activeTab === "workspaces"
                    ? "bg-white/20 text-white"
                    : "bg-muted text-foreground"
                )}
              >
                {deletedWorkspaces?.length || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className={cn(
                "gap-2 rounded-xl py-2.5 font-medium transition-all duration-200",
                activeTab === "projects"
                  ? "bg-pink-500 text-white shadow-sm shadow-pink-500/25 data-[state=active]:bg-pink-500 data-[state=active]:text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              <LayoutList className="h-4 w-4" />
              <span className="hidden sm:inline">{t("tabs.projects")}</span>
              <span
                className={cn(
                  "ml-auto text-xs px-2 py-0.5 rounded-full font-semibold transition-colors",
                  activeTab === "projects"
                    ? "bg-white/20 text-white"
                    : "bg-muted text-foreground"
                )}
              >
                {deletedProjects?.length || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className={cn(
                "gap-2 rounded-xl py-2.5 font-medium transition-all duration-200",
                activeTab === "tasks"
                  ? "bg-purple-500 text-white shadow-sm shadow-purple-500/25 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">{t("tabs.tasks")}</span>
              <span
                className={cn(
                  "ml-auto text-xs px-2 py-0.5 rounded-full font-semibold transition-colors",
                  activeTab === "tasks"
                    ? "bg-white/20 text-white"
                    : "bg-muted text-foreground"
                )}
              >
                {deletedTasks?.length || 0}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Workspaces Tab */}
          <TabsContent value="workspaces" className="space-y-4 mt-6">
            {isLoadingWorkspaces ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-64 rounded-2xl bg-muted animate-pulse border border-border"
                  />
                ))}
              </div>
            ) : deletedWorkspaces && deletedWorkspaces.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {deletedWorkspaces.map((workspace: any, index: number) => (
                  <motion.div
                    key={workspace.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.04 }}
                    className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:border-orange-500/40 hover:shadow-md"
                  >
                    <div className="absolute -top-2.5 -right-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm shadow-rose-500/30">
                        <Trash2 className="h-3.5 w-3.5" />
                      </div>
                    </div>

                    <div
                      className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-sm"
                      style={{ backgroundColor: workspace.color || "#f97316" }}
                    >
                      {workspace.icon ||
                        workspace.name?.[0]?.toUpperCase() ||
                        "W"}
                    </div>

                    <h3 className="text-lg font-semibold text-card-foreground mb-1.5 truncate">
                      {workspace.name}
                    </h3>

                    {workspace.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {workspace.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                      <span>
                        {formatDeletedAt(
                          workspace.deletedAt,
                          dateLocale,
                          t("unknownDate")
                        )}
                      </span>
                    </div>

                    <div className="flex gap-4 text-xs text-muted-foreground mb-5">
                      {workspace.stats?.projectCount !== undefined && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-foreground">
                            {workspace.stats.projectCount}
                          </span>
                          <span>{t("projects")}</span>
                        </div>
                      )}
                      {workspace.stats?.taskCount !== undefined && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-foreground">
                            {workspace.stats.taskCount}
                          </span>
                          <span>{t("tasks")}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          handleRestore("workspaces", workspace.id)
                        }
                        disabled={isProcessing("workspaces", workspace.id)}
                        aria-label={`${t("restore")} ${workspace.name}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium bg-emerald-500 text-white transition-all hover:bg-emerald-600 shadow-sm shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing("workspaces", workspace.id) &&
                        itemToRestore?.type === "workspaces" ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                        <span>{t("restore")}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          handlePermanentDelete("workspaces", workspace.id)
                        }
                        disabled={isProcessing("workspaces", workspace.id)}
                        aria-label={`${t("deletePermanently")} ${workspace.name}`}
                        className="flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing("workspaces", workspace.id) &&
                        itemToDelete?.type === "workspaces" ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Building2} message={t("noDeletedWorkspaces")} />
            )}
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4 mt-6">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <label
                htmlFor="workspace-filter"
                className="block text-sm font-medium text-foreground mb-2"
              >
                {t("filterByWorkspace")}
              </label>
              <div className="relative">
                <select
                  id="workspace-filter"
                  value={selectedWorkspace}
                  onChange={(e) => setSelectedWorkspace(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-2.5 pr-10 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                >
                  <option value="">{t("allWorkspaces")}</option>
                  {workspaces?.map((workspace: any) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {selectedWorkspaceObj && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-pink-500/20 bg-pink-500/10 p-4 dark:border-pink-500/30 dark:bg-pink-500/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-pink-600 dark:text-pink-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-pink-900/80 dark:text-pink-200/80 font-medium">
                      {t("viewingProjectsFor")}
                    </p>
                    <p className="text-base font-semibold text-pink-900 dark:text-pink-100">
                      {selectedWorkspaceObj.name}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {!selectedWorkspace ? (
              <EmptyState
                icon={Building2}
                message={t("selectWorkspaceFirst")}
              />
            ) : isLoadingProjects ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-64 rounded-2xl bg-muted animate-pulse border border-border"
                  />
                ))}
              </div>
            ) : deletedProjects && deletedProjects.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {deletedProjects.map((project: any, index: number) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.04 }}
                    className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:border-pink-500/40 hover:shadow-md"
                  >
                    <div className="absolute -top-2.5 -right-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm shadow-rose-500/30">
                        <Trash2 className="h-3.5 w-3.5" />
                      </div>
                    </div>

                    <div
                      className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-sm"
                      style={{ backgroundColor: project.color || "#ec4899" }}
                    >
                      {project.name?.[0]?.toUpperCase() || "P"}
                    </div>

                    <h3 className="text-lg font-semibold text-card-foreground mb-1.5 truncate">
                      {project.name}
                    </h3>

                    {project.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                      <span>
                        {formatDeletedAt(
                          project.deletedAt,
                          dateLocale,
                          t("unknownDate")
                        )}
                      </span>
                    </div>

                    <div className="flex gap-4 text-xs text-muted-foreground mb-5">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-foreground">
                          {project.tasksCount || 0}
                        </span>
                        <span>{t("tasks")}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleRestore("projects", project.id)}
                        disabled={isProcessing("projects", project.id)}
                        aria-label={`${t("restore")} ${project.name}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium bg-emerald-500 text-white transition-all hover:bg-emerald-600 shadow-sm shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing("projects", project.id) &&
                        itemToRestore?.type === "projects" ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                        <span>{t("restore")}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          handlePermanentDelete("projects", project.id)
                        }
                        disabled={isProcessing("projects", project.id)}
                        aria-label={`${t("deletePermanently")} ${project.name}`}
                        className="flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing("projects", project.id) &&
                        itemToDelete?.type === "projects" ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState icon={LayoutList} message={t("noDeletedProjects")} />
            )}
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4 mt-6">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <label
                htmlFor="project-filter"
                className="block text-sm font-medium text-foreground mb-2"
              >
                {t("filterByProject")}
              </label>
              <div className="relative">
                <select
                  id="project-filter"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-2.5 pr-10 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                >
                  <option value="">{t("allProjects")}</option>
                  {allProjects?.map((project: any) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {selectedProjectObj && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4 dark:border-purple-500/30 dark:bg-purple-500/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <LayoutList className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-purple-900/80 dark:text-purple-200/80 font-medium">
                      {t("viewingTasksFor")}
                    </p>
                    <p className="text-base font-semibold text-purple-900 dark:text-purple-100">
                      {selectedProjectObj.name}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {!selectedProject ? (
              <EmptyState icon={LayoutList} message={t("selectProjectFirst")} />
            ) : isLoadingTasks ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 rounded-2xl bg-muted animate-pulse border border-border"
                  />
                ))}
              </div>
            ) : deletedTasks && deletedTasks.length > 0 ? (
              <div className="space-y-4">
                {deletedTasks.map((task: any, index: number) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.04 }}
                    className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:border-purple-500/40 hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-card-foreground mb-1.5 truncate">
                          {task.title}
                        </h3>

                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium bg-muted text-muted-foreground border border-border">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {task.status}
                          </span>

                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            {task.priority}
                          </span>

                          <div className="flex items-center gap-1 text-muted-foreground">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            <span>
                              {formatDeletedAt(
                                task.deletedAt,
                                dateLocale,
                                t("unknownDate")
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleRestore("tasks", task.id)}
                          disabled={isProcessing("tasks", task.id)}
                          aria-label={`${t("restore")} ${task.title}`}
                          className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium bg-emerald-500 text-white transition-all hover:bg-emerald-600 shadow-sm shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing("tasks", task.id) &&
                          itemToRestore?.type === "tasks" ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <RotateCcw className="h-4 w-4" />
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handlePermanentDelete("tasks", task.id)
                          }
                          disabled={isProcessing("tasks", task.id)}
                          aria-label={`${t("deletePermanently")} ${task.title}`}
                          className="flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing("tasks", task.id) &&
                          itemToDelete?.type === "tasks" ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState icon={CheckCircle2} message={t("noDeletedTasks")} />
            )}
          </TabsContent>
        </Tabs>
      </div>
      <ConfirmModal />
    </>
  );
}

function EmptyState({ icon: Icon, message }: { icon: any; message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-border bg-card/50"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4 shadow-sm">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
        {message}
      </h3>
    </motion.div>
  );
}
