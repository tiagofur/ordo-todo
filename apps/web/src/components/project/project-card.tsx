"use client";

import { useRouter } from "next/navigation";
import { ProjectCard as UIProjectCard } from "@ordo-todo/ui";
import { useTasks, useArchiveProject, useDeleteProject } from "@/lib/api-hooks";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { calculateProgress } from "@ordo-todo/core";
import { getErrorMessage } from "@/lib/error-handler";
import { useProjectPermissions } from "@/hooks/use-project-permissions";
import type { Project, Task } from "@ordo-todo/api-client";
import { motion } from "framer-motion";

interface ProjectCardProps {
  project: Project;
  index?: number;
  workspaceSlug?: string;
  ownerUsername?: string;
}

/**
 * ProjectCard Container - Handles business logic and state for project display.
 * Uses UIProjectCard from @ordo-todo/ui for presentation.
 */
export function ProjectCard({
  project,
  index = 0,
  workspaceSlug,
  ownerUsername,
}: ProjectCardProps) {
  const t = useTranslations("ProjectCard");
  const router = useRouter();

  const { data: tasks } = useTasks();
  const projectTasks =
    tasks?.filter((t: Task) => String(t.projectId) === String(project.id)) || [];
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter((t: Task) => t.status === "COMPLETED").length;
  const progressPercent = calculateProgress(completedTasks, totalTasks);

  const archiveProjectMutation = useArchiveProject();
  const deleteProjectMutation = useDeleteProject();

  const { canArchive, canDelete } = useProjectPermissions(project);

  const handleCardClick = () => {
    if (project.slug && workspaceSlug && ownerUsername) {
      router.push(`/${ownerUsername}/${workspaceSlug}/projects/${project.slug}`);
    } else if (project.slug && workspaceSlug) {
      router.push(`/workspaces/${workspaceSlug}/projects/${project.slug}`);
    } else if (project.id) {
      router.push(`/projects/${project.id}`);
    }
  };

  const handleArchive = async (projectId: string) => {
    try {
      await archiveProjectMutation.mutateAsync(projectId);
      toast.success(
        project.archived ? t("toast.unarchived") : t("toast.archived")
      );
    } catch (error) {
      toast.error(getErrorMessage(error, t("toast.archiveError")));
    }
  };

  const handleDelete = async (projectId: string) => {
    if (confirm(t("confirmDelete"))) {
      try {
        await deleteProjectMutation.mutateAsync(projectId);
        toast.success(t("toast.deleted"));
      } catch (error) {
        toast.error(getErrorMessage(error, t("toast.deleteError")));
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      <UIProjectCard
        project={project as any}
        onProjectClick={handleCardClick}
        onArchive={canArchive ? handleArchive : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        progressPercent={progressPercent}
        formattedTasksProgress={t("tasksProgress", {
          completed: completedTasks,
          total: totalTasks,
        })}
        labels={{
          actions: {
            archive: t("actions.archive"),
            unarchive: t("actions.unarchive"),
            delete: t("actions.delete"),
          },
          progressLabel: t("progress"),
          archived: t("archived"),
          moreOptions: t("actions.moreOptions"),
        }}
      />
    </motion.div>
  );
}
