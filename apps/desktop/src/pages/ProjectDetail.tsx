import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Archive, Trash2, Plus, List, LayoutGrid } from "lucide-react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { TaskCard } from "@/components/task/task-card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "grid";

export function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const { data: project, isLoading: isLoadingProject } = api.project.getById.useQuery(
    { id: projectId as string },
    { enabled: !!projectId }
  );

  const { data: tasks, isLoading: isLoadingTasks } = api.task.list.useQuery(undefined);
  const projectTasks = tasks?.filter(t => t.projectId === projectId) || [];

  const utils = api.useUtils();

  const archiveProject = api.project.archive.useMutation({
    onSuccess: () => {
      toast.success("Proyecto archivado");
      utils.project.list.invalidate();
      navigate("/projects");
    },
  });

  const deleteProject = api.project.delete.useMutation({
    onSuccess: () => {
      toast.success("Proyecto eliminado");
      utils.project.list.invalidate();
      navigate("/projects");
    },
  });

  const handleArchive = () => {
    if (confirm("¿Estás seguro de archivar este proyecto?")) {
      archiveProject.mutate({ id: projectId as string });
    }
  };

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de eliminar este proyecto? Se eliminarán ${projectTasks.length} tareas. Esta acción no se puede deshacer.`)) {
      deleteProject.mutate({ id: projectId as string });
    }
  };

  if (isLoadingProject) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-2xl font-bold">Proyecto no encontrado</h2>
        <p className="mt-2 text-muted-foreground">El proyecto que buscas no existe o fue eliminado.</p>
        <Button onClick={() => navigate("/projects")} className="mt-4">
          Volver a Proyectos
        </Button>
      </div>
    );
  }

  // Group tasks by status
  const todoTasks = projectTasks.filter(t => t.status === "TODO");
  const inProgressTasks = projectTasks.filter(t => t.status === "IN_PROGRESS");
  const completedTasks = projectTasks.filter(t => t.status === "COMPLETED");

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div
        className="rounded-xl border p-6 bg-card"
        style={{
          borderLeftWidth: "4px",
          borderLeftColor: project.color,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/projects")}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold truncate">{project.name}</h1>
                {project.archived && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
                    <Archive className="h-4 w-4" />
                    Archivado
                  </span>
                )}
              </div>

              {project.description && (
                <p className="mt-2 text-muted-foreground">{project.description}</p>
              )}

              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  <span className="font-medium text-foreground">{projectTasks.length}</span>{" "}
                  {projectTasks.length === 1 ? "tarea" : "tareas"}
                </span>
                <span>•</span>
                <span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {completedTasks.length}
                  </span>{" "}
                  completadas
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={() => setShowCreateTask(true)}
              size="sm"
              style={{ backgroundColor: project.color, color: "white" }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarea
            </Button>

            <Button variant="outline" size="sm" onClick={handleArchive}>
              <Archive className="h-4 w-4 mr-2" />
              {project.archived ? "Desarchivar" : "Archivar"}
            </Button>

            <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tareas</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tasks */}
      {isLoadingTasks ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : projectTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <h3 className="text-lg font-medium">No hay tareas</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Crea tu primera tarea para empezar a trabajar en este proyecto
          </p>
          <Button onClick={() => setShowCreateTask(true)} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* To Do */}
          {todoTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Por Hacer ({todoTasks.length})
              </h3>
              <div className={cn(
                viewMode === "grid" 
                  ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                  : "space-y-3"
              )}>
                {todoTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* In Progress */}
          {inProgressTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                En Progreso ({inProgressTasks.length})
              </h3>
              <div className={cn(
                viewMode === "grid" 
                  ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                  : "space-y-3"
              )}>
                {inProgressTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Completadas ({completedTasks.length})
              </h3>
              <div className={cn(
                viewMode === "grid" 
                  ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                  : "space-y-3"
              )}>
                {completedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        projectId={projectId as string}
      />
    </div>
  );
}
