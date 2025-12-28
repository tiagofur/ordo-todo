import { z } from 'zod';

interface ValueObject<T, V = any> {
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

interface UseCase<IN, OUT> {
    execute(data: IN, loggedUser?: any): Promise<OUT>;
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
    readonly PASSWORD_MIN_LENGTH: 6;
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
    priority: z.ZodEnum<["LOW", "MEDIUM", "HIGH"]>;
    status: z.ZodOptional<z.ZodEnum<["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]>>;
    dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    scheduledDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    scheduledTime: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isTimeBlocked: z.ZodOptional<z.ZodBoolean>;
    estimatedMinutes: z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodNaN]>>>, number | null | undefined, number | null | undefined>;
}, "strip", z.ZodTypeAny, {
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    dueDate?: string | null | undefined;
    startDate?: string | null | undefined;
    description?: string | undefined;
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED" | undefined;
    scheduledDate?: string | null | undefined;
    scheduledTime?: string | null | undefined;
    isTimeBlocked?: boolean | undefined;
    estimatedMinutes?: number | null | undefined;
}, {
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    dueDate?: string | null | undefined;
    startDate?: string | null | undefined;
    description?: string | undefined;
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED" | undefined;
    scheduledDate?: string | null | undefined;
    scheduledTime?: string | null | undefined;
    isTimeBlocked?: boolean | undefined;
    estimatedMinutes?: number | null | undefined;
}>;
/**
 * Validation for date relationships
 */
declare const taskDatesSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodEnum<["LOW", "MEDIUM", "HIGH"]>;
    status: z.ZodOptional<z.ZodEnum<["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]>>;
    dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    scheduledDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    scheduledTime: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isTimeBlocked: z.ZodOptional<z.ZodBoolean>;
    estimatedMinutes: z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodNaN]>>>, number | null | undefined, number | null | undefined>;
}, "strip", z.ZodTypeAny, {
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    dueDate?: string | null | undefined;
    startDate?: string | null | undefined;
    description?: string | undefined;
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED" | undefined;
    scheduledDate?: string | null | undefined;
    scheduledTime?: string | null | undefined;
    isTimeBlocked?: boolean | undefined;
    estimatedMinutes?: number | null | undefined;
}, {
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    dueDate?: string | null | undefined;
    startDate?: string | null | undefined;
    description?: string | undefined;
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED" | undefined;
    scheduledDate?: string | null | undefined;
    scheduledTime?: string | null | undefined;
    isTimeBlocked?: boolean | undefined;
    estimatedMinutes?: number | null | undefined;
}>, {
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    dueDate?: string | null | undefined;
    startDate?: string | null | undefined;
    description?: string | undefined;
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED" | undefined;
    scheduledDate?: string | null | undefined;
    scheduledTime?: string | null | undefined;
    isTimeBlocked?: boolean | undefined;
    estimatedMinutes?: number | null | undefined;
}, {
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    dueDate?: string | null | undefined;
    startDate?: string | null | undefined;
    description?: string | undefined;
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED" | undefined;
    scheduledDate?: string | null | undefined;
    scheduledTime?: string | null | undefined;
    isTimeBlocked?: boolean | undefined;
    estimatedMinutes?: number | null | undefined;
}>, {
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    dueDate?: string | null | undefined;
    startDate?: string | null | undefined;
    description?: string | undefined;
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED" | undefined;
    scheduledDate?: string | null | undefined;
    scheduledTime?: string | null | undefined;
    isTimeBlocked?: boolean | undefined;
    estimatedMinutes?: number | null | undefined;
}, {
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    dueDate?: string | null | undefined;
    startDate?: string | null | undefined;
    description?: string | undefined;
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED" | undefined;
    scheduledDate?: string | null | undefined;
    scheduledTime?: string | null | undefined;
    isTimeBlocked?: boolean | undefined;
    estimatedMinutes?: number | null | undefined;
}>;
/**
 * Create task schema
 */
declare const createTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodEnum<["LOW", "MEDIUM", "HIGH"]>;
    status: z.ZodOptional<z.ZodEnum<["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]>>;
    dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    scheduledDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    scheduledTime: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isTimeBlocked: z.ZodOptional<z.ZodBoolean>;
    estimatedMinutes: z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodNaN]>>>, number | null | undefined, number | null | undefined>;
} & {
    projectId: z.ZodString;
    parentTaskId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    assigneeId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    tagIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    projectId: string;
    dueDate?: string | null | undefined;
    startDate?: string | null | undefined;
    description?: string | undefined;
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED" | undefined;
    scheduledDate?: string | null | undefined;
    scheduledTime?: string | null | undefined;
    isTimeBlocked?: boolean | undefined;
    estimatedMinutes?: number | null | undefined;
    parentTaskId?: string | null | undefined;
    assigneeId?: string | null | undefined;
    tagIds?: string[] | undefined;
}, {
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    projectId: string;
    dueDate?: string | null | undefined;
    startDate?: string | null | undefined;
    description?: string | undefined;
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED" | undefined;
    scheduledDate?: string | null | undefined;
    scheduledTime?: string | null | undefined;
    isTimeBlocked?: boolean | undefined;
    estimatedMinutes?: number | null | undefined;
    parentTaskId?: string | null | undefined;
    assigneeId?: string | null | undefined;
    tagIds?: string[] | undefined;
}>;
/**
 * Update task schema (all fields optional except what's being updated)
 */
declare const updateTaskSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    priority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH"]>>;
    status: z.ZodOptional<z.ZodOptional<z.ZodEnum<["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]>>>;
    dueDate: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    startDate: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    scheduledDate: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    scheduledTime: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    isTimeBlocked: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    estimatedMinutes: z.ZodOptional<z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodNaN]>>>, number | null | undefined, number | null | undefined>>;
} & {
    assigneeId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    tagIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    completedAt: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    dueDate?: string | null | undefined;
    startDate?: string | null | undefined;
    title?: string | undefined;
    description?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | undefined;
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED" | undefined;
    scheduledDate?: string | null | undefined;
    scheduledTime?: string | null | undefined;
    isTimeBlocked?: boolean | undefined;
    estimatedMinutes?: number | null | undefined;
    assigneeId?: string | null | undefined;
    tagIds?: string[] | undefined;
    completedAt?: string | null | undefined;
}, {
    dueDate?: string | null | undefined;
    startDate?: string | null | undefined;
    title?: string | undefined;
    description?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | undefined;
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED" | undefined;
    scheduledDate?: string | null | undefined;
    scheduledTime?: string | null | undefined;
    isTimeBlocked?: boolean | undefined;
    estimatedMinutes?: number | null | undefined;
    assigneeId?: string | null | undefined;
    tagIds?: string[] | undefined;
    completedAt?: string | null | undefined;
}>;
/**
 * Task filter schema
 */
declare const taskFilterSchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]>>;
    priority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH"]>>;
    assigneeId: z.ZodOptional<z.ZodString>;
    tagIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    search: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodObject<{
        from: z.ZodOptional<z.ZodString>;
        to: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        from?: string | undefined;
        to?: string | undefined;
    }, {
        from?: string | undefined;
        to?: string | undefined;
    }>>;
    isOverdue: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    search?: string | undefined;
    dueDate?: {
        from?: string | undefined;
        to?: string | undefined;
    } | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | undefined;
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED" | undefined;
    projectId?: string | undefined;
    assigneeId?: string | undefined;
    tagIds?: string[] | undefined;
    isOverdue?: boolean | undefined;
}, {
    search?: string | undefined;
    dueDate?: {
        from?: string | undefined;
        to?: string | undefined;
    } | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | undefined;
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED" | undefined;
    projectId?: string | undefined;
    assigneeId?: string | undefined;
    tagIds?: string[] | undefined;
    isOverdue?: boolean | undefined;
}>;
/**
 * Bulk update tasks schema
 */
declare const bulkUpdateTasksSchema: z.ZodObject<{
    taskIds: z.ZodArray<z.ZodString, "many">;
    updates: z.ZodObject<{
        status: z.ZodOptional<z.ZodEnum<["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]>>;
        priority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH"]>>;
        assigneeId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        projectId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        priority?: "LOW" | "MEDIUM" | "HIGH" | undefined;
        status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED" | undefined;
        projectId?: string | undefined;
        assigneeId?: string | null | undefined;
    }, {
        priority?: "LOW" | "MEDIUM" | "HIGH" | undefined;
        status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED" | undefined;
        projectId?: string | undefined;
        assigneeId?: string | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    taskIds: string[];
    updates: {
        priority?: "LOW" | "MEDIUM" | "HIGH" | undefined;
        status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED" | undefined;
        projectId?: string | undefined;
        assigneeId?: string | null | undefined;
    };
}, {
    taskIds: string[];
    updates: {
        priority?: "LOW" | "MEDIUM" | "HIGH" | undefined;
        status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED" | undefined;
        projectId?: string | undefined;
        assigneeId?: string | null | undefined;
    };
}>;
/**
 * Reorder tasks schema
 */
declare const reorderTasksSchema: z.ZodObject<{
    taskId: z.ZodString;
    newOrder: z.ZodNumber;
    projectId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    taskId: string;
    newOrder: number;
}, {
    projectId: string;
    taskId: string;
    newOrder: number;
}>;
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
}, "strip", z.ZodTypeAny, {
    name: string;
    description?: string | undefined;
    color?: string | undefined;
    icon?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    color?: string | undefined;
    icon?: string | undefined;
}>;
/**
 * Create project schema
 */
declare const createProjectSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
} & {
    workspaceId: z.ZodString;
    workflowId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    endDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    workspaceId: string;
    startDate?: string | null | undefined;
    description?: string | undefined;
    color?: string | undefined;
    icon?: string | undefined;
    workflowId?: string | undefined;
    endDate?: string | null | undefined;
}, {
    name: string;
    workspaceId: string;
    startDate?: string | null | undefined;
    description?: string | undefined;
    color?: string | undefined;
    icon?: string | undefined;
    workflowId?: string | undefined;
    endDate?: string | null | undefined;
}>;
/**
 * Update project schema
 */
declare const updateProjectSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    color: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    icon: z.ZodOptional<z.ZodOptional<z.ZodString>>;
} & {
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    endDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isArchived: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    startDate?: string | null | undefined;
    description?: string | undefined;
    name?: string | undefined;
    color?: string | undefined;
    icon?: string | undefined;
    endDate?: string | null | undefined;
    isArchived?: boolean | undefined;
}, {
    startDate?: string | null | undefined;
    description?: string | undefined;
    name?: string | undefined;
    color?: string | undefined;
    icon?: string | undefined;
    endDate?: string | null | undefined;
    isArchived?: boolean | undefined;
}>;
/**
 * Project filter schema
 */
declare const projectFilterSchema: z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    isArchived: z.ZodOptional<z.ZodBoolean>;
    color: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    search?: string | undefined;
    color?: string | undefined;
    workspaceId?: string | undefined;
    isArchived?: boolean | undefined;
}, {
    search?: string | undefined;
    color?: string | undefined;
    workspaceId?: string | undefined;
    isArchived?: boolean | undefined;
}>;
/**
 * Archive project schema
 */
declare const archiveProjectSchema: z.ZodObject<{
    isArchived: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    isArchived: boolean;
}, {
    isArchived: boolean;
}>;
/**
 * Duplicate project schema
 */
declare const duplicateProjectSchema: z.ZodObject<{
    name: z.ZodString;
    includeTasks: z.ZodDefault<z.ZodBoolean>;
    includeMembers: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    includeTasks: boolean;
    includeMembers: boolean;
}, {
    name: string;
    includeTasks?: boolean | undefined;
    includeMembers?: boolean | undefined;
}>;
/**
 * Type exports
 */
type ProjectBase = z.infer<typeof projectBaseSchema>;
type CreateProjectDTO = z.infer<typeof createProjectSchema>;
type UpdateProjectDTO = z.infer<typeof updateProjectSchema>;
type ProjectFilter = z.infer<typeof projectFilterSchema>;
type ArchiveProject = z.infer<typeof archiveProjectSchema>;
type DuplicateProject = z.infer<typeof duplicateProjectSchema>;

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
declare const MEMBER_ROLES: readonly ["OWNER", "ADMIN", "MEMBER", "VIEWER"];
/**
 * Base workspace schema
 */
declare const workspaceBaseSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["PERSONAL", "WORK", "TEAM"]>;
    color: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "PERSONAL" | "WORK" | "TEAM";
    name: string;
    description?: string | undefined;
    color?: string | undefined;
    icon?: string | undefined;
    slug?: string | undefined;
}, {
    type: "PERSONAL" | "WORK" | "TEAM";
    name: string;
    description?: string | undefined;
    color?: string | undefined;
    icon?: string | undefined;
    slug?: string | undefined;
}>;
/**
 * Create workspace schema
 */
declare const createWorkspaceSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["PERSONAL", "WORK", "TEAM"]>;
    color: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "PERSONAL" | "WORK" | "TEAM";
    name: string;
    description?: string | undefined;
    color?: string | undefined;
    icon?: string | undefined;
    slug?: string | undefined;
}, {
    type: "PERSONAL" | "WORK" | "TEAM";
    name: string;
    description?: string | undefined;
    color?: string | undefined;
    icon?: string | undefined;
    slug?: string | undefined;
}>;
/**
 * Update workspace schema
 */
declare const updateWorkspaceSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    type: z.ZodOptional<z.ZodEnum<["PERSONAL", "WORK", "TEAM"]>>;
    color: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    icon: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    type?: "PERSONAL" | "WORK" | "TEAM" | undefined;
    name?: string | undefined;
    color?: string | undefined;
    icon?: string | undefined;
    slug?: string | undefined;
}, {
    description?: string | undefined;
    type?: "PERSONAL" | "WORK" | "TEAM" | undefined;
    name?: string | undefined;
    color?: string | undefined;
    icon?: string | undefined;
    slug?: string | undefined;
}>;
/**
 * Workspace settings schema
 */
declare const workspaceSettingsSchema: z.ZodObject<{
    defaultTaskPriority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH"]>>;
    defaultTaskStatus: z.ZodOptional<z.ZodEnum<["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]>>;
    enableNotifications: z.ZodOptional<z.ZodBoolean>;
    enableEmailDigest: z.ZodOptional<z.ZodBoolean>;
    timezone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    defaultTaskPriority?: "LOW" | "MEDIUM" | "HIGH" | undefined;
    defaultTaskStatus?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED" | undefined;
    enableNotifications?: boolean | undefined;
    enableEmailDigest?: boolean | undefined;
    timezone?: string | undefined;
}, {
    defaultTaskPriority?: "LOW" | "MEDIUM" | "HIGH" | undefined;
    defaultTaskStatus?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED" | undefined;
    enableNotifications?: boolean | undefined;
    enableEmailDigest?: boolean | undefined;
    timezone?: string | undefined;
}>;
/**
 * Invite member schema
 */
declare const inviteMemberSchema: z.ZodObject<{
    email: z.ZodString;
    role: z.ZodEnum<["OWNER", "ADMIN", "MEMBER", "VIEWER"]>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
    message?: string | undefined;
}, {
    email: string;
    role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
    message?: string | undefined;
}>;
/**
 * Update member role schema
 */
declare const updateMemberRoleSchema: z.ZodObject<{
    role: z.ZodEnum<["OWNER", "ADMIN", "MEMBER", "VIEWER"]>;
}, "strip", z.ZodTypeAny, {
    role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
}, {
    role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
}>;
/**
 * Accept invitation schema
 */
declare const acceptInvitationSchema: z.ZodObject<{
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
/**
 * Transfer ownership schema
 */
declare const transferOwnershipSchema: z.ZodObject<{
    newOwnerId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    newOwnerId: string;
}, {
    newOwnerId: string;
}>;
/**
 * Workspace filter schema
 */
declare const workspaceFilterSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["PERSONAL", "WORK", "TEAM"]>>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    search?: string | undefined;
    type?: "PERSONAL" | "WORK" | "TEAM" | undefined;
}, {
    search?: string | undefined;
    type?: "PERSONAL" | "WORK" | "TEAM" | undefined;
}>;
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
}, "strip", z.ZodTypeAny, {
    name: string;
    color?: string | undefined;
}, {
    name: string;
    color?: string | undefined;
}>;
/**
 * Create tag schema
 */
declare const createTagSchema: z.ZodObject<{
    name: z.ZodString;
    color: z.ZodOptional<z.ZodString>;
} & {
    workspaceId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    workspaceId: string;
    color?: string | undefined;
}, {
    name: string;
    workspaceId: string;
    color?: string | undefined;
}>;
/**
 * Update tag schema
 */
declare const updateTagSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    color?: string | undefined;
}, {
    name?: string | undefined;
    color?: string | undefined;
}>;
/**
 * Tag filter schema
 */
declare const tagFilterSchema: z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    search?: string | undefined;
    workspaceId?: string | undefined;
}, {
    search?: string | undefined;
    workspaceId?: string | undefined;
}>;
/**
 * Assign tags to task schema
 */
declare const assignTagsSchema: z.ZodObject<{
    tagIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    tagIds: string[];
}, {
    tagIds: string[];
}>;
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
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    username: string;
    password: string;
}, {
    name: string;
    email: string;
    username: string;
    password: string;
}>;
/**
 * User login schema
 */
declare const loginUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
/**
 * Update user profile schema
 */
declare const updateUserProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    avatar: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    timezone: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodEnum<["en", "es", "pt-BR"]>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    timezone?: string | undefined;
    bio?: string | undefined;
    avatar?: string | null | undefined;
    language?: "en" | "es" | "pt-BR" | undefined;
}, {
    name?: string | undefined;
    timezone?: string | undefined;
    bio?: string | undefined;
    avatar?: string | null | undefined;
    language?: "en" | "es" | "pt-BR" | undefined;
}>;
/**
 * Change password schema
 */
declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
/**
 * Reset password request schema
 */
declare const resetPasswordRequestSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
/**
 * Reset password schema
 */
declare const resetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    newPassword: string;
}, {
    token: string;
    newPassword: string;
}>;
/**
 * User preferences schema
 */
declare const userPreferencesSchema: z.ZodObject<{
    theme: z.ZodOptional<z.ZodEnum<["light", "dark", "system"]>>;
    language: z.ZodOptional<z.ZodEnum<["en", "es", "pt-BR"]>>;
    timezone: z.ZodOptional<z.ZodString>;
    notifications: z.ZodOptional<z.ZodObject<{
        email: z.ZodOptional<z.ZodBoolean>;
        push: z.ZodOptional<z.ZodBoolean>;
        desktop: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        push?: boolean | undefined;
        email?: boolean | undefined;
        desktop?: boolean | undefined;
    }, {
        push?: boolean | undefined;
        email?: boolean | undefined;
        desktop?: boolean | undefined;
    }>>;
    pomodoro: z.ZodOptional<z.ZodObject<{
        workDuration: z.ZodOptional<z.ZodNumber>;
        shortBreakDuration: z.ZodOptional<z.ZodNumber>;
        longBreakDuration: z.ZodOptional<z.ZodNumber>;
        pomodorosUntilLongBreak: z.ZodOptional<z.ZodNumber>;
        autoStartBreaks: z.ZodOptional<z.ZodBoolean>;
        autoStartPomodoros: z.ZodOptional<z.ZodBoolean>;
        soundEnabled: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        workDuration?: number | undefined;
        shortBreakDuration?: number | undefined;
        longBreakDuration?: number | undefined;
        pomodorosUntilLongBreak?: number | undefined;
        autoStartBreaks?: boolean | undefined;
        autoStartPomodoros?: boolean | undefined;
        soundEnabled?: boolean | undefined;
    }, {
        workDuration?: number | undefined;
        shortBreakDuration?: number | undefined;
        longBreakDuration?: number | undefined;
        pomodorosUntilLongBreak?: number | undefined;
        autoStartBreaks?: boolean | undefined;
        autoStartPomodoros?: boolean | undefined;
        soundEnabled?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    timezone?: string | undefined;
    language?: "en" | "es" | "pt-BR" | undefined;
    theme?: "light" | "dark" | "system" | undefined;
    notifications?: {
        push?: boolean | undefined;
        email?: boolean | undefined;
        desktop?: boolean | undefined;
    } | undefined;
    pomodoro?: {
        workDuration?: number | undefined;
        shortBreakDuration?: number | undefined;
        longBreakDuration?: number | undefined;
        pomodorosUntilLongBreak?: number | undefined;
        autoStartBreaks?: boolean | undefined;
        autoStartPomodoros?: boolean | undefined;
        soundEnabled?: boolean | undefined;
    } | undefined;
}, {
    timezone?: string | undefined;
    language?: "en" | "es" | "pt-BR" | undefined;
    theme?: "light" | "dark" | "system" | undefined;
    notifications?: {
        push?: boolean | undefined;
        email?: boolean | undefined;
        desktop?: boolean | undefined;
    } | undefined;
    pomodoro?: {
        workDuration?: number | undefined;
        shortBreakDuration?: number | undefined;
        longBreakDuration?: number | undefined;
        pomodorosUntilLongBreak?: number | undefined;
        autoStartBreaks?: boolean | undefined;
        autoStartPomodoros?: boolean | undefined;
        soundEnabled?: boolean | undefined;
    } | undefined;
}>;
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
}, "strip", z.ZodTypeAny, {
    username: string;
}, {
    username: string;
}>;
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
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
/**
 * Create comment schema
 */
declare const createCommentSchema: z.ZodObject<{
    content: z.ZodString;
} & {
    taskId: z.ZodString;
    parentCommentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    mentions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    taskId: string;
    content: string;
    parentCommentId?: string | null | undefined;
    mentions?: string[] | undefined;
}, {
    taskId: string;
    content: string;
    parentCommentId?: string | null | undefined;
    mentions?: string[] | undefined;
}>;
/**
 * Update comment schema
 */
declare const updateCommentSchema: z.ZodObject<{
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
/**
 * Comment filter schema
 */
declare const commentFilterSchema: z.ZodObject<{
    taskId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    parentCommentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    taskId?: string | undefined;
    parentCommentId?: string | null | undefined;
    userId?: string | undefined;
}, {
    taskId?: string | undefined;
    parentCommentId?: string | null | undefined;
    userId?: string | undefined;
}>;
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

interface UserRepository {
    save(user: User): Promise<void>;
    updateProps(user: User, props: Partial<UserProps>): Promise<void>;
    findByEmail(email: string, withPassword?: boolean): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
}

interface CryptoProvider {
    encrypt(password: string): Promise<string>;
    compare(password: string, hashedPassword: string): Promise<boolean>;
}

declare class ChangeUserName implements UseCase<string, void> {
    private readonly repo;
    constructor(repo: UserRepository);
    execute(newName: string, loggedUser: User): Promise<void>;
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

type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
interface TaskProps extends EntityProps {
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
    estimatedTime?: number;
    tags?: any[];
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
    recurrence?: RecurrenceProps;
}
interface RecurrenceProps {
    pattern: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
    interval?: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    endDate?: Date;
}
declare class Task extends Entity<TaskProps> {
    constructor(props: TaskProps);
<<<<<<< HEAD
    static create(props: Omit<TaskProps, "id" | "createdAt" | "updatedAt" | "status" | "isDeleted" | "deletedAt">): Task;
=======
    static create(props: Omit<TaskProps, "id" | "createdAt" | "updatedAt" | "status" | "isDeleted">): Task;
>>>>>>> 369e5be5e7078c39eb391ce85b27fb8aefcb732e
    complete(): Task;
    updateStatus(status: TaskStatus): Task;
    update(props: Partial<Omit<TaskProps, "id" | "ownerId" | "createdAt">>): Task;
    softDelete(): Task;
    restore(): Task;
}

interface TaskRepository {
    save(task: Task): Promise<void>;
    findById(id: string): Promise<Task | null>;
    findByOwnerId(ownerId: string, filters?: {
        projectId?: string;
        tags?: string[];
    }): Promise<Task[]>;
    update(task: Task): Promise<void>;
    delete(id: string): Promise<void>;
    softDelete(id: string): Promise<void>;
    restore(id: string): Promise<void>;
    permanentDelete(id: string): Promise<void>;
    findDeleted(projectId: string): Promise<Task[]>;
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
    recurrence?: RecurrenceProps;
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
    execute(projectId: string): Promise<any[]>;
}

type WorkspaceType = "PERSONAL" | "WORK" | "TEAM";
type WorkspaceTier = "FREE" | "PRO" | "ENTERPRISE";
interface WorkspaceProps extends EntityProps {
    name: string;
    slug: string;
    description?: string;
    type: WorkspaceType;
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

type MemberRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
interface WorkspaceMemberProps extends EntityProps {
    workspaceId: string;
    userId: string;
    role: MemberRole;
    joinedAt: Date;
}
declare class WorkspaceMember extends Entity<WorkspaceMemberProps> {
    constructor(props: WorkspaceMemberProps);
    static create(props: Omit<WorkspaceMemberProps, "id" | "joinedAt">): WorkspaceMember;
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
    payload?: Record<string, any>;
    createdAt?: Date;
}
declare class WorkspaceAuditLog extends Entity<WorkspaceAuditLogProps> {
    constructor(props: WorkspaceAuditLogProps);
    static create(props: Omit<WorkspaceAuditLogProps, "id" | "createdAt">): WorkspaceAuditLog;
}

interface WorkspaceRepository {
    create(workspace: Workspace): Promise<Workspace>;
    findById(id: string): Promise<Workspace | null>;
    findBySlug(slug: string): Promise<Workspace | null>;
    findByOwnerId(ownerId: string): Promise<Workspace[]>;
    findByUserId(userId: string): Promise<Workspace[]>;
    findDeleted(userId: string): Promise<Workspace[]>;
    update(workspace: Workspace): Promise<Workspace>;
    delete(id: string): Promise<void>;
    permanentDelete(id: string): Promise<void>;
    addMember(member: WorkspaceMember): Promise<WorkspaceMember>;
    removeMember(workspaceId: string, userId: string): Promise<void>;
    findMember(workspaceId: string, userId: string): Promise<WorkspaceMember | null>;
    listMembers(workspaceId: string): Promise<WorkspaceMember[]>;
}

interface WorkspaceSettingsRepository {
    /**
     * Obtiene la configuración de un workspace
     */
    findByWorkspaceId(workspaceId: string): Promise<WorkspaceSettings | null>;
    /**
     * Crea o actualiza la configuración de un workspace
     */
    upsert(settings: WorkspaceSettings): Promise<WorkspaceSettings>;
    /**
     * Elimina la configuración de un workspace
     */
    delete(workspaceId: string): Promise<void>;
}

interface WorkspaceAuditLogRepository {
    /**
     * Crea un nuevo registro de auditoría
     */
    create(log: WorkspaceAuditLog): Promise<WorkspaceAuditLog>;
    /**
     * Obtiene los logs de auditoría de un workspace
     * @param workspaceId ID del workspace
     * @param limit Número máximo de registros a retornar
     * @param offset Offset para paginación
     */
    findByWorkspaceId(workspaceId: string, limit?: number, offset?: number): Promise<WorkspaceAuditLog[]>;
    /**
     * Cuenta el total de logs de un workspace
     */
    countByWorkspaceId(workspaceId: string): Promise<number>;
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

interface WorkspaceInvitationRepository {
    create(invitation: WorkspaceInvitation): Promise<WorkspaceInvitation>;
    findById(id: string): Promise<WorkspaceInvitation | null>;
    /**
     * @deprecated Use findPendingInvitations() instead and compare hashes manually
     * This method is kept for backward compatibility but won't work with hashed tokens
     */
    findByToken(tokenHash: string): Promise<WorkspaceInvitation | null>;
    /**
     * Find all pending invitations (for hash comparison)
     * Used when searching by token with bcrypt hashes
     */
    findPendingInvitations(): Promise<WorkspaceInvitation[]>;
    findByWorkspaceId(workspaceId: string): Promise<WorkspaceInvitation[]>;
    findByEmail(email: string): Promise<WorkspaceInvitation[]>;
    update(invitation: WorkspaceInvitation): Promise<WorkspaceInvitation>;
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
    payload?: Record<string, any>;
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

interface ProjectRepository {
    create(project: Project): Promise<Project>;
    findById(id: string): Promise<Project | null>;
    findBySlug(slug: string, workspaceId: string): Promise<Project | null>;
    findByWorkspaceId(workspaceId: string): Promise<Project[]>;
    findAllByUserId(userId: string): Promise<Project[]>;
    update(project: Project): Promise<Project>;
    delete(id: string): Promise<void>;
    softDelete(id: string): Promise<void>;
    restore(id: string): Promise<void>;
    permanentDelete(id: string): Promise<void>;
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
    execute(workspaceId: string): Promise<any[]>;
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

interface WorkflowRepository {
    save(workflow: Workflow): Promise<void>;
    findById(id: string): Promise<Workflow | null>;
    findByWorkspaceId(workspaceId: string): Promise<Workflow[]>;
    update(workflow: Workflow): Promise<void>;
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

interface TagRepository {
    create(tag: Tag): Promise<Tag>;
    update(tag: Tag): Promise<Tag>;
    findById(id: string): Promise<Tag | null>;
    findByWorkspaceId(workspaceId: string): Promise<Tag[]>;
    delete(id: string): Promise<void>;
    assignToTask(tagId: string, taskId: string): Promise<void>;
    removeFromTask(tagId: string, taskId: string): Promise<void>;
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
interface TimeSessionProps extends EntityProps {
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
}

interface SessionFilters {
    taskId?: string;
    type?: SessionType;
    startDate?: Date;
    endDate?: Date;
    completedOnly?: boolean;
}
interface PaginationParams {
    page: number;
    limit: number;
}
interface PaginatedSessions {
    sessions: TimeSession[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
interface SessionStats {
    totalSessions: number;
    totalWorkSessions: number;
    totalBreakSessions: number;
    totalMinutesWorked: number;
    totalBreakMinutes: number;
    pomodorosCompleted: number;
    totalPauses: number;
    totalPauseSeconds: number;
    completedSessions: number;
    byType: {
        WORK: {
            count: number;
            totalMinutes: number;
        };
        SHORT_BREAK: {
            count: number;
            totalMinutes: number;
        };
        LONG_BREAK: {
            count: number;
            totalMinutes: number;
        };
        CONTINUOUS: {
            count: number;
            totalMinutes: number;
        };
    };
}
interface TimerRepository {
    create(session: TimeSession): Promise<TimeSession>;
    update(session: TimeSession): Promise<TimeSession>;
    findById(id: string): Promise<TimeSession | null>;
    findActiveSession(userId: string): Promise<TimeSession | null>;
    findByTaskId(taskId: string): Promise<TimeSession[]>;
    findByUserId(userId: string): Promise<TimeSession[]>;
    findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<TimeSession[]>;
    findWithFilters(userId: string, filters: SessionFilters, pagination: PaginationParams): Promise<PaginatedSessions>;
    getStats(userId: string, startDate?: Date, endDate?: Date): Promise<SessionStats>;
    getTaskTimeStats(userId: string, taskId: string): Promise<{
        totalSessions: number;
        totalMinutes: number;
        completedSessions: number;
        lastSessionAt?: Date;
    }>;
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

interface DailyMetricsProps extends EntityProps {
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

interface AnalyticsRepository {
    save(metrics: DailyMetrics): Promise<void>;
    findByDate(userId: string, date: Date): Promise<DailyMetrics | null>;
    getRange(userId: string, startDate: Date, endDate: Date): Promise<DailyMetrics[]>;
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

interface AIProfileRepository {
    /**
     * Find AI profile by user ID
     */
    findByUserId(userId: string): Promise<AIProfile | null>;
    /**
     * Find or create AI profile for a user
     * If profile doesn't exist, creates a new one with default values
     */
    findOrCreate(userId: string): Promise<AIProfile>;
    /**
     * Save (create or update) an AI profile
     */
    save(profile: AIProfile): Promise<AIProfile>;
    /**
     * Update an existing AI profile
     */
    update(profile: AIProfile): Promise<AIProfile>;
    /**
     * Delete an AI profile by ID
     */
    delete(id: string): Promise<void>;
}

interface ProductivityReportRepository {
    /**
     * Save a new productivity report
     */
    save(report: ProductivityReport): Promise<ProductivityReport>;
    /**
     * Find report by ID
     */
    findById(id: string): Promise<ProductivityReport | null>;
    /**
     * Find all reports for a user
     */
    findByUserId(userId: string, options?: {
        scope?: ReportScope;
        limit?: number;
        offset?: number;
    }): Promise<ProductivityReport[]>;
    /**
     * Find reports for a specific task
     */
    findByTaskId(taskId: string): Promise<ProductivityReport[]>;
    /**
     * Find reports for a specific project
     */
    findByProjectId(projectId: string): Promise<ProductivityReport[]>;
    /**
     * Find latest report by scope
     */
    findLatestByScope(userId: string, scope: ReportScope): Promise<ProductivityReport | null>;
    /**
     * Delete a report
     */
    delete(id: string): Promise<void>;
    /**
     * Count reports for a user
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
declare class GenerateWeeklyReportUseCase implements UseCase<GenerateWeeklyReportInput, GenerateWeeklyReportOutput> {
    private readonly reportRepository;
    private readonly analyticsRepository;
    private readonly timerRepository;
    private readonly aiProfileRepository;
    private readonly generateReportData;
    constructor(reportRepository: ProductivityReportRepository, analyticsRepository: AnalyticsRepository, timerRepository: TimerRepository, aiProfileRepository: AIProfileRepository, generateReportData: (context: any) => Promise<WeeklyReportData>);
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

interface AIService {
    suggestTaskDetails(input: string): Promise<{
        title: string;
        description?: string;
        dueDate?: Date;
        priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    }>;
    chat(message: string, context?: any): Promise<string>;
}
declare class MockAIService implements AIService {
    suggestTaskDetails(input: string): Promise<{
        title: string;
        description: string;
        priority: "MEDIUM" | "HIGH" | "URGENT";
        dueDate: Date | undefined;
    }>;
    chat(message: string, context?: any): Promise<string>;
}
declare const aiService: MockAIService;

type HabitFrequency = "DAILY" | "WEEKLY" | "SPECIFIC_DAYS" | "MONTHLY";
type TimeOfDay = "MORNING" | "AFTERNOON" | "EVENING" | "ANYTIME";
interface HabitCompletionProps extends EntityProps {
    habitId: string;
    completedAt: Date;
    completedDate: Date;
    note?: string;
    value?: number;
}
interface HabitProps extends EntityProps {
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
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
    isActive: boolean;
    isPaused: boolean;
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

interface IHabitRepository {
    findById(id: string): Promise<any>;
    findByUserId(userId: string): Promise<any[]>;
    findActiveByUserId(userId: string): Promise<any[]>;
    findTodayHabits(userId: string): Promise<any[]>;
    create(habit: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<void>;
    createCompletion(habitId: string, data: any): Promise<any>;
    deleteCompletion(habitId: string, date: Date): Promise<void>;
    getCompletions(habitId: string, startDate: Date, endDate: Date): Promise<any[]>;
    getCompletionForDate(habitId: string, date: Date): Promise<any | null>;
    getStats(habitId: string): Promise<{
        currentStreak: number;
        longestStreak: number;
        totalCompletions: number;
        completionRate: number;
        thisWeekCompletions: number;
        thisMonthCompletions: number;
    }>;
}

export { AIProfile, type AIProfileProps, type AIProfileRepository, type AIService, type AcceptInvitation, AcceptInvitationUseCase, AddMemberToWorkspaceUseCase, type AnalyticsRepository, type ArchiveProject, ArchiveProjectUseCase, ArchiveWorkspaceUseCase, AssignTagToTaskUseCase, type AssignTags, type AuditAction, type BulkUpdateTasks, COMMENT_LIMITS, CalculateFocusScoreUseCase, type ChangePassword, ChangeUserName, type CommentBase, type CommentFilter, type CompleteTaskInput, CompleteTaskUseCase, type CreateAuditLogInput, CreateAuditLogUseCase, type CreateCommentDTO, type CreateProjectDTO, CreateProjectUseCase, type CreateTagDTO, CreateTagUseCase, type CreateTaskDTO, type CreateTaskInput, CreateTaskUseCase, CreateWorkflowUseCase, type CreateWorkspaceDTO, CreateWorkspaceUseCase, type CryptoProvider, DEFAULT_POMODORO_SETTINGS, DailyMetrics, type DailyMetricsProps, DeleteProjectUseCase, DeleteWorkflowUseCase, type DuplicateProject, Email, Entity, type EntityMode, type EntityProps, FILE_LIMITS, type FocusScoreInput, type GenerateWeeklyReportInput, type GenerateWeeklyReportOutput, GenerateWeeklyReportUseCase, GetDailyMetricsUseCase, GetDeletedProjectsUseCase, GetDeletedTasksUseCase, GetDeletedWorkspacesUseCase, type GetOptimalScheduleInput, GetOptimalScheduleUseCase, type GetWorkspaceAuditLogsInput, type GetWorkspaceAuditLogsOutput, GetWorkspaceAuditLogsUseCase, type GetWorkspaceSettingsInput, GetWorkspaceSettingsUseCase, Habit, type HabitCompletionProps, type HabitFrequency, type HabitProps, HashPassword, type HashService, type IHabitRepository, Id, type InviteMemberDTO, InviteMemberUseCase, type InviteStatus, type LearnFromSessionInput, LearnFromSessionUseCase, ListWorkflowsUseCase, type LoginUserDTO, MEMBER_ROLES, type MemberRole, type MemberRoleValue, type MetricsSnapshot, MockAIService, type OptimalScheduleOutput, PAGINATION_LIMITS, PRIORITY_VALUES, PROJECT_COLORS, PROJECT_LIMITS, PROJECT_STATUS, PROJECT_STATUS_VALUES, type PaginatedSessions, type PaginationParams, type PauseRecord, PauseTimerUseCase, PermanentDeleteProjectUseCase, PermanentDeleteTaskUseCase, PermanentDeleteWorkspaceUseCase, PersonName, type PredictTaskDurationInput, type PredictTaskDurationOutput, PredictTaskDurationUseCase, ProductivityReport, type ProductivityReportProps, type ProductivityReportRepository, Project, type ProjectBase, type ProjectColor, type ProjectFilter, type ProjectProps, type ProjectRepository, type ProjectStatusValue, type RecurrenceProps, RegisterUser, type RegisterUserDTO, RemoveMemberFromWorkspaceUseCase, RemoveTagFromTaskUseCase, type ReorderTasks, type ReportScope, RequiredString, type RequiredStringOptions, type ResetPassword, type ResetPasswordRequest, RestoreProjectUseCase, RestoreTaskUseCase, RestoreWorkspaceUseCase, ResumeTimerUseCase, type SessionFilters, type SessionStats, type SessionType, SoftDeleteProjectUseCase, SoftDeleteTaskUseCase, SoftDeleteWorkspaceUseCase, StartTimerUseCase, StopTimerUseCase, SwitchTaskUseCase, TAG_COLORS, TAG_LIMITS, TASK_LIMITS, TASK_PRIORITIES, TASK_STATUS, TASK_STATUS_VALUES, TIMER_LIMITS, TIMER_MODES, TIMER_MODE_VALUES, Tag, type TagBase, type TagColor, type TagFilter, type TagProps, type TagRepository, Task, type TaskBase, type TaskFilter, type TaskPriority, type TaskPriorityValue, type TaskProps, type TaskRepository, type TaskStatus, type TaskStatusValue, type TimeOfDay, TimeSession, type TimeSessionProps, type TimerMode, type TimerRepository, type TransferOwnership, USER_LIMITS, type UpdateCommentDTO, type UpdateDailyMetricsInput, UpdateDailyMetricsUseCase, type UpdateMemberRole, type UpdateProjectDTO, UpdateProjectUseCase, type UpdateTagDTO, UpdateTagUseCase, type UpdateTaskDTO, type UpdateUserProfile, UpdateWorkflowUseCase, type UpdateWorkspaceDTO, type UpdateWorkspaceSettingsInput, UpdateWorkspaceSettingsUseCase, type UseCase, User, UserByEmail, UserLogin, type UserPreferences, type UserProps, type UserRepository, type UsernameValidation, type ValueObject, type ViewType, WORKSPACE_COLORS, WORKSPACE_LIMITS, WORKSPACE_TYPES, type WeeklyReportData, Workflow, type WorkflowProps, type WorkflowRepository, Workspace, WorkspaceAuditLog, type WorkspaceAuditLogProps, type WorkspaceAuditLogRepository, type WorkspaceBase, type WorkspaceColor, type WorkspaceFilter, WorkspaceInvitation, type WorkspaceInvitationProps, type WorkspaceInvitationRepository, WorkspaceMember, type WorkspaceMemberProps, type WorkspaceProps, type WorkspaceRepository, WorkspaceSettings, type WorkspaceSettingsDTO, type WorkspaceSettingsProps, type WorkspaceSettingsRepository, type WorkspaceTier, type WorkspaceType, type WorkspaceTypeValue, acceptInvitationSchema, addAlpha, addDays, addHours, addMinutes, aiService, archiveProjectSchema, assignTagsSchema, bulkUpdateTasksSchema, calculateAverageCompletionTime, calculateAverageTime, calculateBurndownRate, calculateCompletionRate, calculateEfficiency, calculateEstimatedCompletion, calculateFocusScore, calculatePercentile, calculateProductivityScore, calculateProgress, calculateProjectHealth, calculateStreak, calculateTimeUtilization, calculateTotalTimeWorked, calculateVelocity, calculateWeightedAverage, camelToTitle, capitalize, capitalizeWords, categorizeTasksByAvailability, changePasswordSchema, commentBaseSchema, commentFilterSchema, countWords, createCommentSchema, createProjectSchema, createTagSchema, createTaskSchema, createWorkspaceSchema, darkenColor, duplicateProjectSchema, endOfDay, endOfWeek, formatDate, formatDateShort, formatDuration, formatDurationFromSeconds, formatFileSize, formatNumber, formatRelativeTime, formatScheduledDateTime, formatTimeOfDay, formatTimerDisplay, formatTimerDisplayExtended, generateId, generatePalette, generateRandomString, generateSlug, getColorWithOpacity, getContrastColor, getCurrentTime, getDaysDiff, getInitials, getPriorityColor, getPriorityConfig, getPriorityLabel, getTaskStatusColor, getTaskStatusConfig, getTaskStatusLabel, getTimerModeColor, getTimerModeConfig, getTimerModeDefaultDuration, getTimerModeLabel, getWorkableTasks, hexToRgb, hexToRgba, highlightSearchTerms, hoursToMinutes, inviteMemberSchema, isAfter, isAllowedFileType, isAlphanumeric, isBefore, isDarkColor, isDueToday, isFuture, isImageFile, isLightColor, isOverdue, isPast, isScheduledForToday, isTaskAvailable, isTaskCompleted, isTaskInProgress, isToday, isValidEmail, isValidUrl, isWorkingHours, lightenColor, loginUserSchema, minutesToHours, minutesToSeconds, mixColors, normalizeWhitespace, parseDuration, pluralize, projectBaseSchema, projectFilterSchema, randomColor, registerUserSchema, reorderTasksSchema, resetPasswordRequestSchema, resetPasswordSchema, rgbToHex, sanitizeHtml, secondsToMinutes, shouldTakeLongBreak, snakeToTitle, startOfDay, startOfToday, startOfWeek, stripHtmlTags, tagBaseSchema, tagFilterSchema, taskBaseSchema, taskDatesSchema, taskFilterSchema, transferOwnershipSchema, truncate, updateCommentSchema, updateMemberRoleSchema, updateProjectSchema, updateTagSchema, updateTaskSchema, updateUserProfileSchema, updateWorkspaceSchema, userPreferencesSchema, usernameValidationSchema, workspaceBaseSchema, workspaceFilterSchema, workspaceSettingsSchema };
