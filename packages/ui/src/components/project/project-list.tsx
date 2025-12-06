"use client";

import { useTasks, useUpdateTask } from "@/lib/api-hooks";
import { useTranslations } from "next-intl";
import {
  Loader2,
  CheckCircle2,
  Circle,
  Calendar,
  Flag,
  Plus,
  ListTodo,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "../../utils/index.js";
import { useState } from "react";
import { TaskDetailPanel } from "../task/task-detail-panel.js";
import { CreateTaskDialog } from "../task/create-task-dialog.js";
import { Button } from "../ui/button.js";
import { EmptyState } from "../ui/empty-state.js";

interface ProjectListProps {
  projectId: string;
}

export function ProjectList({ projectId }: ProjectListProps) {
  const t = useTranslations("ProjectList");
  const { data: tasks, isLoading } = useTasks(projectId);
  const updateTaskMutation = useUpdateTask();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleStatusToggle = (task: any) => {
    const newStatus = task.status === "COMPLETED" ? "TODO" : "COMPLETED";
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { status: newStatus },
    });
  };

  const priorityColors = {
    LOW: "text-gray-500",
    MEDIUM: "text-blue-500",
    HIGH: "text-orange-500",
    URGENT: "text-red-500",
  };

  if (tasks?.length === 0) {
    return (
      <>
        <EmptyState
          icon={ListTodo}
          title={t("emptyState.title")}
          description={t("emptyState.description")}
          actionLabel={t("emptyState.action")}
          onAction={() => setIsCreateTaskOpen(true)}
        />
        <CreateTaskDialog
          open={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
          projectId={projectId}
        />
      </>
    );
  }

  return (
    <div className="space-y-2">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 border-b bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="w-6"></div>
          <div>{t("columns.task")}</div>
          <div>{t("columns.dueDate")}</div>
          <div>{t("columns.priority")}</div>
        </div>

        <div className="divide-y divide-border">
          {tasks?.map((task: any) => (
            <div
              key={task.id}
              className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 items-center hover:bg-muted/30 transition-colors cursor-pointer group"
              onClick={() => setSelectedTaskId(task.id)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusToggle(task);
                }}
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                  task.status === "COMPLETED"
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-muted-foreground/40 hover:border-primary"
                )}
              >
                {task.status === "COMPLETED" && (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
              </button>

              <div
                className={cn(
                  "font-medium",
                  task.status === "COMPLETED" &&
                    "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </div>

              <div className="text-sm text-muted-foreground flex items-center gap-2">
                {task.dueDate && (
                  <>
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(task.dueDate), "MMM d")}
                  </>
                )}
              </div>

              <div
                className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full bg-muted",
                  priorityColors[task.priority as keyof typeof priorityColors]
                )}
              >
                {task.priority}
              </div>
            </div>
          ))}
        </div>
      </div>

      <TaskDetailPanel
        taskId={selectedTaskId}
        open={!!selectedTaskId}
        onOpenChange={(open) => !open && setSelectedTaskId(null)}
      />
    </div>
  );
}
