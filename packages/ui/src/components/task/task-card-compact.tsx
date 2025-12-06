"use client";

import { useState } from "react";
import {
  CheckCircle2,
  MoreVertical,
  Trash2,
  Flag,
  Calendar,
  Edit,
  Circle,
  AlertCircle,
  Flame,
  Clock,
  PlayCircle,
  PauseCircle,
  ListTodo,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "../ui/dropdown-menu.js";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { cn } from "../../utils/index.js";
import { TaskDetailPanel } from "./task-detail-panel.js";
import { Badge } from "../ui/badge.js";
import { useTranslations } from "next-intl";
import { useUpdateTask } from "@/lib/api-hooks";

type ViewMode = "list" | "grid";

interface TaskCardCompactProps {
  task: {
    id?: string | number;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    dueDate?: Date | string | null;
    estimatedTime?: number | null;
    tags?: any[];
    project?: { id: string; name: string; color: string };
  };
  index?: number;
  viewMode?: ViewMode;
  showProject?: boolean;
  showGradient?: boolean;
  onTaskClick?: (taskId: string) => void;
}

export function TaskCardCompact({
  task,
  index = 0,
  viewMode = "list",
  showProject = false,
  showGradient = false,
  onTaskClick,
}: TaskCardCompactProps) {
  const t = useTranslations("TaskCard");
  const [showDetail, setShowDetail] = useState(false);
  const updateTask = useUpdateTask();
  const isCompleted = task.status === "COMPLETED";

  // Status configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "TODO":
        return {
          color: "#6b7280",
          bgColor: "#6b728015",
          icon: ListTodo,
          label: "Por hacer",
        };
      case "IN_PROGRESS":
        return {
          color: "#3b82f6",
          bgColor: "#3b82f615",
          icon: PlayCircle,
          label: "En progreso",
        };
      case "COMPLETED":
        return {
          color: "#22c55e",
          bgColor: "#22c55e15",
          icon: CheckCircle2,
          label: "Completada",
        };
      case "ON_HOLD":
        return {
          color: "#f59e0b",
          bgColor: "#f59e0b15",
          icon: PauseCircle,
          label: "En pausa",
        };
      default:
        return {
          color: "#6b7280",
          bgColor: "#6b728015",
          icon: Circle,
          label: status,
        };
    }
  };

  // Priority configuration with icons
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return {
          color: "#ef4444",
          bgColor: "#ef444420",
          icon: Flame,
          label: "Urgente",
        };
      case "HIGH":
        return {
          color: "#f97316",
          bgColor: "#f9731620",
          icon: AlertCircle,
          label: "Alta",
        };
      case "MEDIUM":
        return {
          color: "#3b82f6",
          bgColor: "#3b82f620",
          icon: Circle,
          label: "Media",
        };
      case "LOW":
        return {
          color: "#3b82f6",
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

  const priorityConfig = getPriorityConfig(task.priority);
  const PriorityIcon = priorityConfig.icon;
  const statusConfig = getStatusConfig(task.status);
  const StatusIcon = statusConfig.icon;
  const accentColor = task.project?.color || priorityConfig.color;

  const handleStatusChange = (newStatus: string) => {
    if (task.id) {
      updateTask.mutate({
        taskId: String(task.id),
        data: { status: newStatus as any },
      });
    }
  };

  const formatDueDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "d MMM", { locale: es });
  };

  const isOverdue =
    !isCompleted && task.dueDate && new Date(task.dueDate) < new Date();

  const handleClick = () => {
    if (onTaskClick && task.id) {
      onTaskClick(String(task.id));
    } else {
      setShowDetail(true);
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // List View - Diseño mejorado más legible
  if (viewMode === "list") {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: index * 0.02 }}
          onClick={handleClick}
          className={cn(
            "group relative flex items-center rounded-xl border px-4 py-4 transition-all duration-200 cursor-pointer",
            isCompleted
              ? "border-border/30 bg-muted/20 opacity-70 hover:opacity-90"
              : "border-border/40 bg-card hover:border-border/60 hover:bg-accent/5 hover:shadow-md"
          )}
          style={{
            borderLeftWidth: "4px",
            borderLeftColor: isCompleted ? "#22c55e" : accentColor,
          }}
        >
          {/* Left Section: Title & Meta */}
          <div className="flex-1 min-w-0 pr-4">
            {/* Title */}
            <p
              className={cn(
                "font-semibold text-[17px] mb-1.5",
                isCompleted
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              )}
            >
              {task.title}
            </p>

            {/* Meta info row */}
            <div className="flex items-center gap-3 flex-wrap">
              {showProject && task.project && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: task.project.color }}
                  />
                  <span className="truncate max-w-[150px]">
                    {task.project.name}
                  </span>
                </span>
              )}
              {task.dueDate && (
                <span
                  className={cn(
                    "flex items-center gap-1.5 text-sm",
                    isOverdue
                      ? "text-red-500 font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  <Calendar className="h-4 w-4" />
                  {formatDueDate(task.dueDate)}
                </span>
              )}
              {task.estimatedTime && !isCompleted && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {task.estimatedTime}m
                </span>
              )}
              {/* Tags */}
              {task.tags && task.tags.length > 0 && !isCompleted && (
                <div className="flex items-center gap-1.5">
                  {task.tags.slice(0, 2).map((tag: any) => (
                    <span
                      key={tag.id}
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: tag.color + "20",
                        color: tag.color,
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                  {task.tags.length > 2 && (
                    <span className="text-sm text-muted-foreground">
                      +{task.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Section: Status, Priority & Menu */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Status Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={handleMenuClick}>
                <button
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:ring-2 hover:ring-offset-1 hover:ring-offset-background",
                    isCompleted && "opacity-80"
                  )}
                  style={{
                    backgroundColor: statusConfig.bgColor,
                    color: statusConfig.color,
                  }}
                >
                  <StatusIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{statusConfig.label}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Cambiar estado
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[
                  {
                    value: "TODO",
                    label: "Por hacer",
                    icon: ListTodo,
                    color: "#6b7280",
                  },
                  {
                    value: "IN_PROGRESS",
                    label: "En progreso",
                    icon: PlayCircle,
                    color: "#3b82f6",
                  },
                  {
                    value: "COMPLETED",
                    label: "Completada",
                    icon: CheckCircle2,
                    color: "#22c55e",
                  },
                  {
                    value: "ON_HOLD",
                    label: "En pausa",
                    icon: PauseCircle,
                    color: "#f59e0b",
                  },
                ].map((status) => {
                  const Icon = status.icon;
                  return (
                    <DropdownMenuItem
                      key={status.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(status.value);
                      }}
                      className={cn(
                        "gap-2",
                        task.status === status.value && "bg-accent"
                      )}
                    >
                      <Icon
                        className="h-4 w-4"
                        style={{ color: status.color }}
                      />
                      <span>{status.label}</span>
                      {task.status === status.value && (
                        <CheckCircle2 className="h-3 w-3 ml-auto text-primary" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Priority Badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium shrink-0"
              style={{
                backgroundColor: priorityConfig.bgColor,
                color: priorityConfig.color,
              }}
              title={priorityConfig.label}
            >
              <PriorityIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{priorityConfig.label}</span>
            </div>

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={handleMenuClick}>
                <button
                  className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
                    "rounded-lg p-2 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                  )}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetail(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Ver detalles
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => e.stopPropagation()}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        <TaskDetailPanel
          taskId={task.id ? String(task.id) : null}
          open={showDetail}
          onOpenChange={setShowDetail}
        />
      </>
    );
  }

  // Grid View
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.03 }}
        onClick={handleClick}
        className={cn(
          "group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 cursor-pointer h-full flex flex-col",
          "hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20",
          isCompleted
            ? "border-border/30 bg-muted/30 opacity-60 hover:opacity-80"
            : "border-border/50 bg-card hover:border-border"
        )}
        style={{
          borderTopWidth: "3px",
          borderTopColor: isCompleted ? "#22c55e" : accentColor,
        }}
      >
        {/* Gradient blur effect */}
        {showGradient && !isCompleted && (
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ backgroundColor: accentColor }}
          />
        )}

        {/* Header: Menu only */}
        <div className="relative z-10 flex items-center justify-end mb-3">
          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={handleMenuClick}>
              <button
                className={cn(
                  "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                  "rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetail(true);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => e.stopPropagation()}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        <h3
          className={cn(
            "relative z-10 font-semibold text-base leading-tight mb-2 line-clamp-2",
            isCompleted && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </h3>

        {/* Description - only in grid */}
        {task.description && !isCompleted && (
          <p className="relative z-10 text-sm text-muted-foreground line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && !isCompleted && (
          <div className="relative z-10 flex flex-wrap gap-1.5 mb-3">
            {task.tags.slice(0, 2).map((tag: any) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-xs px-2 py-0.5 border-0 font-medium"
                style={{
                  backgroundColor: tag.color + "20",
                  color: tag.color,
                }}
              >
                {tag.name}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="relative z-10 mt-auto pt-3 border-t border-dashed border-border/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              {showProject && task.project && (
                <span className="flex items-center gap-1.5 truncate max-w-24">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: task.project.color }}
                  />
                  <span className="truncate">{task.project.name}</span>
                </span>
              )}
              {task.dueDate && (
                <span
                  className={cn(
                    "flex items-center gap-1",
                    isOverdue ? "text-red-500 font-medium" : ""
                  )}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDueDate(task.dueDate)}
                </span>
              )}
            </div>

            {/* Status & Priority */}
            <div className="flex items-center gap-2">
              {/* Status Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={handleMenuClick}>
                  <button
                    className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium transition-all duration-200",
                      "hover:ring-1 hover:ring-offset-1 hover:ring-offset-background"
                    )}
                    style={{
                      backgroundColor: statusConfig.bgColor,
                      color: statusConfig.color,
                    }}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    <span>{statusConfig.label}</span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Cambiar estado
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {[
                    {
                      value: "TODO",
                      label: "Por hacer",
                      icon: ListTodo,
                      color: "#6b7280",
                    },
                    {
                      value: "IN_PROGRESS",
                      label: "En progreso",
                      icon: PlayCircle,
                      color: "#3b82f6",
                    },
                    {
                      value: "COMPLETED",
                      label: "Completada",
                      icon: CheckCircle2,
                      color: "#22c55e",
                    },
                    {
                      value: "ON_HOLD",
                      label: "En pausa",
                      icon: PauseCircle,
                      color: "#f59e0b",
                    },
                  ].map((status) => {
                    const Icon = status.icon;
                    return (
                      <DropdownMenuItem
                        key={status.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(status.value);
                        }}
                        className={cn(
                          "gap-2",
                          task.status === status.value && "bg-accent"
                        )}
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: status.color }}
                        />
                        <span>{status.label}</span>
                        {task.status === status.value && (
                          <CheckCircle2 className="h-3 w-3 ml-auto text-primary" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Priority Badge */}
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: priorityConfig.bgColor,
                  color: priorityConfig.color,
                }}
              >
                <PriorityIcon className="h-3.5 w-3.5" />
                <span>{priorityConfig.label}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <TaskDetailPanel
        taskId={task.id ? String(task.id) : null}
        open={showDetail}
        onOpenChange={setShowDetail}
      />
    </>
  );
}
