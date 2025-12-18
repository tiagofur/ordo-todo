/**
 * Default configuration values for Ordo-Todo applications
 */
import type { TimerConfig, LimitsConfig, UIConfig, AuthConfig } from './types';
/**
 * Default timer configuration (Pomodoro technique)
 */
export declare const DEFAULT_TIMER_CONFIG: TimerConfig;
/**
 * Default application limits
 */
export declare const DEFAULT_LIMITS_CONFIG: LimitsConfig;
/**
 * Default UI configuration
 */
export declare const DEFAULT_UI_CONFIG: UIConfig;
/**
 * Default auth configuration
 */
export declare const DEFAULT_AUTH_CONFIG: AuthConfig;
/**
 * Task status options
 */
export declare const TASK_STATUS: {
    readonly TODO: "TODO";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly COMPLETED: "COMPLETED";
    readonly CANCELLED: "CANCELLED";
};
/**
 * Task priority levels
 */
export declare const TASK_PRIORITY: {
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly HIGH: "HIGH";
    readonly URGENT: "URGENT";
};
/**
 * Priority values for sorting
 */
export declare const PRIORITY_VALUES: {
    readonly LOW: 1;
    readonly MEDIUM: 2;
    readonly HIGH: 3;
    readonly URGENT: 4;
};
/**
 * Workspace types
 */
export declare const WORKSPACE_TYPE: {
    readonly PERSONAL: "PERSONAL";
    readonly WORK: "WORK";
    readonly TEAM: "TEAM";
};
/**
 * Member roles
 */
export declare const MEMBER_ROLE: {
    readonly OWNER: "OWNER";
    readonly ADMIN: "ADMIN";
    readonly MEMBER: "MEMBER";
    readonly VIEWER: "VIEWER";
};
/**
 * Available project colors
 */
export declare const PROJECT_COLORS: readonly ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#F97316", "#84CC16", "#6366F1"];
/**
 * Timer session types
 */
export declare const TIMER_TYPE: {
    readonly POMODORO: "POMODORO";
    readonly SHORT_BREAK: "SHORT_BREAK";
    readonly LONG_BREAK: "LONG_BREAK";
    readonly CONTINUOUS: "CONTINUOUS";
};
/**
 * Create a full configuration with defaults
 */
export declare function createConfig(overrides: {
    api: {
        baseURL: string;
        timeout?: number;
    };
    auth?: Partial<AuthConfig>;
    timer?: Partial<TimerConfig>;
    limits?: Partial<LimitsConfig>;
    ui?: Partial<UIConfig>;
}): {
    api: {
        baseURL: string;
        timeout: number;
    };
    auth: {
        tokenKey?: string;
        refreshTokenKey?: string;
    };
    timer: {
        pomodoroDuration: number;
        shortBreakDuration: number;
        longBreakDuration: number;
        pomodorosUntilLongBreak: number;
    };
    limits: {
        maxProjectsPerWorkspace: number;
        maxTasksPerProject: number;
        maxSubtasksPerTask: number;
        maxTagsPerWorkspace: number;
        maxAttachmentsPerTask: number;
        maxFileSizeMB: number;
    };
    ui: {
        defaultTheme: "light" | "dark" | "system";
        defaultView: "LIST" | "KANBAN" | "CALENDAR" | "TIMELINE" | "FOCUS";
        sidebarCollapsedByDefault: boolean;
    };
};
//# sourceMappingURL=defaults.d.ts.map