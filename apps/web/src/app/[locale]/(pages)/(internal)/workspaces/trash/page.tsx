"use client";

import { useState } from "react";
import { Trash2, RotateCcw, AlertTriangle, RefreshCw } from "lucide-react";
import { useDeletedWorkspaces, useRestoreWorkspace, usePermanentDeleteWorkspace } from "@/lib/api-hooks";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function TrashPage() {
  const t = useTranslations('Trash');
  const { data: deletedWorkspaces, isLoading, refetch } = useDeletedWorkspaces();
  const restoreWorkspace = useRestoreWorkspace();
  const permanentDeleteWorkspace = usePermanentDeleteWorkspace();

  const [workspaceToRestore, setWorkspaceToRestore] = useState<string | null>(null);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(null);

  const handleRestore = async (workspaceId: string) => {
    setWorkspaceToRestore(workspaceId);
    try {
      await restoreWorkspace.mutateAsync(workspaceId);
      await refetch();
    } finally {
      setWorkspaceToRestore(null);
    }
  };

  const handlePermanentDelete = async (workspaceId: string) => {
    if (!confirm(t('confirmDelete'))) return;

    setWorkspaceToDelete(workspaceId);
    try {
      await permanentDeleteWorkspace.mutateAsync(workspaceId);
      await refetch();
    } finally {
      setWorkspaceToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg"
              style={{
                boxShadow: "0 10px 15px -3px rgb(239 68 68 / 25%), 0 4px 6px -4px rgb(239 68 68 / 25%)",
              }}
            >
              <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </motion.div>
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            {t('subtitle')}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-xl px-2.5 sm:px-4 py-2.5 text-sm font-medium bg-white text-gray-900 border border-gray-200 transition-all duration-200 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">{t('refresh')}</span>
        </motion.button>
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
              {t('warningTitle')}
            </h3>
            <p className="text-sm text-orange-800 dark:text-orange-200 mt-1">
              {t('warningDescription')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Workspaces Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      ) : deletedWorkspaces && deletedWorkspaces.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {deletedWorkspaces.map((workspace: any, index: number) => (
            <motion.div
              key={workspace.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group relative rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-red-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-red-900"
            >
              {/* Deleted Badge */}
              <div className="absolute -top-3 -right-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg">
                  <Trash2 className="h-4 w-4" />
                </div>
              </div>

              {/* Workspace Icon */}
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-md"
                style={{ backgroundColor: workspace.color || "#f97316" }}
              >
                {workspace.icon || (workspace.name?.[0]?.toUpperCase() || "W")}
              </div>

              {/* Workspace Name */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {workspace.name}
              </h3>

              {/* Workspace Description */}
              {workspace.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {workspace.description}
                </p>
              )}

              {/* Deleted Date */}
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 mb-4">
                <AlertTriangle className="h-3.5 w-3.5" />
                {t('deletedAt')} {formatDistanceToNow(new Date(workspace.deletedAt), {
                  addSuffix: true,
                  locale: es
                })}
              </div>

              {/* Stats */}
              <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400 mb-6">
                {workspace.stats?.projectCount !== undefined && (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{workspace.stats.projectCount}</span>
                    <span>{t('projects')}</span>
                  </div>
                )}
                {workspace.stats?.taskCount !== undefined && (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{workspace.stats.taskCount}</span>
                    <span>{t('tasks')}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRestore(workspace.id)}
                  disabled={workspaceToRestore === workspace.id || workspaceToDelete === workspace.id}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium bg-green-500 text-white transition-all hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {workspaceToRestore === workspace.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  <span>{t('restore')}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePermanentDelete(workspace.id)}
                  disabled={workspaceToRestore === workspace.id || workspaceToDelete === workspace.id}
                  className="flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium bg-red-100 text-red-700 transition-all hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {workspaceToDelete === workspace.id ? (
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
          <h3 className="text-xl font-semibold mb-2">{t('noDeletedWorkspaces')}</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {t('noDeletedWorkspacesDescription')}
          </p>
        </motion.div>
      )}
    </div>
  );
}
