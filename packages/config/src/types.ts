/**
 * Configuration types for Ordo-Todo applications
 */

/**
 * API configuration
 */
export interface ApiConfig {
  baseURL: string;
  timeout?: number;
}

/**
 * Auth configuration
 */
export interface AuthConfig {
  tokenKey?: string;
  refreshTokenKey?: string;
}

/**
 * Timer defaults
 */
export interface TimerConfig {
  pomodoroDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  pomodorosUntilLongBreak: number;
}

/**
 * App limits
 */
export interface LimitsConfig {
  maxProjectsPerWorkspace: number;
  maxTasksPerProject: number;
  maxSubtasksPerTask: number;
  maxTagsPerWorkspace: number;
  maxAttachmentsPerTask: number;
  maxFileSizeMB: number;
}

/**
 * UI defaults
 */
export interface UIConfig {
  defaultTheme: 'light' | 'dark' | 'system';
  defaultView: 'LIST' | 'KANBAN' | 'CALENDAR' | 'TIMELINE' | 'FOCUS';
  sidebarCollapsedByDefault: boolean;
}

/**
 * Complete application configuration
 */
export interface AppConfig {
  api: ApiConfig;
  auth: AuthConfig;
  timer: TimerConfig;
  limits: LimitsConfig;
  ui: UIConfig;
}
