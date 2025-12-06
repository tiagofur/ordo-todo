/**
 * Task and Project status constants
 * Used across all applications for consistent status handling
 */

export const TASK_STATUS = {
    TODO: {
        value: "TODO" as const,
        label: "To Do",
        color: "#6B7280", // gray
        order: 1,
    },
    IN_PROGRESS: {
        value: "IN_PROGRESS" as const,
        label: "In Progress",
        color: "#3B82F6", // blue
        order: 2,
    },
    IN_REVIEW: {
        value: "IN_REVIEW" as const,
        label: "In Review",
        color: "#F59E0B", // amber
        order: 3,
    },
    DONE: {
        value: "DONE" as const,
        label: "Done",
        color: "#10B981", // emerald
        order: 4,
    },
    CANCELLED: {
        value: "CANCELLED" as const,
        label: "Cancelled",
        color: "#EF4444", // red
        order: 5,
    },
} as const;

export const TASK_STATUS_VALUES = [
    "TODO",
    "IN_PROGRESS",
    "IN_REVIEW",
    "DONE",
    "CANCELLED",
] as const;

/**
 * Task status type
 * Note: TaskStatus is defined in tasks domain, so we use TaskStatusValue here
 */
export type TaskStatusValue = typeof TASK_STATUS_VALUES[number];

/**
 * Project status constants
 */
export const PROJECT_STATUS = {
    ACTIVE: {
        value: "ACTIVE" as const,
        label: "Active",
        color: "#10B981", // emerald
    },
    ARCHIVED: {
        value: "ARCHIVED" as const,
        label: "Archived",
        color: "#6B7280", // gray
    },
    ON_HOLD: {
        value: "ON_HOLD" as const,
        label: "On Hold",
        color: "#F59E0B", // amber
    },
} as const;

export const PROJECT_STATUS_VALUES = ["ACTIVE", "ARCHIVED", "ON_HOLD"] as const;

/**
 * Project status type
 * Note: ProjectStatus might be defined elsewhere, so we use ProjectStatusValue here
 */
export type ProjectStatusValue = typeof PROJECT_STATUS_VALUES[number];

/**
 * Get task status configuration by value
 */
export function getTaskStatusConfig(status: TaskStatusValue) {
    return TASK_STATUS[status];
}

/**
 * Get task status color
 */
export function getTaskStatusColor(status: TaskStatusValue): string {
    return TASK_STATUS[status].color;
}

/**
 * Get task status label
 */
export function getTaskStatusLabel(status: TaskStatusValue): string {
    return TASK_STATUS[status].label;
}

/**
 * Check if task is completed
 */
export function isTaskCompleted(status: TaskStatusValue): boolean {
    return status === "DONE";
}

/**
 * Check if task is in progress
 */
export function isTaskInProgress(status: TaskStatusValue): boolean {
    return status === "IN_PROGRESS" || status === "IN_REVIEW";
}
