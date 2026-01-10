import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { PageTransition, SlideIn } from "@/components/motion";
import { Button } from "@ordo-todo/ui";
import { useTasks } from "@/hooks/api";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@ordo-todo/ui";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function TasksTrash() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Get deleted tasks (this would be filtered by deletedAt field)
  const { data: allTasks = [], isLoading } = useTasks();

  // Filter tasks that are deleted (have deletedAt field)
  const deletedTasks = allTasks.filter((task: any) => task.deletedAt);

  const handleRestore = async (taskId: string) => {
    try {
      // For now, just update the task to mark it as active
      // TODO: Implement proper restore when backend supports it
      await apiClient.updateTask(taskId, { status: "TODO" });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarea restaurada");
    } catch (error) {
      toast.error("Error al restaurar tarea");
    }
  };

  const handleRestoreAll = async () => {
    try {
      // Restore all deleted tasks
      await Promise.all(
        deletedTasks.map((task: any) =>
          apiClient.updateTask(task.id, { status: "TODO" })
        )
      );
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Todas las tareas restauradas");
    } catch (error) {
      toast.error("Error al restaurar tareas");
    }
  };

  const handlePermanentDelete = async (taskId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta tarea permanentemente?")) {
      return;
    }

    try {
      await apiClient.deleteTask(taskId);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarea eliminada permanentemente");
    } catch (error) {
      toast.error("Error al eliminar tarea");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500/10 text-red-600 border-red-500/30";
      case "HIGH":
        return "bg-orange-500/10 text-orange-600 border-orange-500/30";
      case "MEDIUM":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      default:
        return "bg-green-500/10 text-green-600 border-green-500/30";
    }
  };

  const accentColor = "#ef4444"; // Red

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto space-y-6 pb-10">
        {/* Header */}
        <SlideIn direction="top">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                }}
              >
                <Trash2 className="h-6 w-6" />
              </div>
              Papelera
            </h1>
            <p className="text-muted-foreground">
              Tareas eliminadas que puedes restaurar o eliminar permanentemente
            </p>
          </div>
        </SlideIn>

        {/* Warning */}
        {deletedTasks.length > 0 && (
          <SlideIn direction="top" delay={0.1}>
            <div className="flex items-center gap-2 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-700 dark:text-yellow-300">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Las tareas se eliminarán permanentemente después de 30 días</p>
              </div>
              <Button
                onClick={handleRestoreAll}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Restaurar Todo
              </Button>
            </div>
          </SlideIn>
        )}

        {/* Task List */}
        <SlideIn direction="top" delay={0.2}>
          <Card className="p-6">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-20 bg-muted/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : deletedTasks.length === 0 ? (
              <div className="text-center py-12">
                <Trash2 className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-medium mb-2">Papelera vacía</h3>
                <p className="text-sm text-muted-foreground">
                  No hay tareas eliminadas
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {deletedTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className={cn(
                      "p-4 rounded-lg border bg-muted/30",
                      "border-red-500/20"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-2 text-muted-foreground">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium border",
                              getPriorityColor(task.priority || "LOW")
                            )}
                          >
                            {task.priority || "LOW"}
                          </span>
                          {task.dueDate && (
                            <span className="text-xs text-muted-foreground">
                              Vencía: {format(new Date(task.dueDate), "d MMM yyyy", { locale: es })}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Eliminada: {format(new Date(task.deletedAt), "d MMM yyyy", { locale: es })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleRestore(task.id)}
                          variant="outline"
                          size="sm"
                          className="gap-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Restaurar
                        </Button>
                        <Button
                          onClick={() => handlePermanentDelete(task.id)}
                          variant="destructive"
                          size="sm"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </SlideIn>
      </div>
    </PageTransition>
  );
}
