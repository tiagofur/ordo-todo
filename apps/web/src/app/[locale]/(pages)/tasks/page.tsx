"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/shared/app-layout";
import {
  Plus,
  CheckSquare,
  Tag as TagIcon,
  X,
  List,
  LayoutGrid,
  Grid2x2,
  Search,
  ChevronDown,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ordo-todo/ui";
import {
  toCalendarDateString,
  isCalendarDateToday,
  isCalendarDateOverdue,
} from "@ordo-todo/core";
import { useTasks, useTags, useProjects, useCreateTask } from "@/lib/api-hooks";
import { TaskPriority } from "@ordo-todo/api-client";
import { TaskCardCompact } from "@/components/task/task-card-compact";
import { ExportDataButton } from "@/components/data/export-data";
import { motion } from "framer-motion";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const CreateTaskDialog = dynamic(
  () => import("@/components/task/create-task-dialog").then((mod) => mod.CreateTaskDialog),
  { ssr: false }
);

const EisenhowerMatrix = dynamic(
  () => import("@/components/tasks/eisenhower-matrix").then((mod) => mod.EisenhowerMatrix),
  { ssr: false }
);

type ViewMode = "list" | "grid" | "eisenhower";
type TaskStatusFilter =
  | "all"
  | "pending"
  | "today"
  | "urgent"
  | "completed"
  | "overdue"
  | "thisWeek";

export default function TasksPage() {
  return (
    <Suspense fallback={<TasksPageSkeleton />}>
      <TasksPageContent />
    </Suspense>
  );
}

function TasksPageSkeleton() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="h-12 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-muted animate-pulse h-48" />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

function TasksPageContent() {
  const t = useTranslations("Tasks");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedWorkspaceId } = useWorkspaceStore();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("all");
  const initialView = searchParams.get("view") as ViewMode | null;
  const [viewMode, setViewMode] = useState<ViewMode>(
    initialView === "eisenhower" ? "eisenhower" : "grid"
  );

  const tagId = searchParams.get("tag");
  const { data: tasks, isLoading } = useTasks();
  const { data: tags } = useTags(selectedWorkspaceId || "");
  const { data: projects, isLoading: isLoadingProjects } = useProjects(selectedWorkspaceId || "");
  const { mutateAsync: createTask } = useCreateTask();
  const queryClient = useQueryClient();

  const handleEisenhowerComplete = async (taskId: string, completed: boolean) => {
    try {
      await apiClient.updateTask(taskId, {
        status: completed ? "COMPLETED" : "TODO",
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(completed ? t("taskCompleted") : t("taskReopened"));
    } catch {
      toast.error(t("taskUpdateError"));
    }
  };

  const handleEisenhowerMove = async (
    taskId: string,
    quadrant: "DO" | "SCHEDULE" | "DELEGATE" | "DELETE"
  ) => {
    type TaskPriorityType = "HIGH" | "MEDIUM" | "LOW" | "URGENT";
    const priorityMap: Record<string, TaskPriorityType> = {
      DO: "URGENT",
      SCHEDULE: "HIGH",
      DELEGATE: "MEDIUM",
      DELETE: "LOW",
    };
    try {
      await apiClient.updateTask(taskId, { priority: priorityMap[quadrant] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(t("taskMoved"));
    } catch {
      toast.error(t("taskMoveError"));
    }
  };

  // Compute live KPIs for header
  const stats = useMemo(() => {
    const list = tasks || [];
    const total = list.length;
    const completed = list.filter(
      (t: any) => t.status === "COMPLETED" || t.status === "DONE" || t.completed
    ).length;
    const pending = total - completed;
    return { total, pending, completed };
  }, [tasks]);

  // Filter tasks by tag if tagId is present
  let filteredTasks = tagId && tasks
    ? tasks.filter((task: any) =>
        task.tags?.some((tag: any) => tag.id === tagId)
      )
    : tasks;

  // Filter tasks by workspace if selectedWorkspaceId is present
  if (filteredTasks && selectedWorkspaceId) {
    filteredTasks = filteredTasks.filter((task: any) => {
      // ODD 021: tareas express (sin proyecto) son personales → siempre visibles
      if (!task.projectId) {
        return true;
      }
      const taskWorkspaceId = task.project?.workspace?.id || task.project?.workspaceId;
      if (taskWorkspaceId) {
        return taskWorkspaceId === selectedWorkspaceId;
      }
      if (projects && projects.length > 0) {
        return projects.some((p: any) => p.id === task.projectId);
      }
      return true;
    });
  }

  // Filter by search query
  if (filteredTasks && searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredTasks = filteredTasks.filter(
      (task: any) =>
        task.title?.toLowerCase().includes(q) ||
        task.description?.toLowerCase().includes(q)
    );
  }

  // Filter by unified segmented filter
  if (filteredTasks && statusFilter !== "all") {
    filteredTasks = filteredTasks.filter((task: any) => {
      const isCompleted = task.completed || task.status === "COMPLETED" || task.status === "DONE";

      switch (statusFilter) {
        case "pending":
          return !isCompleted;
        case "today":
          return !!task.dueDate && isCalendarDateToday(task.dueDate) && !isCompleted;
        case "urgent":
          return (task.priority === "URGENT" || task.priority === "HIGH" || task.isUrgent) && !isCompleted;
        case "completed":
          return isCompleted;
        case "overdue":
          return !!task.dueDate && isCalendarDateOverdue(task.dueDate, isCompleted);
        case "thisWeek": {
          if (!task.dueDate) return false;
          const dueStr = toCalendarDateString(task.dueDate);
          const now = new Date();
          const todayStr = toCalendarDateString(now);
          const endOfWeek = new Date(now);
          endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
          const endOfWeekStr = toCalendarDateString(endOfWeek);
          return dueStr >= todayStr && dueStr <= endOfWeekStr;
        }
        default:
          return true;
      }
    });
  }

  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "all" || !!tagId;

  // Get the current tag info
  const currentTag =
    tagId && tags ? tags.find((tag: any) => tag.id === tagId) : null;

  const clearTagFilter = () => {
    router.push("/tasks");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header - Apple Style Unified Pattern (matching Projects & Calendar) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-sm shadow-purple-500/25 shrink-0">
              <CheckSquare className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                {t("subtitle")}
              </p>

              {/* Active tag filter indicator */}
              {currentTag && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs"
                  style={{
                    borderColor: currentTag.color,
                  }}
                >
                  <TagIcon
                    className="h-3.5 w-3.5"
                    style={{ color: currentTag.color }}
                  />
                  <span
                    className="font-medium"
                    style={{ color: currentTag.color }}
                  >
                    {currentTag.name}
                  </span>
                  <button
                    onClick={clearTagFilter}
                    className="ml-1 rounded-full hover:bg-muted p-0.5 transition-colors"
                  >
                    <X
                      className="h-3 w-3"
                      style={{ color: currentTag.color }}
                    />
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Summary Pills */}
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground tabular-nums">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              <span>Total:</span>
              <span className="font-bold text-foreground">{stats.total}</span>
              <span className="text-border">|</span>
              <span>Pendientes:</span>
              <span className="font-bold text-foreground">{stats.pending}</span>
              <span className="text-border">|</span>
              <span>Completadas:</span>
              <span className="font-bold text-foreground">{stats.completed}</span>
            </div>

            {/* Export button */}
            <ExportDataButton
              data={{ tasks: tasks || [], projects: projects || [] }}
              filename="ordo-tasks"
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateTask(true)}
              className="flex items-center gap-2 rounded-xl bg-purple-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-purple-500/25 transition-all duration-200 hover:bg-purple-600 hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{t("newTask")}</span>
            </motion.button>
          </div>
        </div>

        {/* Toolbar: Search + Status Filter Segmented Tabs + View Mode Toggle */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Bar - Generous width with min-w to never squish */}
          <div className="relative w-full lg:w-72 2xl:w-80 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tareas..."
              className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-border/60 bg-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
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

          {/* Controls: Filter Segmented Control & View Mode Switcher */}
          <div className="flex items-center gap-2.5 justify-between lg:justify-end flex-wrap sm:flex-nowrap">
            {/* Filter Segmented Control */}
            <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/40 shrink-0">
              {(
                [
                  { key: "all", label: "Todas" },
                  { key: "pending", label: "Pendientes" },
                  { key: "today", label: "Hoy" },
                  { key: "urgent", label: "Urgentes" },
                  { key: "completed", label: "Completadas" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={cn(
                    "px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                    statusFilter === tab.key
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "px-2 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer",
                      ["overdue", "thisWeek"].includes(statusFilter)
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>
                      {statusFilter === "overdue"
                        ? "Vencidas"
                        : statusFilter === "thisWeek"
                        ? "Esta semana"
                        : "Más"}
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("overdue")}
                    className={cn(
                      "cursor-pointer",
                      statusFilter === "overdue" && "font-semibold"
                    )}
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500 mr-2" />
                    Vencidas
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("thisWeek")}
                    className={cn(
                      "cursor-pointer",
                      statusFilter === "thisWeek" && "font-semibold"
                    )}
                  >
                    <Clock className="h-3.5 w-3.5 text-purple-500 mr-2" />
                    Esta semana
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* View Switcher: Grid vs List vs Eisenhower */}
            <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/40 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                  viewMode === "grid"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={t("gridView")}
                aria-label={t("gridView")}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Cuadrícula</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                  viewMode === "list"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={t("listView")}
                aria-label={t("listView")}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Lista</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("eisenhower")}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                  viewMode === "eisenhower"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={t("eisenhowerView")}
                aria-label={t("eisenhowerView")}
              >
                <Grid2x2 className="h-4 w-4" />
                <span className="hidden sm:inline">Eisenhower</span>
              </button>
            </div>
          </div>
        </div>

        {/* Eisenhower Matrix View */}
        {viewMode === "eisenhower" && !isLoading && filteredTasks ? (
          <EisenhowerMatrix
            tasks={(filteredTasks || []).map((t: any) => ({
              id: t.id,
              title: t.title,
              priority: t.priority || "LOW",
              dueDate: t.dueDate,
              isUrgent: t.isUrgent,
              isImportant: t.isImportant,
              completed: t.completed,
              project: t.project,
            }))}
            onTaskComplete={handleEisenhowerComplete}
            onTaskMove={handleEisenhowerMove}
          />
        ) : null}

        {/* Tasks Grid/List */}
        {viewMode !== "eisenhower" && isLoading ? (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
                : "space-y-3"
            )}
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-2xl bg-muted animate-pulse",
                  viewMode === "grid" ? "h-48" : "h-20"
                )}
              />
            ))}
          </div>
        ) : viewMode !== "eisenhower" && filteredTasks && filteredTasks.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={cn(
              viewMode === "grid"
                ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
                : "space-y-3"
            )}
          >
            {filteredTasks.map((task: any, index: number) => (
              <TaskCardCompact
                key={task.id}
                task={task}
                index={index}
                viewMode={viewMode}
                showProject={true}
                showGradient={true}
              />
            ))}
          </motion.div>
        ) : viewMode !== "eisenhower" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted mb-6">
              <CheckSquare className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {currentTag ? t("noTasksWithTag") : hasActiveFilters ? t("noResults") : t("allClear")}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {currentTag
                ? t("noTasksWithTagDescription", { tagName: currentTag.name })
                : hasActiveFilters
                ? t("noResultsDescription")
                : t("noPendingTasks")}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  if (tagId) router.push("/tasks");
                }}
                className="flex items-center gap-2 rounded-xl bg-muted text-foreground px-6 py-3 text-sm font-medium transition-all duration-200 hover:bg-muted/80 cursor-pointer"
              >
                <X className="h-4 w-4" />
                {t("clearFilters")}
              </button>
            ) : (
              <button
                onClick={() => setShowCreateTask(true)}
                className="flex items-center gap-2 rounded-xl bg-purple-500 text-white px-6 py-3 text-sm font-medium shadow-sm shadow-purple-500/25 transition-all duration-200 hover:bg-purple-600 hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4" />
                {t("newTask")}
              </button>
            )}
          </motion.div>
        ) : null}
      </div>

      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        projects={projects?.map((p: any) => ({ id: p.id, name: p.name }))}
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
