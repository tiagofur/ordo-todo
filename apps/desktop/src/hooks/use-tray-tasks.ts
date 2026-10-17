import { useEffect } from 'react';
import { useTasks } from '@/hooks/api';
import { desktopBridge } from '@/lib/desktop-bridge';

/**
 * Hook to update the System Tray and Dock with task count
 */
export function useTrayTasks() {
  const { data: tasks = [] } = useTasks();

  useEffect(() => {
    if (!desktopBridge.isNative() || !tasks.length) return;

    // Filter pending (incomplete) tasks
    const pendingTasks = tasks.filter((task: any) => !task.completed && task.status !== 'DONE');
    const pendingCount = pendingTasks.length;

    // Update dock / app badge count
    desktopBridge.setBadgeCount(pendingCount);
  }, [tasks]);
}
