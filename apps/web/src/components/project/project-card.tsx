"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  MoreVertical,
  Archive,
  ArchiveRestore,
  Trash2,
  CheckSquare,
} from "lucide-react";
import { useDeleteProject, useArchiveProject } from "@/lib/api-hooks";
import { useQueryClient } from "@tanstack/react-query";
import {
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ordo-todo/ui";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Task, Project } from "@ordo-todo/api-client";
import { motion } from "framer-motion";

export interface ProjectCardProps {
  project: Project;
  tasks?: Task[];
  viewMode?: "grid" | "list";
  index?: number;
  workspaceSlug?: string;
  ownerUsername?: string;
}

export function ProjectCard({
  project,
  tasks: allTasks,
  viewMode = "grid",
  index = 0,
  workspaceSlug,
  ownerUsername,
}: ProjectCardProps) {
  const t = useTranslations("ProjectCard");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirm, ConfirmModal } = useConfirm();

  // Filter tasks for this project
  const projectTasks = (allTasks || []).filter(
    (t: Task) => String(t.projectId) === String(project.id)
  );
  const completedTasks = projectTasks.filter(
    (t: Task) => (t.status as string) === "DONE" || t.status === "COMPLETED"
  ).length;
  const totalTasks = projectTasks.length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const archiveProjectMutation = useArchiveProject();
  const deleteProjectMutation = useDeleteProject();

  const handleCardClick = () => {
    if (project.slug && workspaceSlug && ownerUsername) {
      router.push(`/${ownerUsername}/${workspaceSlug}/projects/${project.slug}`);
    } else if (project.slug && workspaceSlug) {
      router.push(`/workspaces/${workspaceSlug}/projects/${project.slug}`);
    } else if (project.id) {
      router.push(`/projects/${project.id}`);
    }
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!project.id) return;
    try {
      await archiveProjectMutation.mutateAsync(String(project.id));
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(
        project.archived ? t("toast.unarchived") : t("toast.archived")
      );
    } catch {
      toast.error(t("toast.archiveError"));
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!project.id) return;
    const confirmed = await confirm({
      title: t("actions.delete") || "Eliminar proyecto",
      description:
        t("confirmDelete") ||
        "¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.",
      confirmLabel: t("actions.delete") || "Eliminar",
      variant: "destructive",
    });

    if (confirmed) {
      try {
        await deleteProjectMutation.mutateAsync(String(project.id));
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        toast.success(t("toast.deleted") || "Proyecto eliminado exitosamente");
      } catch {
        toast.error(t("toast.deleteError") || "Error al eliminar proyecto");
      }
    }
  };

  const getStatusInfo = () => {
    if (project.archived) {
      return {
        label: t("archived") || "Archivado",
        badgeClass: "bg-muted text-muted-foreground",
        dotClass: "bg-muted-foreground",
      };
    }
    if (totalTasks > 0 && completionPercentage === 100) {
      return {
        label: "Completado",
        badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        dotClass: "bg-emerald-500",
      };
    }
    if (completionPercentage > 0) {
      return {
        label: "En Progreso",
        badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        dotClass: "bg-blue-500",
      };
    }
    return {
      label: "Activo",
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      dotClass: "bg-amber-500",
    };
  };

  const status = getStatusInfo();
  const accentColor = project.color || "#ec4899";

  if (viewMode === "list") {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.03 }}
          onClick={handleCardClick}
          className={cn(
            "group flex items-center justify-between gap-4 p-3.5 sm:p-4 rounded-xl border border-border/60 bg-card hover:border-pink-500/40 hover:bg-accent/30 transition-all duration-200 cursor-pointer shadow-xs",
            project.archived && "opacity-60"
          )}
        >
          {/* Left: Icon + Title + Description */}
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 transition-transform group-hover:scale-105"
              style={{
                backgroundColor: `${accentColor}18`,
                color: accentColor,
              }}
            >
              <FolderKanban className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
                  {project.name}
                </h3>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0",
                    status.badgeClass
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", status.dotClass)} />
                  {status.label}
                </span>
              </div>
              {project.description && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Center: Progress Bar */}
          <div className="hidden md:flex flex-col gap-1 w-36 shrink-0">
            <div className="flex items-center justify-between text-xs tabular-nums">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-semibold text-foreground">
                {completionPercentage}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${completionPercentage}%`,
                  backgroundColor: accentColor,
                }}
              />
            </div>
          </div>

          {/* Right: Task Count & Dropdown Menu */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline-flex items-center gap-1">
              <CheckSquare className="h-3.5 w-3.5" />
              {completedTasks}/{totalTasks}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  aria-label={t("actions.moreOptions") || "Más opciones"}
                  className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleArchive}>
                  {project.archived ? (
                    <>
                      <ArchiveRestore className="mr-2 h-4 w-4" />
                      {t("actions.unarchive") || "Desarchivar"}
                    </>
                  ) : (
                    <>
                      <Archive className="mr-2 h-4 w-4" />
                      {t("actions.archive") || "Archivar"}
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("actions.delete") || "Eliminar"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
        <ConfirmModal />
      </>
    );
  }

  // Grid Mode (Apple-style Card)
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: index * 0.04 }}
        whileHover={{ y: -3 }}
        onClick={handleCardClick}
        className={cn(
          "group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card/90 text-card-foreground backdrop-blur-xl p-4 sm:p-5 transition-all duration-300 cursor-pointer h-full min-h-[210px] overflow-hidden shadow-xs hover:border-pink-500/40 hover:shadow-md",
          project.archived && "opacity-60"
        )}
      >
        <div>
          {/* Top Header: Icon + Status Pill + Menu */}
          <div className="flex items-start justify-between gap-3 mb-3.5">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-105"
              style={{
                backgroundColor: `${accentColor}18`,
                color: accentColor,
              }}
            >
              <FolderKanban className="h-5 w-5" />
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0",
                  status.badgeClass
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", status.dotClass)} />
                {status.label}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    aria-label={t("actions.moreOptions") || "Más opciones"}
                    className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleArchive}>
                    {project.archived ? (
                      <>
                        <ArchiveRestore className="mr-2 h-4 w-4" />
                        {t("actions.unarchive") || "Desarchivar"}
                      </>
                    ) : (
                      <>
                        <Archive className="mr-2 h-4 w-4" />
                        {t("actions.archive") || "Archivar"}
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("actions.delete") || "Eliminar"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Project Title & Description */}
          <h3 className="font-bold text-base sm:text-lg text-foreground truncate group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
            {project.name}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2 min-h-[2.25rem]">
            {project.description || "Sin descripción"}
          </p>
        </div>

        {/* Progress & Task Counts */}
        <div className="mt-4 pt-3.5 border-t border-border/40 space-y-2.5">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs tabular-nums">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-semibold text-foreground" style={{ color: accentColor }}>
                {completionPercentage}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${completionPercentage}%`,
                  backgroundColor: accentColor,
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground tabular-nums">
            <span className="flex items-center gap-1.5">
              <CheckSquare className="h-3.5 w-3.5" />
              {totalTasks > 0 ? `${completedTasks}/${totalTasks} tareas` : "Sin tareas"}
            </span>
            {totalTasks > 0 && completionPercentage === 100 && (
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                ¡Al día!
              </span>
            )}
          </div>
        </div>
      </motion.div>
      <ConfirmModal />
    </>
  );
}
