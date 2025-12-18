"use strict";
/**
 * Centralized Query Keys for React Query
 *
 * All query keys are defined here to ensure consistency across the application
 * and to make cache invalidation easier to manage.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryKeys = void 0;
exports.queryKeys = {
    // ============ Auth & User ============
    currentUser: ['user', 'current'],
    userProfile: ['user', 'profile'],
    userPreferences: ['user', 'preferences'],
    userIntegrations: ['user', 'integrations'],
    // ============ Workspaces ============
    workspaces: ['workspaces'],
    workspace: (id) => ['workspaces', id],
    workspaceMembers: (id) => ['workspaces', id, 'members'],
    workspaceInvitations: (id) => ['workspaces', id, 'invitations'],
    workspaceSettings: (id) => ['workspaces', id, 'settings'],
    workspaceAuditLogs: (id, params) => ['workspaces', id, 'audit-logs', params],
    // ============ Workflows ============
    workflows: (workspaceId) => ['workflows', workspaceId],
    // ============ Projects ============
    projects: (workspaceId) => ['projects', workspaceId],
    allProjects: ['projects', 'all'],
    project: (id) => ['projects', id],
    // ============ Tasks ============
    tasks: (projectId) => projectId ? ['tasks', projectId] : ['tasks'],
    task: (id) => ['tasks', id],
    taskDetails: (id) => ['tasks', id, 'details'],
    publicTask: (token) => ['public-task', token],
    // ============ Tags ============
    tags: (workspaceId) => ['tags', workspaceId],
    taskTags: (taskId) => ['tasks', taskId, 'tags'],
    // ============ Timer ============
    activeTimer: ['timer', 'active'],
    timerHistory: (params) => ['timer', 'history', params],
    timerStats: (params) => ['timer', 'stats', params],
    taskTimeSessions: (taskId) => ['timer', 'task', taskId],
    // ============ Analytics ============
    dailyMetrics: (params) => ['analytics', 'daily', params],
    weeklyMetrics: () => ['analytics', 'weekly'],
    monthlyMetrics: (params) => ['analytics', 'monthly', params],
    dateRangeMetrics: (startDate, endDate) => ['analytics', 'range', startDate, endDate],
    dashboardStats: ['analytics', 'dashboard-stats'],
    heatmapData: ['analytics', 'heatmap'],
    projectDistribution: ['analytics', 'project-distribution'],
    taskStatusDistribution: ['analytics', 'task-status-distribution'],
    // ============ AI ============
    aiProfile: ['ai', 'profile'],
    optimalSchedule: (params) => ['ai', 'optimal-schedule', params],
    taskDurationPrediction: (params) => ['ai', 'predict-duration', params],
    reports: (params) => ['ai', 'reports', params],
    report: (id) => ['ai', 'reports', id],
    // ============ Comments ============
    taskComments: (taskId) => ['tasks', taskId, 'comments'],
    // ============ Attachments ============
    taskAttachments: (taskId) => ['tasks', taskId, 'attachments'],
    projectAttachments: (projectId) => ['projects', projectId, 'attachments'],
    // ============ Notifications ============
    notifications: ['notifications'],
    unreadNotificationsCount: ['notifications', 'unread-count'],
    // ============ Habits ============
    habits: ['habits'],
    todayHabits: ['habits', 'today'],
    habit: (id) => ['habits', id],
    habitStats: (id) => ['habits', id, 'stats'],
    // ============ Time Blocking ============
    timeBlocks: (start, end) => ['time-blocks', start, end],
    // ============ Objectives (OKRs) ============
    objectives: (options) => ['objectives', options],
    currentPeriodObjectives: ['objectives', 'current-period'],
    objectivesDashboard: ['objectives', 'dashboard-summary'],
    objective: (id) => ['objectives', id],
    // ============ Custom Fields ============
    customFields: (projectId) => ['custom-fields', projectId],
    taskCustomValues: (taskId) => ['task-custom-values', taskId],
};
