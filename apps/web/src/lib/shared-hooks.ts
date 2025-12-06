/**
 * Shared Hooks Bridge
 *
 * This file creates the React Query hooks bound to the web app's API client.
 * It re-exports all hooks from the shared package for easy consumption.
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

import { createHooks, queryKeys } from '@ordo-todo/hooks';
import { apiClient } from './api-client';

// Create all hooks bound to this app's API client
const hooks = createHooks({ apiClient });

// Re-export query keys for direct use
export { queryKeys };

// Re-export all hooks individually for tree-shaking
export const {
  // Auth
  useRegister,
  useLogin,
  useLogout,

  // User
  useCurrentUser,
  useUpdateProfile,
  useFullProfile,
  useUserPreferences,
  useUpdatePreferences,
  useUserIntegrations,
  useExportData,
  useDeleteAccount,

  // Workspace
  useWorkspaces,
  useWorkspace,
  useWorkspaceBySlug,
  useCreateWorkspace,
  useUpdateWorkspace,
  useDeleteWorkspace,
  useAddWorkspaceMember,
  useRemoveWorkspaceMember,
  useWorkspaceMembers,
  useWorkspaceInvitations,
  useInviteMember,
  useAcceptInvitation,
  useWorkspaceSettings,
  useUpdateWorkspaceSettings,
  useWorkspaceAuditLogs,

  // Workflow
  useWorkflows,
  useCreateWorkflow,
  useUpdateWorkflow,
  useDeleteWorkflow,

  // Project
  useProjects,
  useAllProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useArchiveProject,
  useCompleteProject,
  useDeleteProject,

  // Task
  useTasks,
  useTask,
  useTaskDetails,
  useCreateTask,
  useUpdateTask,
  useCompleteTask,
  useDeleteTask,
  useCreateSubtask,
  useShareTask,
  usePublicTask,

  // Tag
  useTags,
  useTaskTags,
  useCreateTag,
  useUpdateTag,
  useAssignTagToTask,
  useRemoveTagFromTask,
  useDeleteTag,

  // Timer
  useActiveTimer,
  useStartTimer,
  useStopTimer,
  usePauseTimer,
  useResumeTimer,
  useSwitchTask,
  useSessionHistory,
  useTimerStats,
  useTaskTimeSessions,

  // Analytics
  useDailyMetrics,
  useWeeklyMetrics,
  useMonthlyMetrics,
  useDateRangeMetrics,
  useDashboardStats,
  useHeatmapData,
  useProjectDistribution,
  useTaskStatusDistribution,

  // AI
  useAIProfile,
  useOptimalSchedule,
  useTaskDurationPrediction,
  useGenerateWeeklyReport,
  useReports,
  useReport,
  useDeleteReport,

  // Comments
  useTaskComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,

  // Attachments
  useTaskAttachments,
  useCreateAttachment,
  useDeleteAttachment,
  useProjectAttachments,

  // Notifications
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,

  // Utilities
  invalidateAllTasks,
} = hooks;

// Also export the hooks object for dynamic access
export { hooks };
