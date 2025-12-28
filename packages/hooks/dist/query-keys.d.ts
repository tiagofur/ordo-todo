/**
 * Centralized Query Keys for React Query
 *
 * All query keys are defined here to ensure consistency across the application
 * and to make cache invalidation easier to manage.
 */
import type { GetDailyMetricsParams, GetSessionsParams } from '@ordo-todo/api-client';
export declare const queryKeys: {
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
    readonly tasks: (projectId?: string) => readonly ["tasks", string] | readonly ["tasks"];
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
    readonly weeklyMetrics: () => readonly ["analytics", "weekly"];
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
};
//# sourceMappingURL=query-keys.d.ts.map