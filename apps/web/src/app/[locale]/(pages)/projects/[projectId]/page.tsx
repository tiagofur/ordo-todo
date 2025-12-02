"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Settings, Archive, Trash2, Plus, List, LayoutGrid, CheckSquare, MoreHorizontal, CheckCircle2 } from "lucide-react";
import { useProject, useTasks, useArchiveProject, useCompleteProject, useDeleteProject } from "@/lib/api-hooks";
import { AppLayout } from "@/components/shared/app-layout";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { TaskCard } from "@/components/task/task-card";
import { ProjectSettingsDialog } from "@/components/project/project-settings-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type ViewMode = "list" | "grid";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const { data: project, isLoading: isLoadingProject } = useProject(projectId);

  const { data: tasks, isLoading: isLoadingTasks } = useTasks(projectId);
  const projectTasks = tasks || [];

  const archiveProject = useArchiveProject();
  const completeProject = useCompleteProject();
  const deleteProject = useDeleteProject();

  const handleArchive = () => {
    const action = project.archived ? "desarchivar" : "archivar";
    
    if (confirm(`¿Estás seguro de ${action} este proyecto?`)) {
      archiveProject.mutate(projectId, {
        onSuccess: () => {
          toast.success(`Proyecto ${project.archived ? "desarchivado" : "archivado"}`);
          // Only redirect to projects list when archiving, not when unarchiving
          if (!project.archived) {
            router.push("/projects");
          }
        },
        onError: (error: any) => {
          toast.error(`Error al ${action} el proyecto`);
          console.error("Archive error:", error);
        }
      });
    }
  };

  const handleComplete = () => {
    const action = project.completed ? "marcar como no completado" : "marcar como completado";
    
    if (confirm(`¿Estás seguro de ${action} este proyecto?`)) {
      completeProject.mutate(projectId, {
        onSuccess: () => {
          toast.success(`Proyecto ${project.completed ? "marcado como no completado" : "completado"}`);
        },
        onError: (error: any) => {
          toast.error(`Error al ${action} el proyecto`);
          console.error("Complete error:", error);
        }
      });
    }
  };

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de eliminar este proyecto? Se eliminarán ${projectTasks.length} tareas. Esta acción no se puede deshacer.`)) {
      deleteProject.mutate(projectId, {
        onSuccess: () => {
          toast.success("Proyecto eliminado");
          router.push("/projects");
        }
      });
    }
  };

  if (isLoadingProject) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-2xl font-bold">Proyecto no encontrado</h2>
          <p className="mt-2 text-muted-foreground">El proyecto que buscas no existe o fue eliminado.</p>
          <Button onClick={() => router.push("/projects")} className="mt-4">
            Volver a Proyectos
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Group tasks by status
  const todoTasks = projectTasks.filter((t: any) => t.status === "TODO");
  const inProgressTasks = projectTasks.filter((t: any) => t.status === "IN_PROGRESS");
  const completedTasks = projectTasks.filter((t: any) => t.status === "COMPLETED");

  const displayColor = (project.archived || project.completed) ? "#6b7280" : project.color;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Proyectos", href: "/projects" },
            { label: project.name },
          ]}
        />

        {/* Project Header */}
        <div
          className="rounded-xl border p-6"
          style={{
            borderLeftWidth: "4px",
            borderLeftColor: displayColor,
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/projects")}
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
                  {project.completed && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      Completado
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
              {!project.archived && !project.completed && (
                <Button
                  onClick={() => setShowCreateTask(true)}
                  size="sm"
                  style={{ backgroundColor: displayColor, color: "white" }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Tarea
                </Button>
              )}

              {project.archived ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleArchive}>
                    <Archive className="h-4 w-4 mr-2" />
                    Desarchivar
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </>
              ) : project.completed ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleComplete}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marcar como no completado
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowSettings(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Configuración
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleComplete}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Marcar como completado
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleArchive}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archivar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 mb-6">
              <CheckSquare className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No hay tareas</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {project.archived 
                ? "Este proyecto está archivado. Desarchívalo para añadir tareas."
                : project.completed
                ? "Este proyecto está completado. Márcalo como no completado para añadir tareas."
                : "Crea tu primera tarea para empezar a trabajar en este proyecto"
              }
            </p>
            {!project.archived && !project.completed && (
              <button
                onClick={() => setShowCreateTask(true)}
                className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: displayColor,
                  boxShadow: `0 10px 15px -3px ${displayColor}20, 0 4px 6px -4px ${displayColor}20`
                }}
              >
                <Plus className="h-4 w-4" />
                Nueva Tarea
              </button>
            )}
          </motion.div>
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
                  {todoTasks.map((task: any) => (
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
                  {inProgressTasks.map((task: any) => (
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
                  {completedTasks.map((task: any) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        projectId={projectId}
      />

      <ProjectSettingsDialog
        projectId={projectId}
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </AppLayout>
  );
}
