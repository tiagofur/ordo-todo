"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdoApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Main API client for Ordo-Todo applications.
 *
 * Provides methods for all 52 REST API endpoints.
 * Supports automatic JWT token management via TokenStorage.
 * Supports automatic retry with exponential backoff for failed requests.
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
 *
 * @example
 * ```typescript
 * // With retry configuration
 * const client = new OrdoApiClient({
 *   baseURL: 'http://localhost:3001/api/v1',
 *   tokenStorage: new LocalStorageTokenStorage(),
 *   retry: {
 *     retries: 3,                    // Retry up to 3 times
 *     retryDelay: 1000,              // Start with 1 second delay
 *     retryDelayMultiplier: 2,       // Double delay each retry (1s, 2s, 4s)
 *     maxRetryDelay: 30000,          // Cap at 30 seconds
 *     retryDelayJitter: 0.1,         // Add 10% randomness to prevent thundering herd
 *     retryOn4xx: false,             // Don't retry on 4xx errors (except 408, 429)
 *     // Custom retry condition (optional)
 *     retryCondition: (error) => {
 *       const status = error.response?.status;
 *       return status === 503 || status === 429; // Only retry on 503 and 429
 *     },
 *   },
 * });
 * ```
 */
class OrdoApiClient {
    axios;
    tokenStorage;
    isRefreshing = false;
    refreshPromise = null;
    onTokenRefresh;
    onAuthError;
    retryConfig;
    constructor(config) {
        this.tokenStorage = config.tokenStorage;
        this.onTokenRefresh = config.onTokenRefresh;
        this.onAuthError = config.onAuthError;
        this.retryConfig = config.retry;
        this.axios = axios_1.default.create({
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
    setupInterceptors() {
        // Request interceptor - attach JWT token
        this.axios.interceptors.request.use(async (config) => {
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
        }, (error) => Promise.reject(error));
        // Response interceptor - handle errors, token refresh, and retry logic
        this.axios.interceptors.response.use((response) => response, async (error) => {
            const originalRequest = error.config;
            // Handle 401 Unauthorized errors (token refresh logic)
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    // Try to refresh the token
                    const newTokens = await this.handleTokenRefresh();
                    // Update the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
                    // Retry the original request
                    return this.axios(originalRequest);
                }
                catch (refreshError) {
                    // Token refresh failed, call auth error callback
                    if (this.onAuthError) {
                        await this.onAuthError();
                    }
                    return Promise.reject(refreshError);
                }
            }
            // Handle retry logic for other errors
            if (this.retryConfig && error.response?.status !== 401) {
                try {
                    return await this.retryRequest(error, originalRequest._retryAttempt ?? 0);
                }
                catch (retryError) {
                    // Retry failed, reject with original error
                    return Promise.reject(error);
                }
            }
            return Promise.reject(error);
        });
    }
    /**
     * Handle token refresh logic with deduplication
     */
    async handleTokenRefresh() {
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
            }
            finally {
                this.isRefreshing = false;
                this.refreshPromise = null;
            }
        })();
        return this.refreshPromise;
    }
    /**
     * Check if an error should be retried based on retry configuration
     */
    shouldRetry(error, attempt) {
        if (!this.retryConfig)
            return false;
        const maxRetries = this.retryConfig.retries ?? 3;
        if (attempt >= maxRetries)
            return false;
        // Use custom retry condition if provided
        if (this.retryConfig.retryCondition) {
            return this.retryConfig.retryCondition(error);
        }
        // Default retry conditions
        const statusCode = error.response?.status;
        // Retry on network errors (no status code)
        if (!statusCode)
            return true;
        // Retry on 5xx server errors
        if (statusCode >= 500)
            return true;
        // Retry on 408 Request Timeout
        if (statusCode === 408)
            return true;
        // Retry on 429 Too Many Requests
        if (statusCode === 429)
            return true;
        // Retry on 4xx if configured
        if (this.retryConfig.retryOn4xx && statusCode >= 400 && statusCode < 500) {
            return true;
        }
        return false;
    }
    /**
     * Calculate retry delay with exponential backoff and jitter
     */
    calculateRetryDelay(attempt) {
        if (!this.retryConfig)
            return 0;
        const baseDelay = this.retryConfig.retryDelay ?? 1000;
        const multiplier = this.retryConfig.retryDelayMultiplier ?? 2;
        const maxDelay = this.retryConfig.maxRetryDelay ?? 30000;
        const jitter = this.retryConfig.retryDelayJitter ?? 0.1;
        // Exponential backoff: delay * (multiplier ^ attempt)
        const exponentialDelay = baseDelay * Math.pow(multiplier, attempt);
        // Cap at max delay
        const cappedDelay = Math.min(exponentialDelay, maxDelay);
        // Add jitter: random value between -jitter*delay and +jitter*delay
        const jitterAmount = cappedDelay * jitter;
        const randomJitter = (Math.random() * 2 - 1) * jitterAmount;
        return Math.max(0, Math.floor(cappedDelay + randomJitter));
    }
    /**
     * Retry a failed request with exponential backoff
     */
    async retryRequest(error, attempt) {
        const originalRequest = error.config;
        // Initialize retry attempt counter
        if (originalRequest._retryAttempt === undefined) {
            originalRequest._retryAttempt = 0;
        }
        // Check if we should retry
        if (!this.shouldRetry(error, originalRequest._retryAttempt)) {
            return Promise.reject(error);
        }
        // Calculate delay
        const delay = this.calculateRetryDelay(originalRequest._retryAttempt);
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));
        // Increment retry attempt
        originalRequest._retryAttempt++;
        // Retry the request
        return this.axios(originalRequest);
    }
    // ============ AUTH ENDPOINTS (3) ============
    /**
     * Register a new user account
     * POST /auth/register
     */
    async register(data) {
        const response = await this.axios.post("/auth/register", data);
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
    async login(data) {
        const response = await this.axios.post("/auth/login", data);
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
    async refreshToken(data) {
        const response = await this.axios.post("/auth/refresh", data);
        return response.data;
    }
    /**
     * Check if a username is available
     * POST /auth/check-username
     */
    async checkUsernameAvailability(username) {
        const response = await this.axios.post("/auth/check-username", { username });
        return response.data;
    }
    /**
     * Logout (clear tokens from storage)
     * This is a client-side only operation
     */
    async logout() {
        if (this.tokenStorage) {
            await this.tokenStorage.removeToken();
            await this.tokenStorage.removeRefreshToken();
        }
    }
    /**
     * Get Google OAuth authorization URL
     * GET /auth/google
     */
    async googleOAuth() {
        const response = await this.axios.get("/auth/google");
        return response.data;
    }
    /**
     * Handle Google OAuth callback
     * GET /auth/google/callback?code=xxx
     */
    async googleOAuthCallback(code) {
        const response = await this.axios.get("/auth/google/callback", {
            params: { code },
        });
        // Store tokens if storage is available
        if (this.tokenStorage) {
            await this.tokenStorage.setToken(response.data.accessToken);
            await this.tokenStorage.setRefreshToken(response.data.refreshToken);
        }
        return response.data;
    }
    /**
     * Get GitHub OAuth authorization URL
     * GET /auth/github
     */
    async githubOAuth() {
        const response = await this.axios.get("/auth/github");
        return response.data;
    }
    /**
     * Handle GitHub OAuth callback
     * GET /auth/github/callback?code=xxx
     */
    async githubOAuthCallback(code) {
        const response = await this.axios.get("/auth/github/callback", {
            params: { code },
        });
        // Store tokens if storage is available
        if (this.tokenStorage) {
            await this.tokenStorage.setToken(response.data.accessToken);
            await this.tokenStorage.setRefreshToken(response.data.refreshToken);
        }
        return response.data;
    }
    // ============ USER ENDPOINTS (8) ============
    /**
     * Get current authenticated user
     * GET /users/me
     */
    async getCurrentUser() {
        const response = await this.axios.get("/users/me");
        return response.data;
    }
    /**
     * Get full user profile with subscription, integrations, and preferences
     * GET /users/me/profile
     */
    async getFullProfile() {
        const response = await this.axios.get("/users/me/profile");
        return response.data;
    }
    /**
     * Update current user profile
     * PUT /users/me
     */
    async updateProfile(data) {
        const response = await this.axios.put("/users/me", data);
        return response.data;
    }
    /**
     * Get user preferences
     * GET /users/me/preferences
     */
    async getPreferences() {
        const response = await this.axios.get("/users/me/preferences");
        return response.data;
    }
    /**
     * Update user preferences (AI and privacy settings)
     * PATCH /users/me/preferences
     */
    async updatePreferences(data) {
        const response = await this.axios.patch("/users/me/preferences", data);
        return response.data;
    }
    /**
     * Get user integrations
     * GET /users/me/integrations
     */
    async getIntegrations() {
        const response = await this.axios.get("/users/me/integrations");
        return response.data;
    }
    /**
     * Export user data (GDPR)
     * POST /users/me/export
     */
    async exportData() {
        const response = await this.axios.post("/users/me/export", null, {
            responseType: "blob",
        });
        return response.data;
    }
    /**
     * Delete user account
     * DELETE /users/me
     */
    async deleteAccount() {
        const response = await this.axios.delete("/users/me");
        return response.data;
    }
    // ============ WORKSPACE ENDPOINTS (7) ============
    /**
     * Create a new workspace
     * POST /workspaces
     */
    async createWorkspace(data) {
        const response = await this.axios.post("/workspaces", data);
        return response.data;
    }
    /**
     * Get all workspaces for current user
     * GET /workspaces
     */
    async getWorkspaces() {
        const response = await this.axios.get("/workspaces");
        return response.data;
    }
    /**
     * Get a specific workspace by ID
     * GET /workspaces/:id
     */
    async getWorkspace(workspaceId) {
        const response = await this.axios.get(`/workspaces/${workspaceId}`);
        return response.data;
    }
    /**
     * Get a specific workspace by Slug and Username
     * GET /workspaces/:username/:slug
     */
    async getWorkspaceBySlug(username, slug) {
        const response = await this.axios.get(`/workspaces/${username}/${slug}`);
        return response.data;
    }
    /**
     * Update a workspace
     * PUT /workspaces/:id
     */
    async updateWorkspace(workspaceId, data) {
        const response = await this.axios.put(`/workspaces/${workspaceId}`, data);
        return response.data;
    }
    /**
     * Delete a workspace
     * DELETE /workspaces/:id
     */
    async deleteWorkspace(workspaceId) {
        await this.axios.delete(`/workspaces/${workspaceId}`);
    }
    /**
     * Get all deleted workspaces (trash)
     * GET /workspaces/deleted
     */
    async getDeletedWorkspaces() {
        const response = await this.axios.get("/workspaces/deleted");
        return response.data;
    }
    /**
     * Restore a deleted workspace
     * POST /workspaces/:id/restore
     */
    async restoreWorkspace(workspaceId) {
        const response = await this.axios.post(`/workspaces/${workspaceId}/restore`);
        return response.data;
    }
    /**
     * Permanently delete a workspace
     * DELETE /workspaces/:id/permanent
     */
    async permanentDeleteWorkspace(workspaceId) {
        await this.axios.delete(`/workspaces/${workspaceId}/permanent`);
    }
    /**
     * Add a member to a workspace
     * POST /workspaces/:id/members
     */
    async addWorkspaceMember(workspaceId, data) {
        const response = await this.axios.post(`/workspaces/${workspaceId}/members`, data);
        return response.data;
    }
    /**
     * Remove a member from a workspace
     * DELETE /workspaces/:id/members/:userId
     */
    async removeWorkspaceMember(workspaceId, userId) {
        await this.axios.delete(`/workspaces/${workspaceId}/members/${userId}`);
    }
    // ============ WORKFLOW ENDPOINTS (4) ============
    /**
     * Create a new workflow
     * POST /workflows
     */
    async createWorkflow(data) {
        const response = await this.axios.post("/workflows", data);
        return response.data;
    }
    /**
     * Get all workflows for a workspace
     * GET /workflows?workspaceId=xxx
     */
    async getWorkflows(workspaceId) {
        const response = await this.axios.get("/workflows", {
            params: { workspaceId },
        });
        return response.data;
    }
    /**
     * Update a workflow
     * PUT /workflows/:id
     */
    async updateWorkflow(workflowId, data) {
        const response = await this.axios.put(`/workflows/${workflowId}`, data);
        return response.data;
    }
    /**
     * Delete a workflow
     * DELETE /workflows/:id
     */
    async deleteWorkflow(workflowId) {
        await this.axios.delete(`/workflows/${workflowId}`);
    }
    // ============ PROJECT ENDPOINTS (7) ============
    /**
     * Create a new project
     * POST /projects
     */
    async createProject(data) {
        const response = await this.axios.post("/projects", data);
        return response.data;
    }
    /**
     * Get all projects for a workspace
     * GET /projects?workspaceId=xxx
     */
    async getProjects(workspaceId) {
        const response = await this.axios.get("/projects", {
            params: { workspaceId },
        });
        return response.data;
    }
    /**
     * Get all projects across all workspaces
     * GET /projects/all
     */
    async getAllProjects() {
        const response = await this.axios.get("/projects/all");
        return response.data;
    }
    /**
     * Get a specific project by ID
     * GET /projects/:id
     */
    async getProject(projectId) {
        const response = await this.axios.get(`/projects/${projectId}`);
        return response.data;
    }
    /**
     * Get a specific project by slug and username
     * GET /projects/:username/:projectSlug
     */
    async getProjectBySlug(username, projectSlug) {
        const response = await this.axios.get(`/projects/${username}/${projectSlug}`);
        return response.data;
    }
    /**
     * Get a project by workspace and project slugs
     * GET /projects/by-slug/:workspaceSlug/:projectSlug
     */
    async getProjectBySlugs(workspaceSlug, projectSlug) {
        const response = await this.axios.get(`/projects/by-slug/${workspaceSlug}/${projectSlug}`);
        return response.data;
    }
    /**
     * Update a project
     * PUT /projects/:id
     */
    async updateProject(projectId, data) {
        const response = await this.axios.put(`/projects/${projectId}`, data);
        return response.data;
    }
    /**
     * Archive a project
     * PATCH /projects/:id/archive
     */
    async archiveProject(projectId) {
        const response = await this.axios.patch(`/projects/${projectId}/archive`);
        return response.data;
    }
    /**
     * Complete a project (mark as finished)
     * PATCH /projects/:id/complete
     */
    async completeProject(projectId) {
        const response = await this.axios.patch(`/projects/${projectId}/complete`);
        return response.data;
    }
    /**
     * Delete a project
     * DELETE /projects/:id
     */
    async deleteProject(projectId) {
        await this.axios.delete(`/projects/${projectId}`);
    }
    // ============ TASK ENDPOINTS (8) ============
    /**
     * Create a new task
     * POST /tasks
     */
    async createTask(data) {
        const response = await this.axios.post("/tasks", data);
        return response.data;
    }
    /**
     * Mark a task as complete
     * PATCH /tasks/:id/complete
     */
    async completeTask(taskId) {
        const response = await this.axios.patch(`/tasks/${taskId}/complete`);
        return response.data;
    }
    /**
     * Get all tasks (optionally filtered by project)
     * GET /tasks?projectId=xxx
     */
    async getTasks(projectId, tags, assignedToMe) {
        const params = {};
        if (projectId)
            params.projectId = projectId;
        if (tags && tags.length > 0)
            params.tags = tags;
        if (assignedToMe !== undefined)
            params.assignedToMe = assignedToMe;
        const response = await this.axios.get("/tasks", {
            params,
        });
        return response.data;
    }
    /**
     * Get tasks categorized for today view
     * GET /tasks/today
     * Returns: overdue, dueToday, scheduledToday, available, notYetAvailable
     */
    async getTasksToday() {
        const response = await this.axios.get("/tasks/today");
        return response.data;
    }
    /**
     * Get tasks scheduled for a specific date
     * GET /tasks/scheduled?date=xxx
     */
    async getScheduledTasks(date) {
        const params = {};
        if (date) {
            params.date = typeof date === "string" ? date : date.toISOString();
        }
        const response = await this.axios.get("/tasks/scheduled", {
            params,
        });
        return response.data;
    }
    /**
     * Get all available tasks (can be started today)
     * GET /tasks/available?projectId=xxx
     */
    async getAvailableTasks(projectId) {
        const params = {};
        if (projectId)
            params.projectId = projectId;
        const response = await this.axios.get("/tasks/available", {
            params,
        });
        return response.data;
    }
    /**
     * Get time-blocked tasks within a date range for calendar view
     * GET /tasks/time-blocks?start=xxx&end=xxx
     */
    async getTimeBlocks(start, end) {
        const params = {};
        if (start)
            params.start = start instanceof Date ? start.toISOString() : start;
        if (end)
            params.end = end instanceof Date ? end.toISOString() : end;
        const response = await this.axios.get("/tasks/time-blocks", {
            params,
        });
        return response.data;
    }
    async getTask(taskId) {
        const response = await this.axios.get(`/tasks/${taskId}`);
        return response.data;
    }
    /**
     * Get task details with all relations (subtasks, comments, attachments)
     * GET /tasks/:id/details
     */
    async getTaskDetails(taskId) {
        const response = await this.axios.get(`/tasks/${taskId}/details`);
        return response.data;
    }
    /**
     * Update a task
     * PATCH /tasks/:id
     */
    async updateTask(taskId, data) {
        const response = await this.axios.patch(`/tasks/${taskId}`, data);
        return response.data;
    }
    /**
     * Delete a task
     * DELETE /tasks/:id
     */
    async deleteTask(taskId) {
        await this.axios.delete(`/tasks/${taskId}`);
    }
    /**
     * Create a subtask under a parent task
     * POST /tasks/:id/subtasks
     */
    async createSubtask(parentTaskId, data) {
        const response = await this.axios.post(`/tasks/${parentTaskId}/subtasks`, data);
        return response.data;
    }
    /**
     * Assign a task to a user
     * POST /tasks/:id/assign
     */
    async assignTask(taskId, userId) {
        const response = await this.axios.post(`/tasks/${taskId}/assign`, {
            userId,
        });
        return response.data;
    }
    /**
     * Unassign a task from a user
     * DELETE /tasks/:id/assign
     */
    async unassignTask(taskId, userId) {
        const response = await this.axios.delete(`/tasks/${taskId}/assign/${userId}`);
        return response.data;
    }
    /**
     * Get task dependencies
     * GET /tasks/:id/dependencies
     */
    async getTaskDependencies(taskId) {
        const response = await this.axios.get(`/tasks/${taskId}/dependencies`);
        return response.data;
    }
    /**
     * Add a dependency to a task
     * POST /tasks/:id/dependencies
     */
    async addTaskDependency(taskId, blockingTaskId) {
        const response = await this.axios.post(`/tasks/${taskId}/dependencies`, { blockingTaskId });
        return response.data;
    }
    /**
     * Remove a dependency from a task
     * DELETE /tasks/:id/dependencies/:blockingTaskId
     */
    async removeTaskDependency(taskId, blockingTaskId) {
        await this.axios.delete(`/tasks/${taskId}/dependencies/${blockingTaskId}`);
    }
    // ============ TAG ENDPOINTS (6) ============
    /**
     * Create a new tag
     * POST /tags
     */
    async createTag(data) {
        const response = await this.axios.post("/tags", data);
        return response.data;
    }
    /**
     * Get all tags for a workspace
     * GET /tags?workspaceId=xxx
     */
    async getTags(workspaceId) {
        const response = await this.axios.get("/tags", {
            params: { workspaceId },
        });
        return response.data;
    }
    /**
     * Assign a tag to a task
     * POST /tags/:tagId/tasks/:taskId
     */
    async assignTagToTask(tagId, taskId) {
        const response = await this.axios.post(`/tags/${tagId}/tasks/${taskId}`);
        return response.data;
    }
    /**
     * Remove a tag from a task
     * DELETE /tags/:tagId/tasks/:taskId
     */
    async removeTagFromTask(tagId, taskId) {
        await this.axios.delete(`/tags/${tagId}/tasks/${taskId}`);
    }
    /**
     * Get all tags for a specific task
     * GET /tasks/:taskId/tags
     */
    async getTaskTags(taskId) {
        const response = await this.axios.get(`/tasks/${taskId}/tags`);
        return response.data;
    }
    /**
     * Delete a tag
     * DELETE /tags/:id
     */
    async deleteTag(tagId) {
        await this.axios.delete(`/tags/${tagId}`);
    }
    // ============ TIMER ENDPOINTS (6) ============
    /**
     * Start a timer session for a task
     * POST /timers/start
     */
    async startTimer(data) {
        const response = await this.axios.post("/timers/start", data);
        return response.data;
    }
    /**
     * Stop the current timer session
     * POST /timers/stop
     */
    async stopTimer(data) {
        const response = await this.axios.post("/timers/stop", data);
        return response.data;
    }
    /**
     * Get the current active timer session
     * GET /timers/active
     */
    async getActiveTimer() {
        const response = await this.axios.get("/timers/active");
        return response.data;
    }
    /**
     * Pause the current timer session
     * POST /timers/pause
     */
    async pauseTimer(data) {
        const response = await this.axios.post("/timers/pause", data || {});
        return response.data;
    }
    /**
     * Resume a paused timer session
     * POST /timers/resume
     */
    async resumeTimer(data) {
        const response = await this.axios.post("/timers/resume", data);
        return response.data;
    }
    /**
     * Switch to a different task during an active timer session
     * POST /timers/switch-task
     */
    async switchTask(data) {
        const response = await this.axios.post("/timers/switch-task", data);
        return response.data;
    }
    /**
     * Get timer session history with filters and pagination
     * GET /timers/history
     */
    async getSessionHistory(params) {
        const response = await this.axios.get("/timers/history", {
            params,
        });
        return response.data;
    }
    /**
     * Get timer statistics for the current user
     * GET /timers/stats
     */
    async getTimerStats(params) {
        const response = await this.axios.get("/timers/stats", {
            params,
        });
        return response.data;
    }
    /**
     * Get time tracking info for a specific task
     * GET /timers/task/:taskId
     */
    async getTaskTimeSessions(taskId) {
        const response = await this.axios.get(`/timers/task/${taskId}`);
        return response.data;
    }
    // ============ ANALYTICS ENDPOINTS (6) ============
    /**
     * Get daily metrics for current user
     * GET /analytics/daily?startDate=xxx&endDate=xxx
     */
    async getDailyMetrics(params) {
        const response = await this.axios.get("/analytics/daily", {
            params,
        });
        return response.data;
    }
    /**
     * Get dashboard stats (pomodoros, tasks, minutes, trends)
     * GET /analytics/dashboard-stats
     */
    async getDashboardStats() {
        const response = await this.axios.get("/analytics/dashboard-stats");
        return response.data;
    }
    /**
     * Get weekly metrics
     * GET /analytics/weekly
     */
    async getWeeklyMetrics(params) {
        const response = await this.axios.get("/analytics/weekly", { params });
        return response.data;
    }
    /**
     * Get heatmap data (activity by hour/day)
     * GET /analytics/heatmap
     */
    async getHeatmapData() {
        const response = await this.axios.get("/analytics/heatmap");
        return response.data;
    }
    /**
     * Get project time distribution
     * GET /analytics/project-distribution
     */
    async getProjectDistribution() {
        const response = await this.axios.get("/analytics/project-distribution");
        return response.data;
    }
    /**
     * Get task status distribution
     * GET /analytics/task-status-distribution
     */
    async getTaskStatusDistribution() {
        const response = await this.axios.get("/analytics/task-status-distribution");
        return response.data;
    }
    /**
     * Get productivity streak information
     * GET /analytics/streak
     */
    async getProductivityStreak() {
        const response = await this.axios.get("/analytics/streak");
        return response.data;
    }
    // ============ COMMENT ENDPOINTS (4) ============
    /**
     * Create a new comment on a task
     * POST /comments
     */
    async createComment(data) {
        const response = await this.axios.post("/comments", data);
        return response.data;
    }
    /**
     * Update a comment
     * PUT /comments/:id
     */
    async updateComment(commentId, data) {
        const response = await this.axios.put(`/comments/${commentId}`, data);
        return response.data;
    }
    /**
     * Delete a comment
     * DELETE /comments/:id
     */
    async deleteComment(commentId) {
        await this.axios.delete(`/comments/${commentId}`);
    }
    /**
     * Get all comments for a task
     * GET /tasks/:taskId/comments
     */
    async getTaskComments(taskId) {
        const response = await this.axios.get(`/tasks/${taskId}/comments`);
        return response.data;
    }
    // ============ ATTACHMENT ENDPOINTS (3) ============
    /**
     * Create a new attachment on a task
     * POST /attachments
     */
    async createAttachment(data) {
        const response = await this.axios.post("/attachments", data);
        return response.data;
    }
    /**
     * Upload a file as an attachment
     * POST /attachments/upload
     */
    async uploadAttachment(file, taskId) {
        const formData = new FormData();
        formData.append("file", file);
        if (taskId) {
            formData.append("taskId", taskId);
        }
        const response = await this.axios.post("/attachments/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    }
    /**
     * Delete an attachment
     * DELETE /attachments/:id
     */
    async deleteAttachment(attachmentId) {
        await this.axios.delete(`/attachments/${attachmentId}`);
    }
    /**
     * Get all attachments for a task
     * GET /tasks/:taskId/attachments
     */
    async getTaskAttachments(taskId) {
        const response = await this.axios.get(`/tasks/${taskId}/attachments`);
        return response.data;
    }
    // ============ AI ENDPOINTS (7) ============
    /**
     * Get AI profile for current user
     * GET /ai/profile
     */
    async getAIProfile() {
        const response = await this.axios.get("/ai/profile");
        return response.data;
    }
    /**
     * Get optimal schedule based on AI profile
     * GET /ai/optimal-schedule
     */
    async getOptimalSchedule(topN) {
        const response = await this.axios.get("/ai/optimal-schedule", {
            params: { topN },
        });
        return response.data;
    }
    /**
     * Predict task duration based on AI profile
     * GET /ai/predict-duration
     */
    async predictTaskDuration(params) {
        const response = await this.axios.get("/ai/predict-duration", {
            params,
        });
        return response.data;
    }
    /**
     * Generate weekly productivity report
     * POST /ai/reports/weekly
     */
    async generateWeeklyReport(weekStart) {
        const response = await this.axios.post("/ai/reports/weekly", null, {
            params: { weekStart },
        });
        return response.data;
    }
    /**
     * Get productivity reports
     * GET /ai/reports
     */
    async getReports(params) {
        const response = await this.axios.get("/ai/reports", {
            params,
        });
        return response.data;
    }
    /**
     * Get a specific productivity report
     * GET /ai/reports/:id
     */
    async getReport(reportId) {
        const response = await this.axios.get(`/ai/reports/${reportId}`);
        return response.data;
    }
    /**
     * Delete a productivity report
     * DELETE /ai/reports/:id
     */
    async deleteReport(reportId) {
        await this.axios.delete(`/ai/reports/${reportId}`);
    }
    // ============ EXTENDED WORKSPACE ENDPOINTS ============
    /**
     * Get workspace members
     * GET /workspaces/:id/members
     */
    async getWorkspaceMembers(workspaceId) {
        const response = await this.axios.get(`/workspaces/${workspaceId}/members`);
        return response.data;
    }
    /**
     * Get workspace invitations
     * GET /workspaces/:id/invitations
     */
    async getWorkspaceInvitations(workspaceId) {
        const response = await this.axios.get(`/workspaces/${workspaceId}/invitations`);
        return response.data;
    }
    /**
     * Invite a member to a workspace
     * POST /workspaces/:id/invite
     */
    async inviteWorkspaceMember(workspaceId, data) {
        const response = await this.axios.post(`/workspaces/${workspaceId}/invite`, data);
        return response.data;
    }
    /**
     * Accept a workspace invitation
     * POST /workspaces/invitations/accept
     */
    async acceptWorkspaceInvitation(data) {
        const response = await this.axios.post("/workspaces/invitations/accept", data);
        return response.data;
    }
    /**
     * Get workspace settings
     * GET /workspaces/:id/settings
     */
    async getWorkspaceSettings(workspaceId) {
        const response = await this.axios.get(`/workspaces/${workspaceId}/settings`);
        return response.data;
    }
    /**
     * Update workspace settings
     * PUT /workspaces/:id/settings
     */
    async updateWorkspaceSettings(workspaceId, data) {
        const response = await this.axios.put(`/workspaces/${workspaceId}/settings`, data);
        return response.data;
    }
    /**
     * Get workspace audit logs
     * GET /workspaces/:id/audit-logs
     */
    async getWorkspaceAuditLogs(workspaceId, params) {
        const response = await this.axios.get(`/workspaces/${workspaceId}/audit-logs`, {
            params,
        });
        return response.data;
    }
    /**
     * Create an audit log entry
     * POST /workspaces/:id/audit-logs
     */
    async createAuditLog(workspaceId, action, payload) {
        const response = await this.axios.post(`/workspaces/${workspaceId}/audit-logs`, { action, payload });
        return response.data;
    }
    /**
     * Archive a workspace
     * POST /workspaces/:id/archive
     */
    async archiveWorkspace(workspaceId) {
        const response = await this.axios.post(`/workspaces/${workspaceId}/archive`);
        return response.data;
    }
    // ============ EXTENDED TAG ENDPOINTS ============
    /**
     * Update a tag
     * PUT /tags/:id
     */
    async updateTag(tagId, data) {
        const response = await this.axios.put(`/tags/${tagId}`, data);
        return response.data;
    }
    // ============ EXTENDED TIMER ENDPOINTS ============
    /**
     * Get all timer sessions for a task
     * GET /timers?taskId=xxx
     */
    async getTimerSessions(taskId) {
        const response = await this.axios.get("/timers", {
            params: { taskId },
        });
        return response.data;
    }
    /**
     * Get a specific timer session
     * GET /timers/:id
     */
    async getTimerSession(sessionId) {
        const response = await this.axios.get(`/timers/${sessionId}`);
        return response.data;
    }
    /**
     * Create a manual timer session
     * POST /timers/session
     */
    async createTimerSession(data) {
        const response = await this.axios.post("/timers/session", data);
        return response.data;
    }
    /**
     * Update a timer session
     * PATCH /timers/:id
     */
    async updateTimerSession(sessionId, data) {
        const response = await this.axios.patch(`/timers/${sessionId}`, data);
        return response.data;
    }
    /**
     * Delete a timer session
     * DELETE /timers/:id
     */
    async deleteTimerSession(sessionId) {
        await this.axios.delete(`/timers/${sessionId}`);
    }
    // ============ EXTENDED TASK ENDPOINTS ============
    /**
     * Generate a public sharing token for a task
     * POST /tasks/:id/share
     */
    async generatePublicToken(taskId) {
        const response = await this.axios.post(`/tasks/${taskId}/share`);
        return response.data;
    }
    /**
     * Get a task by its public sharing token
     * GET /tasks/share/:token
     */
    async getTaskByPublicToken(token) {
        const response = await this.axios.get(`/tasks/share/${token}`);
        return response.data;
    }
    // ============ EXTENDED ANALYTICS ENDPOINTS ============
    /**
     * Get monthly metrics
     * GET /analytics/monthly
     */
    async getMonthlyMetrics(params) {
        const response = await this.axios.get("/analytics/monthly", {
            params,
        });
        return response.data;
    }
    /**
     * Get metrics for a date range
     * GET /analytics/range
     */
    async getDateRangeMetrics(startDate, endDate) {
        const response = await this.axios.get("/analytics/range", {
            params: { startDate, endDate },
        });
        return response.data;
    }
    // ============ EXTENDED ATTACHMENT ENDPOINTS ============
    /**
     * Get all attachments for a project
     * GET /attachments/project/:projectId
     */
    async getProjectAttachments(projectId) {
        const response = await this.axios.get(`/attachments/project/${projectId}`);
        return response.data;
    }
    // ============ NOTIFICATION ENDPOINTS ============
    /**
     * Get all notifications for the current user
     * GET /notifications
     */
    async getNotifications() {
        const response = await this.axios.get("/notifications");
        return response.data;
    }
    /**
     * Get unread notifications count
     * GET /notifications/unread-count
     */
    async getUnreadNotificationsCount() {
        const response = await this.axios.get("/notifications/unread-count");
        return response.data;
    }
    /**
     * Mark a notification as read
     * PATCH /notifications/:id/read
     */
    async markNotificationAsRead(notificationId) {
        const response = await this.axios.patch(`/notifications/${notificationId}/read`);
        return response.data;
    }
    /**
     * Mark all notifications as read
     * POST /notifications/mark-all-read
     */
    async markAllNotificationsAsRead() {
        const response = await this.axios.post("/notifications/mark-all-read");
        return response.data;
    }
    // ============ CHAT ENDPOINTS ============
    /**
     * List all conversations
     * GET /chat/conversations
     */
    async getConversations(params) {
        const response = await this.axios.get("/chat/conversations", {
            params,
        });
        return response.data;
    }
    /**
     * Get a single conversation with messages
     * GET /chat/conversations/:id
     */
    async getConversation(id) {
        const response = await this.axios.get(`/chat/conversations/${id}`);
        return response.data;
    }
    /**
     * Create a new conversation
     * POST /chat/conversations
     */
    async createConversation(data) {
        const response = await this.axios.post("/chat/conversations", data);
        return response.data;
    }
    /**
     * Send a message to a conversation
     * POST /chat/conversations/:id/messages
     */
    async sendMessage(conversationId, data) {
        const response = await this.axios.post(`/chat/conversations/${conversationId}/messages`, data);
        return response.data;
    }
    /**
     * Update conversation title
     * PATCH /chat/conversations/:id
     */
    async updateConversation(id, title) {
        const response = await this.axios.patch(`/chat/conversations/${id}`, { title });
        return response.data;
    }
    /**
     * Archive a conversation
     * PATCH /chat/conversations/:id/archive
     */
    async archiveConversation(id) {
        const response = await this.axios.patch(`/chat/conversations/${id}/archive`);
        return response.data;
    }
    /**
     * Delete a conversation
     * DELETE /chat/conversations/:id
     */
    async deleteConversation(id) {
        await this.axios.delete(`/chat/conversations/${id}`);
    }
    /**
     * Get AI insights
     * GET /chat/insights
     */
    async getAIInsights() {
        const response = await this.axios.get("/chat/insights");
        return response.data;
    }
    // ============ HABIT ENDPOINTS (11) ============
    /**
     * Create a new habit
     * POST /habits
     */
    async createHabit(data) {
        const response = await this.axios.post("/habits", data);
        return response.data;
    }
    /**
     * Get all habits for current user
     * GET /habits
     */
    async getHabits(includeArchived) {
        const response = await this.axios.get("/habits", {
            params: { includeArchived: includeArchived ? "true" : undefined },
        });
        return response.data;
    }
    /**
     * Get habits for today with completion status
     * GET /habits/today
     */
    async getTodayHabits() {
        const response = await this.axios.get("/habits/today");
        return response.data;
    }
    /**
     * Get a specific habit by ID
     * GET /habits/:id
     */
    async getHabit(habitId) {
        const response = await this.axios.get(`/habits/${habitId}`);
        return response.data;
    }
    /**
     * Get habit statistics
     * GET /habits/:id/stats
     */
    async getHabitStats(habitId) {
        const response = await this.axios.get(`/habits/${habitId}/stats`);
        return response.data;
    }
    /**
     * Update a habit
     * PATCH /habits/:id
     */
    async updateHabit(habitId, data) {
        const response = await this.axios.patch(`/habits/${habitId}`, data);
        return response.data;
    }
    /**
     * Delete a habit
     * DELETE /habits/:id
     */
    async deleteHabit(habitId) {
        await this.axios.delete(`/habits/${habitId}`);
    }
    /**
     * Complete a habit for today
     * POST /habits/:id/complete
     */
    async completeHabit(habitId, data) {
        const response = await this.axios.post(`/habits/${habitId}/complete`, data || {});
        return response.data;
    }
    /**
     * Uncomplete a habit for today
     * DELETE /habits/:id/complete
     */
    async uncompleteHabit(habitId) {
        const response = await this.axios.delete(`/habits/${habitId}/complete`);
        return response.data;
    }
    /**
     * Pause a habit
     * POST /habits/:id/pause
     */
    async pauseHabit(habitId) {
        const response = await this.axios.post(`/habits/${habitId}/pause`);
        return response.data;
    }
    /**
     * Resume a habit
     * POST /habits/:id/resume
     */
    async resumeHabit(habitId) {
        const response = await this.axios.post(`/habits/${habitId}/resume`);
        return response.data;
    }
    // ============ OBJECTIVES (OKRs) ENDPOINTS (12) ============
    /**
     * Create a new objective
     * POST /objectives
     */
    async createObjective(data) {
        const response = await this.axios.post("/objectives", data);
        return response.data;
    }
    /**
     * Get all objectives for current user
     * GET /objectives
     */
    async getObjectives(options) {
        const response = await this.axios.get("/objectives", {
            params: options,
        });
        return response.data;
    }
    /**
     * Get objectives for current period (quarter)
     * GET /objectives/current-period
     */
    async getCurrentPeriodObjectives() {
        const response = await this.axios.get("/objectives/current-period");
        return response.data;
    }
    /**
     * Get objectives dashboard summary
     * GET /objectives/dashboard-summary
     */
    async getObjectivesDashboardSummary() {
        const response = await this.axios.get("/objectives/dashboard-summary");
        return response.data;
    }
    /**
     * Get a specific objective by ID
     * GET /objectives/:id
     */
    async getObjective(objectiveId) {
        const response = await this.axios.get(`/objectives/${objectiveId}`);
        return response.data;
    }
    /**
     * Update an objective
     * PATCH /objectives/:id
     */
    async updateObjective(objectiveId, data) {
        const response = await this.axios.patch(`/objectives/${objectiveId}`, data);
        return response.data;
    }
    /**
     * Delete an objective
     * DELETE /objectives/:id
     */
    async deleteObjective(objectiveId) {
        await this.axios.delete(`/objectives/${objectiveId}`);
    }
    /**
     * Add a key result to an objective
     * POST /objectives/:id/key-results
     */
    async addKeyResult(objectiveId, data) {
        const response = await this.axios.post(`/objectives/${objectiveId}/key-results`, data);
        return response.data;
    }
    /**
     * Update a key result
     * PATCH /objectives/key-results/:id
     */
    async updateKeyResult(keyResultId, data) {
        const response = await this.axios.patch(`/objectives/key-results/${keyResultId}`, data);
        return response.data;
    }
    /**
     * Delete a key result
     * DELETE /objectives/key-results/:id
     */
    async deleteKeyResult(keyResultId) {
        await this.axios.delete(`/objectives/key-results/${keyResultId}`);
    }
    /**
     * Link a task to a key result
     * POST /objectives/key-results/:id/tasks
     */
    async linkTaskToKeyResult(keyResultId, data) {
        const response = await this.axios.post(`/objectives/key-results/${keyResultId}/tasks`, data);
        return response.data;
    }
    /**
     * Unlink a task from a key result
     * DELETE /objectives/key-results/:id/tasks/:taskId
     */
    async unlinkTaskFromKeyResult(keyResultId, taskId) {
        await this.axios.delete(`/objectives/key-results/${keyResultId}/tasks/${taskId}`);
    }
    // ============ CUSTOM FIELDS ============
    /**
     * Get all custom fields for a project
     * GET /projects/:projectId/custom-fields
     */
    async getProjectCustomFields(projectId) {
        const response = await this.axios.get(`/projects/${projectId}/custom-fields`);
        return response.data;
    }
    /**
     * Create a custom field for a project
     * POST /projects/:projectId/custom-fields
     */
    async createCustomField(projectId, data) {
        const response = await this.axios.post(`/projects/${projectId}/custom-fields`, data);
        return response.data;
    }
    /**
     * Update a custom field
     * PATCH /custom-fields/:id
     */
    async updateCustomField(fieldId, data) {
        const response = await this.axios.patch(`/custom-fields/${fieldId}`, data);
        return response.data;
    }
    /**
     * Delete a custom field
     * DELETE /custom-fields/:id
     */
    async deleteCustomField(fieldId) {
        await this.axios.delete(`/custom-fields/${fieldId}`);
    }
    /**
     * Get custom field values for a task
     * GET /tasks/:taskId/custom-values
     */
    async getTaskCustomValues(taskId) {
        const response = await this.axios.get(`/tasks/${taskId}/custom-values`);
        return response.data;
    }
    /**
     * Set custom field values for a task
     * PATCH /tasks/:taskId/custom-values
     */
    async setTaskCustomValues(taskId, data) {
        const response = await this.axios.patch(`/tasks/${taskId}/custom-values`, data);
        return response.data;
    }
    // ============ BURNOUT PREVENTION / WELLBEING ENDPOINTS ============
    /**
     * Get burnout risk analysis for current user
     * GET /ai/burnout/analysis
     */
    async getBurnoutAnalysis() {
        const response = await this.axios.get("/ai/burnout/analysis");
        return response.data;
    }
    /**
     * Get work patterns for current user
     * GET /ai/burnout/patterns
     */
    async getWorkPatterns() {
        const response = await this.axios.get("/ai/burnout/patterns");
        return response.data;
    }
    /**
     * Get rest recommendations
     * GET /ai/burnout/recommendations
     */
    async getRestRecommendations() {
        const response = await this.axios.get("/ai/burnout/recommendations");
        return response.data;
    }
    /**
     * Check for burnout intervention needs
     * GET /ai/burnout/intervention
     */
    async checkBurnoutIntervention() {
        const response = await this.axios.get("/ai/burnout/intervention");
        return response.data;
    }
    /**
     * Get weekly wellbeing summary
     * GET /ai/burnout/weekly-summary
     */
    async getWeeklyWellbeingSummary() {
        const response = await this.axios.get("/ai/burnout/weekly-summary");
        return response.data;
    }
    // ============ TEAM WORKLOAD ENDPOINTS ============
    /**
     * Get workspace workload summary
     * GET /workload/workspace/:workspaceId
     */
    async getWorkspaceWorkload(workspaceId) {
        const response = await this.axios.get(`/workload/workspace/${workspaceId}`);
        return response.data;
    }
    /**
     * Get member workload details
     * GET /workload/member/:userId
     */
    async getMemberWorkload(userId, workspaceId) {
        const response = await this.axios.get(`/workload/member/${userId}`, {
            params: { workspaceId },
        });
        return response.data;
    }
    /**
     * Get current user's workload
     * GET /workload/me
     */
    async getMyWorkload(workspaceId) {
        const response = await this.axios.get("/workload/me", {
            params: { workspaceId },
        });
        return response.data;
    }
    /**
     * Get workload suggestions for redistribution
     * GET /workload/suggestions/:workspaceId
     */
    async getWorkloadSuggestions(workspaceId) {
        const response = await this.axios.get(`/workload/suggestions/${workspaceId}`);
        return response.data;
    }
    // ============ NOTES ENDPOINTS ============
    /**
     * Create a new note
     * POST /notes
     */
    async createNote(data) {
        const response = await this.axios.post("/notes", data);
        return response.data;
    }
    /**
     * Get all notes for a workspace
     * GET /notes?workspaceId=...
     */
    async getNotes(workspaceId) {
        const response = await this.axios.get("/notes", {
            params: { workspaceId },
        });
        // Handle paginated response: { data: [...], meta: {...} }
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        // Handle direct array response
        if (response.data && Array.isArray(response.data)) {
            return response.data;
        }
        // Default to empty array if response is unexpected
        return [];
    }
    /**
     * Get a specific note
     * GET /notes/:id
     */
    async getNote(id) {
        const response = await this.axios.get(`/notes/${id}`);
        return response.data;
    }
    /**
     * Update a note
     * PATCH /notes/:id
     */
    async updateNote(id, data) {
        const response = await this.axios.patch(`/notes/${id}`, data);
        return response.data;
    }
    /**
     * Delete a note
     * DELETE /notes/:id
     */
    async deleteNote(id) {
        await this.axios.delete(`/notes/${id}`);
    }
}
exports.OrdoApiClient = OrdoApiClient;
