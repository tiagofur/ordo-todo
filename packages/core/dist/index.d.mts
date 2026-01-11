import { z } from 'zod';

interface ValueObject<T, V = unknown> {
    value: V;
    equals(other: T): boolean;
    toString(): string;
    toJSON(): string;
}

declare class Email implements ValueObject<Email, string> {
    private readonly _value;
    private constructor();
    static create(email: string): Email;
    private static validate;
    get value(): string;
    get localPart(): string;
    get domain(): string;
    equals(other: Email): boolean;
    toString(): string;
    toJSON(): string;
}

declare class HashPassword implements ValueObject<HashPassword, string> {
    private readonly _value;
    private constructor();
    static create(hashPassword: string): HashPassword;
    private static validate;
    get value(): string;
    get algorithm(): string;
    get cost(): number;
    equals(other: HashPassword): boolean;
    toString(): string;
    toJSON(): string;
}

declare class PersonName implements ValueObject<PersonName, string> {
    private readonly _value;
    private constructor();
    static create(name: string): PersonName;
    private static validate;
    get value(): string;
    get firstName(): string;
    get lastName(): string;
    get fullName(): string;
    get initials(): string;
    equals(other: PersonName): boolean;
    toString(): string;
    toJSON(): string;
    toFormattedString(): string;
}

interface LoggedUser {
    id: string;
    email: string;
    role: string;
}
interface UseCase<IN, OUT> {
    execute(data: IN, loggedUser?: LoggedUser): Promise<OUT>;
}

declare class Id implements ValueObject<Id, string> {
    private readonly _value;
    private constructor();
    static create(id?: string): Id;
    private static validate;
    get value(): string;
    equals(other: Id): boolean;
    toString(): string;
    toJSON(): string;
}

type EntityMode = "draft" | "valid";
interface EntityProps<ID = string | number> {
    id?: ID;
}
declare abstract class Entity<PROPS extends EntityProps> {
    readonly props: Readonly<PROPS>;
    readonly mode: EntityMode;
    readonly id: NonNullable<PROPS["id"]>;
    constructor(props: Readonly<PROPS>, mode?: EntityMode);
    get data(): Readonly<PROPS>;
    isDraft(): boolean;
    isValid(): boolean;
    equals(entity?: unknown): boolean;
    notEquals(entity?: unknown): boolean;
    protected sameId(other: Entity<PROPS>): boolean;
    asDraft(): this;
    asValid(): this;
    clone(newProps: Partial<PROPS>, newMode?: EntityMode): this;
}

interface RequiredStringOptions {
    attributeName?: string;
    errorMessage?: string;
    minLength?: number;
    maxLength?: number;
}
declare class RequiredString implements ValueObject<RequiredString, string> {
    private readonly _value;
    private constructor();
    static create(value: string, options?: RequiredStringOptions): RequiredString;
    private static validate;
    get value(): string;
    equals(other: RequiredString): boolean;
    toString(): string;
    toJSON(): string;
}

/**
 * UUID v4 Generator Utility
 *
 * This module provides a UUID v4 generator that works with Next.js Turbopack.
 * It avoids the "dynamic usage of require is not supported" error that occurs
 * when using the uuid package with Turbopack bundler.
 *
 * Uses crypto.randomUUID() when available (modern browsers, Node.js 16+),
 * with a fallback to Math.random()-based implementation for older environments.
 */
/**
 * Generates a UUID v4 string
 * @returns A valid UUID v4 string (e.g., "550e8400-e29b-41d4-a716-446655440000")
 */
declare function generateUuid(): string;
/**
 * Validates if a string is a valid UUID v4
 * @param uuid - The string to validate
 * @returns true if the string is a valid UUID v4, false otherwise
 */
declare function isValidUuid(uuid: string): boolean;

/**
 * HashService interface for password hashing and comparison.
 * This is a port (interface) that should be implemented by infrastructure layer.
 */
interface HashService {
    /**
     * Hash a plain text value (e.g., password or token)
     */
    hash(value: string): Promise<string>;
    /**
     * Compare a plain text value against a hash
     */
    compare(value: string, hash: string): Promise<boolean>;
}

/**
 * Shared color constants for Projects, Tags, and Workspaces
 * These colors are used across all applications (Web, Mobile, Desktop)
 */
declare const PROJECT_COLORS: readonly ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#6B7280"];
declare const TAG_COLORS: readonly ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#06B6D4", "#F43F5E", "#84CC16", "#6366F1"];
declare const WORKSPACE_COLORS: {
    readonly PERSONAL: "#06B6D4";
    readonly WORK: "#8B5CF6";
    readonly TEAM: "#EC4899";
};
type ProjectColor = typeof PROJECT_COLORS[number];
type TagColor = typeof TAG_COLORS[number];
type WorkspaceColor = typeof WORKSPACE_COLORS[keyof typeof WORKSPACE_COLORS];

/**
 * Task priority constants with labels and colors
 * Used across all applications for consistent priority handling
 */
declare const TASK_PRIORITIES: {
    readonly LOW: {
        readonly value: "LOW";
        readonly label: "Low";
        readonly color: "#10B981";
        readonly order: 1;
    };
    readonly MEDIUM: {
        readonly value: "MEDIUM";
        readonly label: "Medium";
        readonly color: "#F59E0B";
        readonly order: 2;
    };
    readonly HIGH: {
        readonly value: "HIGH";
        readonly label: "High";
        readonly color: "#EF4444";
        readonly order: 3;
    };
};
declare const PRIORITY_VALUES: readonly ["LOW", "MEDIUM", "HIGH"];
/**
 * Task priority type
 * Note: TaskPriority is defined in tasks domain, so we use TaskPriorityValue here
 */
type TaskPriorityValue = typeof PRIORITY_VALUES[number];
/**
 * Get priority configuration by value
 */
declare function getPriorityConfig(priority: TaskPriorityValue): {
    readonly value: "LOW";
    readonly label: "Low";
    readonly color: "#10B981";
    readonly order: 1;
} | {
    readonly value: "MEDIUM";
    readonly label: "Medium";
    readonly color: "#F59E0B";
    readonly order: 2;
} | {
    readonly value: "HIGH";
    readonly label: "High";
    readonly color: "#EF4444";
    readonly order: 3;
};
/**
 * Get priority color
 */
declare function getPriorityColor(priority: TaskPriorityValue): string;
/**
 * Get priority label
 */
declare function getPriorityLabel(priority: TaskPriorityValue): string;

/**
 * Task and Project status constants
 * Used across all applications for consistent status handling
 */
declare const TASK_STATUS: {
    readonly TODO: {
        readonly value: "TODO";
        readonly label: "To Do";
        readonly color: "#6B7280";
        readonly order: 1;
    };
    readonly IN_PROGRESS: {
        readonly value: "IN_PROGRESS";
        readonly label: "In Progress";
        readonly color: "#3B82F6";
        readonly order: 2;
    };
    readonly IN_REVIEW: {
        readonly value: "IN_REVIEW";
        readonly label: "In Review";
        readonly color: "#F59E0B";
        readonly order: 3;
    };
    readonly DONE: {
        readonly value: "DONE";
        readonly label: "Done";
        readonly color: "#10B981";
        readonly order: 4;
    };
    readonly CANCELLED: {
        readonly value: "CANCELLED";
        readonly label: "Cancelled";
        readonly color: "#EF4444";
        readonly order: 5;
    };
};
declare const TASK_STATUS_VALUES: readonly ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"];
/**
 * Task status type
 * Note: TaskStatus is defined in tasks domain, so we use TaskStatusValue here
 */
type TaskStatusValue = typeof TASK_STATUS_VALUES[number];
/**
 * Project status constants
 */
declare const PROJECT_STATUS: {
    readonly ACTIVE: {
        readonly value: "ACTIVE";
        readonly label: "Active";
        readonly color: "#10B981";
    };
    readonly ARCHIVED: {
        readonly value: "ARCHIVED";
        readonly label: "Archived";
        readonly color: "#6B7280";
    };
    readonly ON_HOLD: {
        readonly value: "ON_HOLD";
        readonly label: "On Hold";
        readonly color: "#F59E0B";
    };
};
declare const PROJECT_STATUS_VALUES: readonly ["ACTIVE", "ARCHIVED", "ON_HOLD"];
/**
 * Project status type
 * Note: ProjectStatus might be defined elsewhere, so we use ProjectStatusValue here
 */
type ProjectStatusValue = typeof PROJECT_STATUS_VALUES[number];
/**
 * Get task status configuration by value
 */
declare function getTaskStatusConfig(status: TaskStatusValue): {
    readonly value: "TODO";
    readonly label: "To Do";
    readonly color: "#6B7280";
    readonly order: 1;
} | {
    readonly value: "IN_PROGRESS";
    readonly label: "In Progress";
    readonly color: "#3B82F6";
    readonly order: 2;
} | {
    readonly value: "IN_REVIEW";
    readonly label: "In Review";
    readonly color: "#F59E0B";
    readonly order: 3;
} | {
    readonly value: "DONE";
    readonly label: "Done";
    readonly color: "#10B981";
    readonly order: 4;
} | {
    readonly value: "CANCELLED";
    readonly label: "Cancelled";
    readonly color: "#EF4444";
    readonly order: 5;
};
/**
 * Get task status color
 */
declare function getTaskStatusColor(status: TaskStatusValue): string;
/**
 * Get task status label
 */
declare function getTaskStatusLabel(status: TaskStatusValue): string;
/**
 * Check if task is completed
 */
declare function isTaskCompleted(status: TaskStatusValue): boolean;
/**
 * Check if task is in progress
 */
declare function isTaskInProgress(status: TaskStatusValue): boolean;

/**
 * Pomodoro Timer constants
 * Used across all applications for consistent timer behavior
 */
declare const TIMER_MODES: {
    readonly WORK: {
        readonly value: "WORK";
        readonly label: "Work";
        readonly color: "#EF4444";
        readonly defaultDuration: 25;
    };
    readonly SHORT_BREAK: {
        readonly value: "SHORT_BREAK";
        readonly label: "Short Break";
        readonly color: "#10B981";
        readonly defaultDuration: 5;
    };
    readonly LONG_BREAK: {
        readonly value: "LONG_BREAK";
        readonly label: "Long Break";
        readonly color: "#059669";
        readonly defaultDuration: 15;
    };
    readonly CONTINUOUS: {
        readonly value: "CONTINUOUS";
        readonly label: "Continuous";
        readonly color: "#3B82F6";
        readonly defaultDuration: 0;
    };
};
declare const TIMER_MODE_VALUES: readonly ["WORK", "SHORT_BREAK", "LONG_BREAK", "CONTINUOUS"];
type TimerMode = typeof TIMER_MODE_VALUES[number];
/**
 * Default Pomodoro settings
 */
declare const DEFAULT_POMODORO_SETTINGS: {
    readonly workDuration: 25;
    readonly shortBreakDuration: 5;
    readonly longBreakDuration: 15;
    readonly pomodorosUntilLongBreak: 4;
    readonly autoStartBreaks: false;
    readonly autoStartPomodoros: false;
    readonly soundEnabled: true;
    readonly notificationsEnabled: true;
};
/**
 * Timer limits and constraints
 */
declare const TIMER_LIMITS: {
    readonly MIN_DURATION: 1;
    readonly MAX_DURATION: 120;
    readonly MIN_POMODOROS_UNTIL_LONG_BREAK: 2;
    readonly MAX_POMODOROS_UNTIL_LONG_BREAK: 10;
};
/**
 * Get timer mode configuration
 */
declare function getTimerModeConfig(mode: TimerMode): {
    readonly value: "WORK";
    readonly label: "Work";
    readonly color: "#EF4444";
    readonly defaultDuration: 25;
} | {
    readonly value: "SHORT_BREAK";
    readonly label: "Short Break";
    readonly color: "#10B981";
    readonly defaultDuration: 5;
} | {
    readonly value: "LONG_BREAK";
    readonly label: "Long Break";
    readonly color: "#059669";
    readonly defaultDuration: 15;
} | {
    readonly value: "CONTINUOUS";
    readonly label: "Continuous";
    readonly color: "#3B82F6";
    readonly defaultDuration: 0;
};
/**
 * Get timer mode color
 */
declare function getTimerModeColor(mode: TimerMode): string;
/**
 * Get timer mode label
 */
declare function getTimerModeLabel(mode: TimerMode): string;
/**
 * Get timer mode default duration
 */
declare function getTimerModeDefaultDuration(mode: TimerMode): number;
/**
 * Check if it's time for a long break
 */
declare function shouldTakeLongBreak(completedPomodoros: number, pomodorosUntilLongBreak?: number): boolean;

/**
 * Application limits and constraints
 * Used across all applications for validation and UI constraints
 */
/**
 * Task limits
 */
declare const TASK_LIMITS: {
    readonly TITLE_MIN_LENGTH: 1;
    readonly TITLE_MAX_LENGTH: 200;
    readonly DESCRIPTION_MAX_LENGTH: 5000;
    readonly MIN_ESTIMATED_MINUTES: 1;
    readonly MAX_ESTIMATED_MINUTES: 480;
    readonly MAX_SUBTASKS: 50;
    readonly MAX_TAGS_PER_TASK: 10;
    readonly MAX_ATTACHMENTS_PER_TASK: 20;
};
/**
 * Project limits
 */
declare const PROJECT_LIMITS: {
    readonly NAME_MIN_LENGTH: 1;
    readonly NAME_MAX_LENGTH: 100;
    readonly DESCRIPTION_MAX_LENGTH: 2000;
    readonly MAX_PROJECTS_PER_WORKSPACE: 100;
    readonly MAX_TASKS_PER_PROJECT: 1000;
};
/**
 * Workspace limits
 */
declare const WORKSPACE_LIMITS: {
    readonly NAME_MIN_LENGTH: 1;
    readonly NAME_MAX_LENGTH: 100;
    readonly DESCRIPTION_MAX_LENGTH: 500;
    readonly MAX_MEMBERS: 50;
    readonly MAX_WORKSPACES_PER_USER: 20;
    readonly SLUG_MIN_LENGTH: 3;
    readonly SLUG_MAX_LENGTH: 50;
};
/**
 * Tag limits
 */
declare const TAG_LIMITS: {
    readonly NAME_MIN_LENGTH: 1;
    readonly NAME_MAX_LENGTH: 30;
    readonly MAX_TAGS_PER_WORKSPACE: 100;
};
/**
 * Comment limits
 */
declare const COMMENT_LIMITS: {
    readonly CONTENT_MIN_LENGTH: 1;
    readonly CONTENT_MAX_LENGTH: 2000;
    readonly MAX_COMMENTS_PER_TASK: 500;
};
/**
 * File upload limits
 */
declare const FILE_LIMITS: {
    readonly MAX_FILE_SIZE: number;
    readonly MAX_IMAGE_SIZE: number;
    readonly MAX_TOTAL_STORAGE_PER_WORKSPACE: number;
    readonly ALLOWED_IMAGE_TYPES: readonly ["image/jpeg", "image/png", "image/gif", "image/webp"];
    readonly ALLOWED_DOCUMENT_TYPES: readonly ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
};
/**
 * User limits
 */
declare const USER_LIMITS: {
    readonly NAME_MIN_LENGTH: 2;
    readonly NAME_MAX_LENGTH: 100;
    readonly PASSWORD_MIN_LENGTH: 8;
    readonly PASSWORD_MAX_LENGTH: 128;
    readonly BIO_MAX_LENGTH: 500;
};
/**
 * Pagination limits
 */
declare const PAGINATION_LIMITS: {
    readonly DEFAULT_PAGE_SIZE: 20;
    readonly MAX_PAGE_SIZE: 100;
    readonly MIN_PAGE_SIZE: 5;
};
/**
 * Helper function to format file size
 */
declare function formatFileSize(bytes: number): string;
/**
 * Check if file type is allowed
 */
declare function isAllowedFileType(mimeType: string): boolean;
/**
 * Check if file is an image
 */
declare function isImageFile(mimeType: string): boolean;
/**
 * Notification limits
 */
declare const NOTIFICATION_LIMITS: {
    readonly TITLE_MIN_LENGTH: 1;
    readonly TITLE_MAX_LENGTH: 200;
    readonly MESSAGE_MAX_LENGTH: 1000;
    readonly ACTION_LABEL_MAX_LENGTH: 50;
    readonly ACTION_URL_MAX_LENGTH: 2048;
    readonly MAX_NOTIFICATIONS_PER_USER: 500;
};

/**
 * Date utility functions
 * Used across all applications for consistent date handling
 */
/**
 * Format a date to a readable string
 */
declare function formatDate(date: Date | string, locale?: string): string;
/**
 * Format a date to a short string (e.g., "Dec 4, 2025")
 */
declare function formatDateShort(date: Date | string, locale?: string): string;
/**
 * Format a date to relative time (e.g., "2 days ago", "in 3 hours")
 */
declare function formatRelativeTime(date: Date | string, locale?: string): string;
/**
 * Check if a date is today
 */
declare function isToday(date: Date | string): boolean;
/**
 * Check if a date is in the past
 */
declare function isPast(date: Date | string): boolean;
/**
 * Check if a date is in the future
 */
declare function isFuture(date: Date | string): boolean;
/**
 * Check if a task is overdue
 */
declare function isOverdue(dueDate: Date | string | null | undefined): boolean;
/**
 * Get the difference in days between two dates
 */
declare function getDaysDiff(date1: Date | string, date2: Date | string): number;
/**
 * Get the start of day for a date
 */
declare function startOfDay(date: Date | string): Date;
/**
 * Get the end of day for a date
 */
declare function endOfDay(date: Date | string): Date;
/**
 * Get the start of week for a date
 */
declare function startOfWeek(date: Date | string): Date;
/**
 * Get the end of week for a date
 */
declare function endOfWeek(date: Date | string): Date;
/**
 * Add days to a date
 */
declare function addDays(date: Date | string, days: number): Date;
/**
 * Add hours to a date
 */
declare function addHours(date: Date | string, hours: number): Date;
/**
 * Add minutes to a date
 */
declare function addMinutes(date: Date | string, minutes: number): Date;
/**
 * Get the start of today
 */
declare function startOfToday(): Date;
/**
 * Check if date1 is before date2
 */
declare function isBefore(date1: Date | string, date2: Date | string): boolean;
/**
 * Check if date1 is after date2
 */
declare function isAfter(date1: Date | string, date2: Date | string): boolean;
/**
 * Check if a task is available to work on (startDate <= today or no startDate)
 */
declare function isTaskAvailable(task: {
    startDate?: Date | string | null;
}): boolean;
/**
 * Check if a task is scheduled for today
 */
declare function isScheduledForToday(task: {
    scheduledDate?: Date | string | null;
}): boolean;
/**
 * Check if a task is due today
 */
declare function isDueToday(task: {
    dueDate?: Date | string | null;
}): boolean;
/**
 * Task interface for categorization
 */
interface TaskForCategorization {
    dueDate?: Date | string | null;
    startDate?: Date | string | null;
    scheduledDate?: Date | string | null;
    status?: string;
}
/**
 * Categorize tasks by availability and dates
 */
declare function categorizeTasksByAvailability<T extends TaskForCategorization>(tasks: T[]): {
    overdue: T[];
    dueToday: T[];
    scheduledToday: T[];
    available: T[];
    notYetAvailable: T[];
};
/**
 * Get tasks that can be worked on today (available and not blocked)
 */
declare function getWorkableTasks<T extends TaskForCategorization>(tasks: T[]): T[];
/**
 * Format scheduled time for display
 */
declare function formatScheduledDateTime(scheduledDate: Date | string | null | undefined, scheduledTime: string | null | undefined, locale?: string): string | null;

/**
 * Time utility functions
 * Used across all applications for consistent time formatting and calculations
 */
/**
 * Format duration in minutes to human-readable string (e.g., "2h 30m")
 */
declare function formatDuration(minutes: number): string;
/**
 * Format duration in seconds to human-readable string (e.g., "1h 23m 45s")
 */
declare function formatDurationFromSeconds(seconds: number): string;
/**
 * Format time for timer display (MM:SS)
 */
declare function formatTimerDisplay(seconds: number): string;
/**
 * Format time for extended timer display (HH:MM:SS)
 */
declare function formatTimerDisplayExtended(seconds: number): string;
/**
 * Convert minutes to hours (decimal)
 */
declare function minutesToHours(minutes: number): number;
/**
 * Convert hours to minutes
 */
declare function hoursToMinutes(hours: number): number;
/**
 * Convert seconds to minutes
 */
declare function secondsToMinutes(seconds: number): number;
/**
 * Convert minutes to seconds
 */
declare function minutesToSeconds(minutes: number): number;
/**
 * Parse duration string to minutes (e.g., "2h 30m" -> 150)
 */
declare function parseDuration(duration: string): number;
/**
 * Calculate total time worked from time entries
 */
declare function calculateTotalTimeWorked(timeEntries: Array<{
    duration: number;
}>): number;
/**
 * Calculate average time per task
 */
declare function calculateAverageTime(totalMinutes: number, taskCount: number): number;
/**
 * Format time of day (e.g., "14:30" -> "2:30 PM")
 */
declare function formatTimeOfDay(time: string, use24Hour?: boolean): string;
/**
 * Get current time in HH:MM format
 */
declare function getCurrentTime(): string;
/**
 * Check if time is within working hours (9 AM - 6 PM by default)
 */
declare function isWorkingHours(date?: Date, startHour?: number, endHour?: number): boolean;

/**
 * String utility functions
 * Used across all applications for consistent string manipulation
 */
/**
 * Generate a URL-friendly slug from a string
 */
declare function generateSlug(text: string): string;
/**
 * Truncate a string to a maximum length with ellipsis
 */
declare function truncate(text: string, maxLength: number, ellipsis?: string): string;
/**
 * Capitalize the first letter of a string
 */
declare function capitalize(text: string): string;
/**
 * Capitalize the first letter of each word
 */
declare function capitalizeWords(text: string): string;
/**
 * Convert camelCase or PascalCase to Title Case
 */
declare function camelToTitle(text: string): string;
/**
 * Convert snake_case to Title Case
 */
declare function snakeToTitle(text: string): string;
/**
 * Extract initials from a name (e.g., "John Doe" -> "JD")
 */
declare function getInitials(name: string, maxLength?: number): string;
/**
 * Generate a random string of specified length
 */
declare function generateRandomString(length: number): string;
/**
 * Check if a string is a valid email
 */
declare function isValidEmail(email: string): boolean;
/**
 * Check if a string is a valid URL
 */
declare function isValidUrl(url: string): boolean;
/**
 * Sanitize a string for use in HTML (basic XSS prevention)
 */
declare function sanitizeHtml(text: string): string;
/**
 * Remove extra whitespace from a string
 */
declare function normalizeWhitespace(text: string): string;
/**
 * Count words in a string
 */
declare function countWords(text: string): number;
/**
 * Pluralize a word based on count
 */
declare function pluralize(word: string, count: number, plural?: string): string;
/**
 * Format a number with commas (e.g., 1000 -> "1,000")
 */
declare function formatNumber(num: number): string;
/**
 * Generate a unique ID (simple implementation)
 */
declare function generateId(): string;
/**
 * Check if string contains only alphanumeric characters
 */
declare function isAlphanumeric(text: string): boolean;
/**
 * Remove HTML tags from a string
 */
declare function stripHtmlTags(html: string): string;
/**
 * Highlight search terms in text
 */
declare function highlightSearchTerms(text: string, searchTerm: string): string;

/**
 * Calculation utility functions
 * Used across all applications for consistent business logic calculations
 */
/**
 * Calculate progress percentage
 */
declare function calculateProgress(completed: number, total: number): number;
/**
 * Calculate completion rate
 */
declare function calculateCompletionRate(completed: number, total: number): number;
/**
 * Calculate productivity score (0-100)
 * Based on completed tasks, time worked, and focus time
 */
declare function calculateProductivityScore(completedTasks: number, totalTasks: number, focusMinutes: number, targetFocusMinutes?: number): number;
/**
 * Calculate focus score based on pomodoros completed
 */
declare function calculateFocusScore(completedPomodoros: number, targetPomodoros?: number): number;
/**
 * Calculate average completion time
 */
declare function calculateAverageCompletionTime(tasks: Array<{
    createdAt: Date | string;
    completedAt?: Date | string | null;
}>): number;
/**
 * Calculate velocity (tasks completed per day)
 */
declare function calculateVelocity(completedTasks: number, days: number): number;
/**
 * Calculate estimated completion date based on velocity
 */
declare function calculateEstimatedCompletion(remainingTasks: number, velocity: number): Date | null;
/**
 * Calculate burndown rate
 */
declare function calculateBurndownRate(initialTasks: number, remainingTasks: number, elapsedDays: number): number;
/**
 * Calculate project health score (0-100)
 * Based on progress, overdue tasks, and velocity
 */
declare function calculateProjectHealth(completedTasks: number, totalTasks: number, overdueTasks: number, velocity: number, targetVelocity?: number): number;
/**
 * Calculate time utilization percentage
 */
declare function calculateTimeUtilization(actualMinutes: number, estimatedMinutes: number): number;
/**
 * Calculate efficiency score
 */
declare function calculateEfficiency(completedTasks: number, totalMinutesWorked: number): number;
/**
 * Calculate streak (consecutive days with activity)
 */
declare function calculateStreak(activityDates: Array<Date | string>): number;
/**
 * Calculate percentile rank
 */
declare function calculatePercentile(value: number, values: number[]): number;
/**
 * Calculate weighted average
 */
declare function calculateWeightedAverage(values: Array<{
    value: number;
    weight: number;
}>): number;

/**
 * Color utility functions
 * Used across all applications for consistent color manipulation
 */
/**
 * Convert hex color to RGB
 */
declare function hexToRgb(hex: string): {
    r: number;
    g: number;
    b: number;
} | null;
/**
 * Convert RGB to hex color
 */
declare function rgbToHex(r: number, g: number, b: number): string;
/**
 * Get contrast color (black or white) for a given background color
 */
declare function getContrastColor(hexColor: string): string;
/**
 * Lighten a color by a percentage
 */
declare function lightenColor(hexColor: string, percent: number): string;
/**
 * Darken a color by a percentage
 */
declare function darkenColor(hexColor: string, percent: number): string;
/**
 * Add alpha channel to hex color
 */
declare function addAlpha(hexColor: string, alpha: number): string;
/**
 * Convert hex color to RGBA string
 */
declare function hexToRgba(hexColor: string, alpha?: number): string;
/**
 * Generate a random hex color
 */
declare function randomColor(): string;
/**
 * Check if a color is light
 */
declare function isLightColor(hexColor: string): boolean;
/**
 * Check if a color is dark
 */
declare function isDarkColor(hexColor: string): boolean;
/**
 * Mix two colors
 */
declare function mixColors(color1: string, color2: string, weight?: number): string;
/**
 * Generate a color palette from a base color
 */
declare function generatePalette(baseColor: string): {
    lighter: string;
    light: string;
    base: string;
    dark: string;
    darker: string;
};
/**
 * Get color with opacity for backgrounds
 */
declare function getColorWithOpacity(hexColor: string, opacity?: number): string;

/**
 * Task validation schemas
 * Shared across all applications for consistent task validation
 */

/**
 * Base task schema
 */
declare const taskBaseSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodEnum<{
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
    }>;
    status: z.ZodOptional<z.ZodEnum<{
        TODO: "TODO";
        IN_PROGRESS: "IN_PROGRESS";
        IN_REVIEW: "IN_REVIEW";
        DONE: "DONE";
        CANCELLED: "CANCELLED";
    }>>;
    dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    scheduledDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    scheduledTime: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isTimeBlocked: z.ZodOptional<z.ZodBoolean>;
    estimatedMinutes: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodNaN]>>>, z.ZodTransform<number | null | undefined, number | null | undefined>>;
}, z.core.$strip>;
/**
 * Validation for date relationships
 */
declare const taskDatesSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodEnum<{
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
    }>;
    status: z.ZodOptional<z.ZodEnum<{
        TODO: "TODO";
        IN_PROGRESS: "IN_PROGRESS";
        IN_REVIEW: "IN_REVIEW";
        DONE: "DONE";
        CANCELLED: "CANCELLED";
    }>>;
    dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    scheduledDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    scheduledTime: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isTimeBlocked: z.ZodOptional<z.ZodBoolean>;
    estimatedMinutes: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodNaN]>>>, z.ZodTransform<number | null | undefined, number | null | undefined>>;
}, z.core.$strip>;
/**
 * Create task schema
 */
declare const createTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodEnum<{
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
    }>;
    status: z.ZodOptional<z.ZodEnum<{
        TODO: "TODO";
        IN_PROGRESS: "IN_PROGRESS";
        IN_REVIEW: "IN_REVIEW";
        DONE: "DONE";
        CANCELLED: "CANCELLED";
    }>>;
    dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    scheduledDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    scheduledTime: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isTimeBlocked: z.ZodOptional<z.ZodBoolean>;
    estimatedMinutes: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodNaN]>>>, z.ZodTransform<number | null | undefined, number | null | undefined>>;
    projectId: z.ZodString;
    parentTaskId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    assigneeId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    tagIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
/**
 * Update task schema (all fields optional except what's being updated)
 */
declare const updateTaskSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    priority: z.ZodOptional<z.ZodEnum<{
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
    }>>;
    status: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        TODO: "TODO";
        IN_PROGRESS: "IN_PROGRESS";
        IN_REVIEW: "IN_REVIEW";
        DONE: "DONE";
        CANCELLED: "CANCELLED";
    }>>>;
    dueDate: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    startDate: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    scheduledDate: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    scheduledTime: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    isTimeBlocked: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    estimatedMinutes: z.ZodOptional<z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodNaN]>>>, z.ZodTransform<number | null | undefined, number | null | undefined>>>;
    assigneeId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    tagIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    completedAt: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
/**
 * Task filter schema
 */
declare const taskFilterSchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        TODO: "TODO";
        IN_PROGRESS: "IN_PROGRESS";
        IN_REVIEW: "IN_REVIEW";
        DONE: "DONE";
        CANCELLED: "CANCELLED";
    }>>;
    priority: z.ZodOptional<z.ZodEnum<{
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
    }>>;
    assigneeId: z.ZodOptional<z.ZodString>;
    tagIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    search: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodObject<{
        from: z.ZodOptional<z.ZodString>;
        to: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    isOverdue: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
/**
 * Bulk update tasks schema
 */
declare const bulkUpdateTasksSchema: z.ZodObject<{
    taskIds: z.ZodArray<z.ZodString>;
    updates: z.ZodObject<{
        status: z.ZodOptional<z.ZodEnum<{
            TODO: "TODO";
            IN_PROGRESS: "IN_PROGRESS";
            IN_REVIEW: "IN_REVIEW";
            DONE: "DONE";
            CANCELLED: "CANCELLED";
        }>>;
        priority: z.ZodOptional<z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
        }>>;
        assigneeId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        projectId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Reorder tasks schema
 */
declare const reorderTasksSchema: z.ZodObject<{
    taskId: z.ZodString;
    newOrder: z.ZodNumber;
    projectId: z.ZodString;
}, z.core.$strip>;
/**
 * Type exports
 */
type TaskBase = z.infer<typeof taskBaseSchema>;
type CreateTaskDTO = z.infer<typeof createTaskSchema>;
type UpdateTaskDTO = z.infer<typeof updateTaskSchema>;
type TaskFilter = z.infer<typeof taskFilterSchema>;
type BulkUpdateTasks = z.infer<typeof bulkUpdateTasksSchema>;
type ReorderTasks = z.infer<typeof reorderTasksSchema>;

/**
 * Project validation schemas
 * Shared across all applications for consistent project validation
 */

/**
 * Base project schema
 */
declare const projectBaseSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Create project schema
 */
declare const createProjectSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodString;
    workflowId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    endDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
/**
 * Update project schema
 */
declare const updateProjectSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    color: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    icon: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    endDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isArchived: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
/**
 * Project filter schema
 */
declare const projectFilterSchema: z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    isArchived: z.ZodOptional<z.ZodBoolean>;
    color: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Archive project schema
 */
declare const archiveProjectSchema: z.ZodObject<{
    isArchived: z.ZodBoolean;
}, z.core.$strip>;
/**
 * Duplicate project schema
 */
declare const duplicateProjectSchema: z.ZodObject<{
    name: z.ZodString;
    includeTasks: z.ZodDefault<z.ZodBoolean>;
    includeMembers: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
/**
 * Type exports
 */
type ProjectBase = z.infer<typeof projectBaseSchema>;
type CreateProjectDTO = z.infer<typeof createProjectSchema>;
type UpdateProjectDTO = z.infer<typeof updateProjectSchema>;
type ProjectFilter = z.infer<typeof projectFilterSchema>;
type ArchiveProject = z.infer<typeof archiveProjectSchema>;
type DuplicateProject = z.infer<typeof duplicateProjectSchema>;

declare enum MemberRole {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    MEMBER = "MEMBER",
    VIEWER = "VIEWER"
}

/**
 * Workspace validation schemas
 * Shared across all applications for consistent workspace validation
 */

/**
 * Workspace type enum
 */
declare const WORKSPACE_TYPES: readonly ["PERSONAL", "WORK", "TEAM"];

/**
 * Member role enum
 */
declare const MEMBER_ROLES: readonly [MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER, MemberRole.VIEWER];
/**
 * Base workspace schema
 */
declare const workspaceBaseSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
        PERSONAL: "PERSONAL";
        WORK: "WORK";
        TEAM: "TEAM";
    }>;
    color: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Create workspace schema
 */
declare const createWorkspaceSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
        PERSONAL: "PERSONAL";
        WORK: "WORK";
        TEAM: "TEAM";
    }>;
    color: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Update workspace schema
 */
declare const updateWorkspaceSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    type: z.ZodOptional<z.ZodEnum<{
        PERSONAL: "PERSONAL";
        WORK: "WORK";
        TEAM: "TEAM";
    }>>;
    color: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    icon: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
/**
 * Workspace settings schema
 */
declare const workspaceSettingsSchema: z.ZodObject<{
    defaultTaskPriority: z.ZodOptional<z.ZodEnum<{
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
    }>>;
    defaultTaskStatus: z.ZodOptional<z.ZodEnum<{
        TODO: "TODO";
        IN_PROGRESS: "IN_PROGRESS";
        IN_REVIEW: "IN_REVIEW";
        DONE: "DONE";
        CANCELLED: "CANCELLED";
    }>>;
    enableNotifications: z.ZodOptional<z.ZodBoolean>;
    enableEmailDigest: z.ZodOptional<z.ZodBoolean>;
    timezone: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Invite member schema
 */
declare const inviteMemberSchema: z.ZodObject<{
    email: z.ZodString;
    role: z.ZodEnum<{
        OWNER: MemberRole.OWNER;
        ADMIN: MemberRole.ADMIN;
        MEMBER: MemberRole.MEMBER;
        VIEWER: MemberRole.VIEWER;
    }>;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Update member role schema
 */
declare const updateMemberRoleSchema: z.ZodObject<{
    role: z.ZodEnum<{
        OWNER: MemberRole.OWNER;
        ADMIN: MemberRole.ADMIN;
        MEMBER: MemberRole.MEMBER;
        VIEWER: MemberRole.VIEWER;
    }>;
}, z.core.$strip>;
/**
 * Accept invitation schema
 */
declare const acceptInvitationSchema: z.ZodObject<{
    token: z.ZodString;
}, z.core.$strip>;
/**
 * Transfer ownership schema
 */
declare const transferOwnershipSchema: z.ZodObject<{
    newOwnerId: z.ZodString;
}, z.core.$strip>;
/**
 * Workspace filter schema
 */
declare const workspaceFilterSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<{
        PERSONAL: "PERSONAL";
        WORK: "WORK";
        TEAM: "TEAM";
    }>>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Type exports
 * Note: WorkspaceType is defined in workspaces domain, so we use WorkspaceTypeValue here
 */
type WorkspaceTypeValue = (typeof WORKSPACE_TYPES)[number];
type MemberRoleValue = (typeof MEMBER_ROLES)[number];
type WorkspaceBase = z.infer<typeof workspaceBaseSchema>;
type CreateWorkspaceDTO = z.infer<typeof createWorkspaceSchema>;
type UpdateWorkspaceDTO = z.infer<typeof updateWorkspaceSchema>;
type WorkspaceSettingsDTO = z.infer<typeof workspaceSettingsSchema>;
type InviteMemberDTO = z.infer<typeof inviteMemberSchema>;
type UpdateMemberRole = z.infer<typeof updateMemberRoleSchema>;
type AcceptInvitation = z.infer<typeof acceptInvitationSchema>;
type TransferOwnership = z.infer<typeof transferOwnershipSchema>;
type WorkspaceFilter = z.infer<typeof workspaceFilterSchema>;

/**
 * Tag validation schemas
 * Shared across all applications for consistent tag validation
 */

/**
 * Base tag schema
 */
declare const tagBaseSchema: z.ZodObject<{
    name: z.ZodString;
    color: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Create tag schema
 */
declare const createTagSchema: z.ZodObject<{
    name: z.ZodString;
    color: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodString;
}, z.core.$strip>;
/**
 * Update tag schema
 */
declare const updateTagSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
/**
 * Tag filter schema
 */
declare const tagFilterSchema: z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Assign tags to task schema
 */
declare const assignTagsSchema: z.ZodObject<{
    tagIds: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
/**
 * Type exports
 */
type TagBase = z.infer<typeof tagBaseSchema>;
type CreateTagDTO = z.infer<typeof createTagSchema>;
type UpdateTagDTO = z.infer<typeof updateTagSchema>;
type TagFilter = z.infer<typeof tagFilterSchema>;
type AssignTags = z.infer<typeof assignTagsSchema>;

/**
 * User validation schemas
 * Shared across all applications for consistent user validation
 */

/**
 * User registration schema
 */
declare const registerUserSchema: z.ZodObject<{
    name: z.ZodString;
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
/**
 * User login schema
 */
declare const loginUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
/**
 * Update user profile schema
 */
declare const updateUserProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    avatar: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    timezone: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodEnum<{
        en: "en";
        es: "es";
        "pt-BR": "pt-BR";
    }>>;
}, z.core.$strip>;
/**
 * Change password schema
 */
declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
/**
 * Reset password request schema
 */
declare const resetPasswordRequestSchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
/**
 * Reset password schema
 */
declare const resetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
/**
 * User preferences schema
 */
declare const userPreferencesSchema: z.ZodObject<{
    theme: z.ZodOptional<z.ZodEnum<{
        light: "light";
        dark: "dark";
        system: "system";
    }>>;
    language: z.ZodOptional<z.ZodEnum<{
        en: "en";
        es: "es";
        "pt-BR": "pt-BR";
    }>>;
    timezone: z.ZodOptional<z.ZodString>;
    notifications: z.ZodOptional<z.ZodObject<{
        email: z.ZodOptional<z.ZodBoolean>;
        push: z.ZodOptional<z.ZodBoolean>;
        desktop: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    pomodoro: z.ZodOptional<z.ZodObject<{
        workDuration: z.ZodOptional<z.ZodNumber>;
        shortBreakDuration: z.ZodOptional<z.ZodNumber>;
        longBreakDuration: z.ZodOptional<z.ZodNumber>;
        pomodorosUntilLongBreak: z.ZodOptional<z.ZodNumber>;
        autoStartBreaks: z.ZodOptional<z.ZodBoolean>;
        autoStartPomodoros: z.ZodOptional<z.ZodBoolean>;
        soundEnabled: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Type exports
 */
type RegisterUserDTO = z.infer<typeof registerUserSchema>;
type LoginUserDTO = z.infer<typeof loginUserSchema>;
type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
type ChangePassword = z.infer<typeof changePasswordSchema>;
type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
type ResetPassword = z.infer<typeof resetPasswordSchema>;
/**
 * Username validation schema
 */
declare const usernameValidationSchema: z.ZodObject<{
    username: z.ZodString;
}, z.core.$strip>;
type UserPreferences = z.infer<typeof userPreferencesSchema>;
type UsernameValidation = z.infer<typeof usernameValidationSchema>;

/**
 * Comment validation schemas
 * Shared across all applications for consistent comment validation
 */

/**
 * Base comment schema
 */
declare const commentBaseSchema: z.ZodObject<{
    content: z.ZodString;
}, z.core.$strip>;
/**
 * Create comment schema
 */
declare const createCommentSchema: z.ZodObject<{
    content: z.ZodString;
    taskId: z.ZodString;
    parentCommentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    mentions: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
/**
 * Update comment schema
 */
declare const updateCommentSchema: z.ZodObject<{
    content: z.ZodString;
}, z.core.$strip>;
/**
 * Comment filter schema
 */
declare const commentFilterSchema: z.ZodObject<{
    taskId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    parentCommentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
/**
 * Type exports
 */
type CommentBase = z.infer<typeof commentBaseSchema>;
type CreateCommentDTO = z.infer<typeof createCommentSchema>;
type UpdateCommentDTO = z.infer<typeof updateCommentSchema>;
type CommentFilter = z.infer<typeof commentFilterSchema>;

interface UserProps extends EntityProps<string> {
    name?: string;
    username: string;
    email?: string;
    password?: string;
    image?: string | null;
    phone?: string | null;
    jobTitle?: string | null;
    department?: string | null;
    bio?: string | null;
    timezone?: string | null;
    locale?: string | null;
    lastUsernameChangeAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class User extends Entity<UserProps> {
    readonly name: string;
    readonly username: string;
    readonly email: string;
    readonly password?: string;
    constructor(props: UserProps, mode?: EntityMode);
    withoutPassword(): User;
    static draft(props?: UserProps): User;
    get $name(): PersonName;
    get $email(): Email;
    get $password(): HashPassword | undefined;
}

/**
 * Properties required to create a new user (including OAuth users).
 *
 * Used for both email/password registration and OAuth provider authentication.
 */
interface CreateUserProps {
    /** The user's full name or display name */
    name: string;
    /** The user's email address (must be unique) */
    email: string;
    /** The user's unique username (must be unique) */
    username: string;
    /** Optional profile image URL */
    image?: string | null;
    /** OAuth provider name (e.g., 'google', 'github') */
    provider?: string;
    /** Unique user ID from the OAuth provider */
    providerId?: string;
}
/**
 * Repository interface for User entity.
 *
 * Provides data access methods for user persistence, authentication,
 * and OAuth account management.
 *
 * @example
 * ```typescript
 * class PrismaUserRepository implements UserRepository {
 *   async save(user: User): Promise<void> {
 *     await prisma.user.create({ data: user.toJSON() });
 *   }
 *   // ... other methods
 * }
 * ```
 */
interface UserRepository {
    /**
     * Saves a new user to the database.
     *
     * @param user - The user entity to save
     * @returns Promise that resolves when the user is saved
     * @throws {Error} If the user already exists or database operation fails
     *
     * @example
     * ```typescript
     * const user = new User({
     *   email: 'user@example.com',
     *   username: 'johndoe',
     *   name: 'John Doe'
     * });
     * await repository.save(user);
     * ```
     */
    save(user: User): Promise<void>;
    /**
     * Updates specific properties of an existing user.
     *
     * Allows partial updates without replacing the entire user entity.
     *
     * @param user - The user entity to update
     * @param props - Partial properties to update (email, name, username, etc.)
     * @returns Promise that resolves when the user is updated
     * @throws {Error} If the user doesn't exist or validation fails
     *
     * @example
     * ```typescript
     * await repository.updateProps(user, {
     *   name: 'John Smith',
     *   jobTitle: 'Senior Developer'
     * });
     * ```
     */
    updateProps(user: User, props: Partial<UserProps>): Promise<void>;
    /**
     * Finds a user by their email address.
     *
     * Used primarily for authentication (login) purposes.
     *
     * @param email - The email address to search for
     * @param withPassword - Whether to include the password hash in the result
     * @returns Promise that resolves to the user if found, null otherwise
     *
     * @example
     * ```typescript
     * // For authentication (include password)
     * const user = await repository.findByEmail('user@example.com', true);
     * if (user && (await bcrypt.compare(password, user.password))) {
     *   // Authentication successful
     * }
     *
     * // For general queries (exclude password)
     * const user = await repository.findByEmail('user@example.com');
     * ```
     */
    findByEmail(email: string, withPassword?: boolean): Promise<User | null>;
    /**
     * Finds a user by their username.
     *
     * Used for profile lookup and @mention functionality.
     *
     * @param username - The username to search for
     * @returns Promise that resolves to the user if found, null otherwise
     *
     * @example
     * ```typescript
     * const user = await repository.findByUsername('johndoe');
     * if (user) {
     *   console.log(user.name);
     * }
     * ```
     */
    findByUsername(username: string): Promise<User | null>;
    /**
     * Finds a user by their unique ID.
     *
     * @param id - The unique identifier of the user
     * @returns Promise that resolves to the user if found, null otherwise
     *
     * @example
     * ```typescript
     * const user = await repository.findById('user-123');
     * if (user) {
     *   console.log(user.email);
     * }
     * ```
     */
    findById(id: string): Promise<User | null>;
    /**
     * Finds a user by their OAuth provider information.
     *
     * Used for OAuth authentication flows to check if a user has
     * previously linked their account with a specific provider.
     *
     * @param provider - The OAuth provider name (e.g., 'google', 'github')
     * @param providerId - The unique user ID from the OAuth provider
     * @returns Promise that resolves to the user if found, null otherwise
     *
     * @example
     * ```typescript
     * // Google OAuth login
     * const user = await repository.findByProvider('google', 'google-user-id-123');
     * if (user) {
     *   // User exists, log them in
     * } else {
     *   // Create new user account
     * }
     * ```
     */
    findByProvider(provider: string, providerId: string): Promise<User | null>;
    /**
     * Links an OAuth account to an existing user.
     *
     * Allows users to sign in with multiple providers (e.g., Google + GitHub).
     *
     * @param userId - The unique identifier of the user
     * @param provider - The OAuth provider name (e.g., 'google', 'github')
     * @param providerId - The unique user ID from the OAuth provider
     * @returns Promise that resolves to the updated user
     *
     * @example
     * ```typescript
     * // User already has Google account, now adding GitHub
     * const updated = await repository.linkOAuthAccount(
     *   'user-123',
     *   'github',
     *   'github-user-id-456'
     * );
     * ```
     */
    linkOAuthAccount(userId: string, provider: string, providerId: string): Promise<User>;
    /**
     * Creates a new user account.
     *
     * Used for both email/password registration and OAuth authentication.
     *
     * @param props - The user properties (email, username, name, OAuth info)
     * @returns Promise that resolves to the created user entity
     * @throws {Error} If email/username already exists or validation fails
     *
     * @example
     * ```typescript
     * // Email/password registration
     * const user = await repository.create({
     *   email: 'user@example.com',
     *   username: 'johndoe',
     *   name: 'John Doe'
     * });
     *
     * // OAuth registration
     * const user = await repository.create({
     *   email: 'user@gmail.com',
     *   username: 'johndoe',
     *   name: 'John Doe',
     *   provider: 'google',
     *   providerId: 'google-123',
     *   image: 'https://google.com/photo.jpg'
     * });
     * ```
     */
    create(props: CreateUserProps): Promise<User>;
    /**
     * Updates a user's XP (experience points) and level.
     *
     * Used for gamification features where users earn XP through
     * completing tasks, pomodoros, achievements, etc.
     *
     * @param userId - The user ID to update
     * @param xp - The new XP value
     * @param level - The new level value
     * @returns Promise that resolves when the user is updated
     * @throws {Error} If the user doesn't exist
     *
     * @example
     * ```typescript
     * await repository.updateXpAndLevel('user-123', 500, 3);
     * console.log('User leveled up to 3!');
     * ```
     */
    updateXpAndLevel(userId: string, xp: number, level: number): Promise<void>;
    /**
     * Deletes a user account and all associated data.
     *
     * @param id - The unique identifier of the user to delete
     * @returns Promise that resolves when the user is deleted
     * @throws {Error} If the user doesn't exist or database operation fails
     */
    delete(id: string): Promise<void>;
}

interface CryptoProvider {
    encrypt(password: string): Promise<string>;
    compare(password: string, hashedPassword: string): Promise<boolean>;
}

declare class ChangeUserName implements UseCase<string, void> {
    private readonly repo;
    constructor(repo: UserRepository);
    execute(newName: string, loggedUser?: LoggedUser): Promise<void>;
}

type Input$1 = {
    name: string;
    username: string;
    email: string;
    password: string;
};
declare class RegisterUser implements UseCase<Input$1, void> {
    private readonly repo;
    private readonly crypto;
    constructor(repo: UserRepository, crypto: CryptoProvider);
    execute(user: Input$1): Promise<void>;
}

declare class UserByEmail implements UseCase<string, User> {
    private readonly repo;
    constructor(repo: UserRepository);
    execute(email: string): Promise<User>;
}

type Input = {
    email: string;
    password: string;
};
declare class UserLogin implements UseCase<Input, User> {
    private readonly repo;
    private readonly crypto;
    constructor(repo: UserRepository, crypto: CryptoProvider);
    execute(input: Input): Promise<User>;
}

interface TagProps extends EntityProps {
    name: string;
    color: string;
    workspaceId?: string;
    createdAt?: Date;
}
declare class Tag extends Entity<TagProps> {
    constructor(props: TagProps);
    static create(props: Omit<TagProps, "id" | "createdAt">): Tag;
    update(props: Partial<Omit<TagProps, "id" | "workspaceId" | "createdAt">>): Tag;
}

type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
interface TaskProps extends EntityProps<string> {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: Date;
    startDate?: Date;
    scheduledDate?: Date;
    scheduledTime?: string;
    scheduledEndTime?: string;
    isTimeBlocked?: boolean;
    completedAt?: Date;
    projectId: string;
    ownerId: string;
    assigneeId?: string | null;
    parentTaskId?: string;
    subTasks?: Task[];
    estimatedMinutes?: number;
    actualMinutes?: number;
    publicToken?: string;
    energyRequired?: "LOW" | "MEDIUM" | "HIGH";
    tags?: TagProps[];
    project?: {
        id: string;
        name: string;
        color: string;
    };
    assignee?: {
        id: string;
        name: string;
        image?: string;
    };
    owner?: {
        id: string;
        name: string;
        image?: string;
    };
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    recurrence?: TaskRecurrenceInfo;
}
interface TaskRecurrenceInfo {
    pattern: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
    interval?: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    endDate?: Date;
}
declare class Task extends Entity<TaskProps> {
    constructor(props: TaskProps);
    static create(props: Omit<TaskProps, "id" | "createdAt" | "updatedAt" | "status" | "isDeleted" | "deletedAt">): Task;
    complete(): Task;
    updateStatus(status: TaskStatus): Task;
    update(props: Partial<Omit<TaskProps, "id" | "ownerId" | "createdAt">>): Task;
    softDelete(): Task;
    restore(): Task;
}

/**
 * Repository interface for Task entity.
 *
 * Provides data access methods for task persistence and retrieval,
 * including filtering, searching, and soft delete functionality.
 *
 * @example
 * ```typescript
 * class PrismaTaskRepository implements TaskRepository {
 *   async save(task: Task): Promise<void> {
 *     await prisma.task.create({ data: task.toJSON() });
 *   }
 *   // ... other methods
 * }
 * ```
 */
interface TaskRepository {
    /**
     * Saves a new task to the database.
     *
     * @param task - The task entity to save
     * @returns Promise that resolves when the task is saved
     * @throws {Error} If the task already exists or database operation fails
     *
     * @example
     * ```typescript
     * const task = new Task({ title: 'My Task', ownerId: 'user-123' });
     * await repository.save(task);
     * ```
     */
    save(task: Task): Promise<void>;
    /**
     * Finds a task by its unique ID.
     *
     * @param id - The unique identifier of the task
     * @returns Promise that resolves to the task if found, null otherwise
     *
     * @example
     * ```typescript
     * const task = await repository.findById('task-123');
     * if (task) {
     *   console.log(task.title);
     * }
     * ```
     */
    findById(id: string): Promise<Task | null>;
    /**
     * Finds a task by its unique ID, including soft-deleted tasks.
     *
     * @param id - The unique identifier of the task
     * @returns Promise that resolves to the task if found, null otherwise
     *
     * @example
     * ```typescript
     * const task = await repository.findByIdIncludeDeleted('task-123');
     * if (task && task.props.isDeleted) {
     *   console.log('Task is in trash');
     * }
     * ```
     */
    findByIdIncludeDeleted(id: string): Promise<Task | null>;
    /**
     * Finds all tasks owned by a specific user.
     *
     * @param ownerId - The unique identifier of the task owner
     * @param filters - Optional filters for narrowing results
     * @param filters.projectId - Filter tasks by project ID
     * @param filters.tags - Filter tasks by tag names
     * @returns Promise that resolves to an array of tasks
     *
     * @example
     * ```typescript
     * // Get all tasks for a user
     * const tasks = await repository.findByOwnerId('user-123');
     *
     * // Get tasks for a specific project
     * const projectTasks = await repository.findByOwnerId('user-123', {
     *   projectId: 'project-456'
     * });
     *
     * // Get tasks with specific tags
     * const taggedTasks = await repository.findByOwnerId('user-123', {
     *   tags: ['urgent', 'bug']
     * });
     * ```
     */
    findByOwnerId(ownerId: string, filters?: {
        projectId?: string;
        tags?: string[];
    }): Promise<Task[]>;
    /**
     * Finds all tasks from workspaces where the user is a member.
     *
     * This includes tasks from:
     * - Personal workspace
     * - Workspaces where user is a member
     * - Projects within those workspaces
     *
     * @param userId - The unique identifier of the user
     * @param filters - Optional filters for narrowing results
     * @param filters.projectId - Filter tasks by project ID
     * @param filters.tags - Filter tasks by tag names
     * @returns Promise that resolves to an array of tasks
     *
     * @example
     * ```typescript
     * const tasks = await repository.findByWorkspaceMemberships('user-123');
     * ```
     */
    findByWorkspaceMemberships(userId: string, filters?: {
        projectId?: string;
        tags?: string[];
    }): Promise<Task[]>;
    /**
     * Updates an existing task in the database.
     *
     * @param task - The task entity with updated properties
     * @returns Promise that resolves when the task is updated
     * @throws {Error} If the task doesn't exist or database operation fails
     *
     * @example
     * ```typescript
     * const updated = task.clone({ status: TaskStatus.DONE });
     * await repository.update(updated);
     * ```
     */
    update(task: Task): Promise<void>;
    /**
     * Soft deletes a task by marking it as deleted.
     *
     * The task remains in the database but is marked as deleted
     * and won't appear in normal queries.
     *
     * @param id - The unique identifier of the task to delete
     * @returns Promise that resolves when the task is soft deleted
     *
     * @example
     * ```typescript
     * await repository.softDelete('task-123');
     * ```
     */
    softDelete(id: string): Promise<void>;
    /**
     * Permanently deletes a task (hard delete).
     *
     * WARNING: This operation cannot be undone. Use softDelete
     * unless you absolutely need to permanently remove the task.
     *
     * @param id - The unique identifier of the task to delete
     * @returns Promise that resolves when the task is permanently deleted
     *
     * @example
     * ```typescript
     * await repository.permanentDelete('task-123');
     * ```
     */
    permanentDelete(id: string): Promise<void>;
    /**
     * Alias for softDelete. Maintains compatibility with code using 'delete' terminology.
     *
     * @param id - The unique identifier of the task to delete
     * @returns Promise that resolves when the task is deleted
     * @see softDelete
     */
    delete(id: string): Promise<void>;
    /**
     * Restores a previously soft-deleted task.
     *
     * @param id - The unique identifier of the task to restore
     * @returns Promise that resolves when the task is restored
     *
     * @example
     * ```typescript
     * await repository.restore('task-123');
     * ```
     */
    restore(id: string): Promise<void>;
    /**
     * Finds all soft-deleted tasks for a specific project.
     *
     * Useful for implementing a "trash" or "recycle bin" feature.
     *
     * @param projectId - The unique identifier of the project
     * @returns Promise that resolves to an array of deleted tasks
     *
     * @example
     * ```typescript
     * const deletedTasks = await repository.findDeleted('project-456');
     * ```
     */
    findDeleted(projectId: string): Promise<Task[]>;
    /**
     * Finds tasks scheduled for today (due today, overdue, or in progress).
     *
     * Used for the "Today" view in the application.
     *
     * @param userId - The unique identifier of the user
     * @param today - The start of today (midnight)
     * @param tomorrow - The start of tomorrow (midnight)
     * @returns Promise that resolves to an array of today's tasks
     *
     * @example
     * ```typescript
     * const today = new Date();
     * today.setHours(0, 0, 0, 0);
     * const tomorrow = new Date(today);
     * tomorrow.setDate(tomorrow.getDate() + 1);
     *
     * const todaysTasks = await repository.findTodayTasks('user-123', today, tomorrow);
     * ```
     */
    findTodayTasks(userId: string, today: Date, tomorrow: Date): Promise<Task[]>;
    /**
     * Finds tasks scheduled for a specific date range.
     *
     * Includes tasks with due dates or scheduled dates within the range.
     *
     * @param userId - The unique identifier of the user
     * @param startOfDay - The start of the date range
     * @param endOfDay - The end of the date range
     * @returns Promise that resolves to an array of scheduled tasks
     *
     * @example
     * ```typescript
     * const startOfWeek = new Date();
     * startOfWeek.setHours(0, 0, 0, 0);
     * const endOfWeek = new Date(startOfWeek);
     * endOfWeek.setDate(endOfWeek.getDate() + 7);
     *
     * const weeklyTasks = await repository.findScheduledTasks(
     *   'user-123',
     *   startOfWeek,
     *   endOfWeek
     * );
     * ```
     */
    findScheduledTasks(userId: string, startOfDay: Date, endOfDay: Date): Promise<Task[]>;
    /**
     * Finds available tasks that can be worked on.
     *
     * Available tasks are:
     * - Not completed
     * - Not blocked by dependencies
     * - Not scheduled for the future
     * - In the specified project (if provided)
     *
     * @param userId - The unique identifier of the user
     * @param today - The current date/time
     * @param projectId - Optional project ID to filter by
     * @returns Promise that resolves to an array of available tasks
     *
     * @example
     * ```typescript
     * const available = await repository.findAvailableTasks(
     *   'user-123',
     *   new Date(),
     *   'project-456'
     * );
     * ```
     */
    findAvailableTasks(userId: string, today: Date, projectId?: string): Promise<Task[]>;
    /**
     * Finds tasks with time blocks scheduled in a date range.
     *
     * Used for the calendar view and time blocking features.
     *
     * @param userId - The unique identifier of the user
     * @param startDate - The start of the date range
     * @param endDate - The end of the date range
     * @returns Promise that resolves to an array of time-blocked tasks
     *
     * @example
     * ```typescript
     * const startOfWeek = new Date();
     * const endOfWeek = new Date();
     * endOfWeek.setDate(endOfWeek.getDate() + 7);
     *
     * const timeBlockedTasks = await repository.findTimeBlockedTasks(
     *   'user-123',
     *   startOfWeek,
     *   endOfWeek
     * );
     * ```
     */
    findTimeBlockedTasks(userId: string, startDate: Date, endDate: Date): Promise<Task[]>;
    /**
     * Groups tasks by status and returns counts for each status.
     *
     * Useful for dashboard widgets and statistics.
     *
     * @param userId - The unique identifier of the user
     * @returns Promise that resolves to an array of status/count pairs
     *
     * @example
     * ```typescript
     * const statusCounts = await repository.groupByStatus('user-123');
     * // Returns: [
     * //   { status: 'TODO', count: 5 },
     * //   { status: 'IN_PROGRESS', count: 2 },
     * //   { status: 'DONE', count: 10 }
     * // ]
     * ```
     */
    groupByStatus(userId: string): Promise<Array<{
        status: string;
        count: number;
    }>>;
}

interface CreateTaskInput {
    title: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: Date;
    projectId: string;
    ownerId: string;
    assigneeId?: string;
    parentTaskId?: string;
    recurrence?: TaskRecurrenceInfo;
}
declare class CreateTaskUseCase implements UseCase<CreateTaskInput, Task> {
    private readonly repository;
    constructor(repository: TaskRepository);
    execute(input: CreateTaskInput): Promise<Task>;
}

interface CompleteTaskInput {
    taskId: string;
    ownerId: string;
}
declare class CompleteTaskUseCase implements UseCase<CompleteTaskInput, Task> {
    private readonly repository;
    constructor(repository: TaskRepository);
    execute(input: CompleteTaskInput): Promise<Task>;
}

declare class SoftDeleteTaskUseCase {
    private taskRepository;
    constructor(taskRepository: TaskRepository);
    execute(id: string): Promise<void>;
}

declare class RestoreTaskUseCase {
    private taskRepository;
    constructor(taskRepository: TaskRepository);
    execute(id: string): Promise<void>;
}

declare class PermanentDeleteTaskUseCase {
    private taskRepository;
    constructor(taskRepository: TaskRepository);
    execute(id: string): Promise<void>;
}

declare class GetDeletedTasksUseCase {
    private taskRepository;
    constructor(taskRepository: TaskRepository);
    execute(projectId: string): Promise<Task[]>;
}

/**
 * Properties for TaskDependency entity
 */
interface TaskDependencyProps {
    id: string;
    blockingTaskId: string;
    blockedTaskId: string;
    createdAt: Date;
}
/**
 * TaskDependency entity represents a dependency relationship between tasks
 *
 * When Task A blocks Task B, Task B cannot be completed until Task A is done.
 * This is critical for project management and task scheduling.
 *
 * @example
 * ```typescript
 * const dependency = new TaskDependency({
 *   id: 'dep-123',
 *   blockingTaskId: 'task-a', // Must complete first
 *   blockedTaskId: 'task-b',  // Blocked by task-a
 *   createdAt: new Date(),
 * });
 *
 * dependency.isBlocking('task-a'); // true
 * dependency.isBlockedBy('task-b'); // true
 * ```
 */
declare class TaskDependency extends Entity<TaskDependencyProps> {
    constructor(props: TaskDependencyProps, mode?: 'valid' | 'draft');
    /**
     * Validate task dependency properties
     */
    private validate;
    get blockingTaskId(): string;
    get blockedTaskId(): string;
    get createdAt(): Date;
    /**
     * Check if a task is blocking another task
     */
    isBlocking(taskId: string): boolean;
    /**
     * Check if a task is blocked by another task
     */
    isBlockedBy(taskId: string): boolean;
    /**
     * Check if this dependency involves a specific task
     */
    involvesTask(taskId: string): boolean;
    /**
     * Get the other task in the dependency
     */
    getOtherTask(taskId: string): string | null;
}

/**
 * Input for creating task dependency
 */
interface TaskDependencyInput {
    blockingTaskId: string;
    blockedTaskId: string;
}
/**
 * Repository interface for TaskDependency domain
 */
interface TaskDependencyRepository {
    /**
     * Create a dependency between tasks
     */
    create(input: TaskDependencyInput): Promise<TaskDependency>;
    /**
     * Get dependency by ID
     */
    findById(id: string): Promise<TaskDependency | null>;
    /**
     * Get all blocking tasks for a given task
     */
    findBlockingTasks(taskId: string): Promise<TaskDependency[]>;
    /**
     * Get all tasks blocked by a given task
     */
    findBlockedTasks(taskId: string): Promise<TaskDependency[]>;
    /**
     * Check if a dependency exists
     */
    exists(blockingTaskId: string, blockedTaskId: string): Promise<boolean>;
    /**
     * Delete a dependency
     */
    delete(id: string): Promise<void>;
    /**
     * Delete all dependencies for a task
     */
    deleteByTaskId(taskId: string): Promise<number>;
    /**
     * Check if a task has any dependencies
     */
    hasDependencies(taskId: string): Promise<boolean>;
    /**
     * Delete a dependency by composite key (blockingTaskId, blockedTaskId)
     */
    deleteByTasks(blockingTaskId: string, blockedTaskId: string): Promise<void>;
}

type WorkspaceTier = "FREE" | "PRO" | "ENTERPRISE";
interface WorkspaceProps extends EntityProps {
    name: string;
    slug: string;
    description?: string;
    tier: WorkspaceTier;
    color: string;
    icon?: string;
    ownerId?: string;
    isArchived: boolean;
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    stats?: {
        projectCount: number;
        taskCount: number;
        memberCount: number;
    };
}
declare class Workspace extends Entity<WorkspaceProps> {
    constructor(props: WorkspaceProps);
    static create(props: Omit<WorkspaceProps, "id" | "createdAt" | "updatedAt" | "isArchived" | "isDeleted" | "deletedAt">): Workspace;
    update(props: Partial<Omit<WorkspaceProps, "id" | "ownerId" | "createdAt">>): Workspace;
    softDelete(): Workspace;
    restore(): Workspace;
    archive(): Workspace;
    unarchive(): Workspace;
    setStats(stats: {
        projectCount: number;
        taskCount: number;
        memberCount: number;
    }): Workspace;
}

interface WorkspaceMemberProps extends EntityProps {
    workspaceId: string;
    userId: string;
    role: MemberRole;
    joinedAt: Date;
}
declare class WorkspaceMember extends Entity<WorkspaceMemberProps> {
    constructor(props: WorkspaceMemberProps);
    static create(props: Omit<WorkspaceMemberProps, "id" | "joinedAt">): WorkspaceMember;
    /**
     * Check if member is owner
     */
    isOwner(): boolean;
    /**
     * Check if member is admin
     */
    isAdmin(): boolean;
    /**
     * Check if member is regular member
     */
    isMember(): boolean;
    /**
     * Check if member is viewer (read-only)
     */
    isViewer(): boolean;
    /**
     * Check if member has admin-level permissions (OWNER or ADMIN)
     */
    hasAdminPermissions(): boolean;
    /**
     * Check if member can manage workspace settings
     */
    canManageWorkspace(): boolean;
    /**
     * Check if member can invite other members
     */
    canInviteMembers(): boolean;
    /**
     * Check if member can remove other members
     */
    canRemoveMembers(): boolean;
    /**
     * Check if member can change roles
     */
    canChangeRoles(): boolean;
    /**
     * Check if member can create/edit/delete tasks
     */
    canManageTasks(): boolean;
    /**
     * Check if member can only view (no edit permissions)
     */
    isReadOnly(): boolean;
    /**
     * Get role level for hierarchy comparison
     */
    getRoleLevel(): number;
    /**
     * Check if this member has higher role than another member
     */
    hasHigherRoleThan(otherMember: WorkspaceMember): boolean;
    /**
     * Check if this member can manage another member
     */
    canManageMember(otherMember: WorkspaceMember): boolean;
}

type ViewType = "LIST" | "KANBAN" | "CALENDAR" | "TIMELINE" | "FOCUS";
interface WorkspaceSettingsProps extends EntityProps {
    workspaceId: string;
    defaultView?: ViewType;
    defaultDueTime?: number;
    timezone?: string;
    locale?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class WorkspaceSettings extends Entity<WorkspaceSettingsProps> {
    constructor(props: WorkspaceSettingsProps);
    static create(props: Omit<WorkspaceSettingsProps, "id" | "createdAt" | "updatedAt">): WorkspaceSettings;
    update(props: Partial<Omit<WorkspaceSettingsProps, "id" | "workspaceId" | "createdAt">>): WorkspaceSettings;
}

type AuditAction = "WORKSPACE_CREATED" | "WORKSPACE_UPDATED" | "WORKSPACE_ARCHIVED" | "WORKSPACE_UNARCHIVED" | "WORKSPACE_DELETED" | "MEMBER_INVITED" | "MEMBER_JOINED" | "MEMBER_REMOVED" | "MEMBER_ROLE_CHANGED" | "PROJECT_CREATED" | "PROJECT_DELETED" | "SETTINGS_UPDATED";
interface WorkspaceAuditLogProps extends EntityProps {
    workspaceId: string;
    actorId?: string;
    action: AuditAction;
    payload?: Record<string, unknown>;
    createdAt?: Date;
}
declare class WorkspaceAuditLog extends Entity<WorkspaceAuditLogProps> {
    constructor(props: WorkspaceAuditLogProps);
    static create(props: Omit<WorkspaceAuditLogProps, "id" | "createdAt">): WorkspaceAuditLog;
}

/**
 * Workspace member with associated user information.
 *
 * Used for member listings to include user profile data.
 */
interface MemberWithUser {
    /** The unique identifier of the user */
    userId: string;
    /** The member's role in the workspace */
    role: MemberRole;
    /** User profile information */
    user: {
        /** The user's unique identifier */
        id: string;
        /** The user's display name */
        name: string | null;
        /** The user's email address */
        email: string | null;
        /** The user's profile image URL */
        image: string | null;
    };
}
/**
 * Repository interface for Workspace entity.
 *
 * Provides data access methods for workspace persistence,
 * member management, and soft delete functionality.
 *
 * @example
 * ```typescript
 * class PrismaWorkspaceRepository implements WorkspaceRepository {
 *   async create(workspace: Workspace): Promise<Workspace> {
 *     const created = await prisma.workspace.create({
 *       data: workspace.toJSON()
 *     });
 *     return Workspace.fromPrisma(created);
 *   }
 *   // ... other methods
 * }
 * ```
 */
interface WorkspaceRepository {
    /**
     * Creates a new workspace.
     *
     * @param workspace - The workspace entity to create
     * @returns Promise that resolves to the created workspace
     * @throws {Error} If validation fails or database operation fails
     *
     * @example
     * ```typescript
     * const workspace = new Workspace({
     *   name: 'My Workspace',
     *   type: WorkspaceType.PERSONAL,
     *   ownerId: 'user-123'
     * });
     * const created = await repository.create(workspace);
     * ```
     */
    create(workspace: Workspace): Promise<Workspace>;
    /**
     * Finds a workspace by its unique ID.
     *
     * @param id - The unique identifier of the workspace
     * @returns Promise that resolves to the workspace if found, null otherwise
     *
     * @example
     * ```typescript
     * const workspace = await repository.findById('workspace-123');
     * if (workspace) {
     *   console.log(workspace.name);
     * }
     * ```
     */
    findById(id: string): Promise<Workspace | null>;
    /**
     * Finds a workspace by its unique slug and owner.
     *
     * Used for shareable workspace URLs (e.g., /workspace/my-project).
     * Requires ownerId to prevent accessing workspaces with duplicate slugs
     * owned by different users.
     *
     * @param slug - The unique URL-friendly slug of the workspace
     * @param ownerId - The unique identifier of the workspace owner
     * @returns Promise that resolves to the workspace if found, null otherwise
     *
     * @example
     * ```typescript
     * const workspace = await repository.findBySlug('my-project', 'user-123');
     * if (workspace) {
     *   console.log(workspace.name);
     * }
     * ```
     */
    findBySlug(slug: string, ownerId: string): Promise<Workspace | null>;
    /**
     * Finds a workspace by owner ID and slug with complete statistics.
     *
     * Used for public workspace pages (e.g., /username/workspace-slug) where
     * full workspace data with stats (projects, members, tasks) is needed.
     *
     * Returns workspace data with:
     * - Owner information (id, username, name, email)
     * - Stats (projectCount, memberCount, taskCount)
     * - All workspace properties
     *
     * @param ownerId - The unique identifier of the workspace owner
     * @param slug - The unique URL-friendly slug of the workspace
     * @returns Promise that resolves to workspace with stats if found, null otherwise
     *
     * @example
     * ```typescript
     * const workspace = await repository.findByOwnerAndSlugWithStats('user-123', 'my-project');
     * if (workspace) {
     *   console.log(`${workspace.name}: ${workspace.stats.projectCount} projects`);
     * }
     * ```
     */
    findByOwnerAndSlugWithStats(ownerId: string, slug: string): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        tier: string;
        color: string;
        icon: string | null;
        ownerId: string;
        owner: {
            id: string;
            username: string;
            name: string | null;
            email: string | null;
        };
        isArchived: boolean;
        createdAt: Date;
        updatedAt: Date;
        stats: {
            projectCount: number;
            memberCount: number;
            taskCount: number;
        };
    } | null>;
    /**
     * Finds all workspaces owned by a specific user.
     *
     * @param ownerId - The unique identifier of the workspace owner
     * @returns Promise that resolves to an array of workspaces
     *
     * @example
     * ```typescript
     * const ownedWorkspaces = await repository.findByOwnerId('user-123');
     * ```
     */
    findByOwnerId(ownerId: string): Promise<Workspace[]>;
    /**
     * Finds all workspaces where the user is a member (including owner).
     *
     * Includes:
     * - Personal workspaces owned by the user
     * - Team workspaces where the user is a member
     *
     * @param userId - The unique identifier of the user
     * @returns Promise that resolves to an array of workspaces
     *
     * @example
     * ```typescript
     * const allWorkspaces = await repository.findByUserId('user-123');
     * ```
     */
    findByUserId(userId: string): Promise<Workspace[]>;
    /**
     * Finds all soft-deleted workspaces for a user.
     *
     * Useful for implementing a "trash" or "recycle bin" feature.
     *
     * @param userId - The unique identifier of the user
     * @returns Promise that resolves to an array of deleted workspaces
     *
     * @example
     * ```typescript
     * const deletedWorkspaces = await repository.findDeleted('user-123');
     * ```
     */
    findDeleted(userId: string): Promise<Workspace[]>;
    /**
     * Updates an existing workspace.
     *
     * @param workspace - The workspace entity with updated properties
     * @returns Promise that resolves to the updated workspace
     * @throws {Error} If the workspace doesn't exist or validation fails
     *
     * @example
     * ```typescript
     * const updated = workspace.clone({ name: 'Updated Name' });
     * await repository.update(updated);
     * ```
     */
    update(workspace: Workspace): Promise<Workspace>;
    /**
     * Alias for softDelete. Maintains compatibility with code using 'delete' terminology.
     *
     * @param id - The unique identifier of the workspace to delete
     * @returns Promise that resolves when the workspace is deleted
     * @see softDelete
     */
    delete(id: string): Promise<void>;
    /**
     * Soft deletes a workspace by marking it as deleted.
     *
     * The workspace remains in the database but is marked as deleted
     * and won't appear in normal queries.
     *
     * @param id - The unique identifier of the workspace to delete
     * @returns Promise that resolves when the workspace is soft deleted
     *
     * @example
     * ```typescript
     * await repository.softDelete('workspace-123');
     * ```
     */
    softDelete(id: string): Promise<void>;
    /**
     * Restores a previously soft-deleted workspace.
     *
     * @param id - The unique identifier of the workspace to restore
     * @returns Promise that resolves when the workspace is restored
     *
     * @example
     * ```typescript
     * await repository.restore('workspace-123');
     * ```
     */
    restore(id: string): Promise<void>;
    /**
     * Permanently deletes a workspace (hard delete).
     *
     * WARNING: This operation cannot be undone. Use softDelete
     * unless you absolutely need to permanently remove the workspace.
     *
     * @param id - The unique identifier of the workspace to delete
     * @returns Promise that resolves when the workspace is permanently deleted
     *
     * @example
     * ```typescript
     * await repository.permanentDelete('workspace-123');
     * ```
     */
    permanentDelete(id: string): Promise<void>;
    /**
     * Adds a member to a workspace.
     *
     * @param member - The workspace member entity (userId, workspaceId, role)
     * @returns Promise that resolves to the created member
     * @throws {Error} If the user is already a member or validation fails
     *
     * @example
     * ```typescript
     * const member = new WorkspaceMember({
     *   workspaceId: 'workspace-123',
     *   userId: 'user-456',
     *   role: MemberRole.MEMBER
     * });
     * await repository.addMember(member);
     * ```
     */
    addMember(member: WorkspaceMember): Promise<WorkspaceMember>;
    /**
     * Removes a member from a workspace.
     *
     * @param workspaceId - The unique identifier of the workspace
     * @param userId - The unique identifier of the user to remove
     * @returns Promise that resolves when the member is removed
     *
     * @example
     * ```typescript
     * await repository.removeMember('workspace-123', 'user-456');
     * ```
     */
    removeMember(workspaceId: string, userId: string): Promise<void>;
    /**
     * Finds a specific member in a workspace.
     *
     * @param workspaceId - The unique identifier of the workspace
     * @param userId - The unique identifier of the user
     * @returns Promise that resolves to the member if found, null otherwise
     *
     * @example
     * ```typescript
     * const member = await repository.findMember('workspace-123', 'user-456');
     * if (member) {
     *   console.log(member.role);
     * }
     * ```
     */
    findMember(workspaceId: string, userId: string): Promise<WorkspaceMember | null>;
    /**
     * Lists all members of a workspace.
     *
     * @param workspaceId - The unique identifier of the workspace
     * @returns Promise that resolves to an array of workspace members
     *
     * @example
     * ```typescript
     * const members = await repository.listMembers('workspace-123');
     * members.forEach(member => {
     *   console.log(`${member.userId}: ${member.role}`);
     * });
     * ```
     */
    listMembers(workspaceId: string): Promise<WorkspaceMember[]>;
    /**
     * Lists all members of a workspace with user profile information.
     *
     * Includes user details (name, email, image) for display purposes.
     *
     * @param workspaceId - The unique identifier of the workspace
     * @returns Promise that resolves to an array of members with user info
     *
     * @example
     * ```typescript
     * const members = await repository.listMembersWithUser('workspace-123');
     * members.forEach(member => {
     *   console.log(`${member.user.name}: ${member.role}`);
     * });
     * ```
     */
    listMembersWithUser(workspaceId: string): Promise<MemberWithUser[]>;
}

/**
 * Repository interface for WorkspaceSettings entity persistence operations.
 *
 * This interface defines the contract for workspace settings data access, providing methods
 * for managing workspace-level preferences and configurations. Settings control workspace-wide
 * behaviors such as default task views, notification preferences, and collaboration features.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaWorkspaceSettingsRepository implements WorkspaceSettingsRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async findByWorkspaceId(workspaceId: string): Promise<WorkspaceSettings | null> {
 *     const data = await this.prisma.workspaceSettings.findUnique({
 *       where: { workspaceId }
 *     });
 *     return data ? new WorkspaceSettings(data) : null;
 *   }
 *
 *   async upsert(settings: WorkspaceSettings): Promise<WorkspaceSettings> {
 *     const data = await this.prisma.workspaceSettings.upsert({
 *       where: { workspaceId: settings.workspaceId },
 *       update: {
 *         defaultTaskView: settings.defaultTaskView,
 *         enableNotifications: settings.enableNotifications,
 *         allowGuestAccess: settings.allowGuestAccess
 *       },
 *       create: {
 *         id: settings.id,
 *         workspaceId: settings.workspaceId,
 *         defaultTaskView: settings.defaultTaskView,
 *         enableNotifications: settings.enableNotifications,
 *         allowGuestAccess: settings.allowGuestAccess,
 *         createdAt: settings.createdAt,
 *         updatedAt: settings.updatedAt
 *       }
 *     });
 *     return new WorkspaceSettings(data);
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/workspace-settings.entity.ts | WorkspaceSettings entity}
 */
interface WorkspaceSettingsRepository {
    /**
     * Retrieves settings for a specific workspace.
     *
     * Used for loading workspace configuration when a user opens a workspace or when
     * workspace-wide preferences need to be accessed. Returns null if settings haven't
     * been customized (default settings should be used).
     *
     * @param workspaceId - The workspace ID to find settings for
     * @returns Promise resolving to the workspace settings if found, null otherwise
     *
     * @example
     * ```typescript
     * const settings = await repository.findByWorkspaceId('workspace-123');
     * if (settings) {
     *   console.log(`Default task view: ${settings.defaultTaskView}`);
     *   console.log(`Notifications: ${settings.enableNotifications ? 'enabled' : 'disabled'}`);
     *   console.log(`Guest access: ${settings.allowGuestAccess ? 'allowed' : 'not allowed'}`);
     * } else {
     *   console.log('Using default workspace settings');
     * }
     * ```
     */
    findByWorkspaceId(workspaceId: string): Promise<WorkspaceSettings | null>;
    /**
     * Creates or updates workspace settings.
     *
     * Used when saving workspace configuration changes. If settings don't exist for the
     * workspace, they are created. If they exist, they are updated (upsert operation).
     * This is the preferred method for persisting settings as it handles both cases.
     *
     * @param settings - The workspace settings entity to save (must be valid)
     * @returns Promise resolving to the saved or updated settings
     * @throws {Error} If settings validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * const settings = new WorkspaceSettings({
     *   workspaceId: 'workspace-123',
     *   defaultTaskView: 'BOARD',
     *   enableNotifications: true,
     *   allowGuestAccess: false,
     *   defaultRole: 'MEMBER',
     *   taskRetentionDays: 90
     * });
     *
     * const saved = await repository.upsert(settings);
     * console.log('Workspace settings saved');
     * console.log(`Default view: ${saved.defaultTaskView}`);
     * ```
     */
    upsert(settings: WorkspaceSettings): Promise<WorkspaceSettings>;
    /**
     * Deletes settings for a workspace.
     *
     * Used when resetting workspace settings to defaults or when deleting a workspace.
     * After deletion, the workspace will revert to using default settings.
     *
     * @param workspaceId - The workspace ID to delete settings for
     * @returns Promise resolving when the deletion is complete
     * @throws {NotFoundException} If the settings don't exist
     *
     * @example
     * ```typescript
     * // Reset workspace settings to defaults
     * await repository.delete('workspace-123');
     * console.log('Workspace settings reset to defaults');
     *
     * // On next access, default settings will be used
     * const settings = await repository.findByWorkspaceId('workspace-123');
     * if (!settings) {
     *   console.log('Using default workspace settings');
     * }
     * ```
     */
    delete(workspaceId: string): Promise<void>;
}

/**
 * Repository interface for WorkspaceAuditLog entity persistence operations.
 *
 * This interface defines the contract for workspace audit trail data access, providing
 * methods for recording and querying workspace activity logs. Audit logs track important
 * events such as membership changes, permission updates, invitations, and settings modifications.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaWorkspaceAuditLogRepository implements WorkspaceAuditLogRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async create(log: WorkspaceAuditLog): Promise<WorkspaceAuditLog> {
 *     const data = await this.prisma.workspaceAuditLog.create({
 *       data: {
 *         id: log.id,
 *         workspaceId: log.workspaceId,
 *         action: log.action,
 *         actorId: log.actorId,
 *         targetId: log.targetId,
 *         targetType: log.targetType,
 *         metadata: log.metadata,
 *         createdAt: log.createdAt
 *       }
 *     });
 *     return new WorkspaceAuditLog(data);
 *   }
 *
 *   async findByWorkspaceId(
 *     workspaceId: string,
 *     limit = 50,
 *     offset = 0
 *   ): Promise<WorkspaceAuditLog[]> {
 *     const logs = await this.prisma.workspaceAuditLog.findMany({
 *       where: { workspaceId },
 *       orderBy: { createdAt: 'desc' },
 *       take: limit,
 *       skip: offset
 *     });
 *     return logs.map(l => new WorkspaceAuditLog(l));
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/workspace-audit-log.entity.ts | WorkspaceAuditLog entity}
 */
interface WorkspaceAuditLogRepository {
    /**
     * Creates a new audit log entry.
     *
     * Used for recording important workspace events and actions, such as member additions,
     * role changes, permission updates, invitation acceptance/rejection, and settings changes.
     * Each log entry captures who did what, when, and to what target.
     *
     * @param log - The audit log entry to create (must be valid)
     * @returns Promise resolving to the created audit log entry
     * @throws {Error} If log validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * const log = new WorkspaceAuditLog({
     *   workspaceId: 'workspace-123',
     *   action: 'MEMBER_ADDED',
     *   actorId: 'user-456',
     *   targetId: 'user-789',
     *   targetType: 'USER',
     *   metadata: {
     *     role: 'MEMBER',
     *     invitedBy: 'user-456'
     *   }
     * });
     *
     * const created = await repository.create(log);
     * console.log(`Audit log created: ${created.action} by ${created.actorId}`);
     * ```
     */
    create(log: WorkspaceAuditLog): Promise<WorkspaceAuditLog>;
    /**
     * Retrieves audit logs for a specific workspace.
     *
     * Used for displaying workspace activity history, such as in an "Activity Log" or
     * "Audit Trail" view. Returns logs ordered by most recent first. Supports pagination
     * for handling large numbers of log entries.
     *
     * @param workspaceId - The workspace ID to fetch audit logs for
     * @param limit - Maximum number of log entries to return (default: 50)
     * @param offset - Number of entries to skip for pagination (default: 0)
     * @returns Promise resolving to an array of audit log entries (empty array if none found)
     *
     * @example
     * ```typescript
     * // Get the 50 most recent log entries
     * const recentLogs = await repository.findByWorkspaceId('workspace-123');
     * console.log(`Found ${recentLogs.length} recent activity logs`);
     *
     * // Get paginated logs
     * const page1 = await repository.findByWorkspaceId('workspace-123', 20, 0);
     * const page2 = await repository.findByWorkspaceId('workspace-123', 20, 20);
     *
     * // Display activity timeline
     * recentLogs.forEach(log => {
     *   const timestamp = log.createdAt.toLocaleString();
     *   console.log(`[${timestamp}] ${log.action} on ${log.targetType} ${log.targetId}`);
     * });
     * ```
     */
    findByWorkspaceId(workspaceId: string, limit?: number, offset?: number): Promise<WorkspaceAuditLog[]>;
    /**
     * Counts the total number of audit log entries for a workspace.
     *
     * Used for displaying activity statistics, calculating pagination,
     * or showing metrics like "X activities this month".
     *
     * @param workspaceId - The workspace ID to count audit logs for
     * @returns Promise resolving to the total count of audit log entries
     *
     * @example
     * ```typescript
     * const totalCount = await repository.countByWorkspaceId('workspace-123');
     * console.log(`Total activity log entries: ${totalCount}`);
     *
     * // Calculate pagination
     * const pageSize = 20;
     * const totalPages = Math.ceil(totalCount / pageSize);
     * console.log(`Total pages: ${totalPages}`);
     *
     * // Show activity summary
     * console.log(`Workspace has ${totalCount} recorded activities`);
     * ```
     */
    countByWorkspaceId(workspaceId: string): Promise<number>;
}

/**
 * Input for creating workspace member
 */
interface WorkspaceMemberInput {
    workspaceId: string;
    userId: string;
    role: MemberRole;
}
/**
 * Repository interface for WorkspaceMember domain
 */
interface WorkspaceMemberRepository {
    /**
     * Add member to workspace
     */
    create(input: WorkspaceMemberInput): Promise<WorkspaceMember>;
    /**
     * Get member by ID
     */
    findById(id: string): Promise<WorkspaceMember | null>;
    /**
     * Get member by workspace and user
     */
    findByWorkspaceAndUser(workspaceId: string, userId: string): Promise<WorkspaceMember | null>;
    /**
     * Get all members of a workspace
     */
    findByWorkspace(workspaceId: string): Promise<WorkspaceMember[]>;
    /**
     * Get all workspaces for a user
     */
    findByUser(userId: string): Promise<WorkspaceMember[]>;
    /**
     * Get members by role in workspace
     */
    findByWorkspaceAndRole(workspaceId: string, role: MemberRole): Promise<WorkspaceMember[]>;
    /**
     * Update member role
     */
    updateRole(id: string, role: MemberRole): Promise<WorkspaceMember>;
    /**
     * Remove member from workspace
     */
    delete(id: string): Promise<void>;
    /**
     * Remove member from workspace by workspace and user
     */
    deleteByWorkspaceAndUser(workspaceId: string, userId: string): Promise<void>;
    /**
     * Check if user is member of workspace
     */
    isMember(workspaceId: string, userId: string): Promise<boolean>;
    /**
     * Count members in workspace
     */
    countMembers(workspaceId: string): Promise<number>;
    /**
     * Get workspace owner
     */
    findOwner(workspaceId: string): Promise<WorkspaceMember | null>;
    /**
     * Get workspace admins (including owner)
     */
    findAdmins(workspaceId: string): Promise<WorkspaceMember[]>;
}

declare class CreateWorkspaceUseCase {
    private workspaceRepository;
    private ownerUsername?;
    constructor(workspaceRepository: WorkspaceRepository, ownerUsername?: string | undefined);
    execute(props: Omit<WorkspaceProps, "id" | "slug" | "createdAt" | "updatedAt" | "isArchived" | "isDeleted" | "deletedAt">, ownerUsername?: string): Promise<Workspace>;
    private generateSlug;
}

declare class AddMemberToWorkspaceUseCase {
    private workspaceRepository;
    constructor(workspaceRepository: WorkspaceRepository);
    execute(workspaceId: string, userId: string, role?: MemberRole): Promise<WorkspaceMember>;
}

declare class RemoveMemberFromWorkspaceUseCase {
    private workspaceRepository;
    constructor(workspaceRepository: WorkspaceRepository);
    execute(workspaceId: string, userId: string): Promise<void>;
}

declare class SoftDeleteWorkspaceUseCase {
    private workspaceRepository;
    constructor(workspaceRepository: WorkspaceRepository);
    execute(id: string, userId: string): Promise<void>;
}

declare class RestoreWorkspaceUseCase {
    private workspaceRepository;
    constructor(workspaceRepository: WorkspaceRepository);
    execute(id: string, userId: string): Promise<void>;
}

declare class PermanentDeleteWorkspaceUseCase {
    private workspaceRepository;
    constructor(workspaceRepository: WorkspaceRepository);
    execute(id: string, userId: string): Promise<void>;
}

declare class GetDeletedWorkspacesUseCase {
    private workspaceRepository;
    constructor(workspaceRepository: WorkspaceRepository);
    execute(userId: string): Promise<Workspace[]>;
}

declare class ArchiveWorkspaceUseCase {
    private workspaceRepository;
    constructor(workspaceRepository: WorkspaceRepository);
    execute(id: string, userId: string): Promise<Workspace>;
}

type InviteStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";
interface WorkspaceInvitationProps extends EntityProps {
    workspaceId: string;
    email: string;
    tokenHash: string;
    role: MemberRole;
    status: InviteStatus;
    invitedById?: string;
    expiresAt: Date;
    acceptedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class WorkspaceInvitation extends Entity<WorkspaceInvitationProps> {
    constructor(props: WorkspaceInvitationProps);
    static create(props: Omit<WorkspaceInvitationProps, "id" | "createdAt" | "updatedAt" | "status" | "acceptedAt">): WorkspaceInvitation;
    accept(): WorkspaceInvitation;
    cancel(): WorkspaceInvitation;
    isExpired(): boolean;
}

/**
 * Repository interface for WorkspaceInvitation entity persistence operations.
 *
 * This interface defines the contract for workspace invitation data access, providing methods
 * for creating, finding, and managing workspace member invitations. Invitations are used to
 * invite users to join a workspace via email, with secure token-based acceptance.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaWorkspaceInvitationRepository implements WorkspaceInvitationRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async create(invitation: WorkspaceInvitation): Promise<WorkspaceInvitation> {
 *     const data = await this.prisma.workspaceInvitation.create({
 *       data: {
 *         id: invitation.id,
 *         workspaceId: invitation.workspaceId,
 *         email: invitation.email,
 *         tokenHash: invitation.tokenHash,
 *         role: invitation.role,
 *         invitedBy: invitation.invitedBy,
 *         expiresAt: invitation.expiresAt,
 *         createdAt: invitation.createdAt
 *       }
 *     });
 *     return new WorkspaceInvitation(data);
 *   }
 *
 *   async findPendingInvitations(): Promise<WorkspaceInvitation[]> {
 *     const invitations = await this.prisma.workspaceInvitation.findMany({
 *       where: { status: 'PENDING' }
 *     });
 *     return invitations.map(i => new WorkspaceInvitation(i));
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/workspace-invitation.entity.ts | WorkspaceInvitation entity}
 */
interface WorkspaceInvitationRepository {
    /**
     * Creates a new workspace invitation.
     *
     * Used when a workspace owner or admin invites a new member via email.
     * Generates a secure token that will be sent to the invitee's email for verification.
     *
     * @param invitation - The invitation entity to create (must be valid)
     * @returns Promise resolving to the created invitation with database-generated fields
     * @throws {Error} If invitation validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * const invitation = new WorkspaceInvitation({
     *   workspaceId: 'workspace-123',
     *   email: 'newmember@example.com',
     *   tokenHash: 'hashed_token_here',
     *   role: 'MEMBER',
     *   invitedBy: 'user-456',
     *   expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
     * });
     *
     * const created = await repository.create(invitation);
     * console.log(`Invitation created for ${created.email}`);
     * // Send email with invitation link containing token
     * ```
     */
    create(invitation: WorkspaceInvitation): Promise<WorkspaceInvitation>;
    /**
     * Finds an invitation by its unique ID.
     *
     * Used for retrieving invitation details when the ID is known, such as when
     * an admin views invitation details or when checking invitation status.
     *
     * @param id - The unique identifier of the invitation
     * @returns Promise resolving to the invitation if found, null otherwise
     *
     * @example
     * ```typescript
     * const invitation = await repository.findById('inv-abc-123');
     * if (invitation) {
     *   console.log(`Invitation for ${invitation.email}`);
     *   console.log(`Status: ${invitation.status}`);
     *   console.log(`Role: ${invitation.role}`);
     * } else {
     *   console.log('Invitation not found');
     * }
     * ```
     */
    findById(id: string): Promise<WorkspaceInvitation | null>;
    /**
     * Finds an invitation by token hash.
     *
     * @deprecated Use findPendingInvitations() instead and compare hashes manually.
     * This method is kept for backward compatibility but won't work with hashed tokens.
     *
     * Previously used for validating invitation tokens when a user clicks an invitation link.
     * Due to bcrypt hashing, direct lookup is not possible. Use findPendingInvitations()
     * and compare the token hashes manually.
     *
     * @param tokenHash - The hashed token to search for
     * @returns Promise resolving to the invitation if found, null otherwise
     * @deprecated Use findPendingInvitations() and verify tokens manually
     */
    findByToken(tokenHash: string): Promise<WorkspaceInvitation | null>;
    /**
     * Finds all pending invitations for hash comparison.
     *
     * Used when validating invitation tokens. Since tokens are hashed using bcrypt for security,
     * we need to fetch all pending invitations and manually compare the token hash using
     * bcrypt.compare(). This is intentional for security reasons.
     *
     * @returns Promise resolving to an array of pending invitations (empty array if none found)
     *
     * @example
     * ```typescript
     * // When a user clicks an invitation link with a token
     * const token = request.query.token as string;
     * const pendingInvitations = await repository.findPendingInvitations();
     *
     * // Find matching invitation by comparing hashes
     * let matchingInvitation: WorkspaceInvitation | null = null;
     * for (const invitation of pendingInvitations) {
     *   const isValid = await bcrypt.compare(token, invitation.tokenHash);
     *   if (isValid) {
     *     matchingInvitation = invitation;
     *     break;
     *   }
     * }
     *
     * if (matchingInvitation) {
     *   console.log(`Valid invitation found for ${matchingInvitation.email}`);
     *   // Proceed with invitation acceptance
     * } else {
     *   console.log('Invalid or expired invitation token');
     * }
     * ```
     */
    findPendingInvitations(): Promise<WorkspaceInvitation[]>;
    /**
     * Finds all invitations for a specific workspace.
     *
     * Used for displaying the invitation list in workspace settings, showing all
     * pending, accepted, and expired invitations for that workspace.
     *
     * @param workspaceId - The workspace ID to find invitations for
     * @returns Promise resolving to an array of invitations (empty array if none found)
     *
     * @example
     * ```typescript
     * const invitations = await repository.findByWorkspaceId('workspace-123');
     * console.log(`Found ${invitations.length} invitations`);
     *
     * // Group by status
     * const pending = invitations.filter(i => i.status === 'PENDING');
     * const accepted = invitations.filter(i => i.status === 'ACCEPTED');
     * const expired = invitations.filter(i => i.status === 'EXPIRED');
     *
     * console.log(`Pending: ${pending.length}, Accepted: ${accepted.length}, Expired: ${expired.length}`);
     * ```
     */
    findByWorkspaceId(workspaceId: string): Promise<WorkspaceInvitation[]>;
    /**
     * Finds all invitations for a specific email address.
     *
     * Used for displaying invitations sent to a particular email, such as when a user
     * checks their pending invitations or when preventing duplicate invitations.
     *
     * @param email - The email address to find invitations for
     * @returns Promise resolving to an array of invitations (empty array if none found)
     *
     * @example
     * ```typescript
     * const invitations = await repository.findByEmail('user@example.com');
     * console.log(`Found ${invitations.length} invitations for this email`);
     *
     * // Show pending invitations
     * const pending = invitations.filter(i => i.status === 'PENDING' && !i.isExpired());
     * pending.forEach(invitation => {
     *   console.log(`${invitation.workspaceId} - ${invitation.role}`);
     * });
     *
     * // Check for duplicate before sending new invitation
     * const existingPending = invitations.find(i =>
     *   i.status === 'PENDING' &&
     *   i.workspaceId === newWorkspaceId &&
     *   !i.isExpired()
     * );
     * if (existingPending) {
     *   console.log('User already has a pending invitation for this workspace');
     * }
     * ```
     */
    findByEmail(email: string): Promise<WorkspaceInvitation[]>;
    /**
     * Updates an existing invitation.
     *
     * Used when modifying invitation details, such as changing status (PENDING → ACCEPTED),
     * updating role, or extending expiration date.
     *
     * @param invitation - The invitation entity with updated fields
     * @returns Promise resolving to the updated invitation
     * @throws {NotFoundException} If the invitation doesn't exist
     * @throws {Error} If validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * const existing = await repository.findById('inv-123');
     * if (existing) {
     *   const accepted = existing.clone({
     *     status: 'ACCEPTED',
     *     acceptedAt: new Date(),
     *     acceptedBy: 'user-789'
     *   });
     *   await repository.update(accepted);
     *   console.log('Invitation accepted');
     *
     *   // Add user to workspace members
     *   await addWorkspaceMember(existing.workspaceId, acceptedBy, existing.role);
     * }
     * ```
     */
    update(invitation: WorkspaceInvitation): Promise<WorkspaceInvitation>;
    /**
     * Deletes an invitation.
     *
     * Used when revoking an invitation, cleaning up expired invitations, or when
     * a user declines an invitation (mark as declined or delete).
     *
     * @param id - The unique identifier of the invitation to delete
     * @returns Promise resolving when the deletion is complete
     * @throws {NotFoundException} If the invitation doesn't exist
     *
     * @example
     * ```typescript
     * // Revoke a pending invitation
     * await repository.delete('inv-abc-123');
     * console.log('Invitation revoked');
     *
     * // Cleanup expired invitations
     * const invitations = await repository.findByWorkspaceId('workspace-123');
     * for (const invitation of invitations) {
     *   if (invitation.isExpired()) {
     *     await repository.delete(invitation.id);
     *     console.log(`Deleted expired invitation for ${invitation.email}`);
     *   }
     * }
     * ```
     */
    delete(id: string): Promise<void>;
}

declare class InviteMemberUseCase {
    private workspaceRepository;
    private invitationRepository;
    private hashService;
    constructor(workspaceRepository: WorkspaceRepository, invitationRepository: WorkspaceInvitationRepository, hashService: HashService);
    execute(workspaceId: string, email: string, role: MemberRole, invitedById: string): Promise<{
        invitation: WorkspaceInvitation;
        token: string;
    }>;
}

declare class AcceptInvitationUseCase {
    private workspaceRepository;
    private invitationRepository;
    private hashService;
    constructor(workspaceRepository: WorkspaceRepository, invitationRepository: WorkspaceInvitationRepository, hashService: HashService);
    execute(token: string, userId: string): Promise<void>;
}

interface UpdateWorkspaceSettingsInput {
    workspaceId: string;
    defaultView?: ViewType;
    defaultDueTime?: number;
    timezone?: string;
    locale?: string;
}
declare class UpdateWorkspaceSettingsUseCase {
    private readonly settingsRepository;
    constructor(settingsRepository: WorkspaceSettingsRepository);
    execute(input: UpdateWorkspaceSettingsInput): Promise<WorkspaceSettings>;
}

interface GetWorkspaceSettingsInput {
    workspaceId: string;
}
declare class GetWorkspaceSettingsUseCase {
    private readonly settingsRepository;
    constructor(settingsRepository: WorkspaceSettingsRepository);
    execute(input: GetWorkspaceSettingsInput): Promise<WorkspaceSettings | null>;
}

interface CreateAuditLogInput {
    workspaceId: string;
    actorId?: string;
    action: AuditAction;
    payload?: Record<string, unknown>;
}
declare class CreateAuditLogUseCase {
    private readonly auditLogRepository;
    constructor(auditLogRepository: WorkspaceAuditLogRepository);
    execute(input: CreateAuditLogInput): Promise<WorkspaceAuditLog>;
}

interface GetWorkspaceAuditLogsInput {
    workspaceId: string;
    limit?: number;
    offset?: number;
}
interface GetWorkspaceAuditLogsOutput {
    logs: WorkspaceAuditLog[];
    total: number;
}
declare class GetWorkspaceAuditLogsUseCase {
    private readonly auditLogRepository;
    constructor(auditLogRepository: WorkspaceAuditLogRepository);
    execute(input: GetWorkspaceAuditLogsInput): Promise<GetWorkspaceAuditLogsOutput>;
}

interface ProjectProps extends EntityProps {
    name: string;
    slug: string;
    description?: string;
    color: string;
    icon?: string;
    workspaceId: string;
    workflowId: string;
    position: number;
    archived: boolean;
    completed: boolean;
    completedAt?: Date;
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class Project extends Entity<ProjectProps> {
    constructor(props: ProjectProps);
    static create(props: Omit<ProjectProps, "id" | "createdAt" | "updatedAt" | "position" | "archived" | "completed" | "completedAt" | "isDeleted" | "deletedAt">): Project;
    update(props: Partial<Omit<ProjectProps, "id" | "workspaceId" | "createdAt" | "workflowId">>): Project;
    archive(): Project;
    unarchive(): Project;
    complete(): Project;
    uncomplete(): Project;
    softDelete(): Project;
    restore(): Project;
}

/**
 * Repository interface for Project entity persistence operations.
 *
 * This interface defines the contract for Project data access, providing CRUD operations
 * plus specialized methods for soft-deletion, slug-based lookup, and recovery of deleted projects.
 * Implementations should handle database-specific details while maintaining this clean interface.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaProjectRepository implements ProjectRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async create(project: Project): Promise<Project> {
 *     const data = await this.prisma.project.create({
 *       data: {
 *         id: project.id,
 *         name: project.name,
 *         slug: project.slug,
 *         description: project.description,
 *         color: project.color,
 *         icon: project.icon,
 *         workflowId: project.workflowId,
 *         status: project.status,
 *         startDate: project.startDate,
 *         endDate: project.endDate,
 *         workspaceId: project.workspaceId,
 *         ownerId: project.ownerId,
 *         createdAt: project.createdAt,
 *         updatedAt: project.updatedAt,
 *       }
 *     });
 *     return new Project(data);
 *   }
 *
 *   async findById(id: string): Promise<Project | null> {
 *     const data = await this.prisma.project.findUnique({ where: { id } });
 *     return data ? new Project(data) : null;
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/project.entity.ts | Project entity}
 */
interface ProjectRepository {
    /**
     * Creates a new project in the repository.
     *
     * Used when creating a new project through the UI or API.
     * The project should have all required fields populated before calling this method.
     *
     * @param project - The project entity to create (must be valid)
     * @returns Promise resolving to the created project with any database-generated fields populated
     * @throws {Error} If project validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * const project = new Project({
     *   name: 'Website Redesign',
     *   slug: 'website-redesign',
     *   workspaceId: 'workspace-123',
     *   ownerId: 'user-456',
     *   status: 'ACTIVE'
     * });
     *
     * const created = await repository.create(project);
     * console.log(`Project created with ID: ${created.id}`);
     * ```
     */
    create(project: Project): Promise<Project>;
    /**
     * Finds a project by its unique ID.
     *
     * Used for fetching project details when the ID is known, such as from a URL parameter
     * or after creating/updating a project.
     *
     * @param id - The unique identifier of the project
     * @returns Promise resolving to the project if found, null otherwise
     *
     * @example
     * ```typescript
     * const project = await repository.findById('proj-123');
     * if (project) {
     *   console.log(`Found project: ${project.name}`);
     * } else {
     *   console.log('Project not found');
     * }
     * ```
     */
    findById(id: string): Promise<Project | null>;
    /**
     * Finds a project by its slug within a specific workspace.
     *
     * Used for human-readable project URLs, such as `/workflows/:workflowSlug/projects/:projectSlug`.
     * Slug lookups are scoped to a workspace to allow duplicate slugs across different workspaces.
     *
     * @param slug - The URL-friendly slug identifier
     * @param workspaceId - The workspace ID to scope the search to
     * @returns Promise resolving to the project if found, null otherwise
     * @throws {Error} If workspaceId is not provided
     *
     * @example
     * ```typescript
     * const project = await repository.findBySlug('website-redesign', 'workspace-123');
     * // Returns the project with that slug in the specified workspace
     * ```
     */
    findBySlug(slug: string, workspaceId: string): Promise<Project | null>;
    /**
     * Finds all projects that belong to a specific workspace.
     *
     * Used for displaying the project list within a workflow or workspace view.
     * Returns projects in the order specified by the workspace (typically by position/createdAt).
     *
     * @param workspaceId - The workspace ID to filter projects by
     * @returns Promise resolving to an array of projects in the workspace (empty array if none found)
     *
     * @example
     * ```typescript
     * const projects = await repository.findByWorkspaceId('workflow-123');
     * console.log(`Found ${projects.length} projects in workflow`);
     *
     * // Render project list
     * projects.forEach(project => {
     *   console.log(`- ${project.name} (${project.status})`);
     * });
     * ```
     */
    findByWorkspaceId(workspaceId: string): Promise<Project[]>;
    /**
     * Finds all projects owned by a specific user across all workspaces.
     *
     * Used for dashboard widgets showing "My Projects" or for user profile pages.
     * Includes projects from all workspaces where the user is the owner.
     *
     * @param userId - The user ID to filter projects by
     * @returns Promise resolving to an array of projects owned by the user (empty array if none found)
     *
     * @example
     * ```typescript
     * const projects = await repository.findAllByUserId('user-456');
     * console.log(`User owns ${projects.length} projects`);
     *
     * // Group by workspace
     * const byWorkspace = projects.reduce((acc, project) => {
     *   (acc[project.workflowId] ||= []).push(project);
     *   return acc;
     * }, {} as Record<string, Project[]>);
     * ```
     */
    findAllByUserId(userId: string): Promise<Project[]>;
    /**
     * Updates an existing project in the repository.
     *
     * Used when modifying project details such as name, description, status, or dates.
     * The project entity should already exist and be valid before calling this method.
     *
     * @param project - The project entity with updated fields
     * @returns Promise resolving to the updated project
     * @throws {NotFoundException} If the project doesn't exist
     * @throws {Error} If validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * const existing = await repository.findById('proj-123');
     * if (existing) {
     *   const updated = existing.clone({
     *     status: 'COMPLETED',
     *     endDate: new Date()
     *   });
     *   await repository.update(updated);
     * }
     * ```
     */
    update(project: Project): Promise<Project>;
    /**
     * Permanently deletes a project from the repository.
     *
     * WARNING: This operation is irreversible. All associated tasks, comments, and attachments
     * will be deleted. Consider using softDelete() instead for safer deletion with recovery.
     *
     * @param id - The unique identifier of the project to delete
     * @returns Promise resolving when the deletion is complete
     * @throws {NotFoundException} If the project doesn't exist
     *
     * @example
     * ```typescript
     * // ⚠️ Use with caution - permanent deletion
     * await repository.delete('proj-123');
     * console.log('Project permanently deleted');
     * ```
     */
    delete(id: string): Promise<void>;
    /**
     * Soft deletes a project by marking it as deleted without removing it from the database.
     *
     * This is the preferred deletion method as it allows for recovery and maintains data integrity.
     * The project won't appear in normal queries but can be restored if needed.
     *
     * @param id - The unique identifier of the project to soft delete
     * @returns Promise resolving when the soft deletion is complete
     * @throws {NotFoundException} If the project doesn't exist
     *
     * @example
     * ```typescript
     * // Soft delete (recommended)
     * await repository.softDelete('proj-123');
     * console.log('Project moved to trash');
     *
     * // Later restore if needed
     * await repository.restore('proj-123');
     * ```
     */
    softDelete(id: string): Promise<void>;
    /**
     * Restores a previously soft-deleted project.
     *
     * Used when a user wants to recover a project from the trash/bin.
     * The project will appear in normal queries again after restoration.
     *
     * @param id - The unique identifier of the project to restore
     * @returns Promise resolving when the restoration is complete
     * @throws {NotFoundException} If the project doesn't exist or wasn't deleted
     *
     * @example
     * ```typescript
     * await repository.restore('proj-123');
     * console.log('Project restored from trash');
     * ```
     */
    restore(id: string): Promise<void>;
    /**
     * Permanently deletes a soft-deleted project from the repository.
     *
     * This operation is irreversible and should only be used after a project has been soft deleted
     * and the user confirms they want to permanently remove it (e.g., "Empty Trash" action).
     *
     * @param id - The unique identifier of the project to permanently delete
     * @returns Promise resolving when the permanent deletion is complete
     * @throws {NotFoundException} If the project doesn't exist
     *
     * @example
     * ```typescript
     * // Empty trash - permanently delete all soft-deleted projects
     * const deletedProjects = await repository.findDeleted('workspace-123');
     * for (const project of deletedProjects) {
     *   await repository.permanentDelete(project.id);
     * }
     * ```
     */
    permanentDelete(id: string): Promise<void>;
    /**
     * Finds all soft-deleted projects in a workspace.
     *
     * Used for displaying the trash/bin view where users can see and restore deleted projects.
     * Only returns projects that have been soft deleted, not permanently deleted ones.
     *
     * @param workspaceId - The workspace ID to filter deleted projects by
     * @returns Promise resolving to an array of soft-deleted projects (empty array if none found)
     *
     * @example
     * ```typescript
     * const deletedProjects = await repository.findDeleted('workspace-123');
     * console.log(`Found ${deletedProjects.length} deleted projects`);
     *
     * // Show trash UI with restore options
     * deletedProjects.forEach(project => {
     *   console.log(`${project.name} - deleted on ${project.deletedAt}`);
     * });
     * ```
     */
    findDeleted(workspaceId: string): Promise<Project[]>;
}

declare class CreateProjectUseCase {
    private projectRepository;
    constructor(projectRepository: ProjectRepository);
    execute(props: Omit<ProjectProps, "id" | "createdAt" | "updatedAt" | "position" | "archived" | "completed" | "completedAt">): Promise<Project>;
}

declare class UpdateProjectUseCase {
    private projectRepository;
    constructor(projectRepository: ProjectRepository);
    execute(id: string, props: Partial<Omit<ProjectProps, "id" | "workspaceId" | "createdAt">>): Promise<Project>;
}

declare class ArchiveProjectUseCase {
    private projectRepository;
    constructor(projectRepository: ProjectRepository);
    execute(id: string): Promise<Project>;
}

declare class DeleteProjectUseCase {
    private projectRepository;
    constructor(projectRepository: ProjectRepository);
    execute(id: string): Promise<void>;
}

declare class SoftDeleteProjectUseCase {
    private projectRepository;
    constructor(projectRepository: ProjectRepository);
    execute(id: string): Promise<void>;
}

declare class RestoreProjectUseCase {
    private projectRepository;
    constructor(projectRepository: ProjectRepository);
    execute(id: string): Promise<void>;
}

declare class PermanentDeleteProjectUseCase {
    private projectRepository;
    constructor(projectRepository: ProjectRepository);
    execute(id: string): Promise<void>;
}

declare class GetDeletedProjectsUseCase {
    private projectRepository;
    constructor(projectRepository: ProjectRepository);
    execute(workspaceId: string): Promise<Project[]>;
}

interface WorkflowProps extends EntityProps {
    name: string;
    description?: string;
    color: string;
    icon?: string;
    workspaceId: string;
    position: number;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class Workflow extends Entity<WorkflowProps> {
    constructor(props: WorkflowProps);
    static create(props: Omit<WorkflowProps, "id" | "createdAt" | "updatedAt" | "position">): Workflow;
    update(props: Partial<Omit<WorkflowProps, "id" | "workspaceId" | "createdAt">>): Workflow;
}

/**
 * Repository interface for Workflow entity persistence operations.
 *
 * This interface defines the contract for Workflow data access, providing CRUD operations
 * for workflows within workspaces. Workflows are organizational units that group projects
 * together (e.g., "Personal", "Work", "Side Projects").
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaWorkflowRepository implements WorkflowRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async save(workflow: Workflow): Promise<void> {
 *     await this.prisma.workflow.create({
 *       data: {
 *         id: workflow.id,
 *         name: workflow.name,
 *         slug: workflow.slug,
 *         workspaceId: workflow.workspaceId,
 *         createdAt: workflow.createdAt,
 *         updatedAt: workflow.updatedAt
 *       }
 *     });
 *   }
 *
 *   async findByWorkspaceId(workspaceId: string): Promise<Workflow[]> {
 *     const workflows = await this.prisma.workflow.findMany({
 *       where: { workspaceId },
 *       orderBy: { createdAt: 'asc' }
 *     });
 *     return workflows.map(w => new Workflow(w));
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/workflow.entity.ts | Workflow entity}
 */
interface WorkflowRepository {
    /**
     * Saves a new workflow to the repository.
     *
     * Used when creating a new workflow through the UI or API.
     * The workflow should have all required fields populated before calling this method.
     *
     * @param workflow - The workflow entity to save (must be valid)
     * @returns Promise resolving when the save is complete
     * @throws {Error} If workflow validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * const workflow = new Workflow({
     *   name: 'Work Projects',
     *   slug: 'work-projects',
     *   workspaceId: 'workspace-123'
     * });
     *
     * await repository.save(workflow);
     * console.log('Workflow created successfully');
     * ```
     */
    save(workflow: Workflow): Promise<void>;
    /**
     * Finds a workflow by its unique ID.
     *
     * Used for fetching workflow details when the ID is known, such as from a URL parameter
     * or after creating/updating a workflow.
     *
     * @param id - The unique identifier of the workflow
     * @returns Promise resolving to the workflow if found, null otherwise
     *
     * @example
     * ```typescript
     * const workflow = await repository.findById('workflow-abc-123');
     * if (workflow) {
     *   console.log(`Found workflow: ${workflow.name}`);
     * } else {
     *   console.log('Workflow not found');
     * }
     * ```
     */
    findById(id: string): Promise<Workflow | null>;
    /**
     * Finds all workflows that belong to a specific workspace.
     *
     * Used for displaying the workflow list in a workspace, such as in the sidebar
     * or workflow selector. Returns workflows in creation order.
     *
     * @param workspaceId - The workspace ID to filter workflows by
     * @returns Promise resolving to an array of workflows in the workspace (empty array if none found)
     *
     * @example
     * ```typescript
     * const workflows = await repository.findByWorkspaceId('workspace-123');
     * console.log(`Found ${workflows.length} workflows in workspace`);
     *
     * // Render workflow navigation
     * workflows.forEach(workflow => {
     *   console.log(`📁 ${workflow.name}`);
     *   // Each workflow contains multiple projects
     * });
     * ```
     */
    findByWorkspaceId(workspaceId: string): Promise<Workflow[]>;
    /**
     * Updates an existing workflow in the repository.
     *
     * Used when modifying workflow details such as name or slug.
     * The workflow entity should already exist and be valid before calling this method.
     *
     * @param workflow - The workflow entity with updated fields
     * @returns Promise resolving when the update is complete
     * @throws {NotFoundException} If the workflow doesn't exist
     * @throws {Error} If validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * const existing = await repository.findById('workflow-123');
     * if (existing) {
     *   const updated = existing.clone({
     *     name: 'Client Projects (Updated)',
     *     slug: 'client-projects-updated'
     *   });
     *   await repository.update(updated);
     *   console.log('Workflow updated successfully');
     * }
     * ```
     */
    update(workflow: Workflow): Promise<void>;
    /**
     * Deletes a workflow from the repository.
     *
     * WARNING: This will also delete all projects within the workflow.
     * Consider moving projects to another workflow or soft-deletion if you want to keep them.
     *
     * @param id - The unique identifier of the workflow to delete
     * @returns Promise resolving when the deletion is complete
     * @throws {NotFoundException} If the workflow doesn't exist
     *
     * @example
     * ```typescript
     * await repository.delete('workflow-123');
     * console.log('Workflow deleted (and all its projects)');
     * ```
     */
    delete(id: string): Promise<void>;
}

interface CreateWorkflowInput {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    workspaceId: string;
}
declare class CreateWorkflowUseCase implements UseCase<CreateWorkflowInput, Workflow> {
    private readonly workflowRepository;
    constructor(workflowRepository: WorkflowRepository);
    execute(input: CreateWorkflowInput): Promise<Workflow>;
}

declare class ListWorkflowsUseCase implements UseCase<string, Workflow[]> {
    private readonly workflowRepository;
    constructor(workflowRepository: WorkflowRepository);
    execute(workspaceId: string): Promise<Workflow[]>;
}

interface UpdateWorkflowInput {
    id: string;
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    position?: number;
}
declare class UpdateWorkflowUseCase implements UseCase<UpdateWorkflowInput, Workflow> {
    private readonly workflowRepository;
    constructor(workflowRepository: WorkflowRepository);
    execute(input: UpdateWorkflowInput): Promise<Workflow>;
}

declare class DeleteWorkflowUseCase implements UseCase<string, void> {
    private readonly workflowRepository;
    constructor(workflowRepository: WorkflowRepository);
    execute(id: string): Promise<void>;
}

/**
 * Repository interface for Tag entity persistence operations.
 *
 * This interface defines the contract for Tag data access, providing CRUD operations
 * plus specialized methods for managing tag-task relationships. Tags are used for
 * categorizing and organizing tasks within workspaces.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaTagRepository implements TagRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async create(tag: Tag): Promise<Tag> {
 *     const data = await this.prisma.tag.create({
 *       data: {
 *         id: tag.id,
 *         name: tag.name,
 *         color: tag.color,
 *         icon: tag.icon,
 *         workspaceId: tag.workspaceId,
 *         createdAt: tag.createdAt,
 *         updatedAt: tag.updatedAt,
 *       }
 *     });
 *     return new Tag(data);
 *   }
 *
 *   async findByWorkspaceId(workspaceId: string): Promise<Tag[]> {
 *     const tags = await this.prisma.tag.findMany({
 *       where: { workspaceId },
 *       orderBy: { name: 'asc' }
 *     });
 *     return tags.map(tag => new Tag(tag));
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/tag.entity.ts | Tag entity}
 */
interface TagRepository {
    /**
     * Creates a new tag in the repository.
     *
     * Used when creating a new tag through the UI or API.
     * The tag should have all required fields populated before calling this method.
     *
     * @param tag - The tag entity to create (must be valid)
     * @returns Promise resolving to the created tag with any database-generated fields populated
     * @throws {Error} If tag validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * const tag = new Tag({
     *   name: 'urgent',
     *   color: '#ef4444',
     *   icon: 'alert-circle',
     *   workspaceId: 'workspace-123'
     * });
     *
     * const created = await repository.create(tag);
     * console.log(`Tag created with ID: ${created.id}`);
     * ```
     */
    create(tag: Tag): Promise<Tag>;
    /**
     * Updates an existing tag in the repository.
     *
     * Used when modifying tag details such as name, color, or icon.
     * The tag entity should already exist and be valid before calling this method.
     *
     * @param tag - The tag entity with updated fields
     * @returns Promise resolving to the updated tag
     * @throws {NotFoundException} If the tag doesn't exist
     * @throws {Error} If validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * const existing = await repository.findById('tag-123');
     * if (existing) {
     *   const updated = existing.clone({
     *     name: 'critical',
     *     color: '#dc2626'
     *   });
     *   await repository.update(updated);
     * }
     * ```
     */
    update(tag: Tag): Promise<Tag>;
    /**
     * Finds a tag by its unique ID.
     *
     * Used for fetching tag details when the ID is known, such as from a URL parameter
     * or after creating/updating a tag.
     *
     * @param id - The unique identifier of the tag
     * @returns Promise resolving to the tag if found, null otherwise
     *
     * @example
     * ```typescript
     * const tag = await repository.findById('tag-123');
     * if (tag) {
     *   console.log(`Found tag: ${tag.name}`);
     * } else {
     *   console.log('Tag not found');
     * }
     * ```
     */
    findById(id: string): Promise<Tag | null>;
    /**
     * Finds all tags that belong to a specific workspace.
     *
     * Used for displaying the tag list in a workspace, such as in tag selectors or filters.
     * Returns tags ordered alphabetically by name for easy browsing.
     *
     * @param workspaceId - The workspace ID to filter tags by
     * @returns Promise resolving to an array of tags in the workspace (empty array if none found)
     *
     * @example
     * ```typescript
     * const tags = await repository.findByWorkspaceId('workspace-123');
     * console.log(`Found ${tags.length} tags in workspace`);
     *
     * // Render tag selector
     * tags.forEach(tag => {
     *   console.log(`${tag.icon} ${tag.name}`);
     * });
     * ```
     */
    findByWorkspaceId(workspaceId: string): Promise<Tag[]>;
    /**
     * Finds all tags in a workspace with their associated task counts.
     *
     * Used for tag lists where you need to show how many tasks each tag has.
     * Returns tags with task count metadata for display purposes.
     *
     * @param workspaceId - The workspace ID to filter tags by
     * @returns Promise resolving to an array of tags with task counts
     *
     * @example
     * ```typescript
     * const tags = await repository.findByWorkspaceIdWithTaskCount('workspace-123');
     * tags.forEach(tag => {
     *   console.log(`${tag.name}: ${tag.taskCount} tasks`);
     * });
     * ```
     */
    findByWorkspaceIdWithTaskCount(workspaceId: string): Promise<Array<{
        id: string;
        name: string;
        color: string;
        workspaceId: string;
        createdAt: Date;
        taskCount: number;
    }>>;
    /**
     * Finds a tag by ID with its associated task count.
     *
     * Used for displaying a single tag with its usage statistics.
     *
     * @param id - The unique identifier of the tag
     * @returns Promise resolving to the tag with task count if found, null otherwise
     *
     * @example
     * ```typescript
     * const tag = await repository.findByIdWithTaskCount('tag-123');
     * if (tag) {
     *   console.log(`${tag.name} is used in ${tag.taskCount} tasks`);
     * }
     * ```
     */
    findByIdWithTaskCount(id: string): Promise<{
        id: string;
        name: string;
        color: string;
        workspaceId: string;
        createdAt: Date;
        taskCount: number;
    } | null>;
    /**
     * Deletes a tag from the repository.
     *
     * WARNING: This will also remove the tag from all tasks that have it assigned.
     * The tag itself is permanently deleted and cannot be recovered.
     *
     * @param id - The unique identifier of the tag to delete
     * @returns Promise resolving when the deletion is complete
     * @throws {NotFoundException} If the tag doesn't exist
     *
     * @example
     * ```typescript
     * await repository.delete('tag-123');
     * console.log('Tag deleted (also removed from all tasks)');
     * ```
     */
    delete(id: string): Promise<void>;
    /**
     * Assigns a tag to a task.
     *
     * Used when a user adds a tag to a task through the UI. This creates a many-to-many
     * relationship between the tag and the task. A task can have multiple tags, and a tag
     * can be assigned to multiple tasks.
     *
     * @param tagId - The unique identifier of the tag to assign
     * @param taskId - The unique identifier of the task to assign the tag to
     * @returns Promise resolving when the assignment is complete
     * @throws {NotFoundException} If the tag or task doesn't exist
     * @throws {Error} If the relationship already exists
     *
     * @example
     * ```typescript
     * // User clicks "Add Tag" on a task
     * await repository.assignToTask('tag-urgent', 'task-456');
     * console.log('Tag assigned to task');
     *
     * // Verify assignment
     * const taskTags = await repository.findByTaskId('task-456');
     * console.log(`Task now has ${taskTags.length} tags`);
     * ```
     */
    assignToTask(tagId: string, taskId: string): Promise<void>;
    /**
     * Removes a tag from a task.
     *
     * Used when a user removes a tag from a task through the UI. This deletes the
     * many-to-many relationship between the tag and the task, but does not delete
     * the tag itself.
     *
     * @param tagId - The unique identifier of the tag to remove
     * @param taskId - The unique identifier of the task to remove the tag from
     * @returns Promise resolving when the removal is complete
     * @throws {NotFoundException} If the relationship doesn't exist
     *
     * @example
     * ```typescript
     * // User clicks "Remove Tag" on a task
     * await repository.removeFromTask('tag-urgent', 'task-456');
     * console.log('Tag removed from task');
     * ```
     */
    removeFromTask(tagId: string, taskId: string): Promise<void>;
    /**
     * Finds all tags assigned to a specific task.
     *
     * Used for displaying the tags on a task card or in the task detail view.
     * Returns only the tags that are actually assigned to the task, not all available tags.
     *
     * @param taskId - The unique identifier of the task to find tags for
     * @returns Promise resolving to an array of tags assigned to the task (empty array if none found)
     *
     * @example
     * ```typescript
     * const tags = await repository.findByTaskId('task-456');
     * console.log(`Task has ${tags.length} tags assigned`);
     *
     * // Display tags on task card
     * tags.forEach(tag => {
     *   console.log(`<Badge color={tag.color}>{tag.name}</Badge>`);
     * });
     * ```
     */
    findByTaskId(taskId: string): Promise<Tag[]>;
}

declare class CreateTagUseCase {
    private tagRepository;
    constructor(tagRepository: TagRepository);
    execute(props: Omit<TagProps, "id" | "createdAt">): Promise<Tag>;
}

declare class AssignTagToTaskUseCase {
    private tagRepository;
    constructor(tagRepository: TagRepository);
    execute(tagId: string, taskId: string): Promise<void>;
}

declare class RemoveTagFromTaskUseCase {
    private tagRepository;
    constructor(tagRepository: TagRepository);
    execute(tagId: string, taskId: string): Promise<void>;
}

declare class UpdateTagUseCase {
    private tagRepository;
    constructor(tagRepository: TagRepository);
    execute(id: string, props: Partial<Omit<TagProps, "id" | "workspaceId" | "createdAt">>): Promise<Tag>;
}

type SessionType = "WORK" | "SHORT_BREAK" | "LONG_BREAK" | "CONTINUOUS";
interface PauseRecord {
    startedAt: Date;
    endedAt: Date;
    duration: number;
}
interface TimeSessionProps extends EntityProps<string> {
    taskId?: string;
    userId: string;
    startedAt: Date;
    endedAt?: Date;
    duration?: number;
    type: SessionType;
    wasCompleted: boolean;
    wasInterrupted: boolean;
    pauseCount?: number;
    totalPauseTime?: number;
    pauseData?: PauseRecord[];
    currentPauseStart?: Date;
    parentSessionId?: string;
    splitReason?: string;
    createdAt?: Date;
}
declare class TimeSession extends Entity<TimeSessionProps> {
    constructor(props: TimeSessionProps);
    static create(props: Omit<TimeSessionProps, "id" | "createdAt" | "wasCompleted" | "wasInterrupted" | "pauseCount" | "totalPauseTime" | "pauseData" | "currentPauseStart">): TimeSession;
    pause(pauseStartedAt?: Date): TimeSession;
    resume(pauseStartedAt: Date, pauseEndedAt?: Date): TimeSession;
    stop(endedAt?: Date, wasCompleted?: boolean, wasInterrupted?: boolean): TimeSession;
    split(endedAt?: Date, wasCompleted?: boolean, splitReason?: string): TimeSession;
    get startedAt(): Date;
    get finishedAt(): Date | undefined;
    get duration(): number;
    get type(): SessionType;
    get wasCompleted(): boolean;
    get userId(): string;
    get taskId(): string | undefined;
}

/**
 * Filter criteria for querying time sessions.
 *
 * Used to find sessions matching specific conditions, such as those for a particular task,
 * of a certain type (work, break), or within a date range.
 *
 * @example
 * ```typescript
 * // Find all completed work sessions for a task in January
 * const filters: SessionFilters = {
 *   taskId: 'task-123',
 *   type: 'WORK',
 *   startDate: new Date('2025-01-01'),
 *   endDate: new Date('2025-01-31'),
 *   completedOnly: true
 * };
 *
 * const sessions = await repository.findWithFilters('user-456', filters, { page: 1, limit: 20 });
 * ```
 */
interface SessionFilters {
    /** Filter sessions associated with a specific task */
    taskId?: string;
    /** Filter sessions by type (WORK, SHORT_BREAK, LONG_BREAK, CONTINUOUS) */
    type?: SessionType;
    /** Filter sessions starting on or after this date */
    startDate?: Date;
    /** Filter sessions starting on or before this date */
    endDate?: Date;
    /** If true, only return completed sessions (with a finished timestamp) */
    completedOnly?: boolean;
}
/**
 * Pagination parameters for querying sessions.
 *
 * Used to control pagination of session queries, allowing efficient retrieval
 * of large datasets in chunks.
 *
 * @example
 * ```typescript
 * const pagination: PaginationParams = {
 *   page: 1,
 *   limit: 20
 * };
 *
 * const result = await repository.findWithFilters('user-123', {}, pagination);
 * console.log(`Showing ${result.sessions.length} of ${result.total} sessions`);
 * ```
 */
interface PaginationParams {
    /** Page number (1-indexed) */
    page: number;
    /** Number of items per page */
    limit: number;
}
/**
 * Paginated result of time sessions query.
 *
 * Contains the session data for the current page along with pagination metadata.
 *
 * @example
 * ```typescript
 * const result: PaginatedSessions = {
 *   sessions: [session1, session2, session3],
 *   total: 45,
 *   page: 1,
 *   limit: 20,
 *   totalPages: 3
 * };
 *
 * console.log(`Page ${result.page} of ${result.totalPages}`);
 * result.sessions.forEach(session => {
 *   console.log(`${session.type}: ${session.duration} minutes`);
 * });
 * ```
 */
interface PaginatedSessions {
    /** Array of sessions for the current page */
    sessions: TimeSession[];
    /** Total number of sessions matching the filter */
    total: number;
    /** Current page number */
    page: number;
    /** Number of items per page */
    limit: number;
    /** Total number of pages */
    totalPages: number;
}
/**
 * Statistics summary for time sessions.
 *
 * Provides aggregated metrics about a user's time tracking, including total work time,
 * break time, pomodoros completed, pauses taken, and breakdowns by session type.
 * Useful for analytics dashboards and productivity reports.
 *
 * @example
 * ```typescript
 * const stats: SessionStats = {
 *   totalSessions: 150,
 *   totalWorkSessions: 100,
 *   totalBreakSessions: 50,
 *   totalMinutesWorked: 2500,
 *   totalBreakMinutes: 200,
 *   pomodorosCompleted: 85,
 *   totalPauses: 25,
 *   totalPauseSeconds: 750,
 *   completedSessions: 140,
 *   byType: {
 *     WORK: { count: 100, totalMinutes: 2500 },
 *     SHORT_BREAK: { count: 35, totalMinutes: 105 },
 *     LONG_BREAK: { count: 15, totalMinutes: 95 },
 *     CONTINUOUS: { count: 0, totalMinutes: 0 }
 *   }
 * };
 *
 * console.log(`Productivity: ${stats.pomodorosCompleted} pomodoros`);
 * console.log(`Focus score: ${(stats.totalMinutesWorked / (stats.totalMinutesWorked + stats.totalBreakMinutes) * 100).toFixed(1)}%`);
 * ```
 */
interface SessionStats {
    /** Total number of sessions (work + break) */
    totalSessions: number;
    /** Total number of work sessions */
    totalWorkSessions: number;
    /** Total number of break sessions (short + long) */
    totalBreakSessions: number;
    /** Total minutes spent in work sessions */
    totalMinutesWorked: number;
    /** Total minutes spent in breaks */
    totalBreakMinutes: number;
    /** Number of completed pomodoro cycles (work + break) */
    pomodorosCompleted: number;
    /** Total number of times user paused a session */
    totalPauses: number;
    /** Total seconds spent in paused state */
    totalPauseSeconds: number;
    /** Number of sessions that were completed (not abandoned) */
    completedSessions: number;
    /** Breakdown of sessions by type */
    byType: {
        /** Work session statistics */
        WORK: {
            count: number;
            totalMinutes: number;
        };
        /** Short break session statistics */
        SHORT_BREAK: {
            count: number;
            totalMinutes: number;
        };
        /** Long break session statistics */
        LONG_BREAK: {
            count: number;
            totalMinutes: number;
        };
        /** Continuous timer session statistics */
        CONTINUOUS: {
            count: number;
            totalMinutes: number;
        };
    };
}
/**
 * Repository interface for TimeSession entity persistence operations.
 *
 * This interface defines the contract for time tracking data access, providing CRUD operations
 * plus specialized methods for finding active sessions, querying by date ranges, calculating
 * statistics, and retrieving sessions with related task and project data.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaTimerRepository implements TimerRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async create(session: TimeSession): Promise<TimeSession> {
 *     const data = await this.prisma.timeSession.create({
 *       data: {
 *         id: session.id,
 *         type: session.type,
 *         startedAt: session.startedAt,
 *         userId: session.userId,
 *         taskId: session.taskId,
 *         // ... other fields
 *       }
 *     });
 *     return new TimeSession(data);
 *   }
 *
 *   async findActiveSession(userId: string): Promise<TimeSession | null> {
 *     const data = await this.prisma.timeSession.findFirst({
 *       where: { userId, finishedAt: null }
 *     });
 *     return data ? new TimeSession(data) : null;
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/time-session.entity.ts | TimeSession entity}
 */
interface TimerRepository {
    /**
     * Creates a new time tracking session in the repository.
     *
     * Used when starting a new work session or break session through the timer UI.
     * The session should have all required fields populated before calling this method.
     *
     * @param session - The time session entity to create (must be valid)
     * @returns Promise resolving to the created session with any database-generated fields populated
     * @throws {Error} If session validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * const session = new TimeSession({
     *   type: 'WORK',
     *   userId: 'user-123',
     *   taskId: 'task-456',
     *   startedAt: new Date(),
     *   duration: 25 * 60 // 25 minutes in seconds
     * });
     *
     * const created = await repository.create(session);
     * console.log(`Session started with ID: ${created.id}`);
     * ```
     */
    create(session: TimeSession): Promise<TimeSession>;
    /**
     * Updates an existing time session in the repository.
     *
     * Used when finishing a session, pausing/resuming, or updating session metadata.
     * The session entity should already exist and be valid before calling this method.
     *
     * @param session - The time session entity with updated fields
     * @returns Promise resolving to the updated session
     * @throws {NotFoundException} If the session doesn't exist
     * @throws {Error} If validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * const existing = await repository.findById('session-123');
     * if (existing) {
     *   const completed = existing.clone({
     *     finishedAt: new Date(),
     *     actualDuration: 1500 // 25 minutes in seconds
     *   });
     *   await repository.update(completed);
     * }
     * ```
     */
    update(session: TimeSession): Promise<TimeSession>;
    /**
     * Finds a time session by its unique ID.
     *
     * Used for fetching session details when the ID is known, such as from a URL parameter
     * or after creating/updating a session.
     *
     * @param id - The unique identifier of the time session
     * @returns Promise resolving to the session if found, null otherwise
     *
     * @example
     * ```typescript
     * const session = await repository.findById('session-123');
     * if (session) {
     *   console.log(`Found ${session.type} session: ${session.duration} minutes`);
     * } else {
     *   console.log('Session not found');
     * }
     * ```
     */
    findById(id: string): Promise<TimeSession | null>;
    /**
     * Finds the currently active session for a user (unfinished session).
     *
     * Used to determine if a user has a timer running. Returns the most recent session
     * that doesn't have a finishedAt timestamp. Should be called when opening the timer
     * UI to check if there's an active session to resume or display.
     *
     * @param userId - The user ID to find the active session for
     * @returns Promise resolving to the active session if found, null otherwise
     *
     * @example
     * ```typescript
     * const activeSession = await repository.findActiveSession('user-123');
     * if (activeSession) {
     *   console.log(`Active ${activeSession.type} session found`);
     *   // Resume session in timer UI
     *   timerUI.resumeSession(activeSession);
     * } else {
     *   console.log('No active session');
     *   // Show "Start Timer" button
     * }
     * ```
     */
    findActiveSession(userId: string): Promise<TimeSession | null>;
    /**
     * Finds all time sessions associated with a specific task.
     *
     * Used for displaying the time history for a task, showing all work sessions
     * and breaks that were tracked for that task.
     *
     * @param taskId - The task ID to find sessions for
     * @returns Promise resolving to an array of sessions for the task (empty array if none found)
     *
     * @example
     * ```typescript
     * const sessions = await repository.findByTaskId('task-456');
     * console.log(`Task has ${sessions.length} time sessions`);
     *
     * // Calculate total time spent on task
     * const totalSeconds = sessions
     *   .filter(s => s.finishedAt)
     *   .reduce((sum, s) => sum + (s.actualDuration || 0), 0);
     * console.log(`Total time: ${Math.floor(totalSeconds / 60)} minutes`);
     * ```
     */
    findByTaskId(taskId: string): Promise<TimeSession[]>;
    /**
     * Finds all time sessions for a user.
     *
     * Used for displaying the user's complete time tracking history, typically in a
     * time log or activity view. Returns all sessions ordered by start date descending.
     *
     * @param userId - The user ID to find sessions for
     * @returns Promise resolving to an array of all sessions for the user (empty array if none found)
     *
     * @example
     * ```typescript
     * const sessions = await repository.findByUserId('user-123');
     * console.log(`User has ${sessions.length} total sessions`);
     *
     * // Group by date
     * const byDate = sessions.reduce((acc, session) => {
     *   const date = session.startedAt.toISOString().split('T')[0];
     *   (acc[date] ||= []).push(session);
     *   return acc;
     * }, {} as Record<string, TimeSession[]>);
     * ```
     */
    findByUserId(userId: string): Promise<TimeSession[]>;
    /**
     * Finds time sessions for a user within a specific date range.
     *
     * Used for analytics, reports, and time tracking views that focus on a specific
     * period (e.g., "This Week", "Last Month", "Custom Range").
     *
     * @param userId - The user ID to find sessions for
     * @param startDate - Start of the date range (inclusive)
     * @param endDate - End of the date range (inclusive)
     * @returns Promise resolving to an array of sessions within the date range (empty array if none found)
     *
     * @example
     * ```typescript
     * // Get sessions for the current week
     * const now = new Date();
     * const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
     * const endOfWeek = new Date(now.setDate(now.getDate() + 6));
     *
     * const sessions = await repository.findByUserIdAndDateRange(
     *   'user-123',
     *   startOfWeek,
     *   endOfWeek
     * );
     *
     * console.log(`Found ${sessions.length} sessions this week`);
     * ```
     */
    findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<TimeSession[]>;
    /**
     * Finds time sessions with advanced filtering and pagination.
     *
     * Used for time session history views with filters, allowing users to search and
     * browse their time tracking data efficiently. Supports filtering by task, type,
     * date range, and completion status.
     *
     * @param userId - The user ID to find sessions for
     * @param filters - Filter criteria to apply (task, type, date range, completion status)
     * @param pagination - Pagination parameters (page, limit)
     * @returns Promise resolving to paginated sessions with metadata
     *
     * @example
     * ```typescript
     * // Find all completed work sessions from January, paginated
     * const result = await repository.findWithFilters(
     *   'user-123',
     *   {
     *     type: 'WORK',
     *     startDate: new Date('2025-01-01'),
     *     endDate: new Date('2025-01-31'),
     *     completedOnly: true
     *   },
     *   { page: 1, limit: 20 }
     * );
     *
     * console.log(`Page ${result.page} of ${result.totalPages}`);
     * console.log(`Showing ${result.sessions.length} of ${result.total} sessions`);
     * ```
     */
    findWithFilters(userId: string, filters: SessionFilters, pagination: PaginationParams): Promise<PaginatedSessions>;
    /**
     * Calculates comprehensive time tracking statistics for a user.
     *
     * Used for analytics dashboards, productivity reports, and insights. Provides
     * aggregated metrics about work time, break time, pomodoros completed, pauses,
     * and breakdowns by session type. Can be scoped to a specific date range.
     *
     * @param userId - The user ID to calculate statistics for
     * @param startDate - Optional start date for the statistics period (defaults to all time)
     * @param endDate - Optional end date for the statistics period (defaults to all time)
     * @returns Promise resolving to session statistics with detailed metrics
     *
     * @example
     * ```typescript
     * // Get statistics for the current month
     * const now = new Date();
     * const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
     * const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
     *
     * const stats = await repository.getStats('user-123', startOfMonth, endOfMonth);
     *
     * console.log(`Total work time: ${stats.totalMinutesWorked} minutes`);
     * console.log(`Pomodoros completed: ${stats.pomodorosCompleted}`);
     * console.log(`Sessions paused: ${stats.totalPauses} times`);
     * console.log(`Work sessions: ${stats.byType.WORK.count}`);
     * console.log(`Short breaks: ${stats.byType.SHORT_BREAK.count}`);
     * ```
     */
    getStats(userId: string, startDate?: Date, endDate?: Date): Promise<SessionStats>;
    /**
     * Calculates time tracking statistics for a specific task.
     *
     * Used for displaying task-level time metrics, such as in task cards or the
     * task detail view. Shows how many sessions were tracked for the task, total
     * time spent, completion rate, and last activity.
     *
     * @param userId - The user ID (for authorization and scoping)
     * @param taskId - The task ID to calculate statistics for
     * @returns Promise resolving to task time statistics
     *
     * @example
     * ```typescript
     * const stats = await repository.getTaskTimeStats('user-123', 'task-456');
     *
     * console.log(`Sessions: ${stats.totalSessions}`);
     * console.log(`Time spent: ${stats.totalMinutes} minutes`);
     * console.log(`Completed: ${stats.completedSessions}/${stats.totalSessions}`);
     *
     * if (stats.lastSessionAt) {
     *   console.log(`Last activity: ${stats.lastSessionAt.toLocaleString()}`);
     * }
     * ```
     */
    getTaskTimeStats(userId: string, taskId: string): Promise<{
        /** Total number of sessions tracked for this task */
        totalSessions: number;
        /** Total minutes spent on this task (sum of all completed sessions) */
        totalMinutes: number;
        /** Number of sessions that were completed (not abandoned) */
        completedSessions: number;
        /** Timestamp of the last session for this task */
        lastSessionAt?: Date;
    }>;
    /**
     * Finds time sessions with associated task and project data.
     *
     * Used for analytics views that need to display session context, such as
     * "Which projects did I work on this week?" or "How did I spend my time today?".
     * Returns sessions with nested task and project information for rich display.
     *
     * @param userId - The user ID to find sessions for
     * @param startDate - Start of the date range (inclusive)
     * @param endDate - End of the date range (inclusive)
     * @returns Promise resolving to sessions with task and project data
     *
     * @example
     * ```typescript
     * // Get this week's sessions with project context
     * const sessions = await repository.findByUserIdWithTaskAndProject(
     *   'user-123',
     *   startOfWeek,
     *   endOfWeek
     * );
     *
     * // Group by project
     * const byProject = sessions.reduce((acc, session) => {
     *   const projectName = session.task?.project?.name || 'No Project';
     *   (acc[projectName] ||= []).push(session);
     *   return acc;
     * }, {} as Record<string, typeof sessions>);
     *
     * Object.entries(byProject).forEach(([project, projectSessions]) => {
     *   const totalMinutes = projectSessions.reduce((sum, s) =>
     *     sum + (s.duration || 0), 0
     *   );
     *   console.log(`${project}: ${Math.floor(totalMinutes / 60)} hours`);
     * });
     * ```
     */
    findByUserIdWithTaskAndProject(userId: string, startDate: Date, endDate: Date): Promise<Array<{
        /** Unique identifier of the session */
        id: string;
        /** When the session started */
        startedAt: Date;
        /** Planned duration in seconds (null for continuous timer) */
        duration: number | null;
        /** Associated task with project information */
        task: {
            /** Task ID */
            id: string;
            /** Project information (null if task has no project) */
            project: {
                /** Project name */
                name: string;
            } | null;
        } | null;
    }>>;
    /**
     * Counts completed time sessions for a user with optional filters.
     *
     * Used for gamification features where users earn achievements based on
     * completed pomodoros, total sessions, etc. Supports filtering by session type.
     *
     * @param userId - The user ID to count sessions for
     * @param type - Optional session type filter (e.g., 'WORK', 'SHORT_BREAK', 'LONG_BREAK')
     * @returns Promise resolving to the count of completed sessions
     *
     * @example
     * ```typescript
     * // Count all completed pomodoros (WORK sessions)
     * const pomodoroCount = await repository.countCompletedSessions('user-123', 'WORK');
     * console.log(`User has completed ${pomodoroCount} pomodoros`);
     *
     * // Count all completed sessions regardless of type
     * const totalSessions = await repository.countCompletedSessions('user-123');
     * console.log(`User has completed ${totalSessions} sessions total`);
     * ```
     */
    countCompletedSessions(userId: string, type?: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK'): Promise<number>;
}

declare class StartTimerUseCase {
    private timerRepository;
    private taskRepository;
    constructor(timerRepository: TimerRepository, taskRepository: TaskRepository);
    execute(userId: string, taskId?: string, type?: SessionType): Promise<TimeSession>;
}

declare class StopTimerUseCase {
    private timerRepository;
    constructor(timerRepository: TimerRepository);
    execute(userId: string, wasCompleted?: boolean): Promise<TimeSession>;
}

declare class PauseTimerUseCase {
    private timerRepository;
    constructor(timerRepository: TimerRepository);
    execute(userId: string, pauseStartedAt?: Date): Promise<TimeSession>;
}

declare class ResumeTimerUseCase {
    private timerRepository;
    constructor(timerRepository: TimerRepository);
    execute(userId: string, pauseStartedAt: Date, pauseEndedAt?: Date): Promise<TimeSession>;
}

declare class SwitchTaskUseCase {
    private timerRepository;
    constructor(timerRepository: TimerRepository);
    execute(userId: string, newTaskId: string, type?: SessionType, splitReason?: string): Promise<{
        oldSession: TimeSession;
        newSession: TimeSession;
    }>;
}

interface DailyMetricsProps extends EntityProps<string> {
    userId: string;
    date: Date;
    tasksCreated: number;
    tasksCompleted: number;
    subtasksCompleted: number;
    minutesWorked: number;
    pomodorosCompleted: number;
    shortBreaksCompleted: number;
    longBreaksCompleted: number;
    breakMinutes: number;
    focusScore?: number;
    createdAt?: Date;
}
declare class DailyMetrics extends Entity<DailyMetricsProps> {
    constructor(props: DailyMetricsProps);
    static create(props: Omit<DailyMetricsProps, "id" | "createdAt" | "tasksCreated" | "tasksCompleted" | "subtasksCompleted" | "minutesWorked" | "pomodorosCompleted" | "shortBreaksCompleted" | "longBreaksCompleted" | "breakMinutes">): DailyMetrics;
    incrementTasksCreated(): DailyMetrics;
    incrementTasksCompleted(): DailyMetrics;
    decrementTasksCompleted(): DailyMetrics;
    incrementSubtasksCompleted(): DailyMetrics;
    decrementSubtasksCompleted(): DailyMetrics;
    addMinutesWorked(minutes: number): DailyMetrics;
    incrementPomodoros(): DailyMetrics;
    updateFocusScore(score: number): DailyMetrics;
    incrementShortBreaks(): DailyMetrics;
    incrementLongBreaks(): DailyMetrics;
    addBreakMinutes(minutes: number): DailyMetrics;
}

/**
 * Repository interface for DailyMetrics entity persistence operations.
 *
 * This interface defines the contract for analytics data access, providing methods
 * for saving daily productivity metrics and retrieving them by date ranges. Metrics
 * include tasks completed, time worked, pomodoros completed, and focus scores.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaAnalyticsRepository implements AnalyticsRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async save(metrics: DailyMetrics): Promise<void> {
 *     await this.prisma.dailyMetrics.upsert({
 *       where: {
 *         userId_date: {
 *           userId: metrics.userId,
 *           date: metrics.date
 *         }
 *       },
 *       update: {
 *         tasksCompleted: metrics.tasksCompleted,
 *         minutesWorked: metrics.minutesWorked,
 *         pomodorosCompleted: metrics.pomodorosCompleted,
 *         focusScore: metrics.focusScore
 *       },
 *       create: {
 *         id: metrics.id,
 *         userId: metrics.userId,
 *         date: metrics.date,
 *         tasksCompleted: metrics.tasksCompleted,
 *         minutesWorked: metrics.minutesWorked,
 *         pomodorosCompleted: metrics.pomodorosCompleted,
 *         focusScore: metrics.focusScore,
 *         createdAt: metrics.createdAt
 *       }
 *     });
 *   }
 *
 *   async findByDate(userId: string, date: Date): Promise<DailyMetrics | null> {
 *     const data = await this.prisma.dailyMetrics.findUnique({
 *       where: {
 *         userId_date: {
 *           userId,
 *           date: this.normalizeDate(date)
 *         }
 *       }
 *     });
 *     return data ? new DailyMetrics(data) : null;
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/daily-metrics.entity.ts | DailyMetrics entity}
 */
interface AnalyticsRepository {
    /**
     * Saves or updates daily metrics for a user.
     *
     * Used to persist daily productivity metrics after a time session is completed
     * or when recalculating metrics for a specific date. If metrics already exist
     * for the user+date combination, they are updated (upsert operation).
     *
     * @param metrics - The daily metrics entity to save (must be valid)
     * @returns Promise resolving when the save is complete
     * @throws {Error} If metrics validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * // After completing a pomodoro session
     * const metrics = new DailyMetrics({
     *   userId: 'user-123',
     *   date: new Date(),
     *   tasksCompleted: 5,
     *   minutesWorked: 125,
     *   pomodorosCompleted: 4,
     *   focusScore: 0.85
     * });
     *
     * await repository.save(metrics);
     * console.log('Daily metrics saved');
     * ```
     */
    save(metrics: DailyMetrics): Promise<void>;
    /**
     * Finds daily metrics for a specific user and date.
     *
     * Used for retrieving metrics for a single day, such as displaying today's
     * productivity summary in the dashboard. Returns null if no metrics exist
     * for that date (e.g., user hasn't tracked any time yet).
     *
     * @param userId - The user ID to find metrics for
     * @param date - The date to find metrics for (time component is ignored)
     * @returns Promise resolving to the daily metrics if found, null otherwise
     *
     * @example
     * ```typescript
     * const metrics = await repository.findByDate('user-123', new Date());
     * if (metrics) {
     *   console.log(`Today's productivity:`);
     *   console.log(`Tasks completed: ${metrics.tasksCompleted}`);
     *   console.log(`Time worked: ${metrics.minutesWorked} minutes`);
     *   console.log(`Pomodoros: ${metrics.pomodorosCompleted}`);
     *   console.log(`Focus score: ${(metrics.focusScore * 100).toFixed(0)}%`);
     * } else {
     *   console.log('No activity recorded today');
     * }
     * ```
     */
    findByDate(userId: string, date: Date): Promise<DailyMetrics | null>;
    /**
     * Retrieves daily metrics for a user within a date range.
     *
     * Used for displaying analytics charts and reports over a period, such as
     * "Last 7 Days", "This Month", or custom date ranges. Returns metrics
     * ordered by date ascending (oldest first).
     *
     * @param userId - The user ID to find metrics for
     * @param startDate - Start of the date range (inclusive)
     * @param endDate - End of the date range (inclusive)
     * @returns Promise resolving to an array of daily metrics (empty array if none found)
     *
     * @example
     * ```typescript
     * // Get metrics for the current week
     * const now = new Date();
     * const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
     * const endOfWeek = new Date(now.setDate(now.getDate() + 6));
     *
     * const metrics = await repository.getRange('user-123', startOfWeek, endOfWeek);
     * console.log(`Found ${metrics.length} days with metrics`);
     *
     * // Calculate weekly averages
     * const avgTasks = metrics.reduce((sum, m) => sum + m.tasksCompleted, 0) / metrics.length;
     * const avgFocus = metrics.reduce((sum, m) => sum + m.focusScore, 0) / metrics.length;
     * console.log(`Average tasks/day: ${avgTasks.toFixed(1)}`);
     * console.log(`Average focus: ${(avgFocus * 100).toFixed(0)}%`);
     *
     * // Render weekly chart
     * metrics.forEach(m => {
     *   console.log(`${m.date.toISOString().split('T')[0]}: ${m.tasksCompleted} tasks, ${(m.focusScore * 100).toFixed(0)}% focus`);
     * });
     * ```
     */
    getRange(userId: string, startDate: Date, endDate: Date): Promise<DailyMetrics[]>;
    /**
     * Retrieves the most recent daily metrics for a user.
     *
     * Used for dashboard widgets showing "Recent Activity" or "Last 7 Days".
     * Returns metrics ordered by date descending (newest first), limited to
     * the specified number of records.
     *
     * @param userId - The user ID to find metrics for
     * @param limit - Maximum number of recent records to return (e.g., 7 for last week)
     * @returns Promise resolving to an array of recent daily metrics (empty array if none found)
     *
     * @example
     * ```typescript
     * // Get last 7 days of metrics for dashboard
     * const recentMetrics = await repository.getRangeDescending('user-123', 7);
     * console.log(`Showing ${recentMetrics.length} recent days`);
     *
     * // Render activity heatmap or mini chart
     * recentMetrics.forEach(metrics => {
     *   const dayName = metrics.date.toLocaleDateString('en-US', { weekday: 'short' });
     *   const focusPercent = Math.round(metrics.focusScore * 100);
     *   console.log(`${dayName}: ${metrics.tasksCompleted} tasks (${focusPercent}% focus)`);
     * });
     *
     * // Calculate streak (consecutive days with activity)
     * let streak = 0;
     * for (const m of recentMetrics) {
     *   if (m.minutesWorked > 0) streak++;
     *     else break;
     *   }
     *   console.log(`Current streak: ${streak} days`);
     * }
     * ```
     */
    getRangeDescending(userId: string, limit: number): Promise<DailyMetrics[]>;
    /**
     * Counts tasks with specific criteria for analytics.
     *
     * Used for burnout prevention and productivity analytics to count tasks
     * by status, priority, due date, or date ranges. Supports complex filters for
     * comprehensive task analytics.
     *
     * @param userId - The user ID to count tasks for
     * @param options - Filter options for the count
     * @returns Promise resolving to the count of tasks matching the criteria
     *
     * @example
     * ```typescript
     * // Count urgent tasks
     * const urgentCount = await repository.countTasks('user-123', {
     *   priority: 'URGENT',
     *   status: { notIn: ['COMPLETED', 'CANCELLED'] }
     * });
     *
     * // Count completed tasks in date range
     * const completedCount = await repository.countTasks('user-123', {
     *   status: 'COMPLETED',
     *   completedAt: { gte: weekStart, lte: weekEnd }
     * });
     *
     * // Count overdue tasks
     * const overdueCount = await repository.countTasks('user-123', {
     *   status: { notIn: ['COMPLETED', 'CANCELLED'] },
     *   dueDate: { lt: new Date() }
     * });
     * ```
     */
    countTasks(userId: string, options?: {
        status?: string | string[] | {
            in?: string[];
            notIn?: string[];
        };
        priority?: string;
        dueDate?: {
            lt?: Date;
            lte?: Date;
            gte?: Date;
        };
        completedAt?: {
            lt?: Date;
            lte?: Date;
            gte?: Date;
        };
        createdAt?: {
            lt?: Date;
            lte?: Date;
            gte?: Date;
        };
        assigneeId?: string;
    }): Promise<number>;
}

declare class GetDailyMetricsUseCase {
    private analyticsRepository;
    constructor(analyticsRepository: AnalyticsRepository);
    execute(userId: string, date?: Date): Promise<DailyMetrics>;
}

interface UpdateDailyMetricsInput {
    userId: string;
    date: Date;
    tasksCreated?: number;
    tasksCompleted?: number;
    subtasksCompleted?: number;
    minutesWorked?: number;
    pomodorosCompleted?: number;
    shortBreaksCompleted?: number;
    longBreaksCompleted?: number;
    breakMinutes?: number;
    focusScore?: number;
}
declare class UpdateDailyMetricsUseCase {
    private analyticsRepository;
    constructor(analyticsRepository: AnalyticsRepository);
    execute(input: UpdateDailyMetricsInput): Promise<DailyMetrics>;
}

interface FocusScoreInput {
    totalWorkSeconds: number;
    totalPauseSeconds: number;
    pauseCount: number;
}
declare class CalculateFocusScoreUseCase {
    execute(input: FocusScoreInput): number;
}

interface AIProfileProps extends EntityProps {
    userId: string;
    peakHours: Record<number, number>;
    peakDays: Record<number, number>;
    avgTaskDuration: number;
    completionRate: number;
    categoryPreferences: Record<string, number>;
    updatedAt?: Date;
}
declare class AIProfile extends Entity<AIProfileProps> {
    constructor(props: AIProfileProps);
    static create(userId: string): AIProfile;
    /**
     * Update productivity score for a specific hour of the day (0-23)
     * Uses exponential moving average to smooth out variations
     */
    updatePeakHour(hour: number, score: number): AIProfile;
    /**
     * Update productivity score for a specific day of the week (0=Sunday, 6=Saturday)
     * Uses exponential moving average to smooth out variations
     */
    updatePeakDay(dayOfWeek: number, score: number): AIProfile;
    /**
     * Recalculate average task duration based on recent completed tasks
     * Uses exponential moving average to give more weight to recent data
     */
    recalculateAvgDuration(recentDurations: number[]): AIProfile;
    /**
     * Update completion rate based on completed and total tasks
     * Uses exponential moving average
     */
    updateCompletionRate(completed: number, total: number): AIProfile;
    /**
     * Update preference score for a category
     * Higher score means user works better/prefers this category
     */
    updateCategoryPreference(category: string, score: number): AIProfile;
    /**
     * Get the top N most productive hours
     */
    getTopPeakHours(limit?: number): number[];
    /**
     * Get the top N most productive days
     */
    getTopPeakDays(limit?: number): number[];
    /**
     * Get the top N preferred categories
     */
    getTopCategories(limit?: number): string[];
    /**
     * Check if a specific hour is a peak productivity hour (score > 0.7)
     */
    isPeakHour(hour: number): boolean;
    /**
     * Check if a specific day is a peak productivity day (score > 0.7)
     */
    isPeakDay(dayOfWeek: number): boolean;
}

type ReportScope = "TASK_COMPLETION" | "PROJECT_SUMMARY" | "PERSONAL_ANALYSIS" | "WEEKLY_SCHEDULED" | "MONTHLY_SCHEDULED";
interface MetricsSnapshot {
    tasksCreated?: number;
    tasksCompleted?: number;
    minutesWorked?: number;
    pomodorosCompleted?: number;
    focusScore?: number;
    sessionsCount?: number;
}
interface ProductivityReportProps extends EntityProps {
    userId: string;
    taskId?: string;
    projectId?: string;
    scope: ReportScope;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    patterns: string[];
    productivityScore: number;
    metricsSnapshot: MetricsSnapshot;
    generatedAt?: Date;
    aiModel?: string;
}
declare class ProductivityReport extends Entity<ProductivityReportProps> {
    constructor(props: ProductivityReportProps);
    static create(props: Omit<ProductivityReportProps, "id" | "generatedAt" | "aiModel">): ProductivityReport;
    /**
     * Get a human-readable label for the scope
     */
    getScopeLabel(): string;
    /**
     * Get a color for the productivity score
     */
    getScoreColor(): "green" | "yellow" | "red";
    /**
     * Check if this is a good productivity score
     */
    isGoodScore(): boolean;
    /**
     * Get a summary of the metrics snapshot
     */
    getMetricsSummary(): string;
    /**
     * Check if this report has actionable recommendations
     */
    hasRecommendations(): boolean;
    /**
     * Get the top N recommendations
     */
    getTopRecommendations(limit?: number): string[];
}

/**
 * Repository interface for AIProfile entity persistence operations.
 *
 * This interface defines the contract for AI user profile data access, providing methods
 * for managing individual productivity patterns, preferences, and behaviors. AI profiles
 * are used to personalize AI-generated recommendations, task suggestions, and productivity insights.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaAIProfileRepository implements AIProfileRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async findByUserId(userId: string): Promise<AIProfile | null> {
 *     const data = await this.prisma.aIProfile.findUnique({
 *       where: { userId }
 *     });
 *     return data ? new AIProfile(data) : null;
 *   }
 *
 *   async findOrCreate(userId: string): Promise<AIProfile> {
 *     let profile = await this.findByUserId(userId);
 *     if (!profile) {
 *       profile = new AIProfile({
 *         userId,
 *         workHours: { start: '09:00', end: '17:00' },
 *         preferredBreakDuration: 5,
 *         timezone: 'UTC'
 *       });
 *       profile = await this.save(profile);
 *     }
 *     return profile;
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/ai-profile.entity.ts | AIProfile entity}
 */
interface AIProfileRepository {
    /**
     * Finds AI profile by user ID.
     *
     * Used for retrieving a user's AI profile to personalize recommendations and insights.
     * Returns null if the user doesn't have a profile yet (first-time user).
     *
     * @param userId - The user ID to find the AI profile for
     * @returns Promise resolving to the AI profile if found, null otherwise
     *
     * @example
     * ```typescript
     * const profile = await repository.findByUserId('user-123');
     * if (profile) {
     *   console.log(`User's productive hours: ${profile.workHours.start} - ${profile.workHours.end}`);
     *   console.log(`Preferred break duration: ${profile.preferredBreakDuration} minutes`);
     * } else {
     *   console.log('No AI profile found for user');
     * }
     * ```
     */
    findByUserId(userId: string): Promise<AIProfile | null>;
    /**
     * Finds or creates AI profile for a user.
     *
     * Used when you need to ensure a user has an AI profile, creating one with default
     * values if it doesn't exist. This is the preferred method for accessing AI profiles
     * as it guarantees a profile is always returned.
     *
     * @param userId - The user ID to find or create the AI profile for
     * @returns Promise resolving to the existing or newly created AI profile
     *
     * @example
     * ```typescript
     * const profile = await repository.findOrCreate('user-123');
     *
     * // Profile is guaranteed to exist
     * console.log(`User's timezone: ${profile.timezone}`);
     * console.log(`Peak productivity hours: ${profile.peakProductivityHours.join(', ')}`);
     *
     * // Use profile to personalize AI recommendations
     * const suggestions = generateSuggestions(profile);
     * ```
     */
    findOrCreate(userId: string): Promise<AIProfile>;
    /**
     * Saves (creates or updates) an AI profile.
     *
     * Used for persisting AI profile data, whether it's a new profile or updates to an
     * existing one. Handles both creation and update operations seamlessly.
     *
     * @param profile - The AI profile entity to save (must be valid)
     * @returns Promise resolving to the saved profile with any database-generated fields populated
     * @throws {Error} If profile validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * const profile = new AIProfile({
     *   userId: 'user-123',
     *   workHours: { start: '08:00', end: '16:00' },
     *   preferredBreakDuration: 10,
     *   timezone: 'America/New_York',
     *   taskPrioritization: 'deadline',
       focusPreferences: {
     *     deepWork: true,
     *     notificationsMuted: true
     *   }
     * });
     *
     * const saved = await repository.save(profile);
     * console.log(`AI profile saved with ID: ${saved.id}`);
     * ```
     */
    save(profile: AIProfile): Promise<AIProfile>;
    /**
     * Updates an existing AI profile.
     *
     * Used when modifying specific fields of an AI profile, such as updating work hours,
     * preferences, or productivity patterns. The profile must already exist.
     *
     * @param profile - The AI profile entity with updated fields
     * @returns Promise resolving to the updated profile
     * @throws {NotFoundException} If the profile doesn't exist
     * @throws {Error} If validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * const existing = await repository.findByUserId('user-123');
     * if (existing) {
     *   const updated = existing.clone({
     *     workHours: { start: '07:00', end: '15:00' },
     *     preferredBreakDuration: 15
     *   });
     *   await repository.update(updated);
     *   console.log('AI profile updated');
     * }
     * ```
     */
    update(profile: AIProfile): Promise<AIProfile>;
    /**
     * Deletes an AI profile by ID.
     *
     * WARNING: This will permanently delete the user's AI profile and all personalized
     * preferences. Consider archiving instead if you want to keep the data.
     *
     * @param id - The unique identifier of the AI profile to delete
     * @returns Promise resolving when the deletion is complete
     * @throws {NotFoundException} If the profile doesn't exist
     *
     * @example
     * ```typescript
     * await repository.delete('profile-abc-123');
     * console.log('AI profile permanently deleted');
     * ```
     */
    delete(id: string): Promise<void>;
}

/**
 * Repository interface for ProductivityReport entity persistence operations.
 *
 * This interface defines the contract for AI-generated productivity report data access,
 * providing methods for saving, retrieving, and querying reports by user, task, project,
 * or scope. Reports contain insights, recommendations, and productivity analysis.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaProductivityReportRepository implements ProductivityReportRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async save(report: ProductivityReport): Promise<ProductivityReport> {
 *     const data = await this.prisma.productivityReport.create({
 *       data: {
 *         id: report.id,
 *         userId: report.userId,
 *         scope: report.scope,
 *         taskId: report.taskId,
 *         projectId: report.projectId,
 *         insights: report.insights,
 *         recommendations: report.recommendations,
 *         metrics: report.metrics,
 *         generatedAt: report.generatedAt
 *       }
 *     });
 *     return new ProductivityReport(data);
 *   }
 *
 *   async findLatestByScope(userId: string, scope: ReportScope): Promise<ProductivityReport | null> {
 *     const data = await this.prisma.productivityReport.findFirst({
 *       where: { userId, scope },
 *       orderBy: { generatedAt: 'desc' }
 *     });
 *     return data ? new ProductivityReport(data) : null;
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/productivity-report.entity.ts | ProductivityReport entity}
 */
interface ProductivityReportRepository {
    /**
     * Saves a new productivity report.
     *
     * Used when AI generates a new productivity report for a user, task, or project.
     * Creates a new report record with insights, recommendations, and metrics.
     *
     * @param report - The productivity report entity to save (must be valid)
     * @returns Promise resolving to the saved report with any database-generated fields populated
     * @throws {Error} If report validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * const report = new ProductivityReport({
     *   userId: 'user-123',
     *   scope: 'TASK',
     *   taskId: 'task-456',
     *   insights: [
     *     'Strong focus maintained throughout the task',
     *     'Completed 25% faster than average'
     *   ],
     *   recommendations: [
     *     'Consider scheduling similar tasks in the morning',
     *     'Take regular breaks to maintain productivity'
     *   ],
     *   metrics: {
     *     focusScore: 0.92,
     *     timeSpent: 120,
     *     completionRate: 1.0
     *   },
     *   generatedAt: new Date()
     * });
     *
     * const saved = await repository.save(report);
     * console.log(`Productivity report saved with ID: ${saved.id}`);
     * ```
     */
    save(report: ProductivityReport): Promise<ProductivityReport>;
    /**
     * Finds a productivity report by its unique ID.
     *
     * Used for retrieving a specific report when the ID is known, such as from a URL parameter
     * or after creating a report.
     *
     * @param id - The unique identifier of the productivity report
     * @returns Promise resolving to the report if found, null otherwise
     *
     * @example
     * ```typescript
     * const report = await repository.findById('report-abc-123');
     * if (report) {
     *   console.log(`Report for ${report.scope}: ${report.taskId || report.projectId || 'overall'}`);
     *   console.log(`Generated at: ${report.generatedAt}`);
     *   report.insights.forEach(insight => console.log(`- ${insight}`));
     * } else {
     *   console.log('Report not found');
     * }
     * ```
     */
    findById(id: string): Promise<ProductivityReport | null>;
    /**
     * Finds all productivity reports for a user.
     *
     * Used for displaying a user's report history, such as in a reports list view.
     * Supports optional filtering by scope and pagination.
     *
     * @param userId - The user ID to find reports for
     * @param options - Optional filtering and pagination parameters
     * @returns Promise resolving to an array of productivity reports (empty array if none found)
     *
     * @example
     * ```typescript
     * // Get all task-level reports, paginated
     * const reports = await repository.findByUserId('user-123', {
     *   scope: 'TASK',
     *   limit: 20,
     *   offset: 0
     * });
     *
     * console.log(`Found ${reports.length} task reports`);
     * reports.forEach(report => {
     *   console.log(`${report.taskId}: ${report.insights.length} insights`);
     * });
     * ```
     */
    findByUserId(userId: string, options?: {
        /** Filter reports by scope (TASK, PROJECT, WORKSPACE, DAILY, WEEKLY) */
        scope?: ReportScope;
        /** Maximum number of reports to return */
        limit?: number;
        /** Number of reports to skip (for pagination) */
        offset?: number;
    }): Promise<ProductivityReport[]>;
    /**
     * Finds all productivity reports for a specific task.
     *
     * Used for displaying AI analysis and insights for a particular task.
     * Returns reports ordered by generation date (newest first).
     *
     * @param taskId - The task ID to find reports for
     * @returns Promise resolving to an array of task reports (empty array if none found)
     *
     * @example
     * ```typescript
     * const reports = await repository.findByTaskId('task-456');
     * console.log(`Task has ${reports.length} AI reports`);
     *
     * // Display latest insights
     * if (reports.length > 0) {
     *   const latest = reports[0];
     *   console.log('Latest Insights:');
     *   latest.insights.forEach(insight => console.log(`• ${insight}`));
     *   console.log('\nRecommendations:');
     *   latest.recommendations.forEach(rec => console.log(`• ${rec}`));
     * }
     * ```
     */
    findByTaskId(taskId: string): Promise<ProductivityReport[]>;
    /**
     * Finds all productivity reports for a specific project.
     *
     * Used for displaying AI analysis and insights for a particular project.
     * Returns reports ordered by generation date (newest first).
     *
     * @param projectId - The project ID to find reports for
     * @returns Promise resolving to an array of project reports (empty array if none found)
     *
     * @example
     * ```typescript
     * const reports = await repository.findByProjectId('proj-789');
     * console.log(`Project has ${reports.length} AI reports`);
     *
     * // Aggregate insights across all reports
     * const allInsights = reports.flatMap(r => r.insights);
     * console.log(`Total insights: ${allInsights.length}`);
     * ```
     */
    findByProjectId(projectId: string): Promise<ProductivityReport[]>;
    /**
     * Finds the latest productivity report for a specific scope.
     *
     * Used for displaying the most recent AI analysis for a given scope level
     * (e.g., latest daily report, latest task report).
     *
     * @param userId - The user ID to find the report for
     * @param scope - The report scope to filter by (DAILY, WEEKLY, TASK, PROJECT, etc.)
     * @returns Promise resolving to the latest report if found, null otherwise
     *
     * @example
     * ```typescript
     * // Get the latest daily report
     * const dailyReport = await repository.findLatestByScope('user-123', 'DAILY');
     * if (dailyReport) {
     *   console.log(`Latest daily report from ${dailyReport.generatedAt}`);
     *   console.log(`Focus score: ${(dailyReport.metrics.focusScore * 100).toFixed(0)}%`);
     *   dailyReport.recommendations.forEach(rec => console.log(`• ${rec}`));
     * }
     *
     * // Get the latest task report
     * const taskReport = await repository.findLatestByScope('user-123', 'TASK');
     * if (taskReport) {
     *   console.log(`Latest task analysis for ${taskReport.taskId}`);
     * }
     * ```
     */
    findLatestByScope(userId: string, scope: ReportScope): Promise<ProductivityReport | null>;
    /**
     * Deletes a productivity report.
     *
     * Used when removing old or unwanted reports. Typically used for cleanup
     * or when a user deletes a task/project (cascade delete).
     *
     * @param id - The unique identifier of the report to delete
     * @returns Promise resolving when the deletion is complete
     * @throws {NotFoundException} If the report doesn't exist
     *
     * @example
     * ```typescript
     * await repository.delete('report-abc-123');
     * console.log('Productivity report deleted');
     * ```
     */
    delete(id: string): Promise<void>;
    /**
     * Counts the total number of productivity reports for a user.
     *
     * Used for displaying report counts, pagination calculations, or analytics.
     * Can be filtered by scope to count specific report types.
     *
     * @param userId - The user ID to count reports for
     * @param scope - Optional scope filter to count only specific report types
     * @returns Promise resolving to the total count of reports
     *
     * @example
     * ```typescript
     * // Count all reports
     * const totalReports = await repository.countByUserId('user-123');
     * console.log(`User has ${totalReports} total reports`);
     *
     * // Count only daily reports
     * const dailyReports = await repository.countByUserId('user-123', 'DAILY');
     * console.log(`User has ${dailyReports} daily reports`);
     *
     * // Calculate pages for pagination (20 per page)
     * const totalPages = Math.ceil(totalReports / 20);
     * console.log(`Total pages: ${totalPages}`);
     * ```
     */
    countByUserId(userId: string, scope?: ReportScope): Promise<number>;
}

interface LearnFromSessionInput {
    session: TimeSession;
}
declare class LearnFromSessionUseCase implements UseCase<LearnFromSessionInput, AIProfile> {
    private readonly aiProfileRepository;
    constructor(aiProfileRepository: AIProfileRepository);
    execute(input: LearnFromSessionInput): Promise<AIProfile>;
    /**
     * Calculate productivity score based on session characteristics
     * Returns a value between 0 and 1
     */
    private calculateProductivityScore;
}

interface GetOptimalScheduleInput {
    userId: string;
    topN?: number;
}
interface OptimalScheduleOutput {
    peakHours: Array<{
        hour: number;
        score: number;
        label: string;
    }>;
    peakDays: Array<{
        day: number;
        score: number;
        label: string;
    }>;
    recommendation: string;
}
declare class GetOptimalScheduleUseCase implements UseCase<GetOptimalScheduleInput, OptimalScheduleOutput> {
    private readonly aiProfileRepository;
    constructor(aiProfileRepository: AIProfileRepository);
    execute(input: GetOptimalScheduleInput): Promise<OptimalScheduleOutput>;
    private getTopPeakHours;
    private getTopPeakDays;
    private formatHour;
    private generateRecommendation;
}

interface PredictTaskDurationInput {
    userId: string;
    taskTitle?: string;
    taskDescription?: string;
    category?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}
interface PredictTaskDurationOutput {
    estimatedMinutes: number;
    confidence: "LOW" | "MEDIUM" | "HIGH";
    reasoning: string;
}
declare class PredictTaskDurationUseCase implements UseCase<PredictTaskDurationInput, PredictTaskDurationOutput> {
    private readonly aiProfileRepository;
    constructor(aiProfileRepository: AIProfileRepository);
    execute(input: PredictTaskDurationInput): Promise<PredictTaskDurationOutput>;
    private containsComplexityKeywords;
}

interface GenerateWeeklyReportInput {
    userId: string;
    weekStart?: Date;
}
interface GenerateWeeklyReportOutput {
    report: ProductivityReport;
    isNew: boolean;
}
/**
 * Data needed from external AI service
 */
interface WeeklyReportData {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    patterns: string[];
    productivityScore: number;
}
interface WeeklyReportContext {
    userId: string;
    scope: string;
    metricsSnapshot: {
        tasksCreated: number;
        tasksCompleted: number;
        minutesWorked: number;
        pomodorosCompleted: number;
        focusScore: number;
        sessionsCount: number;
    };
    sessions: Array<{
        startedAt: Date;
        endedAt?: Date;
        duration?: number;
        taskId?: string;
        userId: string;
        type: string;
        wasCompleted: boolean;
    }>;
    profile?: {
        userId: string;
        peakHours: Record<number, number>;
        peakDays: Record<number, number>;
        avgTaskDuration: number;
        completionRate: number;
        categoryPreferences: Record<string, number>;
    };
}
declare class GenerateWeeklyReportUseCase implements UseCase<GenerateWeeklyReportInput, GenerateWeeklyReportOutput> {
    private readonly reportRepository;
    private readonly analyticsRepository;
    private readonly timerRepository;
    private readonly aiProfileRepository;
    private readonly generateReportData;
    constructor(reportRepository: ProductivityReportRepository, analyticsRepository: AnalyticsRepository, timerRepository: TimerRepository, aiProfileRepository: AIProfileRepository, generateReportData: (context: WeeklyReportContext) => Promise<WeeklyReportData>);
    execute(input: GenerateWeeklyReportInput): Promise<GenerateWeeklyReportOutput>;
    /**
     * Get the start of the week (Monday) for a given date
     */
    private getWeekStart;
    /**
     * Check if two dates are in the same week
     */
    private isSameWeek;
}

interface AIChatContext {
    userId?: string;
    workspaceId?: string;
    projectId?: string;
    taskId?: string;
    conversationHistory?: Array<{
        role: "user" | "assistant";
        content: string;
        timestamp: Date;
    }>;
}
interface AIService {
    suggestTaskDetails(input: string): Promise<{
        title: string;
        description?: string;
        dueDate?: Date;
        priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    }>;
    chat(message: string, context?: AIChatContext): Promise<string>;
}
declare class MockAIService implements AIService {
    suggestTaskDetails(input: string): Promise<{
        title: string;
        description: string;
        priority: "MEDIUM" | "HIGH" | "URGENT";
        dueDate: Date | undefined;
    }>;
    chat(message: string, context?: AIChatContext): Promise<string>;
}
declare const aiService: MockAIService;

type HabitFrequency = "DAILY" | "WEEKLY" | "SPECIFIC_DAYS" | "MONTHLY";
type TimeOfDay = "MORNING" | "AFTERNOON" | "EVENING" | "ANYTIME";
interface HabitCompletionProps extends EntityProps<string> {
    habitId: string;
    completedAt: Date;
    completedDate: Date;
    note?: string;
    value?: number;
}
interface HabitProps extends EntityProps<string> {
    name: string;
    description?: string;
    icon?: string;
    color: string;
    userId: string;
    workspaceId?: string;
    frequency: HabitFrequency;
    targetDaysOfWeek: number[];
    targetCount: number;
    preferredTime?: string;
    timeOfDay?: TimeOfDay;
    currentStreak?: number;
    longestStreak?: number;
    totalCompletions?: number;
    isActive?: boolean;
    isPaused?: boolean;
    pausedAt?: Date;
    archivedAt?: Date;
    completions?: HabitCompletionProps[];
    createdAt?: Date;
    updatedAt?: Date;
}
declare class Habit extends Entity<HabitProps> {
    constructor(props: HabitProps);
    static create(props: Omit<HabitProps, "id" | "currentStreak" | "longestStreak" | "totalCompletions" | "createdAt" | "updatedAt" | "isActive" | "isPaused">): Habit;
    /**
     * Check if habit is scheduled for a given day of week (0=Sunday, 6=Saturday)
     */
    isScheduledForDay(dayOfWeek: number): boolean;
    /**
     * Mark habit as completed, updating streak
     */
    complete(isConsecutive?: boolean): Habit;
    /**
     * Reset streak (when habit is missed)
     */
    resetStreak(): Habit;
    /**
     * Pause habit tracking (vacation, illness, etc.)
     */
    pause(): Habit;
    /**
     * Resume habit tracking
     */
    resume(): Habit;
    /**
     * Archive habit (soft delete)
     */
    archive(): Habit;
    /**
     * Update habit properties
     */
    update(props: Partial<Omit<HabitProps, "id" | "userId" | "createdAt" | "currentStreak" | "longestStreak" | "totalCompletions">>): Habit;
}

/**
 * Repository interface for Habit entity persistence operations.
 *
 * This interface defines the contract for Habit data access, providing CRUD operations
 * plus specialized methods for managing habit completions, retrieving today's habits,
 * and calculating habit statistics (streaks, completion rates, etc.).
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaHabitRepository implements IHabitRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async create(habit: Habit): Promise<Habit> {
 *     const data = await this.prisma.habit.create({
 *       data: {
 *         id: habit.id,
 *         name: habit.name,
 *         frequency: habit.frequency,
 *         targetDays: habit.targetDays,
 *         userId: habit.userId,
 *         createdAt: habit.createdAt,
 *         // ... other fields
 *       }
 *     });
 *     return new Habit(data);
 *   }
 *
 *   async findTodayHabits(userId: string): Promise<Habit[]> {
 *     const today = new Date().getDay();
 *     const habits = await this.prisma.habit.findMany({
 *       where: {
 *         userId,
 *         targetDays: { has: today },
 *         status: 'ACTIVE'
 *       }
 *     });
 *     return habits.map(h => new Habit(h));
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/habit.entity.ts | Habit entity}
 */
interface IHabitRepository {
    /**
     * Finds a habit by its unique ID.
     *
     * Used for fetching habit details when the ID is known, such as from a URL parameter
     * or after creating/updating a habit.
     *
     * @param id - The unique identifier of the habit
     * @returns Promise resolving to the habit if found, null otherwise
     *
     * @example
     * ```typescript
     * const habit = await repository.findById('habit-123');
     * if (habit) {
     *   console.log(`Found habit: ${habit.name}`);
     * } else {
     *   console.log('Habit not found');
     * }
     * ```
     */
    findById(id: string): Promise<Habit | null>;
    /**
     * Finds all habits for a specific user.
     *
     * Used for displaying the user's complete habit list, including active and inactive habits.
     * Returns habits ordered by creation date or custom order.
     *
     * @param userId - The user ID to find habits for
     * @returns Promise resolving to an array of habits for the user (empty array if none found)
     *
     * @example
     * ```typescript
     * const habits = await repository.findByUserId('user-123');
     * console.log(`User has ${habits.length} habits`);
     *
     * habits.forEach(habit => {
     *   console.log(`${habit.name}: ${habit.status}`);
     * });
     * ```
     */
    findByUserId(userId: string): Promise<Habit[]>;
    /**
     * Finds all active habits for a specific user.
     *
     * Used for displaying the user's active habit list in the habits view.
     * Filters out archived, paused, or deleted habits.
     *
     * @param userId - The user ID to find active habits for
     * @returns Promise resolving to an array of active habits (empty array if none found)
     *
     * @example
     * ```typescript
     * const activeHabits = await repository.findActiveByUserId('user-123');
     * console.log(`User has ${activeHabits.length} active habits`);
     *
     * // Render habits checklist for today
     * activeHabits.forEach(habit => {
     *   console.log(`☐ ${habit.name}`);
     * });
     * ```
     */
    findActiveByUserId(userId: string): Promise<Habit[]>;
    /**
     * Finds habits that are scheduled for today.
     *
     * Used for displaying the daily habit checklist. Returns habits that are active
     * and have today's day in their targetDays array (e.g., Monday, Wednesday, Friday).
     *
     * @param userId - The user ID to find today's habits for
     * @returns Promise resolving to an array of habits scheduled for today (empty array if none found)
     *
     * @example
     * ```typescript
     * const todayHabits = await repository.findTodayHabits('user-123');
     * console.log(`${todayHabits.length} habits to complete today`);
     *
     * // Check which habits are already completed
     * for (const habit of todayHabits) {
     *   const completion = await repository.getCompletionForDate(habit.id, new Date());
     *   const status = completion ? '✓' : '☐';
     *   console.log(`${status} ${habit.name}`);
     * }
     * ```
     */
    findTodayHabits(userId: string): Promise<Habit[]>;
    /**
     * Creates a new habit in the repository.
     *
     * Used when creating a new habit through the UI or API.
     * The habit should have all required fields populated before calling this method.
     *
     * @param habit - The habit entity to create (must be valid)
     * @returns Promise resolving to the created habit with any database-generated fields populated
     * @throws {Error} If habit validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * const habit = new Habit({
     *   name: 'Morning Exercise',
     *   description: '30 minutes of cardio',
     *   frequency: 'WEEKLY',
     *   targetDays: [1, 3, 5], // Monday, Wednesday, Friday
     *   userId: 'user-123'
     * });
     *
     * const created = await repository.create(habit);
     * console.log(`Habit created with ID: ${created.id}`);
     * ```
     */
    create(habit: Habit): Promise<Habit>;
    /**
     * Updates an existing habit in the repository.
     *
     * Used when modifying habit details such as name, description, frequency, or status.
     * The habit entity should already exist and be valid before calling this method.
     *
     * @param id - The unique identifier of the habit to update
     * @param data - Partial data with fields to update
     * @returns Promise resolving to the updated habit
     * @throws {NotFoundException} If the habit doesn't exist
     * @throws {Error} If validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * const updated = await repository.update('habit-123', {
     *   name: 'Morning Exercise (Extended)',
     *   targetDays: [1, 2, 3, 4, 5] // Weekdays
     * });
     * console.log(`Habit updated: ${updated.name}`);
     * ```
     */
    update(id: string, data: Partial<HabitProps>): Promise<Habit>;
    /**
     * Deletes a habit from the repository.
     *
     * WARNING: This will permanently delete the habit and all its completion records.
     * Consider soft-deletion or archiving instead if you want to keep the history.
     *
     * @param id - The unique identifier of the habit to delete
     * @returns Promise resolving when the deletion is complete
     * @throws {NotFoundException} If the habit doesn't exist
     *
     * @example
     * ```typescript
     * await repository.delete('habit-123');
     * console.log('Habit permanently deleted');
     * ```
     */
    delete(id: string): Promise<void>;
    /**
     * Records a habit completion for a specific date.
     *
     * Used when a user marks a habit as completed for the day.
     * Creates a completion record linked to the habit.
     *
     * @param habitId - The unique identifier of the habit
     * @param data - Completion data (date, notes, etc.)
     * @returns Promise resolving to the updated habit with the new completion
     * @throws {NotFoundException} If the habit doesn't exist
     * @throws {Error} If a completion already exists for this date
     *
     * @example
     * ```typescript
     * await repository.createCompletion('habit-123', {
     *   date: new Date(),
     *   completedAt: new Date(),
     *   notes: 'Felt great today!'
     * });
     * console.log('Habit marked as completed');
     * ```
     */
    createCompletion(habitId: string, data: HabitCompletionProps): Promise<Habit>;
    /**
     * Removes a habit completion record for a specific date.
     *
     * Used when a user unchecks a habit completion (e.g., marked by mistake).
     * Deletes the completion record but keeps the habit itself.
     *
     * @param habitId - The unique identifier of the habit
     * @param date - The date of the completion to remove
     * @returns Promise resolving when the removal is complete
     * @throws {NotFoundException} If the completion doesn't exist
     *
     * @example
     * ```typescript
     * await repository.deleteCompletion('habit-123', new Date());
     * console.log('Habit completion removed');
     * ```
     */
    deleteCompletion(habitId: string, date: Date): Promise<void>;
    /**
     * Retrieves all completions for a habit within a date range.
     *
     * Used for displaying habit completion history in charts, calendars, or streak views.
     * Returns completions ordered by date descending.
     *
     * @param habitId - The unique identifier of the habit
     * @param startDate - Start of the date range (inclusive)
     * @param endDate - End of the date range (inclusive)
     * @returns Promise resolving to an array of completions (empty array if none found)
     *
     * @example
     * ```typescript
     * // Get completions for the current month
     * const now = new Date();
     * const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
     * const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
     *
     * const completions = await repository.getCompletions('habit-123', startOfMonth, endOfMonth);
     * console.log(`Habit completed ${completions.length} times this month`);
     *
     * // Render completion calendar
     * completions.forEach(completion => {
     *   console.log(`${completion.date.toISOString().split('T')[0]}: ✓`);
     * });
     * ```
     */
    getCompletions(habitId: string, startDate: Date, endDate: Date): Promise<HabitCompletionProps[]>;
    /**
     * Retrieves the completion record for a habit on a specific date.
     *
     * Used for checking if a habit was completed on a given day, such as when
     * rendering the habit checklist for today.
     *
     * @param habitId - The unique identifier of the habit
     * @param date - The date to check for completion
     * @returns Promise resolving to the completion if found, null otherwise
     *
     * @example
     * ```typescript
     * const completion = await repository.getCompletionForDate('habit-123', new Date());
     * if (completion) {
     *   console.log('Habit completed today!');
     *   console.log(`Completed at: ${completion.completedAt}`);
     *   console.log(`Notes: ${completion.notes}`);
     * } else {
     *   console.log('Habit not completed yet today');
     * }
     * ```
     */
    getCompletionForDate(habitId: string, date: Date): Promise<HabitCompletionProps | null>;
    /**
     * Calculates comprehensive statistics for a habit.
     *
     * Used for displaying habit metrics and insights, such as current streak,
     * longest streak, completion rate, and recent activity. Useful for motivation
     * and progress tracking.
     *
     * @param habitId - The unique identifier of the habit
     * @returns Promise resolving to habit statistics
     *
     * @example
     * ```typescript
     * const stats = await repository.getStats('habit-123');
     *
     * console.log(`Current streak: ${stats.currentStreak} days`);
     * console.log(`Longest streak: ${stats.longestStreak} days`);
     * console.log(`Total completions: ${stats.totalCompletions}`);
     * console.log(`Completion rate: ${(stats.completionRate * 100).toFixed(1)}%`);
     * console.log(`This week: ${stats.thisWeekCompletions} completions`);
     * console.log(`This month: ${stats.thisMonthCompletions} completions`);
     *
     * // Display streak badge
     * if (stats.currentStreak >= 30) {
     *   console.log('🔥 Amazing streak! Keep it up!');
     * } else if (stats.currentStreak >= 7) {
     *   console.log('⭐ Great consistency!');
     * }
     * ```
     */
    getStats(habitId: string): Promise<{
        /** Current consecutive completion streak (in days) */
        currentStreak: number;
        /** Longest consecutive completion streak achieved (in days) */
        longestStreak: number;
        /** Total number of completions since habit creation */
        totalCompletions: number;
        /** Completion rate as a percentage (0-1), calculated over the habit's lifetime */
        completionRate: number;
        /** Number of completions in the current week (Sunday to Saturday) */
        thisWeekCompletions: number;
        /** Number of completions in the current month */
        thisMonthCompletions: number;
    }>;
}

interface NoteProps extends EntityProps {
    content: string;
    workspaceId: string;
    authorId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class Note extends Entity<NoteProps> {
    constructor(props: NoteProps);
    static create(props: Omit<NoteProps, "id" | "createdAt" | "updatedAt">): Note;
    updateContent(content: string): Note;
    updatePosition(x: number, y: number): Note;
    updateSize(width: number, height: number): Note;
    updateColor(color: string): Note;
    update(props: Partial<Omit<NoteProps, "id" | "workspaceId" | "authorId">>): Note;
}

interface NoteRepository {
    save(note: Note): Promise<Note>;
    findById(id: string): Promise<Note | null>;
    findByWorkspaceId(workspaceId: string, options?: {
        limit?: number;
        page?: number;
        search?: string;
        authorId?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
    }): Promise<{
        data: Note[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    update(note: Note): Promise<Note>;
    delete(id: string): Promise<Note>;
    findWorkspaceMember(workspaceId: string, userId: string): Promise<{
        userId: string;
        workspaceId: string;
        role: string;
    } | null>;
}

interface CreateNoteInput {
    content: string;
    workspaceId: string;
    authorId: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    color?: string;
}
declare class CreateNoteUseCase implements UseCase<CreateNoteInput, Note> {
    private readonly repository;
    constructor(repository: NoteRepository);
    execute(input: CreateNoteInput): Promise<Note>;
}

interface UpdateNoteInput {
    id: string;
    userId: string;
    content?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    color?: string;
}
declare class UpdateNoteUseCase implements UseCase<UpdateNoteInput, Note> {
    private readonly repository;
    constructor(repository: NoteRepository);
    execute(input: UpdateNoteInput): Promise<Note>;
}

interface DeleteNoteInput {
    id: string;
    userId: string;
}
declare class DeleteNoteUseCase implements UseCase<DeleteNoteInput, Note> {
    private readonly repository;
    constructor(repository: NoteRepository);
    execute(input: DeleteNoteInput): Promise<Note>;
}

interface FindNoteInput {
    id: string;
    userId: string;
}
declare class FindNoteUseCase implements UseCase<FindNoteInput, Note> {
    private readonly repository;
    constructor(repository: NoteRepository);
    execute(input: FindNoteInput): Promise<Note>;
}

interface FindAllNotesInput {
    workspaceId: string;
    userId: string;
    limit?: number;
    page?: number;
    search?: string;
    authorId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
declare class FindAllNotesUseCase implements UseCase<FindAllNotesInput, {
    data: Note[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}> {
    private readonly repository;
    constructor(repository: NoteRepository);
    execute(input: FindAllNotesInput): Promise<{
        data: Note[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}

/**
 * Properties for creating a Comment entity.
 *
 * Comments represent user discussions on tasks, supporting threaded
 * replies and user mentions for collaboration.
 *
 * @example
 * ```typescript
 * const comment = new Comment({
 *   taskId: 'task-123',
 *   userId: 'user-456',
 *   content: 'Please review this task',
 *   mentions: ['user-789']
 * });
 * ```
 */
interface CommentProps extends EntityProps {
    /**
     * The ID of the task this comment belongs to.
     * Required - every comment must be associated with a task.
     */
    taskId: string;
    /**
     * The ID of the user who wrote this comment.
     * Required - every comment must have an author.
     */
    userId: string;
    /**
     * The comment text content.
     * Required - must be between 1 and 2000 characters.
     */
    content: string;
    /**
     * Optional parent comment ID for threaded replies.
     * If present, this comment is a reply to another comment.
     */
    parentCommentId?: string | null;
    /**
     * Array of user IDs mentioned in this comment.
     * Mentions trigger notifications for the mentioned users.
     */
    mentions?: string[];
    /**
     * Whether this comment has been edited.
     * Automatically set to true when edit() is called.
     */
    isEdited?: boolean;
    /**
     * Timestamp when the comment was last edited.
     * Automatically updated when edit() is called.
     */
    editedAt?: Date;
    /**
     * Timestamp when the comment was created.
     * Defaults to current time if not provided.
     */
    createdAt?: Date;
    /**
     * Timestamp when the comment was last updated.
     * Defaults to current time if not provided.
     */
    updatedAt?: Date;
}
/**
 * Represents a comment on a task.
 *
 * Comments enable team collaboration by allowing discussions
 * directly on tasks. They support threaded replies and user mentions.
 *
 * ## Business Rules
 *
 * - Content must be between 1 and 2000 characters
 * - Every comment must belong to a task
 * - Every comment must have an author
 * - Mentions are stored as an array of user IDs
 * - Comments are immutable - use business methods to create updated versions
 *
 * ## Immutability
 *
 * All update methods return a new Comment instance.
 * Never modify properties directly.
 *
 * @example
 * ```typescript
 * // Create a new comment
 * const comment = Comment.create({
 *   taskId: 'task-123',
 *   userId: 'user-456',
 *   content: 'Let me handle this'
 * });
 *
 * // Edit the content
 * const edited = comment.edit('Updated: I will handle this tomorrow');
 *
 * // Add a mention
 * const withMention = edited.addMention('user-789');
 *
 * // Check if user is mentioned
 * if (withMention.hasMention('user-789')) {
 *   // Send notification
 * }
 *
 * // Remove a mention
 * const final = withMention.removeMention('user-789');
 * ```
 *
 * @see {@link ../../shared/constants/limits.constants.ts | COMMENT_LIMITS}
 */
declare class Comment extends Entity<CommentProps> {
    constructor(props: CommentProps, mode?: EntityMode);
    /**
     * Creates a new comment with defaults applied.
     *
     * Factory method for creating comments without manually
     * setting id, timestamps, and default values.
     *
     * @param props - Comment properties (id, timestamps auto-generated)
     * @returns A new Comment instance
     *
     * @example
     * ```typescript
     * const comment = Comment.create({
     *   taskId: 'task-123',
     *   userId: 'user-456',
     *   content: 'Great work!'
     * });
     * ```
     */
    static create(props: Omit<CommentProps, "id" | "isEdited" | "editedAt" | "createdAt" | "updatedAt">): Comment;
    get taskId(): string;
    get userId(): string;
    get content(): string;
    get mentions(): string[];
    get parentCommentId(): string | null | undefined;
    get isEdited(): boolean;
    get editedAt(): Date | undefined;
    get createdAt(): Date;
    get updatedAt(): Date;
    /**
     * Updates the comment content.
     *
     * Creates a new comment with updated content, marking it as edited.
     * The edit timestamp is automatically recorded.
     *
     * @param newContent - The new comment content (1-2000 characters)
     * @returns A new Comment instance with updated content
     * @throws {Error} If content is invalid
     *
     * @example
     * ```typescript
     * const comment = Comment.create({
     *   taskId: 'task-123',
     *   userId: 'user-456',
     *   content: 'Original text'
     * });
     *
     * const edited = comment.edit('Corrected text');
     * console.log(edited.isEdited); // true
     * console.log(edited.editedAt); // Date object
     * ```
     */
    edit(newContent: string): Comment;
    /**
     * Adds a user mention to the comment.
     *
     * If the user is already mentioned, this returns the comment unchanged.
     * Mentions trigger notifications for the mentioned users.
     *
     * @param userId - The ID of the user to mention
     * @returns A new Comment instance with the mention added
     *
     * @example
     * ```typescript
     * const comment = Comment.create({
     *   taskId: 'task-123',
     *   userId: 'user-456',
     *   content: '@user-789 please review'
     * });
     *
     * const withMention = comment.addMention('user-789');
     * console.log(withMention.mentions); // ['user-789']
     * ```
     */
    addMention(userId: string): Comment;
    /**
     * Removes a user mention from the comment.
     *
     * If the user is not mentioned, this returns the comment unchanged.
     *
     * @param userId - The ID of the user to unmention
     * @returns A new Comment instance with the mention removed
     *
     * @example
     * ```typescript
     * const comment = Comment.create({
     *   taskId: 'task-123',
     *   userId: 'user-456',
     *   content: 'Review',
     *   mentions: ['user-789', 'user-abc']
     * });
     *
     * const withoutMention = comment.removeMention('user-789');
     * console.log(withoutMention.mentions); // ['user-abc']
     * ```
     */
    removeMention(userId: string): Comment;
    /**
     * Checks if a user is mentioned in this comment.
     *
     * Useful for determining if a notification should be sent.
     *
     * @param userId - The ID of the user to check
     * @returns true if the user is mentioned, false otherwise
     *
     * @example
     * ```typescript
     * const comment = Comment.create({
     *   taskId: 'task-123',
     *   userId: 'user-456',
     *   content: '@user-789 please review',
     *   mentions: ['user-789']
     * });
     *
     * if (comment.hasMention('user-789')) {
     *   sendNotification('user-789', 'You were mentioned');
     * }
     * ```
     */
    hasMention(userId: string): boolean;
    /**
     * Checks if this comment is a reply to another comment.
     *
     * @returns true if this comment has a parent, false otherwise
     *
     * @example
     * ```typescript
     * const comment = Comment.create({
     *   taskId: 'task-123',
     *   userId: 'user-456',
     *   content: 'I agree',
     *   parentCommentId: 'comment-123'
     * });
     *
     * console.log(comment.isReply()); // true
     * ```
     */
    isReply(): boolean;
    /**
     * Gets the number of users mentioned in this comment.
     *
     * @returns The count of unique mentioned users
     *
     * @example
     * ```typescript
     * const comment = Comment.create({
     *   taskId: 'task-123',
     *   userId: 'user-456',
     *   content: 'Team please review',
     *   mentions: ['user-789', 'user-abc', 'user-def']
     * });
     *
     * console.log(comment.mentionCount); // 3
     * ```
     */
    get mentionCount(): number;
    /**
     * Validates the comment content.
     *
     * @private
     * @param content - The content to validate
     * @throws {Error} If content is invalid
     */
    private validateContent;
    /**
     * Validates the task ID.
     *
     * @private
     * @param taskId - The task ID to validate
     * @throws {Error} If task ID is invalid
     */
    private validateTaskId;
    /**
     * Validates the user ID.
     *
     * @private
     * @param userId - The user ID to validate
     * @throws {Error} If user ID is invalid
     */
    private validateUserId;
    /**
     * Validates the mentions array.
     *
     * @private
     * @param mentions - The mentions array to validate
     * @throws {Error} If mentions are invalid
     */
    private validateMentions;
    /**
     * Creates a draft version of this comment.
     *
     * Draft mode skips validation, useful for forms before submission.
     *
     * @returns A new Comment instance in draft mode
     *
     * @example
     * ```typescript
     * const draft = comment.asDraft();
     * // Can now modify without validation
     * ```
     */
    asDraft(): this;
    /**
     * Converts this comment to valid mode.
     *
     * Triggers validation of all properties.
     *
     * @returns A new Comment instance in valid mode
     * @throws {Error} If any validation fails
     *
     * @example
     * ```typescript
     * const draft = new Comment({ content: '' }, 'draft');
     * const valid = draft.asValid(); // Throws error if content is empty
     * ```
     */
    asValid(): this;
}

/**
 * Repository interface for Comment entity persistence operations.
 *
 * This interface defines the contract for Comment data access, providing CRUD
 * operations plus specialized methods for managing task comments and threaded replies.
 * Comments enable team collaboration by allowing discussions directly on tasks.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaCommentRepository implements CommentRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async create(comment: Comment): Promise<Comment> {
 *     const data = await this.prisma.comment.create({
 *       data: {
 *         id: comment.id,
 *         taskId: comment.taskId,
 *         userId: comment.userId,
 *         content: comment.content,
 *         parentCommentId: comment.parentCommentId,
 *         mentions: comment.mentions,
 *         isEdited: comment.isEdited,
 *         editedAt: comment.editedAt,
 *         createdAt: comment.createdAt,
 *         updatedAt: comment.updatedAt,
 *       }
 *     });
 *     return new Comment(data);
 *   }
 *
 *   async findByTaskId(taskId: string): Promise<Comment[]> {
 *     const comments = await this.prisma.comment.findMany({
 *       where: { taskId },
 *       orderBy: { createdAt: 'asc' }
 *     });
 *     return comments.map(comment => new Comment(comment));
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/comment.entity.ts | Comment entity}
 */
interface CommentRepository {
    /**
     * Creates a new comment in the repository.
     *
     * Used when a user posts a new comment on a task. The comment
     * should have all required fields populated before calling this method.
     *
     * @param comment - The comment entity to create (must be valid)
     * @returns Promise resolving to the created comment with any database-generated fields populated
     * @throws {Error} If comment validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * const comment = Comment.create({
     *   taskId: 'task-123',
     *   userId: 'user-456',
     *   content: 'Let me handle this task',
     *   mentions: ['user-789']
     * });
     *
     * const created = await repository.create(comment);
     * console.log(`Comment created with ID: ${created.id}`);
     * ```
     */
    create(comment: Comment): Promise<Comment>;
    /**
     * Updates an existing comment in the repository.
     *
     * Used when a user edits their comment content or adds/removes mentions.
     * The comment entity should already exist and be valid before calling this method.
     *
     * @param comment - The comment entity with updated fields
     * @returns Promise resolving to the updated comment
     * @throws {Error} If the comment doesn't exist or validation fails
     *
     * @example
     * ```typescript
     * const existing = await repository.findById('comment-123');
     * if (existing) {
     *   const updated = existing.edit('Updated text with more details');
     *   await repository.update(updated);
     * }
     * ```
     */
    update(comment: Comment): Promise<Comment>;
    /**
     * Finds a comment by its unique ID.
     *
     * Used for fetching comment details when the ID is known, such as from
     * a URL parameter or after creating/updating a comment.
     *
     * @param id - The unique identifier of the comment
     * @returns Promise resolving to the comment if found, null otherwise
     *
     * @example
     * ```typescript
     * const comment = await repository.findById('comment-123');
     * if (comment) {
     *   console.log(`Found comment: ${comment.content}`);
     * } else {
     *   console.log('Comment not found');
     * }
     * ```
     */
    findById(id: string): Promise<Comment | null>;
    /**
     * Finds all comments for a specific task.
     *
     * Used for displaying the comment thread on a task detail view.
     * Returns comments ordered by creation time (oldest first) for
     * proper conversation flow display.
     *
     * @param taskId - The task ID to find comments for
     * @returns Promise resolving to an array of comments (empty array if none found)
     *
     * @example
     * ```typescript
     * const comments = await repository.findByTaskId('task-123');
     * console.log(`Found ${comments.length} comments`);
     *
     * // Render comment thread
     * comments.forEach(comment => {
     *   console.log(`${comment.userId}: ${comment.content}`);
     * });
     * ```
     */
    findByTaskId(taskId: string): Promise<Comment[]>;
    /**
     * Finds all comments created by a specific user.
     *
     * Used for displaying a user's comment history or activity feed.
     *
     * @param userId - The user ID to find comments for
     * @returns Promise resolving to an array of comments (empty array if none found)
     *
     * @example
     * ```typescript
     * const userComments = await repository.findByUserId('user-456');
     * console.log(`User has posted ${userComments.length} comments`);
     * ```
     */
    findByUserId(userId: string): Promise<Comment[]>;
    /**
     * Finds all replies to a specific comment.
     *
     * Used for displaying threaded replies in a nested comment structure.
     * This enables conversations within conversations on tasks.
     *
     * @param parentCommentId - The parent comment ID to find replies for
     * @returns Promise resolving to an array of reply comments (empty array if none found)
     *
     * @example
     * ```typescript
     * const replies = await repository.findByParentCommentId('comment-123');
     * console.log(`Found ${replies.length} replies`);
     * ```
     */
    findByParentCommentId(parentCommentId: string): Promise<Comment[]>;
    /**
     * Finds comments where a specific user is mentioned.
     *
     * Used for generating notifications and displaying "mentions" feeds.
     * Returns all comments containing the user's ID in the mentions array.
     *
     * @param userId - The user ID to find mentions for
     * @returns Promise resolving to an array of comments where the user is mentioned
     *
     * @example
     * ```typescript
     * const mentions = await repository.findMentionsForUser('user-789');
     * console.log(`User mentioned in ${mentions.length} comments`);
     *
     * // Send notifications
     * mentions.forEach(comment => {
     *   sendNotification(comment.userId, `You were mentioned in a comment on ${comment.taskId}`);
     * });
     * ```
     */
    findMentionsForUser(userId: string): Promise<Comment[]>;
    /**
     * Deletes a comment from the repository.
     *
     * WARNING: This permanently deletes the comment and cannot be undone.
     * For soft delete functionality, consider implementing a separate method.
     *
     * @param id - The unique identifier of the comment to delete
     * @returns Promise resolving when the deletion is complete
     * @throws {Error} If the comment doesn't exist
     *
     * @example
     * ```typescript
     * await repository.delete('comment-123');
     * console.log('Comment deleted permanently');
     * ```
     */
    delete(id: string): Promise<void>;
    /**
     * Counts the total number of comments for a specific task.
     *
     * Useful for displaying comment counts in task lists and badges.
     *
     * @param taskId - The task ID to count comments for
     * @returns Promise resolving to the count of comments
     *
     * @example
     * ```typescript
     * const count = await repository.countByTaskId('task-123');
     * console.log(`Task has ${count} comments`);
     * ```
     */
    countByTaskId(taskId: string): Promise<number>;
    /**
     * Finds all comments mentioning the user within a specific task.
     *
     * Combines task filtering with mention filtering for targeted notifications.
     *
     * @param taskId - The task ID to filter by
     * @param userId - The user ID to find mentions for
     * @returns Promise resolving to an array of comments where the user is mentioned in the task
     *
     * @example
     * ```typescript
     * const mentions = await repository.findMentionsForUserInTask('task-123', 'user-789');
     * if (mentions.length > 0) {
     *   console.log(`You have ${mentions.length} mentions in this task`);
     * }
     * ```
     */
    findMentionsForUserInTask(taskId: string, userId: string): Promise<Comment[]>;
}

/**
 * Input for creating a new comment.
 *
 * All fields are required unless marked optional.
 */
interface CreateCommentInput {
    /**
     * The ID of the task to comment on.
     * The task must exist for the comment to be created.
     */
    taskId: string;
    /**
     * The ID of the user creating the comment.
     * This user will be the author of the comment.
     */
    userId: string;
    /**
     * The comment content.
     * Must be between 1 and 2000 characters.
     */
    content: string;
    /**
     * Optional parent comment ID for threaded replies.
     * If provided, this comment will be a reply to another comment.
     */
    parentCommentId?: string | null;
    /**
     * Optional array of user IDs to mention in the comment.
     * Mentioned users will receive notifications.
     */
    mentions?: string[];
}
/**
 * Use case for creating a new comment on a task.
 *
 * This use case handles the creation of comments, which enable
 * team collaboration by allowing discussions directly on tasks.
 * Comments can be standalone or replies to other comments (threaded).
 *
 * ## Business Rules
 *
 * - The task must exist (checked via repository)
 * - Content must be between 1 and 2000 characters
 * - User ID and task ID are required
 * - Mentions are optional but must be valid user IDs if provided
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new CreateCommentUseCase(commentRepository);
 *
 * const comment = await useCase.execute({
 *   taskId: 'task-123',
 *   userId: 'user-456',
 *   content: 'Let me handle this task',
 *   mentions: ['user-789']
 * });
 *
 * console.log(`Comment created: ${comment.id}`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Task ID is missing or invalid
 * - User ID is missing or invalid
 * - Content is empty or too long
 * - Repository operations fail
 *
 * @see {@link ../model/comment.entity.ts | Comment entity}
 * @see {@link ../provider/comment.repository.ts | CommentRepository}
 */
declare class CreateCommentUseCase implements UseCase<CreateCommentInput, Comment> {
    private readonly commentRepository;
    constructor(commentRepository: CommentRepository);
    /**
     * Executes the create comment use case.
     *
     * Creates a new comment on the specified task with the provided content.
     * The comment is validated before being persisted.
     *
     * @param input - The comment creation input data
     * @param _loggedUser - Optional logged user context (not used in this use case)
     * @returns Promise resolving to the created comment
     * @throws {Error} If validation fails or repository operation fails
     *
     * @example
     * ```typescript
     * const comment = await useCase.execute({
     *   taskId: 'task-123',
     *   userId: 'user-456',
     *   content: 'Great work on this task!'
     * });
     * ```
     */
    execute(input: CreateCommentInput, _loggedUser?: unknown): Promise<Comment>;
}

/**
 * Input for updating an existing comment.
 */
interface UpdateCommentInput {
    /**
     * The ID of the comment to update.
     */
    commentId: string;
    /**
     * The ID of the user attempting to update the comment.
     * Must be the original author of the comment.
     */
    userId: string;
    /**
     * The new content for the comment.
     * Must be between 1 and 2000 characters.
     */
    newContent: string;
}
/**
 * Use case for updating an existing comment's content.
 *
 * This use case handles the editing of comments by their original authors.
 * When a comment is edited, it is marked as edited with a timestamp.
 *
 * ## Business Rules
 *
 * - Only the comment author can edit their own comment
 * - Content must be between 1 and 2000 characters
 * - The edit is tracked with isEdited flag and editedAt timestamp
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new UpdateCommentUseCase(commentRepository);
 *
 * const updated = await useCase.execute({
 *   commentId: 'comment-123',
 *   userId: 'user-456',
 *   newContent: 'Updated: I will handle this tomorrow instead'
 * });
 *
 * console.log(updated.isEdited); // true
 * console.log(updated.editedAt); // Date object
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Comment ID is missing or invalid
 * - User ID is missing or invalid
 * - New content is empty or too long
 * - Comment doesn't exist
 * - User is not the comment author
 *
 * @see {@link ../model/comment.entity.ts | Comment entity}
 * @see {@link ../provider/comment.repository.ts | CommentRepository}
 */
declare class UpdateCommentUseCase implements UseCase<UpdateCommentInput, Comment> {
    private readonly commentRepository;
    constructor(commentRepository: CommentRepository);
    /**
     * Executes the update comment use case.
     *
     * Updates the content of an existing comment if the user is the author.
     * The comment is marked as edited with a timestamp.
     *
     * @param input - The update input data
     * @param _loggedUser - Optional logged user context (not used in this use case)
     * @returns Promise resolving to the updated comment
     * @throws {Error} If validation fails or user is not the author
     *
     * @example
     * ```typescript
     * const updated = await useCase.execute({
     *   commentId: 'comment-123',
     *   userId: 'user-456',
     *   newContent: 'Corrected information'
     * });
     * ```
     */
    execute(input: UpdateCommentInput, _loggedUser?: unknown): Promise<Comment>;
}

/**
 * Input for deleting a comment.
 */
interface DeleteCommentInput {
    /**
     * The ID of the comment to delete.
     */
    commentId: string;
    /**
     * The ID of the user attempting to delete the comment.
     * Must be the original author of the comment.
     */
    userId: string;
}
/**
 * Use case for deleting a comment.
 *
 * This use case handles the permanent deletion of comments by their authors.
 * Once deleted, a comment cannot be recovered.
 *
 * ## Business Rules
 *
 * - Only the comment author can delete their own comment
 * - Deletion is permanent (consider soft delete for undo functionality)
 * - All replies to the comment should also be handled (application-specific)
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new DeleteCommentUseCase(commentRepository);
 *
 * await useCase.execute({
 *   commentId: 'comment-123',
 *   userId: 'user-456'
 * });
 *
 * console.log('Comment deleted');
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Comment ID is missing or invalid
 * - User ID is missing or invalid
 * - Comment doesn't exist
 * - User is not the comment author
 *
 * ## Threaded Comments
 *
 * For threaded comments, consider whether deleting a parent comment
 * should also delete its replies. This is application-specific logic
 * that may be implemented in the repository or a separate use case.
 *
 * @see {@link ../model/comment.entity.ts | Comment entity}
 * @see {@link ../provider/comment.repository.ts | CommentRepository}
 */
declare class DeleteCommentUseCase implements UseCase<DeleteCommentInput, void> {
    private readonly commentRepository;
    constructor(commentRepository: CommentRepository);
    /**
     * Executes the delete comment use case.
     *
     * Permanently deletes a comment if the user is the author.
     *
     * @param input - The delete input data
     * @param _loggedUser - Optional logged user context (not used in this use case)
     * @returns Promise that resolves when the comment is deleted
     * @throws {Error} If validation fails or user is not the author
     *
     * @example
     * ```typescript
     * await useCase.execute({
     *   commentId: 'comment-123',
     *   userId: 'user-456'
     * });
     * ```
     */
    execute(input: DeleteCommentInput, _loggedUser?: unknown): Promise<void>;
}

/**
 * Input for retrieving comments by task.
 */
interface GetCommentsByTaskInput {
    /**
     * The ID of the task to retrieve comments for.
     */
    taskId: string;
}
/**
 * Use case for retrieving all comments for a specific task.
 *
 * This use case handles fetching the complete comment thread for a task,
 * which is essential for displaying task discussions in the UI.
 *
 * ## Business Rules
 *
 * - Returns all comments for the specified task
 * - Comments are ordered chronologically (oldest first)
 * - Includes both top-level comments and threaded replies
 * - Returns an empty array if no comments exist
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new GetCommentsByTaskUseCase(commentRepository);
 *
 * const comments = await useCase.execute({
 *   taskId: 'task-123'
 * });
 *
 * console.log(`Found ${comments.length} comments`);
 * comments.forEach(comment => {
 *   console.log(`${comment.userId}: ${comment.content}`);
 * });
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Task ID is missing or invalid
 * - Repository operation fails
 *
 * Returns an empty array (not an error) if:
 * - Task has no comments
 * - Task doesn't exist (application-specific - may throw instead)
 *
 * @see {@link ../model/comment.entity.ts | Comment entity}
 * @see {@link ../provider/comment.repository.ts | CommentRepository}
 */
declare class GetCommentsByTaskUseCase implements UseCase<GetCommentsByTaskInput, Comment[]> {
    private readonly commentRepository;
    constructor(commentRepository: CommentRepository);
    /**
     * Executes the get comments by task use case.
     *
     * Retrieves all comments for the specified task, ordered chronologically.
     *
     * @param input - The input containing the task ID
     * @param _loggedUser - Optional logged user context (not used in this use case)
     * @returns Promise resolving to an array of comments (empty if none found)
     * @throws {Error} If task ID is invalid or repository operation fails
     *
     * @example
     * ```typescript
     * const comments = await useCase.execute({
     *   taskId: 'task-123'
   * });
     *
     * // Display comments in UI
     * return (
     *   <CommentThread comments={comments} />
     * );
     * ```
     */
    execute(input: GetCommentsByTaskInput, _loggedUser?: unknown): Promise<Comment[]>;
}

/**
 * Input for retrieving comments by user.
 */
interface GetCommentsByUserInput {
    /**
     * The ID of the user to retrieve comments for.
     */
    userId: string;
}
/**
 * Use case for retrieving all comments created by a specific user.
 *
 * This use case handles fetching all comments authored by a user,
 * which is useful for displaying user activity feeds or comment history.
 *
 * ## Business Rules
 *
 * - Returns all comments created by the specified user
 * - Comments are ordered by creation time (most recent first typically)
 * - Returns an empty array if the user has no comments
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new GetCommentsByUserUseCase(commentRepository);
 *
 * const comments = await useCase.execute({
 *   userId: 'user-456'
 * });
 *
 * console.log(`User has posted ${comments.length} comments`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - User ID is missing or invalid
 * - Repository operation fails
 *
 * Returns an empty array (not an error) if:
 * - User has no comments
 *
 * @see {@link ../model/comment.entity.ts | Comment entity}
 * @see {@link ../provider/comment.repository.ts | CommentRepository}
 */
declare class GetCommentsByUserUseCase implements UseCase<GetCommentsByUserInput, Comment[]> {
    private readonly commentRepository;
    constructor(commentRepository: CommentRepository);
    /**
     * Executes the get comments by user use case.
     *
     * Retrieves all comments created by the specified user.
     *
     * @param input - The input containing the user ID
     * @param _loggedUser - Optional logged user context (not used in this use case)
     * @returns Promise resolving to an array of comments (empty if none found)
     * @throws {Error} If user ID is invalid or repository operation fails
     *
     * @example
     * ```typescript
     * const comments = await useCase.execute({
     *   userId: 'user-456'
     * });
     *
     * // Display user's comment history
     * return (
     *   <UserCommentHistory comments={comments} />
     * );
     * ```
     */
    execute(input: GetCommentsByUserInput, _loggedUser?: unknown): Promise<Comment[]>;
}

/**
 * Input for adding a mention to a comment.
 */
interface AddMentionInput {
    /**
     * The ID of the comment to add the mention to.
     */
    commentId: string;
    /**
     * The ID of the user to mention.
     * This user will receive a notification about the mention.
     */
    userIdToMention: string;
}
/**
 * Use case for adding a user mention to an existing comment.
 *
 * This use case handles adding user mentions to comments, which triggers
 * notifications for the mentioned users. Mentions enable direct communication
 * within task comments.
 *
 * ## Business Rules
 *
 * - The comment must exist
 * - The user to mention must be a valid user ID
 * - Duplicate mentions are ignored (idempotent operation)
 * - Adding a mention updates the comment's updatedAt timestamp
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new AddMentionUseCase(commentRepository);
 *
 * const updated = await useCase.execute({
 *   commentId: 'comment-123',
 *   userIdToMention: 'user-789'
 * });
 *
 * console.log(`User mentioned. Total mentions: ${updated.mentionCount}`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Comment ID is missing or invalid
 * - User ID to mention is missing or invalid
 * - Comment doesn't exist
 * - Repository operation fails
 *
 * ## Idempotency
 *
 * This operation is idempotent - adding a mention for a user who is
 * already mentioned will return the comment unchanged without error.
 *
 * @see {@link ../model/comment.entity.ts | Comment entity}
 * @see {@link ../provider/comment.repository.ts | CommentRepository}
 */
declare class AddMentionUseCase implements UseCase<AddMentionInput, Comment> {
    private readonly commentRepository;
    constructor(commentRepository: CommentRepository);
    /**
     * Executes the add mention use case.
     *
     * Adds a user mention to the specified comment. If the user is already
     * mentioned, the comment is returned unchanged.
     *
     * @param input - The input containing comment ID and user ID to mention
     * @param _loggedUser - Optional logged user context (not used in this use case)
     * @returns Promise resolving to the updated comment
     * @throws {Error} If validation fails or comment doesn't exist
     *
     * @example
     * ```typescript
     * const updated = await useCase.execute({
     *   commentId: 'comment-123',
     *   userIdToMention: 'user-789'
     * });
     *
     * // Trigger notification for mentioned user
     * if (updated.hasMention('user-789')) {
     *   await sendMentionNotification('user-789', updated.id);
     * }
     * ```
     */
    execute(input: AddMentionInput, _loggedUser?: unknown): Promise<Comment>;
}

/**
 * Input for removing a mention from a comment.
 */
interface RemoveMentionInput {
    /**
     * The ID of the comment to remove the mention from.
     */
    commentId: string;
    /**
     * The ID of the user to unmention.
     */
    userIdToUnmention: string;
}
/**
 * Use case for removing a user mention from an existing comment.
 *
 * This use case handles removing user mentions from comments, which may be
 * used when correcting mistakes or when a user requests to be unmentioned.
 *
 * ## Business Rules
 *
 * - The comment must exist
 * - The user ID to unmention must be a valid user ID
 * - Removing a non-existent mention is idempotent (no error)
 * - Removing a mention updates the comment's updatedAt timestamp
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new RemoveMentionUseCase(commentRepository);
 *
 * const updated = await useCase.execute({
 *   commentId: 'comment-123',
 *   userIdToUnmention: 'user-789'
 * });
 *
 * console.log(`User unmentioned. Remaining mentions: ${updated.mentionCount}`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Comment ID is missing or invalid
 * - User ID to unmention is missing or invalid
 * - Comment doesn't exist
 * - Repository operation fails
 *
 * ## Idempotency
 *
 * This operation is idempotent - removing a mention for a user who is
 * not mentioned will return the comment unchanged without error.
 *
 * @see {@link ../model/comment.entity.ts | Comment entity}
 * @see {@link ../provider/comment.repository.ts | CommentRepository}
 */
declare class RemoveMentionUseCase implements UseCase<RemoveMentionInput, Comment> {
    private readonly commentRepository;
    constructor(commentRepository: CommentRepository);
    /**
     * Executes the remove mention use case.
     *
     * Removes a user mention from the specified comment. If the user is not
     * mentioned, the comment is returned unchanged.
     *
     * @param input - The input containing comment ID and user ID to unmention
     * @param _loggedUser - Optional logged user context (not used in this use case)
     * @returns Promise resolving to the updated comment
     * @throws {Error} If validation fails or comment doesn't exist
     *
     * @example
     * ```typescript
     * const updated = await useCase.execute({
     *   commentId: 'comment-123',
     *   userIdToUnmention: 'user-789'
     * });
     *
     * // Check if mention was removed
     * if (!updated.hasMention('user-789')) {
     *   console.log('User successfully unmentioned');
     * }
     * ```
     */
    execute(input: RemoveMentionInput, _loggedUser?: unknown): Promise<Comment>;
}

/**
 * Properties for creating an Attachment entity.
 *
 * Attachments represent files uploaded to tasks, such as images,
 * documents, and other resources that provide context or reference
 * material for task completion.
 *
 * @example
 * ```typescript
 * const attachment = new Attachment({
 *   taskId: 'task-123',
 *   userId: 'user-456',
 *   fileName: 'document-v2.pdf',
 *   originalName: 'document.pdf',
 *   mimeType: 'application/pdf',
 *   size: 1024000,
 *   storagePath: '/uploads/abc123.pdf'
 * });
 * ```
 */
interface AttachmentProps extends EntityProps {
    /**
     * The ID of the task this attachment belongs to.
     * Required - every attachment must be associated with a task.
     */
    taskId: string;
    /**
     * The ID of the user who uploaded this attachment.
     * Required - every attachment must have an uploader.
     */
    userId: string;
    /**
     * The stored file name (may include UUID or timestamp prefix).
     * Required - must be between 1 and 255 characters.
     */
    fileName: string;
    /**
     * The original file name as provided by the user.
     * Required - must be between 1 and 255 characters.
     */
    originalName: string;
    /**
     * The MIME type of the file.
     * Required - must be a valid MIME type string.
     */
    mimeType: string;
    /**
     * The file size in bytes.
     * Required - must be greater than 0 and within size limits.
     */
    size: number;
    /**
     * The storage path or URL where the file is stored.
     * Required - must be a non-empty string.
     */
    storagePath: string;
    /**
     * Whether the file has been successfully uploaded.
     * Defaults to false for new attachments before upload completes.
     */
    isUploaded?: boolean;
    /**
     * Timestamp when the file upload completed.
     * Null if upload has not completed yet.
     */
    uploadedAt?: Date | null;
    /**
     * Timestamp when the attachment record was created.
     * Defaults to current time if not provided.
     */
    createdAt?: Date;
    /**
     * Timestamp when the attachment record was last updated.
     * Defaults to current time if not provided.
     */
    updatedAt?: Date;
}
/**
 * Represents a file attachment on a task.
 *
 * Attachments enable users to associate files with tasks for reference,
 * documentation, or collaboration. Files are stored externally (S3, R2, local)
 * while this entity tracks metadata and ownership.
 *
 * ## Business Rules
 *
 * - File name (both stored and original) must be 1-255 characters
 * - Every attachment must belong to a task
 * - Every attachment must have an uploader
 * - File size must be greater than 0 and within limits (default 10MB max)
 * - MIME type must be a valid string
 * - Attachments are immutable - use business methods to create updated versions
 *
 * ## Immutability
 *
 * All update methods return a new Attachment instance.
 * Never modify properties directly.
 *
 * @example
 * ```typescript
 * // Create a new attachment (before upload)
 * const attachment = Attachment.create({
 *   taskId: 'task-123',
 *   userId: 'user-456',
 *   fileName: 'unique-id-document.pdf',
 *   originalName: 'document.pdf',
 *   mimeType: 'application/pdf',
 *   size: 1024000,
 *   storagePath: '/uploads/unique-id-document.pdf'
 * });
 *
 * // Mark as uploaded after successful upload
 * const uploaded = attachment.markAsUploaded();
 *
 * // Check file type
 * if (uploaded.isPDF()) {
 *   console.log('This is a PDF document');
 * }
 *
 * // Get human-readable size
 * console.log(`File size: ${uploaded.getFileSizeInMB().toFixed(2)} MB`);
 * ```
 *
 * @see {@link ../../shared/constants/limits.constants.ts | FILE_LIMITS}
 */
declare class Attachment extends Entity<AttachmentProps> {
    constructor(props: AttachmentProps, mode?: EntityMode);
    /**
     * Creates a new attachment with defaults applied.
     *
     * Factory method for creating attachments without manually
     * setting id, timestamps, and default values.
     *
     * @param props - Attachment properties (id, timestamps auto-generated)
     * @returns A new Attachment instance
     *
     * @example
     * ```typescript
     * const attachment = Attachment.create({
     *   taskId: 'task-123',
     *   userId: 'user-456',
     *   fileName: 'stored-name.pdf',
     *   originalName: 'document.pdf',
     *   mimeType: 'application/pdf',
     *   size: 1024000,
     *   storagePath: '/uploads/stored-name.pdf'
     * });
     * ```
     */
    static create(props: Omit<AttachmentProps, "id" | "isUploaded" | "uploadedAt" | "createdAt" | "updatedAt">): Attachment;
    get taskId(): string;
    get userId(): string;
    get fileName(): string;
    get originalName(): string;
    get mimeType(): string;
    get size(): number;
    get storagePath(): string;
    get isUploaded(): boolean;
    get uploadedAt(): Date | null | undefined;
    get createdAt(): Date;
    get updatedAt(): Date;
    /**
     * Marks the attachment as successfully uploaded.
     *
     * Sets the isUploaded flag to true and records the upload timestamp.
     * Use this after the file has been successfully stored.
     *
     * @returns A new Attachment instance marked as uploaded
     *
     * @example
     * ```typescript
     * const attachment = Attachment.create({ ... });
     * // After successful file upload...
     * const uploaded = attachment.markAsUploaded();
     * console.log(uploaded.isUploaded); // true
     * console.log(uploaded.uploadedAt); // Date object
     * ```
     */
    markAsUploaded(): Attachment;
    /**
     * Gets the file size in megabytes.
     *
     * @returns The file size in MB (decimal)
     *
     * @example
     * ```typescript
     * const attachment = Attachment.create({
     *   ...
     *   size: 5242880 // 5 MB
     * });
     * console.log(attachment.getFileSizeInMB()); // 5.0
     * ```
     */
    getFileSizeInMB(): number;
    /**
     * Gets the file size in kilobytes.
     *
     * @returns The file size in KB (decimal)
     *
     * @example
     * ```typescript
     * const attachment = Attachment.create({
     *   ...
     *   size: 102400 // ~100 KB
     * });
     * console.log(attachment.getFileSizeInKB()); // ~100.0
     * ```
     */
    getFileSizeInKB(): number;
    /**
     * Checks if the attachment is an image file.
     *
     * Determines file type by MIME type.
     *
     * @returns true if the file is an image, false otherwise
     *
     * @example
     * ```typescript
     * const attachment = Attachment.create({
     *   ...
     *   mimeType: 'image/jpeg'
     * });
     * if (attachment.isImage()) {
     *   console.log('This is an image file');
     * }
     * ```
     */
    isImage(): boolean;
    /**
     * Checks if the attachment is a PDF file.
     *
     * @returns true if the file is a PDF, false otherwise
     *
     * @example
     * ```typescript
     * const attachment = Attachment.create({
     *   ...
     *   mimeType: 'application/pdf'
     * });
     * if (attachment.isPDF()) {
     *   console.log('This is a PDF document');
     * }
     * ```
     */
    isPDF(): boolean;
    /**
     * Checks if the attachment is a document file.
     *
     * Documents include PDF, Word, Excel, PowerPoint, and text files.
     *
     * @returns true if the file is a document, false otherwise
     *
     * @example
     * ```typescript
     * const attachment = Attachment.create({
     *   ...
     *   mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
     * });
     * if (attachment.isDocument()) {
     *   console.log('This is a document file');
     * }
     * ```
     */
    isDocument(): boolean;
    /**
     * Gets the file extension from the original name.
     *
     * @returns The file extension including the dot (e.g., ".pdf"), or empty string if no extension
     *
     * @example
     * ```typescript
     * const attachment = Attachment.create({
     *   ...
     *   originalName: 'document.pdf'
     * });
     * console.log(attachment.getExtension()); // '.pdf'
     * ```
     */
    getExtension(): string;
    /**
     * Checks if the file size exceeds a given limit.
     *
     * @param maxSizeMB - Maximum size in megabytes
     * @returns true if the file is too large, false otherwise
     *
     * @example
     * ```typescript
     * const attachment = Attachment.create({
     *   ...
     *   size: 15 * 1024 * 1024 // 15 MB
     * });
     * if (attachment.isTooLarge(10)) {
     *   console.log('File exceeds 10 MB limit');
     * }
     * ```
     */
    isTooLarge(maxSizeMB: number): boolean;
    /**
     * Validates the task ID.
     *
     * @private
     * @param taskId - The task ID to validate
     * @throws {Error} If task ID is invalid
     */
    private validateTaskId;
    /**
     * Validates the user ID.
     *
     * @private
     * @param userId - The user ID to validate
     * @throws {Error} If user ID is invalid
     */
    private validateUserId;
    /**
     * Validates the file name.
     *
     * @private
     * @param fileName - The file name to validate
     * @throws {Error} If file name is invalid
     */
    private validateFileName;
    /**
     * Validates the original file name.
     *
     * @private
     * @param originalName - The original file name to validate
     * @throws {Error} If original name is invalid
     */
    private validateOriginalName;
    /**
     * Validates the MIME type.
     *
     * @private
     * @param mimeType - The MIME type to validate
     * @throws {Error} If MIME type is invalid
     */
    private validateMimeType;
    /**
     * Validates the file size.
     *
     * @private
     * @param size - The file size in bytes to validate
     * @throws {Error} If size is invalid
     */
    private validateSize;
    /**
     * Validates the storage path.
     *
     * @private
     * @param storagePath - The storage path to validate
     * @throws {Error} If storage path is invalid
     */
    private validateStoragePath;
    /**
     * Creates a draft version of this attachment.
     *
     * Draft mode skips validation, useful for forms before submission.
     *
     * @returns A new Attachment instance in draft mode
     *
     * @example
     * ```typescript
     * const draft = attachment.asDraft();
     * // Can now modify without validation
     * ```
     */
    asDraft(): this;
    /**
     * Converts this attachment to valid mode.
     *
     * Triggers validation of all properties.
     *
     * @returns A new Attachment instance in valid mode
     * @throws {Error} If any validation fails
     *
     * @example
     * ```typescript
     * const draft = new Attachment({ fileName: '' }, 'draft');
     * const valid = draft.asValid(); // Throws error if fileName is empty
     * ```
     */
    asValid(): this;
}

/**
 * Repository interface for Attachment entity persistence operations.
 *
 * This interface defines the contract for Attachment data access, providing CRUD
 * operations plus specialized methods for managing task attachments and storage metrics.
 * Attachments enable users to associate files with tasks for reference and collaboration.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaAttachmentRepository implements AttachmentRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async create(attachment: Attachment): Promise<Attachment> {
 *     const data = await this.prisma.attachment.create({
 *       data: {
 *         id: attachment.id,
 *         taskId: attachment.taskId,
 *         uploadedById: attachment.userId,
 *         filename: attachment.fileName,
 *         url: attachment.storagePath,
 *         mimeType: attachment.mimeType,
 *         filesize: attachment.size,
 *         uploadedAt: attachment.uploadedAt,
 *       }
 *     });
 *     return new Attachment({
 *       ...data,
 *       userId: data.uploadedById,
 *       originalName: data.filename,
 *       storagePath: data.url,
 *     });
 *   }
 *
 *   async findByTaskId(taskId: string): Promise<Attachment[]> {
 *     const attachments = await this.prisma.attachment.findMany({
 *       where: { taskId },
 *       orderBy: { uploadedAt: 'desc' }
 *     });
 *     return attachments.map(a => new Attachment({
 *       ...a,
 *       userId: a.uploadedById,
 *       originalName: a.filename,
 *       storagePath: a.url,
 *     }));
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/attachment.entity.ts | Attachment entity}
 */
interface AttachmentRepository {
    /**
     * Creates a new attachment in the repository.
     *
     * Used when a user uploads a file to a task. The attachment
     * should have all required fields populated before calling this method.
     *
     * @param attachment - The attachment entity to create (must be valid)
     * @returns Promise resolving to the created attachment with any database-generated fields populated
     * @throws {Error} If attachment validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * const attachment = Attachment.create({
     *   taskId: 'task-123',
     *   userId: 'user-456',
     *   fileName: 'unique-id-document.pdf',
     *   originalName: 'document.pdf',
     *   mimeType: 'application/pdf',
     *   size: 1024000,
     *   storagePath: '/uploads/unique-id-document.pdf'
     * });
     *
     * const created = await repository.create(attachment);
     * console.log(`Attachment created with ID: ${created.id}`);
     * ```
     */
    create(attachment: Attachment): Promise<Attachment>;
    /**
     * Updates an existing attachment in the repository.
     *
     * Used when updating attachment metadata, such as marking
     * an attachment as uploaded after file storage completes.
     *
     * @param attachment - The attachment entity with updated fields
     * @returns Promise resolving to the updated attachment
     * @throws {Error} If the attachment doesn't exist or validation fails
     *
     * @example
     * ```typescript
     * const existing = await repository.findById('attachment-123');
     * if (existing) {
     *   const uploaded = existing.markAsUploaded();
     *   await repository.update(uploaded);
     * }
     * ```
     */
    update(attachment: Attachment): Promise<Attachment>;
    /**
     * Finds an attachment by its unique ID.
     *
     * Used for fetching attachment details when the ID is known, such as from
     * a URL parameter or after creating/updating an attachment.
     *
     * @param id - The unique identifier of the attachment
     * @returns Promise resolving to the attachment if found, null otherwise
     *
     * @example
     * ```typescript
     * const attachment = await repository.findById('attachment-123');
     * if (attachment) {
     *   console.log(`Found attachment: ${attachment.originalName}`);
     * } else {
     *   console.log('Attachment not found');
     * }
     * ```
     */
    findById(id: string): Promise<Attachment | null>;
    /**
     * Finds all attachments for a specific task.
     *
     * Used for displaying the list of files attached to a task.
     * Returns attachments ordered by upload date (newest first).
     *
     * @param taskId - The task ID to find attachments for
     * @returns Promise resolving to an array of attachments (empty array if none found)
     *
     * @example
     * ```typescript
     * const attachments = await repository.findByTaskId('task-123');
     * console.log(`Found ${attachments.length} attachments`);
     *
     * // Render attachment list
     * attachments.forEach(attachment => {
     *   console.log(`${attachment.originalName} (${attachment.getFileSizeInMB().toFixed(2)} MB)`);
     * });
     * ```
     */
    findByTaskId(taskId: string): Promise<Attachment[]>;
    /**
     * Finds all attachments uploaded by a specific user.
     *
     * Used for displaying a user's upload history or activity feed.
     *
     * @param userId - The user ID to find attachments for
     * @returns Promise resolving to an array of attachments (empty array if none found)
     *
     * @example
     * ```typescript
     * const userAttachments = await repository.findByUserId('user-456');
     * console.log(`User has uploaded ${userAttachments.length} files`);
     * ```
     */
    findByUserId(userId: string): Promise<Attachment[]>;
    /**
     * Finds all attachments with a specific MIME type.
     *
     * Used for filtering attachments by file type, such as
     * showing only images or only documents.
     *
     * @param mimeType - The MIME type to filter by (e.g., "image/jpeg", "application/pdf")
     * @returns Promise resolving to an array of matching attachments
     *
     * @example
     * ```typescript
     * const images = await repository.findByMimeType('image/jpeg');
     * console.log(`Found ${images.length} JPEG images`);
     * ```
     */
    findByMimeType(mimeType: string): Promise<Attachment[]>;
    /**
     * Deletes an attachment from the repository.
     *
     * WARNING: This permanently deletes the attachment record from the database.
     * The actual file in storage should be deleted separately (typically in the service layer).
     *
     * @param id - The unique identifier of the attachment to delete
     * @returns Promise resolving when the deletion is complete
     * @throws {Error} If the attachment doesn't exist
     *
     * @example
     * ```typescript
     * await repository.delete('attachment-123');
     * console.log('Attachment record deleted');
     * // Note: Physical file deletion should be handled separately
     * ```
     */
    delete(id: string): Promise<void>;
    /**
     * Counts the total number of attachments for a specific task.
     *
     * Useful for displaying attachment counts in task lists and badges,
     * and for enforcing limits on attachments per task.
     *
     * @param taskId - The task ID to count attachments for
     * @returns Promise resolving to the count of attachments
     *
     * @example
     * ```typescript
     * const count = await repository.countByTaskId('task-123');
     * console.log(`Task has ${count} attachments`);
     * ```
     */
    countByTaskId(taskId: string): Promise<number>;
    /**
     * Gets the total file size for all attachments on a specific task.
     *
     * Useful for enforcing storage limits and displaying
     * storage usage statistics.
     *
     * @param taskId - The task ID to calculate total size for
     * @returns Promise resolving to the total size in bytes
     *
     * @example
     * ```typescript
     * const totalBytes = await repository.getTotalSizeByTaskId('task-123');
     * const totalMB = totalBytes / (1024 * 1024);
     * console.log(`Task attachments use ${totalMB.toFixed(2)} MB`);
     * ```
     */
    getTotalSizeByTaskId(taskId: string): Promise<number>;
    /**
     * Finds an attachment by its URL/storage path.
     *
     * Used for checking if an attachment exists with a specific URL,
     * such as when cleaning up orphaned files or verifying uniqueness.
     *
     * @param url - The URL or storage path to search for
     * @returns Promise resolving to the attachment if found, null otherwise
     *
     * @example
     * ```typescript
     * const attachment = await repository.findByUrl('/uploads/abc123-document.pdf');
     * if (attachment) {
     *   console.log('Attachment exists for this URL');
     * } else {
     *   console.log('No attachment found - file may be orphaned');
     * }
     * ```
     */
    findByUrl(url: string): Promise<Attachment | null>;
    /**
     * Finds all attachments for tasks within a specific project.
     *
     * Used for displaying all files attached to tasks in a project,
     * such as a project's file library or resource view.
     *
     * @param projectId - The project ID to find attachments for
     * @returns Promise resolving to an array of attachments (empty array if none found)
     *
     * @example
     * ```typescript
     * const projectAttachments = await repository.findByProjectId('project-123');
     * console.log(`Project has ${projectAttachments.length} total attachments`);
     *
     * // Group by task
     * const byTask = projectAttachments.reduce((acc, a) => {
     *   (acc[a.taskId] = acc[a.taskId] || []).push(a);
     *   return acc;
     * }, {});
     * ```
     */
    findByProjectId(projectId: string): Promise<Attachment[]>;
}

/**
 * Input for creating a new attachment.
 *
 * All fields are required.
 */
interface CreateAttachmentInput {
    /**
     * The ID of the task to attach the file to.
     * The task must exist for the attachment to be created.
     */
    taskId: string;
    /**
     * The ID of the user uploading the file.
     * This user will be recorded as the uploader.
     */
    userId: string;
    /**
     * The stored file name (may include UUID or timestamp prefix).
     * This is the actual name used in storage.
     */
    fileName: string;
    /**
     * The original file name as provided by the user.
     * This is the name that will be displayed in the UI.
     */
    originalName: string;
    /**
     * The MIME type of the file.
     * Used for content-type negotiation and file type detection.
     */
    mimeType: string;
    /**
     * The file size in bytes.
     * Must be greater than 0 and within size limits.
     */
    size: number;
    /**
     * The storage path or URL where the file is stored.
     * This can be a relative path, absolute URL, or cloud storage path.
     */
    storagePath: string;
}
/**
 * Use case for creating a new attachment on a task.
 *
 * This use case handles the creation of attachment records before
 * or after file upload completes. Attachments enable users to
 * associate files with tasks for reference and collaboration.
 *
 * ## Business Rules
 *
 * - The task must exist (checked via repository)
 * - File name (both stored and original) must be 1-255 characters
 * - User ID and task ID are required
 * - File size must be greater than 0 and within limits (default 10MB max)
 * - MIME type must be valid
 * - Storage path must be provided
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new CreateAttachmentUseCase(attachmentRepository);
 *
 * const attachment = await useCase.execute({
 *   taskId: 'task-123',
 *   userId: 'user-456',
 *   fileName: 'abc123-document.pdf',
 *   originalName: 'document.pdf',
 *   mimeType: 'application/pdf',
 *   size: 1024000,
 *   storagePath: '/uploads/abc123-document.pdf'
 * });
 *
 * console.log(`Attachment created: ${attachment.id}`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Task ID is missing or invalid
 * - User ID is missing or invalid
 * - File names are missing or too long
 * - MIME type is invalid
 * - File size is 0 or exceeds limits
 * - Storage path is missing
 * - Repository operations fail
 *
 * @see {@link ../model/attachment.entity.ts | Attachment entity}
 * @see {@link ../provider/attachment.repository.ts | AttachmentRepository}
 */
declare class CreateAttachmentUseCase implements UseCase<CreateAttachmentInput, Attachment> {
    private readonly attachmentRepository;
    constructor(attachmentRepository: AttachmentRepository);
    /**
     * Executes the create attachment use case.
     *
     * Creates a new attachment record on the specified task with the
     * provided file metadata. The attachment is validated before being persisted.
     *
     * @param input - The attachment creation input data
     * @param _loggedUser - Optional logged user context (not used in this use case)
     * @returns Promise resolving to the created attachment
     * @throws {Error} If validation fails or repository operation fails
     *
     * @example
     * ```typescript
     * const attachment = await useCase.execute({
     *   taskId: 'task-123',
     *   userId: 'user-456',
     *   fileName: 'unique-id-image.jpg',
     *   originalName: 'photo.jpg',
     *   mimeType: 'image/jpeg',
     *   size: 524288,
     *   storagePath: '/uploads/unique-id-image.jpg'
     * });
     * ```
     */
    execute(input: CreateAttachmentInput, _loggedUser?: unknown): Promise<Attachment>;
}

/**
 * Input for marking an attachment as uploaded.
 */
interface MarkAsUploadedInput {
    /**
     * The ID of the attachment to mark as uploaded.
     */
    attachmentId: string;
}
/**
 * Use case for marking an attachment as successfully uploaded.
 *
 * This use case handles updating an attachment's status after the file
 * has been successfully stored. This is typically called after the
 * upload process completes to record the upload timestamp.
 *
 * ## Business Rules
 *
 * - The attachment must exist
 * - The isUploaded flag is set to true
 * - The uploadedAt timestamp is recorded
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new MarkAsUploadedUseCase(attachmentRepository);
 *
 * // After successful file upload
 * await storageService.upload(file);
 * const attachment = await useCase.execute({
 *   attachmentId: 'attachment-123'
 * });
 *
 * console.log(`Attachment ${attachment.id} marked as uploaded`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Attachment ID is missing or invalid
 * - Attachment doesn't exist
 * - Repository operation fails
 *
 * @see {@link ../model/attachment.entity.ts | Attachment entity}
 * @see {@link ../provider/attachment.repository.ts | AttachmentRepository}
 */
declare class MarkAsUploadedUseCase implements UseCase<MarkAsUploadedInput, Attachment> {
    private readonly attachmentRepository;
    constructor(attachmentRepository: AttachmentRepository);
    /**
     * Executes the mark as uploaded use case.
     *
     * Marks an attachment as successfully uploaded by setting the
     * isUploaded flag to true and recording the upload timestamp.
     *
     * @param input - The input containing the attachment ID
     * @param _loggedUser - Optional logged user context (not used in this use case)
     * @returns Promise resolving to the updated attachment
     * @throws {Error} If attachment ID is invalid or attachment not found
     *
     * @example
     * ```typescript
     * // After successful upload
     * const attachment = await useCase.execute({
     *   attachmentId: 'attachment-123'
     * });
     * console.log(attachment.isUploaded); // true
     * console.log(attachment.uploadedAt); // Date object
     * ```
     */
    execute(input: MarkAsUploadedInput, _loggedUser?: unknown): Promise<Attachment>;
}

/**
 * Input for deleting an attachment.
 */
interface DeleteAttachmentInput {
    /**
     * The ID of the attachment to delete.
     */
    attachmentId: string;
    /**
     * The ID of the user attempting to delete the attachment.
     * Must be the original uploader of the attachment.
     */
    userId: string;
}
/**
 * Use case for deleting an attachment.
 *
 * This use case handles the deletion of attachment records by their uploaders.
 * Note: Physical file deletion should be handled separately in the service layer
 * as it's a cross-cutting concern (storage provider specifics).
 *
 * ## Business Rules
 *
 * - Only the attachment uploader can delete their own attachment
 * - Deletion of the database record is permanent
 * - Physical file deletion is handled separately (service layer concern)
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new DeleteAttachmentUseCase(attachmentRepository);
 *
 * await useCase.execute({
 *   attachmentId: 'attachment-123',
 *   userId: 'user-456'
 * });
 *
 * // Delete physical file separately
 * await storageService.deleteFile(filePath);
 *
 * console.log('Attachment deleted');
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Attachment ID is missing or invalid
 * - User ID is missing or invalid
 * - Attachment doesn't exist
 * - User is not the attachment uploader
 *
 * @see {@link ../model/attachment.entity.ts | Attachment entity}
 * @see {@link ../provider/attachment.repository.ts | AttachmentRepository}
 */
declare class DeleteAttachmentUseCase implements UseCase<DeleteAttachmentInput, void> {
    private readonly attachmentRepository;
    constructor(attachmentRepository: AttachmentRepository);
    /**
     * Executes the delete attachment use case.
     *
     * Permanently deletes the attachment record if the user is the uploader.
     * Physical file deletion should be handled separately.
     *
     * @param input - The delete input data
     * @param _loggedUser - Optional logged user context (not used in this use case)
     * @returns Promise that resolves when the attachment record is deleted
     * @throws {Error} If validation fails or user is not the uploader
     *
     * @example
     * ```typescript
     * await useCase.execute({
     *   attachmentId: 'attachment-123',
     *   userId: 'user-456'
     * });
     * // Note: Remember to delete the physical file separately
     * ```
     */
    execute(input: DeleteAttachmentInput, _loggedUser?: unknown): Promise<void>;
}

/**
 * Input for retrieving attachments by task.
 */
interface GetAttachmentsByTaskInput {
    /**
     * The ID of the task to retrieve attachments for.
     */
    taskId: string;
}
/**
 * Use case for retrieving all attachments for a specific task.
 *
 * This use case handles fetching the complete list of file attachments
 * for a task, which is essential for displaying task resources in the UI.
 *
 * ## Business Rules
 *
 * - Returns all attachments for the specified task
 * - Attachments are ordered by upload date (newest first)
 * - Returns an empty array if no attachments exist
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new GetAttachmentsByTaskUseCase(attachmentRepository);
 *
 * const attachments = await useCase.execute({
 *   taskId: 'task-123'
 * });
 *
 * console.log(`Found ${attachments.length} attachments`);
 * attachments.forEach(attachment => {
 *   console.log(`${attachment.originalName} (${attachment.getFileSizeInMB().toFixed(2)} MB)`);
 * });
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Task ID is missing or invalid
 * - Repository operation fails
 *
 * Returns an empty array (not an error) if:
 * - Task has no attachments
 *
 * @see {@link ../model/attachment.entity.ts | Attachment entity}
 * @see {@link ../provider/attachment.repository.ts | AttachmentRepository}
 */
declare class GetAttachmentsByTaskUseCase implements UseCase<GetAttachmentsByTaskInput, Attachment[]> {
    private readonly attachmentRepository;
    constructor(attachmentRepository: AttachmentRepository);
    /**
     * Executes the get attachments by task use case.
     *
     * Retrieves all attachments for the specified task, ordered by
     * upload date (newest first).
     *
     * @param input - The input containing the task ID
     * @param _loggedUser - Optional logged user context (not used in this use case)
     * @returns Promise resolving to an array of attachments (empty if none found)
     * @throws {Error} If task ID is invalid or repository operation fails
     *
     * @example
     * ```typescript
     * const attachments = await useCase.execute({
     *   taskId: 'task-123'
     * });
     *
     * // Display attachments in UI
     * return (
     *   <AttachmentList attachments={attachments} />
     * );
     * ```
     */
    execute(input: GetAttachmentsByTaskInput, _loggedUser?: unknown): Promise<Attachment[]>;
}

/**
 * Input for retrieving attachments by user.
 */
interface GetAttachmentsByUserInput {
    /**
     * The ID of the user to retrieve attachments for.
     */
    userId: string;
}
/**
 * Use case for retrieving all attachments uploaded by a specific user.
 *
 * This use case handles fetching a user's complete upload history,
 * which is useful for activity feeds and user profile pages.
 *
 * ## Business Rules
 *
 * - Returns all attachments uploaded by the specified user
 * - Attachments are ordered by upload date (newest first)
 * - Returns an empty array if user has no attachments
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new GetAttachmentsByUserUseCase(attachmentRepository);
 *
 * const attachments = await useCase.execute({
 *   userId: 'user-456'
 * });
 *
 * console.log(`User has uploaded ${attachments.length} files`);
 * const totalSize = attachments.reduce((sum, a) => sum + a.size, 0);
 * console.log(`Total storage used: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - User ID is missing or invalid
 * - Repository operation fails
 *
 * Returns an empty array (not an error) if:
 * - User has not uploaded any attachments
 *
 * @see {@link ../model/attachment.entity.ts | Attachment entity}
 * @see {@link ../provider/attachment.repository.ts | AttachmentRepository}
 */
declare class GetAttachmentsByUserUseCase implements UseCase<GetAttachmentsByUserInput, Attachment[]> {
    private readonly attachmentRepository;
    constructor(attachmentRepository: AttachmentRepository);
    /**
     * Executes the get attachments by user use case.
     *
     * Retrieves all attachments uploaded by the specified user.
     *
     * @param input - The input containing the user ID
     * @param _loggedUser - Optional logged user context (not used in this use case)
     * @returns Promise resolving to an array of attachments (empty if none found)
     * @throws {Error} If user ID is invalid or repository operation fails
     *
     * @example
     * ```typescript
     * const attachments = await useCase.execute({
     *   userId: 'user-456'
     * });
     *
     * // Display in user profile
     * return (
     *   <UserUploads attachments={attachments} />
     * );
     * ```
     */
    execute(input: GetAttachmentsByUserInput, _loggedUser?: unknown): Promise<Attachment[]>;
}

/**
 * Input for retrieving an attachment by ID.
 */
interface GetAttachmentByIdInput {
    /**
     * The ID of the attachment to retrieve.
     */
    attachmentId: string;
}
/**
 * Use case for retrieving a single attachment by its ID.
 *
 * This use case handles fetching attachment details when the ID is known,
 * such as from a URL parameter or after list filtering.
 *
 * ## Business Rules
 *
 * - Returns the attachment if found
 * - Throws an error if attachment doesn't exist
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new GetAttachmentByIdUseCase(attachmentRepository);
 *
 * const attachment = await useCase.execute({
 *   attachmentId: 'attachment-123'
 * });
 *
 * console.log(`Found: ${attachment.originalName}`);
 * console.log(`Size: ${attachment.getFileSizeInMB().toFixed(2)} MB`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Attachment ID is missing or invalid
 * - Attachment doesn't exist
 * - Repository operation fails
 *
 * @see {@link ../model/attachment.entity.ts | Attachment entity}
 * @see {@link ../link provider/attachment.repository.ts | AttachmentRepository}
 */
declare class GetAttachmentByIdUseCase implements UseCase<GetAttachmentByIdInput, Attachment> {
    private readonly attachmentRepository;
    constructor(attachmentRepository: AttachmentRepository);
    /**
     * Executes the get attachment by ID use case.
     *
     * Retrieves a single attachment by its unique identifier.
     *
     * @param input - The input containing the attachment ID
     * @param _loggedUser - Optional logged user context (not used in this use case)
     * @returns Promise resolving to the attachment
     * @throws {Error} If attachment ID is invalid or attachment not found
     *
     * @example
     * ```typescript
     * const attachment = await useCase.execute({
     *   attachmentId: 'attachment-123'
     * });
     *
     * // Display attachment details
     * return (
     *   <AttachmentDetails attachment={attachment} />
     * );
     * ```
     */
    execute(input: GetAttachmentByIdInput, _loggedUser?: unknown): Promise<Attachment>;
}

/**
 * Notification type enum.
 *
 * Represents the category or reason for the notification.
 * These types determine how notifications are displayed and grouped.
 *
 * @example
 * ```typescript
 * const type = NotificationType.TASK_ASSIGNED;
 * ```
 */
declare enum NotificationType {
    /** User was assigned to a task */
    TASK_ASSIGNED = "TASK_ASSIGNED",
    /** New comment added to a task */
    COMMENT_ADDED = "COMMENT_ADDED",
    /** User was mentioned in a comment */
    MENTIONED = "MENTIONED",
    /** Task due date is approaching */
    DUE_DATE_APPROACHING = "DUE_DATE_APPROACHING",
    /** User received a workspace invitation */
    INVITATION_RECEIVED = "INVITATION_RECEIVED",
    /** System-generated notification */
    SYSTEM = "SYSTEM",
    /** Task was completed */
    TASK_COMPLETED = "TASK_COMPLETED",
    /** Task status changed */
    TASK_STATUS_CHANGED = "TASK_STATUS_CHANGED",
    /** User was added to a workspace */
    WORKSPACE_ADDED = "WORKSPACE_ADDED",
    /** Project status changed */
    PROJECT_UPDATED = "PROJECT_UPDATED"
}
/**
 * Resource type enum.
 *
 * Represents the entity type that the notification refers to.
 * Used for polymorphic associations and navigation.
 */
declare enum ResourceType {
    /** Notification refers to a task */
    TASK = "TASK",
    /** Notification refers to a project */
    PROJECT = "PROJECT",
    /** Notification refers to a workspace */
    WORKSPACE = "WORKSPACE",
    /** Notification refers to a comment */
    COMMENT = "COMMENT"
}
/**
 * Properties for creating a Notification entity.
 *
 * Notifications represent messages sent to users about relevant events
 * in their workspace, such as task assignments, mentions, and due dates.
 *
 * @example
 * ```typescript
 * const notification = new Notification({
 *   userId: 'user-123',
 *   type: NotificationType.TASK_ASSIGNED,
 *   title: 'New task assigned',
 *   message: 'You have been assigned to "Complete documentation"',
 *   resourceId: 'task-456',
 *   resourceType: ResourceType.TASK
 * });
 * ```
 */
interface NotificationProps extends EntityProps {
    /**
     * The ID of the user who will receive this notification.
     * Required - every notification must have a recipient.
     */
    userId: string;
    /**
     * The type/category of this notification.
     * Required - determines how the notification is displayed.
     */
    type: NotificationType;
    /**
     * The notification title/headline.
     * Required - must be between 1 and 200 characters.
     */
    title: string;
    /**
     * Optional detailed message.
     * If provided, must be between 1 and 1000 characters.
     */
    message?: string | null;
    /**
     * Optional ID of the related resource (task, project, etc.).
     * Used for navigation and deep linking.
     */
    resourceId?: string | null;
    /**
     * Optional type of the related resource.
     * Used with resourceId for polymorphic associations.
     */
    resourceType?: ResourceType | null;
    /**
     * Optional metadata for navigation (e.g., workspaceId, projectId).
     * Stored as JSON in the database.
     */
    metadata?: Record<string, unknown> | null;
    /**
     * Whether the notification has been read by the user.
     * Defaults to false for new notifications.
     */
    isRead?: boolean;
    /**
     * Timestamp when the notification was marked as read.
     * Null if the notification is unread.
     */
    readAt?: Date | null;
    /**
     * Timestamp when the notification was created.
     * Defaults to current time if not provided.
     */
    createdAt?: Date;
    /**
     * Timestamp when the notification was last updated.
     * Defaults to current time if not provided.
     */
    updatedAt?: Date;
}
/**
 * Represents a notification for a user.
 *
 * Notifications keep users informed about relevant events in their workspace,
 * such as task assignments, mentions, comments, and approaching due dates.
 *
 * ## Business Rules
 *
 * - Title must be between 1 and 200 characters
 * - Message (if provided) must be between 1 and 1000 characters
 * - Every notification must have a recipient (userId)
 * - Every notification must have a type
 * - Notifications are immutable - use business methods to create updated versions
 *
 * ## Immutability
 *
 * All update methods return a new Notification instance.
 * Never modify properties directly.
 *
 * @example
 * ```typescript
 * // Create a new notification
 * const notification = Notification.create({
 *   userId: 'user-123',
 *   type: NotificationType.TASK_ASSIGNED,
 *   title: 'New task assigned',
 *   message: 'You have been assigned to "Complete documentation"',
 *   resourceId: 'task-456',
 *   resourceType: ResourceType.TASK,
 *   metadata: { workspaceId: 'ws-789' }
 * });
 *
 * // Mark as read
 * const read = notification.markAsRead();
 * console.log(read.isRead); // true
 * console.log(read.readAt); // Date object
 *
 * // Check if high priority
 * if (notification.isOlderThan(7 * 24 * 60 * 60 * 1000)) {
 *   console.log('This notification is more than a week old');
 * }
 * ```
 *
 * @see {@link ../../shared/constants/limits.constants.ts | NOTIFICATION_LIMITS}
 */
declare class Notification extends Entity<NotificationProps> {
    constructor(props: NotificationProps, mode?: EntityMode);
    /**
     * Creates a new notification with defaults applied.
     *
     * Factory method for creating notifications without manually
     * setting id, timestamps, and default values.
     *
     * @param props - Notification properties (id, timestamps auto-generated)
     * @returns A new Notification instance
     *
     * @example
     * ```typescript
     * const notification = Notification.create({
     *   userId: 'user-123',
     *   type: NotificationType.TASK_ASSIGNED,
     *   title: 'New task assigned',
     *   message: 'You have been assigned to a new task'
     * });
     * ```
     */
    static create(props: Omit<NotificationProps, "id" | "isRead" | "readAt" | "createdAt" | "updatedAt">): Notification;
    get userId(): string;
    get type(): NotificationType;
    get title(): string;
    get message(): string | null | undefined;
    get resourceId(): string | null | undefined;
    get resourceType(): ResourceType | null | undefined;
    get metadata(): Record<string, unknown> | null | undefined;
    get isRead(): boolean;
    get readAt(): Date | null | undefined;
    get createdAt(): Date;
    get updatedAt(): Date;
    /**
     * Marks the notification as read.
     *
     * Sets the isRead flag to true and records the read timestamp.
     * If already read, returns the same notification (idempotent).
     *
     * @returns A new Notification instance marked as read
     *
     * @example
     * ```typescript
     * const notification = Notification.create({ ... });
     * const read = notification.markAsRead();
     * console.log(read.isRead); // true
     * console.log(read.readAt); // Date object
     * ```
     */
    markAsRead(): Notification;
    /**
     * Marks the notification as unread.
     *
     * Sets the isRead flag to false and clears the read timestamp.
     * If already unread, returns the same notification (idempotent).
     *
     * @returns A new Notification instance marked as unread
     *
     * @example
     * ```typescript
     * const readNotification = notification.markAsRead();
     * const unread = readNotification.markAsUnread();
     * console.log(unread.isRead); // false
     * console.log(unread.readAt); // null
     * ```
     */
    markAsUnread(): Notification;
    /**
     * Checks if the notification is expired.
     *
     * Currently returns false as notifications don't have an expiration
     * timestamp in the base schema. This method is provided for future
     * extensibility.
     *
     * @returns true if the notification is expired, false otherwise
     *
     * @example
     * ```typescript
     * if (!notification.isExpired()) {
     *   // Display the notification
     * }
     * ```
     */
    isExpired(): boolean;
    /**
     * Checks if the notification is high priority.
     *
     * High priority notifications include task assignments, mentions,
     * and due date approaching. These should be displayed more prominently.
     *
     * @returns true if the notification is high priority, false otherwise
     *
     * @example
     * ```typescript
     * if (notification.isHighPriority()) {
     *   // Show with special styling or sound
     * }
     * ```
     */
    isHighPriority(): boolean;
    /**
     * Checks if the notification has an associated resource.
     *
     * Notifications with resources can provide deep links to the
     * relevant task, project, or other entity.
     *
     * @returns true if the notification has a resourceId, false otherwise
     *
     * @example
     * ```typescript
     * if (notification.isActionable()) {
     *   // Show "View" button that links to the resource
     * }
     * ```
     */
    isActionable(): boolean;
    /**
     * Gets the age of the notification in milliseconds.
     *
     * @returns The age in milliseconds since creation
     *
     * @example
     * ```typescript
     * const ageInMinutes = notification.getAge() / 60000;
     * console.log(`Notification is ${ageInMinutes} minutes old`);
     * ```
     */
    getAge(): number;
    /**
     * Checks if the notification is older than a specified time.
     *
     * Useful for filtering out stale notifications or applying
     * different display rules based on age.
     *
     * @param ms - The age threshold in milliseconds
     * @returns true if the notification is older than the threshold, false otherwise
     *
     * @example
     * ```typescript
     * // Check if notification is more than a day old
     * if (notification.isOlderThan(24 * 60 * 60 * 1000)) {
     *   console.log('This notification is old');
     * }
     * ```
     */
    isOlderThan(ms: number): boolean;
    /**
     * Gets the metadata value for a specific key.
     *
     * @param key - The metadata key to retrieve
     * @param defaultValue - The default value if the key doesn't exist
     * @returns The metadata value or the default
     *
     * @example
     * ```typescript
     * const workspaceId = notification.getMetadata('workspaceId', '');
     * const projectId = notification.getMetadata<string>('projectId');
     * ```
     */
    getMetadata<T = unknown>(key: string, defaultValue?: T): T | undefined;
    /**
     * Checks if this is a task-related notification.
     *
     * @returns true if the notification refers to a task, false otherwise
     *
     * @example
     * ```typescript
     * if (notification.isTaskNotification()) {
     *   console.log('Navigate to task:', notification.resourceId);
     * }
     * ```
     */
    isTaskNotification(): boolean;
    /**
     * Checks if this is a project-related notification.
     *
     * @returns true if the notification refers to a project, false otherwise
     *
     * @example
     * ```typescript
     * if (notification.isProjectNotification()) {
     *   console.log('Navigate to project:', notification.resourceId);
     * }
     * ```
     */
    isProjectNotification(): boolean;
    /**
     * Checks if this is a workspace-related notification.
     *
     * @returns true if the notification refers to a workspace, false otherwise
     *
     * @example
     * ```typescript
     * if (notification.isWorkspaceNotification()) {
     *   console.log('Navigate to workspace:', notification.resourceId);
     * }
     * ```
     */
    isWorkspaceNotification(): boolean;
    /**
     * Validates the user ID.
     *
     * @private
     * @param userId - The user ID to validate
     * @throws {Error} If user ID is invalid
     */
    private validateUserId;
    /**
     * Validates the notification type.
     *
     * @private
     * @param type - The notification type to validate
     * @throws {Error} If type is invalid
     */
    private validateType;
    /**
     * Validates the notification title.
     *
     * @private
     * @param title - The title to validate
     * @throws {Error} If title is invalid
     */
    private validateTitle;
    /**
     * Validates the notification message.
     *
     * @private
     * @param message - The message to validate (optional)
     * @throws {Error} If message is invalid
     */
    private validateMessage;
    /**
     * Validates the resource type.
     *
     * @private
     * @param resourceType - The resource type to validate (optional)
     * @throws {Error} If resource type is invalid
     */
    private validateResourceType;
    /**
     * Validates the resource ID.
     *
     * @private
     * @param resourceId - The resource ID to validate (optional)
     * @throws {Error} If resource ID is invalid
     */
    private validateResourceId;
    /**
     * Validates the metadata object.
     *
     * @private
     * @param metadata - The metadata to validate (optional)
     * @throws {Error} If metadata is invalid
     */
    private validateMetadata;
    /**
     * Creates a draft version of this notification.
     *
     * Draft mode skips validation, useful for forms before submission.
     *
     * @returns A new Notification instance in draft mode
     *
     * @example
     * ```typescript
     * const draft = notification.asDraft();
     * // Can now modify without validation
     * ```
     */
    asDraft(): this;
    /**
     * Converts this notification to valid mode.
     *
     * Triggers validation of all properties.
     *
     * @returns A new Notification instance in valid mode
     * @throws {Error} If any validation fails
     *
     * @example
     * ```typescript
     * const draft = new Notification({ title: '' }, 'draft');
     * const valid = draft.asValid(); // Throws error if title is empty
     * ```
     */
    asValid(): this;
}

/**
 * Repository interface for Notification entity persistence operations.
 *
 * This interface defines the contract for Notification data access, providing CRUD
 * operations plus specialized methods for managing user notifications, filtering
 * by read status, type, and bulk operations. Notifications keep users informed
 * about relevant events in their workspace.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaNotificationRepository implements NotificationRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async create(notification: Notification): Promise<Notification> {
 *     const data = await this.prisma.notification.create({
 *       data: {
 *         id: notification.id,
 *         userId: notification.userId,
 *         type: notification.type,
 *         title: notification.title,
 *         message: notification.message,
 *         resourceId: notification.resourceId,
 *         resourceType: notification.resourceType,
 *         metadata: notification.metadata,
 *         isRead: notification.isRead,
 *         readAt: notification.readAt,
 *         createdAt: notification.createdAt,
 *         updatedAt: notification.updatedAt,
 *       }
 *     });
 *     return new Notification(data);
 *   }
 *
 *   async findByUserId(userId: string): Promise<Notification[]> {
 *     const notifications = await this.prisma.notification.findMany({
 *       where: { userId },
 *       orderBy: { createdAt: 'desc' }
 *     });
 *     return notifications.map(n => new Notification(n));
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/notification.entity.ts | Notification entity}
 */
interface NotificationRepository {
    /**
     * Creates a new notification in the repository.
     *
     * Used when a new notification needs to be sent to a user. The notification
     * should have all required fields populated before calling this method.
     *
     * @param notification - The notification entity to create (must be valid)
     * @returns Promise resolving to the created notification with any database-generated fields populated
     * @throws {Error} If notification validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * const notification = Notification.create({
     *   userId: 'user-123',
     *   type: NotificationType.TASK_ASSIGNED,
     *   title: 'New task assigned',
     *   message: 'You have been assigned to "Complete documentation"'
     * });
     *
     * const created = await repository.create(notification);
     * console.log(`Notification created with ID: ${created.id}`);
     * ```
     */
    create(notification: Notification): Promise<Notification>;
    /**
     * Updates an existing notification in the repository.
     *
     * Used when a notification's state changes, such as marking as read/unread.
     * The notification entity should already exist and be valid before calling this method.
     *
     * @param notification - The notification entity with updated fields
     * @returns Promise resolving to the updated notification
     * @throws {Error} If the notification doesn't exist or validation fails
     *
     * @example
     * ```typescript
     * const existing = await repository.findById('notif-123');
     * if (existing) {
     *   const updated = existing.markAsRead();
     *   await repository.update(updated);
     * }
     * ```
     */
    update(notification: Notification): Promise<Notification>;
    /**
     * Finds a notification by its unique ID.
     *
     * Used for fetching notification details when the ID is known, such as from
     * a URL parameter or after creating/updating a notification.
     *
     * @param id - The unique identifier of the notification
     * @returns Promise resolving to the notification if found, null otherwise
     *
     * @example
     * ```typescript
     * const notification = await repository.findById('notif-123');
     * if (notification) {
     *   console.log(`Found notification: ${notification.title}`);
     * } else {
     *   console.log('Notification not found');
     * }
     * ```
     */
    findById(id: string): Promise<Notification | null>;
    /**
     * Finds all notifications for a specific user.
     *
     * Used for displaying the notification list for a user.
     * Returns notifications ordered by creation time (newest first).
     *
     * @param userId - The user ID to find notifications for
     * @returns Promise resolving to an array of notifications (empty array if none found)
     *
     * @example
     * ```typescript
     * const notifications = await repository.findByUserId('user-123');
     * console.log(`Found ${notifications.length} notifications`);
     *
     * // Render notification list
     * notifications.forEach(notification => {
     *   console.log(`${notification.type}: ${notification.title}`);
     * });
     * ```
     */
    findByUserId(userId: string): Promise<Notification[]>;
    /**
     * Finds all unread notifications for a specific user.
     *
     * Used for displaying the unread notification count and list.
     * Notifications are ordered by creation time (newest first).
     *
     * @param userId - The user ID to find unread notifications for
     * @returns Promise resolving to an array of unread notifications (empty array if none found)
     *
     * @example
     * ```typescript
     * const unreadNotifications = await repository.findUnreadByUserId('user-456');
     * console.log(`User has ${unreadNotifications.length} unread notifications`);
     *
     * // Show unread badge
     * if (unreadNotifications.length > 0) {
     *   showBadge(unreadNotifications.length);
     * }
     * ```
     */
    findUnreadByUserId(userId: string): Promise<Notification[]>;
    /**
     * Finds all read notifications for a specific user.
     *
     * Used for displaying the read notification history.
     * Notifications are ordered by creation time (newest first).
     *
     * @param userId - The user ID to find read notifications for
     * @returns Promise resolving to an array of read notifications (empty array if none found)
     *
     * @example
     * ```typescript
     * const readNotifications = await repository.findReadByUserId('user-789');
     * console.log(`User has read ${readNotifications.length} notifications`);
     * ```
     */
    findReadByUserId(userId: string): Promise<Notification[]>;
    /**
     * Finds all notifications of a specific type for a user.
     *
     * Used for filtering notifications by type/category.
     *
     * @param userId - The user ID to find notifications for
     * @param type - The notification type to filter by
     * @returns Promise resolving to an array of notifications of the specified type
     *
     * @example
     * ```typescript
     * const taskNotifications = await repository.findByType(
     *   'user-123',
     *   NotificationType.TASK_ASSIGNED
     * );
     * console.log(`Found ${taskNotifications.length} task assignment notifications`);
     * ```
     */
    findByType(userId: string, type: NotificationType): Promise<Notification[]>;
    /**
     * Finds all notifications of a specific priority level for a user.
     *
     * Used for displaying high-priority notifications separately.
     * High priority types include: TASK_ASSIGNED, MENTIONED, DUE_DATE_APPROACHING.
     *
     * @param userId - The user ID to find notifications for
     * @param priority - The priority level filter ('high' or 'low')
     * @returns Promise resolving to an array of notifications matching the priority
     *
     * @example
     * ```typescript
     * const importantNotifications = await repository.findByPriority('user-123', 'high');
     * // Display with special styling
     * ```
     */
    findByPriority(userId: string, priority: "high" | "low"): Promise<Notification[]>;
    /**
     * Deletes a notification from the repository.
     *
     * WARNING: This permanently deletes the notification and cannot be undone.
     *
     * @param id - The unique identifier of the notification to delete
     * @returns Promise resolving when the deletion is complete
     * @throws {Error} If the notification doesn't exist
     *
     * @example
     * ```typescript
     * await repository.delete('notif-123');
     * console.log('Notification deleted permanently');
     * ```
     */
    delete(id: string): Promise<void>;
    /**
     * Marks all notifications as read for a specific user.
     *
     * Used for bulk "mark all as read" functionality.
     * More efficient than updating each notification individually.
     *
     * @param userId - The user ID to mark all notifications as read for
     * @returns Promise resolving when the bulk update is complete
     *
     * @example
     * ```typescript
     * await repository.markAllAsRead('user-123');
     * console.log('All notifications marked as read');
     * ```
     */
    markAllAsRead(userId: string): Promise<void>;
    /**
     * Counts the total number of unread notifications for a specific user.
     *
     * Useful for displaying notification badges and counts.
     * More efficient than fetching all unread notifications.
     *
     * @param userId - The user ID to count unread notifications for
     * @returns Promise resolving to the count of unread notifications
     *
     * @example
     * ```typescript
     * const count = await repository.countUnreadByUserId('user-123');
     * console.log(`User has ${count} unread notifications`);
     *
     * // Display badge
     * if (count > 0) {
     *   showBadge(count);
     * }
     * ```
     */
    countUnreadByUserId(userId: string): Promise<number>;
    /**
     * Deletes all expired notifications from the repository.
     *
     * Used for periodic cleanup of old notifications.
     * Currently returns 0 as notifications don't have expiration.
     * This method is provided for future extensibility.
     *
     * @returns Promise resolving to the number of notifications deleted
     *
     * @example
     * ```typescript
     * // Run daily cleanup job
     * const deleted = await repository.deleteExpired();
     * console.log(`Cleaned up ${deleted} expired notifications`);
     * ```
     */
    deleteExpired(): Promise<number>;
    /**
     * Deletes notifications older than a specified number of days.
     *
     * Used for periodic cleanup of old, read notifications.
     *
     * @param days - The number of days (notifications older than this will be deleted)
     * @returns Promise resolving to the number of notifications deleted
     *
     * @example
     * ```typescript
     * // Delete notifications older than 30 days
     * const deleted = await repository.deleteOlderThan(30);
     * console.log(`Deleted ${deleted} old notifications`);
     * ```
     */
    deleteOlderThan(days: number): Promise<number>;
}

/**
 * Input for creating a new notification.
 *
 * All fields are required unless marked optional.
 */
interface CreateNotificationInput {
    /**
     * The ID of the user who will receive this notification.
     * The user must exist for the notification to be created.
     */
    userId: string;
    /**
     * The type/category of this notification.
     * Determines how the notification is displayed and grouped.
     */
    type: NotificationType;
    /**
     * The notification title/headline.
     * Must be between 1 and 200 characters.
     */
    title: string;
    /**
     * Optional detailed message.
     * If provided, must be between 1 and 1000 characters.
     */
    message?: string;
    /**
     * Optional ID of the related resource (task, project, etc.).
     * Used for navigation and deep linking.
     */
    resourceId?: string;
    /**
     * Optional type of the related resource.
     * Used with resourceId for polymorphic associations.
     */
    resourceType?: ResourceType;
    /**
     * Optional metadata for navigation (e.g., workspaceId, projectId).
     * Stored as JSON in the database.
     */
    metadata?: Record<string, unknown>;
}
/**
 * Use case for creating a new notification.
 *
 * This use case handles the creation of notifications, which keep
 * users informed about relevant events in their workspace.
 *
 * ## Business Rules
 *
 * - The user must exist (checked via repository)
 * - Title must be between 1 and 200 characters
 * - Message (if provided) must be between 1 and 1000 characters
 * - User ID is required
 * - Type must be a valid NotificationType
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new CreateNotificationUseCase(notificationRepository);
 *
 * const notification = await useCase.execute({
 *   userId: 'user-123',
 *   type: NotificationType.TASK_ASSIGNED,
 *   title: 'New task assigned',
 *   message: 'You have been assigned to "Complete documentation"',
 *   resourceId: 'task-456',
 *   resourceType: ResourceType.TASK,
 *   metadata: { workspaceId: 'ws-789' }
 * });
 *
 * console.log(`Notification created: ${notification.id}`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - User ID is missing or invalid
 * - Type is invalid
 * - Title is empty or too long
 * - Message is too long
 * - Repository operations fail
 *
 * @see {@link ../model/notification.entity.ts | Notification entity}
 * @see {@link ../provider/notification.repository.ts | NotificationRepository}
 */
declare class CreateNotificationUseCase implements UseCase<CreateNotificationInput, Notification> {
    private readonly notificationRepository;
    constructor(notificationRepository: NotificationRepository);
    /**
     * Executes the create notification use case.
     *
     * Creates a new notification with the provided data.
     * The notification is validated before being persisted.
     *
     * @param input - The notification creation input data
     * @param _loggedUser - Optional logged user context (not used in this use case)
     * @returns Promise resolving to the created notification
     * @throws {Error} If validation fails or repository operation fails
     *
     * @example
     * ```typescript
     * const notification = await useCase.execute({
     *   userId: 'user-123',
     *   type: NotificationType.COMMENT_ADDED,
     *   title: 'New comment on your task',
     *   message: 'Someone commented on your task'
     * });
     * ```
     */
    execute(input: CreateNotificationInput, _loggedUser?: unknown): Promise<Notification>;
}

/**
 * Input for marking a notification as read.
 *
 * Both fields are required to ensure the user owns the notification.
 */
interface MarkAsReadInput {
    /**
     * The ID of the notification to mark as read.
     */
    notificationId: string;
    /**
     * The ID of the user who owns the notification.
     * Used to verify ownership before marking as read.
     */
    userId: string;
}
/**
 * Use case for marking a notification as read.
 *
 * This use case handles marking a specific notification as read,
 * which updates the isRead flag and sets the readAt timestamp.
 *
 * ## Business Rules
 *
 * - The notification must exist
 * - The notification must belong to the user
 * - If already read, returns the notification unchanged (idempotent)
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new MarkAsReadUseCase(notificationRepository);
 *
 * const notification = await useCase.execute({
 *   notificationId: 'notif-123',
 *   userId: 'user-456'
 * });
 *
 * console.log(`Notification marked as read at: ${notification.readAt}`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Notification ID is missing
 * - User ID is missing
 * - Notification doesn't exist
 * - User doesn't own the notification
 * - Repository operations fail
 *
 * @see {@link ../model/notification.entity.ts | Notification entity}
 * @see {@link ../provider/notification.repository.ts | NotificationRepository}
 */
declare class MarkAsReadUseCase implements UseCase<MarkAsReadInput, Notification> {
    private readonly notificationRepository;
    constructor(notificationRepository: NotificationRepository);
    /**
     * Executes the mark as read use case.
     *
     * Finds the notification, verifies ownership, and marks it as read.
     *
     * @param input - The mark as read input data
     * @param _loggedUser - Optional logged user context (not used in this use case)
     * @returns Promise resolving to the updated notification
     * @throws {Error} If validation fails or repository operation fails
     *
     * @example
     * ```typescript
     * const notification = await useCase.execute({
     *   notificationId: 'notif-123',
     *   userId: 'user-456'
     * });
     * console.log(notification.isRead); // true
     * ```
     */
    execute(input: MarkAsReadInput, _loggedUser?: unknown): Promise<Notification>;
}

/**
 * Input for marking all notifications as read.
 *
 * Only the user ID is required to mark all of their notifications as read.
 */
interface MarkAllAsReadInput {
    /**
     * The ID of the user whose notifications should be marked as read.
     */
    userId: string;
}
/**
 * Output for marking all notifications as read.
 *
 * Contains information about how many notifications were marked as read.
 */
interface MarkAllAsReadOutput {
    /**
     * The number of notifications that were marked as read.
     */
    count: number;
}
/**
 * Use case for marking all notifications as read for a user.
 *
 * This use case handles bulk marking all unread notifications as read,
 * which is useful for "mark all as read" functionality.
 *
 * ## Business Rules
 *
 * - Only unread notifications for the user are affected
 * - Returns the count of notifications marked as read
 * - More efficient than updating each notification individually
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new MarkAllAsReadUseCase(notificationRepository);
 *
 * const result = await useCase.execute({ userId: 'user-123' });
 *
 * console.log(`Marked ${result.count} notifications as read`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - User ID is missing
 * - Repository operations fail
 *
 * @see {@link ../provider/notification.repository.ts | NotificationRepository}
 */
declare class MarkAllAsReadUseCase implements UseCase<MarkAllAsReadInput, MarkAllAsReadOutput> {
    private readonly notificationRepository;
    constructor(notificationRepository: NotificationRepository);
    /**
     * Executes the mark all as read use case.
     *
     * Marks all unread notifications for the user as read.
     *
     * @param input - The mark all as read input data
     * @param _loggedUser - Optional logged user context (not used in this use case)
     * @returns Promise resolving to the count of notifications marked as read
     * @throws {Error} If validation fails or repository operation fails
     *
     * @example
     * ```typescript
     * const result = await useCase.execute({ userId: 'user-123' });
     * console.log(`Marked ${result.count} notifications as read`);
     * ```
     */
    execute(input: MarkAllAsReadInput, _loggedUser?: unknown): Promise<MarkAllAsReadOutput>;
}

/**
 * Input for marking a notification as unread.
 *
 * Both fields are required to ensure the user owns the notification.
 */
interface MarkAsUnreadInput {
    /**
     * The ID of the notification to mark as unread.
     */
    notificationId: string;
    /**
     * The ID of the user who owns the notification.
     * Used to verify ownership before marking as unread.
     */
    userId: string;
}
/**
 * Use case for marking a notification as unread.
 *
 * This use case handles marking a specific notification as unread,
 * which updates the isRead flag to false and clears the readAt timestamp.
 *
 * ## Business Rules
 *
 * - The notification must exist
 * - The notification must belong to the user
 * - If already unread, returns the notification unchanged (idempotent)
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new MarkAsUnreadUseCase(notificationRepository);
 *
 * const notification = await useCase.execute({
 *   notificationId: 'notif-123',
 *   userId: 'user-456'
 * });
 *
 * console.log(`Notification marked as unread`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Notification ID is missing
 * - User ID is missing
 * - Notification doesn't exist
 * - User doesn't own the notification
 * - Repository operations fail
 *
 * @see {@link ../model/notification.entity.ts | Notification entity}
 * @see {@link ../provider/notification.repository.ts | NotificationRepository}
 */
declare class MarkAsUnreadUseCase implements UseCase<MarkAsUnreadInput, Notification> {
    private readonly notificationRepository;
    constructor(notificationRepository: NotificationRepository);
    /**
     * Executes the mark as unread use case.
     *
     * Finds the notification, verifies ownership, and marks it as unread.
     *
     * @param input - The mark as unread input data
     * @param _loggedUser - Optional logged user context (not used in this use case)
     * @returns Promise resolving to the updated notification
     * @throws {Error} If validation fails or repository operation fails
     *
     * @example
     * ```typescript
     * const notification = await useCase.execute({
     *   notificationId: 'notif-123',
     *   userId: 'user-456'
     * });
     * console.log(notification.isRead); // false
     * ```
     */
    execute(input: MarkAsUnreadInput, _loggedUser?: unknown): Promise<Notification>;
}

/**
 * Input for getting unread notifications.
 *
 * The user ID is required, and limit is optional for pagination.
 */
interface GetUnreadNotificationsInput {
    /**
     * The ID of the user to get unread notifications for.
     */
    userId: string;
    /**
     * Optional limit on the number of notifications to return.
     * If not specified, returns all unread notifications.
     */
    limit?: number;
}
/**
 * Use case for getting unread notifications for a user.
 *
 * This use case retrieves all unread notifications for a user,
 * ordered by creation time (newest first). High-priority
 * notifications are returned first.
 *
 * ## Business Rules
 *
 * - Only returns notifications belonging to the user
 * - Only returns unread notifications
 * - High-priority notifications (TASK_ASSIGNED, MENTIONED, DUE_DATE_APPROACHING) come first
 * - Results are ordered by creation time (newest first within each priority level)
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new GetUnreadNotificationsUseCase(notificationRepository);
 *
 * const notifications = await useCase.execute({
 *   userId: 'user-123',
 *   limit: 20
 * });
 *
 * console.log(`Found ${notifications.length} unread notifications`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - User ID is missing
 * - Repository operations fail
 *
 * @see {@link ../model/notification.entity.ts | Notification entity}
 * @see {@link ../provider/notification.repository.ts | NotificationRepository}
 */
declare class GetUnreadNotificationsUseCase implements UseCase<GetUnreadNotificationsInput, Notification[]> {
    private readonly notificationRepository;
    constructor(notificationRepository: NotificationRepository);
    /**
     * Executes the get unread notifications use case.
     *
     * Retrieves all unread notifications for the user, ordered by
     * priority and creation time.
     *
     * @param input - The get unread notifications input data
     * @param _loggedUser - Optional logged user context (not used in this use case)
     * @returns Promise resolving to an array of unread notifications
     * @throws {Error} If validation fails or repository operation fails
     *
     * @example
     * ```typescript
     * const notifications = await useCase.execute({
     *   userId: 'user-123'
     * });
     *
     * notifications.forEach(n => {
     *   console.log(`${n.type}: ${n.title}`);
     * });
     * ```
     */
    execute(input: GetUnreadNotificationsInput, _loggedUser?: unknown): Promise<Notification[]>;
}

/**
 * Input for getting a notification by ID.
 *
 * Both fields are required to ensure the user owns the notification.
 */
interface GetNotificationByIdInput {
    /**
     * The ID of the notification to retrieve.
     */
    notificationId: string;
    /**
     * The ID of the user requesting the notification.
     * Used to verify ownership before returning the notification.
     */
    userId: string;
}
/**
 * Use case for getting a specific notification by ID.
 *
 * This use case retrieves a single notification and verifies
 * that the requesting user owns the notification.
 *
 * ## Business Rules
 *
 * - The notification must exist
 * - The notification must belong to the user
 * - Returns null if notification doesn't exist or user doesn't own it
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new GetNotificationByIdUseCase(notificationRepository);
 *
 * const notification = await useCase.execute({
 *   notificationId: 'notif-123',
 *   userId: 'user-456'
 * });
 *
 * if (notification) {
 *   console.log(`Found: ${notification.title}`);
 * } else {
 *   console.log('Notification not found');
 * }
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Notification ID is missing
 * - User ID is missing
 * - Repository operations fail
 *
 * Returns null if the notification doesn't exist or user doesn't own it.
 *
 * @see {@link ../model/notification.entity.ts | Notification entity}
 * @see {@link ../provider/notification.repository.ts | NotificationRepository}
 */
declare class GetNotificationByIdUseCase implements UseCase<GetNotificationByIdInput, Notification | null> {
    private readonly notificationRepository;
    constructor(notificationRepository: NotificationRepository);
    /**
     * Executes the get notification by ID use case.
     *
     * Finds the notification and verifies ownership before returning it.
     *
     * @param input - The get notification by ID input data
     * @param _loggedUser - Optional logged user context (not used in this use case)
     * @returns Promise resolving to the notification if found and owned by user, null otherwise
     * @throws {Error} If validation fails or repository operation fails
     *
     * @example
     * ```typescript
     * const notification = await useCase.execute({
     *   notificationId: 'notif-123',
     *   userId: 'user-456'
     * });
     *
     * if (notification) {
     *   console.log(notification.title);
     * }
     * ```
     */
    execute(input: GetNotificationByIdInput, _loggedUser?: unknown): Promise<Notification | null>;
}

/**
 * Input for getting notifications by type.
 *
 * The user ID and type are required.
 */
interface GetNotificationsByTypeInput {
    /**
     * The ID of the user to get notifications for.
     */
    userId: string;
    /**
     * The notification type to filter by.
     */
    type: NotificationType;
}
/**
 * Use case for getting notifications of a specific type for a user.
 *
 * This use case retrieves all notifications of a specific type
 * for a user, useful for filtering and grouping notifications.
 *
 * ## Business Rules
 *
 * - Only returns notifications belonging to the user
 * - Only returns notifications of the specified type
 * - Results are ordered by creation time (newest first)
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new GetNotificationsByTypeUseCase(notificationRepository);
 *
 * const notifications = await useCase.execute({
 *   userId: 'user-123',
 *   type: NotificationType.TASK_ASSIGNED
 * });
 *
 * console.log(`Found ${notifications.length} task assignment notifications`);
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - User ID is missing
 * - Type is missing
 * - Repository operations fail
 *
 * @see {@link ../model/notification.entity.ts | Notification entity}
 * @see {@link ../provider/notification.repository.ts | NotificationRepository}
 */
declare class GetNotificationsByTypeUseCase implements UseCase<GetNotificationsByTypeInput, Notification[]> {
    private readonly notificationRepository;
    constructor(notificationRepository: NotificationRepository);
    /**
     * Executes the get notifications by type use case.
     *
     * Retrieves all notifications of the specified type for the user.
     *
     * @param input - The get notifications by type input data
     * @param _loggedUser - Optional logged user context (not used in this use case)
     * @returns Promise resolving to an array of notifications of the specified type
     * @throws {Error} If validation fails or repository operation fails
     *
     * @example
     * ```typescript
     * const notifications = await useCase.execute({
     *   userId: 'user-123',
     *   type: NotificationType.COMMENT_ADDED
     * });
     *
     * notifications.forEach(n => {
     *   console.log(`${n.title}: ${n.message}`);
     * });
     * ```
     */
    execute(input: GetNotificationsByTypeInput, _loggedUser?: unknown): Promise<Notification[]>;
}

/**
 * Input for deleting a notification.
 *
 * Both fields are required to ensure the user owns the notification.
 */
interface DeleteNotificationInput {
    /**
     * The ID of the notification to delete.
     */
    notificationId: string;
    /**
     * The ID of the user who owns the notification.
     * Used to verify ownership before deletion.
     */
    userId: string;
}
/**
 * Use case for deleting a notification.
 *
 * This use case handles permanent deletion of a notification,
 * after verifying that the user owns it.
 *
 * ## Business Rules
 *
 * - The notification must exist
 * - The notification must belong to the user
 * - Deletion is permanent and cannot be undone
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new DeleteNotificationUseCase(notificationRepository);
 *
 * await useCase.execute({
 *   notificationId: 'notif-123',
 *   userId: 'user-456'
 * });
 *
 * console.log('Notification deleted');
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - Notification ID is missing
 * - User ID is missing
 * - Notification doesn't exist
 * - User doesn't own the notification
 * - Repository operations fail
 *
 * @see {@link ../provider/notification.repository.ts | NotificationRepository}
 */
declare class DeleteNotificationUseCase implements UseCase<DeleteNotificationInput, void> {
    private readonly notificationRepository;
    constructor(notificationRepository: NotificationRepository);
    /**
     * Executes the delete notification use case.
     *
     * Finds the notification, verifies ownership, and deletes it permanently.
     *
     * @param input - The delete notification input data
     * @param _loggedUser - Optional logged user context (not used in this use case)
     * @returns Promise resolving when the deletion is complete
     * @throws {Error} If validation fails or repository operation fails
     *
     * @example
     * ```typescript
     * await useCase.execute({
     *   notificationId: 'notif-123',
     *   userId: 'user-456'
     * });
     * ```
     */
    execute(input: DeleteNotificationInput, _loggedUser?: unknown): Promise<void>;
}

/**
 * Input for counting unread notifications.
 *
 * Only the user ID is required to count their unread notifications.
 */
interface CountUnreadNotificationsInput {
    /**
     * The ID of the user to count unread notifications for.
     */
    userId: string;
}
/**
 * Output for counting unread notifications.
 *
 * Contains the count of unread notifications.
 */
interface CountUnreadNotificationsOutput {
    /**
     * The number of unread notifications for the user.
     */
    count: number;
}
/**
 * Use case for counting unread notifications for a user.
 *
 * This use case provides the count of unread notifications,
 * useful for displaying notification badges.
 *
 * ## Business Rules
 *
 * - Only counts notifications belonging to the user
 * - Only counts unread notifications
 * - More efficient than fetching all notifications
 *
 * ## Example Usage
 *
 * ```typescript
 * const useCase = new CountUnreadNotificationsUseCase(notificationRepository);
 *
 * const result = await useCase.execute({ userId: 'user-123' });
 *
 * console.log(`User has ${result.count} unread notifications`);
 *
 * // Display badge
 * if (result.count > 0) {
 *   showBadge(result.count);
 * }
 * ```
 *
 * ## Error Handling
 *
 * Throws errors if:
 * - User ID is missing
 * - Repository operations fail
 *
 * @see {@link ../provider/notification.repository.ts | NotificationRepository}
 */
declare class CountUnreadNotificationsUseCase implements UseCase<CountUnreadNotificationsInput, CountUnreadNotificationsOutput> {
    private readonly notificationRepository;
    constructor(notificationRepository: NotificationRepository);
    /**
     * Executes the count unread notifications use case.
     *
     * Counts all unread notifications for the user.
     *
     * @param input - The count unread notifications input data
     * @param _loggedUser - Optional logged user context (not used in this use case)
     * @returns Promise resolving to the count of unread notifications
     * @throws {Error} If validation fails or repository operation fails
     *
     * @example
     * ```typescript
     * const result = await useCase.execute({ userId: 'user-123' });
     * console.log(`Unread count: ${result.count}`);
     * ```
     */
    execute(input: CountUnreadNotificationsInput, _loggedUser?: unknown): Promise<CountUnreadNotificationsOutput>;
}

/**
 * Type of changelog entry
 */
type ChangelogType = "NEW" | "IMPROVED" | "FIXED" | "REMOVED";
/**
 * Props for ChangelogEntry entity
 */
interface ChangelogEntryProps extends EntityProps {
    version?: string;
    title: string;
    content: string;
    type: ChangelogType;
    publishedAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
/**
 * ChangelogEntry domain entity
 *
 * Represents a changelog entry for the application's release notes.
 */
declare class ChangelogEntry extends Entity<ChangelogEntryProps> {
    constructor(props: ChangelogEntryProps);
    /**
     * Create a new changelog entry
     */
    static create(props: Omit<ChangelogEntryProps, "id" | "createdAt" | "updatedAt">): ChangelogEntry;
    get version(): string | undefined;
    get title(): string;
    get content(): string;
    get type(): ChangelogType;
    get publishedAt(): Date;
    get createdAt(): Date;
    get updatedAt(): Date;
    /**
     * Check if entry is published
     */
    isPublished(): boolean;
    /**
     * Check if entry is a new feature
     */
    isNewFeature(): boolean;
    /**
     * Check if entry is a fix
     */
    isFix(): boolean;
    /**
     * Update changelog entry
     */
    update(props: Partial<Omit<ChangelogEntryProps, "id" | "createdAt">>): ChangelogEntry;
    /**
     * Publish the entry
     */
    publish(): ChangelogEntry;
}

/**
 * Repository interface for ChangelogEntry persistence operations.
 */
interface IChangelogRepository {
    /**
     * Find a changelog entry by ID
     */
    findById(id: string): Promise<ChangelogEntry | null>;
    /**
     * Find all changelog entries with optional filtering
     */
    findAll(params?: {
        skip?: number;
        take?: number;
        orderBy?: "publishedAt" | "createdAt";
        order?: "asc" | "desc";
    }): Promise<ChangelogEntry[]>;
    /**
     * Get the latest published release
     */
    findLatest(): Promise<ChangelogEntry | null>;
    /**
     * Create a new changelog entry
     */
    create(entry: ChangelogEntry): Promise<ChangelogEntry>;
    /**
     * Update an existing changelog entry
     */
    update(id: string, data: Partial<ChangelogEntryProps>): Promise<ChangelogEntry>;
    /**
     * Delete a changelog entry
     */
    delete(id: string): Promise<void>;
}

/**
 * Props for NewsletterSubscriber entity
 */
interface NewsletterSubscriberProps extends EntityProps {
    email: string;
    active: boolean;
    userId?: string;
    createdAt?: Date;
}
/**
 * NewsletterSubscriber domain entity
 *
 * Represents a subscriber to the newsletter.
 */
declare class NewsletterSubscriber extends Entity<NewsletterSubscriberProps> {
    constructor(props: NewsletterSubscriberProps);
    /**
     * Create a new newsletter subscriber
     */
    static create(props: Omit<NewsletterSubscriberProps, "id" | "createdAt" | "active">): NewsletterSubscriber;
    get email(): string;
    get active(): boolean;
    get userId(): string | undefined;
    get createdAt(): Date;
    /**
     * Check if subscription is active
     */
    isActive(): boolean;
    /**
     * Subscribe (activate)
     */
    subscribe(): NewsletterSubscriber;
    /**
     * Unsubscribe (deactivate)
     */
    unsubscribe(): NewsletterSubscriber;
    /**
     * Link to user account
     */
    linkToUser(userId: string): NewsletterSubscriber;
    /**
     * Update email
     */
    updateEmail(email: string): NewsletterSubscriber;
}

/**
 * Repository interface for NewsletterSubscriber persistence operations.
 */
interface INewsletterRepository {
    /**
     * Find a subscriber by email
     */
    findByEmail(email: string): Promise<NewsletterSubscriber | null>;
    /**
     * Find a subscriber by user ID
     */
    findByUserId(userId: string): Promise<NewsletterSubscriber | null>;
    /**
     * Find all subscribers with optional filtering
     */
    findAll(params?: {
        skip?: number;
        take?: number;
        activeOnly?: boolean;
    }): Promise<NewsletterSubscriber[]>;
    /**
     * Create a new subscriber
     */
    create(subscriber: NewsletterSubscriber): Promise<NewsletterSubscriber>;
    /**
     * Update an existing subscriber
     */
    update(id: string, data: Partial<NewsletterSubscriberProps>): Promise<NewsletterSubscriber>;
    /**
     * Delete a subscriber
     */
    delete(id: string): Promise<void>;
}

/**
 * Props for ContactSubmission entity
 */
interface ContactSubmissionProps extends EntityProps {
    name: string;
    email: string;
    subject: string;
    message: string;
    read: boolean;
    createdAt?: Date;
}
/**
 * ContactSubmission domain entity
 *
 * Represents a contact form submission from a user.
 */
declare class ContactSubmission extends Entity<ContactSubmissionProps> {
    constructor(props: ContactSubmissionProps);
    /**
     * Create a new contact submission
     */
    static create(props: Omit<ContactSubmissionProps, "id" | "createdAt" | "read">): ContactSubmission;
    get name(): string;
    get email(): string;
    get subject(): string;
    get message(): string;
    get read(): boolean;
    get createdAt(): Date;
    /**
     * Check if submission has been read
     */
    isRead(): boolean;
    /**
     * Mark as read
     */
    markAsRead(): ContactSubmission;
    /**
     * Mark as unread
     */
    markAsUnread(): ContactSubmission;
}

/**
 * Repository interface for ContactSubmission persistence operations.
 */
interface IContactRepository {
    /**
     * Find a submission by ID
     */
    findById(id: string): Promise<ContactSubmission | null>;
    /**
     * Find all submissions with optional filtering
     */
    findAll(params?: {
        skip?: number;
        take?: number;
        unreadOnly?: boolean;
    }): Promise<ContactSubmission[]>;
    /**
     * Create a new submission
     */
    create(submission: ContactSubmission): Promise<ContactSubmission>;
    /**
     * Update an existing submission
     */
    update(id: string, data: Partial<ContactSubmissionProps>): Promise<ContactSubmission>;
    /**
     * Delete a submission
     */
    delete(id: string): Promise<void>;
}

/**
 * Status of a roadmap item
 */
type RoadmapStatus = "CONSIDERING" | "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "DECLINED";
/**
 * Props for RoadmapItem entity
 */
interface RoadmapItemProps extends EntityProps {
    title: string;
    description: string;
    status: RoadmapStatus;
    totalVotes: number;
    createdAt?: Date;
    updatedAt?: Date;
}
/**
 * RoadmapItem domain entity
 *
 * Represents a feature request or improvement on the roadmap.
 */
declare class RoadmapItem extends Entity<RoadmapItemProps> {
    constructor(props: RoadmapItemProps);
    /**
     * Create a new roadmap item
     */
    static create(props: Omit<RoadmapItemProps, "id" | "createdAt" | "updatedAt" | "status" | "totalVotes">): RoadmapItem;
    get title(): string;
    get description(): string;
    get status(): RoadmapStatus;
    get totalVotes(): number;
    get createdAt(): Date;
    get updatedAt(): Date;
    /**
     * Check if item is being considered
     */
    isConsidering(): boolean;
    /**
     * Check if item is planned
     */
    isPlanned(): boolean;
    /**
     * Check if item is in progress
     */
    isInProgress(): boolean;
    /**
     * Check if item is completed
     */
    isCompleted(): boolean;
    /**
     * Update status
     */
    updateStatus(status: RoadmapStatus): RoadmapItem;
    /**
     * Increment votes
     */
    incrementVotes(weight: number): RoadmapItem;
    /**
     * Decrement votes
     */
    decrementVotes(weight: number): RoadmapItem;
}

/**
 * Props for RoadmapVote entity
 */
interface RoadmapVoteProps extends EntityProps {
    itemId: string;
    userId: string;
    weight: number;
    createdAt?: Date;
}
/**
 * RoadmapVote domain entity
 *
 * Represents a user's vote on a roadmap item.
 * Weight is determined by subscription tier.
 */
declare class RoadmapVote extends Entity<RoadmapVoteProps> {
    constructor(props: RoadmapVoteProps);
    /**
     * Create a new roadmap vote
     */
    static create(props: Omit<RoadmapVoteProps, "id" | "createdAt">): RoadmapVote;
    get itemId(): string;
    get userId(): string;
    get weight(): number;
    get createdAt(): Date;
}
/**
 * Calculate vote weight based on subscription plan
 */
declare function calculateVoteWeight(plan?: string): number;

/**
 * Repository interface for Roadmap persistence operations.
 */
interface IRoadmapRepository {
    /**
     * Find a roadmap item by ID
     */
    findItemById(id: string): Promise<RoadmapItem | null>;
    /**
     * Find all roadmap items with optional filtering
     */
    findAllItems(params?: {
        skip?: number;
        take?: number;
        status?: RoadmapStatus;
    }): Promise<RoadmapItem[]>;
    /**
     * Create a new roadmap item
     */
    createItem(item: RoadmapItem): Promise<RoadmapItem>;
    /**
     * Update a roadmap item
     */
    updateItem(id: string, data: Partial<RoadmapItemProps>): Promise<RoadmapItem>;
    /**
     * Delete a roadmap item
     */
    deleteItem(id: string): Promise<void>;
    /**
     * Find a vote by item and user
     */
    findVote(itemId: string, userId: string): Promise<RoadmapVote | null>;
    /**
     * Create a vote and update item total votes
     */
    createVote(vote: RoadmapVote): Promise<{
        vote: RoadmapVote;
        item: RoadmapItem;
    }>;
    /**
     * Delete a vote and update item total votes
     */
    deleteVote(itemId: string, userId: string): Promise<RoadmapItem>;
    /**
     * Check if user has voted on an item
     */
    hasUserVoted(itemId: string, userId: string): Promise<boolean>;
}

/**
 * Props for BlogPost entity
 */
interface BlogPostProps extends EntityProps {
    slug: string;
    title: string;
    excerpt?: string;
    content: string;
    coverImage?: string;
    published: boolean;
    publishedAt?: Date;
    metaTitle?: string;
    metaDescription?: string;
    author?: string;
    category?: string;
    tags: string[];
    readTime?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
/**
 * BlogPost domain entity
 */
declare class BlogPost extends Entity<BlogPostProps> {
    constructor(props: BlogPostProps);
    /**
     * Create a new blog post
     */
    static create(props: Omit<BlogPostProps, "id" | "createdAt" | "updatedAt" | "published" | "publishedAt">): BlogPost;
    get slug(): string;
    get title(): string;
    get content(): string;
    get published(): boolean;
    /**
     * Publish the post
     */
    publish(): BlogPost;
    /**
     * Unpublish the post
     */
    unpublish(): BlogPost;
}

/**
 * Props for BlogComment entity
 */
interface BlogCommentProps extends EntityProps {
    content: string;
    userId: string;
    postId: string;
    createdAt?: Date;
}
/**
 * BlogComment domain entity
 */
declare class BlogComment extends Entity<BlogCommentProps> {
    constructor(props: BlogCommentProps);
    /**
     * Create a new blog comment
     */
    static create(props: Omit<BlogCommentProps, "id" | "createdAt">): BlogComment;
    get content(): string;
    get userId(): string;
    get postId(): string;
}

/**
 * Repository interface for Blog persistence operations.
 */
interface IBlogRepository {
    /**
     * Find a blog post by ID
     */
    findPostById(id: string): Promise<BlogPost | null>;
    /**
     * Find a blog post by slug
     */
    findPostBySlug(slug: string): Promise<BlogPost | null>;
    /**
     * Find all blog posts with optional filtering
     */
    findAllPosts(params?: {
        skip?: number;
        take?: number;
        publishedOnly?: boolean;
        category?: string;
        tag?: string;
    }): Promise<BlogPost[]>;
    /**
     * Create a new blog post
     */
    createPost(post: BlogPost): Promise<BlogPost>;
    /**
     * Update a blog post
     */
    updatePost(id: string, data: Partial<BlogPostProps>): Promise<BlogPost>;
    /**
     * Delete a blog post
     */
    deletePost(id: string): Promise<void>;
    /**
     * Get distinct categories from published posts
     */
    getCategories(): Promise<string[]>;
    /**
     * Find comments for a specific post
     */
    findCommentsByPostId(postId: string): Promise<BlogComment[]>;
    /**
     * Find a comment by ID
     */
    findCommentById(id: string): Promise<BlogComment | null>;
    /**
     * Create a new comment
     */
    createComment(comment: BlogComment): Promise<BlogComment>;
    /**
     * Delete a comment
     */
    deleteComment(id: string): Promise<void>;
}

/**
 * Props for Achievement entity
 */
interface AchievementProps extends EntityProps {
    code: string;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
    createdAt?: Date;
    updatedAt?: Date;
}
/**
 * Achievement domain entity
 */
declare class Achievement extends Entity<AchievementProps> {
    constructor(props: AchievementProps);
    /**
     * Create a new achievement
     */
    static create(props: Omit<AchievementProps, "id" | "createdAt" | "updatedAt">): Achievement;
    get code(): string;
    get name(): string;
    get description(): string;
    get icon(): string;
    get xpReward(): number;
}

/**
 * Props for UserAchievement entity
 */
interface UserAchievementProps extends EntityProps {
    userId: string;
    achievementId: string;
    unlockedAt?: Date;
}
/**
 * UserAchievement domain entity
 */
declare class UserAchievement extends Entity<UserAchievementProps> {
    constructor(props: UserAchievementProps);
    /**
     * Create/Unlock an achievement for a user
     */
    static create(props: Omit<UserAchievementProps, "id" | "unlockedAt">): UserAchievement;
    get userId(): string;
    get achievementId(): string;
    get unlockedAt(): Date;
}

/**
 * Repository interface for Gamification persistence operations.
 */
interface IGamificationRepository {
    /**
     * Find an achievement by code
     */
    findAchievementByCode(code: string): Promise<Achievement | null>;
    /**
     * Find an achievement by ID
     */
    findAchievementById(id: string): Promise<Achievement | null>;
    /**
     * Find all achievements
     */
    findAllAchievements(): Promise<Achievement[]>;
    /**
     * Create a new achievement (for seeding/admin)
     */
    createAchievement(achievement: Achievement): Promise<Achievement>;
    /**
     * Check if a user has unlocked an achievement
     */
    hasUnlocked(userId: string, achievementId: string): Promise<boolean>;
    /**
     * Unlock an achievement for a user
     */
    unlockAchievement(userAchievement: UserAchievement): Promise<UserAchievement>;
    /**
     * Find all achievements for a user
     */
    findUserAchievements(userId: string): Promise<UserAchievement[]>;
}

type ChatRole = 'USER' | 'ASSISTANT' | 'SYSTEM';
/**
 * Props for ChatMessage entity
 */
interface ChatMessageProps extends EntityProps {
    conversationId: string;
    role: ChatRole;
    content: string;
    metadata?: any;
    createdAt?: Date;
}
/**
 * ChatMessage domain entity
 */
declare class ChatMessage extends Entity<ChatMessageProps> {
    constructor(props: ChatMessageProps);
    /**
     * Create a new chat message
     */
    static create(props: Omit<ChatMessageProps, "id" | "createdAt">): ChatMessage;
    get conversationId(): string;
    get role(): ChatRole;
    get content(): string;
    get metadata(): any;
    get createdAt(): Date;
}

/**
 * Props for ChatConversation entity
 */
interface ChatConversationProps extends EntityProps {
    userId: string;
    title?: string;
    context?: any;
    isArchived: boolean;
    archivedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    messages?: ChatMessage[];
}
/**
 * ChatConversation domain entity
 */
declare class ChatConversation extends Entity<ChatConversationProps> {
    constructor(props: ChatConversationProps);
    /**
     * Create a new chat conversation
     */
    static create(props: Omit<ChatConversationProps, "id" | "createdAt" | "updatedAt" | "isArchived" | "archivedAt">): ChatConversation;
    get userId(): string;
    get title(): string | undefined;
    get isArchived(): boolean;
    /**
     * Archive the conversation
     */
    archive(): ChatConversation;
    /**
     * Update title
     */
    updateTitle(title: string): ChatConversation;
}

/**
 * Filter and pagination options for conversations
 */
interface GetConversationsOptions {
    limit?: number;
    offset?: number;
    includeArchived?: boolean;
}
/**
 * Result of multiple conversations query
 */
interface GetConversationsResult {
    conversations: ChatConversation[];
    total: number;
}
/**
 * Repository interface for Chat persistence operations.
 */
interface IChatRepository {
    /**
     * Create a new conversation
     */
    createConversation(conversation: ChatConversation): Promise<ChatConversation>;
    /**
     * Find a conversation by ID and UserID (for ownership check)
     */
    findConversationById(id: string, userId: string): Promise<ChatConversation | null>;
    /**
     * Find many conversations for a user
     */
    findConversationsByUserId(userId: string, options?: GetConversationsOptions): Promise<GetConversationsResult>;
    /**
     * Update a conversation
     */
    updateConversation(id: string, userId: string, data: Partial<ChatConversationProps>): Promise<void>;
    /**
     * Delete a conversation
     */
    deleteConversation(id: string, userId: string): Promise<void>;
    /**
     * Add a message to a conversation
     */
    addMessage(message: ChatMessage): Promise<ChatMessage>;
    /**
     * Get message history for a conversation
     */
    getMessageHistory(conversationId: string, limit?: number): Promise<ChatMessage[]>;
    /**
     * Verify if a user owns a conversation
     */
    verifyOwnership(conversationId: string, userId: string): Promise<boolean>;
}

/**
 * Props for TaskTemplate entity
 */
interface TaskTemplateProps extends EntityProps {
    name: string;
    description?: string;
    icon?: string;
    titlePattern?: string;
    defaultPriority: TaskPriority;
    defaultEstimatedMinutes?: number;
    defaultDescription?: string;
    defaultTags?: string[];
    workspaceId: string;
    isPublic: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
/**
 * TaskTemplate domain entity
 */
declare class TaskTemplate extends Entity<TaskTemplateProps> {
    constructor(props: TaskTemplateProps);
    /**
     * Create a new task template
     */
    static create(props: Omit<TaskTemplateProps, "id" | "createdAt" | "updatedAt">): TaskTemplate;
    get name(): string;
    get description(): string | undefined;
    get workspaceId(): string;
    get isPublic(): boolean;
    /**
     * Update template details
     */
    update(props: Partial<Omit<TaskTemplateProps, "id" | "workspaceId" | "createdAt" | "updatedAt">>): TaskTemplate;
}

/**
 * Repository interface for TaskTemplate persistence operations.
 */
interface ITaskTemplateRepository {
    /**
     * Find a template by ID
     */
    findById(id: string): Promise<TaskTemplate | null>;
    /**
     * Find all templates in a workspace
     */
    findByWorkspaceId(workspaceId: string): Promise<TaskTemplate[]>;
    /**
     * Create a new template
     */
    create(template: TaskTemplate): Promise<TaskTemplate>;
    /**
     * Update an existing template
     */
    update(template: TaskTemplate): Promise<TaskTemplate>;
    /**
     * Delete a template
     */
    delete(id: string): Promise<void>;
}

type MetricType = 'NUMBER' | 'PERCENTAGE' | 'CURRENCY' | 'BOOLEAN';
/**
 * Props for KeyResult entity
 */
interface KeyResultProps extends EntityProps {
    objectiveId: string;
    title: string;
    description?: string;
    metricType: MetricType;
    startValue: number;
    targetValue: number;
    currentValue: number;
    unit?: string;
    progress: number;
    createdAt?: Date;
    updatedAt?: Date;
}
/**
 * KeyResult domain entity
 */
declare class KeyResult extends Entity<KeyResultProps> {
    constructor(props: KeyResultProps);
    /**
     * Create a new key result
     */
    static create(props: Omit<KeyResultProps, "id" | "createdAt" | "updatedAt" | "progress">): KeyResult;
    get progress(): number;
    /**
     * Update current value and recalculate progress
     */
    updateProgress(currentValue: number): KeyResult;
}

type OKRPeriod = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'PERSONAL';
type ObjectiveStatus = 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';
/**
 * Props for Objective entity
 */
interface ObjectiveProps extends EntityProps {
    title: string;
    description?: string;
    userId: string;
    workspaceId?: string;
    startDate: Date;
    endDate: Date;
    period: OKRPeriod;
    status: ObjectiveStatus;
    progress: number;
    color: string;
    icon?: string;
    keyResults?: KeyResult[];
    createdAt?: Date;
    updatedAt?: Date;
}
/**
 * Objective domain entity (OKRs)
 */
declare class Objective extends Entity<ObjectiveProps> {
    constructor(props: ObjectiveProps);
    /**
     * Create a new objective
     */
    static create(props: Omit<ObjectiveProps, "id" | "createdAt" | "updatedAt" | "progress" | "status" | "keyResults">): Objective;
    get title(): string;
    get userId(): string;
    get progress(): number;
    /**
     * Calculate total progress based on Key Results
     */
    calculateProgress(): number;
    /**
     * Update progress
     */
    updateProgress(): Objective;
}

interface KeyResultTaskProps {
    keyResultId: string;
    taskId: string;
    weight: number;
}
/**
 * KeyResultTask domain representation (Value Object or simple link)
 */
declare class KeyResultTask {
    readonly props: KeyResultTaskProps;
    constructor(props: KeyResultTaskProps);
    get keyResultId(): string;
    get taskId(): string;
    get weight(): number;
}

/**
 * Repository interface for Objective and Key Result persistence operations.
 */
interface IObjectiveRepository {
    /**
     * Find objective by ID
     */
    findById(id: string): Promise<Objective | null>;
    /**
     * Find many objectives for a user
     */
    findByUserId(userId: string): Promise<Objective[]>;
    /**
     * Find many objectives in a workspace
     */
    findByWorkspaceId(workspaceId: string): Promise<Objective[]>;
    /**
     * Create a new objective
     */
    create(objective: Objective): Promise<Objective>;
    /**
     * Update an objective
     */
    update(objective: Objective): Promise<Objective>;
    /**
     * Delete an objective (and its KRs)
     */
    delete(id: string): Promise<void>;
    /**
     * Find Key Result by ID
     */
    findKeyResultById(id: string): Promise<KeyResult | null>;
    /**
     * Create a Key Result
     */
    createKeyResult(kr: KeyResult): Promise<KeyResult>;
    /**
     * Update a Key Result
     */
    updateKeyResult(kr: KeyResult): Promise<KeyResult>;
    /**
     * Delete a Key Result
     */
    deleteKeyResult(id: string): Promise<void>;
    /**
     * Link a task to a Key Result
     */
    linkTask(krId: string, taskId: string, weight?: number): Promise<void>;
    /**
     * Unlink a task from a Key Result
     */
    unlinkTask(krId: string, taskId: string): Promise<void>;
}

interface FAQProps extends EntityProps {
    question: string;
    answer: string;
    category: string;
    order: number;
    published: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class FAQ extends Entity<FAQProps> {
    constructor(props: FAQProps);
    static create(props: Omit<FAQProps, "id" | "createdAt" | "updatedAt">): FAQ;
    get question(): string;
    get answer(): string;
    get category(): string;
    get order(): number;
    get published(): boolean;
    update(props: Partial<Omit<FAQProps, "id" | "createdAt" | "updatedAt">>): FAQ;
}

interface IFAQRepository {
    findById(id: string): Promise<FAQ | null>;
    findAll(options?: {
        publishedOnly?: boolean;
        category?: string;
    }): Promise<FAQ[]>;
    create(faq: FAQ): Promise<FAQ>;
    update(faq: FAQ): Promise<FAQ>;
    delete(id: string): Promise<void>;
    getCategories(): Promise<string[]>;
}

interface KBArticleProps extends EntityProps {
    slug: string;
    title: string;
    content: string;
    excerpt?: string;
    categoryId: string;
    helpfulYes: number;
    helpfulNo: number;
    published: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class KBArticle extends Entity<KBArticleProps> {
    constructor(props: KBArticleProps);
    static create(props: Omit<KBArticleProps, "id" | "createdAt" | "updatedAt" | "helpfulYes" | "helpfulNo">): KBArticle;
    get slug(): string;
    get title(): string;
    get content(): string;
    get categoryId(): string;
    get helpfulYes(): number;
    get helpfulNo(): number;
    get published(): boolean;
    update(props: Partial<Omit<KBArticleProps, "id" | "createdAt" | "updatedAt">>): KBArticle;
    voteHelpful(yes: boolean): KBArticle;
}

interface KBCategoryProps extends EntityProps {
    name: string;
    slug: string;
    icon?: string;
    order: number;
    articles?: KBArticle[];
    createdAt?: Date;
    updatedAt?: Date;
}
declare class KBCategory extends Entity<KBCategoryProps> {
    constructor(props: KBCategoryProps);
    static create(props: Omit<KBCategoryProps, "id" | "createdAt" | "updatedAt" | "articles">): KBCategory;
    get name(): string;
    get slug(): string;
    get icon(): string | undefined;
    get order(): number;
    get articles(): KBArticle[];
    update(props: Partial<Omit<KBCategoryProps, "id" | "createdAt" | "updatedAt" | "articles">>): KBCategory;
}

interface IKBRepository {
    findCategoryById(id: string): Promise<KBCategory | null>;
    findCategoryBySlug(slug: string): Promise<KBCategory | null>;
    findAllCategories(): Promise<KBCategory[]>;
    createCategory(category: KBCategory): Promise<KBCategory>;
    updateCategory(category: KBCategory): Promise<KBCategory>;
    deleteCategory(id: string): Promise<void>;
    findArticleById(id: string): Promise<KBArticle | null>;
    findArticleBySlug(slug: string): Promise<KBArticle | null>;
    findArticlesByCategory(categoryId: string, options?: {
        publishedOnly?: boolean;
    }): Promise<KBArticle[]>;
    findAllArticles(options?: {
        publishedOnly?: boolean;
        categoryId?: string;
    }): Promise<KBArticle[]>;
    createArticle(article: KBArticle): Promise<KBArticle>;
    updateArticle(article: KBArticle): Promise<KBArticle>;
    deleteArticle(id: string): Promise<void>;
    searchArticles(query: string): Promise<KBArticle[]>;
}

interface MemberWorkload {
    userId: string;
    userName: string;
    userEmail: string;
    avatarUrl?: string;
    assignedTasks: number;
    completedTasks: number;
    overdueTasks: number;
    inProgressTasks: number;
    hoursWorkedThisWeek: number;
    avgHoursPerDay: number;
    workloadScore: number;
    workloadLevel: "LOW" | "MODERATE" | "HIGH" | "OVERLOADED";
    capacityRemaining: number;
    trend: "INCREASING" | "STABLE" | "DECREASING";
    currentTask?: {
        id: string;
        title: string;
        startedAt?: Date;
    };
}
interface TeamWorkloadSummary {
    workspaceId: string;
    workspaceName: string;
    totalMembers: number;
    totalTasks: number;
    totalCompleted: number;
    totalOverdue: number;
    averageWorkload: number;
    membersOverloaded: number;
    membersUnderutilized: number;
    membersBalanced: number;
    redistributionSuggestions: Array<{
        fromUserId: string;
        fromUserName: string;
        toUserId: string;
        toUserName: string;
        taskCount: number;
        reason: string;
    }>;
    members: MemberWorkload[];
}
interface WorkloadSuggestion {
    type: "REDISTRIBUTE" | "DELEGATE" | "DEFER" | "PRIORITIZE";
    priority: "LOW" | "MEDIUM" | "HIGH";
    description: string;
    affectedUsers: string[];
    taskIds?: string[];
    action: {
        type: string;
        data: any;
    };
}

interface ICollaborationRepository {
    getWorkspaceWorkload(workspaceId: string): Promise<TeamWorkloadSummary>;
    getMemberWorkload(userId: string, workspaceId?: string): Promise<MemberWorkload>;
    getBalancingSuggestions(workspaceId: string): Promise<WorkloadSuggestion[]>;
}

declare enum CustomFieldType {
    TEXT = "TEXT",
    NUMBER = "NUMBER",
    SELECT = "SELECT",
    MULTI_SELECT = "MULTI_SELECT",
    DATE = "DATE",
    CHECKBOX = "CHECKBOX",
    URL = "URL",
    EMAIL = "EMAIL"
}
declare class CustomField {
    readonly id: string;
    name: string;
    type: CustomFieldType;
    projectId: string;
    description?: string | null | undefined;
    options?: string[] | null | undefined;
    isRequired: boolean;
    position: number;
    createdAt: Date;
    updatedAt: Date;
    constructor(id: string, name: string, type: CustomFieldType, projectId: string, description?: string | null | undefined, options?: string[] | null | undefined, isRequired?: boolean, position?: number, createdAt?: Date, updatedAt?: Date);
    static create(props: {
        name: string;
        type: CustomFieldType;
        projectId: string;
        description?: string;
        options?: string[];
        isRequired?: boolean;
        position?: number;
    }): CustomField;
    update(props: Partial<Omit<CustomField, "id" | "createdAt" | "updatedAt">>): void;
}

declare class CustomFieldValue {
    readonly id: string;
    fieldId: string;
    taskId: string;
    value: string;
    createdAt: Date;
    updatedAt: Date;
    constructor(id: string, fieldId: string, taskId: string, value: string, createdAt?: Date, updatedAt?: Date);
    static create(props: {
        fieldId: string;
        taskId: string;
        value: string;
    }): CustomFieldValue;
    updateValue(value: string): void;
}

interface ICustomFieldRepository {
    findByProject(projectId: string): Promise<CustomField[]>;
    findById(id: string): Promise<CustomField | null>;
    create(field: CustomField): Promise<CustomField>;
    update(field: CustomField): Promise<CustomField>;
    delete(id: string): Promise<void>;
    getMaxPosition(projectId: string): Promise<number>;
    findValuesByTask(taskId: string): Promise<CustomFieldValue[]>;
    upsertValue(value: CustomFieldValue): Promise<CustomFieldValue>;
}

type SearchEntityType = 'task' | 'project' | 'note' | 'comment' | 'habit';
type SearchIntent = 'find' | 'filter' | 'aggregate' | 'compare';
interface SearchQueryProps extends EntityProps {
    userId: string;
    query: string;
    intent: SearchIntent;
    keywords: string[];
    filters: SearchFilters;
    createdAt: Date;
}
interface SearchFilters {
    types?: SearchEntityType[];
    projectId?: string;
    workspaceId?: string;
    includeCompleted?: boolean;
    dateRange?: {
        from?: Date;
        to?: Date;
    };
    priorities?: string[];
    statuses?: string[];
}
declare class SearchQuery extends Entity<SearchQueryProps> {
    constructor(props: SearchQueryProps, mode?: 'valid' | 'draft');
    static create(userId: string, query: string, intent: SearchIntent, keywords: string[], filters: SearchFilters): SearchQuery;
    private validate;
    isTypeSearch(): boolean;
    isFilterSearch(): boolean;
    isAggregateSearch(): boolean;
    isCompareSearch(): boolean;
    hasTypeFilter(): boolean;
    hasProjectFilter(): boolean;
    hasDateRange(): boolean;
    get userId(): string;
    get query(): string;
    get intent(): SearchIntent;
    get keywords(): string[];
    get filters(): SearchFilters;
    get createdAt(): Date;
}

type SearchResultEntityType = 'task' | 'project' | 'note' | 'comment' | 'habit';
interface SearchResultProps {
    id: string;
    type: SearchResultEntityType;
    title: string;
    description?: string;
    relevanceScore: number;
    highlights: string[];
    metadata: {
        status?: string;
        priority?: string;
        dueDate?: Date;
        projectName?: string;
        createdAt?: Date;
    };
}
declare class SearchResult {
    private readonly props;
    constructor(props: SearchResultProps);
    private validate;
    isTask(): boolean;
    isProject(): boolean;
    isNote(): boolean;
    isComment(): boolean;
    isHabit(): boolean;
    isHighRelevance(threshold?: number): boolean;
    hasHighlights(): boolean;
    getHighlightCount(): number;
    get id(): string;
    get type(): SearchResultEntityType;
    get title(): string;
    get description(): string | undefined;
    get relevanceScore(): number;
    get highlights(): string[];
    get metadata(): {
        status?: string;
        priority?: string;
        dueDate?: Date;
        projectName?: string;
        createdAt?: Date;
    };
}
interface SearchResultsProps {
    query: string;
    results: SearchResult[];
    interpretation: {
        intent: string;
        explanation: string;
        suggestedFilters?: any;
    };
    totalCount: number;
    executionTime: number;
}
declare class SearchResults {
    private readonly props;
    constructor(props: SearchResultsProps);
    private validate;
    hasResults(): boolean;
    getResultCount(): number;
    getTopResults(count?: number): SearchResult[];
    getResultsByType(type: SearchResultEntityType): SearchResult[];
    getHighRelevanceResults(threshold?: number): SearchResult[];
    getTaskResults(): SearchResult[];
    getProjectResults(): SearchResult[];
    get query(): string;
    get results(): SearchResult[];
    get interpretation(): {
        intent: string;
        explanation: string;
        suggestedFilters?: any;
    };
    get totalCount(): number;
    get executionTime(): number;
}

interface SearchRepository {
    search(query: SearchQuery): Promise<SearchResults>;
    getSuggestions(userId: string, partialQuery: string, limit?: number): Promise<Array<{
        text: string;
        type: 'query' | 'task' | 'project';
        count: number;
    }>>;
    quickSearch(userId: string, query: string, limit?: number): Promise<SearchResult[]>;
    askQuestion(userId: string, question: string): Promise<{
        answer: string;
        type: 'summary' | 'data' | 'error';
        data?: any;
    }>;
}
interface SearchService {
    interpretQuery(query: string): Promise<{
        intent: 'find' | 'filter' | 'aggregate' | 'compare';
        keywords: string[];
        suggestedFilters: any;
        explanation: string;
    }>;
}

interface ExecuteSearchInput {
    userId: string;
    query: string;
    types?: string[];
    projectId?: string;
    includeCompleted?: boolean;
    limit?: number;
}
declare class ExecuteSearchUseCase implements UseCase<ExecuteSearchInput, SearchResults> {
    private readonly searchRepo;
    constructor(searchRepo: SearchRepository);
    execute(input: ExecuteSearchInput): Promise<SearchResults>;
}

interface GetSuggestionsInput {
    userId: string;
    partialQuery: string;
    limit?: number;
}
declare class GetSuggestionsUseCase implements UseCase<GetSuggestionsInput, any> {
    private readonly searchRepo;
    constructor(searchRepo: SearchRepository);
    execute(input: GetSuggestionsInput): Promise<any>;
}

interface AskQuestionInput {
    userId: string;
    question: string;
}
declare class AskQuestionUseCase implements UseCase<AskQuestionInput, any> {
    private readonly searchRepo;
    constructor(searchRepo: SearchRepository);
    execute(input: AskQuestionInput): Promise<any>;
}

declare enum ActivityType {
    TASK_CREATED = "TASK_CREATED",
    TASK_UPDATED = "TASK_UPDATED",
    TASK_COMPLETED = "TASK_COMPLETED",
    TASK_DELETED = "TASK_DELETED",
    COMMENT_ADDED = "COMMENT_ADDED",
    COMMENT_EDITED = "COMMENT_EDITED",
    COMMENT_DELETED = "COMMENT_DELETED",
    ATTACHMENT_ADDED = "ATTACHMENT_ADDED",
    ATTACHMENT_DELETED = "ATTACHMENT_DELETED",
    SUBTASK_ADDED = "SUBTASK_ADDED",
    SUBTASK_COMPLETED = "SUBTASK_COMPLETED",
    STATUS_CHANGED = "STATUS_CHANGED",
    PRIORITY_CHANGED = "PRIORITY_CHANGED",
    ASSIGNEE_CHANGED = "ASSIGNEE_CHANGED",
    DUE_DATE_CHANGED = "DUE_DATE_CHANGED"
}

/**
 * Metadata structure for activity logs
 */
interface ActivityMetadata {
    oldValue?: string;
    newValue?: string;
    fieldName?: string;
    itemName?: string;
}
/**
 * Properties for Activity entity
 */
interface ActivityProps {
    id: string;
    taskId: string;
    userId: string;
    type: ActivityType;
    metadata?: ActivityMetadata;
    createdAt: Date;
}
/**
 * Activity entity represents a log entry for task-related actions
 *
 * Activities are immutable records of what happened to a task.
 * They provide an audit trail for task history and user actions.
 *
 * @example
 * ```typescript
 * const activity = new Activity({
 *   id: 'act-123',
 *   taskId: 'task-456',
 *   userId: 'user-789',
 *   type: ActivityType.STATUS_CHANGED,
 *   metadata: { oldValue: 'TODO', newValue: 'IN_PROGRESS', fieldName: 'status' },
 *   createdAt: new Date(),
 * });
 *
 * activity.isTaskRelated(); // true
 * activity.isCommentActivity(); // false
 * ```
 */
declare class Activity extends Entity<ActivityProps> {
    constructor(props: ActivityProps, mode?: 'valid' | 'draft');
    /**
     * Validate activity properties
     */
    private validate;
    get taskId(): string;
    get userId(): string;
    get type(): ActivityType;
    get metadata(): ActivityMetadata | undefined;
    get createdAt(): Date;
    /**
     * Check if this is a task-related activity
     */
    isTaskActivity(): boolean;
    /**
     * Check if this is a comment-related activity
     */
    isCommentActivity(): boolean;
    /**
     * Check if this is an attachment-related activity
     */
    isAttachmentActivity(): boolean;
    /**
     * Check if this is a subtask-related activity
     */
    isSubtaskActivity(): boolean;
    /**
     * Check if this is a field change activity
     */
    isFieldChangeActivity(): boolean;
    /**
     * Get the field name that changed (if applicable)
     */
    getChangedFieldName(): string | null;
    /**
     * Get human-readable description of the activity
     */
    getDescription(): string;
}

/**
 * Input for creating an activity log
 */
interface CreateActivityInput {
    taskId: string;
    userId: string;
    type: ActivityType;
    metadata?: ActivityMetadata;
}
/**
 * Repository interface for Activity domain
 */
interface ActivityRepository {
    /**
     * Log a new activity
     */
    logActivity(input: CreateActivityInput): Promise<Activity>;
    /**
     * Get activities for a specific task
     */
    getTaskActivities(taskId: string, limit?: number): Promise<Activity[]>;
    /**
     * Get activities by user
     */
    getUserActivities(userId: string, limit?: number): Promise<Activity[]>;
    /**
     * Get activities by type
     */
    getActivitiesByType(type: ActivityType, limit?: number): Promise<Activity[]>;
    /**
     * Get activities within a date range
     */
    getActivitiesByDateRange(startDate: Date, endDate: Date, taskId?: string): Promise<Activity[]>;
    /**
     * Delete old activities (for cleanup/retention)
     */
    deleteOldActivities(beforeDate: Date): Promise<number>;
}

interface LogActivityInput extends CreateActivityInput {
}
declare class LogActivityUseCase implements UseCase<LogActivityInput, Activity> {
    private readonly activityRepo;
    constructor(activityRepo: ActivityRepository);
    execute(input: LogActivityInput): Promise<Activity>;
}

interface GetTaskActivitiesInput {
    taskId: string;
    limit?: number;
}
declare class GetTaskActivitiesUseCase implements UseCase<GetTaskActivitiesInput, Activity[]> {
    private readonly activityRepo;
    constructor(activityRepo: ActivityRepository);
    execute(input: GetTaskActivitiesInput): Promise<Activity[]>;
}

type TrackCategory = 'nature' | 'cafe' | 'music' | 'white-noise' | 'binaural';
interface AmbientTrackProps extends EntityProps<string> {
    name: string;
    description: string;
    category: TrackCategory;
    iconEmoji: string;
    url: string;
    duration: number;
    isPremium: boolean;
}
declare class AmbientTrack extends Entity<AmbientTrackProps> {
    constructor(props: AmbientTrackProps, mode?: 'valid' | 'draft');
    private validate;
    isLooping(): boolean;
    getDurationInMinutes(): number;
    isAccessibleToUser(hasPremium: boolean): boolean;
    matchesCategory(category: TrackCategory): boolean;
    isNature(): boolean;
    isCafe(): boolean;
    isMusic(): boolean;
    isWhiteNoise(): boolean;
    isBinaural(): boolean;
    get name(): string;
    get description(): string;
    get category(): TrackCategory;
    get iconEmoji(): string;
    get url(): string;
    get duration(): number;
    get isPremium(): boolean;
}

interface FocusModeProps extends EntityProps {
    name: string;
    description: string;
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionsBeforeLongBreak: number;
    recommendedTrackIds: string[];
}
declare class FocusMode extends Entity<FocusModeProps> {
    constructor(props: FocusModeProps, mode?: 'valid' | 'draft');
    private validate;
    getTotalCycleTime(): number;
    getTotalCycleTimeWithLongBreak(): number;
    isLongBreakSession(sessionNumber: number): boolean;
    getExpectedSessionDuration(sessionNumber: number): number;
    hasRecommendedTrack(trackId: string): boolean;
    isIntensive(): boolean;
    isLight(): boolean;
    get name(): string;
    get description(): string;
    get workDuration(): number;
    get shortBreakDuration(): number;
    get longBreakDuration(): number;
    get sessionsBeforeLongBreak(): number;
    get recommendedTrackIds(): string[];
}

interface FocusPreferencesProps extends EntityProps {
    userId: string;
    favoriteTrackIds: string[];
    defaultVolume: number;
    enableTransitions: boolean;
    preferredModeId: string | null;
}
declare class FocusPreferences extends Entity<FocusPreferencesProps> {
    constructor(props: FocusPreferencesProps, mode?: 'valid' | 'draft');
    static create(userId: string): FocusPreferences;
    private validate;
    addFavorite(trackId: string): FocusPreferences;
    removeFavorite(trackId: string): FocusPreferences;
    toggleFavorite(trackId: string): FocusPreferences;
    isFavorite(trackId: string): boolean;
    updateVolume(volume: number): FocusPreferences;
    setTransitionsEnabled(enabled: boolean): FocusPreferences;
    setPreferredMode(modeId: string | null): FocusPreferences;
    hasPreferredMode(): boolean;
    getFavoriteCount(): number;
    get userId(): string;
    get favoriteTrackIds(): string[];
    get defaultVolume(): number;
    get enableTransitions(): boolean;
    get preferredModeId(): string | null;
}

/**
 * Value Object for Focus Session Statistics
 */
interface FocusStatsProps {
    totalSessions: number;
    totalFocusMinutes: number;
    avgSessionLength: number;
    favoriteTrack: string | null;
    preferredMode: string | null;
    streakDays: number;
}
declare class FocusStats {
    private readonly props;
    constructor(props: FocusStatsProps);
    private validate;
    getTotalFocusHours(): number;
    hasData(): boolean;
    hasStreak(): boolean;
    isProductive(): boolean;
    getStreakLevel(): 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
    get totalSessions(): number;
    get totalFocusMinutes(): number;
    get avgSessionLength(): number;
    get favoriteTrack(): string | null;
    get preferredMode(): string | null;
    get streakDays(): number;
    toJSON(): {
        totalSessions: number;
        totalFocusMinutes: number;
        totalFocusHours: number;
        avgSessionLength: number;
        favoriteTrack: string | null;
        preferredMode: string | null;
        streakDays: number;
        streakLevel: "none" | "bronze" | "silver" | "gold" | "platinum";
        hasData: boolean;
        hasStreak: boolean;
        isProductive: boolean;
    };
}

interface TrackUsageRecord {
    trackId: string;
    durationMinutes: number;
    userId: string;
    recordedAt?: Date;
}
interface FocusRepository {
    getUserPreferences(userId: string): Promise<FocusPreferences | null>;
    saveUserPreferences(preferences: FocusPreferences): Promise<void>;
    getFocusStats(userId: string): Promise<FocusStats>;
    calculateFocusStreak(userId: string): Promise<number>;
    recordTrackUsage(record: TrackUsageRecord): Promise<void>;
    getMostUsedTracks(userId: string, limit?: number): Promise<Array<{
        trackId: string;
        count: number;
    }>>;
    getMostUsedMode(userId: string): Promise<string | null>;
}

interface GetUserPreferencesInput {
    userId: string;
}
declare class GetUserPreferencesUseCase implements UseCase<GetUserPreferencesInput, FocusPreferences> {
    private readonly focusRepo;
    constructor(focusRepo: FocusRepository);
    execute(input: GetUserPreferencesInput): Promise<FocusPreferences>;
}

interface UpdateUserPreferencesInput {
    userId: string;
    defaultVolume?: number;
    enableTransitions?: boolean;
    preferredModeId?: string | null;
}
declare class UpdateUserPreferencesUseCase implements UseCase<UpdateUserPreferencesInput, FocusPreferences> {
    private readonly focusRepo;
    constructor(focusRepo: FocusRepository);
    execute(input: UpdateUserPreferencesInput): Promise<FocusPreferences>;
}

interface ToggleFavoriteTrackInput {
    userId: string;
    trackId: string;
}
declare class ToggleFavoriteTrackUseCase implements UseCase<ToggleFavoriteTrackInput, {
    isFavorite: boolean;
    preferences: FocusPreferences;
}> {
    private readonly focusRepo;
    constructor(focusRepo: FocusRepository);
    execute(input: ToggleFavoriteTrackInput): Promise<{
        isFavorite: boolean;
        preferences: FocusPreferences;
    }>;
}

interface GetFocusStatsInput {
    userId: string;
}
declare class GetFocusStatsUseCase implements UseCase<GetFocusStatsInput, FocusStats> {
    private readonly focusRepo;
    constructor(focusRepo: FocusRepository);
    execute(input: GetFocusStatsInput): Promise<FocusStats>;
}

interface RecordTrackUsageInput {
    userId: string;
    trackId: string;
    durationMinutes: number;
}
declare class RecordTrackUsageUseCase implements UseCase<RecordTrackUsageInput, void> {
    private readonly focusRepo;
    constructor(focusRepo: FocusRepository);
    execute(input: RecordTrackUsageInput): Promise<void>;
}

interface GetRecommendedTracksInput {
    userId: string;
    hasPremium: boolean;
    allAvailableTracks: AmbientTrack[];
}
declare class GetRecommendedTracksUseCase implements UseCase<GetRecommendedTracksInput, AmbientTrack[]> {
    private readonly focusRepo;
    constructor(focusRepo: FocusRepository);
    execute(input: GetRecommendedTracksInput): Promise<AmbientTrack[]>;
}

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
interface ActionItemProps extends EntityProps<string> {
    title: string;
    description?: string;
    assignee?: string;
    dueDate?: Date;
    priority: Priority;
    context: string;
    completed?: boolean;
    taskId?: string;
}
declare class ActionItem extends Entity<ActionItemProps> {
    constructor(props: ActionItemProps, mode?: 'valid' | 'draft');
    static create(props: Omit<ActionItemProps, 'id'>): ActionItem;
    private validate;
    isAssigned(): boolean;
    hasDueDate(): boolean;
    isOverdue(): boolean;
    isDueWithin(days: number): boolean;
    markAsCompleted(taskId?: string): ActionItem;
    linkToTask(taskId: string): ActionItem;
    isUrgent(): boolean;
    getPriorityLevel(): number;
    isHigherPriorityThan(other: ActionItem): boolean;
    get title(): string;
    get description(): string | undefined;
    get assignee(): string | undefined;
    get dueDate(): Date | undefined;
    get priority(): Priority;
    get context(): string;
    get completed(): boolean;
    get taskId(): string | undefined;
}

/**
 * Value Objects for Meeting Analysis components
 */
type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'MIXED';
interface KeyDecisionProps {
    decision: string;
    context: string;
    participants?: string[];
}
declare class KeyDecision {
    private readonly props;
    constructor(props: KeyDecisionProps);
    private validate;
    get decision(): string;
    get context(): string;
    get participants(): string[];
    hasParticipants(): boolean;
}
interface MeetingParticipantProps {
    name: string;
    role?: string;
    speakingTime?: number;
}
declare class MeetingParticipant {
    private readonly props;
    constructor(props: MeetingParticipantProps);
    private validate;
    get name(): string;
    get role(): string | undefined;
    get speakingTime(): number | undefined;
    hasRole(): boolean;
    isActiveSpeaker(): boolean;
}
interface MeetingTopicProps {
    topic: string;
    duration?: number;
    summary: string;
}
declare class MeetingTopic {
    private readonly props;
    constructor(props: MeetingTopicProps);
    private validate;
    get topic(): string;
    get duration(): number | undefined;
    get summary(): string;
    isMajorTopic(): boolean;
}
interface MeetingAnalysisProps {
    summary: string;
    keyPoints: string[];
    actionItems: any[];
    decisions: KeyDecision[];
    participants: MeetingParticipant[];
    topics: MeetingTopic[];
    sentiment: Sentiment;
    followUpRequired: boolean;
    suggestedFollowUpDate?: Date;
}
declare class MeetingAnalysis {
    private readonly props;
    constructor(props: MeetingAnalysisProps);
    private validate;
    hasActionItems(): boolean;
    hasDecisions(): boolean;
    hasParticipants(): boolean;
    hasTopics(): boolean;
    isPositive(): boolean;
    isNegative(): boolean;
    requiresFollowUp(): boolean;
    getActionItemCount(): number;
    getDecisionCount(): number;
    getParticipantCount(): number;
    getTopicCount(): number;
    wasProductive(): boolean;
    get summary(): string;
    get keyPoints(): string[];
    get actionItems(): any[];
    get decisions(): KeyDecision[];
    get participants(): MeetingParticipant[];
    get topics(): MeetingTopic[];
    get sentiment(): Sentiment;
    get followUpRequired(): boolean;
    get suggestedFollowUpDate(): Date | undefined;
}

interface MeetingProps extends EntityProps<string> {
    userId: string;
    title: string;
    date: Date;
    duration: number;
    transcript?: string;
    audioUrl?: string;
    analysis?: MeetingAnalysis;
    projectId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class Meeting extends Entity<MeetingProps> {
    constructor(props: MeetingProps, mode?: 'valid' | 'draft');
    static create(props: Omit<MeetingProps, 'id' | 'createdAt' | 'updatedAt'>): Meeting;
    private validate;
    hasTranscript(): boolean;
    hasAudio(): boolean;
    hasAnalysis(): boolean;
    isAssociatedWithProject(): boolean;
    isPast(): boolean;
    isFuture(): boolean;
    isToday(): boolean;
    isUpcoming(days?: number): boolean;
    getDurationInHours(): number;
    isLong(): boolean;
    isShort(): boolean;
    updateAnalysis(analysis: MeetingAnalysis): Meeting;
    addTranscript(transcript: string): Meeting;
    linkToProject(projectId: string): Meeting;
    get userId(): string;
    get title(): string;
    get date(): Date;
    get duration(): number;
    get transcript(): string | undefined;
    get audioUrl(): string | undefined;
    get analysis(): MeetingAnalysis | undefined;
    get projectId(): string | undefined;
    get createdAt(): Date;
    get updatedAt(): Date;
}

interface MeetingRepository {
    create(meeting: Meeting): Promise<Meeting>;
    findById(id: string): Promise<Meeting | null>;
    findByUserId(userId: string): Promise<Meeting[]>;
    findByProjectId(projectId: string): Promise<Meeting[]>;
    update(meeting: Meeting): Promise<Meeting>;
    delete(id: string): Promise<void>;
    findUpcoming(userId: string, days?: number): Promise<Meeting[]>;
    findPast(userId: string): Promise<Meeting[]>;
    findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Meeting[]>;
    findWithTranscript(userId: string): Promise<Meeting[]>;
    findWithAnalysis(userId: string): Promise<Meeting[]>;
    countByUserId(userId: string): Promise<number>;
    getTotalDuration(userId: string): Promise<number>;
    getMeetingsStats(userId: string): Promise<{
        total: number;
        withTranscript: number;
        withAnalysis: number;
        totalHours: number;
        avgDuration: number;
    }>;
}
interface MeetingAnalysisService {
    analyzeTranscript(transcript: string, options?: {
        meetingTitle?: string;
        participants?: string[];
        duration?: number;
        projectContext?: string;
    }): Promise<MeetingAnalysis>;
    extractActionItems(transcript: string, projectContext?: string): Promise<ActionItem[]>;
    generateSummary(transcript: string, style?: 'executive' | 'detailed' | 'bullet-points'): Promise<string>;
}

interface CreateMeetingInput {
    userId: string;
    title: string;
    date: Date;
    duration: number;
    transcript?: string;
    audioUrl?: string;
    projectId?: string;
}
declare class CreateMeetingUseCase implements UseCase<CreateMeetingInput, Meeting> {
    private readonly meetingRepo;
    constructor(meetingRepo: MeetingRepository);
    execute(input: CreateMeetingInput): Promise<Meeting>;
}

interface GetMeetingInput {
    id: string;
}
declare class GetMeetingUseCase implements UseCase<GetMeetingInput, Meeting | null> {
    private readonly meetingRepo;
    constructor(meetingRepo: MeetingRepository);
    execute(input: GetMeetingInput): Promise<Meeting | null>;
}

interface ListMeetingsInput {
    userId: string;
    projectId?: string;
    upcoming?: boolean;
    past?: boolean;
    days?: number;
}
declare class ListMeetingsUseCase implements UseCase<ListMeetingsInput, Meeting[]> {
    private readonly meetingRepo;
    constructor(meetingRepo: MeetingRepository);
    execute(input: ListMeetingsInput): Promise<Meeting[]>;
}

interface AnalyzeTranscriptInput {
    transcript: string;
    meetingTitle?: string;
    participants?: string[];
    duration?: number;
    projectContext?: string;
}
declare class AnalyzeTranscriptUseCase implements UseCase<AnalyzeTranscriptInput, MeetingAnalysis> {
    private readonly analysisService;
    constructor(analysisService: MeetingAnalysisService);
    execute(input: AnalyzeTranscriptInput): Promise<MeetingAnalysis>;
}

interface ExtractActionItemsInput {
    transcript: string;
    projectContext?: string;
}
declare class ExtractActionItemsUseCase implements UseCase<ExtractActionItemsInput, ActionItem[]> {
    private readonly analysisService;
    constructor(analysisService: MeetingAnalysisService);
    execute(input: ExtractActionItemsInput): Promise<ActionItem[]>;
}

interface GenerateSummaryInput {
    transcript: string;
    style?: 'executive' | 'detailed' | 'bullet-points';
}
declare class GenerateSummaryUseCase implements UseCase<GenerateSummaryInput, string> {
    private readonly analysisService;
    constructor(analysisService: MeetingAnalysisService);
    execute(input: GenerateSummaryInput): Promise<string>;
}

interface UpdateMeetingAnalysisInput {
    meetingId: string;
    analysis: MeetingAnalysis;
}
declare class UpdateMeetingAnalysisUseCase implements UseCase<UpdateMeetingAnalysisInput, Meeting> {
    private readonly meetingRepo;
    constructor(meetingRepo: MeetingRepository);
    execute(input: UpdateMeetingAnalysisInput): Promise<Meeting>;
}

/**
 * Value Object representing image processing specifications
 *
 * Defines validation rules and processing parameters for images.
 * These specifications are used throughout the image processing pipeline.
 *
 * @example
 * ```typescript
 * const avatarSpecs = ImageSpecs.forAvatar();
 * const customSpecs = new ImageSpecs({
 *   maxFileSize: 10 * 1024 * 1024, // 10MB
 *   maxDimensions: 5000,
 *   targetSize: 512,
 *   quality: 90,
 *   format: 'jpeg',
 * });
 * ```
 */
declare class ImageSpecs {
    readonly maxFileSize: number;
    readonly maxDimensions: number;
    readonly targetSize?: number;
    readonly quality?: number;
    readonly format?: string;
    constructor(props: {
        maxFileSize: number;
        maxDimensions: number;
        targetSize?: number;
        quality?: number;
        format?: string;
    });
    private validate;
    /**
     * Get specifications for avatar processing
     */
    static forAvatar(): ImageSpecs;
    /**
     * Get specifications for general image optimization
     */
    static forOptimization(): ImageSpecs;
    /**
     * Get specifications for thumbnail processing
     */
    static forThumbnail(): ImageSpecs;
    /**
     * Get max file size in MB
     */
    getMaxFileSizeInMB(): number;
    /**
     * Check if file size is within limits
     */
    isValidFileSize(sizeInBytes: number): boolean;
    /**
     * Check if dimensions are within limits
     */
    isValidDimensions(width: number, height: number): boolean;
    /**
     * Check if this is an avatar specification
     */
    isAvatarSpecs(): boolean;
}

/**
 * Value Object representing a processed image
 *
 * Contains the result of image processing operations including
 * the buffer, dimensions, format, and size information.
 *
 * @example
 * ```typescript
 * const processed = new ProcessedImage({
 *   buffer: Buffer.from('...'),
 *   width: 256,
 *   height: 256,
 *   format: 'jpeg',
 *   size: 12345,
 *   originalName: 'avatar.jpg',
 * });
 *
 * processed.isSquare(); // true
 * processed.getSizeInKB(); // ~12 KB
 * ```
 */
declare class ProcessedImage {
    readonly buffer: Buffer;
    readonly width: number;
    readonly height: number;
    readonly format: string;
    readonly size: number;
    readonly originalName?: string;
    constructor(props: {
        buffer: Buffer;
        width: number;
        height: number;
        format: string;
        size: number;
        originalName?: string;
    });
    private validate;
    /**
     * Get size in bytes
     */
    getSizeInBytes(): number;
    /**
     * Get size in KB
     */
    getSizeInKB(): number;
    /**
     * Get size in MB
     */
    getSizeInMB(): number;
    /**
     * Check if image is square
     */
    isSquare(): boolean;
    /**
     * Check if image is landscape
     */
    isLandscape(): boolean;
    /**
     * Check if image is portrait
     */
    isPortrait(): boolean;
    /**
     * Check if format is JPEG
     */
    isJPEG(): boolean;
    /**
     * Check if format is PNG
     */
    isPNG(): boolean;
    /**
     * Check if format is WEBP
     */
    isWEBP(): boolean;
    /**
     * Get aspect ratio
     */
    getAspectRatio(): number;
    /**
     * Get megapixel count
     */
    getMegapixels(): number;
    /**
     * Generate filename for storage
     */
    generateFilename(prefix?: string): string;
    /**
     * Get file extension
     */
    getExtension(): string;
    /**
     * Get MIME type
     */
    getMimeType(): string;
    /**
     * Convert to DTO for API responses
     */
    toDTO(): {
        size: number;
        width: number;
        height: number;
        format: string;
        sizeInKB: number;
        sizeInMB: number;
        aspectRatio: number;
        megapixels: number;
        isSquare: boolean;
        mimeType: string;
    };
}

declare enum RecurrencePattern {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY",
    CUSTOM = "CUSTOM"
}

/**
 * Properties for Recurrence entity
 */
interface RecurrenceProps {
    id: string;
    taskId: string;
    pattern: RecurrencePattern;
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    endDate?: Date;
    createdAt: Date;
}
/**
 * Recurrence entity represents task recurrence patterns
 *
 * Handles complex recurring task logic including daily, weekly, monthly,
 * and yearly patterns with custom intervals and end dates.
 *
 * @example
 * ```typescript
 * const recurrence = new Recurrence({
 *   id: 'rec-123',
 *   taskId: 'task-456',
 *   pattern: RecurrencePattern.WEEKLY,
 *   interval: 2, // Every 2 weeks
 *   daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
 *   endDate: new Date('2026-12-31'),
 *   createdAt: new Date(),
 * });
 *
 * recurrence.getNextOccurrence(new Date()); // Returns next date
 * recurrence.isActive(); // true if before endDate
 * ```
 */
declare class Recurrence extends Entity<RecurrenceProps> {
    constructor(props: RecurrenceProps, mode?: 'valid' | 'draft');
    /**
     * Validate recurrence properties
     */
    private validate;
    get taskId(): string;
    get pattern(): RecurrencePattern;
    get interval(): number;
    get daysOfWeek(): number[] | undefined;
    get dayOfMonth(): number | undefined;
    get endDate(): Date | undefined;
    /**
     * Check if recurrence is still active
     */
    isActive(): boolean;
    /**
     * Check if recurrence has ended
     */
    hasEnded(): boolean;
    /**
     * Check if pattern is daily
     */
    isDaily(): boolean;
    /**
     * Check if pattern is weekly
     */
    isWeekly(): boolean;
    /**
     * Check if pattern is monthly
     */
    isMonthly(): boolean;
    /**
     * Check if pattern is yearly
     */
    isYearly(): boolean;
    /**
     * Calculate next occurrence from a given date
     */
    getNextOccurrence(fromDate?: Date): Date | null;
    /**
     * Get multiple next occurrences
     */
    getNextOccurrences(count: number, fromDate?: Date): Date[];
    /**
     * Calculate next weekly occurrence
     */
    private getNextWeeklyOccurrence;
    /**
     * Calculate next monthly occurrence
     */
    private getNextMonthlyOccurrence;
    /**
     * Get number of days in a month
     */
    private getDaysInMonth;
    /**
     * Get human-readable description
     */
    getDescription(): string;
}

/**
 * Input for creating/updating recurrence
 */
interface RecurrenceInput {
    taskId: string;
    pattern: RecurrencePattern;
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    endDate?: Date;
}
/**
 * Repository interface for Recurrence domain
 */
interface RecurrenceRepository {
    /**
     * Create recurrence for a task
     */
    create(input: RecurrenceInput): Promise<Recurrence>;
    /**
     * Get recurrence by ID
     */
    findById(id: string): Promise<Recurrence | null>;
    /**
     * Get recurrence by task ID
     */
    findByTaskId(taskId: string): Promise<Recurrence | null>;
    /**
     * Update recurrence
     */
    update(id: string, input: Partial<RecurrenceInput>): Promise<Recurrence>;
    /**
     * Delete recurrence
     */
    delete(id: string): Promise<void>;
    /**
     * Get all active recurrences
     */
    findActive(): Promise<Recurrence[]>;
    /**
     * Get recurrences ending before a date
     */
    findEndingBefore(date: Date): Promise<Recurrence[]>;
    /**
     * Get recurrences for a specific pattern
     */
    findByPattern(pattern: RecurrencePattern): Promise<Recurrence[]>;
}

declare class CreateRecurrenceUseCase implements UseCase<RecurrenceInput, Recurrence> {
    private readonly recurrenceRepo;
    constructor(recurrenceRepo: RecurrenceRepository);
    execute(input: RecurrenceInput): Promise<Recurrence>;
}

interface GetNextOccurrenceInput {
    taskId: string;
    fromDate?: Date;
}
declare class GetNextOccurrenceUseCase implements UseCase<GetNextOccurrenceInput, Date | null> {
    private readonly recurrenceRepo;
    constructor(recurrenceRepo: RecurrenceRepository);
    execute(input: GetNextOccurrenceInput): Promise<Date | null>;
}

declare enum SubscriptionPlan {
    FREE = "FREE",
    PRO = "PRO",
    TEAM = "TEAM",
    ENTERPRISE = "ENTERPRISE"
}
declare enum SubscriptionStatus {
    ACTIVE = "ACTIVE",
    CANCELED = "CANCELED",
    INCOMPLETE = "INCOMPLETE",
    INCOMPLETE_EXPIRED = "INCOMPLETE_EXPIRED",
    PAST_DUE = "PAST_DUE",
    TRIALING = "TRIALING",
    UNPAID = "UNPAID"
}

/**
 * Properties for Subscription entity
 */
interface SubscriptionProps {
    id: string;
    userId: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripePriceId?: string;
    stripeCurrentPeriodEnd?: Date;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Subscription entity represents user subscription plan
 *
 * Handles billing plans, subscription status, and Stripe integration.
 * Enforces business rules for plan upgrades, downgrades, and cancellations.
 *
 * @example
 * ```typescript
 * const subscription = new Subscription({
 *   id: 'sub-123',
 *   userId: 'user-456',
 *   plan: SubscriptionPlan.PRO,
 *   status: SubscriptionStatus.ACTIVE,
 *   stripeCustomerId: 'cus_xyz',
 *   stripeSubscriptionId: 'sub_xyz',
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * });
 *
 * subscription.isActive(); // true
 * subscription.canUpgradeTo(SubscriptionPlan.TEAM); // true
 * ```
 */
declare class Subscription extends Entity<SubscriptionProps> {
    constructor(props: SubscriptionProps, mode?: 'valid' | 'draft');
    /**
     * Validate subscription properties
     */
    private validate;
    get userId(): string;
    get plan(): SubscriptionPlan;
    get status(): SubscriptionStatus;
    get stripeCustomerId(): string | undefined;
    get stripeSubscriptionId(): string | undefined;
    get stripePriceId(): string | undefined;
    get stripeCurrentPeriodEnd(): Date | undefined;
    /**
     * Check if subscription is active
     */
    isActive(): boolean;
    /**
     * Check if subscription is cancelled
     */
    isCancelled(): boolean;
    /**
     * Check if subscription is past due
     */
    isPastDue(): boolean;
    /**
     * Check if subscription is on trial
     */
    isTrial(): boolean;
    /**
     * Check if plan is free
     */
    isFree(): boolean;
    /**
     * Check if plan is paid (PRO, TEAM, or ENTERPRISE)
     */
    isPaid(): boolean;
    /**
     * Check if user can upgrade to a specific plan
     */
    canUpgradeTo(targetPlan: SubscriptionPlan): boolean;
    /**
     * Check if user can downgrade to a specific plan
     */
    canDowngradeTo(targetPlan: SubscriptionPlan): boolean;
    /**
     * Get plan level
     */
    getPlanLevel(): number;
    /**
     * Check if subscription has access to team features
     */
    hasTeamFeatures(): boolean;
    /**
     * Check if subscription has access to enterprise features
     */
    hasEnterpriseFeatures(): boolean;
    /**
     * Get days remaining in current billing period
     */
    getDaysRemainingInPeriod(): number | null;
    /**
     * Check if subscription is in trial period
     */
    isInTrialPeriod(): boolean;
}

/**
 * Input for creating/updating subscription
 */
interface SubscriptionInput {
    userId: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripePriceId?: string;
    stripeCurrentPeriodEnd?: Date;
}
/**
 * Repository interface for Subscription domain
 */
interface SubscriptionRepository {
    /**
     * Create subscription
     */
    create(input: SubscriptionInput): Promise<Subscription>;
    /**
     * Get subscription by ID
     */
    findById(id: string): Promise<Subscription | null>;
    /**
     * Get subscription by user ID
     */
    findByUserId(userId: string): Promise<Subscription | null>;
    /**
     * Get subscription by Stripe customer ID
     */
    findByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | null>;
    /**
     * Get subscription by Stripe subscription ID
     */
    findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null>;
    /**
     * Update subscription
     */
    update(id: string, input: Partial<SubscriptionInput>): Promise<Subscription>;
    /**
     * Update subscription status
     */
    updateStatus(id: string, status: SubscriptionStatus): Promise<Subscription>;
    /**
     * Get all active subscriptions
     */
    findActive(): Promise<Subscription[]>;
    /**
     * Get subscriptions by plan
     */
    findByPlan(plan: SubscriptionPlan): Promise<Subscription[]>;
    /**
     * Get subscriptions expiring soon (within 7 days)
     */
    findExpiringSoon(): Promise<Subscription[]>;
    /**
     * Cancel subscription
     */
    cancel(id: string): Promise<Subscription>;
}

interface GetUserSubscriptionInput {
    userId: string;
}
declare class GetUserSubscriptionUseCase implements UseCase<GetUserSubscriptionInput, Subscription | null> {
    private readonly subscriptionRepo;
    constructor(subscriptionRepo: SubscriptionRepository);
    execute(input: GetUserSubscriptionInput): Promise<Subscription | null>;
}

interface UpgradePlanInput {
    subscriptionId: string;
    newPlan: SubscriptionPlan;
    stripePriceId?: string;
}
declare class UpgradePlanUseCase implements UseCase<UpgradePlanInput, Subscription> {
    private readonly subscriptionRepo;
    constructor(subscriptionRepo: SubscriptionRepository);
    execute(input: UpgradePlanInput): Promise<Subscription>;
}

/**
 * Properties for Session entity
 */
interface SessionProps {
    id: string;
    sessionToken: string;
    userId: string;
    expires: Date;
}
/**
 * Session entity represents user authentication session
 *
 * Simple entity for session management.
 * No complex business logic.
 *
 * @example
 * ```typescript
 * const session = new Session({
 *   id: 'sess-123',
 *   sessionToken: 'token-xyz',
 *   userId: 'user-456',
 *   expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
 * });
 *
 * session.isExpired(); // false
 * session.getDaysUntilExpiry(); // 7
 * ```
 */
declare class Session extends Entity<SessionProps> {
    constructor(props: SessionProps, mode?: 'valid' | 'draft');
    private validate;
    get sessionToken(): string;
    get userId(): string;
    get expires(): Date;
    /**
     * Check if session is expired
     */
    isExpired(): boolean;
    /**
     * Check if session is valid (not expired)
     */
    isValid(): boolean;
    /**
     * Get days until expiry
     */
    getDaysUntilExpiry(): number;
}

/**
 * Properties for Account entity (OAuth)
 */
interface AccountProps {
    id: string;
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token?: string;
    access_token?: string;
    expires_at?: number;
    token_type?: string;
    scope?: string;
    id_token?: string;
    session_state?: string;
}
/**
 * Account entity represents OAuth connected account
 *
 * Simple entity for third-party OAuth providers.
 * No complex business logic.
 *
 * @example
 * ```typescript
 * const account = new Account({
 *   id: 'acc-123',
 *   userId: 'user-456',
 *   type: 'oauth',
 *   provider: 'google',
 *   providerAccountId: 'google-123',
 *   access_token: 'token',
 * });
 *
 * account.isExpired(); // checks expires_at
 * ```
 */
declare class Account extends Entity<AccountProps> {
    constructor(props: AccountProps, mode?: 'valid' | 'draft');
    private validate;
    get userId(): string;
    get provider(): string;
    get providerAccountId(): string;
    get access_token(): string | undefined;
    get refresh_token(): string | undefined;
    get expires_at(): number | undefined;
    /**
     * Check if OAuth token is expired
     */
    isExpired(): boolean;
    /**
     * Check if account has refresh token
     */
    hasRefreshToken(): boolean;
}

interface SessionInput {
    sessionToken: string;
    userId: string;
    expires: Date;
}
interface SessionRepository {
    create(input: SessionInput): Promise<Session>;
    findById(id: string): Promise<Session | null>;
    findByToken(token: string): Promise<Session | null>;
    findByUserId(userId: string): Promise<Session[]>;
    delete(id: string): Promise<void>;
    deleteByUserId(userId: string): Promise<void>;
    deleteExpired(): Promise<number>;
}

interface AccountInput {
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token?: string;
    access_token?: string;
    expires_at?: number;
    token_type?: string;
    scope?: string;
    id_token?: string;
    session_state?: string;
}
interface AccountRepository {
    create(input: AccountInput): Promise<Account>;
    findById(id: string): Promise<Account | null>;
    findByUserId(userId: string): Promise<Account[]>;
    findByProvider(provider: string): Promise<Account[]>;
    update(id: string, input: Partial<AccountInput>): Promise<Account>;
    delete(id: string): Promise<void>;
}

/**
 * Properties for AdminUser entity
 */
interface AdminUserProps {
    id: string;
    email: string;
    hashedPassword: string;
    name: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * AdminUser entity represents admin panel users
 *
 * Simple entity for admin authentication and authorization.
 * No complex business logic, just basic CRUD.
 *
 * @example
 * ```typescript
 * const admin = new AdminUser({
 *   id: 'admin-123',
 *   email: 'admin@example.com',
 *   hashedPassword: 'hash',
 *   name: 'Admin User',
 *   role: 'admin',
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * });
 *
 * admin.isSuperAdmin(); // depends on role
 * ```
 */
declare class AdminUser extends Entity<AdminUserProps> {
    constructor(props: AdminUserProps, mode?: 'valid' | 'draft');
    private validate;
    get email(): string;
    get hashedPassword(): string;
    get name(): string;
    get role(): string;
    /**
     * Check if user is super admin
     */
    isSuperAdmin(): boolean;
    /**
     * Check if user has specific role
     */
    hasRole(role: string): boolean;
}

interface AdminUserInput {
    email: string;
    hashedPassword: string;
    name: string;
    role?: string;
}
interface AdminUserRepository {
    create(input: AdminUserInput): Promise<AdminUser>;
    findById(id: string): Promise<AdminUser | null>;
    findByEmail(email: string): Promise<AdminUser | null>;
    update(id: string, input: Partial<AdminUserInput>): Promise<AdminUser>;
    delete(id: string): Promise<void>;
    findAll(): Promise<AdminUser[]>;
}

declare enum IntegrationProvider {
    GOOGLE_CALENDAR = "GOOGLE_CALENDAR",
    GOOGLE_TASKS = "GOOGLE_TASKS",
    SLACK = "SLACK",
    GITHUB = "GITHUB",
    MICROSOFT_TEAMS = "MICROSOFT_TEAMS",
    NOTION = "NOTION",
    ZAPIER = "ZAPIER"
}

/**
 * Properties for UserIntegration entity
 */
interface UserIntegrationProps {
    id: string;
    userId: string;
    provider: IntegrationProvider;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    scope?: string;
    providerUserId?: string;
    providerEmail?: string;
    settings?: Record<string, unknown>;
    isActive: boolean;
    lastSyncAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * UserIntegration entity represents third-party service integrations
 *
 * Handles connections to Google, Slack, GitHub, etc.
 * Manages OAuth tokens and sync status.
 *
 * @example
 * ```typescript
 * const integration = new UserIntegration({
 *   id: 'int-123',
 *   userId: 'user-456',
 *   provider: IntegrationProvider.GOOGLE_CALENDAR,
 *   accessToken: 'xyz',
 *   isActive: true,
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * });
 *
 * integration.needsSync(); // true if last sync > 1 hour ago
 * integration.isExpired(); // checks token expiry
 * ```
 */
declare class UserIntegration extends Entity<UserIntegrationProps> {
    constructor(props: UserIntegrationProps, mode?: 'valid' | 'draft');
    private validate;
    get userId(): string;
    get provider(): IntegrationProvider;
    get accessToken(): string | undefined;
    get refreshToken(): string | undefined;
    get expiresAt(): Date | undefined;
    get isActive(): boolean;
    get lastSyncAt(): Date | undefined;
    get settings(): Record<string, unknown> | undefined;
    /**
     * Check if integration is active and connected
     */
    isConnected(): boolean;
    /**
     * Check if access token is expired
     */
    isExpired(): boolean;
    /**
     * Check if token will expire soon (within 1 hour)
     */
    willExpireSoon(): boolean;
    /**
     * Check if integration needs sync (no sync in last hour)
     */
    needsSync(): boolean;
    /**
     * Check if sync is recent (within last hour)
     */
    hasRecentSync(): boolean;
    /**
     * Get time since last sync in minutes
     */
    getMinutesSinceLastSync(): number | null;
    /**
     * Update sync timestamp
     */
    markAsSynced(): UserIntegration;
    /**
     * Deactivate integration
     */
    deactivate(): UserIntegration;
    /**
     * Activate integration
     */
    activate(): UserIntegration;
    /**
     * Update settings
     */
    updateSettings(settings: Record<string, unknown>): UserIntegration;
    /**
     * Get a specific setting value
     */
    getSetting<K extends keyof Record<string, unknown>>(key: K): Record<string, unknown>[K] | undefined;
}

interface UserIntegrationInput {
    userId: string;
    provider: IntegrationProvider;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    scope?: string;
    providerUserId?: string;
    providerEmail?: string;
    settings?: Record<string, unknown>;
}
interface UserIntegrationRepository {
    create(input: UserIntegrationInput): Promise<UserIntegration>;
    findById(id: string): Promise<UserIntegration | null>;
    findByUserAndProvider(userId: string, provider: IntegrationProvider): Promise<UserIntegration | null>;
    findByUser(userId: string): Promise<UserIntegration[]>;
    update(id: string, input: Partial<UserIntegrationInput>): Promise<UserIntegration>;
    updateLastSync(id: string): Promise<UserIntegration>;
    deactivate(id: string): Promise<void>;
    delete(id: string): Promise<void>;
    findActive(): Promise<UserIntegration[]>;
    findExpiringSoon(): Promise<UserIntegration[]>;
}

export { type AIChatContext, AIProfile, type AIProfileProps, type AIProfileRepository, type AIService, type AcceptInvitation, AcceptInvitationUseCase, Account, type AccountInput, type AccountProps, type AccountRepository, Achievement, type AchievementProps, ActionItem, type ActionItemProps, Activity, type ActivityMetadata, type ActivityProps, type ActivityRepository, ActivityType, AddMemberToWorkspaceUseCase, type AddMentionInput, AddMentionUseCase, AdminUser, type AdminUserInput, type AdminUserProps, type AdminUserRepository, AmbientTrack, type AmbientTrackProps, type AnalyticsRepository, type AnalyzeTranscriptInput, AnalyzeTranscriptUseCase, type ArchiveProject, ArchiveProjectUseCase, ArchiveWorkspaceUseCase, type AskQuestionInput, AskQuestionUseCase, AssignTagToTaskUseCase, type AssignTags, Attachment, type AttachmentProps, type AttachmentRepository, type AuditAction, BlogComment, type BlogCommentProps, BlogPost, type BlogPostProps, type BulkUpdateTasks, COMMENT_LIMITS, CalculateFocusScoreUseCase, type ChangePassword, ChangeUserName, ChangelogEntry, type ChangelogEntryProps, type ChangelogType, ChatConversation, type ChatConversationProps, ChatMessage, type ChatMessageProps, type ChatRole, Comment, type CommentBase, type CommentFilter, type CommentProps, type CommentRepository, type CompleteTaskInput, CompleteTaskUseCase, ContactSubmission, type ContactSubmissionProps, type CountUnreadNotificationsInput, type CountUnreadNotificationsOutput, CountUnreadNotificationsUseCase, type CreateActivityInput, type CreateAttachmentInput, CreateAttachmentUseCase, type CreateAuditLogInput, CreateAuditLogUseCase, type CreateCommentDTO, type CreateCommentInput, CreateCommentUseCase, type CreateMeetingInput, CreateMeetingUseCase, type CreateNoteInput, CreateNoteUseCase, type CreateNotificationInput, CreateNotificationUseCase, type CreateProjectDTO, CreateProjectUseCase, CreateRecurrenceUseCase, type CreateTagDTO, CreateTagUseCase, type CreateTaskDTO, type CreateTaskInput, CreateTaskUseCase, type CreateUserProps, CreateWorkflowUseCase, type CreateWorkspaceDTO, CreateWorkspaceUseCase, type CryptoProvider, CustomField, CustomFieldType, CustomFieldValue, DEFAULT_POMODORO_SETTINGS, DailyMetrics, type DailyMetricsProps, type DeleteAttachmentInput, DeleteAttachmentUseCase, type DeleteCommentInput, DeleteCommentUseCase, type DeleteNoteInput, DeleteNoteUseCase, type DeleteNotificationInput, DeleteNotificationUseCase, DeleteProjectUseCase, DeleteWorkflowUseCase, type DuplicateProject, Email, Entity, type EntityMode, type EntityProps, type ExecuteSearchInput, ExecuteSearchUseCase, type ExtractActionItemsInput, ExtractActionItemsUseCase, FAQ, type FAQProps, FILE_LIMITS, type FindAllNotesInput, FindAllNotesUseCase, type FindNoteInput, FindNoteUseCase, FocusMode, type FocusModeProps, FocusPreferences, type FocusPreferencesProps, type FocusRepository, type FocusScoreInput, FocusStats, type FocusStatsProps, type GenerateSummaryInput, GenerateSummaryUseCase, type GenerateWeeklyReportInput, type GenerateWeeklyReportOutput, GenerateWeeklyReportUseCase, type GetAttachmentByIdInput, GetAttachmentByIdUseCase, type GetAttachmentsByTaskInput, GetAttachmentsByTaskUseCase, type GetAttachmentsByUserInput, GetAttachmentsByUserUseCase, type GetCommentsByTaskInput, GetCommentsByTaskUseCase, type GetCommentsByUserInput, GetCommentsByUserUseCase, type GetConversationsOptions, type GetConversationsResult, GetDailyMetricsUseCase, GetDeletedProjectsUseCase, GetDeletedTasksUseCase, GetDeletedWorkspacesUseCase, type GetFocusStatsInput, GetFocusStatsUseCase, type GetMeetingInput, GetMeetingUseCase, type GetNextOccurrenceInput, GetNextOccurrenceUseCase, type GetNotificationByIdInput, GetNotificationByIdUseCase, type GetNotificationsByTypeInput, GetNotificationsByTypeUseCase, type GetOptimalScheduleInput, GetOptimalScheduleUseCase, type GetRecommendedTracksInput, GetRecommendedTracksUseCase, type GetSuggestionsInput, GetSuggestionsUseCase, type GetTaskActivitiesInput, GetTaskActivitiesUseCase, type GetUnreadNotificationsInput, GetUnreadNotificationsUseCase, type GetUserPreferencesInput, GetUserPreferencesUseCase, type GetUserSubscriptionInput, GetUserSubscriptionUseCase, type GetWorkspaceAuditLogsInput, type GetWorkspaceAuditLogsOutput, GetWorkspaceAuditLogsUseCase, type GetWorkspaceSettingsInput, GetWorkspaceSettingsUseCase, Habit, type HabitCompletionProps, type HabitFrequency, type HabitProps, HashPassword, type HashService, type IBlogRepository, type IChangelogRepository, type IChatRepository, type ICollaborationRepository, type IContactRepository, type ICustomFieldRepository, type IFAQRepository, type IGamificationRepository, type IHabitRepository, type IKBRepository, type INewsletterRepository, type IObjectiveRepository, type IRoadmapRepository, type ITaskTemplateRepository, Id, ImageSpecs, IntegrationProvider, type InviteMemberDTO, InviteMemberUseCase, type InviteStatus, KBArticle, type KBArticleProps, KBCategory, type KBCategoryProps, KeyDecision, type KeyDecisionProps, KeyResult, type KeyResultProps, KeyResultTask, type KeyResultTaskProps, type LearnFromSessionInput, LearnFromSessionUseCase, type ListMeetingsInput, ListMeetingsUseCase, ListWorkflowsUseCase, type LogActivityInput, LogActivityUseCase, type LoggedUser, type LoginUserDTO, MEMBER_ROLES, type MarkAllAsReadInput, type MarkAllAsReadOutput, MarkAllAsReadUseCase, type MarkAsReadInput, MarkAsReadUseCase, type MarkAsUnreadInput, MarkAsUnreadUseCase, type MarkAsUploadedInput, MarkAsUploadedUseCase, Meeting, MeetingAnalysis, type MeetingAnalysisProps, type MeetingAnalysisService, MeetingParticipant, type MeetingParticipantProps, type MeetingProps, type MeetingRepository, MeetingTopic, type MeetingTopicProps, MemberRole, type MemberRoleValue, type MemberWithUser, type MemberWorkload, type MetricType, type MetricsSnapshot, MockAIService, NOTIFICATION_LIMITS, NewsletterSubscriber, type NewsletterSubscriberProps, Note, type NoteProps, type NoteRepository, Notification, type NotificationProps, type NotificationRepository, NotificationType, type OKRPeriod, Objective, type ObjectiveProps, type ObjectiveStatus, type OptimalScheduleOutput, PAGINATION_LIMITS, PRIORITY_VALUES, PROJECT_COLORS, PROJECT_LIMITS, PROJECT_STATUS, PROJECT_STATUS_VALUES, type PaginatedSessions, type PaginationParams, type PauseRecord, PauseTimerUseCase, PermanentDeleteProjectUseCase, PermanentDeleteTaskUseCase, PermanentDeleteWorkspaceUseCase, PersonName, type PredictTaskDurationInput, type PredictTaskDurationOutput, PredictTaskDurationUseCase, type Priority, ProcessedImage, ProductivityReport, type ProductivityReportProps, type ProductivityReportRepository, Project, type ProjectBase, type ProjectColor, type ProjectFilter, type ProjectProps, type ProjectRepository, type ProjectStatusValue, type RecordTrackUsageInput, RecordTrackUsageUseCase, Recurrence, type RecurrenceInput, RecurrencePattern, type RecurrenceProps, type RecurrenceRepository, RegisterUser, type RegisterUserDTO, RemoveMemberFromWorkspaceUseCase, type RemoveMentionInput, RemoveMentionUseCase, RemoveTagFromTaskUseCase, type ReorderTasks, type ReportScope, RequiredString, type RequiredStringOptions, type ResetPassword, type ResetPasswordRequest, ResourceType, RestoreProjectUseCase, RestoreTaskUseCase, RestoreWorkspaceUseCase, ResumeTimerUseCase, RoadmapItem, type RoadmapItemProps, type RoadmapStatus, RoadmapVote, type RoadmapVoteProps, type SearchEntityType, type SearchFilters, type SearchIntent, SearchQuery, type SearchQueryProps, type SearchRepository, SearchResult, type SearchResultEntityType, type SearchResultProps, SearchResults, type SearchResultsProps, type SearchService, type Sentiment, Session, type SessionFilters, type SessionInput, type SessionProps, type SessionRepository, type SessionStats, type SessionType, SoftDeleteProjectUseCase, SoftDeleteTaskUseCase, SoftDeleteWorkspaceUseCase, StartTimerUseCase, StopTimerUseCase, Subscription, type SubscriptionInput, SubscriptionPlan, type SubscriptionProps, type SubscriptionRepository, SubscriptionStatus, SwitchTaskUseCase, TAG_COLORS, TAG_LIMITS, TASK_LIMITS, TASK_PRIORITIES, TASK_STATUS, TASK_STATUS_VALUES, TIMER_LIMITS, TIMER_MODES, TIMER_MODE_VALUES, Tag, type TagBase, type TagColor, type TagFilter, type TagProps, type TagRepository, Task, type TaskBase, TaskDependency, type TaskDependencyInput, type TaskDependencyProps, type TaskDependencyRepository, type TaskFilter, type TaskPriority, type TaskPriorityValue, type TaskProps, type TaskRecurrenceInfo, type TaskRepository, type TaskStatus, type TaskStatusValue, TaskTemplate, type TaskTemplateProps, type TeamWorkloadSummary, type TimeOfDay, TimeSession, type TimeSessionProps, type TimerMode, type TimerRepository, type ToggleFavoriteTrackInput, ToggleFavoriteTrackUseCase, type TrackCategory, type TrackUsageRecord, type TransferOwnership, USER_LIMITS, type UpdateCommentDTO, type UpdateCommentInput, UpdateCommentUseCase, type UpdateDailyMetricsInput, UpdateDailyMetricsUseCase, type UpdateMeetingAnalysisInput, UpdateMeetingAnalysisUseCase, type UpdateMemberRole, type UpdateNoteInput, UpdateNoteUseCase, type UpdateProjectDTO, UpdateProjectUseCase, type UpdateTagDTO, UpdateTagUseCase, type UpdateTaskDTO, type UpdateUserPreferencesInput, UpdateUserPreferencesUseCase, type UpdateUserProfile, UpdateWorkflowUseCase, type UpdateWorkspaceDTO, type UpdateWorkspaceSettingsInput, UpdateWorkspaceSettingsUseCase, type UpgradePlanInput, UpgradePlanUseCase, type UseCase, User, UserAchievement, type UserAchievementProps, UserByEmail, UserIntegration, type UserIntegrationInput, type UserIntegrationProps, type UserIntegrationRepository, UserLogin, type UserPreferences, type UserProps, type UserRepository, type UsernameValidation, type ValueObject, type ViewType, WORKSPACE_COLORS, WORKSPACE_LIMITS, WORKSPACE_TYPES, type WeeklyReportContext, type WeeklyReportData, Workflow, type WorkflowProps, type WorkflowRepository, type WorkloadSuggestion, Workspace, WorkspaceAuditLog, type WorkspaceAuditLogProps, type WorkspaceAuditLogRepository, type WorkspaceBase, type WorkspaceColor, type WorkspaceFilter, WorkspaceInvitation, type WorkspaceInvitationProps, type WorkspaceInvitationRepository, WorkspaceMember, type WorkspaceMemberInput, type WorkspaceMemberProps, type WorkspaceMemberRepository, type WorkspaceProps, type WorkspaceRepository, WorkspaceSettings, type WorkspaceSettingsDTO, type WorkspaceSettingsProps, type WorkspaceSettingsRepository, type WorkspaceTier, type WorkspaceTypeValue, acceptInvitationSchema, addAlpha, addDays, addHours, addMinutes, aiService, archiveProjectSchema, assignTagsSchema, bulkUpdateTasksSchema, calculateAverageCompletionTime, calculateAverageTime, calculateBurndownRate, calculateCompletionRate, calculateEfficiency, calculateEstimatedCompletion, calculateFocusScore, calculatePercentile, calculateProductivityScore, calculateProgress, calculateProjectHealth, calculateStreak, calculateTimeUtilization, calculateTotalTimeWorked, calculateVelocity, calculateVoteWeight, calculateWeightedAverage, camelToTitle, capitalize, capitalizeWords, categorizeTasksByAvailability, changePasswordSchema, commentBaseSchema, commentFilterSchema, countWords, createCommentSchema, createProjectSchema, createTagSchema, createTaskSchema, createWorkspaceSchema, darkenColor, duplicateProjectSchema, endOfDay, endOfWeek, formatDate, formatDateShort, formatDuration, formatDurationFromSeconds, formatFileSize, formatNumber, formatRelativeTime, formatScheduledDateTime, formatTimeOfDay, formatTimerDisplay, formatTimerDisplayExtended, generateId, generatePalette, generateRandomString, generateSlug, generateUuid, getColorWithOpacity, getContrastColor, getCurrentTime, getDaysDiff, getInitials, getPriorityColor, getPriorityConfig, getPriorityLabel, getTaskStatusColor, getTaskStatusConfig, getTaskStatusLabel, getTimerModeColor, getTimerModeConfig, getTimerModeDefaultDuration, getTimerModeLabel, getWorkableTasks, hexToRgb, hexToRgba, highlightSearchTerms, hoursToMinutes, inviteMemberSchema, isAfter, isAllowedFileType, isAlphanumeric, isBefore, isDarkColor, isDueToday, isFuture, isImageFile, isLightColor, isOverdue, isPast, isScheduledForToday, isTaskAvailable, isTaskCompleted, isTaskInProgress, isToday, isValidEmail, isValidUrl, isValidUuid, isWorkingHours, lightenColor, loginUserSchema, minutesToHours, minutesToSeconds, mixColors, normalizeWhitespace, parseDuration, pluralize, projectBaseSchema, projectFilterSchema, randomColor, registerUserSchema, reorderTasksSchema, resetPasswordRequestSchema, resetPasswordSchema, rgbToHex, sanitizeHtml, secondsToMinutes, shouldTakeLongBreak, snakeToTitle, startOfDay, startOfToday, startOfWeek, stripHtmlTags, tagBaseSchema, tagFilterSchema, taskBaseSchema, taskDatesSchema, taskFilterSchema, transferOwnershipSchema, truncate, updateCommentSchema, updateMemberRoleSchema, updateProjectSchema, updateTagSchema, updateTaskSchema, updateUserProfileSchema, updateWorkspaceSchema, userPreferencesSchema, usernameValidationSchema, workspaceBaseSchema, workspaceFilterSchema, workspaceSettingsSchema };
