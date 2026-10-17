import { createHooks } from '@ordo-todo/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';

/**
 * Shared React Query hooks initialized with the Desktop API client.
 * 
 * All hooks are created from the @ordo-todo/hooks factory.
 * Desktop-specific hooks should be created in separate files.
 */
export const {
    // ============ AUTH ============
    useRegister,
    useLogin,
    useLogout,

    // ============ USER ============
    useCurrentUser,
    useUpdateProfile,
    useFullProfile,
    useUserPreferences,
    useUpdatePreferences,
    useUserIntegrations,
    useExportData,
    useDeleteAccount,

    // ============ WORKSPACE ============
    useWorkspaces,
    useWorkspace,
    useWorkspaceBySlug,
    useCreateWorkspace,
    useUpdateWorkspace,
    useDeleteWorkspace,
    useDeletedWorkspaces,
    useRestoreWorkspace,
    usePermanentDeleteWorkspace,
    useAddWorkspaceMember,
    useRemoveWorkspaceMember,
    useWorkspaceMembers,
    useWorkspaceInvitations,
    useInviteMember,
    useAcceptInvitation,
    useWorkspaceSettings,
    useUpdateWorkspaceSettings,
    useWorkspaceAuditLogs,
    useCreateAuditLog,
    useArchiveWorkspace,

    // ============ WORKFLOW ============
    useWorkflows,
    useCreateWorkflow,
    useUpdateWorkflow,
    useDeleteWorkflow,

    // ============ PROJECT ============
    useProjects,
    useAllProjects,
    useProject,
    useCreateProject,
    useUpdateProject,
    useArchiveProject,
    useCompleteProject,
    useDeleteProject,

    // ============ TASK ============
    useTasks,
    useTask,
    useTaskDetails,
    useCreateTask,
    useUpdateTask,
    useCompleteTask,
    useDeleteTask,
    useShareTask,
    usePublicTask,

    // ============ SUBTASK ============
    useCreateSubtask,

    // ============ TAG ============
    useTags,
    useTaskTags,
    useCreateTag,
    useUpdateTag,
    useDeleteTag,
    useAssignTagToTask,
    useRemoveTagFromTask,

    // ============ TIMER ============
    useActiveTimer,
    useStartTimer,
    useStopTimer,
    usePauseTimer,
    useResumeTimer,
    useSwitchTask,
    useSessionHistory,
    useTimerStats,
    useTaskTimeSessions,

    // ============ ANALYTICS ============
    useDailyMetrics,
    useWeeklyMetrics,
    useMonthlyMetrics,
    useDateRangeMetrics,
    useDashboardStats,
    useHeatmapData,
    useProjectDistribution,
    useTaskStatusDistribution,

    // ============ AI ============
    useAIProfile,
    useOptimalSchedule,
    useTaskDurationPrediction,
    useGenerateWeeklyReport,
    useReports,
    useReport,
    useDeleteReport,

    // ============ HABITS ============
    useHabits,
    useTodayHabits,
    useHabit,
    useHabitStats,
    useCreateHabit,
    useUpdateHabit,
    useDeleteHabit,
    useCompleteHabit,
    useUncompleteHabit,
    usePauseHabit,
    useResumeHabit,

    // ============ OBJECTIVES (OKRs) ============
    useObjectives,
    useCurrentPeriodObjectives,
    useObjectivesDashboard,
    useObjective,
    useCreateObjective,
    useUpdateObjective,
    useDeleteObjective,
    useAddKeyResult,
    useUpdateKeyResult,
    useDeleteKeyResult,
    useLinkTaskToKeyResult,
    useUnlinkTaskFromKeyResult,

    // ============ CUSTOM FIELDS ============
    useCustomFields,
    useCreateCustomField,
    useUpdateCustomField,
    useDeleteCustomField,
    useTaskCustomValues,
    useSetTaskCustomValues,

    // ============ COMMENTS ============
    useTaskComments,
    useCreateComment,
    useUpdateComment,
    useDeleteComment,

    // ============ ATTACHMENTS ============
    useTaskAttachments,
    useCreateAttachment,
    useDeleteAttachment,
    useProjectAttachments,

    // ============ NOTIFICATIONS ============
    useNotifications,
    useUnreadNotificationsCount,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead,

    // ============ TIME BLOCKING ============
    useTimeBlocks,

    // ============ NOTES ============
    useNotes,
    useNote,
    useCreateNote,
    useUpdateNote,
    useDeleteNote,

    // ============ UTILITIES ============
    invalidateAllTasks,

} = createHooks({ apiClient });

// ============ DELETED PROJECTS HOOKS ============

export function useDeletedProjects(workspaceId: string) {
  return useQuery({
    queryKey: ['projects', 'deleted', workspaceId],
    queryFn: () => apiClient.getDeletedProjects(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useRestoreProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => apiClient.restoreProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'deleted'] });
    },
  });
}

export function usePermanentDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => apiClient.permanentDeleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'deleted'] });
    },
  });
}

// ============ DELETED TASKS HOOKS ============

export function useDeletedTasks(projectId: string) {
  return useQuery({
    queryKey: ['tasks', 'deleted', projectId],
    queryFn: () => apiClient.getDeletedTasks(projectId),
    enabled: !!projectId,
  });
}

export function useRestoreTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => apiClient.restoreTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'deleted'] });
    },
  });
}

export function usePermanentDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => apiClient.permanentDeleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'deleted'] });
    },
  });
}

