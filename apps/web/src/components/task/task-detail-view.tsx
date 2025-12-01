"use client";

import { useState } from "react";
import { useTask, useCompleteTask } from "@/lib/api-hooks";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar, Flag, Clock } from "lucide-react";
import { format } from "date-fns";

interface TaskDetailViewProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailView({ taskId, open, onOpenChange }: TaskDetailViewProps) {
  const { data: task, isLoading } = useTask(taskId as string);

  const completeTask = useCompleteTask();

  if (!taskId) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalles de Tarea</SheetTitle>
          <SheetDescription>
            Gestiona los detalles y subtareas
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-32 w-full animate-pulse rounded bg-muted" />
          </div>
        ) : task ? (
          <div className="space-y-6 py-6">
            {/* Header / Title */}
            <div className="flex items-start gap-4">
              <Checkbox
                checked={task.status === "COMPLETED"}
                onCheckedChange={() => completeTask.mutate(task.id as string)}
                className="mt-1"
              />
              <div className="space-y-1">
                <h2 className={`text-xl font-semibold ${task.status === "COMPLETED" ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </h2>
                {task.description && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {task.description}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Flag className={`h-4 w-4 ${
                  task.priority === "URGENT" ? "text-red-500" :
                  task.priority === "HIGH" ? "text-orange-500" :
                  task.priority === "MEDIUM" ? "text-blue-500" :
                  "text-gray-500"
                }`} />
                <span>{task.priority}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{task.dueDate ? format(new Date(task.dueDate), "PPP") : "Sin fecha"}</span>
              </div>
            </div>

            <Separator />

            {/* Subtasks */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Subtareas</h3>
                {/* Add Subtask Button would go here */}
              </div>
              
              {task.subTasks && task.subTasks.length > 0 ? (
                <div className="space-y-2">
                  {task.subTasks.map((subtask: any) => (
                    <div key={subtask.id} className="flex items-center gap-2 rounded-lg border p-2 text-sm">
                      <Checkbox checked={subtask.status === "COMPLETED"} disabled />
                      <span className={subtask.status === "COMPLETED" ? "line-through text-muted-foreground" : ""}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No hay subtareas</p>
              )}
            </div>

            {/* Time Tracking (Placeholder) */}
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4" />
                <h3 className="font-medium">Tiempo</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                El seguimiento de tiempo estará disponible pronto.
              </p>
            </div>

          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Tarea no encontrada
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
