/**
 * Shared Hooks Bridge for Mobile
 *
 * This file creates the React Query hooks bound to the mobile app's API client.
 * It re-exports all hooks from the shared @ordo-todo/hooks package.
 *
 * BENEFITS:
 * - Same hooks as Web and Desktop
 * - Consistent query keys for caching
 * - Unified invalidation logic
 * - Reduces code duplication
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

import { createHooks, queryKeys, type ApiClient } from '@ordo-todo/hooks';
import { apiClient } from './api-client';
import type { QueryClient } from '@tanstack/react-query';

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

// ============ AUTH HOOKS ============
export function useRegister() { return getHooks().useRegister(); }
export function useLogin() { return getHooks().useLogin(); }
export function useLogout() { return getHooks().useLogout(); }

// ============ USER HOOKS ============
export function useCurrentUser() { return getHooks().useCurrentUser(); }
export function useUpdateProfile() { return getHooks().useUpdateProfile(); }
export function useFullProfile() { return getHooks().useFullProfile(); }
export function useUserPreferences() { return getHooks().useUserPreferences(); }
export function useUpdatePreferences() { return getHooks().useUpdatePreferences(); }
export function useUserIntegrations() { return getHooks().useUserIntegrations(); }
export function useExportData() { return getHooks().useExportData(); }
export function useDeleteAccount() { return getHooks().useDeleteAccount(); }

// ============ WORKSPACE HOOKS ============
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

// ============ WORKFLOW HOOKS ============
export function useWorkflows(workspaceId: string) { return getHooks().useWorkflows(workspaceId); }
export function useCreateWorkflow() { return getHooks().useCreateWorkflow(); }
export function useUpdateWorkflow() { return getHooks().useUpdateWorkflow(); }
export function useDeleteWorkflow() { return getHooks().useDeleteWorkflow(); }

// ============ PROJECT HOOKS ============
export function useProjects(workspaceId: string) { return getHooks().useProjects(workspaceId); }
export function useAllProjects() { return getHooks().useAllProjects(); }
export function useProject(projectId: string) { return getHooks().useProject(projectId); }
export function useCreateProject() { return getHooks().useCreateProject(); }
export function useUpdateProject() { return getHooks().useUpdateProject(); }
export function useArchiveProject() { return getHooks().useArchiveProject(); }
export function useCompleteProject() { return getHooks().useCompleteProject(); }
export function useDeleteProject() { return getHooks().useDeleteProject(); }

// ============ TASK HOOKS ============
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

// ============ TAG HOOKS ============
export function useTags(workspaceId: string) { return getHooks().useTags(workspaceId); }
export function useTaskTags(taskId: string) { return getHooks().useTaskTags(taskId); }
export function useCreateTag() { return getHooks().useCreateTag(); }
export function useUpdateTag() { return getHooks().useUpdateTag(); }
export function useAssignTagToTask() { return getHooks().useAssignTagToTask(); }
export function useRemoveTagFromTask() { return getHooks().useRemoveTagFromTask(); }
export function useDeleteTag() { return getHooks().useDeleteTag(); }

// ============ TIMER HOOKS ============
export function useActiveTimer() { return getHooks().useActiveTimer(); }
export function useStartTimer() { return getHooks().useStartTimer(); }
export function useStopTimer() { return getHooks().useStopTimer(); }
export function usePauseTimer() { return getHooks().usePauseTimer(); }
export function useResumeTimer() { return getHooks().useResumeTimer(); }
export function useSwitchTask() { return getHooks().useSwitchTask(); }
export function useSessionHistory(params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) {
    return getHooks().useSessionHistory(params);
}
export function useTimerStats(params?: { startDate?: string; endDate?: string }) {
    return getHooks().useTimerStats(params);
}
export function useTaskTimeSessions(taskId: string) { return getHooks().useTaskTimeSessions(taskId); }

// ============ ANALYTICS HOOKS ============
export function useDailyMetrics(params?: { startDate?: Date | string; endDate?: Date | string }) { return getHooks().useDailyMetrics(params); }
export function useWeeklyMetrics() { return getHooks().useWeeklyMetrics(); }
export function useMonthlyMetrics() { return getHooks().useMonthlyMetrics(); }
export function useDateRangeMetrics(startDate: string, endDate: string) {
    return getHooks().useDateRangeMetrics(startDate, endDate);
}
export function useDashboardStats() { return getHooks().useDashboardStats(); }
export function useHeatmapData() { return getHooks().useHeatmapData(); }
export function useProjectDistribution() { return getHooks().useProjectDistribution(); }
export function useTaskStatusDistribution() { return getHooks().useTaskStatusDistribution(); }

// ============ AI HOOKS ============
export function useAIProfile() { return getHooks().useAIProfile(); }
export function useOptimalSchedule() { return getHooks().useOptimalSchedule(); }
export function useTaskDurationPrediction() { return getHooks().useTaskDurationPrediction(); }
export function useGenerateWeeklyReport() { return getHooks().useGenerateWeeklyReport(); }
export function useReports() { return getHooks().useReports(); }
export function useReport(reportId: string) { return getHooks().useReport(reportId); }
export function useDeleteReport() { return getHooks().useDeleteReport(); }

// ============ COMMENT HOOKS ============
export function useTaskComments(taskId: string) { return getHooks().useTaskComments(taskId); }
export function useCreateComment() { return getHooks().useCreateComment(); }
export function useUpdateComment() { return getHooks().useUpdateComment(); }
export function useDeleteComment() { return getHooks().useDeleteComment(); }

// ============ ATTACHMENT HOOKS ============
export function useTaskAttachments(taskId: string) { return getHooks().useTaskAttachments(taskId); }
export function useCreateAttachment() { return getHooks().useCreateAttachment(); }
export function useDeleteAttachment() { return getHooks().useDeleteAttachment(); }
export function useProjectAttachments(projectId: string) { return getHooks().useProjectAttachments(projectId); }

// ============ NOTIFICATION HOOKS ============
export function useNotifications() { return getHooks().useNotifications(); }
export function useUnreadNotificationsCount() { return getHooks().useUnreadNotificationsCount(); }
export function useMarkNotificationAsRead() { return getHooks().useMarkNotificationAsRead(); }
export function useMarkAllNotificationsAsRead() { return getHooks().useMarkAllNotificationsAsRead(); }

// ============ HABIT HOOKS ============
export function useHabits() { return getHooks().useHabits(); }
export function useTodayHabits() { return getHooks().useTodayHabits(); }
export function useHabit(habitId: string) { return getHooks().useHabit(habitId); }
export function useHabitStats(habitId: string) { return getHooks().useHabitStats(habitId); }
export function useCreateHabit() { return getHooks().useCreateHabit(); }
export function useUpdateHabit() { return getHooks().useUpdateHabit(); }
export function useDeleteHabit() { return getHooks().useDeleteHabit(); }
export function useCompleteHabit() { return getHooks().useCompleteHabit(); }
export function useUncompleteHabit() { return getHooks().useUncompleteHabit(); }
export function usePauseHabit() { return getHooks().usePauseHabit(); }
export function useResumeHabit() { return getHooks().useResumeHabit(); }

// ============ OBJECTIVE (OKR) HOOKS ============
export function useObjectives() { return getHooks().useObjectives(); }
export function useCurrentPeriodObjectives() { return getHooks().useCurrentPeriodObjectives(); }
export function useObjectivesDashboardSummary() { return getHooks().useObjectivesDashboard(); }
export function useObjective(objectiveId: string) { return getHooks().useObjective(objectiveId); }
export function useCreateObjective() { return getHooks().useCreateObjective(); }
export function useUpdateObjective() { return getHooks().useUpdateObjective(); }
export function useDeleteObjective() { return getHooks().useDeleteObjective(); }
export function useAddKeyResult() { return getHooks().useAddKeyResult(); }
export function useUpdateKeyResult() { return getHooks().useUpdateKeyResult(); }
export function useDeleteKeyResult() { return getHooks().useDeleteKeyResult(); }
export function useLinkTaskToKeyResult() { return getHooks().useLinkTaskToKeyResult(); }
export function useUnlinkTaskFromKeyResult() { return getHooks().useUnlinkTaskFromKeyResult(); }

// ============ CUSTOM FIELDS HOOKS ============
export function useCustomFields(projectId: string) { return getHooks().useCustomFields(projectId); }
export function useCreateCustomField() { return getHooks().useCreateCustomField(); }
export function useUpdateCustomField() { return getHooks().useUpdateCustomField(); }
export function useDeleteCustomField() { return getHooks().useDeleteCustomField(); }
export function useTaskCustomValues(taskId: string) { return getHooks().useTaskCustomValues(taskId); }
export function useSetTaskCustomValues() { return getHooks().useSetTaskCustomValues(); }

// ============ UTILITIES ============
export function invalidateAllTasks(queryClient: QueryClient) { return getHooks().invalidateAllTasks(queryClient); }

// Export the lazy getter for dynamic access
export { getHooks as hooks };
