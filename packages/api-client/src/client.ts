import axios, { AxiosInstance, AxiosError } from 'axios';
import type { TokenStorage } from './utils/storage';
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
  // Workspace
  Workspace,
  WorkspaceWithMembers,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  AddMemberDto,
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
  CreateTaskDto,
  UpdateTaskDto,
  CreateSubtaskDto,
  // Tag
  Tag,
  CreateTagDto,
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
} from './types';

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
  private axios: AxiosInstance;
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
        'Content-Type': 'application/json',
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
        if (this.tokenStorage) {
          const token = await this.tokenStorage.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
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
      }
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
          throw new Error('No token storage configured');
        }

        const refreshToken = await this.tokenStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
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
    const response = await this.axios.post<AuthResponse>('/auth/register', data);

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
    const response = await this.axios.post<AuthResponse>('/auth/login', data);

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
    const response = await this.axios.post<AuthResponse>('/auth/refresh', data);
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

  // ============ USER ENDPOINTS (2) ============

  /**
   * Get current authenticated user
   * GET /users/me
   */
  async getCurrentUser(): Promise<UserResponse> {
    const response = await this.axios.get<UserResponse>('/users/me');
    return response.data;
  }

  /**
   * Update current user profile
   * PUT /users/me
   */
  async updateProfile(data: UpdateProfileDto): Promise<{ success: boolean }> {
    const response = await this.axios.put<{ success: boolean }>('/users/me', data);
    return response.data;
  }

  // ============ WORKSPACE ENDPOINTS (7) ============

  /**
   * Create a new workspace
   * POST /workspaces
   */
  async createWorkspace(data: CreateWorkspaceDto): Promise<Workspace> {
    const response = await this.axios.post<Workspace>('/workspaces', data);
    return response.data;
  }

  /**
   * Get all workspaces for current user
   * GET /workspaces
   */
  async getWorkspaces(): Promise<Workspace[]> {
    const response = await this.axios.get<Workspace[]>('/workspaces');
    return response.data;
  }

  /**
   * Get a specific workspace by ID
   * GET /workspaces/:id
   */
  async getWorkspace(workspaceId: string): Promise<WorkspaceWithMembers> {
    const response = await this.axios.get<WorkspaceWithMembers>(`/workspaces/${workspaceId}`);
    return response.data;
  }

  /**
   * Get a specific workspace by Slug
   * GET /workspaces/by-slug/:slug
   */
  async getWorkspaceBySlug(slug: string): Promise<WorkspaceWithMembers> {
    const response = await this.axios.get<WorkspaceWithMembers>(`/workspaces/by-slug/${slug}`);
    return response.data;
  }

  /**
   * Update a workspace
   * PUT /workspaces/:id
   */
  async updateWorkspace(workspaceId: string, data: UpdateWorkspaceDto): Promise<Workspace> {
    const response = await this.axios.put<Workspace>(`/workspaces/${workspaceId}`, data);
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
   * Add a member to a workspace
   * POST /workspaces/:id/members
   */
  async addWorkspaceMember(workspaceId: string, data: AddMemberDto): Promise<{ success: boolean }> {
    const response = await this.axios.post<{ success: boolean }>(`/workspaces/${workspaceId}/members`, data);
    return response.data;
  }

  /**
   * Remove a member from a workspace
   * DELETE /workspaces/:id/members/:userId
   */
  async removeWorkspaceMember(workspaceId: string, userId: string): Promise<void> {
    await this.axios.delete(`/workspaces/${workspaceId}/members/${userId}`);
  }

  // ============ WORKFLOW ENDPOINTS (4) ============

  /**
   * Create a new workflow
   * POST /workflows
   */
  async createWorkflow(data: CreateWorkflowDto): Promise<Workflow> {
    const response = await this.axios.post<Workflow>('/workflows', data);
    return response.data;
  }

  /**
   * Get all workflows for a workspace
   * GET /workflows?workspaceId=xxx
   */
  async getWorkflows(workspaceId: string): Promise<Workflow[]> {
    const response = await this.axios.get<Workflow[]>('/workflows', {
      params: { workspaceId },
    });
    return response.data;
  }

  /**
   * Update a workflow
   * PUT /workflows/:id
   */
  async updateWorkflow(workflowId: string, data: UpdateWorkflowDto): Promise<Workflow> {
    const response = await this.axios.put<Workflow>(`/workflows/${workflowId}`, data);
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
    const response = await this.axios.post<Project>('/projects', data);
    return response.data;
  }

  /**
   * Get all projects for a workspace
   * GET /projects?workspaceId=xxx
   */
  async getProjects(workspaceId: string): Promise<Project[]> {
    const response = await this.axios.get<Project[]>('/projects', {
      params: { workspaceId },
    });
    return response.data;
  }

  /**
   * Get all projects across all workspaces
   * GET /projects/all
   */
  async getAllProjects(): Promise<Project[]> {
    const response = await this.axios.get<Project[]>('/projects/all');
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
   * Update a project
   * PUT /projects/:id
   */
  async updateProject(projectId: string, data: UpdateProjectDto): Promise<Project> {
    const response = await this.axios.put<Project>(`/projects/${projectId}`, data);
    return response.data;
  }

  /**
   * Archive a project
   * PATCH /projects/:id/archive
   */
  async archiveProject(projectId: string): Promise<Project> {
    const response = await this.axios.patch<Project>(`/projects/${projectId}/archive`);
    return response.data;
  }

  /**
   * Complete a project (mark as finished)
   * PATCH /projects/:id/complete
   */
  async completeProject(projectId: string): Promise<Project> {
    const response = await this.axios.patch<Project>(`/projects/${projectId}/complete`);
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
    const response = await this.axios.post<Task>('/tasks', data);
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

    const response = await this.axios.get<Task[]>('/tasks', {
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
    const response = await this.axios.get<TaskDetails>(`/tasks/${taskId}/details`);
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
  async createSubtask(parentTaskId: string, data: CreateSubtaskDto): Promise<Task> {
    const response = await this.axios.post<Task>(`/tasks/${parentTaskId}/subtasks`, data);
    return response.data;
  }

  // ============ TAG ENDPOINTS (6) ============

  /**
   * Create a new tag
   * POST /tags
   */
  async createTag(data: CreateTagDto): Promise<Tag> {
    const response = await this.axios.post<Tag>('/tags', data);
    return response.data;
  }

  /**
   * Get all tags for a workspace
   * GET /tags?workspaceId=xxx
   */
  async getTags(workspaceId: string): Promise<Tag[]> {
    const response = await this.axios.get<Tag[]>('/tags', {
      params: { workspaceId },
    });
    return response.data;
  }

  /**
   * Assign a tag to a task
   * POST /tags/:tagId/tasks/:taskId
   */
  async assignTagToTask(tagId: string, taskId: string): Promise<{ success: boolean }> {
    const response = await this.axios.post<{ success: boolean }>(`/tags/${tagId}/tasks/${taskId}`);
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
    const response = await this.axios.post<TimeSession>('/timers/start', data);
    return response.data;
  }

  /**
   * Stop the current timer session
   * POST /timers/stop
   */
  async stopTimer(data: StopTimerDto): Promise<TimeSession> {
    const response = await this.axios.post<TimeSession>('/timers/stop', data);
    return response.data;
  }

  /**
   * Get the current active timer session
   * GET /timers/active
   */
  async getActiveTimer(): Promise<ActiveTimerResponse> {
    const response = await this.axios.get<ActiveTimerResponse>('/timers/active');
    return response.data;
  }

  /**
   * Pause the current timer session
   * POST /timers/pause
   */
  async pauseTimer(data?: { pauseStartedAt?: Date }): Promise<TimeSession> {
    const response = await this.axios.post<TimeSession>('/timers/pause', data || {});
    return response.data;
  }

  /**
   * Resume a paused timer session
   * POST /timers/resume
   */
  async resumeTimer(data: { pauseStartedAt: Date }): Promise<TimeSession> {
    const response = await this.axios.post<TimeSession>('/timers/resume', data);
    return response.data;
  }

  /**
   * Switch to a different task during an active timer session
   * POST /timers/switch-task
   */
  async switchTask(data: { newTaskId: string; type?: string; splitReason?: string }): Promise<{
    oldSession: TimeSession;
    newSession: TimeSession;
  }> {
    const response = await this.axios.post<{
      oldSession: TimeSession;
      newSession: TimeSession;
    }>('/timers/switch-task', data);
    return response.data;
  }

  /**
   * Get timer session history with filters and pagination
   * GET /timers/history
   */
  async getSessionHistory(params?: GetSessionsParams): Promise<PaginatedSessionsResponse> {
    const response = await this.axios.get<PaginatedSessionsResponse>('/timers/history', {
      params,
    });
    return response.data;
  }

  /**
   * Get timer statistics for the current user
   * GET /timers/stats
   */
  async getTimerStats(params?: GetTimerStatsParams): Promise<TimerStatsResponse> {
    const response = await this.axios.get<TimerStatsResponse>('/timers/stats', {
      params,
    });
    return response.data;
  }

  /**
   * Get time tracking info for a specific task
   * GET /timers/task/:taskId
   */
  async getTaskTimeSessions(taskId: string): Promise<TaskTimeResponse> {
    const response = await this.axios.get<TaskTimeResponse>(`/timers/task/${taskId}`);
    return response.data;
  }

  // ============ ANALYTICS ENDPOINTS (1) ============

  /**
   * Get daily metrics for current user
   * GET /analytics/daily?startDate=xxx&endDate=xxx
   */
  async getDailyMetrics(params?: GetDailyMetricsParams): Promise<DailyMetrics[]> {
    const response = await this.axios.get<DailyMetrics[]>('/analytics/daily', {
      params,
    });
    return response.data;
  }

  // ============ COMMENT ENDPOINTS (4) ============

  /**
   * Create a new comment on a task
   * POST /comments
   */
  async createComment(data: CreateCommentDto): Promise<Comment> {
    const response = await this.axios.post<Comment>('/comments', data);
    return response.data;
  }

  /**
   * Update a comment
   * PUT /comments/:id
   */
  async updateComment(commentId: string, data: UpdateCommentDto): Promise<Comment> {
    const response = await this.axios.put<Comment>(`/comments/${commentId}`, data);
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
    const response = await this.axios.get<Comment[]>(`/tasks/${taskId}/comments`);
    return response.data;
  }

  // ============ ATTACHMENT ENDPOINTS (3) ============

  /**
   * Create a new attachment on a task
   * POST /attachments
   */
  async createAttachment(data: CreateAttachmentDto): Promise<Attachment> {
    const response = await this.axios.post<Attachment>('/attachments', data);
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
    const response = await this.axios.get<Attachment[]>(`/tasks/${taskId}/attachments`);
    return response.data;
  }

  // ============ AI ENDPOINTS (7) ============

  /**
   * Get AI profile for current user
   * GET /ai/profile
   */
  async getAIProfile(): Promise<AIProfile> {
    const response = await this.axios.get<AIProfile>('/ai/profile');
    return response.data;
  }

  /**
   * Get optimal schedule based on AI profile
   * GET /ai/optimal-schedule
   */
  async getOptimalSchedule(topN?: number): Promise<OptimalScheduleResponse> {
    const response = await this.axios.get<OptimalScheduleResponse>('/ai/optimal-schedule', {
      params: { topN },
    });
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
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }): Promise<PredictDurationResponse> {
    const response = await this.axios.get<PredictDurationResponse>('/ai/predict-duration', {
      params,
    });
    return response.data;
  }

  /**
   * Generate weekly productivity report
   * POST /ai/reports/weekly
   */
  async generateWeeklyReport(weekStart?: string): Promise<WeeklyReportResponse> {
    const response = await this.axios.post<WeeklyReportResponse>('/ai/reports/weekly', null, {
      params: { weekStart },
    });
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
    const response = await this.axios.get<ProductivityReport[]>('/ai/reports', {
      params,
    });
    return response.data;
  }

  /**
   * Get a specific productivity report
   * GET /ai/reports/:id
   */
  async getReport(reportId: string): Promise<ProductivityReport> {
    const response = await this.axios.get<ProductivityReport>(`/ai/reports/${reportId}`);
    return response.data;
  }

  /**
   * Delete a productivity report
   * DELETE /ai/reports/:id
   */
  async deleteReport(reportId: string): Promise<void> {
    await this.axios.delete(`/ai/reports/${reportId}`);
  }
}
