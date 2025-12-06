/**
 * Comment validation schemas
 * Shared across all applications for consistent comment validation
 */

import { z } from "zod";
import { COMMENT_LIMITS } from "../constants/limits.constants";

/**
 * Base comment schema
 */
export const commentBaseSchema = z.object({
    content: z
        .string()
        .min(COMMENT_LIMITS.CONTENT_MIN_LENGTH, "Comment cannot be empty")
        .max(COMMENT_LIMITS.CONTENT_MAX_LENGTH, `Comment must be less than ${COMMENT_LIMITS.CONTENT_MAX_LENGTH} characters`),
});

/**
 * Create comment schema
 */
export const createCommentSchema = commentBaseSchema.extend({
    taskId: z.string().min(1, "Task is required"),
    parentCommentId: z.string().optional().nullable(), // For threaded comments
    mentions: z.array(z.string()).optional(), // User IDs mentioned in comment
});

/**
 * Update comment schema
 */
export const updateCommentSchema = commentBaseSchema;

/**
 * Comment filter schema
 */
export const commentFilterSchema = z.object({
    taskId: z.string().optional(),
    userId: z.string().optional(),
    parentCommentId: z.string().optional().nullable(),
});

/**
 * Type exports
 */
export type CommentBase = z.infer<typeof commentBaseSchema>;
export type CreateCommentDTO = z.infer<typeof createCommentSchema>;
export type UpdateCommentDTO = z.infer<typeof updateCommentSchema>;
export type CommentFilter = z.infer<typeof commentFilterSchema>;
