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
    useRegister: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").AuthResponse, Error, RegisterDto, unknown>;
    useLogin: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").AuthResponse, Error, LoginDto, unknown>;
    useLogout: () => import("@tanstack/react-query").UseMutationResult<void, Error, void, unknown>;
    useCurrentUser: () => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").UserResponse, Error>;
    useUpdateProfile: () => import("@tanstack/react-query").UseMutationResult<{
        success: boolean;
        user: import("@ordo-todo/api-client").User;
    }, Error, UpdateProfileDto, unknown>;
    useFullProfile: () => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").UserProfileResponse, Error>;
    useUserPreferences: () => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").UserPreferences | null, Error>;
    useUpdatePreferences: () => import("@tanstack/react-query").UseMutationResult<{
        success: boolean;
        preferences: import("@ordo-todo/api-client").UserPreferences;
    }, Error, import("@ordo-todo/api-client").UpdatePreferencesDto, unknown>;
    useUserIntegrations: () => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").UserIntegration[], Error>;
    useExportData: () => import("@tanstack/react-query").UseMutationResult<Blob, Error, void, unknown>;
    useDeleteAccount: () => import("@tanstack/react-query").UseMutationResult<{
        success: boolean;
        message: string;
    }, Error, void, unknown>;
    useWorkspaces: () => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").Workspace[], Error>;
    useWorkspace: (workspaceId: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").WorkspaceWithMembers, Error>;
    useWorkspaceBySlug: (username: string, slug: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").WorkspaceWithMembers, Error>;
    useCreateWorkspace: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Workspace, Error, CreateWorkspaceDto, unknown>;
    useUpdateWorkspace: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Workspace, Error, {
        workspaceId: string;
        data: UpdateWorkspaceDto;
    }, unknown>;
    useDeleteWorkspace: () => import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
    useAddWorkspaceMember: () => import("@tanstack/react-query").UseMutationResult<{
        success: boolean;
    }, Error, {
        workspaceId: string;
        data: AddMemberDto;
    }, unknown>;
    useRemoveWorkspaceMember: () => import("@tanstack/react-query").UseMutationResult<void, Error, {
        workspaceId: string;
        userId: string;
    }, unknown>;
    useWorkspaceMembers: (workspaceId: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").WorkspaceMember[], Error>;
    useWorkspaceInvitations: (workspaceId: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").WorkspaceInvitation[], Error>;
    useInviteMember: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").WorkspaceInvitation, Error, {
        workspaceId: string;
        data: InviteMemberDto;
    }, unknown>;
    useAcceptInvitation: () => import("@tanstack/react-query").UseMutationResult<{
        success: boolean;
    }, Error, AcceptInvitationDto, unknown>;
    useWorkspaceSettings: (workspaceId: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").WorkspaceSettings, Error>;
    useUpdateWorkspaceSettings: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").WorkspaceSettings, Error, {
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
    }) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").WorkspaceAuditLog[], Error>;
    useWorkflows: (workspaceId: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").Workflow[], Error>;
    useCreateWorkflow: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Workflow, Error, CreateWorkflowDto, unknown>;
    useUpdateWorkflow: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Workflow, Error, {
        workflowId: string;
        data: UpdateWorkflowDto;
    }, unknown>;
    useDeleteWorkflow: () => import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
    useProjects: (workspaceId: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").Project[], Error>;
    useAllProjects: () => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").Project[], Error>;
    useProject: (projectId: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").Project, Error>;
    useCreateProject: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Project, Error, CreateProjectDto, unknown>;
    useUpdateProject: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Project, Error, {
        projectId: string;
        data: UpdateProjectDto;
    }, unknown>;
    useArchiveProject: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Project, Error, string, unknown>;
    useCompleteProject: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Project, Error, string, unknown>;
    useDeleteProject: () => import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
    useTasks: (projectId?: string, tags?: string[], options?: {
        assignedToMe?: boolean;
    }) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").Task[], Error>;
    useTask: (taskId: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").Task, Error>;
    useTaskDetails: (taskId: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").TaskDetails, Error>;
    useCreateTask: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Task, Error, CreateTaskDto, unknown>;
    useUpdateTask: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Task, Error, {
        taskId: string;
        data: UpdateTaskDto;
    }, {
        previousTask: unknown;
        previousTaskDetails: unknown;
    }>;
    useCompleteTask: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Task, Error, string, {
        previousTask: unknown;
        previousTaskDetails: unknown;
    }>;
    useDeleteTask: () => import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
    useCreateSubtask: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Task, Error, {
        parentTaskId: string;
        data: CreateSubtaskDto;
    }, unknown>;
    useShareTask: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    usePublicTask: (token: string) => import("@tanstack/react-query").UseQueryResult<unknown, Error>;
    useTags: (workspaceId: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").Tag[], Error>;
    useTaskTags: (taskId: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").Tag[], Error>;
    useCreateTag: () => import("@tanstack/react-query").UseMutationResult<{
        workspaceId?: string;
    }, Error, CreateTagDto, unknown>;
    useUpdateTag: () => import("@tanstack/react-query").UseMutationResult<{
        workspaceId?: string;
    }, Error, {
        tagId: string;
        data: UpdateTagDto;
    }, unknown>;
    useAssignTagToTask: () => import("@tanstack/react-query").UseMutationResult<{
        success: boolean;
    }, Error, {
        tagId: string;
        taskId: string;
    }, unknown>;
    useRemoveTagFromTask: () => import("@tanstack/react-query").UseMutationResult<void, Error, {
        tagId: string;
        taskId: string;
    }, unknown>;
    useDeleteTag: () => import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
    useActiveTimer: () => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").ActiveTimerResponse, Error>;
    useStartTimer: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").TimeSession, Error, StartTimerDto, unknown>;
    useStopTimer: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").TimeSession, Error, StopTimerDto, unknown>;
    usePauseTimer: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").TimeSession, Error, {
        pauseStartedAt?: Date;
    } | undefined, unknown>;
    useResumeTimer: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").TimeSession, Error, {
        pauseStartedAt: Date;
    }, unknown>;
    useSwitchTask: () => import("@tanstack/react-query").UseMutationResult<{
        oldSession: import("@ordo-todo/api-client").TimeSession;
        newSession: import("@ordo-todo/api-client").TimeSession;
    }, Error, {
        newTaskId: string;
        type?: string;
        splitReason?: string;
    }, unknown>;
    useSessionHistory: (params?: GetSessionsParams) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").PaginatedSessionsResponse, Error>;
    useTimerStats: (params?: {
        startDate?: string;
        endDate?: string;
    }) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").TimerStatsResponse, Error>;
    useTaskTimeSessions: (taskId: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").TaskTimeResponse, Error>;
    useDailyMetrics: (params?: GetDailyMetricsParams) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").DailyMetrics[], Error>;
    useWeeklyMetrics: () => import("@tanstack/react-query").UseQueryResult<{
        date: string;
        pomodorosCount: number;
        focusDuration: number;
        tasksCompletedCount: number;
    }[], Error>;
    useMonthlyMetrics: (params?: {
        monthStart?: string;
    }) => import("@tanstack/react-query").UseQueryResult<unknown, Error>;
    useDateRangeMetrics: (startDate: string, endDate: string) => import("@tanstack/react-query").UseQueryResult<unknown, Error>;
    useDashboardStats: () => import("@tanstack/react-query").UseQueryResult<{
        pomodoros: number;
        tasks: number;
        minutes: number;
        avgPerDay: number;
        trends: {
            pomodoros: number;
            tasks: number;
            minutes: number;
        };
    }, Error>;
    useHeatmapData: () => import("@tanstack/react-query").UseQueryResult<{
        day: number;
        hour: number;
        value: number;
    }[], Error>;
    useProjectDistribution: () => import("@tanstack/react-query").UseQueryResult<{
        name: string;
        value: number;
    }[], Error>;
    useTaskStatusDistribution: () => import("@tanstack/react-query").UseQueryResult<{
        status: string;
        count: number;
    }[], Error>;
    useAIProfile: () => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").AIProfile, Error>;
    useOptimalSchedule: (params?: {
        topN?: number;
    }) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").OptimalScheduleResponse, Error>;
    useTaskDurationPrediction: (params?: {
        title?: string;
        description?: string;
        category?: string;
        priority?: string;
    }) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").PredictDurationResponse, Error>;
    useGenerateWeeklyReport: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").WeeklyReportResponse, Error, string | undefined, unknown>;
    useReports: (params?: {
        scope?: string;
        limit?: number;
        offset?: number;
    }) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").ProductivityReport[], Error>;
    useReport: (id: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").ProductivityReport, Error>;
    useDeleteReport: () => import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
    useTaskComments: (taskId: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").Comment[], Error>;
    useCreateComment: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Comment, Error, CreateCommentDto, unknown>;
    useUpdateComment: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Comment, Error, {
        commentId: string;
        data: UpdateCommentDto;
    }, unknown>;
    useDeleteComment: () => import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
    useTaskAttachments: (taskId: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").Attachment[], Error>;
    useCreateAttachment: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Attachment, Error, CreateAttachmentDto, unknown>;
    useDeleteAttachment: () => import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
    useProjectAttachments: (projectId: string) => import("@tanstack/react-query").UseQueryResult<unknown, Error>;
    useNotifications: () => import("@tanstack/react-query").UseQueryResult<unknown, Error>;
    useUnreadNotificationsCount: () => import("@tanstack/react-query").UseQueryResult<unknown, Error>;
    useMarkNotificationAsRead: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
    useMarkAllNotificationsAsRead: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, void, unknown>;
    useTimeBlocks: (start?: Date | string, end?: Date | string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").TimeBlock[], Error>;
    useHabits: (includeArchived?: boolean) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").Habit[], Error>;
    useTodayHabits: () => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").TodayHabitsResponse, Error>;
    useHabit: (habitId: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").Habit, Error>;
    useHabitStats: (habitId: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").HabitStats, Error>;
    useCreateHabit: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Habit, Error, CreateHabitDto, unknown>;
    useUpdateHabit: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Habit, Error, {
        habitId: string;
        data: UpdateHabitDto;
    }, unknown>;
    useDeleteHabit: () => import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
    useCompleteHabit: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").CompleteHabitResponse, Error, {
        habitId: string;
        data?: CompleteHabitDto;
    }, unknown>;
    useUncompleteHabit: () => import("@tanstack/react-query").UseMutationResult<{
        success: boolean;
        newStreak: number;
    }, Error, string, unknown>;
    usePauseHabit: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Habit, Error, string, unknown>;
    useResumeHabit: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Habit, Error, string, unknown>;
    useObjectives: (options?: {
        status?: string;
        workspaceId?: string;
    }) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").Objective[], Error>;
    useCurrentPeriodObjectives: () => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").Objective[], Error>;
    useObjectivesDashboard: () => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").ObjectiveDashboardSummary, Error>;
    useObjective: (objectiveId: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").Objective, Error>;
    useCreateObjective: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Objective, Error, CreateObjectiveDto, unknown>;
    useUpdateObjective: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Objective, Error, {
        objectiveId: string;
        data: UpdateObjectiveDto;
    }, unknown>;
    useDeleteObjective: () => import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
    useAddKeyResult: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").KeyResult, Error, {
        objectiveId: string;
        data: CreateKeyResultDto;
    }, unknown>;
    useUpdateKeyResult: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").KeyResult, Error, {
        keyResultId: string;
        data: UpdateKeyResultDto;
    }, unknown>;
    useDeleteKeyResult: () => import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
    useLinkTaskToKeyResult: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").KeyResultTask, Error, {
        keyResultId: string;
        data: LinkTaskDto;
    }, unknown>;
    useUnlinkTaskFromKeyResult: () => import("@tanstack/react-query").UseMutationResult<void, Error, {
        keyResultId: string;
        taskId: string;
    }, unknown>;
    useCustomFields: (projectId: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").CustomField[], Error>;
    useCreateCustomField: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").CustomField, Error, {
        projectId: string;
        data: CreateCustomFieldDto;
    }, unknown>;
    useUpdateCustomField: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").CustomField, Error, {
        fieldId: string;
        data: UpdateCustomFieldDto;
        projectId: string;
    }, unknown>;
    useDeleteCustomField: () => import("@tanstack/react-query").UseMutationResult<void, Error, {
        fieldId: string;
        projectId: string;
    }, unknown>;
    useTaskCustomValues: (taskId: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").CustomFieldValue[], Error>;
    useSetTaskCustomValues: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").CustomFieldValue[], Error, {
        taskId: string;
        data: SetMultipleCustomFieldValuesDto;
    }, unknown>;
    invalidateAllTasks: (queryClient: ReturnType<typeof useQueryClient>) => void;
};
/**
 * Type for the hooks object returned by createHooks
 */
export type Hooks = ReturnType<typeof createHooks>;
//# sourceMappingURL=hooks.d.ts.map