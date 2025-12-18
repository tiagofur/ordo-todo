"use strict";
/**
 * Default configuration values for Ordo-Todo applications
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIMER_TYPE = exports.PROJECT_COLORS = exports.MEMBER_ROLE = exports.WORKSPACE_TYPE = exports.PRIORITY_VALUES = exports.TASK_PRIORITY = exports.TASK_STATUS = exports.DEFAULT_AUTH_CONFIG = exports.DEFAULT_UI_CONFIG = exports.DEFAULT_LIMITS_CONFIG = exports.DEFAULT_TIMER_CONFIG = void 0;
exports.createConfig = createConfig;
/**
 * Default timer configuration (Pomodoro technique)
 */
exports.DEFAULT_TIMER_CONFIG = {
    pomodoroDuration: 25 * 60, // 25 minutes in seconds
    shortBreakDuration: 5 * 60, // 5 minutes in seconds
    longBreakDuration: 15 * 60, // 15 minutes in seconds
    pomodorosUntilLongBreak: 4,
};
/**
 * Default application limits
 */
exports.DEFAULT_LIMITS_CONFIG = {
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
exports.DEFAULT_UI_CONFIG = {
    defaultTheme: 'system',
    defaultView: 'LIST',
    sidebarCollapsedByDefault: false,
};
/**
 * Default auth configuration
 */
exports.DEFAULT_AUTH_CONFIG = {
    tokenKey: 'ordo_auth_token',
    refreshTokenKey: 'ordo_refresh_token',
};
/**
 * Task status options
 */
exports.TASK_STATUS = {
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
};
/**
 * Task priority levels
 */
exports.TASK_PRIORITY = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
};
/**
 * Priority values for sorting
 */
exports.PRIORITY_VALUES = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    URGENT: 4,
};
/**
 * Workspace types
 */
exports.WORKSPACE_TYPE = {
    PERSONAL: 'PERSONAL',
    WORK: 'WORK',
    TEAM: 'TEAM',
};
/**
 * Member roles
 */
exports.MEMBER_ROLE = {
    OWNER: 'OWNER',
    ADMIN: 'ADMIN',
    MEMBER: 'MEMBER',
    VIEWER: 'VIEWER',
};
/**
 * Available project colors
 */
exports.PROJECT_COLORS = [
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
];
/**
 * Timer session types
 */
exports.TIMER_TYPE = {
    POMODORO: 'POMODORO',
    SHORT_BREAK: 'SHORT_BREAK',
    LONG_BREAK: 'LONG_BREAK',
    CONTINUOUS: 'CONTINUOUS',
};
/**
 * Create a full configuration with defaults
 */
function createConfig(overrides) {
    return {
        api: {
            timeout: 30000,
            ...overrides.api,
        },
        auth: {
            ...exports.DEFAULT_AUTH_CONFIG,
            ...overrides.auth,
        },
        timer: {
            ...exports.DEFAULT_TIMER_CONFIG,
            ...overrides.timer,
        },
        limits: {
            ...exports.DEFAULT_LIMITS_CONFIG,
            ...overrides.limits,
        },
        ui: {
            ...exports.DEFAULT_UI_CONFIG,
            ...overrides.ui,
        },
    };
}
