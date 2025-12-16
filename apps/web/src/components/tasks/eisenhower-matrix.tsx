"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Flame,
  Clock,
  Trash2,
  CheckCircle2,
  GripVertical,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { Card, Checkbox, Badge } from "@ordo-todo/ui";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

interface Quadrant {
  id: "DO" | "SCHEDULE" | "DELEGATE" | "DELETE";
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

const quadrants: Quadrant[] = [
  {
    id: "DO",
    title: "Hacer Primero",
    subtitle: "Urgente e Importante",
    icon: <Flame className="h-5 w-5" />,
    color: "text-red-500",
    bgColor: "bg-red-500/5",
    borderColor: "border-red-500/30",
  },
  {
    id: "SCHEDULE",
    title: "Programar",
    subtitle: "Importante, No Urgente",
    icon: <Calendar className="h-5 w-5" />,
    color: "text-blue-500",
    bgColor: "bg-blue-500/5",
    borderColor: "border-blue-500/30",
  },
  {
    id: "DELEGATE",
    title: "Delegar",
    subtitle: "Urgente, No Importante",
    icon: <Clock className="h-5 w-5" />,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/5",
    borderColor: "border-yellow-500/30",
  },
  {
    id: "DELETE",
    title: "Eliminar",
    subtitle: "Ni Urgente Ni Importante",
    icon: <Trash2 className="h-5 w-5" />,
    color: "text-gray-400",
    bgColor: "bg-gray-500/5",
    borderColor: "border-gray-500/30",
  },
];

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
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverQuadrant, setDragOverQuadrant] = useState<string | null>(null);

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Matriz de Eisenhower</h2>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            {tasksByQuadrant.DO.length} urgentes
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            {tasksByQuadrant.SCHEDULE.length} importantes
          </span>
        </div>
      </div>

      {/* Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrants.map((quadrant) => (
          <Card
            key={quadrant.id}
            className={cn(
              "p-4 min-h-[200px] transition-all duration-200",
              quadrant.bgColor,
              quadrant.borderColor,
              dragOverQuadrant === quadrant.id && "ring-2 ring-primary scale-[1.02]"
            )}
            onDragOver={(e) => handleDragOver(e, quadrant.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, quadrant.id)}
          >
            {/* Quadrant Header */}
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
              <div className={cn("p-1.5 rounded-lg", quadrant.bgColor, quadrant.color)}>
                {quadrant.icon}
              </div>
              <div>
                <h3 className={cn("font-semibold text-sm", quadrant.color)}>
                  {quadrant.title}
                </h3>
                <p className="text-xs text-muted-foreground">{quadrant.subtitle}</p>
              </div>
              <Badge variant="secondary" className="ml-auto">
                {tasksByQuadrant[quadrant.id].length}
              </Badge>
            </div>

            {/* Tasks */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
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
                      "flex items-start gap-2 p-2 rounded-lg bg-card border cursor-grab",
                      "hover:shadow-sm transition-all",
                      draggedTask === task.id && "opacity-50"
                    )}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
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
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {task.project && (
                          <span 
                            className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: `${task.project.color}20`,
                              color: task.project.color 
                            }}
                          >
                            {task.project.name}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className={cn(
                            "text-xs flex items-center gap-1",
                            isTaskDueSoon(task) ? "text-red-500" : "text-muted-foreground"
                          )}>
                            {isTaskDueSoon(task) && <AlertTriangle className="h-3 w-3" />}
                            {format(new Date(task.dueDate), "d MMM", { locale: es })}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {tasksByQuadrant[quadrant.id].length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <p>Sin tareas</p>
                  <p className="text-xs mt-1">Arrastra tareas aquí</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500/20 border-2 border-red-500" />
          <span>Urgente + Importante = Hacer ahora</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500/20 border-2 border-blue-500" />
          <span>Solo Importante = Programar</span>
        </div>
      </div>
    </div>
  );
}
