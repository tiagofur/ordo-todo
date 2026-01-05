/**
 * Shared Hooks Bridge
 *
 * This file creates the React Query hooks bound to the web app's API client.
 * It re-exports all hooks from the shared package for easy consumption.
 *
 * IMPORTANT: Hooks are created lazily to avoid "No QueryClient set" errors
 * when the module is imported before QueryClientProvider is mounted.
 *
 * @example
 * ```tsx
 * import { useTasks, useCreateTask } from '@/lib/shared-hooks';
 *
 * function TaskList() {
 *   const { data: tasks } = useTasks();
 *   const createTask = useCreateTask();
 *   // ...
 * }
 * ```
 */

'use client';

import { createHooks, queryKeys, type ApiClient } from '@ordo-todo/hooks';
import { UseQueryResult, QueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';
import type { GetSessionsParams, PaginatedSessionsResponse, GetDailyMetricsParams } from '@ordo-todo/api-client';

// Re-export query keys for direct use
export { queryKeys };

// Lazy-initialized hooks to avoid "No QueryClient set" errors
let _hooks: ReturnType<typeof createHooks> | null = null;

function getHooks() {
  if (!_hooks) {
    _hooks = createHooks({ apiClient: apiClient as unknown as ApiClient });
  }
  return _hooks;
}

// Create wrapper functions that lazily initialize hooks
// Auth
export function useRegister() { return getHooks().useRegister(); }
export function useLogin() { return getHooks().useLogin(); }
export function useLogout() { return getHooks().useLogout(); }

// User
export function useCurrentUser() { return getHooks().useCurrentUser(); }
export function useUpdateProfile() { return getHooks().useUpdateProfile(); }
export function useFullProfile() { return getHooks().useFullProfile(); }
export function useUserPreferences() { return getHooks().useUserPreferences(); }
export function useUpdatePreferences() { return getHooks().useUpdatePreferences(); }
export function useUserIntegrations() { return getHooks().useUserIntegrations(); }
export function useExportData() { return getHooks().useExportData(); }
export function useDeleteAccount() { return getHooks().useDeleteAccount(); }

// Workspace
export function useWorkspaces() { return getHooks().useWorkspaces(); }
export function useWorkspace(workspaceId: string) { return getHooks().useWorkspace(workspaceId); }
export function useWorkspaceBySlug(username: string, slug: string) { return getHooks().useWorkspaceBySlug(username, slug); }
export function useCreateWorkspace() { return getHooks().useCreateWorkspace(); }
export function useUpdateWorkspace() { return getHooks().useUpdateWorkspace(); }
export function useDeleteWorkspace() { return getHooks().useDeleteWorkspace(); }
export function useAddWorkspaceMember() { return getHooks().useAddWorkspaceMember(); }
export function useRemoveWorkspaceMember() { return getHooks().useRemoveWorkspaceMember(); }
export function useWorkspaceMembers(workspaceId: string) { return getHooks().useWorkspaceMembers(workspaceId); }
export function useWorkspaceInvitations(workspaceId: string) { return getHooks().useWorkspaceInvitations(workspaceId); }
export function useInviteMember() { return getHooks().useInviteMember(); }
export function useAcceptInvitation() { return getHooks().useAcceptInvitation(); }
export function useWorkspaceSettings(workspaceId: string) { return getHooks().useWorkspaceSettings(workspaceId); }
export function useUpdateWorkspaceSettings() { return getHooks().useUpdateWorkspaceSettings(); }
export function useWorkspaceAuditLogs(workspaceId: string, params?: { limit?: number; offset?: number }) {
  return getHooks().useWorkspaceAuditLogs(workspaceId, params);
}

// Workflow
export function useWorkflows(workspaceId: string) { return getHooks().useWorkflows(workspaceId); }
export function useCreateWorkflow() { return getHooks().useCreateWorkflow(); }
export function useUpdateWorkflow() { return getHooks().useUpdateWorkflow(); }
export function useDeleteWorkflow() { return getHooks().useDeleteWorkflow(); }

// Project
export function useProjects(workspaceId: string) { return getHooks().useProjects(workspaceId); }
export function useAllProjects() { return getHooks().useAllProjects(); }
export function useProject(projectId: string) { return getHooks().useProject(projectId); }
export function useCreateProject() { return getHooks().useCreateProject(); }
export function useUpdateProject() { return getHooks().useUpdateProject(); }
export function useArchiveProject() { return getHooks().useArchiveProject(); }
export function useCompleteProject() { return getHooks().useCompleteProject(); }
export function useDeleteProject() { return getHooks().useDeleteProject(); }

// Task
export function useTasks(projectId?: string, tags?: string[], options?: { assignedToMe?: boolean }) {
  return getHooks().useTasks(projectId, tags, options);
}
export function useTask(taskId: string) { return getHooks().useTask(taskId); }
export function useTaskDetails(taskId: string) { return getHooks().useTaskDetails(taskId); }
export function useCreateTask() { return getHooks().useCreateTask(); }
export function useUpdateTask() { return getHooks().useUpdateTask(); }
export function useCompleteTask() { return getHooks().useCompleteTask(); }
export function useDeleteTask() { return getHooks().useDeleteTask(); }
export function useCreateSubtask() { return getHooks().useCreateSubtask(); }
export function useShareTask() { return getHooks().useShareTask(); }
export function usePublicTask(token: string) { return getHooks().usePublicTask(token); }

// Tag
export function useTags(workspaceId: string) { return getHooks().useTags(workspaceId); }
export function useTaskTags(taskId: string) { return getHooks().useTaskTags(taskId); }
export function useCreateTag() { return getHooks().useCreateTag(); }
export function useUpdateTag() { return getHooks().useUpdateTag(); }
export function useAssignTagToTask() { return getHooks().useAssignTagToTask(); }
export function useRemoveTagFromTask() { return getHooks().useRemoveTagFromTask(); }
export function useDeleteTag() { return getHooks().useDeleteTag(); }

// Timer
export function useActiveTimer() { return getHooks().useActiveTimer(); }
export function useStartTimer() { return getHooks().useStartTimer(); }
export function useStopTimer() { return getHooks().useStopTimer(); }
export function usePauseTimer() { return getHooks().usePauseTimer(); }
export function useResumeTimer() { return getHooks().useResumeTimer(); }
export function useSwitchTask() { return getHooks().useSwitchTask(); }
export function useSessionHistory(params?: GetSessionsParams): UseQueryResult<PaginatedSessionsResponse, Error> {
  return getHooks().useSessionHistory(params) as UseQueryResult<PaginatedSessionsResponse, Error>;
}
export function useTimerStats(params?: { startDate?: string; endDate?: string }) {
  return getHooks().useTimerStats(params);
}
export function useTaskTimeSessions(taskId: string) { return getHooks().useTaskTimeSessions(taskId); }

// Analytics
export function useDailyMetrics(params?: GetDailyMetricsParams) { return getHooks().useDailyMetrics(params); }
export function useWeeklyMetrics() { return getHooks().useWeeklyMetrics(); }
export function useMonthlyMetrics() { return getHooks().useMonthlyMetrics(); }
export function useDateRangeMetrics(startDate: string, endDate: string) {
  return getHooks().useDateRangeMetrics(startDate, endDate);
}
export function useDashboardStats() { return getHooks().useDashboardStats(); }
export function useHeatmapData() { return getHooks().useHeatmapData(); }
export function useProjectDistribution() { return getHooks().useProjectDistribution(); }
export function useTaskStatusDistribution() { return getHooks().useTaskStatusDistribution(); }

// AI
export function useAIProfile() { return getHooks().useAIProfile(); }
export function useOptimalSchedule() { return getHooks().useOptimalSchedule(); }
export function useTaskDurationPrediction() { return getHooks().useTaskDurationPrediction(); }
export function useGenerateWeeklyReport() { return getHooks().useGenerateWeeklyReport(); }
export function useReports() { return getHooks().useReports(); }
export function useReport(reportId: string) { return getHooks().useReport(reportId); }
export function useDeleteReport() { return getHooks().useDeleteReport(); }

// Comments
export function useTaskComments(taskId: string) { return getHooks().useTaskComments(taskId); }
export function useCreateComment() { return getHooks().useCreateComment(); }
export function useUpdateComment() { return getHooks().useUpdateComment(); }
export function useDeleteComment() { return getHooks().useDeleteComment(); }

// Attachments
export function useTaskAttachments(taskId: string) { return getHooks().useTaskAttachments(taskId); }
export function useCreateAttachment() { return getHooks().useCreateAttachment(); }
export function useDeleteAttachment() { return getHooks().useDeleteAttachment(); }
export function useProjectAttachments(projectId: string) { return getHooks().useProjectAttachments(projectId); }

// Notifications
export function useNotifications() { return getHooks().useNotifications(); }
export function useUnreadNotificationsCount() { return getHooks().useUnreadNotificationsCount(); }
export function useMarkNotificationAsRead() { return getHooks().useMarkNotificationAsRead(); }
export function useMarkAllNotificationsAsRead() { return getHooks().useMarkAllNotificationsAsRead(); }

// Notes
export function useNotes(workspaceId: string) { return getHooks().useNotes(workspaceId); }
export function useNote(id: string) { return getHooks().useNote(id); }
export function useCreateNote() { return getHooks().useCreateNote(); }
export function useUpdateNote() { return getHooks().useUpdateNote(); }
export function useDeleteNote() { return getHooks().useDeleteNote(); }

// Utilities

export function invalidateAllTasks(queryClient: QueryClient) { return getHooks().invalidateAllTasks(queryClient); }

// Export the lazy getter for dynamic access
export { getHooks as hooks };
