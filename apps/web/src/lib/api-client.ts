import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config } from '@/config';
import type {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  AddMemberDto,
  CreateWorkflowDto,
  UpdateWorkflowDto,
  CreateProjectDto,
  UpdateProjectDto,
  CreateTaskDto,
  UpdateTaskDto,
  CreateSubtaskDto,
  CreateTagDto,
  UpdateTagDto,
  StartTimerDto,
  StopTimerDto,
  GetDailyMetricsParams,
  CreateCommentDto,
  UpdateCommentDto,
  CreateAttachmentDto,
  InviteMemberDto,
  AcceptInvitationDto,
  RefreshTokenDto,
  AuthResponse,
  // Chat
  // Chat
  CreateConversationDto,
  SendMessageDto,
  // Objectives
  CreateObjectiveDto,
  UpdateObjectiveDto,
  CreateKeyResultDto,
  UpdateKeyResultDto,
  LinkTaskDto,
} from '@ordo-todo/api-client';
import { useSyncStore } from '@/stores/sync-store';
import { PendingActionType } from '@/lib/offline-storage';
import { logger } from '@/lib/logger';

const axiosInstance = axios.create({
  baseURL: config.api.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Extended request config to track offline queueing metadata
interface OfflineRequestConfig extends InternalAxiosRequestConfig {
  _offlineAction?: {
    type: PendingActionType;
    entityType: 'task' | 'project' | 'comment' | 'timer';
    entityId?: string;
    skipQueue?: boolean;
  };
}

/**
 * Check if a request can be queued for offline sync
 */
function canQueueRequest(config: OfflineRequestConfig): boolean {
  // Skip if explicitly marked
  if (config._offlineAction?.skipQueue) return false;

  // Only queue mutation requests (POST, PUT, PATCH, DELETE)
  if (!config.method || config.method.toLowerCase() === 'get') return false;

  // Only queue API requests to our backend
  const url = config.url || '';
  if (!url.startsWith('/tasks') &&
    !url.startsWith('/projects') &&
    !url.startsWith('/comments') &&
    !url.startsWith('/timers')) {
    return false;
  }

  return true;
}

/**
 * Determine the action type from the request
 */
function getActionType(config: OfflineRequestConfig): PendingActionType | null {
  if (config._offlineAction?.type) return config._offlineAction.type;

  const url = config.url || '';
  const method = (config.method || 'get').toUpperCase();

  // Tasks
  if (url.startsWith('/tasks')) {
    if (method === 'POST') return 'CREATE_TASK';
    if (method === 'PUT') return 'UPDATE_TASK';
    if (method === 'DELETE') return 'DELETE_TASK';
    if (method === 'PATCH' && url.includes('/complete')) return 'COMPLETE_TASK';
  }

  // Projects
  if (url.startsWith('/projects')) {
    if (method === 'POST') return 'CREATE_PROJECT';
    if (method === 'PUT') return 'UPDATE_PROJECT';
    if (method === 'DELETE') return 'DELETE_PROJECT';
  }

  // Comments
  if (url.startsWith('/comments')) {
    if (method === 'POST') return 'CREATE_COMMENT';
  }

  // Timers
  if (url.startsWith('/timers')) {
    if (url.includes('/start')) return 'START_TIMER';
    if (url.includes('/stop')) return 'STOP_TIMER';
  }

  return null;
}

/**
 * Determine entity type from the request URL
 */
function getEntityType(url: string): 'task' | 'project' | 'comment' | 'timer' {
  if (url.startsWith('/tasks')) return 'task';
  if (url.startsWith('/projects')) return 'project';
  if (url.startsWith('/comments')) return 'comment';
  if (url.startsWith('/timers')) return 'timer';
  return 'task';
}

/**
 * Extract entity ID from the request URL
 */
function getEntityId(url: string): string | undefined {
  // Match patterns like /tasks/123, /projects/abc-def
  const match = url.match(/\/(tasks|projects|comments)\/([^/]+)/);
  return match ? match[2] : undefined;
}

// Token management
const TOKEN_KEY = 'ordo_auth_token';
const REFRESH_TOKEN_KEY = 'ordo_refresh_token';

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const setRefreshToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
};

export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
};

export const removeRefreshToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

// Refresh token logic
let isRefreshing = false;
let refreshPromise: Promise<AuthResponse> | null = null;

async function handleTokenRefresh(): Promise<AuthResponse> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // We cannot use axiosInstance here because it has interceptors that might cause infinite loops
      // Create a fresh instance for the refresh call
      const response = await axios.post<AuthResponse>(`${config.api.baseURL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      setToken(accessToken);
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }

      return response.data;
    } catch (error) {
      removeToken();
      removeRefreshToken();
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as OfflineRequestConfig | undefined;

    // Check if this is a network error and we can queue the request
    if (error.message === 'Network Error' || !navigator.onLine) {
      if (config && canQueueRequest(config)) {
        const actionType = getActionType(config);

        if (actionType) {
          const url = config.url || '';
          const entityType = config._offlineAction?.entityType || getEntityType(url);
          const entityId = config._offlineAction?.entityId || getEntityId(url);
          const method = (config.method?.toUpperCase() || 'POST') as 'POST' | 'PUT' | 'PATCH' | 'DELETE';

          try {
            // Queue the action for later sync
            const actionId = await useSyncStore.getState().queueAction(
              actionType,
              url,
              method,
              config.data ? JSON.parse(config.data) : {},
              entityType,
              entityId
            );

            logger.log(`[API] Queued offline action: ${actionType}`, { actionId, url });

            // Return a mock success response for optimistic updates
            return {
              data: config.data ? JSON.parse(config.data) : {},
              status: 202, // Accepted - will be processed later
              statusText: 'Queued for sync',
              headers: {},
              config,
              _offlineQueued: true,
              _actionId: actionId,
            };
          } catch (queueError) {
            logger.error('[API] Failed to queue offline action:', queueError);
          }
        }
      }
    }

    if (error.response?.status === 401) {
      const originalRequest = error.config as any;

      // If we haven't retried this request yet and we have a refresh token
      if (!originalRequest._retry && getRefreshToken()) {
        originalRequest._retry = true;

        try {
          const { accessToken } = await handleTokenRefresh();

          // Update header and retry
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // If refresh fails, we will be logged out by handleTokenRefresh logic
          return Promise.reject(refreshError);
        }
      }

      // If no refresh token or already retried, logout
      removeToken();
      removeRefreshToken();
    }
    return Promise.reject(error);
  }
);

export const apiClient = {
  // Auth
  register: (data: RegisterDto) => axiosInstance.post('/auth/register', data).then((res) => res.data),
  login: (data: LoginDto) => axiosInstance.post('/auth/login', data).then((res) => res.data),
  logout: () => {
    removeRefreshToken();
    return axiosInstance.post('/auth/logout').then((res) => res.data);
  },
  refreshToken: (data: RefreshTokenDto) => axiosInstance.post('/auth/refresh', data).then((res) => res.data),
  checkUsernameAvailability: (username: string) => axiosInstance.post('/auth/check-username', { username }).then((res) => res.data),

  // User
  getCurrentUser: () => axiosInstance.get('/users/me').then((res) => res.data),
  getFullProfile: () => axiosInstance.get('/users/me/profile').then((res) => res.data),
  updateProfile: (data: UpdateProfileDto) => axiosInstance.put('/users/me', data).then((res) => res.data),
  getPreferences: () => axiosInstance.get('/users/me/preferences').then((res) => res.data),
  updatePreferences: (data: any) => axiosInstance.patch('/users/me/preferences', data).then((res) => res.data),
  getIntegrations: () => axiosInstance.get('/users/me/integrations').then((res) => res.data),
  exportData: () => axiosInstance.post('/users/me/export', null, { responseType: 'blob' }).then((res) => res.data),
  deleteAccount: () => axiosInstance.delete('/users/me').then((res) => res.data),

  // Workspace
  getWorkspaces: () => axiosInstance.get('/workspaces').then((res) => res.data),
  getWorkspace: (id: string) => axiosInstance.get(`/workspaces/${id}`).then((res) => res.data),
  getWorkspaceBySlug: (slug: string) => axiosInstance.get(`/workspaces/by-slug/${slug}`).then((res) => res.data),
  getWorkspaceByUsernameAndSlug: (username: string, slug: string) => axiosInstance.get(`/workspaces/${username}/${slug}`).then((res) => res.data),
  createWorkspace: (data: CreateWorkspaceDto) => axiosInstance.post('/workspaces', data).then((res) => res.data),
  updateWorkspace: (id: string, data: UpdateWorkspaceDto) => axiosInstance.put(`/workspaces/${id}`, data).then((res) => res.data),
  deleteWorkspace: (id: string) => axiosInstance.delete(`/workspaces/${id}`).then((res) => res.data),
  addWorkspaceMember: (id: string, data: AddMemberDto) => axiosInstance.post(`/workspaces/${id}/members`, data).then((res) => res.data),
  removeWorkspaceMember: (id: string, userId: string) => axiosInstance.delete(`/workspaces/${id}/members/${userId}`).then((res) => res.data),
  getWorkspaceMembers: (id: string) => axiosInstance.get(`/workspaces/${id}/members`).then((res) => res.data),
  getWorkspaceInvitations: (id: string) => axiosInstance.get(`/workspaces/${id}/invitations`).then((res) => res.data),
  inviteWorkspaceMember: (id: string, data: InviteMemberDto) => axiosInstance.post(`/workspaces/${id}/invite`, data).then((res) => res.data),
  acceptWorkspaceInvitation: (data: AcceptInvitationDto) => axiosInstance.post('/workspaces/invitations/accept', data).then((res) => res.data),

  // Workspace Settings
  getWorkspaceSettings: (id: string) => axiosInstance.get(`/workspaces/${id}/settings`).then((res) => res.data),
  updateWorkspaceSettings: (id: string, data: {
    defaultView?: 'LIST' | 'KANBAN' | 'CALENDAR' | 'TIMELINE' | 'FOCUS';
    defaultDueTime?: number;
    timezone?: string;
    locale?: string;
  }) => axiosInstance.put(`/workspaces/${id}/settings`, data).then((res) => res.data),

  // Workspace Audit Logs
  getWorkspaceAuditLogs: (id: string, params?: { limit?: number; offset?: number }) =>
    axiosInstance.get(`/workspaces/${id}/audit-logs`, { params }).then((res) => res.data),

  // Workflow
  getWorkflows: (workspaceId: string) => axiosInstance.get('/workflows', { params: { workspaceId } }).then((res) => res.data),
  createWorkflow: (data: CreateWorkflowDto) => axiosInstance.post('/workflows', data).then((res) => res.data),
  updateWorkflow: (id: string, data: UpdateWorkflowDto) => axiosInstance.put(`/workflows/${id}`, data).then((res) => res.data),
  deleteWorkflow: (id: string) => axiosInstance.delete(`/workflows/${id}`).then((res) => res.data),

  // Project
  getProjects: (workspaceId: string) => axiosInstance.get('/projects', { params: { workspaceId } }).then((res) => res.data),
  getAllProjects: () => axiosInstance.get('/projects/all').then((res) => res.data),
  getProject: (id: string) => axiosInstance.get(`/projects/${id}`).then((res) => res.data),
  getProjectBySlug: (workspaceSlug: string, projectSlug: string) => axiosInstance.get(`/projects/by-slug/${workspaceSlug}/${projectSlug}`).then((res) => res.data),
  createProject: (data: CreateProjectDto) => axiosInstance.post('/projects', data).then((res) => res.data),
  updateProject: (id: string, data: UpdateProjectDto) => axiosInstance.put(`/projects/${id}`, data).then((res) => res.data),
  archiveProject: (id: string) => axiosInstance.patch(`/projects/${id}/archive`).then((res) => res.data),
  completeProject: (id: string) => axiosInstance.patch(`/projects/${id}/complete`).then((res) => res.data),
  deleteProject: (id: string) => axiosInstance.delete(`/projects/${id}`).then((res) => res.data),

  // Task
  getTasks: (projectId?: string, tags?: string[], assignedToMe?: boolean) =>
    axiosInstance.get('/tasks', { params: { projectId, tags, assignedToMe } }).then((res) => res.data),
  getAvailableTasks: (projectId?: string) =>
    axiosInstance.get('/tasks/available', { params: { projectId } }).then((res) => res.data),
  getTask: (id: string) => axiosInstance.get(`/tasks/${id}`).then((res) => res.data),
  getTaskDetails: (id: string) => axiosInstance.get(`/tasks/${id}/details`).then((res) => res.data),
  createTask: (data: CreateTaskDto) => axiosInstance.post('/tasks', data).then((res) => res.data),
  updateTask: (id: string, data: UpdateTaskDto) => axiosInstance.put(`/tasks/${id}`, data).then((res) => res.data),
  completeTask: (id: string) => axiosInstance.patch(`/tasks/${id}/complete`).then((res) => res.data),
  deleteTask: (id: string) => axiosInstance.delete(`/tasks/${id}`).then((res) => res.data),
  createSubtask: (parentTaskId: string, data: CreateSubtaskDto) => axiosInstance.post(`/tasks/${parentTaskId}/subtasks`, data).then((res) => res.data),

  // Task Sharing
  generatePublicToken: (taskId: string) => axiosInstance.post(`/tasks/${taskId}/share`).then((res) => res.data),
  getTaskByPublicToken: (token: string) => axiosInstance.get(`/tasks/share/${token}`).then((res) => res.data),

  // Tag
  getTags: (workspaceId: string) => axiosInstance.get('/tags', { params: { workspaceId } }).then((res) => res.data),
  getTaskTags: (taskId: string) => axiosInstance.get(`/tasks/${taskId}/tags`).then((res) => res.data),
  createTag: (data: CreateTagDto) => axiosInstance.post('/tags', data).then((res) => res.data),
  updateTag: (id: string, data: UpdateTagDto) => axiosInstance.put(`/tags/${id}`, data).then((res) => res.data),
  assignTagToTask: (tagId: string, taskId: string) => axiosInstance.post(`/tags/${tagId}/tasks/${taskId}`).then((res) => res.data),
  removeTagFromTask: (tagId: string, taskId: string) => axiosInstance.delete(`/tags/${tagId}/tasks/${taskId}`).then((res) => res.data),
  deleteTag: (id: string) => axiosInstance.delete(`/tags/${id}`).then((res) => res.data),

  // Timer
  getActiveTimer: () => axiosInstance.get('/timers/active').then((res) => res.data),
  startTimer: (data: StartTimerDto) => axiosInstance.post('/timers/start', data).then((res) => res.data),
  stopTimer: (data: StopTimerDto) => axiosInstance.post('/timers/stop', data).then((res) => res.data),
  pauseTimer: (data?: { pauseStartedAt?: Date }) => axiosInstance.post('/timers/pause', data).then((res) => res.data),
  resumeTimer: (data: { pauseStartedAt: Date }) => axiosInstance.post('/timers/resume', data).then((res) => res.data),
  switchTask: (data: { newTaskId: string; type?: string; splitReason?: string }) => axiosInstance.post('/timers/switch-task', data).then((res) => res.data),
  getSessionHistory: (params?: { taskId?: string; type?: string; startDate?: string; endDate?: string; page?: number; limit?: number; completedOnly?: boolean }) =>
    axiosInstance.get('/timers/history', { params }).then((res) => res.data),
  getTimerStats: (params?: { startDate?: string; endDate?: string }) =>
    axiosInstance.get('/timers/stats', { params }).then((res) => res.data),
  getTaskTimeSessions: (taskId: string) =>
    axiosInstance.get(`/timers/task/${taskId}`).then((res) => res.data),

  // Analytics
  getDailyMetrics: (params?: GetDailyMetricsParams) => axiosInstance.get('/analytics/daily', { params }).then((res) => res.data),
  getWeeklyMetrics: (params?: { weekStart?: string }) => axiosInstance.get('/analytics/weekly', { params }).then((res) => res.data),
  getMonthlyMetrics: (params?: { monthStart?: string }) => axiosInstance.get('/analytics/monthly', { params }).then((res) => res.data),
  getDateRangeMetrics: (startDate: string, endDate: string) => axiosInstance.get('/analytics/range', { params: { startDate, endDate } }).then((res) => res.data),
  getDashboardStats: () => axiosInstance.get('/analytics/dashboard-stats').then((res) => res.data),
  getHeatmapData: () => axiosInstance.get('/analytics/heatmap').then((res) => res.data),
  getProjectDistribution: () => axiosInstance.get('/analytics/project-distribution').then((res) => res.data),
  getTaskStatusDistribution: () => axiosInstance.get('/analytics/task-status-distribution').then((res) => res.data),

  // AI
  getAIProfile: () => axiosInstance.get('/ai/profile').then((res) => res.data),
  getOptimalSchedule: (params?: { topN?: number }) => axiosInstance.get('/ai/optimal-schedule', { params }).then((res) => res.data),
  predictTaskDuration: (params?: { title?: string; description?: string; category?: string; priority?: string }) =>
    axiosInstance.get('/ai/predict-duration', { params }).then((res) => res.data),

  // AI Reports
  generateWeeklyReport: (weekStart?: string) => axiosInstance.post('/ai/reports/weekly', null, { params: { weekStart } }).then((res) => res.data),
  getReports: (params?: { scope?: string; limit?: number; offset?: number }) =>
    axiosInstance.get('/ai/reports', { params }).then((res) => res.data),
  getReport: (id: string) => axiosInstance.get(`/ai/reports/${id}`).then((res) => res.data),
  deleteReport: (id: string) => axiosInstance.delete(`/ai/reports/${id}`).then((res) => res.data),

  // Comment
  getTaskComments: (taskId: string) => axiosInstance.get(`/tasks/${taskId}/comments`).then((res) => res.data),
  createComment: (data: CreateCommentDto) => axiosInstance.post('/comments', data).then((res) => res.data),
  updateComment: (id: string, data: UpdateCommentDto) => axiosInstance.put(`/comments/${id}`, data).then((res) => res.data),
  deleteComment: (id: string) => axiosInstance.delete(`/comments/${id}`).then((res) => res.data),

  // Attachment
  getTaskAttachments: (taskId: string) => axiosInstance.get(`/tasks/${taskId}/attachments`).then((res) => res.data),
  getProjectAttachments: (projectId: string) => axiosInstance.get(`/attachments/project/${projectId}`).then((res) => res.data),
  createAttachment: (data: CreateAttachmentDto) => axiosInstance.post('/attachments', data).then((res) => res.data),
  deleteAttachment: (id: string) => axiosInstance.delete(`/attachments/${id}`).then((res) => res.data),

  // Notifications
  getNotifications: () => axiosInstance.get('/notifications').then((res) => res.data),
  getUnreadNotificationsCount: () => axiosInstance.get('/notifications/unread-count').then((res) => res.data),
  markNotificationAsRead: (id: string) => axiosInstance.patch(`/notifications/${id}/read`).then((res) => res.data),
  markAllNotificationsAsRead: () => axiosInstance.post('/notifications/mark-all-read').then((res) => res.data),

  // Chat
  getConversations: (params?: { limit?: number; offset?: number; includeArchived?: boolean }) =>
    axiosInstance.get('/chat/conversations', { params }).then((res) => res.data),
  getConversation: (id: string) => axiosInstance.get(`/chat/conversations/${id}`).then((res) => res.data),
  createConversation: (data: CreateConversationDto) => axiosInstance.post('/chat/conversations', data).then((res) => res.data),
  sendMessage: (conversationId: string, data: SendMessageDto) =>
    axiosInstance.post(`/chat/conversations/${conversationId}/messages`, data).then((res) => res.data),
  updateConversation: (id: string, title: string) => axiosInstance.patch(`/chat/conversations/${id}`, { title }).then((res) => res.data),
  archiveConversation: (id: string) => axiosInstance.patch(`/chat/conversations/${id}/archive`).then((res) => res.data),
  deleteConversation: (id: string) => axiosInstance.delete(`/chat/conversations/${id}`).then((res) => res.data),
  getAIInsights: () => axiosInstance.get('/chat/insights').then((res) => res.data),

  // Time Blocking
  getTimeBlocks: (start?: Date | string, end?: Date | string) => {
    const params: any = {};
    if (start) params.start = start instanceof Date ? start.toISOString() : start;
    if (end) params.end = end instanceof Date ? end.toISOString() : end;
    return axiosInstance.get('/tasks/time-blocks', { params }).then((res) => res.data);
  },

  // Habits
  getHabits: (includeArchived?: boolean) =>
    axiosInstance.get('/habits', { params: { includeArchived } }).then((res) => res.data),
  getTodayHabits: () =>
    axiosInstance.get('/habits/today').then((res) => res.data),
  getHabit: (id: string) =>
    axiosInstance.get(`/habits/${id}`).then((res) => res.data),
  getHabitStats: (id: string) =>
    axiosInstance.get(`/habits/${id}/stats`).then((res) => res.data),
  createHabit: (data: any) =>
    axiosInstance.post('/habits', data).then((res) => res.data),
  updateHabit: (id: string, data: any) =>
    axiosInstance.put(`/habits/${id}`, data).then((res) => res.data),
  deleteHabit: (id: string) =>
    axiosInstance.delete(`/habits/${id}`).then((res) => res.data),
  completeHabit: (id: string, data?: any) =>
    axiosInstance.post(`/habits/${id}/complete`, data).then((res) => res.data),
  uncompleteHabit: (id: string) =>
    axiosInstance.delete(`/habits/${id}/complete`).then((res) => res.data),
  pauseHabit: (id: string) =>
    axiosInstance.patch(`/habits/${id}/pause`).then((res) => res.data),
  resumeHabit: (id: string) =>
    axiosInstance.patch(`/habits/${id}/resume`).then((res) => res.data),

  // Objectives (OKRs)
  getObjectives: () => axiosInstance.get('/objectives').then((res) => res.data),
  getCurrentPeriodObjectives: () => axiosInstance.get('/objectives/current-period').then((res) => res.data),
  getObjectivesDashboardSummary: () => axiosInstance.get('/objectives/dashboard-summary').then((res) => res.data),
  getObjective: (id: string) => axiosInstance.get(`/objectives/${id}`).then((res) => res.data),
  createObjective: (data: CreateObjectiveDto) => axiosInstance.post('/objectives', data).then((res) => res.data),
  updateObjective: (id: string, data: UpdateObjectiveDto) => axiosInstance.put(`/objectives/${id}`, data).then((res) => res.data),
  deleteObjective: (id: string) => axiosInstance.delete(`/objectives/${id}`).then((res) => res.data),

  addKeyResult: (objectiveId: string, data: CreateKeyResultDto) => axiosInstance.post(`/objectives/${objectiveId}/key-results`, data).then((res) => res.data),
  updateKeyResult: (objectiveId: string, keyResultId: string, data: UpdateKeyResultDto) => axiosInstance.put(`/objectives/${objectiveId}/key-results/${keyResultId}`, data).then((res) => res.data),
  deleteKeyResult: (objectiveId: string, keyResultId: string) => axiosInstance.delete(`/objectives/${objectiveId}/key-results/${keyResultId}`).then((res) => res.data),

  linkTaskToKeyResult: (keyResultId: string, data: LinkTaskDto) => axiosInstance.post(`/objectives/key-results/${keyResultId}/tasks`, data).then((res) => res.data),
  unlinkTaskFromKeyResult: (keyResultId: string, taskId: string) => axiosInstance.delete(`/objectives/key-results/${keyResultId}/tasks/${taskId}`).then((res) => res.data),

  // Custom Fields
  getProjectCustomFields: (projectId: string) => axiosInstance.get(`/projects/${projectId}/custom-fields`).then((res) => res.data),
  createCustomField: (projectId: string, data: any) => axiosInstance.post(`/projects/${projectId}/custom-fields`, data).then((res) => res.data),
  updateCustomField: (fieldId: string, data: any) => axiosInstance.patch(`/custom-fields/${fieldId}`, data).then((res) => res.data),
  deleteCustomField: (fieldId: string) => axiosInstance.delete(`/custom-fields/${fieldId}`).then((res) => res.data),
  getTaskCustomValues: (taskId: string) => axiosInstance.get(`/tasks/${taskId}/custom-values`).then((res) => res.data),
  setTaskCustomValues: (taskId: string, data: any) => axiosInstance.patch(`/tasks/${taskId}/custom-values`, data).then((res) => res.data),

  // Semantic Search
  semanticSearch: (query: string, options?: { types?: string; projectId?: string; limit?: number }) =>
    axiosInstance.get('/search', { params: { q: query, ...options } }).then((res) => res.data),
  searchSuggestions: (query: string) =>
    axiosInstance.get('/search/suggestions', { params: { q: query } }).then((res) => res.data),
  askAI: (question: string) =>
    axiosInstance.get('/search/ask', { params: { q: question } }).then((res) => res.data),

  // Meetings
  analyzeMeetingTranscript: (transcript: string, options?: { meetingTitle?: string; participants?: string[]; duration?: number }) =>
    axiosInstance.post('/meetings/analyze', { transcript, ...options }).then((res) => res.data),
  extractMeetingActions: (transcript: string, projectContext?: string) =>
    axiosInstance.post('/meetings/extract-actions', { transcript, projectContext }).then((res) => res.data),
  generateMeetingSummary: (transcript: string, style?: 'executive' | 'detailed' | 'bullet-points') =>
    axiosInstance.post('/meetings/summary', { transcript, style }).then((res) => res.data),
  convertActionsToTasks: (actionItems: any[], options?: { projectId?: string }) =>
    axiosInstance.post('/meetings/convert-to-tasks', { actionItems, ...options }).then((res) => res.data),
  quickAnalyzeMeeting: (transcript: string, projectId?: string) =>
    axiosInstance.post('/meetings/quick-analyze', { transcript, projectId }).then((res) => res.data),

  // Focus Audio
  getFocusTracks: () => axiosInstance.get('/focus/tracks').then((res) => res.data),
  getRecommendedTracks: () => axiosInstance.get('/focus/tracks/recommended').then((res) => res.data),
  getFocusModes: () => axiosInstance.get('/focus/modes').then((res) => res.data),
  getFocusFavorites: () => axiosInstance.get('/focus/favorites').then((res) => res.data),
  toggleFocusFavorite: (trackId: string) => axiosInstance.post(`/focus/favorites/${trackId}`).then((res) => res.data),
  getFocusPreferences: () => axiosInstance.get('/focus/preferences').then((res) => res.data),
  updateFocusPreferences: (data: any) => axiosInstance.patch('/focus/preferences', data).then((res) => res.data),
  getFocusStats: () => axiosInstance.get('/focus/stats').then((res) => res.data),

  // Team Workload
  getWorkspaceWorkload: (workspaceId: string) => axiosInstance.get(`/workload/workspace/${workspaceId}`).then((res) => res.data),
  getMemberWorkload: (userId: string, workspaceId?: string) =>
    axiosInstance.get(`/workload/member/${userId}`, { params: { workspaceId } }).then((res) => res.data),
  getMyWorkload: (workspaceId?: string) =>
    axiosInstance.get('/workload/me', { params: { workspaceId } }).then((res) => res.data),
  getWorkloadSuggestions: (workspaceId: string) =>
    axiosInstance.get(`/workload/suggestions/${workspaceId}`).then((res) => res.data),

  // Burnout Prevention
  getBurnoutAnalysis: () => axiosInstance.get('/ai/burnout/analysis').then((res) => res.data),
  getWorkPatterns: () => axiosInstance.get('/ai/burnout/patterns').then((res) => res.data),
  getRestRecommendations: () => axiosInstance.get('/ai/burnout/recommendations').then((res) => res.data),
  checkBurnoutIntervention: () => axiosInstance.get('/ai/burnout/intervention').then((res) => res.data),
  getWeeklyWellbeingSummary: () => axiosInstance.get('/ai/burnout/weekly-summary').then((res) => res.data),
};

