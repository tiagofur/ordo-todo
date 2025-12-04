"use client";

import { useState } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import {
  CheckCircle2,
  Clock,
  Home,
  TrendingUp,
  Circle,
  AlertCircle,
  Flame,
  Calendar,
  ArrowUpDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslations, useFormatter } from "next-intl";
import { useTimerStats, useDailyMetrics } from "@/lib/api-hooks";
import { useTasks } from "@/lib/api-hooks";
import { TaskDetailPanel } from "@/components/task/task-detail-panel";

type SortOption = "priority" | "duration" | "created";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const format = useFormatter();
  const accentColor = "#06b6d4"; // Cyan

  // UI State
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [showCompleted, setShowCompleted] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

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

  // Fetch today's daily metrics (tasksCompleted, tasksCreated, etc.)
  // API returns array of DailyMetrics, we take the first one for today
  const { data: dailyMetricsArray } = useDailyMetrics({
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  });
  const dailyMetrics = dailyMetricsArray?.[0];

  // Fetch all tasks (we'll filter for today's tasks to display)
  const { data: allTasks = [] } = useTasks();

  // Filter tasks for today view:
  // 1. Tasks with dueDate = today
  // 2. Tasks completed today (completedAt = today) OR status is COMPLETED with today's updatedAt
  // 3. Pending tasks (TODO or IN_PROGRESS) without dueDate or with past dueDate
  const todaysTasks = allTasks.filter((task: any) => {
    // Check if task has dueDate = today
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      if (dueDate.toDateString() === today.toDateString()) {
        return true;
      }
    }

    // Check if task was completed today (via completedAt or updatedAt for COMPLETED status)
    if (task.status === "COMPLETED") {
      // Check completedAt field
      if (task.completedAt) {
        const completedDate = new Date(task.completedAt);
        if (completedDate.toDateString() === today.toDateString()) {
          return true;
        }
      }
      // Fallback: check updatedAt for recently completed tasks
      if (task.updatedAt) {
        const updatedDate = new Date(task.updatedAt);
        if (updatedDate.toDateString() === today.toDateString()) {
          return true;
        }
      }
    }

    // Include pending tasks (TODO or IN_PROGRESS) that are overdue or have no dueDate
    if (task.status === "TODO" || task.status === "IN_PROGRESS") {
      if (!task.dueDate) {
        return true; // No dueDate = show in today
      }
      const dueDate = new Date(task.dueDate);
      if (dueDate < startOfDay) {
        return true; // Overdue tasks
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
        // Shorter tasks first (null = no estimate, goes last)
        const aDuration = a.estimatedTime ?? Infinity;
        const bDuration = b.estimatedTime ?? Infinity;
        return aDuration - bDuration;
      }
      case "created": {
        // Newest first
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

  // Priority colors and icons (matching the app's priority selector)
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return {
          color: "#ef4444", // Red
          bgColor: "#ef444420",
          icon: Flame,
          label: "Urgente",
        };
      case "HIGH":
        return {
          color: "#f97316", // Orange
          bgColor: "#f9731620",
          icon: AlertCircle,
          label: "Alta",
        };
      case "MEDIUM":
        return {
          color: "#3b82f6", // Blue (matching the dropdown)
          bgColor: "#3b82f620",
          icon: Circle,
          label: "Media",
        };
      case "LOW":
        return {
          color: "#3b82f6", // Blue (matching the dropdown)
          bgColor: "#3b82f620",
          icon: Circle,
          label: "Baja",
        };
      default:
        return {
          color: "#6b7280",
          bgColor: "#6b728020",
          icon: Circle,
          label: "Normal",
        };
    }
  };

  // Use metrics from backend for completed count (accurate tracking)
  const completedToday = dailyMetrics?.tasksCompleted ?? 0;

  // Format time worked
  const hoursWorked = stats ? Math.floor(stats.totalMinutesWorked / 60) : 0;
  const minutesWorked = stats ? stats.totalMinutesWorked % 60 : 0;
  const timeWorkedText =
    hoursWorked > 0
      ? `${hoursWorked}h ${minutesWorked}m`
      : minutesWorked > 0
        ? `${minutesWorked}m`
        : "0m";

  // Calculate productivity (completion rate as percentage)
  const productivity =
    stats && stats.totalSessions > 0
      ? `${Math.round(stats.completionRate * 100)}%`
      : "--";

  const statCards = [
    {
      title: t("completed"),
      value: completedToday.toString(),
      icon: CheckCircle2,
      color: accentColor,
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
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                }}
              >
                <Home className="h-6 w-6" />
              </div>
              {t("today")}
            </h1>
            <p className="text-muted-foreground mt-2">
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
        <div className="grid gap-6 md:grid-cols-3">
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
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                  }}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:scale-105"
                >
                  {t("createTask")}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTasks.map((task: any, index: number) => {
                const isCompleted = task.status === "COMPLETED";
                const priorityConfig = getPriorityConfig(task.priority);
                const PriorityIcon = priorityConfig.icon;

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={cn(
                      "group/task relative flex items-center gap-4 rounded-xl border p-4 transition-all duration-300 cursor-pointer",
                      isCompleted
                        ? "border-border/30 bg-muted/30 opacity-60 hover:opacity-80"
                        : "border-border/50 bg-background hover:border-border hover:shadow-md hover:shadow-black/5"
                    )}
                    style={{
                      borderLeftWidth: isCompleted ? "2px" : "4px",
                      borderLeftColor: isCompleted
                        ? "#6b7280"
                        : priorityConfig.color,
                    }}
                  >
                    {/* Checkbox */}
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                        isCompleted
                          ? "border-green-500 bg-green-500"
                          : "border-muted-foreground/40 group-hover/task:border-muted-foreground/60"
                      )}
                    >
                      {isCompleted && (
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      )}
                    </div>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={cn(
                            "font-medium truncate",
                            isCompleted
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          )}
                        >
                          {task.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {task.project && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor:
                                  task.project.color || accentColor,
                              }}
                            />
                            {task.project.name}
                          </span>
                        )}
                        {task.dueDate && !isCompleted && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Priority Badge */}
                    {!isCompleted && (
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0"
                        style={{
                          backgroundColor: priorityConfig.bgColor,
                          color: priorityConfig.color,
                        }}
                      >
                        <PriorityIcon className="h-3 w-3" />
                        <span className="hidden sm:inline">
                          {priorityConfig.label}
                        </span>
                      </div>
                    )}

                    {/* Completed Badge */}
                    {isCompleted && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                        <span className="hidden sm:inline">Completada</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
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
    </AppLayout>
  );
}
