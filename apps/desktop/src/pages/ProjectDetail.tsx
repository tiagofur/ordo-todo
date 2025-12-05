import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Archive, Trash2, Plus, List, LayoutGrid, Columns } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { TaskCard } from "@/components/task/task-card";
import { ProjectBoard } from "@/components/project/project-board";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useProject, useArchiveProject, useDeleteProject } from "@/hooks/api/use-projects";
import { useTasks } from "@/hooks/api/use-tasks";

type ViewMode = "list" | "grid" | "kanban";

export function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  const { data: projectData, isLoading: isLoadingProject } = useProject(projectId!);
  const { data: tasksData } = useTasks();
  const archiveProject = useArchiveProject();
  const deleteProjectMutation = useDeleteProject();

  const project = projectData;
  const allTasks = Array.isArray(tasksData) ? tasksData : [];
  const projectTasks = allTasks.filter((t: any) => t.projectId === projectId);

  const handleArchive = () => {
    if (confirm("¿Estás seguro de archivar este proyecto?")) {
      archiveProject.mutate(projectId!, {
        onSuccess: () => {
          toast.success("Proyecto archivado");
          navigate("/projects");
        },
      });
    }
  };

  const handleDelete = () => {
    if (confirm(`¿Eliminar proyecto y ${projectTasks.length} tareas?`)) {
      deleteProjectMutation.mutate(projectId!, {
        onSuccess: () => {
          toast.success("Proyecto eliminado");
          navigate("/projects");
        },
      });
    }
  };

  if (isLoadingProject) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-2xl font-bold">Proyecto no encontrado</h2>
        <Button onClick={() => navigate("/projects")} className="mt-4">Volver</Button>
      </div>
    );
  }

  const todoTasks = projectTasks.filter((t: any) => t.status === "TODO");
  const inProgressTasks = projectTasks.filter((t: any) => t.status === "IN_PROGRESS");
  const completedTasks = projectTasks.filter((t: any) => t.status === "COMPLETED");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="rounded-xl border p-6 bg-card"
        style={{ borderLeftWidth: "4px", borderLeftColor: project.color || "#6b7280" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => navigate("/projects")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold truncate">{project.name}</h1>
              {project.description && (
                <p className="mt-2 text-muted-foreground">{project.description}</p>
              )}
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span><span className="font-medium text-foreground">{projectTasks.length}</span> tareas</span>
                <span>•</span>
                <span className="text-green-600">{completedTasks.length} completadas</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowCreateTask(true)} size="sm" 
              style={{ backgroundColor: project.color || "#6b7280", color: "white" }}>
              <Plus className="h-4 w-4 mr-2" />Nueva Tarea
            </Button>
            <Button variant="outline" size="sm" onClick={handleArchive}>
              <Archive className="h-4 w-4" />
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
        <div className="flex items-center gap-1">
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "kanban" ? "default" : "outline"} size="sm" onClick={() => setViewMode("kanban")}>
            <Columns className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tasks */}
      {projectTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <h3 className="text-lg font-medium">No hay tareas</h3>
          <Button onClick={() => setShowCreateTask(true)} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />Nueva Tarea
          </Button>
        </div>
      ) : viewMode === "kanban" ? (
        <ProjectBoard projectId={projectId!} />
      ) : (
        <div className="space-y-8">
          {todoTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase">Por Hacer ({todoTasks.length})</h3>
              <div className={cn(viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-3")}>
                {todoTasks.map((task: any) => <TaskCard key={task.id} task={task} />)}
              </div>
            </div>
          )}
          {inProgressTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase">En Progreso ({inProgressTasks.length})</h3>
              <div className={cn(viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-3")}>
                {inProgressTasks.map((task: any) => <TaskCard key={task.id} task={task} />)}
              </div>
            </div>
          )}
          {completedTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase">Completadas ({completedTasks.length})</h3>
              <div className={cn(viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-3")}>
                {completedTasks.map((task: any) => <TaskCard key={task.id} task={task} />)}
              </div>
            </div>
          )}
        </div>
      )}

      <CreateTaskDialog open={showCreateTask} onOpenChange={setShowCreateTask} projectId={projectId} />
    </div>
  );
}
