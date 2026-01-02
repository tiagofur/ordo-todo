"use client";

import { useState } from "react";
import { useTasks } from "@/lib/api-hooks";
import { useTranslations } from "next-intl";
import { TaskSelector as TaskSelectorUI, type SelectableTask } from "@ordo-todo/ui";

interface TaskSelectorProps {
  selectedTaskId?: string | null;
  onSelect: (taskId: string | null) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * TaskSelector - Web wrapper for the shared TaskSelector component
 * 
 * Integrates the platform-agnostic UI component with:
 * - useTasks hook for fetching tasks
 * - next-intl for translations
 */
export function TaskSelector({ selectedTaskId, onSelect, className, disabled }: TaskSelectorProps) {
  const t = useTranslations('TaskSelector');
  const [open, setOpen] = useState(false);
  
  // Fetch pending tasks
  const { data: tasks } = useTasks();
  
  // Map tasks to the SelectableTask format expected by the UI component
  const selectableTasks: SelectableTask[] = (tasks || []).map((task: any) => ({
    id: task.id,
    title: task.title,
    status: task.status,
  }));

  const labels = {
    placeholder: t('placeholder'),
    searchPlaceholder: t('searchPlaceholder'),
    noTasks: t('noTasks'),
    groupHeading: t('groupHeading'),
    noTaskAssigned: t('noTaskAssigned'),
  };

  return (
    <TaskSelectorUI
      selectedTaskId={selectedTaskId}
      tasks={selectableTasks}
      onSelect={onSelect}
      disabled={disabled}
      labels={labels}
      className={className}
      // @ts-ignore - Props will be added to UI component in next step
      open={open}
      // @ts-ignore - Props will be added to UI component in next step
      setOpen={setOpen}
    />
  );
}
