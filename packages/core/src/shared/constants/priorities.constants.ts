/**
 * Task priority constants with labels and colors
 * Used across all applications for consistent priority handling
 */

export const TASK_PRIORITIES = {
    LOW: {
        value: "LOW" as const,
        label: "Low",
        color: "#10B981", // emerald
        order: 1,
    },
    MEDIUM: {
        value: "MEDIUM" as const,
        label: "Medium",
        color: "#F59E0B", // amber
        order: 2,
    },
    HIGH: {
        value: "HIGH" as const,
        label: "High",
        color: "#EF4444", // red
        order: 3,
    },
} as const;

export const PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH"] as const;

/**
 * Task priority type
 * Note: TaskPriority is defined in tasks domain, so we use TaskPriorityValue here
 */
export type TaskPriorityValue = typeof PRIORITY_VALUES[number];

/**
 * Get priority configuration by value
 */
export function getPriorityConfig(priority: TaskPriorityValue) {
    return TASK_PRIORITIES[priority];
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: TaskPriorityValue): string {
    return TASK_PRIORITIES[priority].color;
}

/**
 * Get priority label
 */
export function getPriorityLabel(priority: TaskPriorityValue): string {
    return TASK_PRIORITIES[priority].label;
}
