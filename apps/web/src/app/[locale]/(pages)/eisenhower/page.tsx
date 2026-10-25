"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { AppLayout } from "@/components/shared/app-layout";
import {
  LayoutGrid,
  Plus,
  RefreshCw,
  ChevronDown,
  Flame,
  Calendar,
  Clock,
  Trash2,
  Search,
  X,
  Sparkles,
} from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import {
  useWorkspaces,
  useTasks,
  useProjects,
  useCreateTask,
} from "@/lib/api-hooks";
import { apiClient } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TaskPriority } from "@ordo-todo/api-client";
import { EisenhowerMatrix } from "@/components/tasks/eisenhower-matrix";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/navigation";

const CreateTaskDialog = dynamic(
  () =>
    import("@/components/task/create-task-dialog").then(
      (mod) => mod.CreateTaskDialog,
    ),
  { ssr: false },
);

type QuadrantFilter = "ALL" | "DO" | "SCHEDULE" | "DELEGATE" | "DELETE";

function isTaskDueSoon(task: any): boolean {
  if (!task.dueDate) return false;
  const dueDate = new Date(task.dueDate);
  const now = new Date();
  const diffDays = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diffDays <= 2 && diffDays >= 0;
}

function getTaskQuadrant(task: any): "DO" | "SCHEDULE" | "DELEGATE" | "DELETE" {
  const isUrgent =
    task.isUrgent ??
    (task.priority === "URGENT" ||
      task.priority === "HIGH" ||
      isTaskDueSoon(task));
  const isImportant =
    task.isImportant ??
    (task.priority === "URGENT" ||
      task.priority === "HIGH" ||
      task.priority === "MEDIUM");

  if (isUrgent && isImportant) return "DO";
  if (!isUrgent && isImportant) return "SCHEDULE";
  if (isUrgent && !isImportant) return "DELEGATE";
  return "DELETE";
}

export default function EisenhowerPage() {
  const t = useTranslations("Tasks.eisenhower");
  const tTasks = useTranslations("Tasks");
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [quadrantFilter, setQuadrantFilter] = useState<QuadrantFilter>("ALL");

  const { selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspaceStore();
  const { data: workspaces = [] } = useWorkspaces();
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects(
    selectedWorkspaceId || "",
  );
  const { data: allTasks = [], isLoading } = useTasks();
  const { mutateAsync: createTask } = useCreateTask();

  // Active workspace fallback
  const activeWorkspaceId =
    selectedWorkspaceId || (workspaces.length > 0 ? workspaces[0].id : null);

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspaceId, setSelectedWorkspaceId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      await apiClient.updateTask(taskId, {
        status: completed ? "COMPLETED" : "TODO",
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(
        completed ? tTasks("taskCompleted") : tTasks("taskReopened"),
      );
    } catch {
      toast.error(tTasks("taskUpdateError"));
    }
  };

  const handleTaskMove = async (
    taskId: string,
    quadrant: "DO" | "SCHEDULE" | "DELEGATE" | "DELETE",
  ) => {
    const priorityMap: Record<string, TaskPriority> = {
      DO: "URGENT",
      SCHEDULE: "HIGH",
      DELEGATE: "MEDIUM",
      DELETE: "LOW",
    };
    try {
      await apiClient.updateTask(taskId, { priority: priorityMap[quadrant] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(tTasks("taskMoved"));
    } catch {
      toast.error(tTasks("taskMoveError"));
    }
  };

  // Filter tasks by workspace if a workspace is selected
  const workspaceTasks = useMemo(() => {
    if (!activeWorkspaceId || projects.length === 0) return allTasks;
    const workspaceProjectIds = new Set(projects.map((p: any) => p.id));
    return allTasks.filter(
      (t: any) => !t.projectId || workspaceProjectIds.has(t.projectId),
    );
  }, [allTasks, activeWorkspaceId, projects]);

  // Pending tasks for the matrix
  const pendingTasks = useMemo(() => {
    return workspaceTasks.filter(
      (t: any) =>
        t.status !== "COMPLETED" && t.status !== "DONE" && !t.completed,
    );
  }, [workspaceTasks]);

  // Quadrant counts
  const quadrantCounts = useMemo(() => {
    const counts = { DO: 0, SCHEDULE: 0, DELEGATE: 0, DELETE: 0 };
    pendingTasks.forEach((task: any) => {
      const q = getTaskQuadrant(task);
      counts[q]++;
    });
    return counts;
  }, [pendingTasks]);

  // Tasks filtered for the matrix view
  const matrixTasks = useMemo(() => {
    let result = pendingTasks;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t: any) =>
          t.title?.toLowerCase().includes(q) ||
          t.project?.name?.toLowerCase().includes(q),
      );
    }

    if (quadrantFilter !== "ALL") {
      result = result.filter((t: any) => getTaskQuadrant(t) === quadrantFilter);
    }

    return result;
  }, [pendingTasks, searchQuery, quadrantFilter]);

  if (isLoading && allTasks.length === 0) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded-2xl w-1/3" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-card rounded-2xl border border-border/60"
                />
              ))}
            </div>
            <div className="h-96 bg-card rounded-2xl border border-border/60" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Apple Style Unified Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-orange-700 text-white shadow-sm shadow-orange-700/25 shrink-0">
              <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight truncate">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">
                Prioriza tus tareas por urgencia e importancia
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Live Summary Pills */}
            <div className="hidden lg:flex items-center gap-2.5 rounded-xl border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground tabular-nums">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="font-semibold text-foreground">
                  {quadrantCounts.DO}
                </span>{" "}
                urgentes
              </span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="font-semibold text-foreground">
                  {quadrantCounts.SCHEDULE}
                </span>{" "}
                programadas
              </span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="font-semibold text-foreground">
                  {quadrantCounts.DELEGATE}
                </span>{" "}
                delegadas
              </span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span className="font-semibold text-foreground">
                  {quadrantCounts.DELETE}
                </span>{" "}
                eliminar
              </span>
            </div>

            {/* Workspace Selector */}
            {workspaces.length > 0 && (
              <div className="relative inline-flex items-center">
                <select
                  aria-label="Seleccionar espacio de trabajo"
                  value={activeWorkspaceId || ""}
                  onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                  className="appearance-none bg-card border border-border/60 rounded-xl pl-3 pr-8 py-2 text-sm font-medium text-foreground hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-600 transition-colors cursor-pointer shadow-xs"
                >
                  {workspaces.map((ws: any) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-4 w-4 text-muted-foreground absolute right-2.5 pointer-events-none" />
              </div>
            )}

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted/60 transition-all duration-200 shadow-xs disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4 text-muted-foreground",
                  isRefreshing && "animate-spin text-foreground",
                )}
              />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            {/* New Task Button */}
            <button
              type="button"
              onClick={() => setShowCreateTask(true)}
              className="flex items-center gap-2 rounded-xl bg-orange-700 text-white px-3.5 sm:px-4 py-2 text-sm font-medium shadow-sm shadow-orange-700/25 transition-all duration-200 hover:bg-purple-600 hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva Tarea</span>
            </button>
          </div>
        </div>

        {/* 4 Apple-grade KPI Quadrant Cards with Micro-Halo Hover Effects */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Quadrant 1: Hacer Primero (DO) */}
          <div
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
              quadrantFilter === "DO"
                ? "border-rose-500/80 ring-2 ring-rose-500/20 bg-rose-500/[0.04]"
                : "border-border/60",
            )}
            onClick={() =>
              setQuadrantFilter((prev) => (prev === "DO" ? "ALL" : "DO"))
            }
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#f43f5e70";
              e.currentTarget.style.boxShadow =
                "0 10px 25px -5px rgba(244, 63, 94, 0.2)";
            }}
            onMouseLeave={(e) => {
              if (quadrantFilter !== "DO") {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.boxShadow = "";
              }
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Hacer Primero
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 transition-transform duration-300 group-hover:scale-110">
                <Flame className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {quadrantCounts.DO}
            </div>
            <p className="text-[11px] sm:text-xs text-rose-500 font-medium mt-1">
              Urgente e Importante
            </p>
          </div>

          {/* Quadrant 2: Programar (SCHEDULE) */}
          <div
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
              quadrantFilter === "SCHEDULE"
                ? "border-blue-500/80 ring-2 ring-blue-500/20 bg-blue-500/[0.04]"
                : "border-border/60",
            )}
            onClick={() =>
              setQuadrantFilter((prev) =>
                prev === "SCHEDULE" ? "ALL" : "SCHEDULE",
              )
            }
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#3b82f670";
              e.currentTarget.style.boxShadow =
                "0 10px 25px -5px rgba(59, 130, 246, 0.2)";
            }}
            onMouseLeave={(e) => {
              if (quadrantFilter !== "SCHEDULE") {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.boxShadow = "";
              }
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Programar
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 transition-transform duration-300 group-hover:scale-110">
                <Calendar className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {quadrantCounts.SCHEDULE}
            </div>
            <p className="text-[11px] sm:text-xs text-blue-500 font-medium mt-1">
              Importante, No Urgente
            </p>
          </div>

          {/* Quadrant 3: Delegar (DELEGATE) */}
          <div
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
              quadrantFilter === "DELEGATE"
                ? "border-amber-500/80 ring-2 ring-amber-500/20 bg-amber-500/[0.04]"
                : "border-border/60",
            )}
            onClick={() =>
              setQuadrantFilter((prev) =>
                prev === "DELEGATE" ? "ALL" : "DELEGATE",
              )
            }
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#f59e0b70";
              e.currentTarget.style.boxShadow =
                "0 10px 25px -5px rgba(245, 158, 11, 0.2)";
            }}
            onMouseLeave={(e) => {
              if (quadrantFilter !== "DELEGATE") {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.boxShadow = "";
              }
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Delegar
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 transition-transform duration-300 group-hover:scale-110">
                <Clock className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {quadrantCounts.DELEGATE}
            </div>
            <p className="text-[11px] sm:text-xs text-amber-500 font-medium mt-1">
              Urgente, No Importante
            </p>
          </div>

          {/* Quadrant 4: Eliminar (DELETE) */}
          <div
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
              quadrantFilter === "DELETE"
                ? "border-slate-500/80 ring-2 ring-slate-500/20 bg-slate-500/[0.04]"
                : "border-border/60",
            )}
            onClick={() =>
              setQuadrantFilter((prev) =>
                prev === "DELETE" ? "ALL" : "DELETE",
              )
            }
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#64748b70";
              e.currentTarget.style.boxShadow =
                "0 10px 25px -5px rgba(100, 116, 139, 0.2)";
            }}
            onMouseLeave={(e) => {
              if (quadrantFilter !== "DELETE") {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.boxShadow = "";
              }
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Eliminar
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-slate-500/10 text-slate-500 transition-transform duration-300 group-hover:scale-110">
                <Trash2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {quadrantCounts.DELETE}
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-1">
              Ni Urgente ni Importante
            </p>
          </div>
        </div>

        {/* Apple Toolbar: Search + Quadrant Filter Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:w-80 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tarea o proyecto..."
              className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-border/60 bg-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-600 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/40 shrink-0">
              {(
                [
                  { key: "ALL", label: "Todos", count: pendingTasks.length },
                  {
                    key: "DO",
                    label: "Hacer Primero",
                    count: quadrantCounts.DO,
                  },
                  {
                    key: "SCHEDULE",
                    label: "Programar",
                    count: quadrantCounts.SCHEDULE,
                  },
                  {
                    key: "DELEGATE",
                    label: "Delegar",
                    count: quadrantCounts.DELEGATE,
                  },
                  {
                    key: "DELETE",
                    label: "Eliminar",
                    count: quadrantCounts.DELETE,
                  },
                ] as const
              ).map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setQuadrantFilter(filter.key)}
                  className={cn(
                    "px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
                    quadrantFilter === filter.key
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span>{filter.label}</span>
                  <span className="text-[11px] opacity-70">
                    ({filter.count})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filter Notice */}
        {quadrantFilter !== "ALL" && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-purple-500/20 bg-orange-700/[0.04] text-xs font-medium text-foreground">
            <span>
              Filtrando cuadrante:{" "}
              <strong>
                {quadrantFilter === "DO"
                  ? "Hacer Primero (Urgente e Importante)"
                  : quadrantFilter === "SCHEDULE"
                    ? "Programar (Importante, No Urgente)"
                    : quadrantFilter === "DELEGATE"
                      ? "Delegar (Urgente, No Importante)"
                      : "Eliminar (Ni Urgente ni Importante)"}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => setQuadrantFilter("ALL")}
              className="text-orange-600 dark:text-orange-400 hover:underline cursor-pointer font-semibold"
            >
              Ver todos los cuadrantes
            </button>
          </div>
        )}

        {/* Interactive Eisenhower Matrix Grid */}
        <div className="rounded-2xl border border-border/60 bg-card/60 p-4 sm:p-6 shadow-xs backdrop-blur-xs">
          <EisenhowerMatrix
            tasks={matrixTasks.map((t: any) => ({
              id: t.id,
              title: t.title,
              priority: t.priority || "LOW",
              dueDate: t.dueDate,
              isUrgent: t.isUrgent,
              isImportant: t.isImportant,
              completed: t.completed || false,
              project: t.project,
            }))}
            onTaskClick={() => router.push("/tasks")}
            onTaskComplete={handleTaskComplete}
            onTaskMove={handleTaskMove}
          />
        </div>

        {/* Apple Tips / Methodology Guide Card */}
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-foreground">
            <Sparkles className="h-4 w-4 text-orange-600" />
            <span>¿Cómo funciona el principio de Eisenhower?</span>
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-muted-foreground">
            <div className="p-3 rounded-xl bg-card border border-border/50">
              <strong className="text-rose-500 block mb-1">
                1. Hacer Primero
              </strong>
              Crisis, fechas límite inminentes y problemas urgentes e
              importantes. Realízalas de inmediato.
            </div>
            <div className="p-3 rounded-xl bg-card border border-border/50">
              <strong className="text-blue-500 block mb-1">2. Programar</strong>
              Estrategia, relaciones, crecimiento y planificación. No tienen
              plazo inmediato pero crean el mayor valor.
            </div>
            <div className="p-3 rounded-xl bg-card border border-border/50">
              <strong className="text-amber-500 block mb-1">3. Delegar</strong>
              Interrupciones y tareas que requieren acción rápida pero no tu
              habilidad especializada.
            </div>
            <div className="p-3 rounded-xl bg-card border border-border/50">
              <strong className="text-slate-500 block mb-1">4. Eliminar</strong>
              Ladrones de tiempo, actividades sin valor real ni urgencia.
              Descártalas para liberar foco.
            </div>
          </div>
        </div>
      </div>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        projects={projects.map((p: any) => ({ id: p.id, name: p.name }))}
        isLoadingProjects={isLoadingProjects}
        onRequestCreateProject={() => {
          setShowCreateTask(false);
          router.push("/projects");
        }}
        onSubmit={async (data) => {
          await createTask({
            ...data,
            priority: data.priority as TaskPriority,
          });
          setShowCreateTask(false);
        }}
      />
    </AppLayout>
  );
}
