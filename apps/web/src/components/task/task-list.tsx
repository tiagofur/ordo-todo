"use client";

import { useTasks, useCompleteTask } from "@/lib/api-hooks";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export function TaskList() {
  const t = useTranslations('TaskList');
  const { data: tasks, isLoading, error, refetch } = useTasks();
  const completeTask = useCompleteTask();

  if (isLoading) {
    return (
      <div className="space-y-2 mt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-3 w-full">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-4 w-16 ml-4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive flex flex-col items-center gap-2 mt-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <p className="font-medium">{t('error', { message: error.message })}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="bg-background hover:bg-accent">
          {t('retry')}
        </Button>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return <div className="text-muted-foreground">{t('empty')}</div>;
  }

  return (
    <div className="space-y-2 mt-4">
      {tasks.map((task: any) => (
        <div
          key={task.id}
          className={`p-4 border rounded-lg shadow-sm flex justify-between items-center animate-in fade-in slide-in-from-bottom-2 duration-300 ${
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
