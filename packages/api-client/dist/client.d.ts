import { AxiosInstance, AxiosError } from "axios";
import type { TokenStorage } from "./utils/storage";
import type { RegisterDto, LoginDto, AuthResponse, RefreshTokenDto, User, UpdateProfileDto, UserResponse, UserProfileResponse, UserPreferences, UpdatePreferencesDto, UserIntegration, Workspace, WorkspaceWithMembers, WorkspaceMember, WorkspaceInvitation, WorkspaceSettings, WorkspaceAuditLog, WorkspaceAuditLogsResponse, CreateWorkspaceDto, UpdateWorkspaceDto, UpdateWorkspaceSettingsDto, AddMemberDto, InviteMemberDto, AcceptInvitationDto, Workflow, CreateWorkflowDto, UpdateWorkflowDto, Project, CreateProjectDto, UpdateProjectDto, Task, TaskDetails, TaskShareResponse, PublicTaskResponse, TodayTasksResponse, TimeBlock, CreateTaskDto, UpdateTaskDto, CreateSubtaskDto, Tag, CreateTagDto, UpdateTagDto, TimeSession, StartTimerDto, StopTimerDto, ActiveTimerResponse, GetSessionsParams, PaginatedSessionsResponse, GetTimerStatsParams, TimerStatsResponse, TaskTimeResponse, CreateTimerSessionDto, UpdateTimerSessionDto, DailyMetrics, GetDailyMetricsParams, Comment, CreateCommentDto, UpdateCommentDto, Attachment, CreateAttachmentDto, AIProfile, OptimalScheduleResponse, PredictDurationResponse, WeeklyReportResponse, ProductivityReport, Notification, UnreadCountResponse, CreateConversationDto, SendMessageDto, ConversationResponse, ConversationDetail, SendMessageResponse, AIInsightsResponse, Habit, CreateHabitDto, UpdateHabitDto, CompleteHabitDto, HabitStats, TodayHabitsResponse, CompleteHabitResponse, Objective, KeyResult, KeyResultTask, CreateObjectiveDto, UpdateObjectiveDto, CreateKeyResultDto, UpdateKeyResultDto, LinkTaskDto, ObjectiveDashboardSummary, CustomField, CustomFieldValue, CreateCustomFieldDto, UpdateCustomFieldDto, SetMultipleCustomFieldValuesDto, BurnoutAnalysis, WorkPatterns, RestRecommendation, BurnoutIntervention, WeeklyWellbeingSummary, WorkspaceWorkload, MemberWorkload, WorkloadSuggestion } from "./types";
/**
 * Retry configuration for failed requests
 */
export interface RetryConfig {
    /**
     * Number of times to retry a failed request
     * Default: 3
     */
    retries?: number;
    /**
     * Whether to retry on 4xx errors (client errors)
     * Default: false (only retry on 5xx and network errors)
     */
    retryOn4xx?: boolean;
    /**
     * HTTP status codes that should trigger a retry
     * Default: [408, 429, 500, 502, 503, 504]
     */
    retryCondition?: (error: AxiosError) => boolean;
    /**
     * Initial delay before first retry in milliseconds
     * Default: 1000 (1 second)
     */
    retryDelay?: number;
    /**
     * Multiplier for exponential backoff
     * Default: 2 (delay doubles each retry: 1s, 2s, 4s, 8s...)
     */
    retryDelayMultiplier?: number;
    /**
     * Maximum delay between retries in milliseconds
     * Default: 30000 (30 seconds)
     */
    maxRetryDelay?: number;
    /**
     * Jitter to add randomness to retry delays (0-1)
     * Default: 0.1 (10% randomness)
     * Helps prevent "thundering herd" problem
     */
    retryDelayJitter?: number;
}
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
    /**
     * Optional retry configuration for failed requests.
     * Implements exponential backoff with jitter to prevent thundering herd.
     */
    retry?: RetryConfig;
}
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
export declare class OrdoApiClient {
    protected axios: AxiosInstance;
    private tokenStorage?;
    private isRefreshing;
    private refreshPromise;
    private onTokenRefresh?;
    private onAuthError?;
    private retryConfig?;
    constructor(config: ClientConfig);
    /**
     * Setup request and response interceptors for automatic token management
     */
    private setupInterceptors;
    /**
     * Handle token refresh logic with deduplication
     */
    private handleTokenRefresh;
    /**
     * Check if an error should be retried based on retry configuration
     */
    private shouldRetry;
    /**
     * Calculate retry delay with exponential backoff and jitter
     */
    private calculateRetryDelay;
    /**
     * Retry a failed request with exponential backoff
     */
    private retryRequest;
    /**
     * Register a new user account
     * POST /auth/register
     */
    register(data: RegisterDto): Promise<AuthResponse>;
    /**
     * Login with email and password
     * POST /auth/login
     */
    login(data: LoginDto): Promise<AuthResponse>;
    /**
     * Refresh access token using refresh token
     * POST /auth/refresh
     */
    refreshToken(data: RefreshTokenDto): Promise<AuthResponse>;
    /**
     * Check if a username is available
     * POST /auth/check-username
     */
    checkUsernameAvailability(username: string): Promise<{
        available: boolean;
        message?: string;
    }>;
    /**
     * Logout (clear tokens from storage)
     * This is a client-side only operation
     */
    logout(): Promise<void>;
    /**
     * Get current authenticated user
     * GET /users/me
     */
    getCurrentUser(): Promise<UserResponse>;
    /**
     * Get full user profile with subscription, integrations, and preferences
     * GET /users/me/profile
     */
    getFullProfile(): Promise<UserProfileResponse>;
    /**
     * Update current user profile
     * PUT /users/me
     */
    updateProfile(data: UpdateProfileDto): Promise<{
        success: boolean;
        user: User;
    }>;
    /**
     * Get user preferences
     * GET /users/me/preferences
     */
    getPreferences(): Promise<UserPreferences | null>;
    /**
     * Update user preferences (AI and privacy settings)
     * PATCH /users/me/preferences
     */
    updatePreferences(data: UpdatePreferencesDto): Promise<{
        success: boolean;
        preferences: UserPreferences;
    }>;
    /**
     * Get user integrations
     * GET /users/me/integrations
     */
    getIntegrations(): Promise<UserIntegration[]>;
    /**
     * Export user data (GDPR)
     * POST /users/me/export
     */
    exportData(): Promise<Blob>;
    /**
     * Delete user account
     * DELETE /users/me
     */
    deleteAccount(): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Create a new workspace
     * POST /workspaces
     */
    createWorkspace(data: CreateWorkspaceDto): Promise<Workspace>;
    /**
     * Get all workspaces for current user
     * GET /workspaces
     */
    getWorkspaces(): Promise<Workspace[]>;
    /**
     * Get a specific workspace by ID
     * GET /workspaces/:id
     */
    getWorkspace(workspaceId: string): Promise<WorkspaceWithMembers>;
    /**
     * Get a specific workspace by Slug and Username
     * GET /workspaces/:username/:slug
     */
    getWorkspaceBySlug(username: string, slug: string): Promise<WorkspaceWithMembers>;
    /**
     * Update a workspace
     * PUT /workspaces/:id
     */
    updateWorkspace(workspaceId: string, data: UpdateWorkspaceDto): Promise<Workspace>;
    /**
     * Delete a workspace
     * DELETE /workspaces/:id
     */
    deleteWorkspace(workspaceId: string): Promise<void>;
    /**
     * Get all deleted workspaces (trash)
     * GET /workspaces/deleted
     */
    getDeletedWorkspaces(): Promise<Workspace[]>;
    /**
     * Restore a deleted workspace
     * POST /workspaces/:id/restore
     */
    restoreWorkspace(workspaceId: string): Promise<{
        success: boolean;
    }>;
    /**
     * Permanently delete a workspace
     * DELETE /workspaces/:id/permanent
     */
    permanentDeleteWorkspace(workspaceId: string): Promise<void>;
    /**
     * Add a member to a workspace
     * POST /workspaces/:id/members
     */
    addWorkspaceMember(workspaceId: string, data: AddMemberDto): Promise<{
        success: boolean;
    }>;
    /**
     * Remove a member from a workspace
     * DELETE /workspaces/:id/members/:userId
     */
    removeWorkspaceMember(workspaceId: string, userId: string): Promise<void>;
    /**
     * Create a new workflow
     * POST /workflows
     */
    createWorkflow(data: CreateWorkflowDto): Promise<Workflow>;
    /**
     * Get all workflows for a workspace
     * GET /workflows?workspaceId=xxx
     */
    getWorkflows(workspaceId: string): Promise<Workflow[]>;
    /**
     * Update a workflow
     * PUT /workflows/:id
     */
    updateWorkflow(workflowId: string, data: UpdateWorkflowDto): Promise<Workflow>;
    /**
     * Delete a workflow
     * DELETE /workflows/:id
     */
    deleteWorkflow(workflowId: string): Promise<void>;
    /**
     * Create a new project
     * POST /projects
     */
    createProject(data: CreateProjectDto): Promise<Project>;
    /**
     * Get all projects for a workspace
     * GET /projects?workspaceId=xxx
     */
    getProjects(workspaceId: string): Promise<Project[]>;
    /**
     * Get all projects across all workspaces
     * GET /projects/all
     */
    getAllProjects(): Promise<Project[]>;
    /**
     * Get a specific project by ID
     * GET /projects/:id
     */
    getProject(projectId: string): Promise<Project>;
    /**
     * Get a specific project by slug and username
     * GET /projects/:username/:projectSlug
     */
    getProjectBySlug(username: string, projectSlug: string): Promise<Project>;
    /**
     * Get a project by workspace and project slugs
     * GET /projects/by-slug/:workspaceSlug/:projectSlug
     */
    getProjectBySlugs(workspaceSlug: string, projectSlug: string): Promise<Project>;
    /**
     * Update a project
     * PUT /projects/:id
     */
    updateProject(projectId: string, data: UpdateProjectDto): Promise<Project>;
    /**
     * Archive a project
     * PATCH /projects/:id/archive
     */
    archiveProject(projectId: string): Promise<Project>;
    /**
     * Complete a project (mark as finished)
     * PATCH /projects/:id/complete
     */
    completeProject(projectId: string): Promise<Project>;
    /**
     * Delete a project
     * DELETE /projects/:id
     */
    deleteProject(projectId: string): Promise<void>;
    /**
     * Create a new task
     * POST /tasks
     */
    createTask(data: CreateTaskDto): Promise<Task>;
    /**
     * Mark a task as complete
     * PATCH /tasks/:id/complete
     */
    completeTask(taskId: string): Promise<Task>;
    /**
     * Get all tasks (optionally filtered by project)
     * GET /tasks?projectId=xxx
     */
    getTasks(projectId?: string, tags?: string[]): Promise<Task[]>;
    /**
     * Get tasks categorized for today view
     * GET /tasks/today
     * Returns: overdue, dueToday, scheduledToday, available, notYetAvailable
     */
    getTasksToday(): Promise<TodayTasksResponse>;
    /**
     * Get tasks scheduled for a specific date
     * GET /tasks/scheduled?date=xxx
     */
    getScheduledTasks(date?: Date | string): Promise<Task[]>;
    /**
     * Get all available tasks (can be started today)
     * GET /tasks/available?projectId=xxx
     */
    getAvailableTasks(projectId?: string): Promise<Task[]>;
    /**
     * Get time-blocked tasks within a date range for calendar view
     * GET /tasks/time-blocks?start=xxx&end=xxx
     */
    getTimeBlocks(start?: Date | string, end?: Date | string): Promise<TimeBlock[]>;
    getTask(taskId: string): Promise<Task>;
    /**
     * Get task details with all relations (subtasks, comments, attachments)
     * GET /tasks/:id/details
     */
    getTaskDetails(taskId: string): Promise<TaskDetails>;
    /**
     * Update a task
     * PUT /tasks/:id
     */
    updateTask(taskId: string, data: UpdateTaskDto): Promise<Task>;
    /**
     * Delete a task
     * DELETE /tasks/:id
     */
    deleteTask(taskId: string): Promise<void>;
    /**
     * Create a subtask under a parent task
     * POST /tasks/:id/subtasks
     */
    createSubtask(parentTaskId: string, data: CreateSubtaskDto): Promise<Task>;
    /**
     * Assign a task to a user
     * POST /tasks/:id/assign
     */
    assignTask(taskId: string, userId: string): Promise<Task>;
    /**
     * Unassign a task from a user
     * DELETE /tasks/:id/assign
     */
    unassignTask(taskId: string, userId: string): Promise<Task>;
    /**
     * Create a new tag
     * POST /tags
     */
    createTag(data: CreateTagDto): Promise<Tag>;
    /**
     * Get all tags for a workspace
     * GET /tags?workspaceId=xxx
     */
    getTags(workspaceId: string): Promise<Tag[]>;
    /**
     * Assign a tag to a task
     * POST /tags/:tagId/tasks/:taskId
     */
    assignTagToTask(tagId: string, taskId: string): Promise<{
        success: boolean;
    }>;
    /**
     * Remove a tag from a task
     * DELETE /tags/:tagId/tasks/:taskId
     */
    removeTagFromTask(tagId: string, taskId: string): Promise<void>;
    /**
     * Get all tags for a specific task
     * GET /tasks/:taskId/tags
     */
    getTaskTags(taskId: string): Promise<Tag[]>;
    /**
     * Delete a tag
     * DELETE /tags/:id
     */
    deleteTag(tagId: string): Promise<void>;
    /**
     * Start a timer session for a task
     * POST /timers/start
     */
    startTimer(data: StartTimerDto): Promise<TimeSession>;
    /**
     * Stop the current timer session
     * POST /timers/stop
     */
    stopTimer(data: StopTimerDto): Promise<TimeSession>;
    /**
     * Get the current active timer session
     * GET /timers/active
     */
    getActiveTimer(): Promise<ActiveTimerResponse>;
    /**
     * Pause the current timer session
     * POST /timers/pause
     */
    pauseTimer(data?: {
        pauseStartedAt?: Date;
    }): Promise<TimeSession>;
    /**
     * Resume a paused timer session
     * POST /timers/resume
     */
    resumeTimer(data: {
        pauseStartedAt: Date;
    }): Promise<TimeSession>;
    /**
     * Switch to a different task during an active timer session
     * POST /timers/switch-task
     */
    switchTask(data: {
        newTaskId: string;
        type?: string;
        splitReason?: string;
    }): Promise<{
        oldSession: TimeSession;
        newSession: TimeSession;
    }>;
    /**
     * Get timer session history with filters and pagination
     * GET /timers/history
     */
    getSessionHistory(params?: GetSessionsParams): Promise<PaginatedSessionsResponse>;
    /**
     * Get timer statistics for the current user
     * GET /timers/stats
     */
    getTimerStats(params?: GetTimerStatsParams): Promise<TimerStatsResponse>;
    /**
     * Get time tracking info for a specific task
     * GET /timers/task/:taskId
     */
    getTaskTimeSessions(taskId: string): Promise<TaskTimeResponse>;
    /**
     * Get daily metrics for current user
     * GET /analytics/daily?startDate=xxx&endDate=xxx
     */
    getDailyMetrics(params?: GetDailyMetricsParams): Promise<DailyMetrics[]>;
    /**
     * Get dashboard stats (pomodoros, tasks, minutes, trends)
     * GET /analytics/dashboard-stats
     */
    getDashboardStats(): Promise<{
        pomodoros: number;
        tasks: number;
        minutes: number;
        avgPerDay: number;
        trends: {
            pomodoros: number;
            tasks: number;
            minutes: number;
        };
    }>;
    /**
     * Get weekly metrics
     * GET /analytics/weekly
     */
    getWeeklyMetrics(): Promise<Array<{
        date: string;
        pomodorosCount: number;
        focusDuration: number;
        tasksCompletedCount: number;
    }>>;
    /**
     * Get heatmap data (activity by hour/day)
     * GET /analytics/heatmap
     */
    getHeatmapData(): Promise<Array<{
        day: number;
        hour: number;
        value: number;
    }>>;
    /**
     * Get project time distribution
     * GET /analytics/project-distribution
     */
    getProjectDistribution(): Promise<Array<{
        name: string;
        value: number;
    }>>;
    /**
     * Get task status distribution
     * GET /analytics/task-status-distribution
     */
    getTaskStatusDistribution(): Promise<Array<{
        status: string;
        count: number;
    }>>;
    /**
     * Create a new comment on a task
     * POST /comments
     */
    createComment(data: CreateCommentDto): Promise<Comment>;
    /**
     * Update a comment
     * PUT /comments/:id
     */
    updateComment(commentId: string, data: UpdateCommentDto): Promise<Comment>;
    /**
     * Delete a comment
     * DELETE /comments/:id
     */
    deleteComment(commentId: string): Promise<void>;
    /**
     * Get all comments for a task
     * GET /tasks/:taskId/comments
     */
    getTaskComments(taskId: string): Promise<Comment[]>;
    /**
     * Create a new attachment on a task
     * POST /attachments
     */
    createAttachment(data: CreateAttachmentDto): Promise<Attachment>;
    /**
     * Delete an attachment
     * DELETE /attachments/:id
     */
    deleteAttachment(attachmentId: string): Promise<void>;
    /**
     * Get all attachments for a task
     * GET /tasks/:taskId/attachments
     */
    getTaskAttachments(taskId: string): Promise<Attachment[]>;
    /**
     * Get AI profile for current user
     * GET /ai/profile
     */
    getAIProfile(): Promise<AIProfile>;
    /**
     * Get optimal schedule based on AI profile
     * GET /ai/optimal-schedule
     */
    getOptimalSchedule(topN?: number): Promise<OptimalScheduleResponse>;
    /**
     * Predict task duration based on AI profile
     * GET /ai/predict-duration
     */
    predictTaskDuration(params: {
        title?: string;
        description?: string;
        category?: string;
        priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    }): Promise<PredictDurationResponse>;
    /**
     * Generate weekly productivity report
     * POST /ai/reports/weekly
     */
    generateWeeklyReport(weekStart?: string): Promise<WeeklyReportResponse>;
    /**
     * Get productivity reports
     * GET /ai/reports
     */
    getReports(params?: {
        scope?: string;
        limit?: number;
        offset?: number;
    }): Promise<ProductivityReport[]>;
    /**
     * Get a specific productivity report
     * GET /ai/reports/:id
     */
    getReport(reportId: string): Promise<ProductivityReport>;
    /**
     * Delete a productivity report
     * DELETE /ai/reports/:id
     */
    deleteReport(reportId: string): Promise<void>;
    /**
     * Get workspace members
     * GET /workspaces/:id/members
     */
    getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]>;
    /**
     * Get workspace invitations
     * GET /workspaces/:id/invitations
     */
    getWorkspaceInvitations(workspaceId: string): Promise<WorkspaceInvitation[]>;
    /**
     * Invite a member to a workspace
     * POST /workspaces/:id/invite
     */
    inviteWorkspaceMember(workspaceId: string, data: InviteMemberDto): Promise<WorkspaceInvitation>;
    /**
     * Accept a workspace invitation
     * POST /workspaces/invitations/accept
     */
    acceptWorkspaceInvitation(data: AcceptInvitationDto): Promise<{
        success: boolean;
    }>;
    /**
     * Get workspace settings
     * GET /workspaces/:id/settings
     */
    getWorkspaceSettings(workspaceId: string): Promise<WorkspaceSettings>;
    /**
     * Update workspace settings
     * PUT /workspaces/:id/settings
     */
    updateWorkspaceSettings(workspaceId: string, data: UpdateWorkspaceSettingsDto): Promise<WorkspaceSettings>;
    /**
     * Get workspace audit logs
     * GET /workspaces/:id/audit-logs
     */
    getWorkspaceAuditLogs(workspaceId: string, params?: {
        limit?: number;
        offset?: number;
    }): Promise<WorkspaceAuditLogsResponse>;
    /**
     * Create an audit log entry
     * POST /workspaces/:id/audit-logs
     */
    createAuditLog(workspaceId: string, action: string, payload?: Record<string, unknown>): Promise<WorkspaceAuditLog>;
    /**
     * Archive a workspace
     * POST /workspaces/:id/archive
     */
    archiveWorkspace(workspaceId: string): Promise<Workspace>;
    /**
     * Update a tag
     * PUT /tags/:id
     */
    updateTag(tagId: string, data: UpdateTagDto): Promise<Tag>;
    /**
     * Get all timer sessions for a task
     * GET /timers?taskId=xxx
     */
    getTimerSessions(taskId: string): Promise<TimeSession[]>;
    /**
     * Get a specific timer session
     * GET /timers/:id
     */
    getTimerSession(sessionId: string): Promise<TimeSession>;
    /**
     * Create a manual timer session
     * POST /timers/session
     */
    createTimerSession(data: CreateTimerSessionDto): Promise<TimeSession>;
    /**
     * Update a timer session
     * PATCH /timers/:id
     */
    updateTimerSession(sessionId: string, data: UpdateTimerSessionDto): Promise<TimeSession>;
    /**
     * Delete a timer session
     * DELETE /timers/:id
     */
    deleteTimerSession(sessionId: string): Promise<void>;
    /**
     * Generate a public sharing token for a task
     * POST /tasks/:id/share
     */
    generatePublicToken(taskId: string): Promise<TaskShareResponse>;
    /**
     * Get a task by its public sharing token
     * GET /tasks/share/:token
     */
    getTaskByPublicToken(token: string): Promise<PublicTaskResponse>;
    /**
     * Get monthly metrics
     * GET /analytics/monthly
     */
    getMonthlyMetrics(params?: {
        monthStart?: string;
    }): Promise<DailyMetrics[]>;
    /**
     * Get metrics for a date range
     * GET /analytics/range
     */
    getDateRangeMetrics(startDate: string, endDate: string): Promise<DailyMetrics[]>;
    /**
     * Get all attachments for a project
     * GET /attachments/project/:projectId
     */
    getProjectAttachments(projectId: string): Promise<Attachment[]>;
    /**
     * Get all notifications for the current user
     * GET /notifications
     */
    getNotifications(): Promise<Notification[]>;
    /**
     * Get unread notifications count
     * GET /notifications/unread-count
     */
    getUnreadNotificationsCount(): Promise<UnreadCountResponse>;
    /**
     * Mark a notification as read
     * PATCH /notifications/:id/read
     */
    markNotificationAsRead(notificationId: string): Promise<Notification>;
    /**
     * Mark all notifications as read
     * POST /notifications/mark-all-read
     */
    markAllNotificationsAsRead(): Promise<{
        success: boolean;
    }>;
    /**
     * List all conversations
     * GET /chat/conversations
     */
    getConversations(params?: {
        limit?: number;
        offset?: number;
        includeArchived?: boolean;
    }): Promise<ConversationResponse[]>;
    /**
     * Get a single conversation with messages
     * GET /chat/conversations/:id
     */
    getConversation(id: string): Promise<ConversationDetail>;
    /**
     * Create a new conversation
     * POST /chat/conversations
     */
    createConversation(data: CreateConversationDto): Promise<ConversationResponse>;
    /**
     * Send a message to a conversation
     * POST /chat/conversations/:id/messages
     */
    sendMessage(conversationId: string, data: SendMessageDto): Promise<SendMessageResponse>;
    /**
     * Update conversation title
     * PATCH /chat/conversations/:id
     */
    updateConversation(id: string, title: string): Promise<ConversationResponse>;
    /**
     * Archive a conversation
     * PATCH /chat/conversations/:id/archive
     */
    archiveConversation(id: string): Promise<ConversationResponse>;
    /**
     * Delete a conversation
     * DELETE /chat/conversations/:id
     */
    deleteConversation(id: string): Promise<void>;
    /**
     * Get AI insights
     * GET /chat/insights
     */
    getAIInsights(): Promise<AIInsightsResponse>;
    /**
     * Create a new habit
     * POST /habits
     */
    createHabit(data: CreateHabitDto): Promise<Habit>;
    /**
     * Get all habits for current user
     * GET /habits
     */
    getHabits(includeArchived?: boolean): Promise<Habit[]>;
    /**
     * Get habits for today with completion status
     * GET /habits/today
     */
    getTodayHabits(): Promise<TodayHabitsResponse>;
    /**
     * Get a specific habit by ID
     * GET /habits/:id
     */
    getHabit(habitId: string): Promise<Habit>;
    /**
     * Get habit statistics
     * GET /habits/:id/stats
     */
    getHabitStats(habitId: string): Promise<HabitStats>;
    /**
     * Update a habit
     * PATCH /habits/:id
     */
    updateHabit(habitId: string, data: UpdateHabitDto): Promise<Habit>;
    /**
     * Delete a habit
     * DELETE /habits/:id
     */
    deleteHabit(habitId: string): Promise<void>;
    /**
     * Complete a habit for today
     * POST /habits/:id/complete
     */
    completeHabit(habitId: string, data?: CompleteHabitDto): Promise<CompleteHabitResponse>;
    /**
     * Uncomplete a habit for today
     * DELETE /habits/:id/complete
     */
    uncompleteHabit(habitId: string): Promise<{
        success: boolean;
        newStreak: number;
    }>;
    /**
     * Pause a habit
     * POST /habits/:id/pause
     */
    pauseHabit(habitId: string): Promise<Habit>;
    /**
     * Resume a habit
     * POST /habits/:id/resume
     */
    resumeHabit(habitId: string): Promise<Habit>;
    /**
     * Create a new objective
     * POST /objectives
     */
    createObjective(data: CreateObjectiveDto): Promise<Objective>;
    /**
     * Get all objectives for current user
     * GET /objectives
     */
    getObjectives(options?: {
        status?: string;
        workspaceId?: string;
    }): Promise<Objective[]>;
    /**
     * Get objectives for current period (quarter)
     * GET /objectives/current-period
     */
    getCurrentPeriodObjectives(): Promise<Objective[]>;
    /**
     * Get objectives dashboard summary
     * GET /objectives/dashboard-summary
     */
    getObjectivesDashboardSummary(): Promise<ObjectiveDashboardSummary>;
    /**
     * Get a specific objective by ID
     * GET /objectives/:id
     */
    getObjective(objectiveId: string): Promise<Objective>;
    /**
     * Update an objective
     * PATCH /objectives/:id
     */
    updateObjective(objectiveId: string, data: UpdateObjectiveDto): Promise<Objective>;
    /**
     * Delete an objective
     * DELETE /objectives/:id
     */
    deleteObjective(objectiveId: string): Promise<void>;
    /**
     * Add a key result to an objective
     * POST /objectives/:id/key-results
     */
    addKeyResult(objectiveId: string, data: CreateKeyResultDto): Promise<KeyResult>;
    /**
     * Update a key result
     * PATCH /objectives/key-results/:id
     */
    updateKeyResult(keyResultId: string, data: UpdateKeyResultDto): Promise<KeyResult>;
    /**
     * Delete a key result
     * DELETE /objectives/key-results/:id
     */
    deleteKeyResult(keyResultId: string): Promise<void>;
    /**
     * Link a task to a key result
     * POST /objectives/key-results/:id/tasks
     */
    linkTaskToKeyResult(keyResultId: string, data: LinkTaskDto): Promise<KeyResultTask>;
    /**
     * Unlink a task from a key result
     * DELETE /objectives/key-results/:id/tasks/:taskId
     */
    unlinkTaskFromKeyResult(keyResultId: string, taskId: string): Promise<void>;
    /**
     * Get all custom fields for a project
     * GET /projects/:projectId/custom-fields
     */
    getProjectCustomFields(projectId: string): Promise<CustomField[]>;
    /**
     * Create a custom field for a project
     * POST /projects/:projectId/custom-fields
     */
    createCustomField(projectId: string, data: CreateCustomFieldDto): Promise<CustomField>;
    /**
     * Update a custom field
     * PATCH /custom-fields/:id
     */
    updateCustomField(fieldId: string, data: UpdateCustomFieldDto): Promise<CustomField>;
    /**
     * Delete a custom field
     * DELETE /custom-fields/:id
     */
    deleteCustomField(fieldId: string): Promise<void>;
    /**
     * Get custom field values for a task
     * GET /tasks/:taskId/custom-values
     */
    getTaskCustomValues(taskId: string): Promise<CustomFieldValue[]>;
    /**
     * Set custom field values for a task
     * PATCH /tasks/:taskId/custom-values
     */
    setTaskCustomValues(taskId: string, data: SetMultipleCustomFieldValuesDto): Promise<CustomFieldValue[]>;
    /**
     * Get burnout risk analysis for current user
     * GET /ai/burnout/analysis
     */
    getBurnoutAnalysis(): Promise<BurnoutAnalysis>;
    /**
     * Get work patterns for current user
     * GET /ai/burnout/patterns
     */
    getWorkPatterns(): Promise<WorkPatterns>;
    /**
     * Get rest recommendations
     * GET /ai/burnout/recommendations
     */
    getRestRecommendations(): Promise<RestRecommendation[]>;
    /**
     * Check for burnout intervention needs
     * GET /ai/burnout/intervention
     */
    checkBurnoutIntervention(): Promise<BurnoutIntervention>;
    /**
     * Get weekly wellbeing summary
     * GET /ai/burnout/weekly-summary
     */
    getWeeklyWellbeingSummary(): Promise<WeeklyWellbeingSummary>;
    /**
     * Get workspace workload summary
     * GET /workload/workspace/:workspaceId
     */
    getWorkspaceWorkload(workspaceId: string): Promise<WorkspaceWorkload>;
    /**
     * Get member workload details
     * GET /workload/member/:userId
     */
    getMemberWorkload(userId: string, workspaceId?: string): Promise<MemberWorkload>;
    /**
     * Get current user's workload
     * GET /workload/me
     */
    getMyWorkload(workspaceId?: string): Promise<MemberWorkload>;
    /**
     * Get workload suggestions for redistribution
     * GET /workload/suggestions/:workspaceId
     */
    getWorkloadSuggestions(workspaceId: string): Promise<WorkloadSuggestion[]>;
}
//# sourceMappingURL=client.d.ts.map