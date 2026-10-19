import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Clock,
  Home,
  TrendingUp,
  ArrowUpDown,
  Eye,
  EyeOff,
  List,
  LayoutGrid,
  ListChecks,
  Plus,
  Timer,
  FolderPlus,
  Sun,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@ordo-todo/ui";
import { isCalendarDateToday, isCalendarDateOverdue } from "@ordo-todo/core";
import { 
  useTimerStats, 
  useDailyMetrics, 
  useProductivityStreak,
  useTasks,
  useProjects,
} from "@/hooks/api";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { TaskCardCompact } from "@/components/task/task-card-compact";
import { TaskDetailPanel } from "@/components/task/task-detail-panel";
import { DailyRitualDialog, type RitualMode } from "@/components/planning/daily-ritual-dialog";
import { 
  TimerWidget, 
  ProductivityStreakWidget, 
  HabitsWidget, 
  OkrWidget, 
  AIInsightsWidget 
} from "@/components/dashboard";

type SortOption = "priority" | "duration" | "created";
type ViewMode = "list" | "grid";

export function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const accentColor = "#06b6d4";

  // UI State
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [showCompleted, setShowCompleted] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Quick Actions & Ritual State
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  const [showDailyRitualDialog, setShowDailyRitualDialog] = useState(false);
  const [dailyRitualMode, setDailyRitualMode] = useState<RitualMode>("morning");

  const { selectedWorkspaceId } = useWorkspaceStore();
  const { data: projects = [] } = useProjects(selectedWorkspaceId || "");

  // Get today's date range
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59
  );

  // Fetch today's timer stats
  const { data: stats } = useTimerStats({
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  });

  // Fetch today's daily metrics (tasksCompleted, subtasksCompleted, etc.)
  const { data: dailyMetricsArray } = useDailyMetrics({
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  });
  const dailyMetrics = dailyMetricsArray?.[0];

  // Fetch all tasks (we'll filter for today's tasks to display)
  const { data: allTasks = [] } = useTasks();

  // Filter tasks for today view with workspace isolation
  const todaysTasks = allTasks.filter((task: any) => {
    // Workspace isolation filter
    if (selectedWorkspaceId) {
      const taskWorkspaceId = task.project?.workspace?.id || task.project?.workspaceId;
      if (taskWorkspaceId && taskWorkspaceId !== selectedWorkspaceId) {
        return false;
      }
      if (!taskWorkspaceId && projects.length > 0 && !projects.some((p: any) => p.id === task.projectId)) {
        return false;
      }
    }

    // Check if task has dueDate = today
    if (task.dueDate && isCalendarDateToday(task.dueDate)) {
      return true;
    }

    // Check if task was completed today
    if (task.status === "COMPLETED") {
      if (task.completedAt) {
        const completedDate = new Date(task.completedAt);
        if (completedDate.toDateString() === today.toDateString()) {
          return true;
        }
      }
      if (task.updatedAt) {
        const updatedDate = new Date(task.updatedAt);
        if (updatedDate.toDateString() === today.toDateString()) {
          return true;
        }
      }
    }

    // Include pending tasks that are overdue or have no dueDate
    if (task.status === "TODO" || task.status === "IN_PROGRESS") {
      if (!task.dueDate) {
        return true;
      }
      if (isCalendarDateOverdue(task.dueDate, false)) {
        return true;
      }
    }

    return false;
  });

  // Filter out completed tasks if showCompleted is false
  const filteredTasks = showCompleted
    ? todaysTasks
    : todaysTasks.filter((task: any) => task.status !== "COMPLETED");

  // Sort tasks based on selected option
  const sortedTasks = [...filteredTasks].sort((a: any, b: any) => {
    // Completed tasks always go to the end
    if (a.status === "COMPLETED" && b.status !== "COMPLETED") return 1;
    if (a.status !== "COMPLETED" && b.status === "COMPLETED") return -1;

    // Sort by selected option
    switch (sortBy) {
      case "priority": {
        const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        const aPriority =
          priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
        const bPriority =
          priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;
        return aPriority - bPriority;
      }
      case "duration": {
        const aDuration = a.estimatedMinutes ?? a.estimatedTime ?? Infinity;
        const bDuration = b.estimatedMinutes ?? b.estimatedTime ?? Infinity;
        return aDuration - bDuration;
      }
      case "created": {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      default:
        return 0;
    }
  });

  // Count completed tasks for the toggle label
  const completedCount = todaysTasks.filter(
    (task: any) => task.status === "COMPLETED"
  ).length;

  // Use metrics from backend
  const completedToday = dailyMetrics?.tasksCompleted ?? 0;
  const subtasksCompletedToday = dailyMetrics?.subtasksCompleted ?? 0;

  // Format time worked
  const hoursWorked = stats ? Math.floor((stats.totalMinutesWorked ?? 0) / 60) : 0;
  const minutesWorked = stats ? (stats.totalMinutesWorked ?? 0) % 60 : 0;
  const timeWorkedText =
    hoursWorked > 0
      ? `${hoursWorked}h ${minutesWorked}m`
      : minutesWorked > 0
        ? `${minutesWorked}m`
        : "0m";

  // Calculate productivity
  const productivity =
    stats && stats.totalSessions > 0
      ? `${Math.round(stats.completionRate * 100)}%`
      : "--";

  // Get real productivity streak from backend
  const { data: streakData } = useProductivityStreak();
  const currentStreak = streakData?.currentStreak ?? 0;
  const longestStreak = streakData?.longestStreak ?? 0;

  const statCards = [
    {
      title: t("Dashboard.completed", "Completadas"),
      value: completedToday.toString(),
      icon: CheckCircle2,
      color: accentColor,
    },
    {
      title: "Subtareas",
      value: subtasksCompletedToday.toString(),
      icon: ListChecks,
      color: "#8b5cf6", // Purple
    },
    {
      title: t("Dashboard.timeWorked", "Tiempo"),
      value: timeWorkedText,
      icon: Clock,
      color: "#f59e0b", // Amber
    },
    {
      title: t("Dashboard.productivity", "Productividad"),
      value: productivity,
      icon: TrendingUp,
      color: "#10b981", // Emerald
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-sm shadow-cyan-500/25 shrink-0">
            <Home className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight">
              {t("Dashboard.today", "Hoy")}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
              {new Date().toLocaleDateString(i18n.language, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Daily Ritual Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const isEvening = new Date().getHours() >= 17;
              setDailyRitualMode(isEvening ? "evening" : "morning");
              setShowDailyRitualDialog(true);
            }}
            className={cn(
              "group relative flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border shadow-xs hover:shadow-md cursor-pointer",
              new Date().getHours() >= 17
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20"
                : "bg-gradient-to-r from-amber-500/10 to-cyan-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200 hover:border-amber-500/50"
            )}
          >
            {new Date().getHours() >= 17 ? (
              <>
                <Moon className="h-4 w-4 text-indigo-500 transition-transform group-hover:-rotate-12" />
                <span>Daily Shutdown</span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4 text-amber-500 transition-transform group-hover:rotate-45" />
                <span>Plan My Day</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{
              y: -4,
              borderColor: `${card.color}70`,
              boxShadow: `0 12px 28px -6px ${card.color}25`,
              transition: { duration: 0.2, ease: "easeOut" },
            }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-xs transition-transform duration-300 group-hover:scale-105"
                style={{
                  backgroundColor: `${card.color}15`,
                  color: card.color,
                }}
              >
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* New Widgets Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-stretch">
        <motion.div
          className="h-full flex flex-col"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProductivityStreakWidget
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            accentColor={accentColor}
            className="h-full flex-1"
          />
        </motion.div>
        <motion.div
          className="h-full flex flex-col"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <TimerWidget onExpand={() => navigate("/timer")} className="h-full flex-1" />
        </motion.div>
        <motion.div
          className="h-full flex flex-col"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <HabitsWidget accentColor="#10b981" className="h-full flex-1" />
        </motion.div>
        <motion.div
          className="h-full flex flex-col"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <OkrWidget className="h-full flex-1" />
        </motion.div>
      </div>

      {/* AI Insights Widget */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <AIInsightsWidget className="w-full" />
      </motion.div>

      {/* Tasks Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6"
      >
        {/* Header with controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold">{t("Dashboard.todaysTasks", "Tareas de hoy")}</h2>

          <div className="flex items-center gap-3">
            {/* View mode toggle */}
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 transition-all duration-200 cursor-pointer",
                  viewMode === "list"
                    ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                )}
                title="Vista de lista"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 transition-all duration-200 cursor-pointer",
                  viewMode === "grid"
                    ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                )}
                title="Vista de cuadrícula"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>

            {/* Sort dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="priority">{t("Dashboard.sortOptions.priority", "Prioridad")}</option>
                <option value="duration">{t("Dashboard.sortOptions.duration", "Duración")}</option>
                <option value="created">{t("Dashboard.sortOptions.created", "Recientes")}</option>
              </select>
            </div>

            {/* Show completed toggle */}
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 border cursor-pointer",
                showCompleted
                  ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-semibold"
                  : "bg-muted border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {showCompleted ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {showCompleted ? t("Dashboard.hideCompleted", "Ocultar") : t("Dashboard.showCompleted", "Mostrar completadas")}
              </span>
              {completedCount > 0 && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-xs font-medium",
                    showCompleted
                      ? "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {completedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-2xl">
            <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">
              {!showCompleted && completedCount > 0
                ? t("Dashboard.allTasksCompleted", "Todas las tareas completadas")
                : t("Dashboard.noTasks", "Sin tareas")}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {!showCompleted && completedCount > 0
                ? t("Dashboard.tasksCompletedToday", { count: completedCount, defaultValue:`Tienes ${completedCount} tareas completadas hoy` })
                : t("Dashboard.noTasksDescription", "No tienes tareas para hoy")}
            </p>
            {!showCompleted && completedCount > 0 ? (
              <button
                onClick={() => setShowCompleted(true)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-muted hover:bg-muted/80 transition-all duration-200 cursor-pointer"
              >
                <Eye className="h-4 w-4" />
                Mostrar completadas
              </button>
            ) : (
              <button
                onClick={() => setShowCreateTaskDialog(true)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-cyan-500 text-white shadow-sm shadow-cyan-500/25 hover:bg-cyan-600 transition-all duration-200 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                {t("Dashboard.createTask", "Crear tarea")}
              </button>
            )}
          </div>
        ) : (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-2"
            )}
          >
            {sortedTasks.map((task: any, index: number) => (
              <TaskCardCompact
                key={task.id}
                task={task}
                index={index}
                viewMode={viewMode}
                showProject={true}
                showGradient={true}
                onTaskClick={(taskId) => setSelectedTaskId(taskId)}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Task Detail Panel */}
      <TaskDetailPanel
        taskId={selectedTaskId}
        open={selectedTaskId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTaskId(null);
        }}
      />

      {/* Quick Actions FAB */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <AnimatePresence>
          {showQuickActions && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-xs"
                onClick={() => setShowQuickActions(false)}
              />

              {/* Action buttons */}
              <div className="absolute bottom-16 right-0 flex flex-col gap-3 items-end">
                {/* Create Project */}
                <motion.button
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: 0 }}
                  onClick={() => {
                    setShowQuickActions(false);
                    setShowCreateProjectDialog(true);
                  }}
                  className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group cursor-pointer"
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    Nuevo Proyecto
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white bg-pink-500 shadow-sm shadow-pink-500/25">
                    <FolderPlus className="h-5 w-5" />
                  </div>
                </motion.button>

                {/* Start Timer */}
                <motion.button
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: 0.05 }}
                  onClick={() => {
                    setShowQuickActions(false);
                    navigate("/timer");
                  }}
                  className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group cursor-pointer"
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    Iniciar Timer
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white bg-amber-500 shadow-sm shadow-amber-500/25">
                    <Timer className="h-5 w-5" />
                  </div>
                </motion.button>

                {/* Create Task */}
                <motion.button
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => {
                    setShowQuickActions(false);
                    setShowCreateTaskDialog(true);
                  }}
                  className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group cursor-pointer"
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    Nueva Tarea
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white bg-cyan-500 shadow-sm shadow-cyan-500/25">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </motion.button>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowQuickActions(!showQuickActions)}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-600 transition-all duration-300 cursor-pointer",
            showQuickActions ? "rotate-45" : "rotate-0"
          )}
        >
          <Plus className="h-7 w-7" />
        </motion.button>
      </div>

      {/* Dialogs */}
      <CreateTaskDialog
        open={showCreateTaskDialog}
        onOpenChange={setShowCreateTaskDialog}
      />
      <CreateProjectDialog
        open={showCreateProjectDialog}
        onOpenChange={setShowCreateProjectDialog}
      />
      <DailyRitualDialog
        open={showDailyRitualDialog}
        onOpenChange={setShowDailyRitualDialog}
        defaultMode={dailyRitualMode}
        workspaceId={selectedWorkspaceId || undefined}
      />
    </div>
  );
}
