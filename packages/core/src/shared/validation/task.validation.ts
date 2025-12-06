/**
 * Task validation schemas
 * Shared across all applications for consistent task validation
 */

import { z } from "zod";
import { TASK_LIMITS } from "../constants/limits.constants";
import { PRIORITY_VALUES } from "../constants/priorities.constants";
import { TASK_STATUS_VALUES } from "../constants/status.constants";

/**
 * Base task schema
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

/**
 * Create task schema
 */
export const createTaskSchema = taskBaseSchema.extend({
    projectId: z.string().min(1, "Project is required"),
    parentTaskId: z.string().optional().nullable(),
    assigneeId: z.string().optional().nullable(),
    tagIds: z.array(z.string()).max(TASK_LIMITS.MAX_TAGS_PER_TASK).optional(),
});

/**
 * Update task schema (all fields optional except what's being updated)
 */
export const updateTaskSchema = taskBaseSchema.partial().extend({
    assigneeId: z.string().optional().nullable(),
    tagIds: z.array(z.string()).max(TASK_LIMITS.MAX_TAGS_PER_TASK).optional(),
    completedAt: z.string().datetime().optional().nullable(),
});

/**
 * Task filter schema
 */
export const taskFilterSchema = z.object({
    projectId: z.string().optional(),
    status: z.enum(TASK_STATUS_VALUES).optional(),
    priority: z.enum(PRIORITY_VALUES).optional(),
    assigneeId: z.string().optional(),
    tagIds: z.array(z.string()).optional(),
    search: z.string().optional(),
    dueDate: z.object({
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
    }).optional(),
    isOverdue: z.boolean().optional(),
});

/**
 * Bulk update tasks schema
 */
export const bulkUpdateTasksSchema = z.object({
    taskIds: z.array(z.string()).min(1, "At least one task is required"),
    updates: z.object({
        status: z.enum(TASK_STATUS_VALUES).optional(),
        priority: z.enum(PRIORITY_VALUES).optional(),
        assigneeId: z.string().optional().nullable(),
        projectId: z.string().optional(),
    }),
});

/**
 * Reorder tasks schema
 */
export const reorderTasksSchema = z.object({
    taskId: z.string(),
    newOrder: z.number().int().min(0),
    projectId: z.string(),
});

/**
 * Type exports
 */
export type TaskBase = z.infer<typeof taskBaseSchema>;
export type CreateTaskDTO = z.infer<typeof createTaskSchema>;
export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>;
export type TaskFilter = z.infer<typeof taskFilterSchema>;
export type BulkUpdateTasks = z.infer<typeof bulkUpdateTasksSchema>;
export type ReorderTasks = z.infer<typeof reorderTasksSchema>;
