import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Archive, Trash2, Plus, List, LayoutGrid, Columns } from "lucide-react";
import { Button, cn } from "@ordo-todo/ui";
import { motion } from "framer-motion";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { TaskCard } from "@/components/task/task-card";
import { ProjectBoard } from "@/components/project/project-board";
import { toast } from "sonner";
import { useProject, useArchiveProject, useDeleteProject, useTasks } from "@/lib/shared-hooks";

type ViewMode = "list" | "grid" | "kanban";

export function ProjectDetail() {
  const { projectId, id, projectSlug } = useParams();
  const navigate = useNavigate();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  // Determine which project ID to use
  // Routes can be:
  // 1. /projects/:id (old Desktop route)
  // 2. /:username/:slug/projects/:projectSlug (new route)
  const actualProjectId = projectId || id || projectSlug || "";

  const { data: projectData, isLoading: isLoadingProject } = useProject(actualProjectId);
  const { data: tasksData } = useTasks();
  const archiveProject = useArchiveProject();
  const deleteProjectMutation = useDeleteProject();

  const project = projectData;
  const allTasks = Array.isArray(tasksData) ? tasksData : [];
  const projectTasks = allTasks.filter((t: any) => t.projectId === actualProjectId);

  const handleArchive = () => {
    if (confirm("¿Estás seguro de archivar este proyecto?")) {
      archiveProject.mutate(actualProjectId, {
        onSuccess: () => {
          toast.success("Proyecto archivado");
          navigate("/projects");
        },
      });
    }
  };

  const handleDelete = () => {
    if (confirm(`¿Eliminar proyecto y ${projectTasks.length} tareas?`)) {
      deleteProjectMutation.mutate(actualProjectId, {
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
      {/* Header - Standard Iconic Version using Project Color */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-card p-6 shadow-sm relative overflow-hidden"
      >
        {/* Subtle Project Color Glow */}
        <div 
          className="absolute top-0 right-0 w-64 h-64 blur-3xl -mr-32 -mt-32 rounded-full opacity-10" 
          style={{ backgroundColor: project.color || "#6b7280" }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg shrink-0"
              style={{ 
                backgroundColor: project.color || "#6b7280", 
                color: 'white',
                boxShadow: `0 10px 15px -3px ${(project.color || "#6b7280")}40`
              }}
            >
              <Columns className="h-7 w-7" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate("/projects")} className="h-8 w-8 rounded-lg -ml-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight truncate">{project.name}</h1>
              </div>
              
              {project.description && (
                <p className="mt-2 text-muted-foreground line-clamp-2 max-w-2xl">{project.description}</p>
              )}
              
              <div className="mt-4 flex items-center gap-4 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color || "#6b7280" }} />
                  <span><span className="text-foreground font-bold">{projectTasks.length}</span> tareas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-green-600"><span className="font-bold">{completedTasks.length}</span> completadas</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateTask(true)}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200"
              style={{ 
                backgroundColor: project.color || "#6b7280",
                boxShadow: `0 10px 15px -3px ${(project.color || "#6b7280")}40`
              }}
            >
              <Plus className="h-4 w-4" />
              Nueva Tarea
            </motion.button>
            
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={handleArchive} className="h-10 w-10 p-0 rounded-xl hover:bg-muted/50 border-border/50">
                <Archive className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete} className="h-10 w-10 p-0 rounded-xl hover:bg-red-50 text-red-600 border-border/50">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Header Progress Bar */}
        <div className="mt-6 flex flex-col gap-2 relative z-10">
          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>Progreso del Proyecto</span>
            <span style={{ color: project.color || "#6b7280" }}>{Math.round((completedTasks.length / (projectTasks.length || 1)) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedTasks.length / (projectTasks.length || 1)) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: project.color || "#6b7280" }}
            />
          </div>
        </div>
      </motion.div>

      {/* View Toggle - Improved Style */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Vistas de Tareas</h2>
        <div className="flex items-center bg-muted/30 p-1 rounded-xl border border-border/50">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setViewMode("list")}
            className={cn("rounded-lg h-8 px-3 transition-all", viewMode === "list" && "bg-background shadow-sm")}
            style={viewMode === "list" ? { color: project.color || "#6b7280" } : {}}
          >
            <List className="h-4 w-4 mr-2" />
            <span className="text-xs font-semibold">Lista</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setViewMode("grid")}
            className={cn("rounded-lg h-8 px-3 transition-all", viewMode === "grid" && "bg-background shadow-sm")}
            style={viewMode === "grid" ? { color: project.color || "#6b7280" } : {}}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            <span className="text-xs font-semibold">Grid</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setViewMode("kanban")}
            className={cn("rounded-lg h-8 px-3 transition-all", viewMode === "kanban" && "bg-background shadow-sm")}
            style={viewMode === "kanban" ? { color: project.color || "#6b7280" } : {}}
          >
            <Columns className="h-4 w-4 mr-2" />
            <span className="text-xs font-semibold">Kanban</span>
          </Button>
        </div>
      </div>

      {/* Tasks Content with SlideIn Animation */}
      <motion.div
        layout
        transition={{ duration: 0.3 }}
      >
        {projectTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-20 text-center bg-muted/5">
            <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-6">
               <Columns className="h-10 w-10 text-muted-foreground opacity-40" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No hay tareas aún</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">Empieza por crear tu primera tarea para organizar este proyecto.</p>
            <Button 
              onClick={() => setShowCreateTask(true)} 
              className="rounded-xl px-6"
              style={{ backgroundColor: project.color || "#6b7280" }}
            >
              <Plus className="h-4 w-4 mr-2" />Nueva Tarea
            </Button>
          </div>
        ) : viewMode === "kanban" ? (
          <ProjectBoard projectId={actualProjectId!} />
        ) : (
          <div className="space-y-10">
            {todoTasks.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Por Hacer • {todoTasks.length}</h3>
                <div className={cn(viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-3")}>
                  {todoTasks.map((task: any, idx: number) => (
                    <TaskCard key={task.id} task={task} index={idx} />
                  ))}
                </div>
              </div>
            )}
            {inProgressTasks.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-blue-500/80 uppercase tracking-widest px-1">En Progreso • {inProgressTasks.length}</h3>
                <div className={cn(viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-3")}>
                  {inProgressTasks.map((task: any, idx: number) => (
                    <TaskCard key={task.id} task={task} index={idx} />
                  ))}
                </div>
              </div>
            )}
            {completedTasks.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-green-500/80 uppercase tracking-widest px-1">Completadas • {completedTasks.length}</h3>
                <div className={cn(viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-3")}>
                  {completedTasks.map((task: any, idx: number) => (
                    <TaskCard key={task.id} task={task} index={idx} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      <CreateTaskDialog open={showCreateTask} onOpenChange={setShowCreateTask} projectId={actualProjectId} />
    </div>
  );
}
