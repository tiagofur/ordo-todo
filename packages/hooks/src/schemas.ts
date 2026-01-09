import { z } from "zod";

/**
 * Task limits
 */
export const TASK_LIMITS = {
    TITLE_MIN_LENGTH: 1,
    TITLE_MAX_LENGTH: 200,
    DESCRIPTION_MAX_LENGTH: 5000,
    MIN_ESTIMATED_MINUTES: 1,
    MAX_ESTIMATED_MINUTES: 480,
    MAX_TAGS_PER_TASK: 10,
} as const;

/**
 * Project limits
 */
export const PROJECT_LIMITS = {
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 2000,
} as const;

/**
 * Priority values
 */
export const PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

/**
 * Task status values
 */
export const TASK_STATUS_VALUES = ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;

/**
 * Color constants
 */
export const PROJECT_COLORS = [
    "#EF4444", // red
    "#F59E0B", // amber
    "#10B981", // emerald
    "#3B82F6", // blue
    "#8B5CF6", // violet
    "#EC4899", // pink
    "#6B7280", // gray
] as const;

/**
 * Workspace limits
 */
export const WORKSPACE_LIMITS = {
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 500,
} as const;

/**
 * Member roles
 */
export const MEMBER_ROLES = ["OWNER", "ADMIN", "MEMBER", "VIEWER"] as const;

/**
 * Schemas inlined from @ordo-todo/core to avoid client-side bundling issues
 */

export const taskBaseSchema = z.object({
    title: z
        .string()
        .min(TASK_LIMITS.TITLE_MIN_LENGTH, "Title is required")
        .max(TASK_LIMITS.TITLE_MAX_LENGTH, `Title must be less than ${TASK_LIMITS.TITLE_MAX_LENGTH} characters`),
    description: z
        .string()
        .max(TASK_LIMITS.DESCRIPTION_MAX_LENGTH, `Description must be less than ${TASK_LIMITS.DESCRIPTION_MAX_LENGTH} characters`)
        .optional(),
    priority: z.enum(PRIORITY_VALUES),
    status: z.enum(TASK_STATUS_VALUES).optional(),
    dueDate: z.string().optional().nullable(),
    startDate: z.string().optional().nullable(),
    scheduledDate: z.string().optional().nullable(),
    scheduledTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format").optional().nullable(),
    isTimeBlocked: z.boolean().optional(),
    estimatedMinutes: z
        .union([
            z.number()
                .int()
                .min(TASK_LIMITS.MIN_ESTIMATED_MINUTES)
                .max(TASK_LIMITS.MAX_ESTIMATED_MINUTES),
            z.nan(),
        ])
        .optional()
        .nullable()
        .transform((val) => (Number.isNaN(val) ? undefined : val)),
});

export const createTaskSchema = taskBaseSchema.extend({
    projectId: z.string().min(1, "Project is required"),
    parentTaskId: z.string().optional().nullable(),
    assigneeId: z.string().optional().nullable(),
    tagIds: z.array(z.string()).max(TASK_LIMITS.MAX_TAGS_PER_TASK).optional(),
});

export const projectBaseSchema = z.object({
    name: z
        .string()
        .min(PROJECT_LIMITS.NAME_MIN_LENGTH, "Project name is required")
        .max(PROJECT_LIMITS.NAME_MAX_LENGTH, `Project name must be less than ${PROJECT_LIMITS.NAME_MAX_LENGTH} characters`),
    description: z
        .string()
        .max(PROJECT_LIMITS.DESCRIPTION_MAX_LENGTH, `Description must be less than ${PROJECT_LIMITS.DESCRIPTION_MAX_LENGTH} characters`)
        .optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
});

export const createProjectSchema = projectBaseSchema.extend({
    workspaceId: z.string().min(1, "Workspace is required"),
    workflowId: z.string().optional(),
    startDate: z.string().datetime().optional().nullable(),
    endDate: z.string().datetime().optional().nullable(),
});

export const inviteMemberSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(MEMBER_ROLES),
    message: z.string().max(500).optional(),
});
