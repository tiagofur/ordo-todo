import { CheckCircle2, Clock, TrendingUp, Plus } from "lucide-react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { TaskCard } from "@/components/task/task-card";
import { useState } from "react";

export function Dashboard() {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const { data: tasks } = api.task.list.useQuery();

  // Calculate stats
  const completedTasks = tasks?.filter(t => t.status === "COMPLETED").length || 0;
  const totalTasks = tasks?.length || 0;
  
  // Filter today's tasks (simplified logic for now)
  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasks?.filter(t => {
    if (!t.dueDate) return false;
    const taskDate = t.dueDate.toISOString().split("T")[0];
    return taskDate === today;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Hoy</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completadas</p>
              <p className="text-2xl font-bold">{completedTasks}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tiempo trabajado</p>
              <p className="text-2xl font-bold">0h</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Productividad</p>
              <p className="text-2xl font-bold">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tareas de Hoy</h2>
          <Button size="sm" onClick={() => setShowCreateTask(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
        </div>
        <div className="p-6">
          {todayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">No hay tareas para hoy</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Comienza creando tu primera tarea
              </p>
              <Button onClick={() => setShowCreateTask(true)}>
                Crear Tarea
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {todayTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
      />
    </div>
  );
}
