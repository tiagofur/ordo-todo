"use client";

import { useState } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { Plus, CheckSquare } from "lucide-react";
import { useTasks } from "@/lib/api-hooks";
import { TaskCard } from "@/components/task/task-card";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { motion } from "framer-motion";

export default function TasksPage() {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const { data: tasks, isLoading } = useTasks();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-lg shadow-purple-500/20">
                <CheckSquare className="h-6 w-6" />
              </div>
              Tareas
            </h1>
            <p className="text-muted-foreground mt-2">
              Organiza tu día y mantente productivo.
            </p>
          </div>
          <button
            onClick={() => setShowCreateTask(true)}
            className="flex items-center gap-2 rounded-xl bg-purple-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition-all duration-200 hover:bg-purple-600 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30"
          >
            <Plus className="h-4 w-4" />
            Nueva Tarea
          </button>
        </div>

        {/* Tasks Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        ) : tasks && tasks.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {tasks.map((task: any, index: number) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 mb-6">
              <CheckSquare className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Todo en orden</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              No tienes tareas pendientes. ¡Buen trabajo!
            </p>
            <button
              onClick={() => setShowCreateTask(true)}
              className="flex items-center gap-2 rounded-xl bg-purple-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition-all duration-200 hover:bg-purple-600 hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              Crear Tarea
            </button>
          </motion.div>
        )}
      </div>

      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
      />
    </AppLayout>
  );
}
