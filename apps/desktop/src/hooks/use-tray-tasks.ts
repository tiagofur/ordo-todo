import { useEffect } from 'react';
import { useTasks } from '@/hooks/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { parseCalendarDate, isCalendarDateToday, isCalendarDateOverdue } from '@ordo-todo/core';

/**
 * Hook to update the System Tray with task information
 * Shows pending tasks count and next upcoming task
 */
export function useTrayTasks() {
  const { data: tasks = [] } = useTasks();

  useEffect(() => {
    if (!window.electronAPI || !tasks.length) return;

    // Filter pending (incomplete) tasks
    const pendingTasks = tasks.filter((task: any) => !task.completed && task.status !== 'DONE');
    const pendingCount = pendingTasks.length;

    // Find next upcoming task (with due date, not overdue, not today)
    const nextTask = pendingTasks
      .filter((task: any) => {
        if (!task.dueDate) return false;
        return !isCalendarDateToday(task.dueDate) && !isCalendarDateOverdue(task.dueDate, false);
      })
      .sort((a: any, b: any) => {
        const dateA = (parseCalendarDate(a.dueDate) || new Date(a.dueDate)).getTime();
        const dateB = (parseCalendarDate(b.dueDate) || new Date(b.dueDate)).getTime();
        return dateA - dateB;
      })[0] as any;

    // Format next task due date
    const nextTaskDate = nextTask?.dueDate ? parseCalendarDate(nextTask.dueDate) : null;
    const nextTaskDue = nextTaskDate
      ? format(nextTaskDate, 'd MMM yyyy', { locale: es })
      : null;

    // Update tray with task information
    window.electronAPI.updateTray({
      pendingTasksCount: pendingCount,
      nextTaskTitle: nextTask?.title || null,
      nextTaskDue,
    });
  }, [tasks]);
}
