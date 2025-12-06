/**
 * Default configuration values for Ordo-Todo applications
 */

import type { TimerConfig, LimitsConfig, UIConfig, AuthConfig } from './types';

/**
 * Default timer configuration (Pomodoro technique)
 */
export const DEFAULT_TIMER_CONFIG: TimerConfig = {
  pomodoroDuration: 25 * 60, // 25 minutes in seconds
  shortBreakDuration: 5 * 60, // 5 minutes in seconds
  longBreakDuration: 15 * 60, // 15 minutes in seconds
  pomodorosUntilLongBreak: 4,
};

/**
 * Default application limits
 */
export const DEFAULT_LIMITS_CONFIG: LimitsConfig = {
  maxProjectsPerWorkspace: 50,
  maxTasksPerProject: 500,
  maxSubtasksPerTask: 20,
  maxTagsPerWorkspace: 100,
  maxAttachmentsPerTask: 10,
  maxFileSizeMB: 25,
};

/**
 * Default UI configuration
 */
export const DEFAULT_UI_CONFIG: UIConfig = {
  defaultTheme: 'system',
  defaultView: 'LIST',
  sidebarCollapsedByDefault: false,
};

/**
 * Default auth configuration
 */
export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  tokenKey: 'ordo_auth_token',
  refreshTokenKey: 'ordo_refresh_token',
};

/**
 * Task status options
 */
export const TASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

/**
 * Task priority levels
 */
export const TASK_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

/**
 * Priority values for sorting
 */
export const PRIORITY_VALUES = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4,
} as const;

/**
 * Workspace types
 */
export const WORKSPACE_TYPE = {
  PERSONAL: 'PERSONAL',
  WORK: 'WORK',
  TEAM: 'TEAM',
} as const;

/**
 * Member roles
 */
export const MEMBER_ROLE = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
} as const;

/**
 * Available project colors
 */
export const PROJECT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#84CC16', // lime
  '#6366F1', // indigo
] as const;

/**
 * Timer session types
 */
export const TIMER_TYPE = {
  POMODORO: 'POMODORO',
  SHORT_BREAK: 'SHORT_BREAK',
  LONG_BREAK: 'LONG_BREAK',
  CONTINUOUS: 'CONTINUOUS',
} as const;

/**
 * Create a full configuration with defaults
 */
export function createConfig(overrides: {
  api: { baseURL: string; timeout?: number };
  auth?: Partial<AuthConfig>;
  timer?: Partial<TimerConfig>;
  limits?: Partial<LimitsConfig>;
  ui?: Partial<UIConfig>;
}) {
  return {
    api: {
      timeout: 30000,
      ...overrides.api,
    },
    auth: {
      ...DEFAULT_AUTH_CONFIG,
      ...overrides.auth,
    },
    timer: {
      ...DEFAULT_TIMER_CONFIG,
      ...overrides.timer,
    },
    limits: {
      ...DEFAULT_LIMITS_CONFIG,
      ...overrides.limits,
    },
    ui: {
      ...DEFAULT_UI_CONFIG,
      ...overrides.ui,
    },
  };
}
