"use client";

import { useRouter } from "next/navigation";
import { FolderKanban, MoreVertical, Archive, Trash2, CheckSquare } from "lucide-react";
import { useTasks, useArchiveProject, useDeleteProject } from "@/lib/api-hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface ProjectCardProps {
  project: {
    id?: string | number;
    name: string;
    description?: string | null;
    color: string;
    archived: boolean;
  };
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const t = useTranslations('ProjectCard');
  const router = useRouter();

  const { data: tasks } = useTasks();
  const projectTasks = tasks?.filter((t: any) => String(t.projectId) === String(project.id)) || [];
  const totalTasks = projectTasks.length;

  const archiveProjectMutation = useArchiveProject();
  const deleteProjectMutation = useDeleteProject();

  const handleCardClick = () => {
    if (project.id) {
      router.push(`/projects/${project.id}`);
    }
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!project.id) return;
    try {
      await archiveProjectMutation.mutateAsync(String(project.id));
      toast.success(project.archived ? t('toast.unarchived') : t('toast.archived'));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('toast.archiveError'));
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!project.id) return;
    if (confirm(t('confirmDelete'))) {
      try {
        await deleteProjectMutation.mutateAsync(String(project.id));
        toast.success(t('toast.deleted'));
      } catch (error: any) {
        toast.error(error?.response?.data?.message || t('toast.deleteError'));
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={handleCardClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 cursor-pointer",
        "hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20",
        project.archived && "opacity-60 grayscale"
      )}
      style={{
        borderLeftWidth: "4px",
        borderLeftColor: project.color || "#ec4899", // Default to pink
      }}
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
              style={{
                backgroundColor: `${project.color || "#ec4899"}15`,
                color: project.color || "#ec4899",
              }}
            >
              <FolderKanban className="h-7 w-7" />
            </div>

            <div>
              <h3 className="font-bold text-xl leading-tight mb-1 truncate max-w-[180px]">
                {project.name}
              </h3>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button
                className={cn(
                  "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                  "rounded-full p-2 hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="mr-2 h-4 w-4" />
                {project.archived ? t('actions.unarchive') : t('actions.archive')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
                <Trash2 className="mr-2 h-4 w-4" />
                {t('actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-grow">
            {project.description}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-dashed border-border/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CheckSquare className="h-4 w-4" />
              <span>{t('tasks', { count: totalTasks })}</span>
            </div>
            {project.archived && (
              <div
                className="text-xs font-medium px-2 py-1 rounded-full bg-gray-500/10 text-gray-500"
              >
                {t('archived')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: project.color || "#ec4899" }}
      />
    </motion.div>
  );
}
