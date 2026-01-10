import { useEffect } from 'react';
import { useTasks } from '@/hooks/api';
import { format, isToday, isFuture, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

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
    const now = new Date();
    const nextTask = pendingTasks
      .filter((task: any) => {
        if (!task.dueDate) return false;
        const dueDate = parseISO(task.dueDate);
        return isFuture(dueDate) && !isToday(dueDate);
      })
      .sort((a: any, b: any) => {
        const dateA = parseISO(a.dueDate);
        const dateB = parseISO(b.dueDate);
        return dateA.getTime() - dateB.getTime();
      })[0] as any;

    // Format next task due date
    const nextTaskDue = nextTask?.dueDate
      ? format(parseISO(nextTask.dueDate), 'd MMM yyyy', { locale: es })
      : null;

    // Update tray with task information
    window.electronAPI.updateTray({
      pendingTasksCount: pendingCount,
      nextTaskTitle: nextTask?.title || null,
      nextTaskDue,
    });
  }, [tasks]);
}
