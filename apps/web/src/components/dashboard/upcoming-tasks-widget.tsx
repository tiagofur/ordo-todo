"use client";

import { Calendar, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFormatter } from "next-intl";

interface Task {
  id: string;
  title: string;
  dueDate: Date | string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  project?: {
    name: string;
    color: string;
  };
}

interface UpcomingTasksWidgetProps {
  tasks: Task[];
  accentColor?: string;
}

const PRIORITY_COLORS = {
  LOW: "#10b981",
  MEDIUM: "#f59e0b",
  HIGH: "#f97316",
  URGENT: "#ef4444",
};

export function UpcomingTasksWidget({ tasks, accentColor = "#06b6d4" }: UpcomingTasksWidgetProps) {
  const format = useFormatter();

  // Sort by due date (soonest first)
  const sortedTasks = [...tasks]
    .sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return dateA - dateB;
    })
    .slice(0, 5); // Show only 5 tasks

  const getDaysUntilDue = (dueDate: Date | string) => {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateLabel = (daysUntil: number) => {
    if (daysUntil < 0) return `Vencida hace ${Math.abs(daysUntil)} día${Math.abs(daysUntil) > 1 ? "s" : ""}`;
    if (daysUntil === 0) return "Vence hoy";
    if (daysUntil === 1) return "Vence mañana";
    return `En ${daysUntil} días`;
  };

  if (sortedTasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-border/50 bg-card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `${accentColor}15`,
              color: accentColor,
            }}
          >
            <Calendar className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold">Próximas Tareas</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-8">
          No hay tareas con fecha de vencimiento próxima
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-2xl border border-border/50 bg-card p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `${accentColor}15`,
            color: accentColor,
          }}
        >
          <Calendar className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold">Próximas Tareas</h3>
      </div>

      <div className="space-y-3">
        {sortedTasks.map((task, index) => {
          const daysUntil = getDaysUntilDue(task.dueDate);
          const isOverdue = daysUntil < 0;
          const isDueToday = daysUntil === 0;

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 transition-all duration-200",
                "hover:bg-accent/50 hover:border-primary/20 cursor-pointer"
              )}
            >
              {/* Priority indicator */}
              <div
                className="h-full w-1 rounded-full shrink-0"
                style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.title}</p>
                
                {task.project && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: task.project.color }}
                    />
                    <span className="text-xs text-muted-foreground truncate">
                      {task.project.name}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2">
                  {(isOverdue || isDueToday) && (
                    <AlertCircle className={cn(
                      "h-3 w-3",
                      isOverdue ? "text-destructive" : "text-amber-500"
                    )} />
                  )}
                  <span className={cn(
                    "text-xs font-medium",
                    isOverdue && "text-destructive",
                    isDueToday && "text-amber-500",
                    !isOverdue && !isDueToday && "text-muted-foreground"
                  )}>
                    {getDueDateLabel(daysUntil)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
