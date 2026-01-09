/**
 * Shared React Query Hooks for Ordo-Todo
 *
 * This module provides factory functions to create React Query hooks
 * that can be used across web, mobile, and desktop applications.
 */
import { useQueryClient } from '@tanstack/react-query';
import type { RegisterDto, LoginDto, UpdateProfileDto, CreateWorkspaceDto, UpdateWorkspaceDto, AddMemberDto, CreateWorkflowDto, UpdateWorkflowDto, CreateProjectDto, UpdateProjectDto, CreateTaskDto, UpdateTaskDto, CreateSubtaskDto, CreateTagDto, UpdateTagDto, StartTimerDto, StopTimerDto, GetSessionsParams, GetDailyMetricsParams, CreateCommentDto, UpdateCommentDto, CreateAttachmentDto, InviteMemberDto, AcceptInvitationDto, CreateHabitDto, UpdateHabitDto, CompleteHabitDto, CreateObjectiveDto, UpdateObjectiveDto, CreateKeyResultDto, UpdateKeyResultDto, LinkTaskDto, CreateCustomFieldDto, UpdateCustomFieldDto, SetMultipleCustomFieldValuesDto } from '@ordo-todo/api-client';
import type { CreateHooksConfig } from './types';
/**
 * Creates all React Query hooks bound to a specific API client.
 *
 * @example
 * ```tsx
 * // In your app's hooks file
 * import { createHooks } from '@ordo-todo/hooks';
 * import { apiClient } from './api-client';
 *
 * export const {
 *   useCurrentUser,
 *   useTasks,
 *   useCreateTask,
 *   // ... other hooks
 * } = createHooks({ apiClient });
 * ```
 */
export declare function createHooks(config: CreateHooksConfig): {
    useRegister: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, RegisterDto, unknown>;
    useLogin: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, LoginDto, unknown>;
    useLogout: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, void, unknown>;
    useCurrentUser: () => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useUpdateProfile: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, UpdateProfileDto, unknown>;
    useFullProfile: () => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useUserPreferences: () => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useUpdatePreferences: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, any, unknown>;
    useUserIntegrations: () => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useExportData: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, void, unknown>;
    useDeleteAccount: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, void, unknown>;
    useWorkspaces: () => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useWorkspace: (workspaceId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useWorkspaceBySlug: (username: string, slug: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useCreateWorkspace: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, CreateWorkspaceDto, unknown>;
    useUpdateWorkspace: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        workspaceId: string;
        data: UpdateWorkspaceDto;
    }, unknown>;
    useDeleteWorkspace: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    useDeletedWorkspaces: () => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useRestoreWorkspace: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    usePermanentDeleteWorkspace: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    useArchiveWorkspace: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    useAddWorkspaceMember: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        workspaceId: string;
        data: AddMemberDto;
    }, unknown>;
    useRemoveWorkspaceMember: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        workspaceId: string;
        userId: string;
    }, unknown>;
    useWorkspaceMembers: (workspaceId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useWorkspaceInvitations: (workspaceId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useInviteMember: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        workspaceId: string;
        data: InviteMemberDto;
    }, unknown>;
    useAcceptInvitation: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, AcceptInvitationDto, unknown>;
    useWorkspaceSettings: (workspaceId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useUpdateWorkspaceSettings: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        workspaceId: string;
        data: {
            defaultView?: "LIST" | "KANBAN" | "CALENDAR" | "TIMELINE" | "FOCUS";
            defaultDueTime?: number;
            timezone?: string;
            locale?: string;
        };
    }, unknown>;
    useWorkspaceAuditLogs: (workspaceId: string, params?: {
        limit?: number;
        offset?: number;
    }) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useCreateAuditLog: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        workspaceId: string;
        action: string;
        payload?: Record<string, unknown>;
    }, unknown>;
    useWorkflows: (workspaceId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useCreateWorkflow: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, CreateWorkflowDto, unknown>;
    useUpdateWorkflow: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        workflowId: string;
        data: UpdateWorkflowDto;
    }, unknown>;
    useDeleteWorkflow: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    useProjects: (workspaceId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useAllProjects: () => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useProject: (projectId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useCreateProject: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, CreateProjectDto, unknown>;
    useUpdateProject: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        projectId: string;
        data: UpdateProjectDto;
    }, unknown>;
    useArchiveProject: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    useCompleteProject: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    useDeleteProject: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    useTasks: (projectId?: string, tags?: string[], options?: {
        assignedToMe?: boolean;
    }) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useTask: (taskId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useTaskDetails: (taskId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useCreateTask: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, CreateTaskDto, unknown>;
    useUpdateTask: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        taskId: string;
        data: UpdateTaskDto;
    }, {
        previousTask: any;
        previousTaskDetails: any;
    }>;
    useCompleteTask: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, {
        previousTask: any;
        previousTaskDetails: any;
    }>;
    useDeleteTask: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    useCreateSubtask: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        parentTaskId: string;
        data: CreateSubtaskDto;
    }, unknown>;
    useShareTask: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    usePublicTask: (token: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useTags: (workspaceId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useTaskTags: (taskId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useCreateTag: () => import("@tanstack/react-query").UseMutationResult<{
        workspaceId?: string;
    }, Error, CreateTagDto, unknown>;
    useUpdateTag: () => import("@tanstack/react-query").UseMutationResult<{
        workspaceId?: string;
    }, Error, {
        tagId: string;
        data: UpdateTagDto;
    }, unknown>;
    useAssignTagToTask: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        tagId: string;
        taskId: string;
    }, unknown>;
    useRemoveTagFromTask: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        tagId: string;
        taskId: string;
    }, unknown>;
    useDeleteTag: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    useActiveTimer: () => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useStartTimer: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, StartTimerDto, unknown>;
    useStopTimer: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, StopTimerDto, unknown>;
    usePauseTimer: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        pauseStartedAt?: Date;
    } | undefined, unknown>;
    useResumeTimer: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        pauseStartedAt: Date;
    }, unknown>;
    useSwitchTask: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        newTaskId: string;
        type?: string;
        splitReason?: string;
    }, unknown>;
    useSessionHistory: (params?: GetSessionsParams) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useTimerStats: (params?: {
        startDate?: string;
        endDate?: string;
    }) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useTaskTimeSessions: (taskId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useDailyMetrics: (params?: GetDailyMetricsParams) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useWeeklyMetrics: (params?: {
        weekStart?: string;
    }) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useMonthlyMetrics: (params?: {
        monthStart?: string;
    }) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useDateRangeMetrics: (startDate: string, endDate: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useDashboardStats: () => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useHeatmapData: () => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useProjectDistribution: () => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useTaskStatusDistribution: () => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useAIProfile: () => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useOptimalSchedule: (params?: {
        topN?: number;
    }) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useTaskDurationPrediction: (params?: {
        title?: string;
        description?: string;
        category?: string;
        priority?: string;
    }) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useGenerateWeeklyReport: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string | undefined, unknown>;
    useReports: (params?: {
        scope?: string;
        limit?: number;
        offset?: number;
    }) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useReport: (id: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useDeleteReport: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    useTaskComments: (taskId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useCreateComment: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, CreateCommentDto, unknown>;
    useUpdateComment: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        commentId: string;
        data: UpdateCommentDto;
    }, unknown>;
    useDeleteComment: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    useTaskAttachments: (taskId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useCreateAttachment: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, CreateAttachmentDto, unknown>;
    useDeleteAttachment: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    useProjectAttachments: (projectId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useNotifications: () => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useUnreadNotificationsCount: () => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useMarkNotificationAsRead: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    useMarkAllNotificationsAsRead: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, void, unknown>;
    useTimeBlocks: (start?: Date | string, end?: Date | string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useHabits: (includeArchived?: boolean) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useTodayHabits: () => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useHabit: (habitId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useHabitStats: (habitId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useCreateHabit: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, CreateHabitDto, unknown>;
    useUpdateHabit: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        habitId: string;
        data: UpdateHabitDto;
    }, unknown>;
    useDeleteHabit: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    useCompleteHabit: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        habitId: string;
        data?: CompleteHabitDto;
    }, unknown>;
    useUncompleteHabit: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    usePauseHabit: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    useResumeHabit: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    useObjectives: (options?: {
        status?: string;
        workspaceId?: string;
    }) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useCurrentPeriodObjectives: () => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useObjectivesDashboard: () => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useObjective: (objectiveId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useCreateObjective: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, CreateObjectiveDto, unknown>;
    useUpdateObjective: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        objectiveId: string;
        data: UpdateObjectiveDto;
    }, unknown>;
    useDeleteObjective: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    useAddKeyResult: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        objectiveId: string;
        data: CreateKeyResultDto;
    }, unknown>;
    useUpdateKeyResult: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        keyResultId: string;
        data: UpdateKeyResultDto;
    }, unknown>;
    useDeleteKeyResult: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    useLinkTaskToKeyResult: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        keyResultId: string;
        data: LinkTaskDto;
    }, unknown>;
    useUnlinkTaskFromKeyResult: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        keyResultId: string;
        taskId: string;
    }, unknown>;
    useCustomFields: (projectId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useCreateCustomField: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        projectId: string;
        data: CreateCustomFieldDto;
    }, unknown>;
    useUpdateCustomField: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        fieldId: string;
        data: UpdateCustomFieldDto;
        projectId: string;
    }, unknown>;
    useDeleteCustomField: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        fieldId: string;
        projectId: string;
    }, unknown>;
    useTaskCustomValues: (taskId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useSetTaskCustomValues: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        taskId: string;
        data: SetMultipleCustomFieldValuesDto;
    }, unknown>;
    useNotes: any;
    useNote: any;
    useCreateNote: any;
    useUpdateNote: any;
    useDeleteNote: any;
    invalidateAllTasks: (queryClient: ReturnType<typeof useQueryClient>) => void;
};
/**
 * Type for the hooks object returned by createHooks
 */
export type Hooks = ReturnType<typeof createHooks>;
//# sourceMappingURL=hooks.d.ts.map