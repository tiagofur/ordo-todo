/**
 * React Query Hooks for API Client
 *
 * This file re-exports hooks from the shared hooks package for backwards compatibility.
 * New code should import from '@/lib/shared-hooks' directly.
 *
 * @deprecated Import from '@/lib/shared-hooks' instead
 */

"use client";

import { useQuery, useMutation, useQueryClient, QueryClient, type UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "./api-client";
import type { GetDailyMetricsParams, GetSessionsParams, PaginatedSessionsResponse } from "@ordo-todo/api-client";
import { createHooks, queryKeys, type ApiClient } from "@ordo-todo/hooks";

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

// ============ SHARED HOOKS WRAPPERS ============

// Auth
export function useRegister() { return getHooks().useRegister(); }
export function useLogin() { return getHooks().useLogin(); }
export function useLogout() { return getHooks().useLogout(); }

// User
export function useCurrentUser(options?: { enabled?: boolean }) { return getHooks().useCurrentUser(options); }
export function useUpdateProfile() { return getHooks().useUpdateProfile(); }
export function useFullProfile() { return getHooks().useFullProfile(); }
export function useUserPreferences() { return getHooks().useUserPreferences(); }
export function useUpdatePreferences() { return getHooks().useUpdatePreferences(); }
export function useUserIntegrations() { return getHooks().useUserIntegrations(); }
export function useExportData() { return getHooks().useExportData(); }
export function useDeleteAccount() { return getHooks().useDeleteAccount(); }

// Workspace
export function useWorkspaces(options?: { enabled?: boolean }) { return getHooks().useWorkspaces(options); }
export function useWorkspace(workspaceId: string) { return getHooks().useWorkspace(workspaceId); }
// useWorkspaceBySlug is handled by getHooks().useWorkspaceBySlug, but we export a web-specific compatible version below.
export function useWorkspaceBySlugShared(username: string, slug: string) { return getHooks().useWorkspaceBySlug(username, slug); }

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
export function useWeeklyMetrics(params?: { weekStart?: string }) { return getHooks().useWeeklyMetrics(params); }
export function useMonthlyMetrics(params?: { monthStart?: string }) { return getHooks().useMonthlyMetrics(params); }
export function useDateRangeMetrics(startDate: string, endDate: string) {
  return getHooks().useDateRangeMetrics(startDate, endDate);
}
export function useDashboardStats() { return getHooks().useDashboardStats(); }
export function useHeatmapData() { return getHooks().useHeatmapData(); }
export function useProjectDistribution() { return getHooks().useProjectDistribution(); }
export function useTaskStatusDistribution() { return getHooks().useTaskStatusDistribution(); }

// AI
export function useAIProfile() { return getHooks().useAIProfile(); }
export function useOptimalSchedule(params?: { topN?: number }) { return getHooks().useOptimalSchedule(params); }
export function useTaskDurationPrediction(params: any) { return getHooks().useTaskDurationPrediction(params); }
export function useGenerateWeeklyReport() { return getHooks().useGenerateWeeklyReport(); }
export function useReports(params?: { scope?: string; limit?: number; offset?: number }) { return getHooks().useReports(params); }
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

// Habits
export function useHabits(includeArchived?: boolean) { return getHooks().useHabits(includeArchived); }
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

// Objectives (OKRs)
export function useObjectives(options?: { status?: string; workspaceId?: string }) { return getHooks().useObjectives(options); }
export function useCurrentPeriodObjectives() { return getHooks().useCurrentPeriodObjectives(); }
export function useObjectivesDashboard() { return getHooks().useObjectivesDashboard(); }
export function useObjective(objectiveId: string) { return getHooks().useObjective(objectiveId); }
export function useCreateObjective() { return getHooks().useCreateObjective(); }
export function useUpdateObjective() { return getHooks().useUpdateObjective(); }
export function useDeleteObjective() { return getHooks().useDeleteObjective(); }
export function useAddKeyResult() { return getHooks().useAddKeyResult(); }
export function useUpdateKeyResult() { return getHooks().useUpdateKeyResult(); }
export function useDeleteKeyResultShared() { return getHooks().useDeleteKeyResult(); } // Shared version of deleteKeyResult
export function useLinkTaskToKeyResult() { return getHooks().useLinkTaskToKeyResult(); }
export function useUnlinkTaskFromKeyResult() { return getHooks().useUnlinkTaskFromKeyResult(); }

// Custom Fields
export function useCustomFields(projectId: string) { return getHooks().useCustomFields(projectId); }
export function useCreateCustomField() { return getHooks().useCreateCustomField(); }
export function useUpdateCustomField() { return getHooks().useUpdateCustomField(); }
export function useDeleteCustomField() { return getHooks().useDeleteCustomField(); }
export function useTaskCustomValues(taskId: string) { return getHooks().useTaskCustomValues(taskId); }
export function useSetTaskCustomValues() { return getHooks().useSetTaskCustomValues(); }

// Deleted Resources - Workspaces
export function useDeletedWorkspaces() { return getHooks().useDeletedWorkspaces(); }
export function useRestoreWorkspace() { return getHooks().useRestoreWorkspace(); }
export function usePermanentDeleteWorkspace() { return getHooks().usePermanentDeleteWorkspace(); }
export function useArchiveWorkspace() { return getHooks().useArchiveWorkspace(); }
export function useCreateAuditLog() { return getHooks().useCreateAuditLog(); }

// Time Blocking
export function useTimeBlocks(start?: Date | string, end?: Date | string) { return getHooks().useTimeBlocks(start, end); }

// Utilities
export function invalidateAllTasksShared(queryClient: any) { return getHooks().invalidateAllTasks(queryClient); }
export { getHooks as hooks };

// Helper to check if user is authenticated
const isAuthenticated = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("ordo_auth_token");
};

// ============ WEB-SPECIFIC HOOKS ============
// These hooks have web-specific behavior not in the shared package

/**
 * Check if a username is available
 * Web-specific hook for registration flow
 */
export function useCheckUsernameAvailability(
  username: string,
  options?: { enabled?: boolean },
) {
  // Need local queryKeys for this hook
  const localQueryKeys = {
    usernameAvailability: (u: string) => ["auth", "username", u] as const,
  };

  return useQuery({
    queryKey: localQueryKeys.usernameAvailability(username),
    queryFn: () => apiClient.checkUsernameAvailability(username),
    enabled: (options?.enabled ?? true) && username.length >= 3,
    staleTime: 30000, // Consider fresh for 30 seconds
    retry: false,
  });
}

/**
 * Get available tasks (not completed, available for assignment)
 * Web-specific hook for task selector
 */
export function useAvailableTasks(projectId?: string) {
  return useQuery({
    queryKey: ["tasks", "available", projectId],
    queryFn: () => apiClient.getAvailableTasks(projectId),
  });
}

/**
 * Get productivity streak data
 * Web-specific analytics hook
 */
export function useProductivityStreak() {
  return useQuery({
    queryKey: ["analytics", "streak"],
    queryFn: () => apiClient.getProductivityStreak(),
    enabled: isAuthenticated(),
  });
}

/**
 * Get workspace by just the slug (deprecated - use useWorkspaceByUsernameAndSlug)
 * @deprecated Use useWorkspaceBySlug from shared-hooks with username param
 */
export function useWorkspaceBySlugLegacy(slug: string) {
  return useQuery({
    queryKey: ["workspaces", "slug", slug],
    queryFn: () => apiClient.getWorkspaceBySlug(slug),
    enabled: !!slug,
  });
}

/**
 * Get workspace by username and slug
 */
export function useWorkspaceByUsernameAndSlug(username: string, slug: string) {
  return useQuery({
    queryKey: ["workspaces", "user", username, "slug", slug],
    queryFn: () => apiClient.getWorkspaceByUsernameAndSlug(username, slug),
    enabled: !!username && !!slug,
  });
}

// Helper to invalidate all tasks
export const invalidateAllTasksLegacy = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ["tasks"] });
};

// ============ OBJECTIVE QUERY KEYS ============
// Kept for backwards compatibility with components using these directly

export const objectiveQueryKeys = {
  all: ["objectives"] as const,
  dashboard: ["objectives", "dashboard"] as const,
  currentPeriod: ["objectives", "current-period"] as const,
  objective: (id: string) => ["objectives", id] as const,
};

// ============ HABIT QUERY KEYS ============
// Kept for backwards compatibility with components using these directly

export const habitQueryKeys = {
  all: ["habits"] as const,
  today: ["habits", "today"] as const,
  habit: (id: string) => ["habits", id] as const,
  stats: (id: string) => ["habits", id, "stats"] as const,
};

// Force recompile
export const useWorkspaceBySlugTest = () => true;

// ============ DELETED PROJECTS HOOKS ============

/**
 * Get deleted projects for a workspace
 */
export function useDeletedProjects(workspaceId: string) {
  return useQuery({
    queryKey: ["projects", "deleted", workspaceId],
    queryFn: () => apiClient.getDeletedProjects(workspaceId),
    enabled: !!workspaceId,
  });
}

/**
 * Restore a deleted project
 */
export function useRestoreProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => apiClient.restoreProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", "deleted"] });
    },
  });
}

/**
 * Permanently delete a project
 */
export function usePermanentDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => apiClient.permanentDeleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "deleted"] });
    },
  });
}

// ============ DELETED TASKS HOOKS ============

/**
 * Get deleted tasks for a project
 */
export function useDeletedTasks(projectId: string) {
  return useQuery({
    queryKey: ["tasks", "deleted", projectId],
    queryFn: () => apiClient.getDeletedTasks(projectId),
    enabled: !!projectId,
  });
}

/**
 * Restore a deleted task
 */
export function useRestoreTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => apiClient.restoreTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", "deleted"] });
    },
  });
}

/**
 * Permanently delete a task
 */
export function usePermanentDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => apiClient.permanentDeleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "deleted"] });
    },
  });
}

// ============ AI INSIGHTS HOOKS ============

/**
 * Get AI-powered insights
 */
export function useAIInsights(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["ai", "insights"],
    queryFn: () => apiClient.getAIInsights(),
    enabled: (options?.enabled ?? true) && isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============ UPLOAD ATTACHMENT HOOK ============

/**
 * Upload a file attachment
 */
export function useUploadAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, file }: { taskId: string; file: File }) =>
      apiClient.uploadAttachment(file, taskId),
    onSuccess: (_: unknown, { taskId }: { taskId: string; file: File }) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", taskId, "attachments"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", taskId, "details"] });
    },
  });
}

// ============ OBJECTIVES DASHBOARD SUMMARY ============

/**
 * Get objectives dashboard summary (alias for backwards compatibility)
 */
export function useObjectivesDashboardSummary() {
  return useQuery({
    queryKey: objectiveQueryKeys.dashboard,
    queryFn: () => apiClient.getObjectivesDashboardSummary(),
    enabled: isAuthenticated(),
  });
}

// ============ BACKWARDS COMPATIBILITY HOOKS ============

/**
 * Get workspace by slug only (single parameter version)
 * This uses the owner's username from the current user context
 */
export { useWorkspaceBySlugLegacy as useWorkspaceBySlug };

/**
 * Delete a key result (backwards compatible signature with objectiveId)
 * @deprecated Use useDeleteKeyResult from shared-hooks which only needs keyResultId
 */
export function useDeleteKeyResultCompat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ objectiveId, keyResultId }: { objectiveId: string; keyResultId: string }) => {
      // Use the web app's apiClient which requires both objectiveId and keyResultId
      return apiClient.deleteKeyResult(objectiveId, keyResultId);
    },
    onSuccess: (_: unknown, { objectiveId }: { objectiveId: string; keyResultId: string }) => {
      queryClient.invalidateQueries({ queryKey: objectiveQueryKeys.objective(objectiveId) });
      queryClient.invalidateQueries({ queryKey: objectiveQueryKeys.all });
    },
  });
}

// Re-export with original name for backwards compatibility
export { useDeleteKeyResultCompat as useDeleteKeyResult };

