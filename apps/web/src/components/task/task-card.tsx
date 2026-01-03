"use client";

import { useState } from "react";
import { TaskCard as UITaskCard } from "@ordo-todo/ui";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TaskDetailPanel } from "./task-detail-panel";
import { useTranslations } from "next-intl";

interface TaskCardProps {
  task: {
    id?: string | number;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    dueDate?: Date | string | null;
    tags?: any[];
    project?: { id: string; name: string; color: string };
    subTasks?: Array<{
      id: string | number;
      title: string;
      status: string;
    }>;
  };
  index?: number;
}

/**
 * TaskCard Container - Handles business logic and state for task display.
 * Uses UITaskCard from @ordo-todo/ui for presentation.
 */
export function TaskCard({ task, index = 0 }: TaskCardProps) {
  const t = useTranslations('TaskCard');
  const [showDetail, setShowDetail] = useState(false);
  const isCompleted = task.status === "COMPLETED";

  const priorityConfig = {
    LOW: { label: t('priority.LOW'), colorClass: "text-slate-500" },
    MEDIUM: { label: t('priority.MEDIUM'), colorClass: "text-blue-500" },
    HIGH: { label: t('priority.HIGH'), colorClass: "text-orange-500" },
    URGENT: { label: t('priority.URGENT'), colorClass: "text-red-500" },
  };

  const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;

  const formatDueDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "d MMM", { locale: es });
  };
  
  const isOverdue = !isCompleted && task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <>
      <UITaskCard
        task={task as any}
        index={index}
        isExpanded={showDetail}
        onToggleExpand={() => setShowDetail(true)}
        onEdit={() => setShowDetail(true)}
        formattedDueDate={formatDueDate(task.dueDate)}
        isOverdue={!!isOverdue}
        priorityInfo={priority}
        labels={{
          viewEdit: t('actions.viewEdit'),
          delete: t('actions.delete'),
          completed: t('status.completed'),
          moreOptions: t('actions.moreOptions'),
        }}
      />

      <TaskDetailPanel 
        taskId={task.id ? String(task.id) : null} 
        open={showDetail} 
        onOpenChange={setShowDetail} 
      />
    </>
  );
}

