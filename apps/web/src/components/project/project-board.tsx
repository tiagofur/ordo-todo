"use client";

import { useTasks, useUpdateTask } from "@/lib/api-hooks";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { ProjectBoard as ProjectBoardUI } from "@ordo-todo/ui";

interface ProjectBoardProps {
  projectId: string;
}

export function ProjectBoard({ projectId }: ProjectBoardProps) {
  const t = useTranslations("ProjectBoard");
  const tCard = useTranslations("TaskCard");
  const { data: tasks, isLoading } = useTasks(projectId);
  const updateTaskMutation = useUpdateTask();
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  const handleUpdateTask = (taskId: string, data: any) => {
    updateTaskMutation.mutate({ taskId, data });
  };

  return (
    <>
      <ProjectBoardUI
        tasks={tasks}
        isLoading={isLoading}
        onUpdateTask={handleUpdateTask}
        onAddTaskClick={() => setIsCreateTaskOpen(true)}
        labels={{
          todo: t("columns.todo"),
          inProgress: t("columns.inProgress"),
          completed: t("columns.completed"),
          addTask: t("addTask"),
          priorityLow: tCard("priority.LOW"),
          priorityMedium: tCard("priority.MEDIUM"),
          priorityHigh: tCard("priority.HIGH"),
          priorityUrgent: tCard("priority.URGENT"),
          viewEdit: tCard("actions.viewEdit"),
          delete: tCard("actions.delete"),
        }}
      />

      <CreateTaskDialog
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        projectId={projectId}
      />
    </>
  );
}
