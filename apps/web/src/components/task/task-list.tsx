"use client";

import { useTasks, useCompleteTask } from "@/lib/api-hooks";
import { toast } from "sonner";

export function TaskList() {
  const { data: tasks, isLoading, error } = useTasks();
  const completeTask = useCompleteTask();

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error loading tasks: {error.message}</div>;

  if (!tasks || tasks.length === 0) {
    return <div className="text-muted-foreground">No tasks yet. Add one above!</div>;
  }

  return (
    <div className="space-y-2 mt-4">
      {tasks.map((task: any) => (
        <div
          key={task.id}
          className={`p-4 border rounded-lg shadow-sm flex justify-between items-center ${
            task.status === "COMPLETED" ? "bg-muted/50" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={task.status === "COMPLETED"}
              onChange={() => completeTask.mutate(task.id)}
              disabled={completeTask.isPending || task.status === "COMPLETED"}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div>
              <h3
                className={`font-medium ${
                  task.status === "COMPLETED" ? "line-through text-muted-foreground" : ""
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-muted-foreground">{task.description}</p>
              )}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">{task.status}</div>
        </div>
      ))}
    </div>
  );
}
