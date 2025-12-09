"use client";

import { useState } from "react";
import { Skeleton, Button } from "@ordo-todo/ui";
import { useTasks, useCompleteTask } from "@/lib/api-hooks";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { AlertCircle, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskListProps {
  projectId?: string;
}

export function TaskList({ projectId }: TaskListProps) {
  const t = useTranslations('TaskList');
  const [showMyTasks, setShowMyTasks] = useState(false);
  
  const { data: tasks, isLoading, error, refetch } = useTasks(
    projectId, 
    undefined, 
    { assignedToMe: showMyTasks }
  );
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

  return (
    <div className="space-y-4 mt-4">
      {/* Filter Toggle */}
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-lg border p-1 bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMyTasks(false)}
            className={cn(
              "gap-2 transition-colors",
              !showMyTasks && "bg-background shadow-sm"
            )}
          >
            <Users className="h-4 w-4" />
            {t('filters.allTasks')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMyTasks(true)}
            className={cn(
              "gap-2 transition-colors",
              showMyTasks && "bg-background shadow-sm"
            )}
          >
            <User className="h-4 w-4" />
            {t('filters.myTasks')}
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      {!tasks || tasks.length === 0 ? (
        <div className="text-muted-foreground text-center py-8">
          {showMyTasks ? t('emptyMyTasks') : t('empty')}
        </div>
      ) : (
        <div className="space-y-2">
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
      )}
    </div>
  );
}

