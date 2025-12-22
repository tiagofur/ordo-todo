"use client";

import { motion } from "framer-motion";
import { Target, RefreshCw } from "lucide-react";
import { Button } from "@ordo-todo/ui";
import { AppLayout } from "@/components/shared/app-layout";
import { EisenhowerMatrix } from "@/components/tasks/eisenhower-matrix";
import { useTasks } from "@/lib/api-hooks";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function EisenhowerPage() {
  const accentColor = "#8b5cf6"; // Purple
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: tasks = [], isLoading } = useTasks();

  const handleRefresh = () => {
    setIsRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ["tasks"] }).finally(() => {
      setIsRefreshing(false);
    });
  };

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      // Use status to mark as completed (API uses status, not completed)
      await apiClient.updateTask(taskId, { 
        status: completed ? "COMPLETED" : "TODO" 
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(completed ? "Tarea completada" : "Tarea reabierta");
    } catch (error) {
      toast.error("Error al actualizar tarea");
    }
  };

  const handleTaskMove = async (
    taskId: string, 
    quadrant: "DO" | "SCHEDULE" | "DELEGATE" | "DELETE"
  ) => {
    // Map quadrant to priority (API types: LOW, MEDIUM, HIGH, URGENT)
    type TaskPriority = "HIGH" | "MEDIUM" | "LOW" | "URGENT";
    let priority: TaskPriority;
    
    switch (quadrant) {
      case "DO":
        priority = "URGENT";
        break;
      case "SCHEDULE":
        priority = "HIGH";
        break;
      case "DELEGATE":
        priority = "MEDIUM";
        break;
      case "DELETE":
      default:
        priority = "LOW";
        break;
    }

    try {
      await apiClient.updateTask(taskId, { priority });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarea movida");
    } catch (error) {
      toast.error("Error al mover tarea");
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded-xl w-1/3" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto space-y-6 pb-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                }}
              >
                <Target className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.div>
              Matriz de Eisenhower
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              Prioriza tus tareas por urgencia e importancia
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={isRefreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Actualizar
          </Button>
        </div>

        {/* Matrix */}
        <EisenhowerMatrix
          tasks={tasks.map((t: any) => ({
            id: t.id,
            title: t.title,
            priority: t.priority || "LOW",
            dueDate: t.dueDate,
            isUrgent: t.isUrgent,
            isImportant: t.isImportant,
            completed: t.completed,
            project: t.project,
          }))}
          onTaskComplete={handleTaskComplete}
          onTaskMove={handleTaskMove}
        />

        {/* Tips */}
        <div className="rounded-xl bg-muted/30 border p-4">
          <h3 className="font-medium mb-2">💡 Cómo usar la matriz</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Hacer Primero:</strong> Tareas críticas que requieren atención inmediata</li>
            <li>• <strong>Programar:</strong> Tareas importantes pero que pueden esperar - planifícalas</li>
            <li>• <strong>Delegar:</strong> Tareas urgentes pero no importantes - considera delegarlas</li>
            <li>• <strong>Eliminar:</strong> Ni urgentes ni importantes - pregúntate si realmente necesitas hacerlas</li>
          </ul>
        </div>
      </motion.div>
    </AppLayout>
  );
}
