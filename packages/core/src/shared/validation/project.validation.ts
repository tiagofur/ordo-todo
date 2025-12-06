/**
 * Project validation schemas
 * Shared across all applications for consistent project validation
 */

import { z } from "zod";
import { PROJECT_LIMITS } from "../constants/limits.constants";
import { PROJECT_COLORS } from "../constants/colors.constants";

/**
 * Base project schema
 */
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

/**
 * Create project schema
 */
export const createProjectSchema = projectBaseSchema.extend({
    workspaceId: z.string().min(1, "Workspace is required"),
    workflowId: z.string().optional(),
    startDate: z.string().datetime().optional().nullable(),
    endDate: z.string().datetime().optional().nullable(),
});

/**
 * Update project schema
 */
export const updateProjectSchema = projectBaseSchema.partial().extend({
    startDate: z.string().datetime().optional().nullable(),
    endDate: z.string().datetime().optional().nullable(),
    isArchived: z.boolean().optional(),
});

/**
 * Project filter schema
 */
export const projectFilterSchema = z.object({
    workspaceId: z.string().optional(),
    search: z.string().optional(),
    isArchived: z.boolean().optional(),
    color: z.string().optional(),
});

/**
 * Archive project schema
 */
export const archiveProjectSchema = z.object({
    isArchived: z.boolean(),
});

/**
 * Duplicate project schema
 */
export const duplicateProjectSchema = z.object({
    name: z.string().min(PROJECT_LIMITS.NAME_MIN_LENGTH),
    includeTasks: z.boolean().default(false),
    includeMembers: z.boolean().default(false),
});

/**
 * Type exports
 */
export type ProjectBase = z.infer<typeof projectBaseSchema>;
export type CreateProjectDTO = z.infer<typeof createProjectSchema>;
export type UpdateProjectDTO = z.infer<typeof updateProjectSchema>;
export type ProjectFilter = z.infer<typeof projectFilterSchema>;
export type ArchiveProject = z.infer<typeof archiveProjectSchema>;
export type DuplicateProject = z.infer<typeof duplicateProjectSchema>;
