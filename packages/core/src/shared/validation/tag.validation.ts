/**
 * Tag validation schemas
 * Shared across all applications for consistent tag validation
 */

import { z } from "zod";
import { TAG_LIMITS } from "../constants/limits.constants";

/**
 * Base tag schema
 */
export const tagBaseSchema = z.object({
    name: z
        .string()
        .min(TAG_LIMITS.NAME_MIN_LENGTH, "Tag name is required")
        .max(TAG_LIMITS.NAME_MAX_LENGTH, `Tag name must be less than ${TAG_LIMITS.NAME_MAX_LENGTH} characters`),
    color: z.string().optional(),
});

/**
 * Create tag schema
 */
export const createTagSchema = tagBaseSchema.extend({
    workspaceId: z.string().min(1, "Workspace is required"),
});

/**
 * Update tag schema
 */
export const updateTagSchema = tagBaseSchema.partial();

/**
 * Tag filter schema
 */
export const tagFilterSchema = z.object({
    workspaceId: z.string().optional(),
    search: z.string().optional(),
});

/**
 * Assign tags to task schema
 */
export const assignTagsSchema = z.object({
    tagIds: z.array(z.string()).max(TAG_LIMITS.NAME_MAX_LENGTH),
});

/**
 * Type exports
 */
export type TagBase = z.infer<typeof tagBaseSchema>;
export type CreateTagDTO = z.infer<typeof createTagSchema>;
export type UpdateTagDTO = z.infer<typeof updateTagSchema>;
export type TagFilter = z.infer<typeof tagFilterSchema>;
export type AssignTags = z.infer<typeof assignTagsSchema>;
