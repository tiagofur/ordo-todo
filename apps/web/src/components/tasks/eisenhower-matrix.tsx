"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Flame,
  Clock,
  Trash2,
  GripVertical,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { Card, Checkbox, Badge } from "@ordo-todo/ui";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

interface Task {
  id: string;
  title: string;
  priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW";
  dueDate?: string | Date | null;
  isUrgent?: boolean;
  isImportant?: boolean;
  completed: boolean;
  project?: { id: string; name: string; color: string } | null;
}

interface EisenhowerMatrixProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskComplete?: (taskId: string, completed: boolean) => void;
  onTaskMove?: (taskId: string, quadrant: "DO" | "SCHEDULE" | "DELEGATE" | "DELETE") => void;
}

// Determine quadrant based on task properties
function getTaskQuadrant(task: Task): "DO" | "SCHEDULE" | "DELEGATE" | "DELETE" {
  const isUrgent = task.isUrgent ?? (task.priority === "URGENT" || task.priority === "HIGH" || isTaskDueSoon(task));
  const isImportant = task.isImportant ?? (task.priority === "URGENT" || task.priority === "HIGH" || task.priority === "MEDIUM");

  if (isUrgent && isImportant) return "DO";
  if (!isUrgent && isImportant) return "SCHEDULE";
  if (isUrgent && !isImportant) return "DELEGATE";
  return "DELETE";
}

function isTaskDueSoon(task: Task): boolean {
  if (!task.dueDate) return false;
  const dueDate = new Date(task.dueDate);
  const now = new Date();
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 2 && diffDays >= 0;
}

export function EisenhowerMatrix({ 
  tasks, 
  onTaskClick, 
  onTaskComplete,
  onTaskMove 
}: EisenhowerMatrixProps) {
  const t = useTranslations("Tasks.eisenhower");
  const locale = useLocale();
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverQuadrant, setDragOverQuadrant] = useState<string | null>(null);

  const formatDate = (dateValue: string | Date) => {
    try {
      const date = new Date(dateValue);
      return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(date);
    } catch {
      return "";
    }
  };

  const quadrants = [
    {
      id: "DO" as const,
      title: t("quadrants.do.title"),
      subtitle: t("quadrants.do.subtitle"),
      icon: Flame,
      color: "text-red-500",
      badgeBg: "bg-red-500/10 text-red-500",
      cardBg: "bg-red-500/[0.03] dark:bg-red-500/[0.05]",
      borderColor: "border-red-500/20 dark:border-red-500/30",
    },
    {
      id: "SCHEDULE" as const,
      title: t("quadrants.schedule.title"),
      subtitle: t("quadrants.schedule.subtitle"),
      icon: Calendar,
      color: "text-blue-500",
      badgeBg: "bg-blue-500/10 text-blue-500",
      cardBg: "bg-blue-500/[0.03] dark:bg-blue-500/[0.05]",
      borderColor: "border-blue-500/20 dark:border-blue-500/30",
    },
    {
      id: "DELEGATE" as const,
      title: t("quadrants.delegate.title"),
      subtitle: t("quadrants.delegate.subtitle"),
      icon: Clock,
      color: "text-amber-500",
      badgeBg: "bg-amber-500/10 text-amber-500",
      cardBg: "bg-amber-500/[0.03] dark:bg-amber-500/[0.05]",
      borderColor: "border-amber-500/20 dark:border-amber-500/30",
    },
    {
      id: "DELETE" as const,
      title: t("quadrants.delete.title"),
      subtitle: t("quadrants.delete.subtitle"),
      icon: Trash2,
      color: "text-muted-foreground",
      badgeBg: "bg-muted text-muted-foreground",
      cardBg: "bg-muted/20",
      borderColor: "border-border",
    },
  ];

  // Group tasks by quadrant
  const tasksByQuadrant = useMemo(() => {
    const grouped: Record<string, Task[]> = {
      DO: [],
      SCHEDULE: [],
      DELEGATE: [],
      DELETE: [],
    };

    tasks.filter(t => !t.completed).forEach((task) => {
      const quadrant = getTaskQuadrant(task);
      grouped[quadrant].push(task);
    });

    return grouped;
  }, [tasks]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, quadrantId: string) => {
    e.preventDefault();
    setDragOverQuadrant(quadrantId);
  };

  const handleDragLeave = () => {
    setDragOverQuadrant(null);
  };

  const handleDrop = (e: React.DragEvent, quadrantId: "DO" | "SCHEDULE" | "DELEGATE" | "DELETE") => {
    e.preventDefault();
    if (draggedTask && onTaskMove) {
      onTaskMove(draggedTask, quadrantId);
    }
    setDraggedTask(null);
    setDragOverQuadrant(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
            <Target className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold">{t("title")}</h2>
        </div>
        <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            {t("urgentCount", { count: tasksByQuadrant.DO.length })}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {t("importantCount", { count: tasksByQuadrant.SCHEDULE.length })}
          </span>
        </div>
      </div>

      {/* Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrants.map((quadrant) => {
          const Icon = quadrant.icon;
          return (
            <Card
              key={quadrant.id}
              className={cn(
                "rounded-2xl border p-4 min-h-[220px] transition-all duration-200",
                quadrant.cardBg,
                quadrant.borderColor,
                dragOverQuadrant === quadrant.id && "ring-2 ring-purple-500/50 scale-[1.01] shadow-md"
              )}
              onDragOver={(e) => handleDragOver(e, quadrant.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, quadrant.id)}
              aria-label={quadrant.title}
            >
              {/* Quadrant Header */}
              <div className="flex items-center gap-2.5 mb-3 pb-2.5 border-b border-border/60">
                <div className={cn("p-2 rounded-xl", quadrant.badgeBg)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className={cn("font-semibold text-sm", quadrant.color)}>
                    {quadrant.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{quadrant.subtitle}</p>
                </div>
                <Badge variant="secondary" className="ml-auto font-medium text-xs rounded-full px-2.5">
                  {tasksByQuadrant[quadrant.id].length}
                </Badge>
              </div>

              {/* Tasks */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                <AnimatePresence>
                  {tasksByQuadrant[quadrant.id].map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      draggable
                      onDragStart={(e) => handleDragStart(e as any, task.id)}
                      className={cn(
                        "group flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border cursor-grab active:cursor-grabbing",
                        "hover:shadow-sm hover:border-border/80 transition-all",
                        draggedTask === task.id && "opacity-50"
                      )}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground/60 group-hover:text-muted-foreground mt-0.5 flex-shrink-0" />
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={(checked) => 
                          onTaskComplete?.(task.id, checked as boolean)
                        }
                        className="mt-0.5"
                      />
                      <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => onTaskClick?.(task)}
                      >
                        <p className="text-sm font-medium truncate text-foreground">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {task.project && (
                            <span 
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ 
                                backgroundColor: `${task.project.color}15`,
                                color: task.project.color 
                              }}
                            >
                              {task.project.name}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className={cn(
                              "text-xs flex items-center gap-1",
                              isTaskDueSoon(task) ? "text-red-500 font-medium" : "text-muted-foreground"
                            )}>
                              {isTaskDueSoon(task) && <AlertTriangle className="h-3 w-3" />}
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {tasksByQuadrant[quadrant.id].length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-border/80 rounded-xl bg-card/50">
                    <p className="text-sm font-medium text-muted-foreground">{t("empty")}</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">{t("dragHere")}</p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-500/20" />
          <span>{t("legend.do")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/20" />
          <span>{t("legend.schedule")}</span>
        </div>
      </div>
    </div>
  );
}
