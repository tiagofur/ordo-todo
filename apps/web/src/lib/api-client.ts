import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { config } from "@/config";
import type {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  UpdateWorkspaceSettingsDto,
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
  ChangePasswordDto,
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
  // Habits
  CreateHabitDto,
  UpdateHabitDto,
  CompleteHabitDto,
  // Preferences
  UpdatePreferencesDto,
  // Custom Fields
  // Entity Types
  User,
  UserProfileResponse,
  UserPreferences,
  UserIntegration,
  CalendarAccountStatus,
  Workspace,
  WorkspaceMember,
  WorkspaceInvitation,
  WorkspaceSettings,
  WorkspaceAuditLogsResponse,
  WorkspaceAuditLog,
  Workflow,
  Project,
  Task,
  TaskDetails,
  TaskShareResponse,
  PublicTaskResponse,
  TodayTasksResponse,
  TimeBlock,
  Tag,
  Habit,
  HabitStats,
  CustomField,
  CustomFieldValue,
  CreateCustomFieldDto,
  UpdateCustomFieldDto,
  SetMultipleCustomFieldValuesDto,
  // Timer & Analytics
  TimeSession,
  ActiveTimerResponse,
  PaginatedSessionsResponse,
  TimerStatsResponse,
  TaskTimeResponse,
  DailyMetrics,
  ProductivityStats,
  // Other Entities
  Comment,
  Attachment,
  Notification,
  UnreadCountResponse,
  ConversationResponse,
  ConversationDetail,
  SendMessageResponse,
  AIInsightsResponse,
  // AI
  AIProfile,
  OptimalScheduleResponse,
  PredictDurationResponse,
  ProductivityReport,
  WeeklyReportResponse,
  // Objectives
  Objective,
  ObjectiveDashboardSummary,
  KeyResult,
  // Notes
  Note,
  CreateNoteDto,
  UpdateNoteDto,
} from "@ordo-todo/api-client";

export type { UserIntegration } from "@ordo-todo/api-client";

import { useSyncStore } from "@/stores/sync-store";
import { PendingActionType } from "@/lib/offline-storage";
import { logger } from "@/lib/logger";

const axiosInstance = axios.create({
  baseURL: config.api.baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Extended request config to track offline queueing metadata
interface OfflineRequestConfig extends InternalAxiosRequestConfig {
  _offlineAction?: {
    type: PendingActionType;
    entityType: "task" | "project" | "comment" | "timer";
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
  if (!config.method || config.method.toLowerCase() === "get") return false;

  // Only queue API requests to our backend
  const url = config.url || "";
  if (
    !url.startsWith("/tasks") &&
    !url.startsWith("/projects") &&
    !url.startsWith("/comments") &&
    !url.startsWith("/timers")
  ) {
    return false;
  }

  return true;
}

/**
 * Determine the action type from the request
 */
function getActionType(config: OfflineRequestConfig): PendingActionType | null {
  if (config._offlineAction?.type) return config._offlineAction.type;

  const url = config.url || "";
  const method = (config.method || "get").toUpperCase();

  // Tasks
  if (url.startsWith("/tasks")) {
    if (method === "POST") return "CREATE_TASK";
    if (method === "PUT") return "UPDATE_TASK";
    if (method === "DELETE") return "DELETE_TASK";
    if (method === "PATCH" && url.includes("/complete")) return "COMPLETE_TASK";
  }

  // Projects
  if (url.startsWith("/projects")) {
    if (method === "POST") return "CREATE_PROJECT";
    if (method === "PUT") return "UPDATE_PROJECT";
    if (method === "DELETE") return "DELETE_PROJECT";
  }

  // Comments
  if (url.startsWith("/comments")) {
    if (method === "POST") return "CREATE_COMMENT";
  }

  // Timers
  if (url.startsWith("/timers")) {
    if (url.includes("/start")) return "START_TIMER";
    if (url.includes("/stop")) return "STOP_TIMER";
  }

  return null;
}

/**
 * Determine entity type from the request URL
 */
function getEntityType(url: string): "task" | "project" | "comment" | "timer" {
  if (url.startsWith("/tasks")) return "task";
  if (url.startsWith("/projects")) return "project";
  if (url.startsWith("/comments")) return "comment";
  if (url.startsWith("/timers")) return "timer";
  return "task";
}

/**
 * Extract entity ID from the request URL
 */
function getEntityId(url: string): string | undefined {
  // Match patterns like /tasks/123, /projects/abc-def
  const match = url.match(/\/(tasks|projects|comments)\/([^/]+)/);
  return match ? match[2] : undefined;
}

// Tokens are now managed via httpOnly cookies - no localStorage needed
// The backend sets cookies on login/register/refresh and clears them on logout

// CSRF Protection
let csrfToken: string | null = null;

export const getCsrfToken = async (): Promise<string> => {
  if (csrfToken) {
    return csrfToken;
  }

  try {
    const response = await axios.get<{ csrfToken: string }>(
      `${config.api.baseURL}/auth/csrf-token`,
      { withCredentials: true },
    );

    csrfToken = response.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error("[API] Failed to fetch CSRF token:", error);
    throw error;
  }
};

export const invalidateCsrfToken = () => {
  csrfToken = null;
};

// Refresh token logic - tokens are now in httpOnly cookies
let isRefreshing = false;
let refreshPromise: Promise<AuthResponse> | null = null;

async function handleTokenRefresh(): Promise<AuthResponse> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      // Call refresh endpoint - cookies are automatically sent by browser
      // We cannot use axiosInstance here because it has interceptors that might cause infinite loops
      // Create a fresh instance for the refresh call
      const response = await axios.post<AuthResponse>(
        `${config.api.baseURL}/auth/refresh`,
        {},
        {
          withCredentials: true, // Ensure cookies are sent
        },
      );

      // Backend sets new cookies automatically in the response
      return response.data;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

axiosInstance.interceptors.request.use(
  async (config) => {
    // Cookies are sent automatically by browser (httpOnly cookies)
    // No need to manually add Authorization header

    // Add CSRF token to state-changing requests (POST, PUT, PATCH, DELETE)
    const method = config.method?.toLowerCase();
    if (["post", "put", "patch", "delete"].includes(method ?? "")) {
      // Skip CSRF token for login/register/refresh/logout endpoints
      // These endpoints have their own CSRF validation
      const skipCsrf = config.url?.startsWith("/auth/");
      if (!skipCsrf) {
        try {
          const token = await getCsrfToken();
          config.headers["x-csrf-token"] = token;
        } catch (error) {
          console.error("[API] Failed to get CSRF token:", error);
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const requestConfig = error.config as OfflineRequestConfig | undefined;

    // Check if this is a network error and we can queue the request
    if (error.message === "Network Error" || !navigator.onLine) {
      if (requestConfig && canQueueRequest(requestConfig)) {
        const actionType = getActionType(requestConfig);

        if (actionType) {
          const url = requestConfig.url || "";
          const entityType =
            requestConfig._offlineAction?.entityType || getEntityType(url);
          const entityId = requestConfig._offlineAction?.entityId || getEntityId(url);
          const method = (requestConfig.method?.toUpperCase() || "POST") as
            | "POST"
            | "PUT"
            | "PATCH"
            | "DELETE";

          try {
            // Queue the action for later sync
            const actionId = await useSyncStore
              .getState()
              .queueAction(
                actionType,
                url,
                method,
                requestConfig.data ? JSON.parse(requestConfig.data) : {},
                entityType,
                entityId,
              );

            logger.log(`[API] Queued offline action: ${actionType}`, {
              actionId,
              url,
            });

            // Return a mock success response for optimistic updates
            return {
              data: requestConfig.data ? JSON.parse(requestConfig.data) : {},
              status: 202, // Accepted - will be processed later
              statusText: "Queued for sync",
              headers: {},
              config: requestConfig,
              _offlineQueued: true,
              _actionId: actionId,
            };
          } catch (queueError) {
            logger.error("[API] Failed to queue offline action:", queueError);
          }
        }
      }
    }

    if (error.response?.status === 401) {
      const originalRequest = error.config as any;
      if (!originalRequest) return Promise.reject(error);

      // Do not attempt token refresh for authentication endpoints to prevent loops
      const url = originalRequest.url || "";
      if (url.includes("/auth/")) {
        return Promise.reject(error);
      }

      // Do not attempt token refresh if already on login/register pages
      if (typeof window !== "undefined") {
        const isAuthPage =
          window.location.pathname.includes("/login") ||
          window.location.pathname.includes("/register");
        if (isAuthPage) {
          return Promise.reject(error);
        }
      }

      // If we haven't retried this request yet
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          await handleTokenRefresh();

          // Retry the original request (cookies are automatically updated)
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // If refresh fails, call logout via un-intercepted axios to avoid loops
          await axios
            .post(`${config.api.baseURL}/auth/logout`, {}, { withCredentials: true })
            .catch(() => {
              // Ignore errors during logout - user session expired anyway
            });
          // Redirect to login page only if not already on an authentication page
          if (typeof window !== "undefined") {
            const isAuthPage =
              window.location.pathname.includes("/login") ||
              window.location.pathname.includes("/register");
            if (!isAuthPage) {
              window.location.href = "/login";
            }
          }
          return Promise.reject(refreshError);
        }
      } else {
        // Already retried and failed, logout via un-intercepted axios
        await axios
          .post(`${config.api.baseURL}/auth/logout`, {}, { withCredentials: true })
          .catch(() => {
            // Ignore errors during logout
          });
        // Redirect to login page only if not already on an authentication page
        if (typeof window !== "undefined") {
          const isAuthPage =
            window.location.pathname.includes("/login") ||
            window.location.pathname.includes("/register");
          if (!isAuthPage) {
            window.location.href = "/login";
          }
        }
      }
    }
    return Promise.reject(error);
  },
);

export const apiClient = {
  // Auth
  // Auth
  register: (data: RegisterDto): Promise<AuthResponse> =>
    axiosInstance.post("/auth/register", data).then((res) => res.data),
  login: (data: LoginDto): Promise<AuthResponse> =>
    axiosInstance.post("/auth/login", data).then((res) => res.data),
  logout: (): Promise<void> => {
    // Backend will clear httpOnly cookies
    invalidateCsrfToken();
    return axiosInstance.post("/auth/logout").then((res) => res.data);
  },
  refreshToken: (data: RefreshTokenDto): Promise<AuthResponse> =>
    axiosInstance.post("/auth/refresh", data).then((res) => res.data),
  checkUsernameAvailability: (
    username: string,
  ): Promise<{ available: boolean }> =>
    axiosInstance
      .post("/auth/check-username", { username })
      .then((res) => res.data),
  changePassword: (
    data: ChangePasswordDto,
  ): Promise<{ success: boolean; message: string }> =>
    axiosInstance
      .post("/auth/change-password", data)
      .then((res) => res.data),
  forgotPassword: (
    email: string,
  ): Promise<{ success: boolean; message: string }> =>
    axiosInstance
      .post("/auth/forgot-password", { email })
      .then((res) => res.data),
  resetPassword: (data: {
    token: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> =>
    axiosInstance
      .post("/auth/reset-password", data)
      .then((res) => res.data),

  // User
  getCurrentUser: (): Promise<User> =>
    axiosInstance.get("/users/me").then((res) => res.data),
  getFullProfile: (): Promise<UserProfileResponse> =>
    axiosInstance.get("/users/me/profile").then((res) => res.data),
  updateProfile: (data: UpdateProfileDto): Promise<User> =>
    axiosInstance.put("/users/me", data).then((res) => res.data),
  getPreferences: (): Promise<UserPreferences> =>
    axiosInstance.get("/users/me/preferences").then((res) => res.data),
  updatePreferences: (data: UpdatePreferencesDto): Promise<UserPreferences> =>
    axiosInstance.patch("/users/me/preferences", data).then((res) => res.data),
  getIntegrations: (): Promise<UserIntegration[]> =>
    axiosInstance.get("/users/me/integrations").then((res) => res.data),
  getCalendarStatus: (): Promise<CalendarAccountStatus[]> =>
    axiosInstance.get("/integrations/calendar/status").then((res) => res.data),
  startCalendarConnect: (
    provider: string,
  ): Promise<{ authorizeUrl: string; state: string }> =>
    axiosInstance
      .post(`/integrations/calendar/${provider}/connect`)
      .then((res) => res.data),
  disconnectCalendar: (provider: string): Promise<void> =>
    axiosInstance
      .delete(`/integrations/calendar/${provider}`)
      .then((res) => res.data),
  connectIntegration: (
    provider: string,
    data?: Record<string, any>,
  ): Promise<{ success: boolean; message: string; integration?: any }> =>
    axiosInstance
      .post(`/users/me/integrations/${provider}/connect`, data || {})
      .then((res) => res.data),
  disconnectIntegration: (
    provider: string,
  ): Promise<{ success: boolean; message: string }> =>
    axiosInstance
      .delete(`/users/me/integrations/${provider}`)
      .then((res) => res.data),
  getCalendarFeedToken: (): Promise<{
    token: string;
    feedUrl: string;
    webcalUrl: string;
  }> => axiosInstance.get("/tasks/calendar-token").then((res) => res.data),
  exportData: (): Promise<Blob> =>
    axiosInstance
      .post<Blob>("/users/me/export", null, { responseType: "blob" })
      .then((res) => res.data),
  deleteAccount: (): Promise<void> =>
    axiosInstance.delete("/users/me").then((res) => res.data),

  // Workspace
  // Workspace
  getWorkspaces: (): Promise<Workspace[]> =>
    axiosInstance.get("/workspaces").then((res) => res.data),
  getWorkspace: (id: string): Promise<Workspace> =>
    axiosInstance.get(`/workspaces/${id}`).then((res) => res.data),
  getWorkspaceBySlug: (username: string, slug: string): Promise<Workspace> =>
    axiosInstance
      .get(`/workspaces/${username}/${slug}`)
      .then((res) => res.data),
  getWorkspaceBySlugOnly: (slug: string): Promise<Workspace> =>
    axiosInstance
      .get(`/workspaces/by-slug/${slug}`)
      .then((res) => res.data),
  createWorkspace: (data: CreateWorkspaceDto): Promise<Workspace> =>
    axiosInstance.post("/workspaces", data).then((res) => res.data),
  updateWorkspace: (id: string, data: UpdateWorkspaceDto): Promise<Workspace> =>
    axiosInstance.put(`/workspaces/${id}`, data).then((res) => res.data),
  deleteWorkspace: (id: string): Promise<void> =>
    axiosInstance.delete(`/workspaces/${id}`).then((res) => res.data),
  getDeletedWorkspaces: (): Promise<Workspace[]> =>
    axiosInstance.get("/workspaces/deleted").then((res) => res.data),
  restoreWorkspace: (id: string): Promise<Workspace> =>
    axiosInstance.post(`/workspaces/${id}/restore`).then((res) => res.data),
  permanentDeleteWorkspace: (id: string): Promise<void> =>
    axiosInstance.delete(`/workspaces/${id}/permanent`).then((res) => res.data),
  addWorkspaceMember: (
    id: string,
    data: AddMemberDto,
  ): Promise<WorkspaceMember> =>
    axiosInstance
      .post(`/workspaces/${id}/members`, data)
      .then((res) => res.data),
  removeWorkspaceMember: (id: string, userId: string): Promise<void> =>
    axiosInstance
      .delete(`/workspaces/${id}/members/${userId}`)
      .then((res) => res.data),
  getWorkspaceMembers: (id: string): Promise<WorkspaceMember[]> =>
    axiosInstance.get(`/workspaces/${id}/members`).then((res) => res.data),
  getWorkspaceInvitations: (id: string): Promise<WorkspaceInvitation[]> =>
    axiosInstance.get(`/workspaces/${id}/invitations`).then((res) => res.data),
  inviteWorkspaceMember: (
    id: string,
    data: InviteMemberDto,
  ): Promise<WorkspaceInvitation> =>
    axiosInstance
      .post(`/workspaces/${id}/invitations`, data)
      .then((res) => res.data),
  acceptWorkspaceInvitation: (data: AcceptInvitationDto): Promise<Workspace> =>
    axiosInstance
      .post("/workspaces/invitations/accept", data)
      .then((res) => res.data),

  // Workspace Settings
  getWorkspaceSettings: (id: string): Promise<WorkspaceSettings> =>
    axiosInstance.get(`/workspaces/${id}/settings`).then((res) => res.data),
  updateWorkspaceSettings: (
    id: string,
    data: UpdateWorkspaceSettingsDto,
  ): Promise<WorkspaceSettings> =>
    axiosInstance
      .put(`/workspaces/${id}/settings`, data)
      .then((res) => res.data),

  // Workspace Audit Logs
  getWorkspaceAuditLogs: (
    id: string,
    params?: { limit?: number; offset?: number },
  ): Promise<WorkspaceAuditLogsResponse> =>
    axiosInstance
      .get(`/workspaces/${id}/audit-logs`, { params })
      .then((res) => res.data),
  createAuditLog: (
    workspaceId: string,
    action: string,
    payload?: Record<string, unknown>,
  ): Promise<WorkspaceAuditLog> =>
    axiosInstance
      .post(`/workspaces/${workspaceId}/audit-logs`, { action, payload })
      .then((res) => res.data),
  archiveWorkspace: (id: string): Promise<Workspace> =>
    axiosInstance
      .post(`/workspaces/${id}/archive`)
      .then((res) => res.data),

  // Workflow
  getWorkflows: (workspaceId: string): Promise<Workflow[]> =>
    axiosInstance
      .get("/workflows", { params: { workspaceId } })
      .then((res) => res.data),
  createWorkflow: (data: CreateWorkflowDto): Promise<Workflow> =>
    axiosInstance.post("/workflows", data).then((res) => res.data),
  updateWorkflow: (id: string, data: UpdateWorkflowDto): Promise<Workflow> =>
    axiosInstance.put(`/workflows/${id}`, data).then((res) => res.data),
  deleteWorkflow: (id: string): Promise<void> =>
    axiosInstance.delete(`/workflows/${id}`).then((res) => res.data),

  // Project
  getProjects: (workspaceId: string): Promise<Project[]> =>
    axiosInstance
      .get("/projects", { params: { workspaceId } })
      .then((res) => res.data),
  getAllProjects: (): Promise<Project[]> =>
    axiosInstance.get("/projects/all").then((res) => res.data),
  getProject: (id: string): Promise<Project> =>
    axiosInstance.get(`/projects/${id}`).then((res) => res.data),
  getProjectBySlugs: (
    workspaceSlug: string,
    projectSlug: string,
  ): Promise<Project> =>
    axiosInstance
      .get(`/projects/by-slug/${workspaceSlug}/${projectSlug}`)
      .then((res) => res.data),
  createProject: (data: CreateProjectDto): Promise<Project> =>
    axiosInstance.post("/projects", data).then((res) => res.data),
  updateProject: (id: string, data: UpdateProjectDto): Promise<Project> =>
    axiosInstance.put(`/projects/${id}`, data).then((res) => res.data),
  archiveProject: (id: string): Promise<Project> =>
    axiosInstance.patch(`/projects/${id}/archive`).then((res) => res.data),
  completeProject: (id: string): Promise<Project> =>
    axiosInstance.patch(`/projects/${id}/complete`).then((res) => res.data),
  deleteProject: (id: string): Promise<void> =>
    axiosInstance.delete(`/projects/${id}`).then((res) => res.data),
  getDeletedProjects: (workspaceId: string): Promise<Project[]> =>
    axiosInstance
      .get("/projects/deleted", { params: { workspaceId } })
      .then((res) => res.data),
  restoreProject: (id: string): Promise<Project> =>
    axiosInstance.post(`/projects/${id}/restore`).then((res) => res.data),
  permanentDeleteProject: (id: string): Promise<void> =>
    axiosInstance.delete(`/projects/${id}/permanent`).then((res) => res.data),

  // Task
  getTasks: (
    projectId?: string,
    tags?: string[],
    assignedToMe?: boolean,
  ): Promise<Task[]> =>
    axiosInstance
      .get("/tasks", { params: { projectId, tags, assignedToMe } })
      .then((res) => res.data),
  getAvailableTasks: (projectId?: string): Promise<Task[]> =>
    axiosInstance
      .get("/tasks/available", { params: { projectId } })
      .then((res) => res.data),
  getTask: (id: string): Promise<Task> =>
    axiosInstance.get(`/tasks/${id}`).then((res) => res.data),
  getTaskDetails: (id: string): Promise<TaskDetails> =>
    axiosInstance.get(`/tasks/${id}/details`).then((res) => res.data),
  createTask: (data: CreateTaskDto): Promise<Task> =>
    axiosInstance.post("/tasks", data).then((res) => res.data),
  updateTask: (id: string, data: UpdateTaskDto): Promise<Task> =>
    axiosInstance.patch(`/tasks/${id}`, data).then((res) => res.data),
  completeTask: (id: string): Promise<Task> =>
    axiosInstance.patch(`/tasks/${id}/complete`).then((res) => res.data),
  deleteTask: (id: string): Promise<void> =>
    axiosInstance.delete(`/tasks/${id}`).then((res) => res.data),
  getDeletedTasks: (projectId: string): Promise<Task[]> =>
    axiosInstance
      .get("/tasks/deleted", { params: { projectId } })
      .then((res) => res.data),
  restoreTask: (id: string): Promise<Task> =>
    axiosInstance.post(`/tasks/${id}/restore`).then((res) => res.data),
  permanentDeleteTask: (id: string): Promise<void> =>
    axiosInstance.delete(`/tasks/${id}/permanent`).then((res) => res.data),
  createSubtask: (
    parentTaskId: string,
    data: CreateSubtaskDto,
  ): Promise<Task> =>
    axiosInstance
      .post(`/tasks/${parentTaskId}/subtasks`, data)
      .then((res) => res.data),

  // Task Sharing
  generatePublicToken: (taskId: string): Promise<TaskShareResponse> =>
    axiosInstance.post(`/tasks/${taskId}/share`).then((res) => res.data),
  getTaskByPublicToken: (token: string): Promise<PublicTaskResponse> =>
    axiosInstance.get(`/tasks/share/${token}`).then((res) => res.data),

  // Task Dependencies
  getTaskDependencies: (
    taskId: string,
  ): Promise<{ blockedBy: Task[]; blocking: Task[] }> =>
    axiosInstance.get(`/tasks/${taskId}/dependencies`).then((res) => res.data),
  addTaskDependency: (
    taskId: string,
    blockingTaskId: string,
  ): Promise<{ success: boolean }> =>
    axiosInstance
      .post(`/tasks/${taskId}/dependencies`, { blockingTaskId })
      .then((res) => res.data),
  removeTaskDependency: (
    taskId: string,
    blockingTaskId: string,
  ): Promise<{ success: boolean }> =>
    axiosInstance
      .delete(`/tasks/${taskId}/dependencies/${blockingTaskId}`)
      .then((res) => res.data),

  // Tag
  getTags: (workspaceId: string): Promise<Tag[]> =>
    axiosInstance
      .get("/tags", { params: { workspaceId } })
      .then((res) => res.data),
  getTaskTags: (taskId: string): Promise<Tag[]> =>
    axiosInstance.get(`/tasks/${taskId}/tags`).then((res) => res.data),
  createTag: (data: CreateTagDto): Promise<Tag> =>
    axiosInstance.post("/tags", data).then((res) => res.data),
  updateTag: (id: string, data: UpdateTagDto): Promise<Tag> =>
    axiosInstance.put(`/tags/${id}`, data).then((res) => res.data),
  assignTagToTask: (tagId: string, taskId: string): Promise<void> =>
    axiosInstance
      .post(`/tags/${tagId}/tasks/${taskId}`)
      .then((res) => res.data),
  removeTagFromTask: (tagId: string, taskId: string): Promise<void> =>
    axiosInstance
      .delete(`/tags/${tagId}/tasks/${taskId}`)
      .then((res) => res.data),
  deleteTag: (id: string): Promise<void> =>
    axiosInstance.delete(`/tags/${id}`).then((res) => res.data),

  // Timer
  getActiveTimer: (): Promise<ActiveTimerResponse | null> =>
    axiosInstance.get("/timers/active").then((res) => res.data),
  startTimer: (data: StartTimerDto): Promise<TimeSession> =>
    axiosInstance.post("/timers/start", data).then((res) => res.data),
  stopTimer: (data: StopTimerDto): Promise<TimeSession> =>
    axiosInstance.post("/timers/stop", data).then((res) => res.data),
  pauseTimer: (data?: { pauseStartedAt?: Date }): Promise<TimeSession> =>
    axiosInstance.post("/timers/pause", data).then((res) => res.data),
  resumeTimer: (data: { pauseStartedAt: Date }): Promise<TimeSession> =>
    axiosInstance.post("/timers/resume", data).then((res) => res.data),
  switchTask: (data: {
    newTaskId: string;
    type?: string;
    splitReason?: string;
  }): Promise<TimeSession> =>
    axiosInstance.post("/timers/switch-task", data).then((res) => res.data),
  getSessionHistory: (params?: {
    taskId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    completedOnly?: boolean;
  }): Promise<PaginatedSessionsResponse> =>
    axiosInstance.get("/timers/history", { params }).then((res) => res.data),
  getTimerStats: (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<TimerStatsResponse> =>
    axiosInstance.get("/timers/stats", { params }).then((res) => res.data),
  getTaskTimeSessions: (taskId: string): Promise<TaskTimeResponse> =>
    axiosInstance.get(`/timers/task/${taskId}`).then((res) => res.data),

  // Analytics
  getDailyMetrics: (params?: GetDailyMetricsParams): Promise<DailyMetrics[]> =>
    axiosInstance.get("/analytics/daily", { params }).then((res) => res.data),
  getWeeklyMetrics: (params?: { weekStart?: string }): Promise<any> =>
    axiosInstance.get("/analytics/weekly", { params }).then((res) => res.data),
  getMonthlyMetrics: (params?: { monthStart?: string }): Promise<any> =>
    axiosInstance.get("/analytics/monthly", { params }).then((res) => res.data),
  getDateRangeMetrics: (startDate: string, endDate: string): Promise<any> =>
    axiosInstance
      .get("/analytics/range", { params: { startDate, endDate } })
      .then((res) => res.data),
  getDashboardStats: (): Promise<any> =>
    axiosInstance.get("/analytics/dashboard-stats").then((res) => res.data),
  getHeatmapData: (): Promise<any> =>
    axiosInstance.get("/analytics/heatmap").then((res) => res.data),
  getProjectDistribution: (): Promise<any> =>
    axiosInstance
      .get("/analytics/project-distribution")
      .then((res) => res.data),
  getTaskStatusDistribution: (): Promise<any> =>
    axiosInstance
      .get("/analytics/task-status-distribution")
      .then((res) => res.data),

  // AI
  getAIProfile: (): Promise<AIProfile> =>
    axiosInstance.get("/ai/profile").then((res) => res.data),
  getOptimalSchedule: (params?: {
    topN?: number;
  }): Promise<OptimalScheduleResponse> =>
    axiosInstance
      .get("/ai/optimal-schedule", { params })
      .then((res) => res.data),
  predictTaskDuration: (params?: {
    title?: string;
    description?: string;
    category?: string;
    priority?: string;
  }): Promise<PredictDurationResponse> =>
    axiosInstance
      .get("/ai/predict-duration", { params })
      .then((res) => res.data),

  // AI Reports
  generateWeeklyReport: (weekStart?: string): Promise<WeeklyReportResponse> =>
    axiosInstance
      .post("/ai/reports/weekly", null, { params: { weekStart } })
      .then((res) => res.data),
  getReports: (params?: {
    scope?: string;
    limit?: number;
    offset?: number;
  }): Promise<ProductivityReport[]> =>
    axiosInstance.get("/ai/reports", { params }).then((res) => res.data),
  getReport: (id: string): Promise<ProductivityReport> =>
    axiosInstance.get(`/ai/reports/${id}`).then((res) => res.data),
  deleteReport: (id: string): Promise<void> =>
    axiosInstance.delete(`/ai/reports/${id}`).then((res) => res.data),

  // Comment
  getTaskComments: (taskId: string): Promise<Comment[]> =>
    axiosInstance.get(`/tasks/${taskId}/comments`).then((res) => res.data),
  createComment: (data: CreateCommentDto): Promise<Comment> =>
    axiosInstance.post("/comments", data).then((res) => res.data),
  updateComment: (id: string, data: UpdateCommentDto): Promise<Comment> =>
    axiosInstance.put(`/comments/${id}`, data).then((res) => res.data),
  deleteComment: (id: string): Promise<void> =>
    axiosInstance.delete(`/comments/${id}`).then((res) => res.data),

  // Attachment
  getTaskAttachments: (taskId: string): Promise<Attachment[]> =>
    axiosInstance.get(`/tasks/${taskId}/attachments`).then((res) => res.data),
  getProjectAttachments: (projectId: string): Promise<Attachment[]> =>
    axiosInstance
      .get(`/attachments/project/${projectId}`)
      .then((res) => res.data),
  createAttachment: (data: CreateAttachmentDto): Promise<Attachment> =>
    axiosInstance.post("/attachments", data).then((res) => res.data),
  uploadAttachment: (file: File, taskId?: string): Promise<Attachment> => {
    const formData = new FormData();
    formData.append("file", file);
    if (taskId) formData.append("taskId", taskId);
    return axiosInstance
      .post("/attachments/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },
  deleteAttachment: (id: string): Promise<void> =>
    axiosInstance.delete(`/attachments/${id}`).then((res) => res.data),

  // Notifications
  getNotifications: (): Promise<Notification[]> =>
    axiosInstance.get("/notifications").then((res) => res.data),
  getUnreadNotificationsCount: (): Promise<UnreadCountResponse> =>
    axiosInstance.get("/notifications/unread-count").then((res) => res.data),
  markNotificationAsRead: (id: string): Promise<Notification> =>
    axiosInstance.patch(`/notifications/${id}/read`).then((res) => res.data),
  markAllNotificationsAsRead: (): Promise<void> =>
    axiosInstance.post("/notifications/mark-all-read").then((res) => res.data),

  // Chat
  getConversations: (params?: {
    limit?: number;
    offset?: number;
    includeArchived?: boolean;
  }): Promise<ConversationResponse[]> =>
    axiosInstance
      .get("/chat/conversations", { params })
      .then((res) => res.data),
  getConversation: (id: string): Promise<ConversationDetail> =>
    axiosInstance.get(`/chat/conversations/${id}`).then((res) => res.data),
  createConversation: (
    data: CreateConversationDto,
  ): Promise<ConversationResponse> =>
    axiosInstance.post("/chat/conversations", data).then((res) => res.data),
  sendMessage: (
    conversationId: string,
    data: SendMessageDto,
  ): Promise<SendMessageResponse> =>
    axiosInstance
      .post(`/chat/conversations/${conversationId}/messages`, data)
      .then((res) => res.data),
  updateConversation: (
    id: string,
    title: string,
  ): Promise<ConversationResponse> =>
    axiosInstance
      .patch(`/chat/conversations/${id}`, { title })
      .then((res) => res.data),
  archiveConversation: (id: string): Promise<ConversationResponse> =>
    axiosInstance
      .patch(`/chat/conversations/${id}/archive`)
      .then((res) => res.data),
  deleteConversation: (id: string): Promise<void> =>
    axiosInstance.delete(`/chat/conversations/${id}`).then((res) => res.data),
  getAIInsights: (): Promise<AIInsightsResponse> =>
    axiosInstance.get("/chat/insights").then((res) => res.data),

  // Time Blocking
  getTimeBlocks: (
    start?: Date | string,
    end?: Date | string,
  ): Promise<TimeBlock[]> => {
    const params: Record<string, string> = {};
    if (start)
      params.start = start instanceof Date ? start.toISOString() : start;
    if (end) params.end = end instanceof Date ? end.toISOString() : end;
    return axiosInstance
      .get("/tasks/time-blocks", { params })
      .then((res) => res.data);
  },

  // Habits
  getHabits: (includeArchived?: boolean): Promise<Habit[]> =>
    axiosInstance
      .get("/habits", { params: { includeArchived } })
      .then((res) => res.data),
  getTodayHabits: (): Promise<Habit[]> =>
    axiosInstance.get("/habits/today").then((res) => res.data),
  getHabit: (id: string): Promise<Habit> =>
    axiosInstance.get(`/habits/${id}`).then((res) => res.data),
  getHabitStats: (id: string): Promise<HabitStats> =>
    axiosInstance.get(`/habits/${id}/stats`).then((res) => res.data),
  createHabit: (data: CreateHabitDto): Promise<Habit> =>
    axiosInstance.post("/habits", data).then((res) => res.data),
  updateHabit: (id: string, data: UpdateHabitDto): Promise<Habit> =>
    axiosInstance.patch(`/habits/${id}`, data).then((res) => res.data),
  deleteHabit: (id: string): Promise<void> =>
    axiosInstance.delete(`/habits/${id}`).then((res) => res.data),
  completeHabit: (id: string, data?: CompleteHabitDto): Promise<Habit> =>
    axiosInstance.post(`/habits/${id}/complete`, data).then((res) => res.data),
  uncompleteHabit: (id: string): Promise<void> =>
    axiosInstance.delete(`/habits/${id}/complete`).then((res) => res.data),
  pauseHabit: (id: string): Promise<Habit> =>
    axiosInstance.post(`/habits/${id}/pause`).then((res) => res.data),
  resumeHabit: (id: string): Promise<Habit> =>
    axiosInstance.post(`/habits/${id}/resume`).then((res) => res.data),

  // Objectives (OKRs)
  getObjectives: (): Promise<Objective[]> =>
    axiosInstance.get("/objectives").then((res) => res.data),
  getCurrentPeriodObjectives: (): Promise<Objective[]> =>
    axiosInstance.get("/objectives/current-period").then((res) => res.data),
  getObjectivesDashboardSummary: (): Promise<ObjectiveDashboardSummary> =>
    axiosInstance.get("/objectives/dashboard-summary").then((res) => res.data),
  getObjective: (id: string): Promise<Objective> =>
    axiosInstance.get(`/objectives/${id}`).then((res) => res.data),
  createObjective: (data: CreateObjectiveDto): Promise<Objective> =>
    axiosInstance.post("/objectives", data).then((res) => res.data),
  updateObjective: (id: string, data: UpdateObjectiveDto): Promise<Objective> =>
    axiosInstance.patch(`/objectives/${id}`, data).then((res) => res.data),
  deleteObjective: (id: string): Promise<void> =>
    axiosInstance.delete(`/objectives/${id}`).then((res) => res.data),

  addKeyResult: (
    objectiveId: string,
    data: CreateKeyResultDto,
  ): Promise<KeyResult> =>
    axiosInstance
      .post(`/objectives/${objectiveId}/key-results`, data)
      .then((res) => res.data),
  updateKeyResult: (
    keyResultId: string,
    data: UpdateKeyResultDto,
  ): Promise<KeyResult> =>
    axiosInstance
      .patch(`/objectives/key-results/${keyResultId}`, data)
      .then((res) => res.data),

  deleteKeyResult: (keyResultId: string): Promise<void> =>
    axiosInstance
      .delete(`/objectives/key-results/${keyResultId}`)
      .then((res) => res.data),

  linkTaskToKeyResult: (
    keyResultId: string,
    data: LinkTaskDto,
  ): Promise<KeyResult> =>
    axiosInstance
      .post(`/objectives/key-results/${keyResultId}/tasks`, data)
      .then((res) => res.data),

  unlinkTaskFromKeyResult: (
    keyResultId: string,
    taskId: string,
  ): Promise<KeyResult> =>
    axiosInstance
      .delete(
        `/objectives/key-results/${keyResultId}/tasks/${taskId}`,
      )
      .then((res) => res.data),

  // Notes
  getNotes: (workspaceId: string): Promise<Note[]> =>
    axiosInstance.get("/notes", { params: { workspaceId } }).then((res) => {
      // Handle paginated response: { data: [...], meta: {...} }
      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      // Handle direct array response
      if (res.data && Array.isArray(res.data)) {
        return res.data;
      }
      // Default to empty array if response is unexpected
      return [];
    }),
  getNote: (id: string): Promise<Note> =>
    axiosInstance.get(`/notes/${id}`).then((res) => res.data),
  createNote: (data: CreateNoteDto): Promise<Note> =>
    axiosInstance.post("/notes", data).then((res) => res.data),
  updateNote: (id: string, data: UpdateNoteDto): Promise<Note> =>
    axiosInstance.patch(`/notes/${id}`, data).then((res) => res.data),
  deleteNote: (id: string): Promise<void> =>
    axiosInstance.delete(`/notes/${id}`).then((res) => res.data),

  // Custom Fields
  getProjectCustomFields: (projectId: string): Promise<CustomField[]> =>
    axiosInstance
      .get(`/projects/${projectId}/custom-fields`)
      .then((res) => res.data),
  createCustomField: (
    projectId: string,
    data: CreateCustomFieldDto,
  ): Promise<CustomField> =>
    axiosInstance
      .post(`/projects/${projectId}/custom-fields`, data)
      .then((res) => res.data),
  updateCustomField: (
    fieldId: string,
    data: UpdateCustomFieldDto,
  ): Promise<CustomField> =>
    axiosInstance
      .patch(`/custom-fields/${fieldId}`, data)
      .then((res) => res.data),
  deleteCustomField: (fieldId: string): Promise<void> =>
    axiosInstance.delete(`/custom-fields/${fieldId}`).then((res) => res.data),
  getTaskCustomValues: (taskId: string): Promise<CustomFieldValue[]> =>
    axiosInstance.get(`/tasks/${taskId}/custom-values`).then((res) => res.data),
  setTaskCustomValues: (
    taskId: string,
    data: SetMultipleCustomFieldValuesDto,
  ): Promise<void> =>
    axiosInstance
      .patch(`/tasks/${taskId}/custom-values`, data)
      .then((res) => res.data),

  // Semantic Search
  semanticSearch: (
    query: string,
    options?: { types?: string; projectId?: string; limit?: number },
  ): Promise<any[]> =>
    axiosInstance
      .get("/search", { params: { q: query, ...options } })
      .then((res) => res.data),
  searchSuggestions: (query: string) =>
    axiosInstance
      .get("/search/suggestions", { params: { q: query } })
      .then((res) => res.data),
  askAI: (question: string) =>
    axiosInstance
      .get("/search/ask", { params: { q: question } })
      .then((res) => res.data),

  // Meetings
  analyzeMeetingTranscript: (
    transcript: string,
    options?: {
      meetingTitle?: string;
      participants?: string[];
      duration?: number;
    },
  ) =>
    axiosInstance
      .post("/meetings/analyze", { transcript, ...options })
      .then((res) => res.data),
  extractMeetingActions: (transcript: string, projectContext?: string) =>
    axiosInstance
      .post("/meetings/extract-actions", { transcript, projectContext })
      .then((res) => res.data),
  generateMeetingSummary: (
    transcript: string,
    style?: "executive" | "detailed" | "bullet-points",
  ) =>
    axiosInstance
      .post("/meetings/summary", { transcript, style })
      .then((res) => res.data),
  convertActionsToTasks: (
    actionItems: any[],
    options?: { projectId?: string },
  ) =>
    axiosInstance
      .post("/meetings/convert-to-tasks", { actionItems, ...options })
      .then((res) => res.data),
  quickAnalyzeMeeting: (transcript: string, projectId?: string) =>
    axiosInstance
      .post("/meetings/quick-analyze", { transcript, projectId })
      .then((res) => res.data),
  saveMeeting: (data: {
    title: string;
    date: string | Date;
    duration: number;
    transcript?: string;
    audioUrl?: string;
    analysis?: any;
    projectId?: string;
  }) =>
    axiosInstance.post("/meetings/save", data).then((res) => res.data),
  getMeetings: (params?: { projectId?: string; limit?: number }) =>
    axiosInstance.get("/meetings", { params }).then((res) => res.data),
  getMeetingById: (id: string) =>
    axiosInstance.get(`/meetings/${id}`).then((res) => res.data),
  deleteMeeting: (id: string) =>
    axiosInstance.delete(`/meetings/${id}`).then((res) => res.data),

  // Focus Audio
  getFocusTracks: () =>
    axiosInstance.get("/focus/tracks").then((res) => res.data),
  getRecommendedTracks: () =>
    axiosInstance.get("/focus/tracks/recommended").then((res) => res.data),
  getFocusModes: () =>
    axiosInstance.get("/focus/modes").then((res) => res.data),
  getFocusFavorites: () =>
    axiosInstance.get("/focus/favorites").then((res) => res.data),
  toggleFocusFavorite: (trackId: string) =>
    axiosInstance.post(`/focus/favorites/${trackId}`).then((res) => res.data),
  getFocusPreferences: () =>
    axiosInstance.get("/focus/preferences").then((res) => res.data),
  updateFocusPreferences: (data: any) =>
    axiosInstance.patch("/focus/preferences", data).then((res) => res.data),
  getFocusStats: () =>
    axiosInstance.get("/focus/stats").then((res) => res.data),

  // Team Workload
  getWorkspaceWorkload: (workspaceId: string) =>
    axiosInstance
      .get(`/workload/workspace/${workspaceId}`)
      .then((res) => res.data),
  getMemberWorkload: (userId: string, workspaceId?: string) =>
    axiosInstance
      .get(`/workload/member/${userId}`, { params: { workspaceId } })
      .then((res) => res.data),
  getMyWorkload: (workspaceId?: string) =>
    axiosInstance
      .get("/workload/me", { params: { workspaceId } })
      .then((res) => res.data),
  getWorkloadSuggestions: (workspaceId: string) =>
    axiosInstance
      .get(`/workload/suggestions/${workspaceId}`)
      .then((res) => res.data),

  // Burnout Prevention
  getBurnoutAnalysis: () =>
    axiosInstance.get("/ai/burnout/analysis").then((res) => res.data),
  getWorkPatterns: () =>
    axiosInstance.get("/ai/burnout/patterns").then((res) => res.data),
  getRestRecommendations: () =>
    axiosInstance.get("/ai/burnout/recommendations").then((res) => res.data),
  checkBurnoutIntervention: () =>
    axiosInstance.get("/ai/burnout/intervention").then((res) => res.data),
  getWeeklyWellbeingSummary: () =>
    axiosInstance.get("/ai/burnout/weekly-summary").then((res) => res.data),

  // Analytics - Productivity Streak
  getProductivityStreak: () =>
    axiosInstance.get("/analytics/streak").then((res) => res.data),

  // Sessions Management
  getSessions: (): Promise<any[]> =>
    axiosInstance.get("/sessions").then((res) => res.data),
  revokeSession: (sessionId: string): Promise<void> =>
    axiosInstance.delete(`/sessions/${sessionId}`).then((res) => res.data),
  revokeAllOtherSessions: (): Promise<void> =>
    axiosInstance.delete("/sessions/others/all").then((res) => res.data),

  // Gamification
  getGamificationProfile: (): Promise<{
    xp: number;
    level: number;
    currentLevelProgress: number;
    nextLevelXp: number;
    achievementsTotal: number;
    achievementsUnlocked: number;
    achievements: Array<{
      id: string;
      code: string;
      name: string;
      description: string;
      icon: string;
      xpReward: number;
      isUnlocked: boolean;
      unlockedAt: string | null;
    }>;
  }> => axiosInstance.get("/gamification/me").then((res) => res.data),
};
// Export apiClient as default for convenient importing
export default apiClient;
