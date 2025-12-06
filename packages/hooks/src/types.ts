/**
 * Types for the hooks package
 */

import type { OrdoApiClient } from '@ordo-todo/api-client';

/**
 * API Client interface that the hooks expect.
 * This allows both OrdoApiClient class instances and plain object clients.
 */
export type ApiClient = OrdoApiClient | {
  // Auth
  register: OrdoApiClient['register'];
  login: OrdoApiClient['login'];
  logout: OrdoApiClient['logout'];

  // User
  getCurrentUser: OrdoApiClient['getCurrentUser'];
  getFullProfile: OrdoApiClient['getFullProfile'];
  updateProfile: OrdoApiClient['updateProfile'];
  getPreferences: OrdoApiClient['getPreferences'];
  updatePreferences: OrdoApiClient['updatePreferences'];
  getIntegrations: OrdoApiClient['getIntegrations'];
  exportData: OrdoApiClient['exportData'];
  deleteAccount: OrdoApiClient['deleteAccount'];

  // Workspace
  getWorkspaces: OrdoApiClient['getWorkspaces'];
  getWorkspace: OrdoApiClient['getWorkspace'];
  getWorkspaceBySlug: OrdoApiClient['getWorkspaceBySlug'];
  createWorkspace: OrdoApiClient['createWorkspace'];
  updateWorkspace: OrdoApiClient['updateWorkspace'];
  deleteWorkspace: OrdoApiClient['deleteWorkspace'];
  addWorkspaceMember: OrdoApiClient['addWorkspaceMember'];
  removeWorkspaceMember: OrdoApiClient['removeWorkspaceMember'];

  // Extended workspace methods (optional)
  getWorkspaceMembers?: (id: string) => Promise<unknown>;
  getWorkspaceInvitations?: (id: string) => Promise<unknown>;
  inviteWorkspaceMember?: (id: string, data: unknown) => Promise<unknown>;
  acceptWorkspaceInvitation?: (data: unknown) => Promise<unknown>;
  getWorkspaceSettings?: (id: string) => Promise<unknown>;
  updateWorkspaceSettings?: (id: string, data: unknown) => Promise<unknown>;
  getWorkspaceAuditLogs?: (id: string, params?: unknown) => Promise<unknown>;

  // Workflow
  getWorkflows: OrdoApiClient['getWorkflows'];
  createWorkflow: OrdoApiClient['createWorkflow'];
  updateWorkflow: OrdoApiClient['updateWorkflow'];
  deleteWorkflow: OrdoApiClient['deleteWorkflow'];

  // Project
  getProjects: OrdoApiClient['getProjects'];
  getAllProjects: OrdoApiClient['getAllProjects'];
  getProject: OrdoApiClient['getProject'];
  createProject: OrdoApiClient['createProject'];
  updateProject: OrdoApiClient['updateProject'];
  archiveProject: OrdoApiClient['archiveProject'];
  completeProject: OrdoApiClient['completeProject'];
  deleteProject: OrdoApiClient['deleteProject'];

  // Task
  getTasks: OrdoApiClient['getTasks'];
  getTask: OrdoApiClient['getTask'];
  getTaskDetails: OrdoApiClient['getTaskDetails'];
  createTask: OrdoApiClient['createTask'];
  updateTask: OrdoApiClient['updateTask'];
  completeTask: OrdoApiClient['completeTask'];
  deleteTask: OrdoApiClient['deleteTask'];
  createSubtask: OrdoApiClient['createSubtask'];

  // Task sharing (optional)
  generatePublicToken?: (taskId: string) => Promise<unknown>;
  getTaskByPublicToken?: (token: string) => Promise<unknown>;

  // Tag
  getTags: OrdoApiClient['getTags'];
  getTaskTags: OrdoApiClient['getTaskTags'];
  createTag: OrdoApiClient['createTag'];
  assignTagToTask: OrdoApiClient['assignTagToTask'];
  removeTagFromTask: OrdoApiClient['removeTagFromTask'];
  deleteTag: OrdoApiClient['deleteTag'];

  // Extended tag methods (optional)
  updateTag?: (id: string, data: unknown) => Promise<unknown>;

  // Timer
  startTimer: OrdoApiClient['startTimer'];
  stopTimer: OrdoApiClient['stopTimer'];
  getActiveTimer: OrdoApiClient['getActiveTimer'];
  pauseTimer: OrdoApiClient['pauseTimer'];
  resumeTimer: OrdoApiClient['resumeTimer'];
  switchTask: OrdoApiClient['switchTask'];
  getSessionHistory: OrdoApiClient['getSessionHistory'];
  getTimerStats: OrdoApiClient['getTimerStats'];
  getTaskTimeSessions: OrdoApiClient['getTaskTimeSessions'];

  // Analytics
  getDailyMetrics: OrdoApiClient['getDailyMetrics'];
  getWeeklyMetrics: OrdoApiClient['getWeeklyMetrics'];
  getDashboardStats: OrdoApiClient['getDashboardStats'];
  getHeatmapData: OrdoApiClient['getHeatmapData'];
  getProjectDistribution: OrdoApiClient['getProjectDistribution'];
  getTaskStatusDistribution: OrdoApiClient['getTaskStatusDistribution'];

  // Extended analytics (optional)
  getMonthlyMetrics?: (params?: unknown) => Promise<unknown>;
  getDateRangeMetrics?: (startDate: string, endDate: string) => Promise<unknown>;

  // AI
  getAIProfile: OrdoApiClient['getAIProfile'];
  getOptimalSchedule: OrdoApiClient['getOptimalSchedule'];
  predictTaskDuration: OrdoApiClient['predictTaskDuration'];
  generateWeeklyReport: OrdoApiClient['generateWeeklyReport'];
  getReports: OrdoApiClient['getReports'];
  getReport: OrdoApiClient['getReport'];
  deleteReport: OrdoApiClient['deleteReport'];

  // Comments
  getTaskComments: OrdoApiClient['getTaskComments'];
  createComment: OrdoApiClient['createComment'];
  updateComment: OrdoApiClient['updateComment'];
  deleteComment: OrdoApiClient['deleteComment'];

  // Attachments
  getTaskAttachments: OrdoApiClient['getTaskAttachments'];
  createAttachment: OrdoApiClient['createAttachment'];
  deleteAttachment: OrdoApiClient['deleteAttachment'];

  // Extended attachments (optional)
  getProjectAttachments?: (projectId: string) => Promise<unknown>;

  // Notifications (optional)
  getNotifications?: () => Promise<unknown>;
  getUnreadNotificationsCount?: () => Promise<unknown>;
  markNotificationAsRead?: (id: string) => Promise<unknown>;
  markAllNotificationsAsRead?: () => Promise<unknown>;
};

/**
 * Configuration for creating hooks
 */
export interface CreateHooksConfig {
  /**
   * The API client instance to use for all requests
   */
  apiClient: ApiClient;
}
