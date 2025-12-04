import { useParams, useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import { ArrowLeft, Archive, Trash2, Plus, List, LayoutGrid, Columns, GanttChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { TaskCard } from "@/components/task/task-card";
import { KanbanBoard, KanbanColumn } from "@/components/kanban";
import { ProjectTimeline } from "@/components/analytics";
import { TaskDetailPanel, TaskDetailData } from "@/components/task-detail";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useProject, useArchiveProject, useDeleteProject } from "@/hooks/api/use-projects";
import { useTasks, useUpdateTask } from "@/hooks/api/use-tasks";
import { DropResult } from "@hello-pangea/dnd";

type ViewMode = "list" | "grid" | "kanban" | "timeline";

const STATUS_COLUMNS = [
  { id: "TODO", title: "Por Hacer", color: "#6b7280" },
  { id: "IN_PROGRESS", title: "En Progreso", color: "#3b82f6" },
  { id: "IN_REVIEW", title: "En Revisión", color: "#f59e0b" },
  { id: "COMPLETED", title: "Completado", color: "#22c55e" },
];

export function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [selectedTask, setSelectedTask] = useState<TaskDetailData | null>(null);

  const { data: projectData, isLoading: isLoadingProject } = useProject(projectId!);
  const { data: tasksData, isLoading: isLoadingTasks } = useTasks();
  const archiveProject = useArchiveProject();
  const deleteProjectMutation = useDeleteProject();
  const updateTask = useUpdateTask();

  const project = projectData?.data;
  const allTasks = tasksData?.data ?? [];
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

  // Convert tasks to Kanban format
  const kanbanColumns: KanbanColumn[] = STATUS_COLUMNS.map((col) => ({
    id: col.id,
    title: col.title,
    color: col.color,
    tasks: projectTasks
      .filter((t: any) => t.status === col.id)
      .map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        priority: t.priority || "MEDIUM",
        dueDate: t.dueDate,
        tags: t.tags,
        estimatedPomodoros: t.estimatedPomodoros,
        completedPomodoros: t.completedPomodoros,
      })),
  }));

  // Convert tasks to Timeline format
  const timelineTasks = projectTasks
    .filter((t: any) => t.dueDate)
    .map((t: any) => ({
      id: t.id,
      title: t.title,
      startDate: t.createdAt || new Date(),
      dueDate: t.dueDate,
      status: t.status || "TODO",
      priority: t.priority || "MEDIUM",
      progress: t.status === "COMPLETED" ? 100 : t.status === "IN_PROGRESS" ? 50 : 0,
    }));

  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    updateTask.mutate(
      { id: draggableId, status: destination.droppableId as any },
      { onSuccess: () => toast.success("Tarea actualizada") }
    );
  }, [updateTask]);

  const handleTaskClick = (task: any) => {
    const fullTask = projectTasks.find((t: any) => t.id === task.id);
    if (fullTask) {
      setSelectedTask({
        ...fullTask,
        subtasks: fullTask.subtasks || [],
        comments: fullTask.comments || [],
        attachments: fullTask.attachments || [],
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
          <Button variant={viewMode === "timeline" ? "default" : "outline"} size="sm" onClick={() => setViewMode("timeline")}>
            <GanttChart className="h-4 w-4" />
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
        <KanbanBoard
          columns={kanbanColumns}
          onDragEnd={handleDragEnd}
          onTaskClick={handleTaskClick}
          onAddTask={() => setShowCreateTask(true)}
        />
      ) : viewMode === "timeline" ? (
        <ProjectTimeline
          tasks={timelineTasks}
          onTaskClick={handleTaskClick}
        />
      ) : (
        <div className="space-y-8">
          {todoTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase">Por Hacer ({todoTasks.length})</h3>
              <div className={cn(viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-3")}>
                {todoTasks.map((task: any) => <TaskCard key={task.id} task={task} onClick={() => handleTaskClick(task)} />)}
              </div>
            </div>
          )}
          {inProgressTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase">En Progreso ({inProgressTasks.length})</h3>
              <div className={cn(viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-3")}>
                {inProgressTasks.map((task: any) => <TaskCard key={task.id} task={task} onClick={() => handleTaskClick(task)} />)}
              </div>
            </div>
          )}
          {completedTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase">Completadas ({completedTasks.length})</h3>
              <div className={cn(viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-3")}>
                {completedTasks.map((task: any) => <TaskCard key={task.id} task={task} onClick={() => handleTaskClick(task)} />)}
              </div>
            </div>
          )}
        </div>
      )}

      <CreateTaskDialog open={showCreateTask} onOpenChange={setShowCreateTask} projectId={projectId} />

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updates) => {
            updateTask.mutate({ id: selectedTask.id, ...updates }, {
              onSuccess: () => {
                toast.success("Tarea actualizada");
                setSelectedTask(null);
              }
            });
          }}
          onDelete={() => {
            // TODO: implement delete
            toast.success("Tarea eliminada");
            setSelectedTask(null);
          }}
          onStartTimer={() => navigate("/timer")}
        />
      )}
    </div>
  );
}
