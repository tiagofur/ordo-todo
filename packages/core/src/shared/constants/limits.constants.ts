/**
 * Application limits and constraints
 * Used across all applications for validation and UI constraints
 */

/**
 * Task limits
 */
export const TASK_LIMITS = {
    TITLE_MIN_LENGTH: 1,
    TITLE_MAX_LENGTH: 200,
    DESCRIPTION_MAX_LENGTH: 5000,
    MIN_ESTIMATED_MINUTES: 1,
    MAX_ESTIMATED_MINUTES: 480, // 8 hours
    MAX_SUBTASKS: 50,
    MAX_TAGS_PER_TASK: 10,
    MAX_ATTACHMENTS_PER_TASK: 20,
} as const;

/**
 * Project limits
 */
export const PROJECT_LIMITS = {
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 2000,
    MAX_PROJECTS_PER_WORKSPACE: 100,
    MAX_TASKS_PER_PROJECT: 1000,
} as const;

/**
 * Workspace limits
 */
export const WORKSPACE_LIMITS = {
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 500,
    MAX_MEMBERS: 50,
    MAX_WORKSPACES_PER_USER: 20,
    SLUG_MIN_LENGTH: 3,
    SLUG_MAX_LENGTH: 50,
} as const;

/**
 * Tag limits
 */
export const TAG_LIMITS = {
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 30,
    MAX_TAGS_PER_WORKSPACE: 100,
} as const;

/**
 * Comment limits
 */
export const COMMENT_LIMITS = {
    CONTENT_MIN_LENGTH: 1,
    CONTENT_MAX_LENGTH: 2000,
    MAX_COMMENTS_PER_TASK: 500,
} as const;

/**
 * File upload limits
 */
export const FILE_LIMITS = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5 MB
    MAX_TOTAL_STORAGE_PER_WORKSPACE: 1024 * 1024 * 1024, // 1 GB
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    ALLOWED_DOCUMENT_TYPES: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
} as const;

/**
 * User limits
 */
export const USER_LIMITS = {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_MAX_LENGTH: 128,
    BIO_MAX_LENGTH: 500,
} as const;

/**
 * Pagination limits
 */
export const PAGINATION_LIMITS = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    MIN_PAGE_SIZE: 5,
} as const;

/**
 * Helper function to format file size
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

/**
 * Check if file type is allowed
 */
export function isAllowedFileType(mimeType: string): boolean {
    const allowedTypes: readonly string[] = [
        ...FILE_LIMITS.ALLOWED_IMAGE_TYPES,
        ...FILE_LIMITS.ALLOWED_DOCUMENT_TYPES,
    ];
    return allowedTypes.includes(mimeType);
}

/**
 * Check if file is an image
 */
export function isImageFile(mimeType: string): boolean {
    return (FILE_LIMITS.ALLOWED_IMAGE_TYPES as readonly string[]).includes(mimeType);
}

/**
 * Notification limits
 */
export const NOTIFICATION_LIMITS = {
    TITLE_MIN_LENGTH: 1,
    TITLE_MAX_LENGTH: 200,
    MESSAGE_MAX_LENGTH: 1000,
    ACTION_LABEL_MAX_LENGTH: 50,
    ACTION_URL_MAX_LENGTH: 2048,
    MAX_NOTIFICATIONS_PER_USER: 500,
} as const;
