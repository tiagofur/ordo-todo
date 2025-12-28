"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  LayoutList,
} from "lucide-react";
import {
  useDeletedTasks,
  useRestoreTask,
  usePermanentDeleteTask,
  useProjects,
} from "@/lib/api-hooks";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function TasksTrashPage() {
  const t = useTranslations("TasksTrash");
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || "";

  const { data: allProjects } = useProjects("all");
  const projects = allProjects || [];
  const { data: deletedTasks, isLoading, refetch } = useDeletedTasks(projectId);
  const restoreTask = useRestoreTask();
  const permanentDeleteTask = usePermanentDeleteTask();

  const [taskToRestore, setTaskToRestore] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const handleRestore = async (taskId: string) => {
    setTaskToRestore(taskId);
    try {
      await restoreTask.mutateAsync(taskId);
      await refetch();
    } finally {
      setTaskToRestore(null);
    }
  };

  const handlePermanentDelete = async (taskId: string) => {
    if (!confirm(t("confirmDelete"))) return;

    setTaskToDelete(taskId);
    try {
      await permanentDeleteTask.mutateAsync(taskId);
      await refetch();
    } finally {
      setTaskToDelete(null);
    }
  };

  const selectedProject = projects?.find((p: any) => p.id === projectId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
      case "HIGH":
        return "text-orange-600 bg-orange-50 dark:bg-orange-900/20";
      case "URGENT":
        return "text-red-600 bg-red-50 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "text-gray-600 bg-gray-100 dark:bg-gray-800";
      case "IN_PROGRESS":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
      case "COMPLETED":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "CANCELLED":
        return "text-red-600 bg-red-100 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-pink-500 text-white shadow-lg"
              style={{
                boxShadow:
                  "0 10px 15px -3px rgb(236 72 153 / 25%), 0 4px 6px -4px rgb(236 72 153 / 25%)",
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

      {/* Project Filter */}
      <div className="rounded-2xl border-2 border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("selectProject")}
        </label>
        <select
          value={projectId}
          onChange={(e) => {
            const url = new URL(window.location.href);
            if (e.target.value) {
              url.searchParams.set("projectId", e.target.value);
            } else {
              url.searchParams.delete("projectId");
            }
            window.location.href = url.toString();
          }}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="">{t("allProjects")}</option>
          {projects.map((project: any) => (
            <option key={project.id} value={project.id}>
              {project.name}
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

      {/* Selected Project Info */}
      {selectedProject && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-pink-200 bg-pink-50 p-4 dark:border-pink-900 dark:bg-pink-950/20"
        >
          <div className="flex items-center gap-3">
            <LayoutList className="h-5 w-5 text-pink-600 dark:text-pink-500" />
            <div>
              <p className="text-sm text-pink-900 dark:text-pink-100 font-medium">
                {t("viewingTasksFor")}
              </p>
              <p className="text-lg font-semibold text-pink-900 dark:text-pink-100">
                {selectedProject.name}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tasks List */}
      {!projectId ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 mb-6">
            <LayoutList className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {t("selectProjectFirst")}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {t("selectProjectFirstDescription")}
          </p>
        </motion.div>
      ) : isLoading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      ) : deletedTasks && deletedTasks.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {deletedTasks.map((task: any, index: number) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group relative rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-pink-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-pink-900"
            >
              <div className="flex items-start gap-4">
                {/* Task Info */}
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
                    {task.title}
                  </h3>

                  {/* Description */}
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {/* Status */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ${getStatusColor(task.status)}`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {task.status}
                    </span>

                    {/* Priority */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </span>

                    {/* Deleted Date */}
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {formatDistanceToNow(new Date(task.deletedAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRestore(task.id)}
                    disabled={
                      taskToRestore === task.id || taskToDelete === task.id
                    }
                    className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium bg-green-500 text-white transition-all hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={t("restore")}
                  >
                    {taskToRestore === task.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4" />
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePermanentDelete(task.id)}
                    disabled={
                      taskToRestore === task.id || taskToDelete === task.id
                    }
                    className="flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium bg-red-100 text-red-700 transition-all hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={t("permanentDelete")}
                  >
                    {taskToDelete === task.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </motion.button>
                </div>
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
          <h3 className="text-xl font-semibold mb-2">{t("noDeletedTasks")}</h3>
          <p className="text-muted-foreground max-w-md">
            {t("noDeletedTasksDescription")}
          </p>
        </motion.div>
      )}
    </div>
  );
}
