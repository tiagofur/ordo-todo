"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUsernameSuggestions = exports.useUsernameValidation = exports.useTimer = exports.queryKeys = exports.createHooks = void 0;
var hooks_1 = require("./hooks");
Object.defineProperty(exports, "createHooks", { enumerable: true, get: function () { return hooks_1.createHooks; } });
var query_keys_1 = require("./query-keys");
Object.defineProperty(exports, "queryKeys", { enumerable: true, get: function () { return query_keys_1.queryKeys; } });
// Timer hook
var use_timer_1 = require("./use-timer");
Object.defineProperty(exports, "useTimer", { enumerable: true, get: function () { return use_timer_1.useTimer; } });
// Username validation hook
var use_username_validation_1 = require("./use-username-validation");
Object.defineProperty(exports, "useUsernameValidation", { enumerable: true, get: function () { return use_username_validation_1.useUsernameValidation; } });
Object.defineProperty(exports, "generateUsernameSuggestions", { enumerable: true, get: function () { return use_username_validation_1.generateUsernameSuggestions; } });
