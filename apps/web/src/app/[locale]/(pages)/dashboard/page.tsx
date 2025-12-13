"use client";

import { useState } from "react";
import { AppLayout } from "@/components/shared/app-layout";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslations, useFormatter } from "next-intl";
import { useTimerStats, useDailyMetrics } from "@/lib/api-hooks";
import { useTasks } from "@/lib/api-hooks";
import { TaskCardCompact } from "@/components/task/task-card-compact";
import { TaskDetailPanel } from "@/components/task/task-detail-panel";
import { DashboardTimerWidget } from "@/components/dashboard/dashboard-timer-widget";
import { ProductivityStreakWidget } from "@/components/dashboard/productivity-streak-widget";
import { HabitsWidget } from "@/components/dashboard/habits-widget";
import { OkrWidget } from "@/components/dashboard/okr-widget";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { useRouter } from "next/navigation";

type SortOption = "priority" | "duration" | "created";
type ViewMode = "list" | "grid";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const format = useFormatter();
  const router = useRouter();
  const accentColor = "#06b6d4"; // Cyan

  // UI State
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [showCompleted, setShowCompleted] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Quick Actions State
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);


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

  // Filter tasks for today view
  const todaysTasks = allTasks.filter((task: any) => {
    // Check if task has dueDate = today
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      if (dueDate.toDateString() === today.toDateString()) {
        return true;
      }
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
      const dueDate = new Date(task.dueDate);
      if (dueDate < startOfDay) {
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
        const aDuration = a.estimatedTime ?? Infinity;
        const bDuration = b.estimatedTime ?? Infinity;
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
  const hoursWorked = stats ? Math.floor(stats.totalMinutesWorked / 60) : 0;
  const minutesWorked = stats ? stats.totalMinutesWorked % 60 : 0;
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

  // Calculate streak (simplified - would need backend support for accurate tracking)
  const currentStreak = completedToday > 0 ? 1 : 0; // Placeholder
  const longestStreak = 1; // Placeholder

  const statCards = [
    {
      title: t("completed"),
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
      title: t("timeWorked"),
      value: timeWorkedText,
      icon: Clock,
      color: "#f59e0b", // Amber
    },
    {
      title: t("productivity"),
      value: productivity,
      icon: TrendingUp,
      color: "#10b981", // Emerald
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 sm:gap-3">
              <div
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl text-white shadow-lg"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                }}
              >
                <Home className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              {t("today")}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              {format.dateTime(new Date(), {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300",
                "hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20"
              )}
              style={{
                borderLeftWidth: "4px",
                borderLeftColor: card.color,
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <ProductivityStreakWidget
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            accentColor={accentColor}
          />
          <DashboardTimerWidget
            accentColor={accentColor}
          />
          <HabitsWidget />
          <OkrWidget />
        </div>

        {/* Tasks Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300"
        >
          {/* Header with controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold">{t("todaysTasks")}</h2>

            <div className="flex items-center gap-3">
              {/* View mode toggle */}
              <div className="flex items-center border border-border/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-1.5 transition-all duration-200",
                    viewMode === "list"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50"
                  )}
                  title="Vista de lista"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-1.5 transition-all duration-200",
                    viewMode === "grid"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50"
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
                  className="bg-background border border-border/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="priority">Prioridad</option>
                  <option value="duration">Duración</option>
                  <option value="created">Recientes</option>
                </select>
              </div>

              {/* Show completed toggle */}
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 border",
                  showCompleted
                    ? "bg-primary/10 border-primary/20 text-primary"
                    : "bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {showCompleted ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {showCompleted ? "Ocultar" : "Mostrar"} completadas
                </span>
                {completedCount > 0 && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-xs font-medium",
                      showCompleted
                        ? "bg-primary/20 text-primary"
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
              <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-medium">
                {!showCompleted && completedCount > 0
                  ? "Todas las tareas completadas"
                  : t("noTasks")}
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {!showCompleted && completedCount > 0
                  ? `Tienes ${completedCount} tarea${completedCount > 1 ? "s" : ""} completada${completedCount > 1 ? "s" : ""} hoy`
                  : t("noTasksDescription")}
              </p>
              {!showCompleted && completedCount > 0 ? (
                <button
                  onClick={() => setShowCompleted(true)}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-muted hover:bg-muted/80 transition-all duration-200"
                >
                  <Eye className="h-4 w-4" />
                  Mostrar completadas
                </button>
              ) : (
                <button
                  onClick={() => setShowCreateTaskDialog(true)}
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                  }}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  {t("createTask")}
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
      </div>

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
                className="fixed inset-0 bg-black/20 backdrop-blur-sm"
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
                  className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    Nuevo Proyecto
                  </span>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: "#8b5cf6" }}
                  >
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
                    router.push("/timer");
                  }}
                  className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    Iniciar Timer
                  </span>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: "#f59e0b" }}
                  >
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
                  className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    Nueva Tarea
                  </span>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </motion.button>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowQuickActions(!showQuickActions)}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-all duration-300",
            showQuickActions ? "rotate-45" : "rotate-0"
          )}
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 10px 25px -5px ${accentColor}60, 0 8px 10px -6px ${accentColor}40`,
          }}
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
    </AppLayout>
  );
}
