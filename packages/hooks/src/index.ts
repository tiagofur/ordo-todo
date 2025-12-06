/**
 * Shared React Query Hooks for Ordo-Todo
 *
 * This package provides React Query hooks that can be used across
 * web, mobile, and desktop applications.
 *
 * @example
 * ```tsx
 * // In your app's hooks file (e.g., apps/web/src/lib/hooks.ts)
 * import { createHooks } from '@ordo-todo/hooks';
 * import { apiClient } from './api-client';
 *
 * // Create hooks bound to your API client
 * export const {
 *   useCurrentUser,
 *   useTasks,
 *   useCreateTask,
 *   useWorkspaces,
 *   // ... all other hooks
 * } = createHooks({ apiClient });
 *
 * // Or export the entire hooks object
 * export const hooks = createHooks({ apiClient });
 * ```
 *
 * @example
 * ```tsx
 * // In your components
 * import { useTasks, useCreateTask } from '@/lib/hooks';
 *
 * function TaskList() {
 *   const { data: tasks, isLoading } = useTasks();
 *   const createTask = useCreateTask();
 *
 *   const handleCreate = () => {
 *     createTask.mutate({
 *       title: 'New Task',
 *       projectId: 'some-project-id',
 *     });
 *   };
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <ul>
 *       {tasks?.map(task => (
 *         <li key={task.id}>{task.title}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */

export { createHooks, type Hooks } from './hooks';
export { queryKeys } from './query-keys';
export type { ApiClient, CreateHooksConfig } from './types';

// Timer hook
export {
  useTimer,
  type TimerMode,
  type TimerType,
  type TimerConfig,
  type UseTimerProps,
  type SessionData,
  type UseTimerReturn,
} from './use-timer';
