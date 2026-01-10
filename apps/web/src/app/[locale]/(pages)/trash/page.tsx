"use client";

import { useState } from "react";
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Building2,
  LayoutList,
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
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { AppLayout } from "@/components/shared/app-layout";

type TrashTab = "tasks" | "projects" | "workspaces";

// Safe date formatting helper to prevent "Invalid time value" errors
function formatDeletedAt(deletedAt: string | Date | null | undefined, locale: any): string {
  if (!deletedAt) return 'Unknown';
  try {
    const date = new Date(deletedAt);
    if (isNaN(date.getTime())) return 'Unknown';
    return formatDistanceToNow(date, { addSuffix: true, locale });
  } catch {
    return 'Unknown';
  }
}

export default function UnifiedTrashPage() {
  const t = useTranslations("UnifiedTrash");
  const [activeTab, setActiveTab] = useState<TrashTab>("workspaces");
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");

  // Workspaces
  const { data: deletedWorkspaces, isLoading: isLoadingWorkspaces, refetch: refetchWorkspaces } = useDeletedWorkspaces();
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
  const {
    data: allProjects,
  } = useAllProjects();
  const { data: deletedTasks, isLoading: isLoadingTasks, refetch: refetchTasks } = useDeletedTasks(selectedProject);
  const restoreTask = useRestoreTask();
  const permanentDeleteTask = usePermanentDeleteTask();


  const [itemToRestore, setItemToRestore] = useState<{ type: TrashTab; id: string } | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: TrashTab; id: string } | null>(null);

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
    if (!confirm(t("confirmDelete"))) return;

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

  const getTabCount = () => {
    switch (activeTab) {
      case "workspaces":
        return deletedWorkspaces?.length || 0;
      case "projects":
        return deletedProjects?.length || 0;
      case "tasks":
        return deletedTasks?.length || 0;
    }
  };

  const selectedWorkspaceObj = workspaces?.find((w: any) => w.id === selectedWorkspace);
  const selectedProjectObj = allProjects?.find((p: any) => p.id === selectedProject);

  return (
    <AppLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg"
              style={{
                boxShadow: "0 10px 15px -3px rgb(239 68 68 / 25%), 0 4px 6px -4px rgb(239 68 68 / 25%)",
              }}
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            refetchWorkspaces();
            refetchProjects();
            refetchTasks();
          }}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-white text-gray-900 border border-gray-200 transition-all duration-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4" />
          <span>{t("refresh")}</span>
        </motion.button>
      </div>

      {/* Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border-2 border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/20"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900 dark:text-orange-100">
              {t("warningTitle")}
            </h3>
            <p className="text-sm text-orange-800 dark:text-orange-200 mt-1">
              {t("warningDescription")}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TrashTab)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <TabsTrigger
            value="workspaces"
            className={cn(
              "gap-2 rounded-lg transition-all duration-200",
              activeTab === "workspaces"
                ? "bg-red-500 text-white shadow-md data-[state=active]:bg-red-500 data-[state=active]:text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">{t("tabs.workspaces")}</span>
            <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {deletedWorkspaces?.length || 0}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="projects"
            className={cn(
              "gap-2 rounded-lg transition-all duration-200",
              activeTab === "projects"
                ? "bg-purple-500 text-white shadow-md data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            <LayoutList className="h-4 w-4" />
            <span className="hidden sm:inline">{t("tabs.projects")}</span>
            <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {deletedProjects?.length || 0}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="tasks"
            className={cn(
              "gap-2 rounded-lg transition-all duration-200",
              activeTab === "tasks"
                ? "bg-pink-500 text-white shadow-md data-[state=active]:bg-pink-500 data-[state=active]:text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">{t("tabs.tasks")}</span>
            <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {deletedTasks?.length || 0}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Workspaces Tab */}
        <TabsContent value="workspaces" className="space-y-4 mt-6">
          {isLoadingWorkspaces ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : deletedWorkspaces && deletedWorkspaces.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {deletedWorkspaces.map((workspace: any, index: number) => (
                <motion.div
                  key={workspace.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-red-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-red-900"
                >
                  <div className="absolute -top-3 -right-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg">
                      <Trash2 className="h-4 w-4" />
                    </div>
                  </div>

                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-md"
                    style={{ backgroundColor: workspace.color || "#f97316" }}
                  >
                    {workspace.icon || (workspace.name?.[0]?.toUpperCase() || "W")}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {workspace.name}
                  </h3>

                  {workspace.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {workspace.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 mb-4">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {formatDeletedAt(workspace.deletedAt, es)}
                  </div>

                  <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400 mb-6">
                    {workspace.stats?.projectCount !== undefined && (
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{workspace.stats.projectCount}</span>
                        <span>{t("projects")}</span>
                      </div>
                    )}
                    {workspace.stats?.taskCount !== undefined && (
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{workspace.stats.taskCount}</span>
                        <span>{t("tasks")}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRestore("workspaces", workspace.id)}
                      disabled={isProcessing("workspaces", workspace.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium bg-green-500 text-white transition-all hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing("workspaces", workspace.id) && itemToRestore?.type === "workspaces" ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}
                      <span>{t("restore")}</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePermanentDelete("workspaces", workspace.id)}
                      disabled={isProcessing("workspaces", workspace.id)}
                      className="flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium bg-red-100 text-red-700 transition-all hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing("workspaces", workspace.id) && itemToDelete?.type === "workspaces" ? (
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
          {/* Workspace Filter */}
          <div className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("filterByWorkspace")}
            </label>
            <select
              value={selectedWorkspace}
              onChange={(e) => setSelectedWorkspace(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="">{t("allWorkspaces")}</option>
              {workspaces?.map((workspace: any) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </div>

          {selectedWorkspaceObj && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border-2 border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950/20"
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                <div>
                  <p className="text-sm text-purple-900 dark:text-purple-100 font-medium">
                    {t("viewingProjectsFor")}
                  </p>
                  <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                    {selectedWorkspaceObj.name}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {!selectedWorkspace ? (
            <EmptyState icon={Building2} message={t("selectWorkspaceFirst")} />
          ) : isLoadingProjects ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : deletedProjects && deletedProjects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {deletedProjects.map((project: any, index: number) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-purple-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-purple-900"
                >
                  <div className="absolute -top-3 -right-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white shadow-lg">
                      <Trash2 className="h-4 w-4" />
                    </div>
                  </div>

                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-md"
                    style={{ backgroundColor: project.color || "#a855f7" }}
                  >
                    {project.name?.[0]?.toUpperCase() || "P"}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {project.name}
                  </h3>

                  {project.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 mb-4">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {formatDeletedAt(project.deletedAt, es)}
                  </div>

                  <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400 mb-6">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{project.tasksCount || 0}</span>
                      <span>{t("tasks")}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRestore("projects", project.id)}
                      disabled={isProcessing("projects", project.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium bg-green-500 text-white transition-all hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing("projects", project.id) && itemToRestore?.type === "projects" ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}
                      <span>{t("restore")}</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePermanentDelete("projects", project.id)}
                      disabled={isProcessing("projects", project.id)}
                      className="flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium bg-red-100 text-red-700 transition-all hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing("projects", project.id) && itemToDelete?.type === "projects" ? (
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
          {/* Project Filter */}
          <div className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("filterByProject")}
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="">{t("allProjects")}</option>
              {allProjects?.map((project: any) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {selectedProjectObj && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border-2 border-pink-200 bg-pink-50 p-4 dark:border-pink-900 dark:bg-pink-950/20"
            >
              <div className="flex items-center gap-3">
                <LayoutList className="h-5 w-5 text-pink-600 dark:text-pink-500" />
                <div>
                  <p className="text-sm text-pink-900 dark:text-pink-100 font-medium">
                    {t("viewingTasksFor")}
                  </p>
                  <p className="text-lg font-semibold text-pink-900 dark:text-pink-100">
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
                <div key={i} className="h-32 rounded-2xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : deletedTasks && deletedTasks.length > 0 ? (
            <div className="space-y-4">
              {deletedTasks.map((task: any, index: number) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-pink-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-pink-900"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {task.status}
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
                          {task.priority}
                        </span>

                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {formatDeletedAt(task.deletedAt, es)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleRestore("tasks", task.id)}
                        disabled={isProcessing("tasks", task.id)}
                        className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium bg-green-500 text-white transition-all hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing("tasks", task.id) && itemToRestore?.type === "tasks" ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePermanentDelete("tasks", task.id)}
                        disabled={isProcessing("tasks", task.id)}
                        className="flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium bg-red-100 text-red-700 transition-all hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing("tasks", task.id) && itemToDelete?.type === "tasks" ? (
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
    </AppLayout>
  );
}

function EmptyState({ icon: Icon, message }: { icon: any; message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 mb-6">
        <Icon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{message}</h3>
    </motion.div>
  );
}
