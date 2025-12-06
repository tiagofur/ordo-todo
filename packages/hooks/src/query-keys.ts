/**
 * Centralized Query Keys for React Query
 *
 * All query keys are defined here to ensure consistency across the application
 * and to make cache invalidation easier to manage.
 */

import type { GetDailyMetricsParams } from '@ordo-todo/api-client';

export const queryKeys = {
  // ============ Auth & User ============
  currentUser: ['user', 'current'] as const,
  userProfile: ['user', 'profile'] as const,
  userPreferences: ['user', 'preferences'] as const,
  userIntegrations: ['user', 'integrations'] as const,

  // ============ Workspaces ============
  workspaces: ['workspaces'] as const,
  workspace: (id: string) => ['workspaces', id] as const,
  workspaceMembers: (id: string) => ['workspaces', id, 'members'] as const,
  workspaceInvitations: (id: string) => ['workspaces', id, 'invitations'] as const,
  workspaceSettings: (id: string) => ['workspaces', id, 'settings'] as const,
  workspaceAuditLogs: (id: string, params?: { limit?: number; offset?: number }) =>
    ['workspaces', id, 'audit-logs', params] as const,

  // ============ Workflows ============
  workflows: (workspaceId: string) => ['workflows', workspaceId] as const,

  // ============ Projects ============
  projects: (workspaceId: string) => ['projects', workspaceId] as const,
  allProjects: ['projects', 'all'] as const,
  project: (id: string) => ['projects', id] as const,

  // ============ Tasks ============
  tasks: (projectId?: string) => projectId ? ['tasks', projectId] as const : ['tasks'] as const,
  task: (id: string) => ['tasks', id] as const,
  taskDetails: (id: string) => ['tasks', id, 'details'] as const,
  publicTask: (token: string) => ['public-task', token] as const,

  // ============ Tags ============
  tags: (workspaceId: string) => ['tags', workspaceId] as const,
  taskTags: (taskId: string) => ['tasks', taskId, 'tags'] as const,

  // ============ Timer ============
  activeTimer: ['timer', 'active'] as const,
  timerHistory: (params?: {
    taskId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    completedOnly?: boolean;
  }) => ['timer', 'history', params] as const,
  timerStats: (params?: { startDate?: string; endDate?: string }) =>
    ['timer', 'stats', params] as const,
  taskTimeSessions: (taskId: string) => ['timer', 'task', taskId] as const,

  // ============ Analytics ============
  dailyMetrics: (params?: GetDailyMetricsParams) => ['analytics', 'daily', params] as const,
  weeklyMetrics: (params?: { weekStart?: string }) => ['analytics', 'weekly', params] as const,
  monthlyMetrics: (params?: { monthStart?: string }) => ['analytics', 'monthly', params] as const,
  dateRangeMetrics: (startDate: string, endDate: string) =>
    ['analytics', 'range', startDate, endDate] as const,
  dashboardStats: ['analytics', 'dashboard-stats'] as const,
  heatmapData: ['analytics', 'heatmap'] as const,
  projectDistribution: ['analytics', 'project-distribution'] as const,
  taskStatusDistribution: ['analytics', 'task-status-distribution'] as const,

  // ============ AI ============
  aiProfile: ['ai', 'profile'] as const,
  optimalSchedule: (params?: { topN?: number }) => ['ai', 'optimal-schedule', params] as const,
  taskDurationPrediction: (params?: {
    title?: string;
    description?: string;
    category?: string;
    priority?: string;
  }) => ['ai', 'predict-duration', params] as const,
  reports: (params?: { scope?: string; limit?: number; offset?: number }) =>
    ['ai', 'reports', params] as const,
  report: (id: string) => ['ai', 'reports', id] as const,

  // ============ Comments ============
  taskComments: (taskId: string) => ['tasks', taskId, 'comments'] as const,

  // ============ Attachments ============
  taskAttachments: (taskId: string) => ['tasks', taskId, 'attachments'] as const,
  projectAttachments: (projectId: string) => ['projects', projectId, 'attachments'] as const,

  // ============ Notifications ============
  notifications: ['notifications'] as const,
  unreadNotificationsCount: ['notifications', 'unread-count'] as const,
} as const;
