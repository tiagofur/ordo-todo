import * as _tanstack_react_query from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import * as _ordo_todo_api_client from '@ordo-todo/api-client';
import { RegisterDto, LoginDto, UpdateProfileDto, CreateWorkspaceDto, UpdateWorkspaceDto, AddMemberDto, InviteMemberDto, AcceptInvitationDto, CreateWorkflowDto, UpdateWorkflowDto, CreateProjectDto, UpdateProjectDto, CreateTaskDto, UpdateTaskDto, CreateSubtaskDto, CreateTagDto, UpdateTagDto, StartTimerDto, StopTimerDto, GetSessionsParams, GetDailyMetricsParams, CreateCommentDto, UpdateCommentDto, CreateAttachmentDto, CreateHabitDto, UpdateHabitDto, CompleteHabitDto, CreateObjectiveDto, UpdateObjectiveDto, CreateKeyResultDto, UpdateKeyResultDto, LinkTaskDto, CreateCustomFieldDto, UpdateCustomFieldDto, SetMultipleCustomFieldValuesDto, Note, CreateNoteDto, UpdateNoteDto } from '@ordo-todo/api-client';
import { C as CreateHooksConfig } from './use-username-validation-ut21i5j5.js';
export { A as ApiClient, g as generateUsernameSuggestions, u as useUsernameValidation } from './use-username-validation-ut21i5j5.js';
import { z } from 'zod';

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
declare function createHooks(config: CreateHooksConfig): {
    useRegister: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.AuthResponse, Error, RegisterDto, unknown>;
    useLogin: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.AuthResponse, Error, LoginDto, unknown>;
    useLogout: () => _tanstack_react_query.UseMutationResult<void, Error, void, unknown>;
    useCurrentUser: (options?: {
        enabled?: boolean;
    }) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.UserResponse, Error>;
    useUpdateProfile: () => _tanstack_react_query.UseMutationResult<{
        success: boolean;
        user: _ordo_todo_api_client.User;
    }, Error, UpdateProfileDto, unknown>;
    useFullProfile: () => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.UserProfileResponse, Error>;
    useUserPreferences: () => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.UserPreferences | null, Error>;
    useUpdatePreferences: () => _tanstack_react_query.UseMutationResult<{
        success: boolean;
        preferences: _ordo_todo_api_client.UserPreferences;
    }, Error, _ordo_todo_api_client.UpdatePreferencesDto, unknown>;
    useUserIntegrations: () => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.UserIntegration[], Error>;
    useExportData: () => _tanstack_react_query.UseMutationResult<Blob, Error, void, unknown>;
    useDeleteAccount: () => _tanstack_react_query.UseMutationResult<{
        success: boolean;
        message: string;
    }, Error, void, unknown>;
    useWorkspaces: (options?: {
        enabled?: boolean;
    }) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.Workspace[], Error>;
    useWorkspace: (workspaceId: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.WorkspaceWithMembers, Error>;
    useWorkspaceBySlug: (username: string, slug: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.WorkspaceWithMembers, Error>;
    useCreateWorkspace: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Workspace, Error, CreateWorkspaceDto, unknown>;
    useUpdateWorkspace: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Workspace, Error, {
        workspaceId: string;
        data: UpdateWorkspaceDto;
    }, unknown>;
    useDeleteWorkspace: () => _tanstack_react_query.UseMutationResult<void, Error, string, unknown>;
    useDeletedWorkspaces: () => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.Workspace[], Error>;
    useRestoreWorkspace: () => _tanstack_react_query.UseMutationResult<{
        success: boolean;
    }, Error, string, unknown>;
    usePermanentDeleteWorkspace: () => _tanstack_react_query.UseMutationResult<void, Error, string, unknown>;
    useArchiveWorkspace: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Workspace, Error, string, unknown>;
    useAddWorkspaceMember: () => _tanstack_react_query.UseMutationResult<{
        success: boolean;
    }, Error, {
        workspaceId: string;
        data: AddMemberDto;
    }, unknown>;
    useRemoveWorkspaceMember: () => _tanstack_react_query.UseMutationResult<void, Error, {
        workspaceId: string;
        userId: string;
    }, unknown>;
    useWorkspaceMembers: (workspaceId: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.WorkspaceMember[], Error>;
    useWorkspaceInvitations: (workspaceId: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.WorkspaceInvitation[], Error>;
    useInviteMember: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.WorkspaceInvitation, Error, {
        workspaceId: string;
        data: InviteMemberDto;
    }, unknown>;
    useAcceptInvitation: () => _tanstack_react_query.UseMutationResult<{
        success: boolean;
    }, Error, AcceptInvitationDto, unknown>;
    useWorkspaceSettings: (workspaceId: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.WorkspaceSettings, Error>;
    useUpdateWorkspaceSettings: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.WorkspaceSettings, Error, {
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
    }) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.WorkspaceAuditLogsResponse, Error>;
    useCreateAuditLog: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.WorkspaceAuditLog, Error, {
        workspaceId: string;
        action: string;
        payload?: Record<string, unknown>;
    }, unknown>;
    useWorkflows: (workspaceId: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.Workflow[], Error>;
    useCreateWorkflow: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Workflow, Error, CreateWorkflowDto, unknown>;
    useUpdateWorkflow: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Workflow, Error, {
        workflowId: string;
        data: UpdateWorkflowDto;
    }, unknown>;
    useDeleteWorkflow: () => _tanstack_react_query.UseMutationResult<void, Error, string, unknown>;
    useProjects: (workspaceId: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.Project[], Error>;
    useAllProjects: () => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.Project[], Error>;
    useProject: (projectId: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.Project, Error>;
    useCreateProject: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Project, Error, CreateProjectDto, unknown>;
    useUpdateProject: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Project, Error, {
        projectId: string;
        data: UpdateProjectDto;
    }, unknown>;
    useArchiveProject: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Project, Error, string, unknown>;
    useCompleteProject: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Project, Error, string, unknown>;
    useDeleteProject: () => _tanstack_react_query.UseMutationResult<void, Error, string, unknown>;
    useTasks: (projectId?: string, tags?: string[], options?: {
        assignedToMe?: boolean;
    }) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.Task[], Error>;
    useTask: (taskId: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.Task, Error>;
    useTaskDetails: (taskId: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.TaskDetails, Error>;
    useCreateTask: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Task, Error, CreateTaskDto, unknown>;
    useUpdateTask: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Task, Error, {
        taskId: string;
        data: UpdateTaskDto;
    }, {
        previousTask: unknown;
        previousTaskDetails: unknown;
    }>;
    useCompleteTask: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Task, Error, string, {
        previousTask: unknown;
        previousTaskDetails: unknown;
    }>;
    useDeleteTask: () => _tanstack_react_query.UseMutationResult<void, Error, string, unknown>;
    useCreateSubtask: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Task, Error, {
        parentTaskId: string;
        data: CreateSubtaskDto;
    }, unknown>;
    useShareTask: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.TaskShareResponse, Error, string, unknown>;
    usePublicTask: (token: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.PublicTaskResponse, Error>;
    useTags: (workspaceId: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.Tag[], Error>;
    useTaskTags: (taskId: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.Tag[], Error>;
    useCreateTag: () => _tanstack_react_query.UseMutationResult<{
        workspaceId?: string;
    }, Error, CreateTagDto, unknown>;
    useUpdateTag: () => _tanstack_react_query.UseMutationResult<{
        workspaceId?: string;
    }, Error, {
        tagId: string;
        data: UpdateTagDto;
    }, unknown>;
    useAssignTagToTask: () => _tanstack_react_query.UseMutationResult<{
        success: boolean;
    }, Error, {
        tagId: string;
        taskId: string;
    }, unknown>;
    useRemoveTagFromTask: () => _tanstack_react_query.UseMutationResult<void, Error, {
        tagId: string;
        taskId: string;
    }, unknown>;
    useDeleteTag: () => _tanstack_react_query.UseMutationResult<void, Error, string, unknown>;
    useActiveTimer: () => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.ActiveTimerResponse, Error>;
    useStartTimer: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.TimeSession, Error, StartTimerDto, unknown>;
    useStopTimer: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.TimeSession, Error, StopTimerDto, unknown>;
    usePauseTimer: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.TimeSession, Error, {
        pauseStartedAt?: Date;
    } | undefined, unknown>;
    useResumeTimer: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.TimeSession, Error, {
        pauseStartedAt: Date;
    }, unknown>;
    useSwitchTask: () => _tanstack_react_query.UseMutationResult<{
        oldSession: _ordo_todo_api_client.TimeSession;
        newSession: _ordo_todo_api_client.TimeSession;
    }, Error, {
        newTaskId: string;
        type?: string;
        splitReason?: string;
    }, unknown>;
    useSessionHistory: (params?: GetSessionsParams) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.PaginatedSessionsResponse, Error>;
    useTimerStats: (params?: {
        startDate?: string;
        endDate?: string;
    }) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.TimerStatsResponse, Error>;
    useTaskTimeSessions: (taskId: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.TaskTimeResponse, Error>;
    useDailyMetrics: (params?: GetDailyMetricsParams) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.DailyMetrics[], Error>;
    useWeeklyMetrics: (params?: {
        weekStart?: string;
    }) => _tanstack_react_query.UseQueryResult<{
        date: string;
        pomodorosCount: number;
        focusDuration: number;
        tasksCompletedCount: number;
    }[], Error>;
    useMonthlyMetrics: (params?: {
        monthStart?: string;
    }) => _tanstack_react_query.UseQueryResult<unknown, Error>;
    useDateRangeMetrics: (startDate: string, endDate: string) => _tanstack_react_query.UseQueryResult<unknown, Error>;
    useDashboardStats: () => _tanstack_react_query.UseQueryResult<{
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
    useHeatmapData: () => _tanstack_react_query.UseQueryResult<{
        day: number;
        hour: number;
        value: number;
    }[], Error>;
    useProjectDistribution: () => _tanstack_react_query.UseQueryResult<{
        name: string;
        value: number;
    }[], Error>;
    useTaskStatusDistribution: () => _tanstack_react_query.UseQueryResult<{
        status: string;
        count: number;
    }[], Error>;
    useAIProfile: () => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.AIProfile, Error>;
    useOptimalSchedule: (params?: {
        topN?: number;
    }) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.OptimalScheduleResponse, Error>;
    useTaskDurationPrediction: (params?: {
        title?: string;
        description?: string;
        category?: string;
        priority?: string;
    }) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.PredictDurationResponse, Error>;
    useGenerateWeeklyReport: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.WeeklyReportResponse, Error, string | undefined, unknown>;
    useReports: (params?: {
        scope?: string;
        limit?: number;
        offset?: number;
    }) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.ProductivityReport[], Error>;
    useReport: (id: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.ProductivityReport, Error>;
    useDeleteReport: () => _tanstack_react_query.UseMutationResult<void, Error, string, unknown>;
    useTaskComments: (taskId: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.Comment[], Error>;
    useCreateComment: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Comment, Error, CreateCommentDto, unknown>;
    useUpdateComment: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Comment, Error, {
        commentId: string;
        data: UpdateCommentDto;
    }, unknown>;
    useDeleteComment: () => _tanstack_react_query.UseMutationResult<void, Error, string, unknown>;
    useTaskAttachments: (taskId: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.Attachment[], Error>;
    useCreateAttachment: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Attachment, Error, CreateAttachmentDto, unknown>;
    useDeleteAttachment: () => _tanstack_react_query.UseMutationResult<void, Error, string, unknown>;
    useProjectAttachments: (projectId: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.Attachment[], Error>;
    useNotifications: () => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.Notification[], Error>;
    useUnreadNotificationsCount: () => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.UnreadCountResponse, Error>;
    useMarkNotificationAsRead: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Notification, Error, string, unknown>;
    useMarkAllNotificationsAsRead: () => _tanstack_react_query.UseMutationResult<any, Error, void, unknown>;
    useTimeBlocks: (start?: Date | string, end?: Date | string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.TimeBlock[], Error>;
    useHabits: (includeArchived?: boolean) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.Habit[], Error>;
    useTodayHabits: () => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.TodayHabitsResponse, Error>;
    useHabit: (habitId: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.Habit, Error>;
    useHabitStats: (habitId: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.HabitStats, Error>;
    useCreateHabit: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Habit, Error, CreateHabitDto, unknown>;
    useUpdateHabit: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Habit, Error, {
        habitId: string;
        data: UpdateHabitDto;
    }, unknown>;
    useDeleteHabit: () => _tanstack_react_query.UseMutationResult<void, Error, string, unknown>;
    useCompleteHabit: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.CompleteHabitResponse, Error, {
        habitId: string;
        data?: CompleteHabitDto;
    }, unknown>;
    useUncompleteHabit: () => _tanstack_react_query.UseMutationResult<{
        success: boolean;
        newStreak: number;
    }, Error, string, unknown>;
    usePauseHabit: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Habit, Error, string, unknown>;
    useResumeHabit: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Habit, Error, string, unknown>;
    useObjectives: (options?: {
        status?: string;
        workspaceId?: string;
    }) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.Objective[], Error>;
    useCurrentPeriodObjectives: () => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.Objective[], Error>;
    useObjectivesDashboard: () => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.ObjectiveDashboardSummary, Error>;
    useObjective: (objectiveId: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.Objective, Error>;
    useCreateObjective: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Objective, Error, CreateObjectiveDto, unknown>;
    useUpdateObjective: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.Objective, Error, {
        objectiveId: string;
        data: UpdateObjectiveDto;
    }, unknown>;
    useDeleteObjective: () => _tanstack_react_query.UseMutationResult<void, Error, string, unknown>;
    useAddKeyResult: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.KeyResult, Error, {
        objectiveId: string;
        data: CreateKeyResultDto;
    }, unknown>;
    useUpdateKeyResult: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.KeyResult, Error, {
        keyResultId: string;
        data: UpdateKeyResultDto;
    }, unknown>;
    useDeleteKeyResult: () => _tanstack_react_query.UseMutationResult<void, Error, string, unknown>;
    useLinkTaskToKeyResult: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.KeyResultTask, Error, {
        keyResultId: string;
        data: LinkTaskDto;
    }, unknown>;
    useUnlinkTaskFromKeyResult: () => _tanstack_react_query.UseMutationResult<void, Error, {
        keyResultId: string;
        taskId: string;
    }, unknown>;
    useCustomFields: (projectId: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.CustomField[], Error>;
    useCreateCustomField: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.CustomField, Error, {
        projectId: string;
        data: CreateCustomFieldDto;
    }, unknown>;
    useUpdateCustomField: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.CustomField, Error, {
        fieldId: string;
        data: UpdateCustomFieldDto;
        projectId: string;
    }, unknown>;
    useDeleteCustomField: () => _tanstack_react_query.UseMutationResult<void, Error, {
        fieldId: string;
        projectId: string;
    }, unknown>;
    useTaskCustomValues: (taskId: string) => _tanstack_react_query.UseQueryResult<_ordo_todo_api_client.CustomFieldValue[], Error>;
    useSetTaskCustomValues: () => _tanstack_react_query.UseMutationResult<_ordo_todo_api_client.CustomFieldValue[], Error, {
        taskId: string;
        data: SetMultipleCustomFieldValuesDto;
    }, unknown>;
    useNotes: (workspaceId: string) => _tanstack_react_query.UseQueryResult<Note[], Error>;
    useNote: (id: string) => _tanstack_react_query.UseQueryResult<Note, Error>;
    useCreateNote: () => _tanstack_react_query.UseMutationResult<Note, Error, CreateNoteDto, unknown>;
    useUpdateNote: () => _tanstack_react_query.UseMutationResult<Note, Error, {
        id: string;
        data: UpdateNoteDto;
    }, unknown>;
    useDeleteNote: () => _tanstack_react_query.UseMutationResult<void, Error, string, unknown>;
    invalidateAllTasks: (queryClient: ReturnType<typeof useQueryClient>) => void;
};
/**
 * Type for the hooks object returned by createHooks
 */
type Hooks = ReturnType<typeof createHooks>;

/**
 * Centralized Query Keys for React Query
 *
 * All query keys are defined here to ensure consistency across the application
 * and to make cache invalidation easier to manage.
 */

declare const queryKeys: {
    readonly currentUser: readonly ["user", "current"];
    readonly userProfile: readonly ["user", "profile"];
    readonly userPreferences: readonly ["user", "preferences"];
    readonly userIntegrations: readonly ["user", "integrations"];
    readonly workspaces: readonly ["workspaces"];
    readonly deletedWorkspaces: readonly ["workspaces", "deleted"];
    readonly workspace: (id: string) => readonly ["workspaces", string];
    readonly workspaceMembers: (id: string) => readonly ["workspaces", string, "members"];
    readonly workspaceInvitations: (id: string) => readonly ["workspaces", string, "invitations"];
    readonly workspaceSettings: (id: string) => readonly ["workspaces", string, "settings"];
    readonly workspaceAuditLogs: (id: string, params?: {
        limit?: number;
        offset?: number;
    }) => readonly ["workspaces", string, "audit-logs", {
        limit?: number;
        offset?: number;
    } | undefined];
    readonly workflows: (workspaceId: string) => readonly ["workflows", string];
    readonly projects: (workspaceId: string) => readonly ["projects", string];
    readonly allProjects: readonly ["projects", "all"];
    readonly project: (id: string) => readonly ["projects", string];
    readonly projectBySlugs: (workspaceSlug: string, projectSlug: string) => readonly ["projects", "by-slug", string, string];
    readonly tasks: (projectId?: string, tags?: string[], assignedToMe?: boolean) => readonly ["tasks", {
        readonly projectId: string | undefined;
        readonly tags: string[] | undefined;
        readonly assignedToMe: boolean | undefined;
    }];
    readonly task: (id: string) => readonly ["tasks", string];
    readonly taskDetails: (id: string) => readonly ["tasks", string, "details"];
    readonly publicTask: (token: string) => readonly ["public-task", string];
    readonly tags: (workspaceId: string) => readonly ["tags", string];
    readonly taskTags: (taskId: string) => readonly ["tasks", string, "tags"];
    readonly activeTimer: readonly ["timer", "active"];
    readonly timerHistory: (params?: GetSessionsParams) => readonly ["timer", "history", GetSessionsParams | undefined];
    readonly timerStats: (params?: {
        startDate?: string;
        endDate?: string;
    }) => readonly ["timer", "stats", {
        startDate?: string;
        endDate?: string;
    } | undefined];
    readonly taskTimeSessions: (taskId: string) => readonly ["timer", "task", string];
    readonly dailyMetrics: (params?: GetDailyMetricsParams) => readonly ["analytics", "daily", GetDailyMetricsParams | undefined];
    readonly weeklyMetrics: (params?: {
        weekStart?: string;
    }) => readonly ["analytics", "weekly", {
        weekStart?: string;
    } | undefined];
    readonly monthlyMetrics: (params?: {
        monthStart?: string;
    }) => readonly ["analytics", "monthly", {
        monthStart?: string;
    } | undefined];
    readonly dateRangeMetrics: (startDate: string, endDate: string) => readonly ["analytics", "range", string, string];
    readonly dashboardStats: readonly ["analytics", "dashboard-stats"];
    readonly heatmapData: readonly ["analytics", "heatmap"];
    readonly projectDistribution: readonly ["analytics", "project-distribution"];
    readonly taskStatusDistribution: readonly ["analytics", "task-status-distribution"];
    readonly aiProfile: readonly ["ai", "profile"];
    readonly optimalSchedule: (params?: {
        topN?: number;
    }) => readonly ["ai", "optimal-schedule", {
        topN?: number;
    } | undefined];
    readonly taskDurationPrediction: (params?: {
        title?: string;
        description?: string;
        category?: string;
        priority?: string;
    }) => readonly ["ai", "predict-duration", {
        title?: string;
        description?: string;
        category?: string;
        priority?: string;
    } | undefined];
    readonly reports: (params?: {
        scope?: string;
        limit?: number;
        offset?: number;
    }) => readonly ["ai", "reports", {
        scope?: string;
        limit?: number;
        offset?: number;
    } | undefined];
    readonly report: (id: string) => readonly ["ai", "reports", string];
    readonly taskComments: (taskId: string) => readonly ["tasks", string, "comments"];
    readonly taskAttachments: (taskId: string) => readonly ["tasks", string, "attachments"];
    readonly projectAttachments: (projectId: string) => readonly ["projects", string, "attachments"];
    readonly notifications: readonly ["notifications"];
    readonly unreadNotificationsCount: readonly ["notifications", "unread-count"];
    readonly habits: readonly ["habits"];
    readonly todayHabits: readonly ["habits", "today"];
    readonly habit: (id: string) => readonly ["habits", string];
    readonly habitStats: (id: string) => readonly ["habits", string, "stats"];
    readonly timeBlocks: (start?: string, end?: string) => readonly ["time-blocks", string | undefined, string | undefined];
    readonly objectives: (options?: {
        status?: string;
        workspaceId?: string;
    }) => readonly ["objectives", {
        status?: string;
        workspaceId?: string;
    } | undefined];
    readonly currentPeriodObjectives: readonly ["objectives", "current-period"];
    readonly objectivesDashboard: readonly ["objectives", "dashboard-summary"];
    readonly objective: (id: string) => readonly ["objectives", string];
    readonly customFields: (projectId: string) => readonly ["custom-fields", string];
    readonly taskCustomValues: (taskId: string) => readonly ["task-custom-values", string];
    readonly notes: (workspaceId: string) => readonly ["notes", string];
    readonly note: (id: string) => readonly ["notes", "detail", string];
};

/**
 * Shared useTimer Hook for Ordo-Todo
 *
 * A React hook for managing Pomodoro and continuous timer functionality.
 * Can be used across web, mobile, and desktop applications.
 */
/**
 * Format time for timer display (MM:SS)
 * Note: Inlined from @ordo-todo/core to avoid importing Node.js dependencies
 */
declare function formatTimerDisplay(seconds: number): string;
type TimerMode = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';
type TimerType = 'POMODORO' | 'CONTINUOUS';
interface TimerConfig {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    pomodorosUntilLongBreak: number;
}
interface UseTimerProps {
    type: TimerType;
    config: TimerConfig;
    onSessionComplete?: (data: SessionData) => void;
}
interface SessionData {
    startedAt: Date;
    endedAt: Date;
    duration: number;
    mode: TimerMode;
    wasCompleted: boolean;
    wasInterrupted: boolean;
    pauseCount: number;
    totalPauseTime: number;
}
interface UseTimerReturn {
    isRunning: boolean;
    isPaused: boolean;
    timeLeft: number;
    mode: TimerMode;
    completedPomodoros: number;
    pauseCount: number;
    totalPauseTime: number;
    start: () => void;
    pause: () => void;
    stop: (wasCompleted?: boolean) => void;
    reset: () => void;
    skipToNext: () => void;
    split: () => void;
    formatTime: (seconds: number) => string;
    getProgress: () => number;
}
declare function useTimer({ type, config, onSessionComplete, }: UseTimerProps): UseTimerReturn;

/**
 * Task limits
 */
declare const TASK_LIMITS: {
    readonly TITLE_MIN_LENGTH: 1;
    readonly TITLE_MAX_LENGTH: 200;
    readonly DESCRIPTION_MAX_LENGTH: 5000;
    readonly MIN_ESTIMATED_MINUTES: 1;
    readonly MAX_ESTIMATED_MINUTES: 480;
    readonly MAX_TAGS_PER_TASK: 10;
};
/**
 * Project limits
 */
declare const PROJECT_LIMITS: {
    readonly NAME_MIN_LENGTH: 1;
    readonly NAME_MAX_LENGTH: 100;
    readonly DESCRIPTION_MAX_LENGTH: 2000;
};
/**
 * Priority values
 */
declare const PRIORITY_VALUES: readonly ["LOW", "MEDIUM", "HIGH", "URGENT"];
/**
 * Task status values
 */
declare const TASK_STATUS_VALUES: readonly ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
/**
 * Color constants
 */
declare const PROJECT_COLORS: readonly ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#6B7280"];
/**
 * Workspace limits
 */
declare const WORKSPACE_LIMITS: {
    readonly NAME_MIN_LENGTH: 1;
    readonly NAME_MAX_LENGTH: 100;
    readonly DESCRIPTION_MAX_LENGTH: 500;
};
/**
 * Member roles
 */
declare const MEMBER_ROLES: readonly ["OWNER", "ADMIN", "MEMBER", "VIEWER"];
/**
 * Schemas inlined from @ordo-todo/core to avoid client-side bundling issues
 */
declare const taskBaseSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodEnum<{
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
        URGENT: "URGENT";
    }>;
    status: z.ZodOptional<z.ZodEnum<{
        TODO: "TODO";
        IN_PROGRESS: "IN_PROGRESS";
        COMPLETED: "COMPLETED";
        CANCELLED: "CANCELLED";
    }>>;
    dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    scheduledDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    scheduledTime: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isTimeBlocked: z.ZodOptional<z.ZodBoolean>;
    estimatedMinutes: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodNaN]>>>, z.ZodTransform<number | null | undefined, number | null | undefined>>;
}, z.core.$strip>;
declare const createTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodEnum<{
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
        URGENT: "URGENT";
    }>;
    status: z.ZodOptional<z.ZodEnum<{
        TODO: "TODO";
        IN_PROGRESS: "IN_PROGRESS";
        COMPLETED: "COMPLETED";
        CANCELLED: "CANCELLED";
    }>>;
    dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    scheduledDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    scheduledTime: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isTimeBlocked: z.ZodOptional<z.ZodBoolean>;
    estimatedMinutes: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodNaN]>>>, z.ZodTransform<number | null | undefined, number | null | undefined>>;
    projectId: z.ZodString;
    parentTaskId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    assigneeId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    tagIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
declare const projectBaseSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const createProjectSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodString;
    workflowId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    endDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
declare const inviteMemberSchema: z.ZodObject<{
    email: z.ZodString;
    role: z.ZodEnum<{
        OWNER: "OWNER";
        ADMIN: "ADMIN";
        MEMBER: "MEMBER";
        VIEWER: "VIEWER";
    }>;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;

export { CreateHooksConfig, type Hooks, MEMBER_ROLES, PRIORITY_VALUES, PROJECT_COLORS, PROJECT_LIMITS, type SessionData, TASK_LIMITS, TASK_STATUS_VALUES, type TimerConfig, type TimerMode, type TimerType, type UseTimerProps, type UseTimerReturn, WORKSPACE_LIMITS, createHooks, createProjectSchema, createTaskSchema, formatTimerDisplay, inviteMemberSchema, projectBaseSchema, queryKeys, taskBaseSchema, useTimer };
