"use client";

import { useState } from "react";
import { CheckSquare, MoreVertical, Trash2, Flag, Calendar, Edit } from "lucide-react";
import { useCompleteTask, useTaskTags } from "@/lib/api-hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TaskDetailPanel } from "./task-detail-panel";
import { Badge } from "@/components/ui/badge";

interface TaskCardProps {
  task: {
    id?: string | number;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    dueDate?: Date | string | null;
    tags?: any[];
  };
  index?: number;
}

const priorityConfig = {
  LOW: { label: "Baja", color: "text-gray-500" },
  MEDIUM: { label: "Media", color: "text-blue-500" },
  HIGH: { label: "Alta", color: "text-orange-500" },
  URGENT: { label: "Urgente", color: "text-red-500" },
};

export function TaskCard({ task, index = 0 }: TaskCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const isCompleted = task.status === "COMPLETED";
  const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;
  
  const accentColor = "#8b5cf6"; // Purple

  const formatDueDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "d MMM", { locale: es });
  };
  
  const isOverdue = !isCompleted && task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        whileHover={{ y: -5, scale: 1.02 }}
        onClick={() => setShowDetail(true)}
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 cursor-pointer",
          "hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20",
          isCompleted && "opacity-60 grayscale"
        )}
        style={{
          borderLeftWidth: "4px",
          borderLeftColor: accentColor,
        }}
      >
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{
                  backgroundColor: `${accentColor}15`,
                  color: accentColor,
                }}
              >
                <CheckSquare className="h-7 w-7" />
              </div>
              <h3 className={cn("font-bold text-xl leading-tight truncate max-w-[180px]", isCompleted && "line-through")}>
                {task.title}
              </h3>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button
                  className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                    "rounded-full p-2 hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                 <DropdownMenuItem onClick={(e) => {e.stopPropagation(); setShowDetail(true);}}>
                  <Edit className="mr-2 h-4 w-4" />
                  Ver/Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* Add delete handler */ }} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {task.tags.map((tag: any) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-5 border-0 font-medium"
                  style={{
                    backgroundColor: tag.color + '20',
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-grow">
              {task.description}
            </p>
          )}

          <div className="mt-auto pt-4 border-t border-dashed border-border/50">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className={cn("flex items-center gap-1.5", priority.color)}>
                  <Flag className="h-3.5 w-3.5" />
                  <span>{priority.label}</span>
                </div>
                {task.dueDate && (
                   <div className={cn("flex items-center gap-1.5", isOverdue ? "text-red-500" : "")}>
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDueDate(task.dueDate)}</span>
                  </div>
                )}
              </div>
              {isCompleted && (
                 <div className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                    Completada
                 </div>
              )}
            </div>
          </div>
        </div>

        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />
      </motion.div>

      <TaskDetailPanel 
        taskId={task.id ? String(task.id) : null} 
        open={showDetail} 
        onOpenChange={setShowDetail} 
      />
    </>
  );
}
