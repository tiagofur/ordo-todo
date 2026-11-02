import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import type { TokenStorage } from "./utils/storage";
import type {
  // Auth
  RegisterDto,
  RegistrationMode,
  LoginDto,
  AuthResponse,
  RefreshTokenDto,
  ChangePasswordDto,
  SessionInfo,
  // User
  User,
  UpdateProfileDto,
  UserResponse,
  UserProfileResponse,
  UserPreferences,
  UpdatePreferencesDto,
  UserIntegration,
  CalendarAccountStatus,
  SlackTeamMapping,
  AgentJob,
  CreateAgentJobInput,
  UpdateAgentJobInput,
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
  DayPlanView,
  DayPlanRisk,
  TaskShareResponse,
  PublicTaskResponse,
  TodayTasksResponse,
  TimeBlock,
  CreateTaskDto,
  UpdateTaskDto,
  CreateSubtaskDto,
  GetTasksParams,
  GetScheduledTasksParams,
  GetAvailableTasksParams,
  GetTimeBlocksParams,
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
  ProductivityStreak,
  // Comment
  Comment,
  CreateCommentDto,
  UpdateCommentDto,
  // Attachment
  Attachment,
  CreateAttachmentDto,
  // AI
  AIProfile,
  ParsedTaskInput,
  ParseTaskRequest,
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
  // Wellbeing
  BurnoutAnalysis,
  WorkPatterns,
  RestRecommendation,
  BurnoutIntervention,
  WeeklyWellbeingSummary,
  // Workload
  WorkspaceWorkload,
  MemberWorkload,
  WorkloadSuggestion,
  // Notes
  Note,
  CreateNoteDto as ClientCreateNoteDto, // Alias if needed, but names match
  UpdateNoteDto as ClientUpdateNoteDto,
  // Search types
  SearchResponse,
  SuggestionsResponse,
  AIAnswerResponse,
  QuickSearchResponse,
  // Billing
  BillingUsageOverview,
  BillingPlanId,
  BillingInterval,
  CheckoutSessionResult,
  PortalSessionResult,
  // Meetings
  Meeting,
  MeetingAnalysis,
  MeetingAnalysisOptions,
  MeetingSummaryStyle,
  MeetingActionItem,
  ConvertActionsOptions,
  ConvertTasksResult,
  SaveMeetingDto,
  GetMeetingsParams,
  // Admin
  AdminOverview,
  AdminUsersPage,
  GetAdminUsersParams,
  AdminUserDetail,
  AdminUserStatusResult,
  AdminProResult,
  GrantProDto,
  AdminInviteCode,
  CreateAdminInviteCodeDto,
  // Integrations and OAuth
  IntegrationActionResult,
  IntegrationDisconnectResult,
  OAuthClientInfo,
  OAuthConnection,
  OAuthDisconnectResult,
  // Gamification
  GamificationProfile,
  // Focus audio
  FocusTrack,
  FocusMode,
  FocusPreferences,
  UpdateFocusPreferencesDto,
  FocusFavoriteResult,
  FocusStats,
  // Ritual (ODD 006)
  RitualDayState,
  RitualEveningComplete,
  RitualEveningMove,
  RitualEveningView,
  RitualMorningView,
  RitualStreak,
  RitualTimeboxBlock,
  RitualTimeboxBlockInput,
} from "./types";

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
   * Base URL for the API (e.g., 'http://localhost:3101/api/v1')
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

  /**
   * Authentication transport mode.
   * - 'bearer' (default): attaches `Authorization: Bearer` from tokenStorage.
   * - 'credentialed': cookie transport for browser apps whose backend sets
   *   httpOnly cookies (JS cannot read those, so no Bearer header is sent).
   *   Sends cookies via `withCredentials` and an `x-csrf-token` header from
   *   `csrfTokenProvider` on mutating non-auth requests; refreshes the
   *   session with `POST /auth/refresh` and an empty body.
   * Existing consumers keep bearer behavior unless they opt in.
   */
  authTransport?: 'bearer' | 'credentialed';

  /**
   * Sends cookies on cross-site requests.
   * Defaults to true in credentialed mode, false otherwise.
   */
  withCredentials?: boolean;

  /**
   * Provides the CSRF token for credentialed mode (e.g. fetched once from
   * `GET /auth/csrf-token` and cached by the app, as apps/web does).
   * A rejection or null resolves to "no header" so one failing lookup
   * cannot break unrelated requests.
   */
  csrfTokenProvider?: () => string | null | Promise<string | null>;
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
 *   baseURL: 'http://localhost:3101/api/v1',
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
 *   baseURL: 'http://localhost:3101/api/v1',
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
export class OrdoApiClient {
  protected axios: AxiosInstance;
  private tokenStorage?: TokenStorage;
  private isRefreshing = false;
  private refreshPromise: Promise<AuthResponse> | null = null;
  private onTokenRefresh?: (tokens: AuthResponse) => void | Promise<void>;
  private onAuthError?: () => void | Promise<void>;
  private retryConfig?: RetryConfig;
  private readonly authTransport: 'bearer' | 'credentialed';
  private readonly csrfTokenProvider?: () => string | null | Promise<string | null>;
  // public testProp: string = 'test';

  constructor(config: ClientConfig) {
    this.tokenStorage = config.tokenStorage;
    this.onTokenRefresh = config.onTokenRefresh;
    this.onAuthError = config.onAuthError;
    this.retryConfig = config.retry;
    this.authTransport = config.authTransport ?? 'bearer';
    this.csrfTokenProvider = config.csrfTokenProvider;

    // withCredentials must stay absent (not false) in default bearer mode:
    // existing consumers assert the exact axios.create shape.
    const withCredentials =
      config.withCredentials ?? (this.authTransport === 'credentialed' ? true : undefined);

    this.axios = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        "Content-Type": "application/json",
      },
      ...(withCredentials !== undefined ? { withCredentials } : {}),
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors for automatic token management
   */
  private setupInterceptors(): void {
    // Request interceptor - attach JWT token (bearer) or CSRF token
    // (credentialed). In credentialed mode no Authorization credential is
    // ever attached, even when a tokenStorage is configured: the browser
    // sends httpOnly cookies via withCredentials instead.
    this.axios.interceptors.request.use(
      async (config) => {
        // Skip for refresh endpoint to avoid circular dependency/deadlock
        // and to prevent sending expired tokens to the refresh endpoint
        if (config.url?.includes("/auth/refresh")) {
          return config;
        }

        if (this.authTransport === 'credentialed') {
          await this.attachCsrfToken(config);
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

    // Response interceptor - handle errors, token refresh, and retry logic
    this.axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
          _retryAttempt?: number;
        };

        // Handle 401 Unauthorized errors (token refresh logic)
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Never refresh/teardown for auth endpoints or without a refresh
          // token: the unauthenticated /users/me that the login screen fires
          // must not run the onAuthError logout, or it races an in-flight
          // login and wipes the tokens it just stored (login 200 → back to
          // /auth with the form cleared). Same guard the web client got in
          // 4695fb76/d87ea74e. A request that went out without an
          // Authorization header is pre-auth by definition — same rule.
          const requestUrl = originalRequest.url || "";
          const hadAuthHeader = !!originalRequest.headers?.Authorization;
          const isCredentialed = this.authTransport === 'credentialed';
          const refreshToken = this.tokenStorage
            ? await this.tokenStorage.getRefreshToken()
            : null;
          if (
            requestUrl.includes("/auth/") ||
            (!isCredentialed && (!hadAuthHeader || !refreshToken))
          ) {
            return Promise.reject(error);
          }

          originalRequest._retry = true;

          try {
            if (isCredentialed) {
              // Cookie session: the backend rotates httpOnly cookies on
              // POST /auth/refresh with an empty body. Nothing to store
              // from JS; consumers are notified via onTokenRefresh.
              await this.refreshCredentialedSession();
            } else {
              // Try to refresh the token
              const newTokens = await this.handleTokenRefresh();

              // Update the original request with new token
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            }

            // Retry the original request
            return this.axios(originalRequest);
          } catch (refreshError) {
            // Session existed but the refresh failed: real teardown.
            if (this.onAuthError) {
              await this.onAuthError();
            }
            return Promise.reject(refreshError);
          }
        }

        // Handle retry logic for other errors
        if (this.retryConfig && error.response?.status !== 401) {
          try {
            return await this.retryRequest(
              error,
              originalRequest._retryAttempt ?? 0,
            );
          } catch (retryError) {
            // Retry failed, reject with original error
            return Promise.reject(error);
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

  /**
   * Attach the CSRF token for credentialed mode.
   * Only mutating, non-auth requests carry it (same rule as apps/web);
   * a failing or empty provider resolves to "no token" so the request
   * still goes out — CSRF enforcement lives server-side.
   */
  private async attachCsrfToken(config: InternalAxiosRequestConfig): Promise<void> {
    const method = config.method?.toLowerCase();
    if (!['post', 'put', 'patch', 'delete'].includes(method ?? '')) {
      return;
    }
    if (config.url?.startsWith('/auth/')) {
      return;
    }
    if (!this.csrfTokenProvider) {
      return;
    }
    try {
      const token = await this.csrfTokenProvider();
      if (token) {
        config.headers = config.headers ?? ({} as InternalAxiosRequestConfig['headers']);
        (config.headers as Record<string, string>)['x-csrf-token'] = token;
      }
    } catch {
      // Provider failures must not break unrelated requests.
    }
  }

  /**
   * Refresh a cookie session: POST /auth/refresh with an empty body, the
   * browser attaches the httpOnly refresh cookie via withCredentials.
   * Shares the bearer refresh deduplication gate so concurrent 401s
   * collapse into a single refresh call.
   */
  private async refreshCredentialedSession(): Promise<AuthResponse> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;

    this.refreshPromise = (async () => {
      try {
        const response = await this.axios.post<AuthResponse>('/auth/refresh', {});

        if (this.onTokenRefresh) {
          await this.onTokenRefresh(response.data);
        }

        return response.data;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Check if an error should be retried based on retry configuration
   */
  private shouldRetry(error: AxiosError, attempt: number): boolean {
    if (!this.retryConfig) return false;

    const maxRetries = this.retryConfig.retries ?? 3;
    if (attempt >= maxRetries) return false;

    // Use custom retry condition if provided
    if (this.retryConfig.retryCondition) {
      return this.retryConfig.retryCondition(error);
    }

    // Default retry conditions
    const statusCode = error.response?.status;

    // Retry on network errors (no status code)
    if (!statusCode) return true;

    // Retry on 5xx server errors
    if (statusCode >= 500) return true;

    // Retry on 408 Request Timeout
    if (statusCode === 408) return true;

    // Retry on 429 Too Many Requests
    if (statusCode === 429) return true;

    // Retry on 4xx if configured
    if (this.retryConfig.retryOn4xx && statusCode >= 400 && statusCode < 500) {
      return true;
    }

    return false;
  }

  /**
   * Calculate retry delay with exponential backoff and jitter
   */
  private calculateRetryDelay(attempt: number): number {
    if (!this.retryConfig) return 0;

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
  private async retryRequest(error: AxiosError, attempt: number): Promise<any> {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryAttempt?: number;
    };

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
   * GET /auth/registration-mode (ODD 019)
   */
  async getRegistrationMode(): Promise<{ mode: RegistrationMode }> {
    const response = await this.axios.get<{ mode: RegistrationMode }>(
      "/auth/registration-mode",
    );
    return response.data;
  }

  /**
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
   * Change user password
   * POST /auth/change-password
   */
  async changePassword(
    data: ChangePasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.axios.post<{
      success: boolean;
      message: string;
    }>("/auth/change-password", data);
    return response.data;
  }

  /**
   * Request password reset instructions
   * POST /auth/forgot-password
   */
  async forgotPassword(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.axios.post<{
      success: boolean;
      message: string;
    }>("/auth/forgot-password", { email });
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

  /**
   * Get Google OAuth authorization URL
   * GET /auth/google
   */
  async googleOAuth(): Promise<{ authUrl: string }> {
    const response = await this.axios.get<{ authUrl: string }>("/auth/google");
    return response.data;
  }

  /**
   * Handle Google OAuth callback
   * GET /auth/google/callback?code=xxx
   */
  async googleOAuthCallback(code: string): Promise<AuthResponse> {
    const response = await this.axios.get<AuthResponse>(
      "/auth/google/callback",
      {
        params: { code },
      },
    );

    // Store tokens if storage is available
    if (this.tokenStorage) {
      await this.tokenStorage.setToken(response.data.accessToken);
      await this.tokenStorage.setRefreshToken(response.data.refreshToken);
    }

    return response.data;
  }

  // ============ SESSION ENDPOINTS (4) ============

  /**
   * Get active sessions
   * GET /sessions
   */
  async getSessions(): Promise<SessionInfo[]> {
    const response = await this.axios.get<SessionInfo[]>("/sessions");
    return response.data;
  }

  /**
   * Get active session count
   * GET /sessions/count
   */
  async getSessionCount(): Promise<{ count: number }> {
    const response = await this.axios.get<{ count: number }>("/sessions/count");
    return response.data;
  }

  /**
   * Revoke a specific session
   * DELETE /sessions/:id
   */
  async revokeSession(sessionId: string): Promise<void> {
    await this.axios.delete(`/sessions/${sessionId}`);
  }

  /**
   * Revoke all other sessions
   * DELETE /sessions/others/all
   */
  async revokeAllOtherSessions(): Promise<void> {
    await this.axios.delete("/sessions/others/all");
  }

  /**
   * Semantic search across all user content
   * GET /search
   */
  async semanticSearch(
    query: string,
    options?: {
      types?: string;
      projectId?: string;
      includeCompleted?: boolean;
      limit?: number;
    },
  ): Promise<SearchResponse> {
    const params: any = { q: query };
    if (options?.types) params.types = options.types;
    if (options?.projectId) params.projectId = options.projectId;
    if (options?.includeCompleted !== undefined)
      params.includeCompleted = options.includeCompleted;
    if (options?.limit) params.limit = options.limit;

    const response = await this.axios.get<SearchResponse>("/search", {
      params,
    });
    return response.data;
  }

  /**
   * Get search suggestions based on partial input
   * GET /search/suggestions
   */
  async searchSuggestions(query: string): Promise<SuggestionsResponse> {
    const response = await this.axios.get<SuggestionsResponse>(
      "/search/suggestions",
      {
        params: { q: query },
      },
    );
    return response.data;
  }

  /**
   * Ask natural language questions about your data
   * GET /search/ask
   */
  async askAI(question: string): Promise<AIAnswerResponse> {
    const response = await this.axios.get<AIAnswerResponse>("/search/ask", {
      params: { q: question },
    });
    return response.data;
  }

  /**
   * Quick search for autocomplete
   * GET /search/quick
   */
  async quickSearch(query: string): Promise<QuickSearchResponse> {
    const response = await this.axios.get<QuickSearchResponse>(
      "/search/quick",
      {
        params: { q: query },
      },
    );
    return response.data;
  }

  /**
   * Get GitHub OAuth authorization URL
   * GET /auth/github
   */
  async githubOAuth(): Promise<{ authUrl: string }> {
    const response = await this.axios.get<{ authUrl: string }>("/auth/github");
    return response.data;
  }

  /**
   * Handle GitHub OAuth callback
   * GET /auth/github/callback?code=xxx
   */
  async githubOAuthCallback(code: string): Promise<AuthResponse> {
    const response = await this.axios.get<AuthResponse>(
      "/auth/github/callback",
      {
        params: { code },
      },
    );

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
   * Calendar sync account status
   * GET /integrations/calendar/status
   */
  async getCalendarStatus(): Promise<CalendarAccountStatus[]> {
    const response = await this.axios.get<CalendarAccountStatus[]>(
      "/integrations/calendar/status",
    );
    return response.data;
  }

  /**
   * Start calendar OAuth
   * POST /integrations/calendar/:provider/connect
   */
  async startCalendarConnect(
    provider: string,
  ): Promise<{ authorizeUrl: string; state: string }> {
    const response = await this.axios.post<{
      authorizeUrl: string;
      state: string;
    }>(`/integrations/calendar/${provider}/connect`);
    return response.data;
  }

  /**
   * Disconnect calendar provider
   * DELETE /integrations/calendar/:provider
   */
  async disconnectCalendar(provider: string): Promise<void> {
    await this.axios.delete(`/integrations/calendar/${provider}`);
  }

  /**
   * List agent jobs
   * GET /agent-jobs
   */
  async getAgentJobs(): Promise<AgentJob[]> {
    const response = await this.axios.get<AgentJob[]>("/agent-jobs");
    return response.data;
  }

  /**
   * Create an agent job from a natural-language schedule
   * POST /agent-jobs
   */
  async createAgentJob(input: CreateAgentJobInput): Promise<AgentJob> {
    const response = await this.axios.post<AgentJob>("/agent-jobs", input);
    return response.data;
  }

  /**
   * Update an agent job (pause/resume via isActive)
   * PATCH /agent-jobs/:id
   */
  async updateAgentJob(
    id: string,
    input: UpdateAgentJobInput,
  ): Promise<AgentJob> {
    const response = await this.axios.patch<AgentJob>(
      `/agent-jobs/${id}`,
      input,
    );
    return response.data;
  }

  /**
   * Delete an agent job
   * DELETE /agent-jobs/:id
   */
  async deleteAgentJob(id: string): Promise<void> {
    await this.axios.delete(`/agent-jobs/${id}`);
  }

  /**
   * Run an agent job immediately
   * POST /agent-jobs/:id/run
   */
  async runAgentJobNow(
    id: string,
  ): Promise<{ ok: boolean; summary?: string; error?: string }> {
    const response = await this.axios.post<{
      ok: boolean;
      summary?: string;
      error?: string;
    }>(`/agent-jobs/${id}/run`);
    return response.data;
  }

  /**
   * Slack connected teams
   * GET /slack/teams
   */
  async getSlackTeams(): Promise<SlackTeamMapping[]> {
    const response = await this.axios.get<SlackTeamMapping[]>("/slack/teams");
    return response.data;
  }

  /**
   * Start Slack install
   * POST /slack/install
   */
  async startSlackInstall(): Promise<{ installUrl: string; state: string }> {
    const response = await this.axios.post<{
      installUrl: string;
      state: string;
    }>("/slack/install");
    return response.data;
  }

  /**
   * Uninstall Slack from a team
   * DELETE /slack/team/:teamId
   */
  async uninstallSlack(teamId: string): Promise<void> {
    await this.axios.delete(`/slack/team/${teamId}`);
  }

  /**
   * Update Slack mapping settings
   * PATCH /slack/mappings/:id
   */
  async updateSlackMapping(
    id: string,
    data: Partial<
      Pick<
        SlackTeamMapping,
        | "channelId"
        | "projectId"
        | "dailySummary"
        | "summaryHour"
        | "focusSync"
        | "focusDnd"
      >
    >,
  ): Promise<SlackTeamMapping> {
    const response = await this.axios.patch<SlackTeamMapping>(
      `/slack/mappings/${id}`,
      data,
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

  /**
   * Change a member's role (ODD 018 S3 / W5)
   * PATCH /workspaces/:id/members/:userId/role
   * OWNER cannot be assigned nor targeted; the backend enforces it.
   */
  async changeWorkspaceMemberRole(
    workspaceId: string,
    userId: string,
    role: "ADMIN" | "MEMBER" | "VIEWER",
  ): Promise<{ success: boolean }> {
    const response = await this.axios.patch<{ success: boolean }>(
      `/workspaces/${workspaceId}/members/${userId}/role`,
      { role },
    );
    return response.data;
  }

  /**
   * Cancel a pending invitation (ODD 018 S3 / W5)
   * DELETE /workspaces/:id/invitations/:invitationId
   */
  async cancelWorkspaceInvitation(
    workspaceId: string,
    invitationId: string,
  ): Promise<{ success: boolean }> {
    const response = await this.axios.delete<{ success: boolean }>(
      `/workspaces/${workspaceId}/invitations/${invitationId}`,
    );
    return response.data;
  }

  /**
   * Leave a workspace (ODD 018 S3 / W6). The owner cannot leave.
   * POST /workspaces/:id/leave
   */
  async leaveWorkspace(workspaceId: string): Promise<{ success: boolean }> {
    const response = await this.axios.post<{ success: boolean }>(
      `/workspaces/${workspaceId}/leave`,
    );
    return response.data;
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

  /**
   * List soft-deleted projects scoped by workspace (trash)
   * GET /projects/deleted
   */
  async getDeletedProjects(workspaceId: string): Promise<Project[]> {
    const response = await this.axios.get<Project[]>("/projects/deleted", {
      params: { workspaceId },
    });
    return response.data;
  }

  /**
   * Restore a soft-deleted project
   * POST /projects/:id/restore
   */
  async restoreProject(id: string): Promise<Project> {
    const response = await this.axios.post<Project>(`/projects/${id}/restore`);
    return response.data;
  }

  /**
   * Permanently delete a project from trash
   * DELETE /projects/:id/permanent
   */
  async permanentDeleteProject(id: string): Promise<void> {
    await this.axios.delete(`/projects/${id}/permanent`);
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
   * Get all tasks (optionally filtered by project, or only express tasks)
   * GET /tasks?projectId=xxx | GET /tasks?withoutProject=true
   */
  async getTasks(
    projectId?: string,
    tags?: string[],
    assignedToMe?: boolean,
    withoutProject?: boolean,
  ): Promise<Task[]> {
    const params: GetTasksParams = {};
    if (projectId) params.projectId = projectId;
    if (withoutProject) params.withoutProject = true;
    if (tags && tags.length > 0) params.tags = tags;
    if (assignedToMe !== undefined) params.assignedToMe = assignedToMe;

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
    const params: GetScheduledTasksParams = {};
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
    const params: GetAvailableTasksParams = {};
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
    const params: GetTimeBlocksParams = {};
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
   * PATCH /tasks/:id
   */
  async updateTask(taskId: string, data: UpdateTaskDto): Promise<Task> {
    const response = await this.axios.patch<Task>(`/tasks/${taskId}`, data);
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
   * List soft-deleted tasks, optionally scoped by project (trash)
   * GET /tasks/deleted
   */
  async getDeletedTasks(projectId?: string): Promise<Task[]> {
    const response = await this.axios.get<Task[]>("/tasks/deleted", {
      params: projectId ? { projectId } : {},
    });
    return response.data;
  }

  /**
   * Restore a soft-deleted task
   * POST /tasks/:id/restore
   */
  async restoreTask(id: string): Promise<Task> {
    const response = await this.axios.post<Task>(`/tasks/${id}/restore`);
    return response.data;
  }

  /**
   * Permanently delete a task from trash
   * DELETE /tasks/:id/permanent
   */
  async permanentDeleteTask(id: string): Promise<void> {
    await this.axios.delete(`/tasks/${id}/permanent`);
  }

  /**
   * Get today's proposed day plan
   * GET /tasks/day-plan
   */
  async getDayPlan(): Promise<DayPlanView> {
    const response = await this.axios.get<DayPlanView>("/tasks/day-plan");
    return response.data;
  }

  /**
   * Apply a day plan proposal
   * POST /tasks/day-plan/apply
   */
  async applyDayPlan(proposalId: string): Promise<DayPlanView> {
    const response = await this.axios.post<DayPlanView>("/tasks/day-plan/apply", {
      proposalId,
    });
    return response.data;
  }

  /**
   * Dismiss a day plan proposal
   * POST /tasks/day-plan/dismiss
   */
  async dismissDayPlan(proposalId: string): Promise<DayPlanView> {
    const response = await this.axios.post<DayPlanView>("/tasks/day-plan/dismiss", {
      proposalId,
    });
    return response.data;
  }

  /**
   * Freeze a task block inside the day plan
   * POST /tasks/day-plan/freeze
   */
  async freezeDayPlanBlock(taskId: string): Promise<DayPlanView> {
    const response = await this.axios.post<DayPlanView>("/tasks/day-plan/freeze", {
      taskId,
    });
    return response.data;
  }

  /**
   * Unfreeze a task block inside the day plan
   * POST /tasks/day-plan/unfreeze
   */
  async unfreezeDayPlanBlock(taskId: string): Promise<DayPlanView> {
    const response = await this.axios.post<DayPlanView>("/tasks/day-plan/unfreeze", {
      taskId,
    });
    return response.data;
  }

  /**
   * List risks detected in the current day plan
   * GET /tasks/day-plan/risks
   */
  async getDayPlanRisks(): Promise<DayPlanRisk[]> {
    const response = await this.axios.get<DayPlanRisk[]>("/tasks/day-plan/risks");
    return response.data;
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

  /**
   * Get task dependencies
   * GET /tasks/:id/dependencies
   */
  async getTaskDependencies(taskId: string): Promise<Task[]> {
    const response = await this.axios.get<Task[]>(
      `/tasks/${taskId}/dependencies`,
    );
    return response.data;
  }

  /**
   * Add a dependency to a task
   * POST /tasks/:id/dependencies
   */
  async addTaskDependency(
    taskId: string,
    blockingTaskId: string,
  ): Promise<Task> {
    const response = await this.axios.post<Task>(
      `/tasks/${taskId}/dependencies`,
      { blockingTaskId },
    );
    return response.data;
  }

  /**
   * Remove a dependency from a task
   * DELETE /tasks/:id/dependencies/:blockingTaskId
   */
  async removeTaskDependency(
    taskId: string,
    blockingTaskId: string,
  ): Promise<void> {
    await this.axios.delete(`/tasks/${taskId}/dependencies/${blockingTaskId}`);
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
  async getWeeklyMetrics(params?: { weekStart?: string }): Promise<
    Array<{
      date: string;
      pomodorosCount: number;
      focusDuration: number;
      tasksCompletedCount: number;
    }>
  > {
    const response = await this.axios.get("/analytics/weekly", { params });
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

  /**
   * Get productivity streak information
   * GET /analytics/streak
   */
  async getProductivityStreak(): Promise<ProductivityStreak> {
    const response =
      await this.axios.get<ProductivityStreak>("/analytics/streak");
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
   * Upload a file as an attachment
   * POST /attachments/upload
   */
  async uploadAttachment(file: File, taskId?: string): Promise<Attachment> {
    const formData = new FormData();
    formData.append("file", file);
    if (taskId) {
      formData.append("taskId", taskId);
    }

    const response = await this.axios.post<Attachment>(
      "/attachments/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
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

  // ============ AI ENDPOINTS (8) ============

  /**
   * Parse natural language task input (fast mode skips the LLM)
   * POST /ai/parse-task
   */
  async parseTask(request: ParseTaskRequest): Promise<ParsedTaskInput> {
    const response = await this.axios.post<ParsedTaskInput>(
      "/ai/parse-task",
      request,
    );
    return response.data;
  }

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
   * POST /workspaces/:id/invitations
   */
  async inviteWorkspaceMember(
    workspaceId: string,
    data: InviteMemberDto,
  ): Promise<WorkspaceInvitation> {
    const response = await this.axios.post<WorkspaceInvitation>(
      `/workspaces/${workspaceId}/invitations`,
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
   * GET /timers/task/:taskId
   */
  async getTimerSessions(taskId: string): Promise<TimeSession[]> {
    const response = await this.axios.get<TimeSession[]>(
      `/timers/task/${taskId}`,
    );
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
  async getBurnoutAnalysis(): Promise<BurnoutAnalysis> {
    const response = await this.axios.get<BurnoutAnalysis>(
      "/ai/burnout/analysis",
    );
    return response.data;
  }

  /**
   * Get work patterns for current user
   * GET /ai/burnout/patterns
   */
  async getWorkPatterns(): Promise<WorkPatterns> {
    const response = await this.axios.get<WorkPatterns>("/ai/burnout/patterns");
    return response.data;
  }

  /**
   * Get rest recommendations
   * GET /ai/burnout/recommendations
   */
  async getRestRecommendations(): Promise<RestRecommendation[]> {
    const response = await this.axios.get<RestRecommendation[]>(
      "/ai/burnout/recommendations",
    );
    return response.data;
  }

  /**
   * Check for burnout intervention needs
   * GET /ai/burnout/intervention
   */
  async checkBurnoutIntervention(): Promise<BurnoutIntervention> {
    const response = await this.axios.get<BurnoutIntervention>(
      "/ai/burnout/intervention",
    );
    return response.data;
  }

  /**
   * Get weekly wellbeing summary
   * GET /ai/burnout/weekly-summary
   */
  async getWeeklyWellbeingSummary(): Promise<WeeklyWellbeingSummary> {
    const response = await this.axios.get<WeeklyWellbeingSummary>(
      "/ai/burnout/weekly-summary",
    );
    return response.data;
  }

  // ============ TEAM WORKLOAD ENDPOINTS ============

  /**
   * Get workspace workload summary
   * GET /workload/workspace/:workspaceId
   */
  async getWorkspaceWorkload(workspaceId: string): Promise<WorkspaceWorkload> {
    const response = await this.axios.get<WorkspaceWorkload>(
      `/workload/workspace/${workspaceId}`,
    );
    return response.data;
  }

  /**
   * Get member workload details
   * GET /workload/member/:userId
   */
  async getMemberWorkload(
    userId: string,
    workspaceId?: string,
  ): Promise<MemberWorkload> {
    const response = await this.axios.get<MemberWorkload>(
      `/workload/member/${userId}`,
      {
        params: { workspaceId },
      },
    );
    return response.data;
  }

  /**
   * Get current user's workload
   * GET /workload/me
   */
  async getMyWorkload(workspaceId?: string): Promise<MemberWorkload> {
    const response = await this.axios.get<MemberWorkload>("/workload/me", {
      params: { workspaceId },
    });
    return response.data;
  }

  /**
   * Get workload suggestions for redistribution
   * GET /workload/suggestions/:workspaceId
   */
  async getWorkloadSuggestions(
    workspaceId: string,
  ): Promise<WorkloadSuggestion[]> {
    const response = await this.axios.get<WorkloadSuggestion[]>(
      `/workload/suggestions/${workspaceId}`,
    );
    return response.data;
  }

  // ============ NOTES ENDPOINTS ============

  /**
   * Create a new note
   * POST /notes
   */
  async createNote(data: ClientCreateNoteDto): Promise<Note> {
    const response = await this.axios.post<Note>("/notes", data);
    return response.data;
  }

  /**
   * Get all notes for a workspace
   * GET /notes?workspaceId=...
   */
  async getNotes(workspaceId: string): Promise<Note[]> {
    const response = await this.axios.get<any>("/notes", {
      params: { workspaceId },
    });
    // Handle paginated response: { data: [...], meta: {...} }
    if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data)
    ) {
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
  async getNote(id: string): Promise<Note> {
    const response = await this.axios.get<Note>(`/notes/${id}`);
    return response.data;
  }

  /**
   * Update a note
   * PATCH /notes/:id
   */
  async updateNote(id: string, data: ClientUpdateNoteDto): Promise<Note> {
    const response = await this.axios.patch<Note>(`/notes/${id}`, data);
    return response.data;
  }

  /**
   * Delete a note
   * DELETE /notes/:id
   */
  async deleteNote(id: string): Promise<void> {
    await this.axios.delete(`/notes/${id}`);
  }

  // ============ RITUAL ENDPOINTS (ODD 006, T1-T4 backend) ============

  /**
   * Get the morning ritual (plan + overdue + suggested top-3)
   * GET /ritual/morning
   */
  async getMorningRitual(): Promise<RitualMorningView> {
    const response = await this.axios.get<RitualMorningView>("/ritual/morning");
    return response.data;
  }

  /**
   * Complete the morning ritual with a top-3
   * POST /ritual/morning/complete
   */
  async completeMorningRitual(top3: string[]): Promise<RitualDayState> {
    const response = await this.axios.post<RitualDayState>(
      "/ritual/morning/complete",
      { top3 },
    );
    return response.data;
  }

  /**
   * Skip the morning ritual (one touch)
   * POST /ritual/morning/skip
   */
  async skipMorningRitual(): Promise<RitualDayState> {
    const response = await this.axios.post<RitualDayState>(
      "/ritual/morning/skip",
    );
    return response.data;
  }

  /**
   * Get the evening ritual (summary + completed + pending)
   * GET /ritual/evening
   */
  async getEveningRitual(): Promise<RitualEveningView> {
    const response = await this.axios.get<RitualEveningView>("/ritual/evening");
    return response.data;
  }

  /**
   * Complete the evening ritual with moves for pending tasks
   * POST /ritual/evening/complete
   */
  async completeEveningRitual(
    moves: RitualEveningMove[],
  ): Promise<RitualEveningComplete> {
    const response = await this.axios.post<RitualEveningComplete>(
      "/ritual/evening/complete",
      { moves },
    );
    return response.data;
  }

  /**
   * Skip the evening ritual (one touch)
   * POST /ritual/evening/skip
   */
  async skipEveningRitual(): Promise<RitualDayState> {
    const response = await this.axios.post<RitualDayState>(
      "/ritual/evening/skip",
    );
    return response.data;
  }

  /**
   * Time-box morning top-3 tasks (manual blocks)
   * POST /ritual/morning/timebox
   */
  async saveTimebox(
    blocks: RitualTimeboxBlockInput[],
  ): Promise<RitualTimeboxBlock[]> {
    const response = await this.axios.post<RitualTimeboxBlock[]>(
      "/ritual/morning/timebox",
      { blocks },
    );
    return response.data;
  }

  /**
   * Accept the proposed time blocks for the top-3
   * POST /ritual/morning/timebox/accept
   */
  async acceptTimeboxProposal(): Promise<RitualTimeboxBlock[]> {
    const response = await this.axios.post<RitualTimeboxBlock[]>(
      "/ritual/morning/timebox/accept",
    );
    return response.data;
  }

  /**
   * Get the current ritual streak
   * GET /ritual/streak
   */
  async getRitualStreak(): Promise<RitualStreak> {
    const response = await this.axios.get<RitualStreak>("/ritual/streak");
    return response.data;
  }

  /**
   * Get the billing usage overview (plan, limits, usage, AI credits)
   * GET /billing/usage
   */
  async getBillingOverview(): Promise<BillingUsageOverview> {
    const response = await this.axios.get<BillingUsageOverview>("/billing/usage");
    return response.data;
  }

  /**
   * Create a Stripe checkout session for plan upgrade
   * POST /billing/checkout-session
   */
  async createCheckoutSession(
    planId: BillingPlanId,
    interval: BillingInterval,
    seats?: number,
  ): Promise<CheckoutSessionResult> {
    const response = await this.axios.post<CheckoutSessionResult>(
      "/billing/checkout-session",
      { planId, interval, seats },
    );
    return response.data;
  }

  /**
   * Create a Stripe customer portal session
   * POST /billing/portal-session
   */
  async createPortalSession(): Promise<PortalSessionResult> {
    const response = await this.axios.post<PortalSessionResult>(
      "/billing/portal-session",
    );
    return response.data;
  }

  /**
   * Analyze a meeting transcript with AI
   * POST /meetings/analyze
   */
  async analyzeMeetingTranscript(
    transcript: string,
    options?: MeetingAnalysisOptions,
  ): Promise<MeetingAnalysis> {
    const response = await this.axios.post<MeetingAnalysis>("/meetings/analyze", {
      transcript,
      ...options,
    });
    return response.data;
  }

  /**
   * Extract action items from a transcript
   * POST /meetings/extract-actions
   */
  async extractMeetingActions(
    transcript: string,
    projectContext?: string,
  ): Promise<MeetingAnalysis> {
    const response = await this.axios.post<MeetingAnalysis>(
      "/meetings/extract-actions",
      { transcript, projectContext },
    );
    return response.data;
  }

  /**
   * Generate a meeting summary in a given style
   * POST /meetings/summary
   */
  async generateMeetingSummary(
    transcript: string,
    style?: MeetingSummaryStyle,
  ): Promise<MeetingAnalysis> {
    const response = await this.axios.post<MeetingAnalysis>("/meetings/summary", {
      transcript,
      style,
    });
    return response.data;
  }

  /**
   * Convert extracted action items into tasks
   * POST /meetings/convert-to-tasks
   */
  async convertActionsToTasks(
    actionItems: MeetingActionItem[],
    options?: ConvertActionsOptions,
  ): Promise<ConvertTasksResult> {
    const response = await this.axios.post<ConvertTasksResult>(
      "/meetings/convert-to-tasks",
      { actionItems, ...options },
    );
    return response.data;
  }

  /**
   * Quick AI analysis of a transcript, optionally scoped to a project
   * POST /meetings/quick-analyze
   */
  async quickAnalyzeMeeting(
    transcript: string,
    projectId?: string,
  ): Promise<MeetingAnalysis> {
    const response = await this.axios.post<MeetingAnalysis>(
      "/meetings/quick-analyze",
      { transcript, projectId },
    );
    return response.data;
  }

  /**
   * Save a meeting note with its analysis
   * POST /meetings/save
   */
  async saveMeeting(data: SaveMeetingDto): Promise<Meeting> {
    const response = await this.axios.post<Meeting>("/meetings/save", data);
    return response.data;
  }

  /**
   * List saved meeting notes
   * GET /meetings
   */
  async getMeetings(params?: GetMeetingsParams): Promise<Meeting[]> {
    const response = await this.axios.get<Meeting[]>("/meetings", { params });
    return response.data;
  }

  /**
   * Get a saved meeting note by id
   * GET /meetings/:id
   */
  async getMeetingById(id: string): Promise<Meeting> {
    const response = await this.axios.get<Meeting>(`/meetings/${id}`);
    return response.data;
  }

  /**
   * Delete a saved meeting note
   * DELETE /meetings/:id
   */
  async deleteMeeting(id: string): Promise<void> {
    await this.axios.delete(`/meetings/${id}`);
  }

  /**
   * Get aggregated platform overview for the admin panel
   * GET /admin/overview
   */
  async getAdminOverview(): Promise<AdminOverview> {
    const response = await this.axios.get<AdminOverview>("/admin/overview");
    return response.data;
  }

  /**
   * List users for the admin panel, optionally searched/paginated
   * GET /admin/users
   */
  async getAdminUsers(params?: GetAdminUsersParams): Promise<AdminUsersPage> {
    const response = await this.axios.get<AdminUsersPage>("/admin/users", {
      params,
    });
    return response.data;
  }

  /**
   * Get one user's admin detail
   * GET /admin/users/:id
   */
  async getAdminUser(userId: string): Promise<AdminUserDetail> {
    const response = await this.axios.get<AdminUserDetail>(
      `/admin/users/${userId}`,
    );
    return response.data;
  }

  /**
   * Block a user
   * POST /admin/users/:id/block
   */
  async blockAdminUser(userId: string): Promise<AdminUserStatusResult> {
    const response = await this.axios.post<AdminUserStatusResult>(
      `/admin/users/${userId}/block`,
    );
    return response.data;
  }

  /**
   * Unblock a user
   * POST /admin/users/:id/unblock
   */
  async unblockAdminUser(userId: string): Promise<AdminUserStatusResult> {
    const response = await this.axios.post<AdminUserStatusResult>(
      `/admin/users/${userId}/unblock`,
    );
    return response.data;
  }

  /**
   * Grant a pro plan to a user
   * POST /admin/users/:id/grant-pro
   */
  async grantAdminPro(
    userId: string,
    data?: GrantProDto,
  ): Promise<AdminProResult> {
    const response = await this.axios.post<AdminProResult>(
      `/admin/users/${userId}/grant-pro`,
      data,
    );
    return response.data;
  }

  /**
   * Revoke a pro plan from a user
   * POST /admin/users/:id/revoke-pro
   */
  async revokeAdminPro(userId: string): Promise<AdminProResult> {
    const response = await this.axios.post<AdminProResult>(
      `/admin/users/${userId}/revoke-pro`,
    );
    return response.data;
  }

  /**
   * List invite codes
   * GET /admin/invite-codes
   */
  async getAdminInviteCodes(): Promise<AdminInviteCode[]> {
    const response = await this.axios.get<AdminInviteCode[]>("/admin/invite-codes");
    return response.data;
  }

  /**
   * Create an invite code
   * POST /admin/invite-codes
   */
  async createAdminInviteCode(
    data?: CreateAdminInviteCodeDto,
  ): Promise<AdminInviteCode> {
    const response = await this.axios.post<AdminInviteCode>(
      "/admin/invite-codes",
      data,
    );
    return response.data;
  }

  /**
   * Deactivate an invite code
   * PATCH /admin/invite-codes/:id
   */
  async deactivateAdminInviteCode(codeId: string): Promise<AdminInviteCode> {
    const response = await this.axios.patch<AdminInviteCode>(
      `/admin/invite-codes/${codeId}`,
      { isActive: false },
    );
    return response.data;
  }

  /**
   * Connect a third-party integration for the current user
   * POST /users/me/integrations/:provider/connect
   */
  async connectIntegration(
    provider: string,
    data?: Record<string, unknown>,
  ): Promise<IntegrationActionResult> {
    const response = await this.axios.post<IntegrationActionResult>(
      `/users/me/integrations/${provider}/connect`,
      data || {},
    );
    return response.data;
  }

  /**
   * Disconnect a third-party integration
   * DELETE /users/me/integrations/:provider
   */
  async disconnectIntegration(provider: string): Promise<IntegrationDisconnectResult> {
    const response = await this.axios.delete<IntegrationDisconnectResult>(
      `/users/me/integrations/${provider}`,
    );
    return response.data;
  }

  /**
   * Public facts the OAuth consent screen shows about the requesting app
   * GET /oauth/authorize/client
   */
  async getOAuthClientInfo(
    clientId: string,
    scope?: string,
  ): Promise<OAuthClientInfo> {
    const response = await this.axios.get<OAuthClientInfo>("/oauth/authorize/client", {
      params: { client_id: clientId, scope },
    });
    return response.data;
  }

  /**
   * List apps/agents holding a live OAuth grant
   * GET /oauth/connections
   */
  async getOAuthConnections(): Promise<OAuthConnection[]> {
    const response = await this.axios.get<OAuthConnection[]>("/oauth/connections");
    return response.data;
  }

  /**
   * Revoke an OAuth client's grants
   * DELETE /oauth/connections
   */
  async disconnectOAuthClient(clientId: string): Promise<OAuthDisconnectResult> {
    const response = await this.axios.delete<OAuthDisconnectResult>(
      "/oauth/connections",
      { params: { client_id: clientId } },
    );
    return response.data;
  }

  /**
   * Get the current user's gamification profile (XP, level, achievements)
   * GET /gamification/me
   */
  async getGamificationProfile(): Promise<GamificationProfile> {
    const response = await this.axios.get<GamificationProfile>("/gamification/me");
    return response.data;
  }

  /**
   * List available ambient tracks
   * GET /focus/tracks
   */
  async getFocusTracks(): Promise<FocusTrack[]> {
    const response = await this.axios.get<FocusTrack[]>("/focus/tracks");
    return response.data;
  }

  /**
   * List recommended tracks based on time of day
   * GET /focus/tracks/recommended
   */
  async getRecommendedTracks(): Promise<FocusTrack[]> {
    const response = await this.axios.get<FocusTrack[]>("/focus/tracks/recommended");
    return response.data;
  }

  /**
   * List available focus modes
   * GET /focus/modes
   */
  async getFocusModes(): Promise<FocusMode[]> {
    const response = await this.axios.get<FocusMode[]>("/focus/modes");
    return response.data;
  }

  /**
   * List the user's favorite tracks
   * GET /focus/favorites
   */
  async getFocusFavorites(): Promise<FocusTrack[]> {
    const response = await this.axios.get<FocusTrack[]>("/focus/favorites");
    return response.data;
  }

  /**
   * Toggle a track favorite, reporting the new state
   * POST /focus/favorites/:trackId
   */
  async toggleFocusFavorite(trackId: string): Promise<FocusFavoriteResult> {
    const response = await this.axios.post<FocusFavoriteResult>(
      `/focus/favorites/${trackId}`,
    );
    return response.data;
  }

  /**
   * Get the user's audio preferences
   * GET /focus/preferences
   */
  async getFocusPreferences(): Promise<FocusPreferences> {
    const response = await this.axios.get<FocusPreferences>("/focus/preferences");
    return response.data;
  }

  /**
   * Update the user's audio preferences (all fields optional)
   * PATCH /focus/preferences
   */
  async updateFocusPreferences(
    data: UpdateFocusPreferencesDto,
  ): Promise<FocusPreferences> {
    const response = await this.axios.patch<FocusPreferences>(
      "/focus/preferences",
      data,
    );
    return response.data;
  }

  /**
   * Get focus session statistics
   * GET /focus/stats
   */
  async getFocusStats(): Promise<FocusStats> {
    const response = await this.axios.get<FocusStats>("/focus/stats");
    return response.data;
  }
}
