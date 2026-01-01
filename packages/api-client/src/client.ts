import axios, { AxiosInstance, AxiosError } from "axios";
import type { TokenStorage } from "./utils/storage";
import type {
  // Auth
  RegisterDto,
  LoginDto,
  AuthResponse,
  RefreshTokenDto,
  // User
  User,
  UpdateProfileDto,
  UserResponse,
  UserProfileResponse,
  UserPreferences,
  UpdatePreferencesDto,
  UserIntegration,
  // Workspace
  Workspace,
  WorkspaceWithMembers,
  WorkspaceMember,
  WorkspaceInvitation,
  WorkspaceSettings,
  WorkspaceAuditLog,
  WorkspaceAuditLogsResponse,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  UpdateWorkspaceSettingsDto,
  AddMemberDto,
  InviteMemberDto,
  AcceptInvitationDto,
  MemberRole,
  // Workflow
  Workflow,
  CreateWorkflowDto,
  UpdateWorkflowDto,
  // Project
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  // Task
  Task,
  TaskDetails,
  TaskShareResponse,
  PublicTaskResponse,
  TodayTasksResponse,
  TimeBlock,
  CreateTaskDto,
  UpdateTaskDto,
  CreateSubtaskDto,
  // Tag
  Tag,
  CreateTagDto,
  UpdateTagDto,
  // Timer
  TimeSession,
  StartTimerDto,
  StopTimerDto,
  ActiveTimerResponse,
  GetSessionsParams,
  PaginatedSessionsResponse,
  GetTimerStatsParams,
  TimerStatsResponse,
  TaskTimeResponse,
  CreateTimerSessionDto,
  UpdateTimerSessionDto,

  // Analytics
  DailyMetrics,
  GetDailyMetricsParams,
  // Comment
  Comment,
  CreateCommentDto,
  UpdateCommentDto,
  // Attachment
  Attachment,
  CreateAttachmentDto,
  // AI
  AIProfile,
  OptimalScheduleResponse,
  PredictDurationResponse,
  WeeklyReportResponse,
  ProductivityReport,
  // Notifications
  Notification,
  UnreadCountResponse,
  // Chat
  CreateConversationDto,
  SendMessageDto,
  ChatMessageResponse,
  ConversationResponse,
  ConversationDetail,
  SendMessageResponse,
  AIInsightsResponse,
  // Habits
  Habit,
  CreateHabitDto,
  UpdateHabitDto,
  CompleteHabitDto,
  HabitStats,
  TodayHabitsResponse,
  CompleteHabitResponse,
  // Objectives (OKRs)
  Objective,
  KeyResult,
  KeyResultTask,
  CreateObjectiveDto,
  UpdateObjectiveDto,
  CreateKeyResultDto,
  UpdateKeyResultDto,
  LinkTaskDto,
  ObjectiveDashboardSummary,
  // Custom Fields
  CustomField,
  CustomFieldValue,
  CreateCustomFieldDto,
  UpdateCustomFieldDto,
  SetMultipleCustomFieldValuesDto,
} from "./types";

/**
 * Configuration options for the OrdoApiClient
 */
export interface ClientConfig {
  /**
   * Base URL for the API (e.g., 'http://localhost:3001/api/v1')
   */
  baseURL: string;

  /**
   * Optional token storage implementation.
   * If not provided, no automatic token management will be performed.
   */
  tokenStorage?: TokenStorage;

  /**
   * Optional request timeout in milliseconds.
   * Default: 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Optional callback for token refresh.
   * Called when a 401 error is received and refresh token is available.
   */
  onTokenRefresh?: (tokens: AuthResponse) => void | Promise<void>;

  /**
   * Optional callback for authentication errors.
   * Called when token refresh fails or no refresh token is available.
   */
  onAuthError?: () => void | Promise<void>;
}

/**
 * Main API client for Ordo-Todo applications.
 *
 * Provides methods for all 52 REST API endpoints.
 * Supports automatic JWT token management via TokenStorage.
 *
 * @example
 * ```typescript
 * import { OrdoApiClient, LocalStorageTokenStorage } from '@ordo-todo/api-client';
 *
 * const client = new OrdoApiClient({
 *   baseURL: 'http://localhost:3001/api/v1',
 *   tokenStorage: new LocalStorageTokenStorage(),
 * });
 *
 * // Login
 * const authResponse = await client.login({
 *   email: 'user@example.com',
 *   password: 'password123',
 * });
 *
 * // Create task
 * const task = await client.createTask({
 *   title: 'My task',
 *   projectId: 'project-id',
 * });
 * ```
 */
export class OrdoApiClient {
  protected axios: AxiosInstance;
  private tokenStorage?: TokenStorage;
  private isRefreshing = false;
  private refreshPromise: Promise<AuthResponse> | null = null;
  private onTokenRefresh?: (tokens: AuthResponse) => void | Promise<void>;
  private onAuthError?: () => void | Promise<void>;

  constructor(config: ClientConfig) {
    this.tokenStorage = config.tokenStorage;
    this.onTokenRefresh = config.onTokenRefresh;
    this.onAuthError = config.onAuthError;

    this.axios = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors for automatic token management
   */
  private setupInterceptors(): void {
    // Request interceptor - attach JWT token
    this.axios.interceptors.request.use(
      async (config) => {
        // Skip for refresh endpoint to avoid circular dependency/deadlock
        // and to prevent sending expired tokens to the refresh endpoint
        if (config.url?.includes("/auth/refresh")) {
          return config;
        }

        if (this.tokenStorage) {
          const token = await this.tokenStorage.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor - handle errors and token refresh
    this.axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            const newTokens = await this.handleTokenRefresh();

            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;

            // Retry the original request
            return this.axios(originalRequest);
          } catch (refreshError) {
            // Token refresh failed, call auth error callback
            if (this.onAuthError) {
              await this.onAuthError();
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  /**
   * Handle token refresh logic with deduplication
   */
  private async handleTokenRefresh(): Promise<AuthResponse> {
    // If already refreshing, wait for that promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;

    this.refreshPromise = (async () => {
      try {
        if (!this.tokenStorage) {
          throw new Error("No token storage configured");
        }

        const refreshToken = await this.tokenStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call refresh endpoint
        const response = await this.refreshToken({ refreshToken });

        // Store new tokens
        await this.tokenStorage.setToken(response.accessToken);
        await this.tokenStorage.setRefreshToken(response.refreshToken);

        // Call refresh callback
        if (this.onTokenRefresh) {
          await this.onTokenRefresh(response);
        }

        return response;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // ============ AUTH ENDPOINTS (3) ============

  /**
   * Register a new user account
   * POST /auth/register
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await this.axios.post<AuthResponse>(
      "/auth/register",
      data,
    );

    // Store tokens if storage is available
    if (this.tokenStorage) {
      await this.tokenStorage.setToken(response.data.accessToken);
      await this.tokenStorage.setRefreshToken(response.data.refreshToken);
    }

    return response.data;
  }

  /**
   * Login with email and password
   * POST /auth/login
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await this.axios.post<AuthResponse>("/auth/login", data);

    // Store tokens if storage is available
    if (this.tokenStorage) {
      await this.tokenStorage.setToken(response.data.accessToken);
      await this.tokenStorage.setRefreshToken(response.data.refreshToken);
    }

    return response.data;
  }

  /**
   * Refresh access token using refresh token
   * POST /auth/refresh
   */
  async refreshToken(data: RefreshTokenDto): Promise<AuthResponse> {
    const response = await this.axios.post<AuthResponse>("/auth/refresh", data);
    return response.data;
  }

  /**
   * Check if a username is available
   * POST /auth/check-username
   */
  async checkUsernameAvailability(
    username: string,
  ): Promise<{ available: boolean; message?: string }> {
    const response = await this.axios.post<{
      available: boolean;
      message?: string;
    }>("/auth/check-username", { username });
    return response.data;
  }

  /**
   * Logout (clear tokens from storage)
   * This is a client-side only operation
   */
  async logout(): Promise<void> {
    if (this.tokenStorage) {
      await this.tokenStorage.removeToken();
      await this.tokenStorage.removeRefreshToken();
    }
  }

  // ============ USER ENDPOINTS (8) ============

  /**
   * Get current authenticated user
   * GET /users/me
   */
  async getCurrentUser(): Promise<UserResponse> {
    const response = await this.axios.get<UserResponse>("/users/me");
    return response.data;
  }

  /**
   * Get full user profile with subscription, integrations, and preferences
   * GET /users/me/profile
   */
  async getFullProfile(): Promise<UserProfileResponse> {
    const response =
      await this.axios.get<UserProfileResponse>("/users/me/profile");
    return response.data;
  }

  /**
   * Update current user profile
   * PUT /users/me
   */
  async updateProfile(
    data: UpdateProfileDto,
  ): Promise<{ success: boolean; user: User }> {
    const response = await this.axios.put<{ success: boolean; user: User }>(
      "/users/me",
      data,
    );
    return response.data;
  }

  /**
   * Get user preferences
   * GET /users/me/preferences
   */
  async getPreferences(): Promise<UserPreferences | null> {
    const response = await this.axios.get<UserPreferences | null>(
      "/users/me/preferences",
    );
    return response.data;
  }

  /**
   * Update user preferences (AI and privacy settings)
   * PATCH /users/me/preferences
   */
  async updatePreferences(
    data: UpdatePreferencesDto,
  ): Promise<{ success: boolean; preferences: UserPreferences }> {
    const response = await this.axios.patch<{
      success: boolean;
      preferences: UserPreferences;
    }>("/users/me/preferences", data);
    return response.data;
  }

  /**
   * Get user integrations
   * GET /users/me/integrations
   */
  async getIntegrations(): Promise<UserIntegration[]> {
    const response = await this.axios.get<UserIntegration[]>(
      "/users/me/integrations",
    );
    return response.data;
  }

  /**
   * Export user data (GDPR)
   * POST /users/me/export
   */
  async exportData(): Promise<Blob> {
    const response = await this.axios.post("/users/me/export", null, {
      responseType: "blob",
    });
    return response.data;
  }

  /**
   * Delete user account
   * DELETE /users/me
   */
  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    const response = await this.axios.delete<{
      success: boolean;
      message: string;
    }>("/users/me");
    return response.data;
  }

  // ============ WORKSPACE ENDPOINTS (7) ============

  /**
   * Create a new workspace
   * POST /workspaces
   */
  async createWorkspace(data: CreateWorkspaceDto): Promise<Workspace> {
    const response = await this.axios.post<Workspace>("/workspaces", data);
    return response.data;
  }

  /**
   * Get all workspaces for current user
   * GET /workspaces
   */
  async getWorkspaces(): Promise<Workspace[]> {
    const response = await this.axios.get<Workspace[]>("/workspaces");
    return response.data;
  }

  /**
   * Get a specific workspace by ID
   * GET /workspaces/:id
   */
  async getWorkspace(workspaceId: string): Promise<WorkspaceWithMembers> {
    const response = await this.axios.get<WorkspaceWithMembers>(
      `/workspaces/${workspaceId}`,
    );
    return response.data;
  }

  /**
   * Get a specific workspace by Slug and Username
   * GET /workspaces/:username/:slug
   */
  async getWorkspaceBySlug(
    username: string,
    slug: string,
  ): Promise<WorkspaceWithMembers> {
    const response = await this.axios.get<WorkspaceWithMembers>(
      `/workspaces/${username}/${slug}`,
    );
    return response.data;
  }

  /**
   * Update a workspace
   * PUT /workspaces/:id
   */
  async updateWorkspace(
    workspaceId: string,
    data: UpdateWorkspaceDto,
  ): Promise<Workspace> {
    const response = await this.axios.put<Workspace>(
      `/workspaces/${workspaceId}`,
      data,
    );
    return response.data;
  }

  /**
   * Delete a workspace
   * DELETE /workspaces/:id
   */
  async deleteWorkspace(workspaceId: string): Promise<void> {
    await this.axios.delete(`/workspaces/${workspaceId}`);
  }

  /**
   * Get all deleted workspaces (trash)
   * GET /workspaces/deleted
   */
  async getDeletedWorkspaces(): Promise<Workspace[]> {
    const response = await this.axios.get<Workspace[]>("/workspaces/deleted");
    return response.data;
  }

  /**
   * Restore a deleted workspace
   * POST /workspaces/:id/restore
   */
  async restoreWorkspace(workspaceId: string): Promise<{ success: boolean }> {
    const response = await this.axios.post<{ success: boolean }>(
      `/workspaces/${workspaceId}/restore`,
    );
    return response.data;
  }

  /**
   * Permanently delete a workspace
   * DELETE /workspaces/:id/permanent
   */
  async permanentDeleteWorkspace(workspaceId: string): Promise<void> {
    await this.axios.delete(`/workspaces/${workspaceId}/permanent`);
  }

  /**
   * Add a member to a workspace
   * POST /workspaces/:id/members
   */
  async addWorkspaceMember(
    workspaceId: string,
    data: AddMemberDto,
  ): Promise<{ success: boolean }> {
    const response = await this.axios.post<{ success: boolean }>(
      `/workspaces/${workspaceId}/members`,
      data,
    );
    return response.data;
  }

  /**
   * Remove a member from a workspace
   * DELETE /workspaces/:id/members/:userId
   */
  async removeWorkspaceMember(
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    await this.axios.delete(`/workspaces/${workspaceId}/members/${userId}`);
  }

  // ============ WORKFLOW ENDPOINTS (4) ============

  /**
   * Create a new workflow
   * POST /workflows
   */
  async createWorkflow(data: CreateWorkflowDto): Promise<Workflow> {
    const response = await this.axios.post<Workflow>("/workflows", data);
    return response.data;
  }

  /**
   * Get all workflows for a workspace
   * GET /workflows?workspaceId=xxx
   */
  async getWorkflows(workspaceId: string): Promise<Workflow[]> {
    const response = await this.axios.get<Workflow[]>("/workflows", {
      params: { workspaceId },
    });
    return response.data;
  }

  /**
   * Update a workflow
   * PUT /workflows/:id
   */
  async updateWorkflow(
    workflowId: string,
    data: UpdateWorkflowDto,
  ): Promise<Workflow> {
    const response = await this.axios.put<Workflow>(
      `/workflows/${workflowId}`,
      data,
    );
    return response.data;
  }

  /**
   * Delete a workflow
   * DELETE /workflows/:id
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    await this.axios.delete(`/workflows/${workflowId}`);
  }

  // ============ PROJECT ENDPOINTS (7) ============

  /**
   * Create a new project
   * POST /projects
   */
  async createProject(data: CreateProjectDto): Promise<Project> {
    const response = await this.axios.post<Project>("/projects", data);
    return response.data;
  }

  /**
   * Get all projects for a workspace
   * GET /projects?workspaceId=xxx
   */
  async getProjects(workspaceId: string): Promise<Project[]> {
    const response = await this.axios.get<Project[]>("/projects", {
      params: { workspaceId },
    });
    return response.data;
  }

  /**
   * Get all projects across all workspaces
   * GET /projects/all
   */
  async getAllProjects(): Promise<Project[]> {
    const response = await this.axios.get<Project[]>("/projects/all");
    return response.data;
  }

  /**
   * Get a specific project by ID
   * GET /projects/:id
   */
  async getProject(projectId: string): Promise<Project> {
    const response = await this.axios.get<Project>(`/projects/${projectId}`);
    return response.data;
  }

  /**
   * Get a specific project by slug and username
   * GET /projects/:username/:projectSlug
   */
  async getProjectBySlug(
    username: string,
    projectSlug: string,
  ): Promise<Project> {
    const response = await this.axios.get<Project>(
      `/projects/${username}/${projectSlug}`,
    );
    return response.data;
  }

  /**
   * Get a project by workspace and project slugs
   * GET /projects/by-slug/:workspaceSlug/:projectSlug
   */
  async getProjectBySlugs(
    workspaceSlug: string,
    projectSlug: string,
  ): Promise<Project> {
    const response = await this.axios.get<Project>(
      `/projects/by-slug/${workspaceSlug}/${projectSlug}`,
    );
    return response.data;
  }

  /**
   * Update a project
   * PUT /projects/:id
   */
  async updateProject(
    projectId: string,
    data: UpdateProjectDto,
  ): Promise<Project> {
    const response = await this.axios.put<Project>(
      `/projects/${projectId}`,
      data,
    );
    return response.data;
  }

  /**
   * Archive a project
   * PATCH /projects/:id/archive
   */
  async archiveProject(projectId: string): Promise<Project> {
    const response = await this.axios.patch<Project>(
      `/projects/${projectId}/archive`,
    );
    return response.data;
  }

  /**
   * Complete a project (mark as finished)
   * PATCH /projects/:id/complete
   */
  async completeProject(projectId: string): Promise<Project> {
    const response = await this.axios.patch<Project>(
      `/projects/${projectId}/complete`,
    );
    return response.data;
  }

  /**
   * Delete a project
   * DELETE /projects/:id
   */
  async deleteProject(projectId: string): Promise<void> {
    await this.axios.delete(`/projects/${projectId}`);
  }

  // ============ TASK ENDPOINTS (8) ============

  /**
   * Create a new task
   * POST /tasks
   */
  async createTask(data: CreateTaskDto): Promise<Task> {
    const response = await this.axios.post<Task>("/tasks", data);
    return response.data;
  }

  /**
   * Mark a task as complete
   * PATCH /tasks/:id/complete
   */
  async completeTask(taskId: string): Promise<Task> {
    const response = await this.axios.patch<Task>(`/tasks/${taskId}/complete`);
    return response.data;
  }
  /**
   * Get all tasks (optionally filtered by project)
   * GET /tasks?projectId=xxx
   */
  async getTasks(projectId?: string, tags?: string[]): Promise<Task[]> {
    const params: any = {};
    if (projectId) params.projectId = projectId;
    if (tags && tags.length > 0) params.tags = tags;

    const response = await this.axios.get<Task[]>("/tasks", {
      params,
    });
    return response.data;
  }

  /**
   * Get tasks categorized for today view
   * GET /tasks/today
   * Returns: overdue, dueToday, scheduledToday, available, notYetAvailable
   */
  async getTasksToday(): Promise<TodayTasksResponse> {
    const response = await this.axios.get<TodayTasksResponse>("/tasks/today");
    return response.data;
  }

  /**
   * Get tasks scheduled for a specific date
   * GET /tasks/scheduled?date=xxx
   */
  async getScheduledTasks(date?: Date | string): Promise<Task[]> {
    const params: any = {};
    if (date) {
      params.date = typeof date === "string" ? date : date.toISOString();
    }
    const response = await this.axios.get<Task[]>("/tasks/scheduled", {
      params,
    });
    return response.data;
  }

  /**
   * Get all available tasks (can be started today)
   * GET /tasks/available?projectId=xxx
   */
  async getAvailableTasks(projectId?: string): Promise<Task[]> {
    const params: any = {};
    if (projectId) params.projectId = projectId;
    const response = await this.axios.get<Task[]>("/tasks/available", {
      params,
    });
    return response.data;
  }

  /**
   * Get time-blocked tasks within a date range for calendar view
   * GET /tasks/time-blocks?start=xxx&end=xxx
   */
  async getTimeBlocks(
    start?: Date | string,
    end?: Date | string,
  ): Promise<TimeBlock[]> {
    const params: any = {};
    if (start)
      params.start = start instanceof Date ? start.toISOString() : start;
    if (end) params.end = end instanceof Date ? end.toISOString() : end;
    const response = await this.axios.get<TimeBlock[]>("/tasks/time-blocks", {
      params,
    });
    return response.data;
  }

  async getTask(taskId: string): Promise<Task> {
    const response = await this.axios.get<Task>(`/tasks/${taskId}`);
    return response.data;
  }

  /**
   * Get task details with all relations (subtasks, comments, attachments)
   * GET /tasks/:id/details
   */
  async getTaskDetails(taskId: string): Promise<TaskDetails> {
    const response = await this.axios.get<TaskDetails>(
      `/tasks/${taskId}/details`,
    );
    return response.data;
  }

  /**
   * Update a task
   * PUT /tasks/:id
   */
  async updateTask(taskId: string, data: UpdateTaskDto): Promise<Task> {
    const response = await this.axios.put<Task>(`/tasks/${taskId}`, data);
    return response.data;
  }

  /**
   * Delete a task
   * DELETE /tasks/:id
   */
  async deleteTask(taskId: string): Promise<void> {
    await this.axios.delete(`/tasks/${taskId}`);
  }

  /**
   * Create a subtask under a parent task
   * POST /tasks/:id/subtasks
   */
  async createSubtask(
    parentTaskId: string,
    data: CreateSubtaskDto,
  ): Promise<Task> {
    const response = await this.axios.post<Task>(
      `/tasks/${parentTaskId}/subtasks`,
      data,
    );
    return response.data;
  }

  /**
   * Assign a task to a user
   * POST /tasks/:id/assign
   */
  async assignTask(taskId: string, userId: string): Promise<Task> {
    const response = await this.axios.post<Task>(`/tasks/${taskId}/assign`, {
      userId,
    });
    return response.data;
  }

  /**
   * Unassign a task from a user
   * DELETE /tasks/:id/assign
   */
  async unassignTask(taskId: string, userId: string): Promise<Task> {
    const response = await this.axios.delete<Task>(
      `/tasks/${taskId}/assign/${userId}`,
    );
    return response.data;
  }

  // ============ TAG ENDPOINTS (6) ============

  /**
   * Create a new tag
   * POST /tags
   */
  async createTag(data: CreateTagDto): Promise<Tag> {
    const response = await this.axios.post<Tag>("/tags", data);
    return response.data;
  }

  /**
   * Get all tags for a workspace
   * GET /tags?workspaceId=xxx
   */
  async getTags(workspaceId: string): Promise<Tag[]> {
    const response = await this.axios.get<Tag[]>("/tags", {
      params: { workspaceId },
    });
    return response.data;
  }

  /**
   * Assign a tag to a task
   * POST /tags/:tagId/tasks/:taskId
   */
  async assignTagToTask(
    tagId: string,
    taskId: string,
  ): Promise<{ success: boolean }> {
    const response = await this.axios.post<{ success: boolean }>(
      `/tags/${tagId}/tasks/${taskId}`,
    );
    return response.data;
  }

  /**
   * Remove a tag from a task
   * DELETE /tags/:tagId/tasks/:taskId
   */
  async removeTagFromTask(tagId: string, taskId: string): Promise<void> {
    await this.axios.delete(`/tags/${tagId}/tasks/${taskId}`);
  }

  /**
   * Get all tags for a specific task
   * GET /tasks/:taskId/tags
   */
  async getTaskTags(taskId: string): Promise<Tag[]> {
    const response = await this.axios.get<Tag[]>(`/tasks/${taskId}/tags`);
    return response.data;
  }

  /**
   * Delete a tag
   * DELETE /tags/:id
   */
  async deleteTag(tagId: string): Promise<void> {
    await this.axios.delete(`/tags/${tagId}`);
  }

  // ============ TIMER ENDPOINTS (6) ============

  /**
   * Start a timer session for a task
   * POST /timers/start
   */
  async startTimer(data: StartTimerDto): Promise<TimeSession> {
    const response = await this.axios.post<TimeSession>("/timers/start", data);
    return response.data;
  }

  /**
   * Stop the current timer session
   * POST /timers/stop
   */
  async stopTimer(data: StopTimerDto): Promise<TimeSession> {
    const response = await this.axios.post<TimeSession>("/timers/stop", data);
    return response.data;
  }

  /**
   * Get the current active timer session
   * GET /timers/active
   */
  async getActiveTimer(): Promise<ActiveTimerResponse> {
    const response =
      await this.axios.get<ActiveTimerResponse>("/timers/active");
    return response.data;
  }

  /**
   * Pause the current timer session
   * POST /timers/pause
   */
  async pauseTimer(data?: { pauseStartedAt?: Date }): Promise<TimeSession> {
    const response = await this.axios.post<TimeSession>(
      "/timers/pause",
      data || {},
    );
    return response.data;
  }

  /**
   * Resume a paused timer session
   * POST /timers/resume
   */
  async resumeTimer(data: { pauseStartedAt: Date }): Promise<TimeSession> {
    const response = await this.axios.post<TimeSession>("/timers/resume", data);
    return response.data;
  }

  /**
   * Switch to a different task during an active timer session
   * POST /timers/switch-task
   */
  async switchTask(data: {
    newTaskId: string;
    type?: string;
    splitReason?: string;
  }): Promise<{
    oldSession: TimeSession;
    newSession: TimeSession;
  }> {
    const response = await this.axios.post<{
      oldSession: TimeSession;
      newSession: TimeSession;
    }>("/timers/switch-task", data);
    return response.data;
  }

  /**
   * Get timer session history with filters and pagination
   * GET /timers/history
   */
  async getSessionHistory(
    params?: GetSessionsParams,
  ): Promise<PaginatedSessionsResponse> {
    const response = await this.axios.get<PaginatedSessionsResponse>(
      "/timers/history",
      {
        params,
      },
    );
    return response.data;
  }

  /**
   * Get timer statistics for the current user
   * GET /timers/stats
   */
  async getTimerStats(
    params?: GetTimerStatsParams,
  ): Promise<TimerStatsResponse> {
    const response = await this.axios.get<TimerStatsResponse>("/timers/stats", {
      params,
    });
    return response.data;
  }

  /**
   * Get time tracking info for a specific task
   * GET /timers/task/:taskId
   */
  async getTaskTimeSessions(taskId: string): Promise<TaskTimeResponse> {
    const response = await this.axios.get<TaskTimeResponse>(
      `/timers/task/${taskId}`,
    );
    return response.data;
  }

  // ============ ANALYTICS ENDPOINTS (6) ============

  /**
   * Get daily metrics for current user
   * GET /analytics/daily?startDate=xxx&endDate=xxx
   */
  async getDailyMetrics(
    params?: GetDailyMetricsParams,
  ): Promise<DailyMetrics[]> {
    const response = await this.axios.get<DailyMetrics[]>("/analytics/daily", {
      params,
    });
    return response.data;
  }

  /**
   * Get dashboard stats (pomodoros, tasks, minutes, trends)
   * GET /analytics/dashboard-stats
   */
  async getDashboardStats(): Promise<{
    pomodoros: number;
    tasks: number;
    minutes: number;
    avgPerDay: number;
    trends: {
      pomodoros: number;
      tasks: number;
      minutes: number;
    };
  }> {
    const response = await this.axios.get("/analytics/dashboard-stats");
    return response.data;
  }

  /**
   * Get weekly metrics
   * GET /analytics/weekly
   */
  async getWeeklyMetrics(): Promise<
    Array<{
      date: string;
      pomodorosCount: number;
      focusDuration: number;
      tasksCompletedCount: number;
    }>
  > {
    const response = await this.axios.get("/analytics/weekly");
    return response.data;
  }

  /**
   * Get heatmap data (activity by hour/day)
   * GET /analytics/heatmap
   */
  async getHeatmapData(): Promise<
    Array<{
      day: number;
      hour: number;
      value: number;
    }>
  > {
    const response = await this.axios.get("/analytics/heatmap");
    return response.data;
  }

  /**
   * Get project time distribution
   * GET /analytics/project-distribution
   */
  async getProjectDistribution(): Promise<
    Array<{
      name: string;
      value: number;
    }>
  > {
    const response = await this.axios.get("/analytics/project-distribution");
    return response.data;
  }

  /**
   * Get task status distribution
   * GET /analytics/task-status-distribution
   */
  async getTaskStatusDistribution(): Promise<
    Array<{
      status: string;
      count: number;
    }>
  > {
    const response = await this.axios.get(
      "/analytics/task-status-distribution",
    );
    return response.data;
  }

  // ============ COMMENT ENDPOINTS (4) ============

  /**
   * Create a new comment on a task
   * POST /comments
   */
  async createComment(data: CreateCommentDto): Promise<Comment> {
    const response = await this.axios.post<Comment>("/comments", data);
    return response.data;
  }

  /**
   * Update a comment
   * PUT /comments/:id
   */
  async updateComment(
    commentId: string,
    data: UpdateCommentDto,
  ): Promise<Comment> {
    const response = await this.axios.put<Comment>(
      `/comments/${commentId}`,
      data,
    );
    return response.data;
  }

  /**
   * Delete a comment
   * DELETE /comments/:id
   */
  async deleteComment(commentId: string): Promise<void> {
    await this.axios.delete(`/comments/${commentId}`);
  }

  /**
   * Get all comments for a task
   * GET /tasks/:taskId/comments
   */
  async getTaskComments(taskId: string): Promise<Comment[]> {
    const response = await this.axios.get<Comment[]>(
      `/tasks/${taskId}/comments`,
    );
    return response.data;
  }

  // ============ ATTACHMENT ENDPOINTS (3) ============

  /**
   * Create a new attachment on a task
   * POST /attachments
   */
  async createAttachment(data: CreateAttachmentDto): Promise<Attachment> {
    const response = await this.axios.post<Attachment>("/attachments", data);
    return response.data;
  }

  /**
   * Delete an attachment
   * DELETE /attachments/:id
   */
  async deleteAttachment(attachmentId: string): Promise<void> {
    await this.axios.delete(`/attachments/${attachmentId}`);
  }

  /**
   * Get all attachments for a task
   * GET /tasks/:taskId/attachments
   */
  async getTaskAttachments(taskId: string): Promise<Attachment[]> {
    const response = await this.axios.get<Attachment[]>(
      `/tasks/${taskId}/attachments`,
    );
    return response.data;
  }

  // ============ AI ENDPOINTS (7) ============

  /**
   * Get AI profile for current user
   * GET /ai/profile
   */
  async getAIProfile(): Promise<AIProfile> {
    const response = await this.axios.get<AIProfile>("/ai/profile");
    return response.data;
  }

  /**
   * Get optimal schedule based on AI profile
   * GET /ai/optimal-schedule
   */
  async getOptimalSchedule(topN?: number): Promise<OptimalScheduleResponse> {
    const response = await this.axios.get<OptimalScheduleResponse>(
      "/ai/optimal-schedule",
      {
        params: { topN },
      },
    );
    return response.data;
  }

  /**
   * Predict task duration based on AI profile
   * GET /ai/predict-duration
   */
  async predictTaskDuration(params: {
    title?: string;
    description?: string;
    category?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  }): Promise<PredictDurationResponse> {
    const response = await this.axios.get<PredictDurationResponse>(
      "/ai/predict-duration",
      {
        params,
      },
    );
    return response.data;
  }

  /**
   * Generate weekly productivity report
   * POST /ai/reports/weekly
   */
  async generateWeeklyReport(
    weekStart?: string,
  ): Promise<WeeklyReportResponse> {
    const response = await this.axios.post<WeeklyReportResponse>(
      "/ai/reports/weekly",
      null,
      {
        params: { weekStart },
      },
    );
    return response.data;
  }

  /**
   * Get productivity reports
   * GET /ai/reports
   */
  async getReports(params?: {
    scope?: string;
    limit?: number;
    offset?: number;
  }): Promise<ProductivityReport[]> {
    const response = await this.axios.get<ProductivityReport[]>("/ai/reports", {
      params,
    });
    return response.data;
  }

  /**
   * Get a specific productivity report
   * GET /ai/reports/:id
   */
  async getReport(reportId: string): Promise<ProductivityReport> {
    const response = await this.axios.get<ProductivityReport>(
      `/ai/reports/${reportId}`,
    );
    return response.data;
  }

  /**
   * Delete a productivity report
   * DELETE /ai/reports/:id
   */
  async deleteReport(reportId: string): Promise<void> {
    await this.axios.delete(`/ai/reports/${reportId}`);
  }

  // ============ EXTENDED WORKSPACE ENDPOINTS ============

  /**
   * Get workspace members
   * GET /workspaces/:id/members
   */
  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const response = await this.axios.get<WorkspaceMember[]>(
      `/workspaces/${workspaceId}/members`,
    );
    return response.data;
  }

  /**
   * Get workspace invitations
   * GET /workspaces/:id/invitations
   */
  async getWorkspaceInvitations(
    workspaceId: string,
  ): Promise<WorkspaceInvitation[]> {
    const response = await this.axios.get<WorkspaceInvitation[]>(
      `/workspaces/${workspaceId}/invitations`,
    );
    return response.data;
  }

  /**
   * Invite a member to a workspace
   * POST /workspaces/:id/invite
   */
  async inviteWorkspaceMember(
    workspaceId: string,
    data: InviteMemberDto,
  ): Promise<WorkspaceInvitation> {
    const response = await this.axios.post<WorkspaceInvitation>(
      `/workspaces/${workspaceId}/invite`,
      data,
    );
    return response.data;
  }

  /**
   * Accept a workspace invitation
   * POST /workspaces/invitations/accept
   */
  async acceptWorkspaceInvitation(
    data: AcceptInvitationDto,
  ): Promise<{ success: boolean }> {
    const response = await this.axios.post<{ success: boolean }>(
      "/workspaces/invitations/accept",
      data,
    );
    return response.data;
  }

  /**
   * Get workspace settings
   * GET /workspaces/:id/settings
   */
  async getWorkspaceSettings(workspaceId: string): Promise<WorkspaceSettings> {
    const response = await this.axios.get<WorkspaceSettings>(
      `/workspaces/${workspaceId}/settings`,
    );
    return response.data;
  }

  /**
   * Update workspace settings
   * PUT /workspaces/:id/settings
   */
  async updateWorkspaceSettings(
    workspaceId: string,
    data: UpdateWorkspaceSettingsDto,
  ): Promise<WorkspaceSettings> {
    const response = await this.axios.put<WorkspaceSettings>(
      `/workspaces/${workspaceId}/settings`,
      data,
    );
    return response.data;
  }

  /**
   * Get workspace audit logs
   * GET /workspaces/:id/audit-logs
   */
  async getWorkspaceAuditLogs(
    workspaceId: string,
    params?: { limit?: number; offset?: number },
  ): Promise<WorkspaceAuditLogsResponse> {
    const response = await this.axios.get<WorkspaceAuditLogsResponse>(
      `/workspaces/${workspaceId}/audit-logs`,
      {
        params,
      },
    );
    return response.data;
  }

  /**
   * Create an audit log entry
   * POST /workspaces/:id/audit-logs
   */
  async createAuditLog(
    workspaceId: string,
    action: string,
    payload?: Record<string, unknown>,
  ): Promise<WorkspaceAuditLog> {
    const response = await this.axios.post<WorkspaceAuditLog>(
      `/workspaces/${workspaceId}/audit-logs`,
      { action, payload },
    );
    return response.data;
  }

  /**
   * Archive a workspace
   * POST /workspaces/:id/archive
   */
  async archiveWorkspace(workspaceId: string): Promise<Workspace> {
    const response = await this.axios.post<Workspace>(
      `/workspaces/${workspaceId}/archive`,
    );
    return response.data;
  }

  // ============ EXTENDED TAG ENDPOINTS ============

  /**
   * Update a tag
   * PUT /tags/:id
   */
  async updateTag(tagId: string, data: UpdateTagDto): Promise<Tag> {
    const response = await this.axios.put<Tag>(`/tags/${tagId}`, data);
    return response.data;
  }

  // ============ EXTENDED TIMER ENDPOINTS ============

  /**
   * Get all timer sessions for a task
   * GET /timers?taskId=xxx
   */
  async getTimerSessions(taskId: string): Promise<TimeSession[]> {
    const response = await this.axios.get<TimeSession[]>("/timers", {
      params: { taskId },
    });
    return response.data;
  }

  /**
   * Get a specific timer session
   * GET /timers/:id
   */
  async getTimerSession(sessionId: string): Promise<TimeSession> {
    const response = await this.axios.get<TimeSession>(`/timers/${sessionId}`);
    return response.data;
  }

  /**
   * Create a manual timer session
   * POST /timers/session
   */
  async createTimerSession(data: CreateTimerSessionDto): Promise<TimeSession> {
    const response = await this.axios.post<TimeSession>(
      "/timers/session",
      data,
    );
    return response.data;
  }

  /**
   * Update a timer session
   * PATCH /timers/:id
   */
  async updateTimerSession(
    sessionId: string,
    data: UpdateTimerSessionDto,
  ): Promise<TimeSession> {
    const response = await this.axios.patch<TimeSession>(
      `/timers/${sessionId}`,
      data,
    );
    return response.data;
  }

  /**
   * Delete a timer session
   * DELETE /timers/:id
   */
  async deleteTimerSession(sessionId: string): Promise<void> {
    await this.axios.delete(`/timers/${sessionId}`);
  }

  // ============ EXTENDED TASK ENDPOINTS ============

  /**
   * Generate a public sharing token for a task
   * POST /tasks/:id/share
   */
  async generatePublicToken(taskId: string): Promise<TaskShareResponse> {
    const response = await this.axios.post<TaskShareResponse>(
      `/tasks/${taskId}/share`,
    );
    return response.data;
  }

  /**
   * Get a task by its public sharing token
   * GET /tasks/share/:token
   */
  async getTaskByPublicToken(token: string): Promise<PublicTaskResponse> {
    const response = await this.axios.get<PublicTaskResponse>(
      `/tasks/share/${token}`,
    );
    return response.data;
  }

  // ============ EXTENDED ANALYTICS ENDPOINTS ============

  /**
   * Get monthly metrics
   * GET /analytics/monthly
   */
  async getMonthlyMetrics(params?: {
    monthStart?: string;
  }): Promise<DailyMetrics[]> {
    const response = await this.axios.get<DailyMetrics[]>(
      "/analytics/monthly",
      {
        params,
      },
    );
    return response.data;
  }

  /**
   * Get metrics for a date range
   * GET /analytics/range
   */
  async getDateRangeMetrics(
    startDate: string,
    endDate: string,
  ): Promise<DailyMetrics[]> {
    const response = await this.axios.get<DailyMetrics[]>("/analytics/range", {
      params: { startDate, endDate },
    });
    return response.data;
  }

  // ============ EXTENDED ATTACHMENT ENDPOINTS ============

  /**
   * Get all attachments for a project
   * GET /attachments/project/:projectId
   */
  async getProjectAttachments(projectId: string): Promise<Attachment[]> {
    const response = await this.axios.get<Attachment[]>(
      `/attachments/project/${projectId}`,
    );
    return response.data;
  }

  // ============ NOTIFICATION ENDPOINTS ============

  /**
   * Get all notifications for the current user
   * GET /notifications
   */
  async getNotifications(): Promise<Notification[]> {
    const response = await this.axios.get<Notification[]>("/notifications");
    return response.data;
  }

  /**
   * Get unread notifications count
   * GET /notifications/unread-count
   */
  async getUnreadNotificationsCount(): Promise<UnreadCountResponse> {
    const response = await this.axios.get<UnreadCountResponse>(
      "/notifications/unread-count",
    );
    return response.data;
  }

  /**
   * Mark a notification as read
   * PATCH /notifications/:id/read
   */
  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    const response = await this.axios.patch<Notification>(
      `/notifications/${notificationId}/read`,
    );
    return response.data;
  }

  /**
   * Mark all notifications as read
   * POST /notifications/mark-all-read
   */
  async markAllNotificationsAsRead(): Promise<{ success: boolean }> {
    const response = await this.axios.post<{ success: boolean }>(
      "/notifications/mark-all-read",
    );
    return response.data;
  }

  // ============ CHAT ENDPOINTS ============

  /**
   * List all conversations
   * GET /chat/conversations
   */
  async getConversations(params?: {
    limit?: number;
    offset?: number;
    includeArchived?: boolean;
  }): Promise<ConversationResponse[]> {
    const response = await this.axios.get<ConversationResponse[]>(
      "/chat/conversations",
      {
        params,
      },
    );
    return response.data;
  }

  /**
   * Get a single conversation with messages
   * GET /chat/conversations/:id
   */
  async getConversation(id: string): Promise<ConversationDetail> {
    const response = await this.axios.get<ConversationDetail>(
      `/chat/conversations/${id}`,
    );
    return response.data;
  }

  /**
   * Create a new conversation
   * POST /chat/conversations
   */
  async createConversation(
    data: CreateConversationDto,
  ): Promise<ConversationResponse> {
    const response = await this.axios.post<ConversationResponse>(
      "/chat/conversations",
      data,
    );
    return response.data;
  }

  /**
   * Send a message to a conversation
   * POST /chat/conversations/:id/messages
   */
  async sendMessage(
    conversationId: string,
    data: SendMessageDto,
  ): Promise<SendMessageResponse> {
    const response = await this.axios.post<SendMessageResponse>(
      `/chat/conversations/${conversationId}/messages`,
      data,
    );
    return response.data;
  }

  /**
   * Update conversation title
   * PATCH /chat/conversations/:id
   */
  async updateConversation(
    id: string,
    title: string,
  ): Promise<ConversationResponse> {
    const response = await this.axios.patch<ConversationResponse>(
      `/chat/conversations/${id}`,
      { title },
    );
    return response.data;
  }

  /**
   * Archive a conversation
   * PATCH /chat/conversations/:id/archive
   */
  async archiveConversation(id: string): Promise<ConversationResponse> {
    const response = await this.axios.patch<ConversationResponse>(
      `/chat/conversations/${id}/archive`,
    );
    return response.data;
  }

  /**
   * Delete a conversation
   * DELETE /chat/conversations/:id
   */
  async deleteConversation(id: string): Promise<void> {
    await this.axios.delete(`/chat/conversations/${id}`);
  }

  /**
   * Get AI insights
   * GET /chat/insights
   */
  async getAIInsights(): Promise<AIInsightsResponse> {
    const response = await this.axios.get<AIInsightsResponse>("/chat/insights");
    return response.data;
  }

  // ============ HABIT ENDPOINTS (11) ============

  /**
   * Create a new habit
   * POST /habits
   */
  async createHabit(data: CreateHabitDto): Promise<Habit> {
    const response = await this.axios.post<Habit>("/habits", data);
    return response.data;
  }

  /**
   * Get all habits for current user
   * GET /habits
   */
  async getHabits(includeArchived?: boolean): Promise<Habit[]> {
    const response = await this.axios.get<Habit[]>("/habits", {
      params: { includeArchived: includeArchived ? "true" : undefined },
    });
    return response.data;
  }

  /**
   * Get habits for today with completion status
   * GET /habits/today
   */
  async getTodayHabits(): Promise<TodayHabitsResponse> {
    const response = await this.axios.get<TodayHabitsResponse>("/habits/today");
    return response.data;
  }

  /**
   * Get a specific habit by ID
   * GET /habits/:id
   */
  async getHabit(habitId: string): Promise<Habit> {
    const response = await this.axios.get<Habit>(`/habits/${habitId}`);
    return response.data;
  }

  /**
   * Get habit statistics
   * GET /habits/:id/stats
   */
  async getHabitStats(habitId: string): Promise<HabitStats> {
    const response = await this.axios.get<HabitStats>(
      `/habits/${habitId}/stats`,
    );
    return response.data;
  }

  /**
   * Update a habit
   * PATCH /habits/:id
   */
  async updateHabit(habitId: string, data: UpdateHabitDto): Promise<Habit> {
    const response = await this.axios.patch<Habit>(`/habits/${habitId}`, data);
    return response.data;
  }

  /**
   * Delete a habit
   * DELETE /habits/:id
   */
  async deleteHabit(habitId: string): Promise<void> {
    await this.axios.delete(`/habits/${habitId}`);
  }

  /**
   * Complete a habit for today
   * POST /habits/:id/complete
   */
  async completeHabit(
    habitId: string,
    data?: CompleteHabitDto,
  ): Promise<CompleteHabitResponse> {
    const response = await this.axios.post<CompleteHabitResponse>(
      `/habits/${habitId}/complete`,
      data || {},
    );
    return response.data;
  }

  /**
   * Uncomplete a habit for today
   * DELETE /habits/:id/complete
   */
  async uncompleteHabit(
    habitId: string,
  ): Promise<{ success: boolean; newStreak: number }> {
    const response = await this.axios.delete<{
      success: boolean;
      newStreak: number;
    }>(`/habits/${habitId}/complete`);
    return response.data;
  }

  /**
   * Pause a habit
   * POST /habits/:id/pause
   */
  async pauseHabit(habitId: string): Promise<Habit> {
    const response = await this.axios.post<Habit>(`/habits/${habitId}/pause`);
    return response.data;
  }

  /**
   * Resume a habit
   * POST /habits/:id/resume
   */
  async resumeHabit(habitId: string): Promise<Habit> {
    const response = await this.axios.post<Habit>(`/habits/${habitId}/resume`);
    return response.data;
  }

  // ============ OBJECTIVES (OKRs) ENDPOINTS (12) ============

  /**
   * Create a new objective
   * POST /objectives
   */
  async createObjective(data: CreateObjectiveDto): Promise<Objective> {
    const response = await this.axios.post<Objective>("/objectives", data);
    return response.data;
  }

  /**
   * Get all objectives for current user
   * GET /objectives
   */
  async getObjectives(options?: {
    status?: string;
    workspaceId?: string;
  }): Promise<Objective[]> {
    const response = await this.axios.get<Objective[]>("/objectives", {
      params: options,
    });
    return response.data;
  }

  /**
   * Get objectives for current period (quarter)
   * GET /objectives/current-period
   */
  async getCurrentPeriodObjectives(): Promise<Objective[]> {
    const response = await this.axios.get<Objective[]>(
      "/objectives/current-period",
    );
    return response.data;
  }

  /**
   * Get objectives dashboard summary
   * GET /objectives/dashboard-summary
   */
  async getObjectivesDashboardSummary(): Promise<ObjectiveDashboardSummary> {
    const response = await this.axios.get<ObjectiveDashboardSummary>(
      "/objectives/dashboard-summary",
    );
    return response.data;
  }

  /**
   * Get a specific objective by ID
   * GET /objectives/:id
   */
  async getObjective(objectiveId: string): Promise<Objective> {
    const response = await this.axios.get<Objective>(
      `/objectives/${objectiveId}`,
    );
    return response.data;
  }

  /**
   * Update an objective
   * PATCH /objectives/:id
   */
  async updateObjective(
    objectiveId: string,
    data: UpdateObjectiveDto,
  ): Promise<Objective> {
    const response = await this.axios.patch<Objective>(
      `/objectives/${objectiveId}`,
      data,
    );
    return response.data;
  }

  /**
   * Delete an objective
   * DELETE /objectives/:id
   */
  async deleteObjective(objectiveId: string): Promise<void> {
    await this.axios.delete(`/objectives/${objectiveId}`);
  }

  /**
   * Add a key result to an objective
   * POST /objectives/:id/key-results
   */
  async addKeyResult(
    objectiveId: string,
    data: CreateKeyResultDto,
  ): Promise<KeyResult> {
    const response = await this.axios.post<KeyResult>(
      `/objectives/${objectiveId}/key-results`,
      data,
    );
    return response.data;
  }

  /**
   * Update a key result
   * PATCH /objectives/key-results/:id
   */
  async updateKeyResult(
    keyResultId: string,
    data: UpdateKeyResultDto,
  ): Promise<KeyResult> {
    const response = await this.axios.patch<KeyResult>(
      `/objectives/key-results/${keyResultId}`,
      data,
    );
    return response.data;
  }

  /**
   * Delete a key result
   * DELETE /objectives/key-results/:id
   */
  async deleteKeyResult(keyResultId: string): Promise<void> {
    await this.axios.delete(`/objectives/key-results/${keyResultId}`);
  }

  /**
   * Link a task to a key result
   * POST /objectives/key-results/:id/tasks
   */
  async linkTaskToKeyResult(
    keyResultId: string,
    data: LinkTaskDto,
  ): Promise<KeyResultTask> {
    const response = await this.axios.post<KeyResultTask>(
      `/objectives/key-results/${keyResultId}/tasks`,
      data,
    );
    return response.data;
  }

  /**
   * Unlink a task from a key result
   * DELETE /objectives/key-results/:id/tasks/:taskId
   */
  async unlinkTaskFromKeyResult(
    keyResultId: string,
    taskId: string,
  ): Promise<void> {
    await this.axios.delete(
      `/objectives/key-results/${keyResultId}/tasks/${taskId}`,
    );
  }

  // ============ CUSTOM FIELDS ============

  /**
   * Get all custom fields for a project
   * GET /projects/:projectId/custom-fields
   */
  async getProjectCustomFields(projectId: string): Promise<CustomField[]> {
    const response = await this.axios.get<CustomField[]>(
      `/projects/${projectId}/custom-fields`,
    );
    return response.data;
  }

  /**
   * Create a custom field for a project
   * POST /projects/:projectId/custom-fields
   */
  async createCustomField(
    projectId: string,
    data: CreateCustomFieldDto,
  ): Promise<CustomField> {
    const response = await this.axios.post<CustomField>(
      `/projects/${projectId}/custom-fields`,
      data,
    );
    return response.data;
  }

  /**
   * Update a custom field
   * PATCH /custom-fields/:id
   */
  async updateCustomField(
    fieldId: string,
    data: UpdateCustomFieldDto,
  ): Promise<CustomField> {
    const response = await this.axios.patch<CustomField>(
      `/custom-fields/${fieldId}`,
      data,
    );
    return response.data;
  }

  /**
   * Delete a custom field
   * DELETE /custom-fields/:id
   */
  async deleteCustomField(fieldId: string): Promise<void> {
    await this.axios.delete(`/custom-fields/${fieldId}`);
  }

  /**
   * Get custom field values for a task
   * GET /tasks/:taskId/custom-values
   */
  async getTaskCustomValues(taskId: string): Promise<CustomFieldValue[]> {
    const response = await this.axios.get<CustomFieldValue[]>(
      `/tasks/${taskId}/custom-values`,
    );
    return response.data;
  }

  /**
   * Set custom field values for a task
   * PATCH /tasks/:taskId/custom-values
   */
  async setTaskCustomValues(
    taskId: string,
    data: SetMultipleCustomFieldValuesDto,
  ): Promise<CustomFieldValue[]> {
    const response = await this.axios.patch<CustomFieldValue[]>(
      `/tasks/${taskId}/custom-values`,
      data,
    );
    return response.data;
  }

  // ============ BURNOUT PREVENTION / WELLBEING ENDPOINTS ============

  /**
   * Get burnout risk analysis for current user
   * GET /ai/burnout/analysis
   */
  async getBurnoutAnalysis(): Promise<any> {
    const response = await this.axios.get("/ai/burnout/analysis");
    return response.data;
  }

  /**
   * Get work patterns for current user
   * GET /ai/burnout/patterns
   */
  async getWorkPatterns(): Promise<any> {
    const response = await this.axios.get("/ai/burnout/patterns");
    return response.data;
  }

  /**
   * Get rest recommendations
   * GET /ai/burnout/recommendations
   */
  async getRestRecommendations(): Promise<any[]> {
    const response = await this.axios.get("/ai/burnout/recommendations");
    return response.data;
  }

  /**
   * Check for burnout intervention needs
   * GET /ai/burnout/intervention
   */
  async checkBurnoutIntervention(): Promise<any> {
    const response = await this.axios.get("/ai/burnout/intervention");
    return response.data;
  }

  /**
   * Get weekly wellbeing summary
   * GET /ai/burnout/weekly-summary
   */
  async getWeeklyWellbeingSummary(): Promise<any> {
    const response = await this.axios.get("/ai/burnout/weekly-summary");
    return response.data;
  }

  // ============ TEAM WORKLOAD ENDPOINTS ============

  /**
   * Get workspace workload summary
   * GET /workload/workspace/:workspaceId
   */
  async getWorkspaceWorkload(workspaceId: string): Promise<any> {
    const response = await this.axios.get(`/workload/workspace/${workspaceId}`);
    return response.data;
  }

  /**
   * Get member workload details
   * GET /workload/member/:userId
   */
  async getMemberWorkload(userId: string, workspaceId?: string): Promise<any> {
    const response = await this.axios.get(`/workload/member/${userId}`, {
      params: { workspaceId },
    });
    return response.data;
  }

  /**
   * Get current user's workload
   * GET /workload/me
   */
  async getMyWorkload(workspaceId?: string): Promise<any> {
    const response = await this.axios.get("/workload/me", {
      params: { workspaceId },
    });
    return response.data;
  }

  /**
   * Get workload suggestions for redistribution
   * GET /workload/suggestions/:workspaceId
   */
  async getWorkloadSuggestions(workspaceId: string): Promise<any[]> {
    const response = await this.axios.get(
      `/workload/suggestions/${workspaceId}`,
    );
    return response.data;
  }
}
