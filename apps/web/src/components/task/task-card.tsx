"use client";

import { useState } from "react";
import { TaskCard as UITaskCard, type TaskCardTask } from "@ordo-todo/ui";
import { format } from "date-fns";
import { es, enUS, ptBR } from "date-fns/locale";
import { parseCalendarDate, isCalendarDateOverdue } from "@ordo-todo/core";
import { TaskDetailPanel } from "./task-detail-panel";
import { useLocale, useTranslations } from "next-intl";
import { useDeleteTask } from "@/lib/api-hooks";

interface TaskCardProps {
  task: TaskCardTask;
  index?: number;
}

const localeMap: Record<string, typeof es> = {
  es,
  en: enUS,
  "pt-br": ptBR,
};

/**
 * TaskCard Container - Handles business logic and state for task display.
 * Uses UITaskCard from @ordo-todo/ui for presentation.
 */
export function TaskCard({ task, index = 0 }: TaskCardProps) {
  const t = useTranslations('TaskCard');
  const locale = useLocale();
  const dateLocale = localeMap[locale] || es;
  const deleteTask = useDeleteTask();
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
    const dateObj = parseCalendarDate(date);
    if (!dateObj) return null;
    return format(dateObj, "d MMM", { locale: dateLocale });
  };
  
  const isOverdue = isCalendarDateOverdue(task.dueDate, isCompleted);

  const handleDelete = () => {
    if (task.id) {
      deleteTask.mutate(String(task.id));
    }
  };

  return (
    <>
      <UITaskCard
        task={task}
        index={index}
        isExpanded={showDetail}
        onToggleExpand={() => setShowDetail(true)}
        onEdit={() => setShowDetail(true)}
        onDelete={handleDelete}
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

      {showDetail && (
        <TaskDetailPanel 
          taskId={task.id ? String(task.id) : null} 
          open={showDetail} 
          onOpenChange={setShowDetail} 
        />
      )}
    </>
  );
}

