"use client";

import { useState } from "react";
import { CheckSquare, Flag, Calendar, MoreVertical, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { cn } from "../../utils/index.js";
import { Badge } from "../ui/badge.js";
import { TaskDetailPanel } from "../task/task-detail-panel.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu.js";

interface KanbanTaskCardProps {
  task: {
    id?: string | number;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    dueDate?: Date | string | null;
    tags?: any[];
    project?: { id: string; name: string; color: string };
  };
  index?: number;
  /** Callback when task card is clicked */
  onTaskClick?: (taskId: string) => void;
  /** Callback when edit is clicked */
  onEditClick?: (taskId: string) => void;
  /** Callback when delete is clicked */
  onDeleteClick?: (taskId: string) => void;
  /** Labels for i18n */
  labels?: {
    priorityLow?: string;
    priorityMedium?: string;
    priorityHigh?: string;
    priorityUrgent?: string;
    viewEdit?: string;
    delete?: string;
  };
}

export function KanbanTaskCard({
  task,
  index = 0,
  onTaskClick,
  onEditClick,
  onDeleteClick,
  labels = {}
}: KanbanTaskCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const isCompleted = task.status === "COMPLETED";

  const priorityConfig = {
    LOW: { label: labels.priorityLow ?? 'Low', color: "text-gray-500", bg: "bg-gray-500/10" },
    MEDIUM: { label: labels.priorityMedium ?? 'Medium', color: "text-blue-500", bg: "bg-blue-500/10" },
    HIGH: { label: labels.priorityHigh ?? 'High', color: "text-orange-500", bg: "bg-orange-500/10" },
    URGENT: { label: labels.priorityUrgent ?? 'Urgent', color: "text-red-500", bg: "bg-red-500/10" },
  };

  const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;
  const accentColor = task.project?.color || "#8b5cf6";

  const formatDueDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "d MMM", { locale: es });
  };

  const isOverdue = !isCompleted && task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <>
      <motion.div
        layoutId={`task-${task.id}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -2, scale: 1.01 }}
        onClick={() => {
          if (onTaskClick) onTaskClick(String(task.id));
          setShowDetail(true);
        }}
        className={cn(
          "group relative flex flex-col gap-3 rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-all cursor-pointer",
          "hover:shadow-md hover:border-primary/20",
          isCompleted && "opacity-60"
        )}
        style={{
          borderLeftWidth: "3px",
          borderLeftColor: accentColor,
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn("font-medium text-sm leading-tight line-clamp-2", isCompleted && "line-through text-muted-foreground")}>
            {task.title}
          </h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded-md -mr-1 -mt-1">
                <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                if (onEditClick) onEditClick(String(task.id));
                setShowDetail(true);
              }}>
                <Edit className="mr-2 h-3.5 w-3.5" />
                {labels.viewEdit ?? 'View/Edit'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDeleteClick) onDeleteClick(String(task.id));
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                {labels.delete ?? 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag: any) => (
              <div
                key={tag.id}
                className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: tag.color + '15',
                  color: tag.color,
                }}
              >
                {tag.name}
              </div>
            ))}
            {task.tags.length > 3 && (
              <div className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                +{task.tags.length - 3}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-1 pt-2 border-t border-border/30">
          <div className={cn("flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-medium", priority.bg, priority.color)}>
            <Flag className="h-3 w-3" />
            {priority.label}
          </div>
          
          {task.dueDate && (
            <div className={cn("flex items-center gap-1 text-[10px]", isOverdue ? "text-red-500 font-medium" : "text-muted-foreground")}>
              <Calendar className="h-3 w-3" />
              {formatDueDate(task.dueDate)}
            </div>
          )}
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
