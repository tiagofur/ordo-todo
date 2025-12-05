import { useNavigate } from "react-router-dom";
import { FolderKanban, MoreVertical, Archive, Trash2, CheckCircle2, Clock } from "lucide-react";
import { useDeleteProject, useUpdateProject } from "@/hooks/api/use-projects";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: {
    id?: string | number;
    name: string;
    description?: string | null;
    color: string;
    archived: boolean;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch tasks for this project to show progress
  // const { data: tasks } = api.task.list.useQuery(undefined);
  // TODO: Re-implement statistics with proper hooks (need workspaceId)
  const tasks: any[] = [];
  const projectTasks = tasks?.filter(t => t.projectId === project.id) || [];
  const completedTasks = projectTasks.filter(t => t.status === "COMPLETED").length;
  const totalTasks = projectTasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const archiveProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  const handleCardClick = () => {
    if (project.id) {
      navigate(`/projects/${project.id}`);
    }
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!project.id) return;
    if (confirm("¿Estás seguro de archivar este proyecto?")) {
      archiveProjectMutation.mutate({ projectId: String(project.id), data: { archived: !project.archived } as any }, {
        onSuccess: () => toast.success("Proyecto actualizado"),
        onError: () => toast.error("Error al actualizar proyecto")
      });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!project.id) return;
    if (confirm("¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.")) {
      deleteProjectMutation.mutate(String(project.id), {
        onSuccess: () => toast.success("Proyecto eliminado"),
        onError: () => toast.error("Error al eliminar proyecto")
      });
    }
  };

  const getStatusInfo = () => {
    if (project.archived) {
      return { label: "Archivado", color: "text-muted-foreground" };
    }
    if (completionPercentage === 100) {
      return { label: "Completado", color: "text-green-600 dark:text-green-400" };
    }
    if (completionPercentage > 0) {
      return { label: "En Progreso", color: "text-blue-600 dark:text-blue-400" };
    }
    return { label: "Activo", color: "text-orange-600 dark:text-orange-400" };
  };

  const status = getStatusInfo();

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group relative rounded-xl border bg-card p-5 transition-all duration-200 cursor-pointer",
        "hover:shadow-lg hover:-translate-y-1",
        "hover:border-border/80",
        project.archived && "opacity-60"
      )}
      style={{
        borderLeftWidth: "4px",
        borderLeftColor: project.color,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg shrink-0 transition-transform group-hover:scale-110"
            style={{ 
              backgroundColor: `${project.color}20`, 
              color: project.color,
              border: `1px solid ${project.color}30`
            }}
          >
            <FolderKanban className="h-6 w-6" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg truncate">{project.name}</h3>
              <span className={cn("text-xs font-medium shrink-0", status.color)}>
                {status.label}
              </span>
            </div>

            {project.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            )}

            {/* Progress Bar */}
            {totalTasks > 0 && (
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {completedTasks}/{totalTasks} tareas completadas
                  </span>
                  <span className="font-medium" style={{ color: project.color }}>
                    {completionPercentage}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${completionPercentage}%`,
                      backgroundColor: project.color,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Footer Info */}
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              {totalTasks > 0 ? (
                <>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {totalTasks} {totalTasks === 1 ? "tarea" : "tareas"}
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Sin tareas
                </span>
              )}
              {project.archived && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                  <Archive className="h-3 w-3" />
                  Archivado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button 
              className={cn(
                "opacity-0 transition-opacity group-hover:opacity-100",
                "rounded-lg p-1.5 hover:bg-accent shrink-0"
              )}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleArchive}>
              <Archive className="mr-2 h-4 w-4" />
              {project.archived ? "Desarchivar" : "Archivar"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
