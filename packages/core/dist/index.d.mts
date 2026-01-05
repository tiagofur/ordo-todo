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
        OWNER: "OWNER";
        ADMIN: "ADMIN";
        MEMBER: "MEMBER";
        VIEWER: "VIEWER";
    }>;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Update member role schema
 */
declare const updateMemberRoleSchema: z.ZodObject<{
    role: z.ZodEnum<{
        OWNER: "OWNER";
        ADMIN: "ADMIN";
        MEMBER: "MEMBER";
        VIEWER: "VIEWER";
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
    execute(projectId: string): Promise<Task[]>;
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

export { type AIChatContext, AIProfile, type AIProfileProps, type AIProfileRepository, type AIService, type AcceptInvitation, AcceptInvitationUseCase, AddMemberToWorkspaceUseCase, type AnalyticsRepository, type ArchiveProject, ArchiveProjectUseCase, ArchiveWorkspaceUseCase, AssignTagToTaskUseCase, type AssignTags, type AuditAction, type BulkUpdateTasks, COMMENT_LIMITS, CalculateFocusScoreUseCase, type ChangePassword, ChangeUserName, type CommentBase, type CommentFilter, type CompleteTaskInput, CompleteTaskUseCase, type CreateAuditLogInput, CreateAuditLogUseCase, type CreateCommentDTO, type CreateProjectDTO, CreateProjectUseCase, type CreateTagDTO, CreateTagUseCase, type CreateTaskDTO, type CreateTaskInput, CreateTaskUseCase, type CreateUserProps, CreateWorkflowUseCase, type CreateWorkspaceDTO, CreateWorkspaceUseCase, type CryptoProvider, DEFAULT_POMODORO_SETTINGS, DailyMetrics, type DailyMetricsProps, DeleteProjectUseCase, DeleteWorkflowUseCase, type DuplicateProject, Email, Entity, type EntityMode, type EntityProps, FILE_LIMITS, type FocusScoreInput, type GenerateWeeklyReportInput, type GenerateWeeklyReportOutput, GenerateWeeklyReportUseCase, GetDailyMetricsUseCase, GetDeletedProjectsUseCase, GetDeletedTasksUseCase, GetDeletedWorkspacesUseCase, type GetOptimalScheduleInput, GetOptimalScheduleUseCase, type GetWorkspaceAuditLogsInput, type GetWorkspaceAuditLogsOutput, GetWorkspaceAuditLogsUseCase, type GetWorkspaceSettingsInput, GetWorkspaceSettingsUseCase, Habit, type HabitCompletionProps, type HabitFrequency, type HabitProps, HashPassword, type HashService, type IHabitRepository, Id, type InviteMemberDTO, InviteMemberUseCase, type InviteStatus, type LearnFromSessionInput, LearnFromSessionUseCase, ListWorkflowsUseCase, type LoggedUser, type LoginUserDTO, MEMBER_ROLES, type MemberRole, type MemberRoleValue, type MemberWithUser, type MetricsSnapshot, MockAIService, type OptimalScheduleOutput, PAGINATION_LIMITS, PRIORITY_VALUES, PROJECT_COLORS, PROJECT_LIMITS, PROJECT_STATUS, PROJECT_STATUS_VALUES, type PaginatedSessions, type PaginationParams, type PauseRecord, PauseTimerUseCase, PermanentDeleteProjectUseCase, PermanentDeleteTaskUseCase, PermanentDeleteWorkspaceUseCase, PersonName, type PredictTaskDurationInput, type PredictTaskDurationOutput, PredictTaskDurationUseCase, ProductivityReport, type ProductivityReportProps, type ProductivityReportRepository, Project, type ProjectBase, type ProjectColor, type ProjectFilter, type ProjectProps, type ProjectRepository, type ProjectStatusValue, type RecurrenceProps, RegisterUser, type RegisterUserDTO, RemoveMemberFromWorkspaceUseCase, RemoveTagFromTaskUseCase, type ReorderTasks, type ReportScope, RequiredString, type RequiredStringOptions, type ResetPassword, type ResetPasswordRequest, RestoreProjectUseCase, RestoreTaskUseCase, RestoreWorkspaceUseCase, ResumeTimerUseCase, type SessionFilters, type SessionStats, type SessionType, SoftDeleteProjectUseCase, SoftDeleteTaskUseCase, SoftDeleteWorkspaceUseCase, StartTimerUseCase, StopTimerUseCase, SwitchTaskUseCase, TAG_COLORS, TAG_LIMITS, TASK_LIMITS, TASK_PRIORITIES, TASK_STATUS, TASK_STATUS_VALUES, TIMER_LIMITS, TIMER_MODES, TIMER_MODE_VALUES, Tag, type TagBase, type TagColor, type TagFilter, type TagProps, type TagRepository, Task, type TaskBase, type TaskFilter, type TaskPriority, type TaskPriorityValue, type TaskProps, type TaskRepository, type TaskStatus, type TaskStatusValue, type TimeOfDay, TimeSession, type TimeSessionProps, type TimerMode, type TimerRepository, type TransferOwnership, USER_LIMITS, type UpdateCommentDTO, type UpdateDailyMetricsInput, UpdateDailyMetricsUseCase, type UpdateMemberRole, type UpdateProjectDTO, UpdateProjectUseCase, type UpdateTagDTO, UpdateTagUseCase, type UpdateTaskDTO, type UpdateUserProfile, UpdateWorkflowUseCase, type UpdateWorkspaceDTO, type UpdateWorkspaceSettingsInput, UpdateWorkspaceSettingsUseCase, type UseCase, User, UserByEmail, UserLogin, type UserPreferences, type UserProps, type UserRepository, type UsernameValidation, type ValueObject, type ViewType, WORKSPACE_COLORS, WORKSPACE_LIMITS, WORKSPACE_TYPES, type WeeklyReportContext, type WeeklyReportData, Workflow, type WorkflowProps, type WorkflowRepository, Workspace, WorkspaceAuditLog, type WorkspaceAuditLogProps, type WorkspaceAuditLogRepository, type WorkspaceBase, type WorkspaceColor, type WorkspaceFilter, WorkspaceInvitation, type WorkspaceInvitationProps, type WorkspaceInvitationRepository, WorkspaceMember, type WorkspaceMemberProps, type WorkspaceProps, type WorkspaceRepository, WorkspaceSettings, type WorkspaceSettingsDTO, type WorkspaceSettingsProps, type WorkspaceSettingsRepository, type WorkspaceTier, type WorkspaceType, type WorkspaceTypeValue, acceptInvitationSchema, addAlpha, addDays, addHours, addMinutes, aiService, archiveProjectSchema, assignTagsSchema, bulkUpdateTasksSchema, calculateAverageCompletionTime, calculateAverageTime, calculateBurndownRate, calculateCompletionRate, calculateEfficiency, calculateEstimatedCompletion, calculateFocusScore, calculatePercentile, calculateProductivityScore, calculateProgress, calculateProjectHealth, calculateStreak, calculateTimeUtilization, calculateTotalTimeWorked, calculateVelocity, calculateWeightedAverage, camelToTitle, capitalize, capitalizeWords, categorizeTasksByAvailability, changePasswordSchema, commentBaseSchema, commentFilterSchema, countWords, createCommentSchema, createProjectSchema, createTagSchema, createTaskSchema, createWorkspaceSchema, darkenColor, duplicateProjectSchema, endOfDay, endOfWeek, formatDate, formatDateShort, formatDuration, formatDurationFromSeconds, formatFileSize, formatNumber, formatRelativeTime, formatScheduledDateTime, formatTimeOfDay, formatTimerDisplay, formatTimerDisplayExtended, generateId, generatePalette, generateRandomString, generateSlug, getColorWithOpacity, getContrastColor, getCurrentTime, getDaysDiff, getInitials, getPriorityColor, getPriorityConfig, getPriorityLabel, getTaskStatusColor, getTaskStatusConfig, getTaskStatusLabel, getTimerModeColor, getTimerModeConfig, getTimerModeDefaultDuration, getTimerModeLabel, getWorkableTasks, hexToRgb, hexToRgba, highlightSearchTerms, hoursToMinutes, inviteMemberSchema, isAfter, isAllowedFileType, isAlphanumeric, isBefore, isDarkColor, isDueToday, isFuture, isImageFile, isLightColor, isOverdue, isPast, isScheduledForToday, isTaskAvailable, isTaskCompleted, isTaskInProgress, isToday, isValidEmail, isValidUrl, isWorkingHours, lightenColor, loginUserSchema, minutesToHours, minutesToSeconds, mixColors, normalizeWhitespace, parseDuration, pluralize, projectBaseSchema, projectFilterSchema, randomColor, registerUserSchema, reorderTasksSchema, resetPasswordRequestSchema, resetPasswordSchema, rgbToHex, sanitizeHtml, secondsToMinutes, shouldTakeLongBreak, snakeToTitle, startOfDay, startOfToday, startOfWeek, stripHtmlTags, tagBaseSchema, tagFilterSchema, taskBaseSchema, taskDatesSchema, taskFilterSchema, transferOwnershipSchema, truncate, updateCommentSchema, updateMemberRoleSchema, updateProjectSchema, updateTagSchema, updateTaskSchema, updateUserProfileSchema, updateWorkspaceSchema, userPreferencesSchema, usernameValidationSchema, workspaceBaseSchema, workspaceFilterSchema, workspaceSettingsSchema };
