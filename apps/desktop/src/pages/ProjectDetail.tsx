import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  Archive,
  Trash2,
  Plus,
  List,
  LayoutGrid,
  Columns,
  FolderKanban,
  CheckCircle2,
  Clock,
  Circle,
  Search,
  X,
  MoreHorizontal,
} from "lucide-react";
import {
  Button,
  Breadcrumbs,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  cn,
} from "@ordo-todo/ui";
import { motion } from "framer-motion";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { TaskCardCompact } from "@/components/task/task-card-compact";
import { ProjectBoard } from "@/components/project/project-board";
import { toast } from "sonner";
import {
  useProject,
  useProjectBySlugs,
  useWorkspace,
  useWorkspaceBySlug,
  useArchiveProject,
  useCompleteProject,
  useDeleteProject,
  useTasks,
  useDeleteTask,
} from "@/lib/shared-hooks";
import { useTranslation } from "react-i18next";

type ViewMode = "list" | "grid" | "kanban";

export function ProjectDetail() {
  const { projectId, id, projectSlug, slug, username } = useParams();
  const navigate = useNavigate();
  const { t } = (useTranslation as any)();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState<
    "all" | "todo" | "in_progress" | "completed"
  >("all");

  const actualId = projectId || id || "";
  const isSlugRoute = !!(slug && projectSlug);

  const projectBySlugQuery = useProjectBySlugs(slug || "", projectSlug || "");
  const projectByIdQuery = useProject(!isSlugRoute ? actualId : "");
  const workspaceQuery = useWorkspaceBySlug(username || "", slug || "");

  const project = isSlugRoute ? projectBySlugQuery.data : projectByIdQuery.data;
  const isLoadingProject = isSlugRoute
    ? projectBySlugQuery.isLoading
    : projectByIdQuery.isLoading;
  const workspaceByIdQuery = useWorkspace(project?.workspaceId || "");
  const workspace = workspaceQuery.data || workspaceByIdQuery.data;

  const resolvedProjectId = project?.id || actualId;

  const { data: tasksData, isLoading: isLoadingTasks } =
    useTasks(resolvedProjectId);
  const allTasks = Array.isArray(tasksData) ? tasksData : [];
  const projectTasks = allTasks.filter((t: any) =>
    resolvedProjectId
      ? String(t.projectId) === String(resolvedProjectId)
      : true,
  );

  const archiveProject = useArchiveProject();
  const completeProject = useCompleteProject();
  const deleteProjectMutation = useDeleteProject();
  const deleteTask = useDeleteTask();

  const handleArchive = () => {
    if (!project) return;
    const isArchived = !!project.archived;
    if (
      confirm(
        isArchived
          ? "¿Desarchivar este proyecto?"
          : "¿Estás seguro de archivar este proyecto?",
      )
    ) {
      archiveProject.mutate(project.id, {
        onSuccess: () => {
          toast.success(
            isArchived ? "Proyecto desarchivado" : "Proyecto archivado",
          );
          if (!isArchived) {
            navigate("/projects");
          }
        },
      });
    }
  };

  const handleComplete = () => {
    if (!project) return;
    const isCompleted = project.status === "COMPLETED";
    completeProject.mutate(project.id, {
      onSuccess: () => {
        toast.success(
          isCompleted ? "Proyecto reabierto" : "Proyecto completado",
        );
      },
    });
  };

  const handleDelete = () => {
    if (!project) return;
    if (
      confirm(
        `¿Eliminar proyecto y sus ${projectTasks.length} tareas? Esta acción no se puede deshacer.`,
      )
    ) {
      deleteProjectMutation.mutate(project.id, {
        onSuccess: () => {
          toast.success("Proyecto eliminado");
          navigate("/projects");
        },
      });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("¿Estás seguro de eliminar esta tarea?")) {
      deleteTask.mutate(taskId, {
        onSuccess: () => {
          toast.success("Tarea eliminada");
        },
      });
    }
  };

  if (isLoadingProject) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-2xl font-bold">Proyecto no encontrado</h2>
        <p className="mt-2 text-muted-foreground text-sm">
          El proyecto que buscas no existe o fue eliminado.
        </p>
        <Button
          onClick={() => navigate("/projects")}
          className="mt-4 rounded-xl"
        >
          Volver a Proyectos
        </Button>
      </div>
    );
  }

  const todoTasks = projectTasks.filter((t: any) => t.status === "TODO");
  const inProgressTasks = projectTasks.filter(
    (t: any) => t.status === "IN_PROGRESS",
  );
  const completedTasks = projectTasks.filter(
    (t: any) => t.status === "COMPLETED" || t.status === "DONE",
  );

  const displayColor =
    project.archived || project.status === "COMPLETED"
      ? "#6b7280"
      : project.color || "#ec4899";

  const totalTasks = projectTasks.length;
  const completedCount = completedTasks.length;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const filteredTasks = projectTasks.filter((task: any) => {
    if (taskSearchQuery.trim()) {
      const q = taskSearchQuery.toLowerCase();
      const titleMatch = task.title?.toLowerCase().includes(q);
      const descMatch = task.description?.toLowerCase().includes(q);
      if (!titleMatch && !descMatch) return false;
    }

    if (taskStatusFilter === "todo") {
      return task.status === "TODO";
    }
    if (taskStatusFilter === "in_progress") {
      return task.status === "IN_PROGRESS";
    }
    if (taskStatusFilter === "completed") {
      return task.status === "COMPLETED" || task.status === "DONE";
    }

    return true;
  });

  const filteredTodo = filteredTasks.filter((t: any) => t.status === "TODO");
  const filteredInProgress = filteredTasks.filter(
    (t: any) => t.status === "IN_PROGRESS",
  );
  const filteredCompleted = filteredTasks.filter(
    (t: any) => t.status === "COMPLETED" || t.status === "DONE",
  );

  const breadcrumbItems = isSlugRoute
    ? [
        {
          label: t("Sidebar.workspaces") || "Espacios de trabajo",
          href: "/workspaces",
        },
        {
          label: workspace?.name || slug || "Workspace",
          href: username ? `/${username}/${slug}` : `/workspaces/${slug}`,
        },
        { label: project?.name || "..." },
      ]
    : [
        { label: t("Sidebar.projects") || "Proyectos", href: "/projects" },
        { label: project?.name || "..." },
      ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={breadcrumbItems}
        homeHref="/dashboard"
        homeLabel={t("Sidebar.today") || "Inicio"}
        renderLink={({ href, className, children }) => (
          <Link to={href} className={className}>
            {children}
          </Link>
        )}
      />

      {/* Project Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-card p-6 shadow-sm relative overflow-hidden"
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 blur-3xl -mr-32 -mt-32 rounded-full transition-colors duration-500"
          style={{ backgroundColor: `${displayColor}18` }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg shrink-0 text-white"
              style={{
                backgroundColor: displayColor,
                boxShadow: `0 10px 15px -3px ${displayColor}40`,
              }}
            >
              <FolderKanban className="h-7 w-7" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    navigate(
                      isSlugRoute && username
                        ? `/${username}/${slug}`
                        : "/projects",
                    )
                  }
                  className="h-8 w-8 rounded-lg -ml-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
                  {project.name}
                </h1>
                <div className="flex gap-2">
                  {project.archived && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                      <Archive className="h-3.5 w-3.5" />
                      Archivado
                    </span>
                  )}
                  {project.status === "COMPLETED" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Completado
                    </span>
                  )}
                </div>
              </div>

              {project.description && (
                <p className="mt-2 text-muted-foreground line-clamp-2 max-w-2xl text-sm">
                  {project.description}
                </p>
              )}

              <div className="mt-4 flex items-center gap-4 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: displayColor }}
                  />
                  <span>
                    <span className="text-foreground font-bold">
                      {projectTasks.length}
                    </span>{" "}
                    tareas
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-green-600 dark:text-green-400">
                    <span className="font-bold">{completedCount}</span>{" "}
                    completadas
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!project.archived && project.status !== "COMPLETED" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateTask(true)}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor: displayColor,
                  boxShadow: `0 10px 15px -3px ${displayColor}40`,
                }}
              >
                <Plus className="h-4 w-4" />
                Nueva Tarea
              </motion.button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl h-11 w-11 hover:bg-muted/50 border-border/50"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52 p-2 rounded-xl shadow-xl border-border/50"
              >
                <DropdownMenuItem
                  onClick={handleComplete}
                  className="rounded-lg gap-2 py-2 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  {project.status === "COMPLETED"
                    ? "Marcar incompleto"
                    : "Marcar completado"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleArchive}
                  className="rounded-lg gap-2 py-2 cursor-pointer"
                >
                  <Archive className="h-4 w-4 text-muted-foreground" />
                  {project.archived ? "Desarchivar" : "Archivar"}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="rounded-lg gap-2 py-2 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 flex flex-col gap-2 relative z-10">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Progreso del Proyecto</span>
            <span className="font-bold" style={{ color: displayColor }}>
              {progressPercent}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                backgroundColor: displayColor,
                boxShadow: `0 0 10px ${displayColor}40`,
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Apple-grade KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total */}
        <div
          className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
          onClick={() => {
            setTaskStatusFilter("all");
            if (viewMode === "kanban") setViewMode("list");
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = `${displayColor}70`;
            e.currentTarget.style.boxShadow = `0 10px 25px -5px ${displayColor}20`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "";
            e.currentTarget.style.boxShadow = "";
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              Total de Tareas
            </span>
            <div
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
              style={{
                backgroundColor: `${displayColor}18`,
                color: displayColor,
              }}
            >
              <FolderKanban className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {totalTasks}
          </div>
        </div>

        {/* Card 2: Por hacer */}
        <div
          className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
          onClick={() => {
            setTaskStatusFilter("todo");
            if (viewMode === "kanban") setViewMode("list");
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#f59e0b70";
            e.currentTarget.style.boxShadow =
              "0 10px 25px -5px rgba(245, 158, 11, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "";
            e.currentTarget.style.boxShadow = "";
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              Por Hacer
            </span>
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 transition-transform duration-300 group-hover:scale-110">
              <Circle className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
            {todoTasks.length}
          </div>
        </div>

        {/* Card 3: En progreso */}
        <div
          className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
          onClick={() => {
            setTaskStatusFilter("in_progress");
            if (viewMode === "kanban") setViewMode("list");
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#3b82f670";
            e.currentTarget.style.boxShadow =
              "0 10px 25px -5px rgba(59, 130, 246, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "";
            e.currentTarget.style.boxShadow = "";
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              En Progreso
            </span>
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 transition-transform duration-300 group-hover:scale-110">
              <Clock className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
            {inProgressTasks.length}
          </div>
        </div>

        {/* Card 4: Completadas */}
        <div
          className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
          onClick={() => {
            setTaskStatusFilter("completed");
            if (viewMode === "kanban") setViewMode("list");
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#10b98170";
            e.currentTarget.style.boxShadow =
              "0 10px 25px -5px rgba(16, 185, 129, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "";
            e.currentTarget.style.boxShadow = "";
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              Completadas
            </span>
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 transition-transform duration-300 group-hover:scale-110">
              <CheckCircle2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {completedCount}
          </div>
        </div>
      </div>

      {/* Apple-grade Toolbar: Search + Status Filter Pills + View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full sm:w-72 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={taskSearchQuery}
            onChange={(e) => setTaskSearchQuery(e.target.value)}
            placeholder="Buscar tareas..."
            className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-border/60 bg-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          />
          {taskSearchQuery && (
            <button
              type="button"
              onClick={() => setTaskSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs & View Toggle */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-end flex-wrap sm:flex-nowrap">
          <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/40 shrink-0">
            {(
              [
                { key: "all", label: "Todas", count: totalTasks },
                { key: "todo", label: "Por hacer", count: todoTasks.length },
                {
                  key: "in_progress",
                  label: "En progreso",
                  count: inProgressTasks.length,
                },
                {
                  key: "completed",
                  label: "Completadas",
                  count: completedCount,
                },
              ] as const
            ).map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => {
                  setTaskStatusFilter(filter.key);
                  if (viewMode === "kanban") setViewMode("list");
                }}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
                  taskStatusFilter === filter.key
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span>{filter.label}</span>
                <span className="text-[11px] opacity-70">({filter.count})</span>
              </button>
            ))}
          </div>

          {/* View Switcher: List vs Grid vs Kanban */}
          <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/40 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                viewMode === "list"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="Lista"
              aria-label="Lista"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="Cuadrícula"
              aria-label="Cuadrícula"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                viewMode === "kanban"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="Tablero Kanban"
              aria-label="Tablero Kanban"
            >
              <Columns className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tasks Content */}
      <motion.div layout transition={{ duration: 0.3 }}>
        {isLoadingTasks ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : projectTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-20 text-center bg-muted/5">
            <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-6">
              <Columns className="h-10 w-10 text-muted-foreground opacity-40" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No hay tareas aún</h3>
            <p className="text-muted-foreground mb-6 max-w-sm text-sm">
              Empieza creando tu primera tarea para organizar este proyecto.
            </p>
            <Button
              onClick={() => setShowCreateTask(true)}
              className="rounded-xl px-6 cursor-pointer text-white"
              style={{ backgroundColor: displayColor }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarea
            </Button>
          </div>
        ) : viewMode === "kanban" ? (
          <ProjectBoard projectId={resolvedProjectId} />
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10">
            <Search className="h-10 w-10 text-muted-foreground/60 mb-3" />
            <h3 className="text-base font-semibold text-foreground">
              No se encontraron tareas
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Ninguna tarea coincide con el término de búsqueda o filtro
              seleccionado.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTaskSearchQuery("");
                setTaskStatusFilter("all");
              }}
              className="mt-4 rounded-xl text-xs"
            >
              Restablecer filtros
            </Button>
          </div>
        ) : taskStatusFilter === "all" && !taskSearchQuery ? (
          <div className="space-y-8">
            {filteredTodo.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Circle className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span>Por Hacer</span>
                  <span className="text-xs font-normal">
                    ({filteredTodo.length})
                  </span>
                </h3>
                <div
                  className={cn(
                    viewMode === "grid"
                      ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                      : "space-y-2",
                  )}
                >
                  {filteredTodo.map((task: any, index: number) => (
                    <TaskCardCompact
                      key={task.id}
                      task={task}
                      index={index}
                      viewMode={viewMode}
                      showProject={false}
                      showGradient={true}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredInProgress.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  <span>En Progreso</span>
                  <span className="text-xs font-normal">
                    ({filteredInProgress.length})
                  </span>
                </h3>
                <div
                  className={cn(
                    viewMode === "grid"
                      ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                      : "space-y-2",
                  )}
                >
                  {filteredInProgress.map((task: any, index: number) => (
                    <TaskCardCompact
                      key={task.id}
                      task={task}
                      index={index}
                      viewMode={viewMode}
                      showProject={false}
                      showGradient={true}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredCompleted.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Completadas</span>
                  <span className="text-xs font-normal">
                    ({filteredCompleted.length})
                  </span>
                </h3>
                <div
                  className={cn(
                    viewMode === "grid"
                      ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                      : "space-y-2",
                  )}
                >
                  {filteredCompleted.map((task: any, index: number) => (
                    <TaskCardCompact
                      key={task.id}
                      task={task}
                      index={index}
                      viewMode={viewMode}
                      showProject={false}
                      showGradient={true}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                : "space-y-2",
            )}
          >
            {filteredTasks.map((task: any, index: number) => (
              <TaskCardCompact
                key={task.id}
                task={task}
                index={index}
                viewMode={viewMode}
                showProject={false}
                showGradient={true}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </motion.div>

      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        projectId={resolvedProjectId}
      />
    </div>
  );
}
