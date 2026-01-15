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

import { createHooks, queryKeys, type ApiClient, type Hooks } from '@ordo-todo/hooks';
import { apiClient } from './api-client';
import type { QueryClient } from '@tanstack/react-query';

// Re-export query keys for direct use
export { queryKeys };

// Lazy-initialized hooks to avoid "No QueryClient set" errors
let _hooks: ReturnType<typeof createHooks> | null = null;

function getHooks(): Hooks {
    if (!_hooks) {
        _hooks = createHooks({ apiClient: apiClient as unknown as ApiClient });
    }
    return _hooks as Hooks;
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

// Productivity streak - implemented locally since not in shared hooks
import { useQuery } from '@tanstack/react-query';

export function useProductivityStreak() {
    return useQuery({
        queryKey: ['analytics', 'streak'],
        queryFn: () => apiClient.getProductivityStreak(),
    });
}

export function useAIInsights(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ["ai", "insights"],
        queryFn: () => apiClient.getAIInsights(),
        enabled: options?.enabled ?? true,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

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

// ============ NOTES HOOKS ============
export function useNotes(workspaceId: string) { return getHooks().useNotes(workspaceId); }
export function useNote(noteId: string) { return getHooks().useNote(noteId); }
export function useCreateNote() { return getHooks().useCreateNote(); }
export function useUpdateNote() { return getHooks().useUpdateNote(); }
export function useDeleteNote() { return getHooks().useDeleteNote(); }

// ============ CREATOR OS - IDEAS ============
export function useIdeas(params?: { status?: string; search?: string; page?: number; limit?: number }) { return getHooks().useIdeas(params); }
export function useIdea(id: string) { return getHooks().useIdea(id); }
export function useCreateIdea() { return getHooks().useCreateIdea(); }
export function useUpdateIdea() { return getHooks().useUpdateIdea(); }
export function useDeleteIdea() { return getHooks().useDeleteIdea(); }
export function useArchiveIdea() { return getHooks().useArchiveIdea(); }

// ============ CREATOR OS - CONTENT PIECES ============
export function useContentPieces(params?: { status?: string; seriesId?: string; search?: string; page?: number; limit?: number }) {
    return getHooks().useContentPieces(params);
}
export function useContentPiece(id: string) { return getHooks().useContentPiece(id); }
export function useContentPipeline() { return getHooks().useContentPipeline(); }
export function useCreateContentPiece() { return getHooks().useCreateContentPiece(); }
export function usePromoteFromIdea() { return getHooks().usePromoteFromIdea(); }
export function useUpdateContentPiece() { return getHooks().useUpdateContentPiece(); }
export function useUpdateContentStatus() { return getHooks().useUpdateContentStatus(); }
export function useDeleteContentPiece() { return getHooks().useDeleteContentPiece(); }

// ============ CREATOR OS - SERIES ============
export function useSeries() { return getHooks().useSeries(); }
export function useSeriesById(id: string) { return getHooks().useSeriesById(id); }
export function useCreateSeries() { return getHooks().useCreateSeries(); }

// ============ CREATOR OS - PUBLISHING ============
export function useCreateSocialPost() { return getHooks().useCreateSocialPost(); }
export function useBulkSchedulePosts() { return getHooks().useBulkSchedulePosts(); }
export function useScheduledPosts(params: any) { return getHooks().useScheduledPosts(params); }
export function usePublishingCalendar(startDate: string, endDate: string) { return getHooks().usePublishingCalendar(startDate, endDate); }
export function usePostsByContentPiece(contentPieceId: string) { return getHooks().usePostsByContentPiece(contentPieceId); }
export function useSocialPost(id: string) { return getHooks().useSocialPost(id); }
export function useUpdateSocialPost() { return getHooks().useUpdateSocialPost(); }
export function useSchedulePost() { return getHooks().useSchedulePost(); }
export function useUnschedulePost() { return getHooks().useUnschedulePost(); }
export function useDeleteSocialPost() { return getHooks().useDeleteSocialPost(); }

// ============ UTILITIES ============
export function invalidateAllTasks(queryClient: QueryClient) { return getHooks().invalidateAllTasks(queryClient); }

// ============ DASHBOARD COMPOSITE HOOK ============
import { useMemo } from 'react';
import { isToday } from 'date-fns';

export interface DashboardStats {
    tasksCompleted: number;
    pendingTasks: number;
    todayTasks: number;
}

export interface DashboardStreak {
    currentStreak: number;
    longestStreak: number;
}

export interface DashboardHabitsSummary {
    total: number;
    completed: number;
    remaining: number;
    percentage: number;
}

export interface DashboardData {
    stats: DashboardStats;
    streak: DashboardStreak;
    habits: DashboardHabitsSummary;
    isLoading: boolean;
    refetch: () => Promise<void>;
}

/**
 * useDashboardData - Aggregates all dashboard-related data for Mobile
 * 
 * This is a simplified version that uses the available hooks.
 */
export function useDashboardData(): DashboardData {
    const hooks = getHooks();

    const tasksQuery = hooks.useTasks();
    const habitsQuery = hooks.useTodayHabits();
    // Note: useProductivityStreak is defined locally below, not part of getHooks()
    const streakQuery = useProductivityStreak();

    // Process tasks
    const tasks = tasksQuery.data || [];
    const stats = useMemo<DashboardStats>(() => {
        const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED').length;
        const pendingTasks = tasks.filter((t: any) => t.status !== 'COMPLETED').length;
        const todayTasks = tasks.filter((t: any) => {
            if (t.dueDate) {
                return isToday(new Date(t.dueDate));
            }
            return false;
        }).length;

        return {
            tasksCompleted: completedTasks,
            pendingTasks,
            todayTasks,
        };
    }, [tasks]);

    // Process streak
    const streak = useMemo<DashboardStreak>(() => ({
        currentStreak: streakQuery.data?.currentStreak ?? 0,
        longestStreak: streakQuery.data?.longestStreak ?? 0,
    }), [streakQuery.data]);

    // Process habits
    const habits = useMemo<DashboardHabitsSummary>(() => {
        const habitsData = Array.isArray(habitsQuery.data) ? habitsQuery.data : [];
        const completed = habitsData.filter((h: { completions?: unknown[] }) =>
            h.completions && h.completions.length > 0
        ).length;
        const total = habitsData.length;

        return {
            total,
            completed,
            remaining: total - completed,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
    }, [habitsQuery.data]);

    const isLoading = tasksQuery.isLoading || habitsQuery.isLoading || streakQuery.isLoading;

    const refetch = async () => {
        await Promise.all([
            tasksQuery.refetch(),
            habitsQuery.refetch(),
            streakQuery.refetch(),
        ]);
    };

    return {
        stats,
        streak,
        habits,
        isLoading,
        refetch,
    };
}

// Export the lazy getter for dynamic access
export { getHooks as hooks };

