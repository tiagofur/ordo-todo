import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Clock, AlertCircle, Filter } from "lucide-react";
import { PageTransition, SlideIn } from "@/components/motion";
import { Button } from "@ordo-todo/ui";
import { useTasks } from "@/hooks/api";
import { useNavigate } from "react-router-dom";
import { Card } from "@ordo-todo/ui";
import { cn } from "@/lib/utils";
import { format, isToday, isPast, isFuture, addDays } from "date-fns";
import { es } from "date-fns/locale";

export function TasksPeriod() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const period = window.location.hash.split("/").pop() || "today";

  const { data: tasks = [], isLoading } = useTasks();

  // Filter tasks based on period
  const filteredTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter((task: any) => {
      if (!task.dueDate || task.completed) return false;

      const dueDate = new Date(task.dueDate);

      switch (period) {
        case "today":
          return isToday(dueDate);
        case "upcoming":
          return isFuture(dueDate) && !isToday(dueDate);
        case "overdue":
          return isPast(dueDate) && !isToday(dueDate);
        default:
          return false;
      }
    });
  }, [tasks, period]);

  const getPeriodInfo = () => {
    switch (period) {
      case "today":
        return {
          title: "Tareas de Hoy",
          description: "Tareas programadas para hoy",
          icon: Calendar,
          color: "#3b82f6", // Blue
        };
      case "upcoming":
        return {
          title: "Tareas Próximas",
          description: "Tareas futuras pendientes",
          icon: Clock,
          color: "#8b5cf6", // Purple
        };
      case "overdue":
        return {
          title: "Tareas Vencidas",
          description: "Tareas que debieron completarse",
          icon: AlertCircle,
          color: "#ef4444", // Red
        };
      default:
        return {
          title: "Tareas",
          description: "",
          icon: Calendar,
          color: "#3b82f6",
        };
    }
  };

  const periodInfo = getPeriodInfo();

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "text-blue-600 bg-blue-500/10";
      case "DONE":
      case "COMPLETED":
        return "text-green-600 bg-green-500/10";
      default:
        return "text-gray-600 bg-gray-500/10";
    }
  };

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
                  backgroundColor: periodInfo.color,
                  boxShadow: `0 10px 15px -3px ${periodInfo.color}40, 0 4px 6px -4px ${periodInfo.color}40`,
                }}
              >
                <periodInfo.icon className="h-6 w-6" />
              </div>
              {periodInfo.title}
            </h1>
            <p className="text-muted-foreground">{periodInfo.description}</p>
          </div>
        </SlideIn>

        {/* Stats */}
        <SlideIn direction="top" delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{filteredTasks.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <Filter className="h-8 w-8 text-muted-foreground/20" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {filteredTasks.filter((t: any) => t.status === "TODO").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-500" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {filteredTasks.filter((t: any) => t.status === "IN_PROGRESS").length}
                  </p>
                  <p className="text-xs text-muted-foreground">En Progreso</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-purple-500" />
                </div>
              </div>
            </Card>
          </div>
        </SlideIn>

        {/* Task List */}
        <SlideIn direction="top" delay={0.2}>
          <Card className="p-6">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-20 bg-muted/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <periodInfo.icon className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay tareas</h3>
                <p className="text-sm text-muted-foreground">
                  {period === "today" && "No tienes tareas para hoy"}
                  {period === "upcoming" && "No tienes tareas próximas"}
                  {period === "overdue" && "¡Excelente! No tienes tareas vencidas"}
                </p>
                <Button
                  onClick={() => navigate("/tasks")}
                  variant="outline"
                  className="mt-4"
                >
                  Ver todas las tareas
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task: any, idx: number) => (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/tasks`)}
                    className={cn(
                      "p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer",
                      "bg-card hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-2">{task.title}</h3>
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
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium",
                              getStatusColor(task.status)
                            )}
                          >
                            {task.status === "TODO" ? "Pendiente" :
                             task.status === "IN_PROGRESS" ? "En Progreso" :
                             task.status === "DONE" || task.status === "COMPLETED" ? "Completada" :
                             task.status}
                          </span>
                          {task.dueDate && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(task.dueDate), "d MMM yyyy", { locale: es })}
                            </span>
                          )}
                          {task.project && (
                            <span
                              className="px-2 py-0.5 rounded-full text-xs"
                              style={{
                                backgroundColor: `${task.project.color}20`,
                                color: task.project.color,
                              }}
                            >
                              {task.project.name}
                            </span>
                          )}
                        </div>
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
