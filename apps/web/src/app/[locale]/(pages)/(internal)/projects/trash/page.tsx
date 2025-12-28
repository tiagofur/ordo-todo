"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  Building2,
} from "lucide-react";
import {
  useDeletedProjects,
  useRestoreProject,
  usePermanentDeleteProject,
  useWorkspaces,
} from "@/lib/api-hooks";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function ProjectsTrashPage() {
  const t = useTranslations("ProjectsTrash");
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspaceId") || "";

  const { data: workspaces } = useWorkspaces();
  const {
    data: deletedProjects,
    isLoading,
    refetch,
  } = useDeletedProjects(workspaceId);
  const restoreProject = useRestoreProject();
  const permanentDeleteProject = usePermanentDeleteProject();

  const [projectToRestore, setProjectToRestore] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const handleRestore = async (projectId: string) => {
    setProjectToRestore(projectId);
    try {
      await restoreProject.mutateAsync(projectId);
      await refetch();
    } finally {
      setProjectToRestore(null);
    }
  };

  const handlePermanentDelete = async (projectId: string) => {
    if (!confirm(t("confirmDelete"))) return;

    setProjectToDelete(projectId);
    try {
      await permanentDeleteProject.mutateAsync(projectId);
      await refetch();
    } finally {
      setProjectToDelete(null);
    }
  };

  const selectedWorkspace = workspaces?.find((w: any) => w.id === workspaceId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-lg"
              style={{
                boxShadow:
                  "0 10px 15px -3px rgb(168 85 247 / 25%), 0 4px 6px -4px rgb(168 85 247 / 25%)",
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
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-xl px-2.5 sm:px-4 py-2.5 text-sm font-medium bg-white text-gray-900 border border-gray-200 transition-all duration-200 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">{t("refresh")}</span>
        </motion.button>
      </div>

      {/* Workspace Filter */}
      <div className="rounded-2xl border-2 border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("selectWorkspace")}
        </label>
        <select
          value={workspaceId}
          onChange={(e) => {
            const url = new URL(window.location.href);
            if (e.target.value) {
              url.searchParams.set("workspaceId", e.target.value);
            } else {
              url.searchParams.delete("workspaceId");
            }
            window.location.href = url.toString();
          }}
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

      {/* Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/20"
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

      {/* Selected Workspace Info */}
      {selectedWorkspace && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950/20"
        >
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-500" />
            <div>
              <p className="text-sm text-purple-900 dark:text-purple-100 font-medium">
                {t("viewingProjectsFor")}
              </p>
              <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                {selectedWorkspace.name}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Projects Grid */}
      {!workspaceId ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 mb-6">
            <Building2 className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {t("selectWorkspaceFirst")}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {t("selectWorkspaceFirstDescription")}
          </p>
        </motion.div>
      ) : isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      ) : deletedProjects && deletedProjects.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {deletedProjects.map((project: any, index: number) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group relative rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-purple-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-purple-900"
            >
              {/* Deleted Badge */}
              <div className="absolute -top-3 -right-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg">
                  <Trash2 className="h-4 w-4" />
                </div>
              </div>

              {/* Project Icon */}
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-md"
                style={{ backgroundColor: project.color || "#a855f7" }}
              >
                {project.name?.[0]?.toUpperCase() || "P"}
              </div>

              {/* Project Name */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {project.name}
              </h3>

              {/* Project Description */}
              {project.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              {/* Deleted Date */}
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 mb-4">
                <AlertTriangle className="h-3.5 w-3.5" />
                {t("deletedAt")}{" "}
                {formatDistanceToNow(new Date(project.deletedAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </div>

              {/* Stats */}
              <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400 mb-6">
                <div className="flex items-center gap-1">
                  <span className="font-semibold">
                    {project.tasksCount || 0}
                  </span>
                  <span>{t("tasks")}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRestore(project.id)}
                  disabled={
                    projectToRestore === project.id ||
                    projectToDelete === project.id
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium bg-green-500 text-white transition-all hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {projectToRestore === project.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  <span>{t("restore")}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePermanentDelete(project.id)}
                  disabled={
                    projectToRestore === project.id ||
                    projectToDelete === project.id
                  }
                  className="flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium bg-red-100 text-red-700 transition-all hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {projectToDelete === project.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 mb-6">
            <Trash2 className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {t("noDeletedProjects")}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {t("noDeletedProjectsDescription")}
          </p>
        </motion.div>
      )}
    </div>
  );
}
