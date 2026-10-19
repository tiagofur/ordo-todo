"use client";

import { useState, type ReactNode } from "react";
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@ordo-todo/ui";
import {
  Settings,
  Archive,
  Trash2,
  Plus,
  List,
  LayoutGrid,
  CheckSquare,
  MoreHorizontal,
  CheckCircle2,
  LayoutDashboard,
  FolderKanban,
  Clock,
  Paperclip,
  Settings2,
  Search,
  X,
  Circle,
} from "lucide-react";
import {
  useTasks,
  useArchiveProject,
  useCompleteProject,
  useDeleteProject,
  useCreateTask,
  useUpdateProject,
  useDeleteTask,
} from "@/lib/api-hooks";
import { useRouter } from "@/i18n/navigation";
import { AppLayout } from "@/components/shared/app-layout";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { TaskCardCompact } from "@/components/task/task-card-compact";
import { ProjectSettingsDialog } from "@/components/project/project-settings-dialog";
import { ProjectBoard } from "@/components/project/project-board";
import { ProjectTimeline } from "@/components/project/project-timeline";
import { ProjectFiles } from "@/components/project/project-files";
import { CustomFieldsEditor } from "@/components/project/custom-fields-editor";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { TaskPriority } from "@ordo-todo/api-client";

type ViewMode = "list" | "grid";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface ProjectDetailViewProps {
  project: any | null | undefined;
  isLoadingProject: boolean;
  breadcrumbs: BreadcrumbItem[];
  backHref: string;
  backLabel?: string;
  wrapInAppLayout?: boolean;
}

export function ProjectDetailView({
  project,
  isLoadingProject,
  breadcrumbs,
  backHref,
  backLabel,
  wrapInAppLayout = false,
}: ProjectDetailViewProps) {
  const router = useRouter();
  const t = useTranslations("ProjectDetail");
  const { confirm, ConfirmModal } = useConfirm();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState<"all" | "todo" | "in_progress" | "completed">("all");

  const projectId = project?.id || "";

  const updateProject = useUpdateProject();
  const { mutateAsync: createTask } = useCreateTask();
  const { data: tasks, isLoading: isLoadingTasks } = useTasks(projectId);
  const projectTasks = tasks || [];

  const archiveProject = useArchiveProject();
  const completeProject = useCompleteProject();
  const deleteProject = useDeleteProject();
  const deleteTask = useDeleteTask();

  const renderWrapper = (content: ReactNode) =>
    wrapInAppLayout ? <AppLayout>{content}</AppLayout> : <>{content}</>;

  const handleArchive = async () => {
    if (!project) return;
    const action = project.archived
      ? t("actions.unarchive")
      : t("actions.archive");

    const confirmed = await confirm({
      title: project.archived ? t("menu.unarchive") : t("menu.archive"),
      description: `${t("confirmArchive")} ${action}?`,
      confirmLabel: project.archived ? t("menu.unarchive") : t("menu.archive"),
      variant: "default",
    });

    if (confirmed) {
      archiveProject.mutate(project.id, {
        onSuccess: () => {
          notify.success(t("toast.archived"));
          if (!project.archived) {
            router.push(backHref);
          }
        },
        onError: () => {
          notify.error(t("toast.archiveError"));
        },
      });
    }
  };

  const handleComplete = async () => {
    if (!project) return;
    const isCompleted = project.status === "COMPLETED";

    const confirmed = await confirm({
      title: isCompleted ? t("menu.markIncomplete") : t("menu.markComplete"),
      description: !isCompleted ? t("confirmComplete") : t("confirmUncomplete"),
      confirmLabel: isCompleted ? t("menu.markIncomplete") : t("menu.markComplete"),
      variant: "default",
    });

    if (confirmed) {
      completeProject.mutate(project.id, {
        onSuccess: () => {
          notify.success(
            !isCompleted ? t("toast.completed") : t("toast.uncompleted")
          );
        },
        onError: () => {
          notify.error(t("toast.completeError"));
        },
      });
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    const confirmed = await confirm({
      title: t("menu.delete"),
      description: t("confirmDelete"),
      confirmLabel: t("menu.delete"),
      variant: "destructive",
    });

    if (confirmed) {
      deleteProject.mutate(project.id, {
        onSuccess: () => {
          notify.success(t("toast.deleted"));
          router.push(backHref);
        },
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const confirmed = await confirm({
      title: t("menu.delete"),
      description:
        t("confirmDeleteTask") || "Are you sure you want to delete this task?",
      confirmLabel: t("menu.delete"),
      variant: "destructive",
    });

    if (confirmed) {
      deleteTask.mutate(taskId, {
        onSuccess: () => {
          notify.success(t("toast.taskDeleted") || "Task deleted successfully");
        },
        onError: () => {
          notify.error(t("toast.taskDeleteError") || "Failed to delete task");
        },
      });
    }
  };

  if (isLoadingProject) {
    return renderWrapper(
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
    return renderWrapper(
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-2xl font-bold">{t("notFound")}</h2>
        <p className="mt-2 text-muted-foreground">
          {t("notFoundDescription")}
        </p>
        <Button onClick={() => router.push(backHref)} className="mt-4">
          {backLabel || t("backToProjects")}
        </Button>
      </div>
    );
  }

  const todoTasks = projectTasks.filter((task: any) => task.status === "TODO");
  const inProgressTasks = projectTasks.filter(
    (task: any) => task.status === "IN_PROGRESS"
  );
  const completedTasks = projectTasks.filter(
    (task: any) => task.status === "COMPLETED" || task.status === "DONE"
  );

  const displayColor =
    project.archived || project.status === "COMPLETED"
      ? "#6b7280"
      : project.color || "#3B82F6";

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

  const filteredTodo = filteredTasks.filter((task: any) => task.status === "TODO");
  const filteredInProgress = filteredTasks.filter((task: any) => task.status === "IN_PROGRESS");
  const filteredCompleted = filteredTasks.filter(
    (task: any) => task.status === "COMPLETED" || task.status === "DONE"
  );

  return renderWrapper(
    <>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />

        {/* Project Header */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm overflow-hidden relative">
          <div
            className="absolute top-0 right-0 w-64 h-64 blur-3xl -mr-32 -mt-32 rounded-full transition-colors duration-500"
            style={{ backgroundColor: `${displayColor}15` }}
          />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <motion.div
                  initial={{ rotate: -10, scale: 0.9 }}
                  animate={{ rotate: 0, scale: 1 }}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-all duration-300 shrink-0"
                  style={{
                    backgroundColor: displayColor,
                    color: "white",
                    boxShadow: `0 10px 15px -3px ${displayColor}40`,
                  }}
                >
                  <FolderKanban className="h-7 w-7" />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight truncate">
                      {project.name}
                    </h1>
                    <div className="flex gap-2">
                      {project.archived && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                          <Archive className="h-3.5 w-3.5" />
                          {t("badges.archived")}
                        </span>
                      )}
                      {project.status === "COMPLETED" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {t("badges.completed")}
                        </span>
                      )}
                    </div>
                  </div>

                  {project.description && (
                    <p className="mt-2 text-muted-foreground line-clamp-2 max-w-2xl">
                      {project.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: displayColor }}
                      />
                      <span>
                        <span className="text-foreground">
                          {projectTasks.length}
                        </span>{" "}
                        {projectTasks.length === 1
                          ? t("stats.task")
                          : t("stats.tasks")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>
                        <span className="text-foreground">
                          {completedTasks.length}
                        </span>{" "}
                        {t("stats.completed")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 shrink-0">
                {!project.archived && project.status !== "COMPLETED" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateTask(true)}
                    className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all duration-200"
                    style={{
                      backgroundColor: displayColor,
                      boxShadow: `0 10px 15px -3px ${displayColor}40`,
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    {t("addTask")}
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
                    className="w-56 p-2 rounded-xl shadow-xl border-border/50"
                  >
                    <DropdownMenuItem
                      onClick={() => setShowSettings(true)}
                      className="rounded-lg gap-2 py-2.5"
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      {t("menu.settings")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleComplete}
                      className="rounded-lg gap-2 py-2.5"
                    >
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      {project.status === "COMPLETED"
                        ? t("menu.markIncomplete")
                        : t("menu.markComplete")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleArchive}
                      className="rounded-lg gap-2 py-2.5"
                    >
                      <Archive className="h-4 w-4 text-muted-foreground" />
                      {project.archived
                        ? t("menu.unarchive")
                        : t("menu.archive")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="rounded-lg gap-2 py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t("menu.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Progress Bar in Header */}
            <div className="mt-6 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>{t("overview.progress")}</span>
                <span className="font-bold" style={{ color: displayColor }}>
                  {progressPercent}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: displayColor,
                    boxShadow: `0 0 10px ${displayColor}40`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Apple-grade KPI Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total */}
          <div
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
            onClick={() => setTaskStatusFilter("all")}
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
                {t("stats.totalTasks")}
              </span>
              <div
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${displayColor}18`, color: displayColor }}
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
            onClick={() => setTaskStatusFilter("todo")}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#f59e0b70";
              e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(245, 158, 11, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                {t("status.todo")}
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
            onClick={() => setTaskStatusFilter("in_progress")}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#3b82f670";
              e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(59, 130, 246, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                {t("status.inProgress")}
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
            onClick={() => setTaskStatusFilter("completed")}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#10b98170";
              e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(16, 185, 129, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                {t("stats.completedTasks")}
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

        {/* Tabs for different views */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tasks" className="gap-2">
              <List className="w-4 h-4" />
              {t("tabs.list")}
            </TabsTrigger>
            <TabsTrigger value="board" className="gap-2">
              <FolderKanban className="w-4 h-4" />
              {t("tabs.board")}
            </TabsTrigger>
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              {t("tabs.overview")}
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <Clock className="w-4 h-4" />
              {t("tabs.timeline")}
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-2">
              <Paperclip className="w-4 h-4" />
              {t("tabs.files")}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings2 className="w-4 h-4" />
              {t("tabs.settings") || "Settings"}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-semibold tracking-tight">
                {t("overview.progress")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {project.description || t("emptyState.description")}
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Progreso General</span>
                  <span className="font-bold" style={{ color: displayColor }}>
                    {progressPercent}%
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted/50 overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: displayColor,
                    }}
                  />
                </div>
              </div>
            </div>

            {projectTasks.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {t("overview.recentTasks")}
                </h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {projectTasks.slice(0, 6).map((task: any, index: number) => (
                    <TaskCardCompact
                      key={task.id}
                      task={task}
                      index={index}
                      viewMode="grid"
                      showProject={false}
                      showGradient={true}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            {/* Apple Toolbar: Search + Status Filter Pills + View Switcher */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-72 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={taskSearchQuery}
                  onChange={(e) => setTaskSearchQuery(e.target.value)}
                  placeholder="Buscar tareas..."
                  className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-border/60 bg-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all"
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
                      { key: "todo", label: t("status.todo"), count: todoTasks.length },
                      { key: "in_progress", label: t("status.inProgress"), count: inProgressTasks.length },
                      { key: "completed", label: t("stats.completedTasks"), count: completedCount },
                    ] as const
                  ).map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setTaskStatusFilter(filter.key)}
                      className={cn(
                        "px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
                        taskStatusFilter === filter.key
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span>{filter.label}</span>
                      <span className="text-[11px] opacity-70">({filter.count})</span>
                    </button>
                  ))}
                </div>

                {/* View Switcher: List vs Grid */}
                <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/40 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                      viewMode === "list"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
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
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Cuadrícula"
                    aria-label="Cuadrícula"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {isLoadingTasks ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-lg bg-muted"
                  />
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
                <h3 className="text-xl font-semibold mb-2">
                  {t("emptyState.title")}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  {project.archived
                    ? t("emptyState.archivedDescription")
                    : project.status === "COMPLETED"
                      ? t("emptyState.completedDescription")
                      : t("emptyState.description")}
                </p>
                {!project.archived && project.status !== "COMPLETED" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateTask(true)}
                    className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: displayColor,
                      boxShadow: `0 10px 15px -3px ${displayColor}40`,
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    {t("addTask")}
                  </motion.button>
                )}
              </motion.div>
            ) : filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10">
                <Search className="h-10 w-10 text-muted-foreground/60 mb-3" />
                <h3 className="text-base font-semibold text-foreground">
                  No se encontraron tareas
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Ninguna tarea coincide con el término de búsqueda o filtro seleccionado.
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
                      <span>{t("status.todo")}</span>
                      <span className="text-xs font-normal">({filteredTodo.length})</span>
                    </h3>
                    <div
                      className={cn(
                        viewMode === "grid"
                          ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                          : "space-y-2"
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
                      <span>{t("status.inProgress")}</span>
                      <span className="text-xs font-normal">({filteredInProgress.length})</span>
                    </h3>
                    <div
                      className={cn(
                        viewMode === "grid"
                          ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                          : "space-y-2"
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
                      <span>{t("status.completed")}</span>
                      <span className="text-xs font-normal">({filteredCompleted.length})</span>
                    </h3>
                    <div
                      className={cn(
                        viewMode === "grid"
                          ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                          : "space-y-2"
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
                    : "space-y-2"
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
          </TabsContent>

          {/* Board Tab */}
          <TabsContent value="board">
            <ProjectBoard projectId={project.id} />
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <ProjectTimeline projectId={project.id} />
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files">
            <ProjectFiles projectId={project.id} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <CustomFieldsEditor projectId={project.id} />
          </TabsContent>
        </Tabs>
      </div>

      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        projectId={project.id}
        onSubmit={async (data) => {
          await createTask({
            ...data,
            priority: data.priority as TaskPriority,
            projectId: project.id,
          });
          setShowCreateTask(false);
        }}
      />

      <ProjectSettingsDialog
        project={project}
        open={showSettings}
        onOpenChange={setShowSettings}
        onSubmit={async (data) => {
          await updateProject.mutateAsync({
            projectId: project.id,
            data,
          });
          setShowSettings(false);
        }}
      />

      <ConfirmModal />
    </>
  );
}
