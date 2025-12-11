/**
 * Habit validation schemas
 * Shared across all applications for consistent habit validation
 */

import { z } from "zod";

/**
 * Habit frequency enum values
 */
export const HABIT_FREQUENCY_VALUES = ["DAILY", "WEEKLY", "SPECIFIC_DAYS", "MONTHLY"] as const;

/**
 * Time of day enum values
 */
export const TIME_OF_DAY_VALUES = ["MORNING", "AFTERNOON", "EVENING", "ANYTIME"] as const;

/**
 * Habit limits
 */
export const HABIT_LIMITS = {
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 500,
    MAX_TARGET_COUNT: 10,
    MAX_HABITS_FREE: 5,
    MAX_HABITS_PRO: 50,
} as const;

/**
 * Base habit schema
 */
export const habitBaseSchema = z.object({
    name: z
        .string()
        .min(HABIT_LIMITS.NAME_MIN_LENGTH, "Name is required")
        .max(HABIT_LIMITS.NAME_MAX_LENGTH, `Name must be less than ${HABIT_LIMITS.NAME_MAX_LENGTH} characters`),
    description: z
        .string()
        .max(HABIT_LIMITS.DESCRIPTION_MAX_LENGTH, `Description must be less than ${HABIT_LIMITS.DESCRIPTION_MAX_LENGTH} characters`)
        .optional()
        .nullable(),
    icon: z.string().optional().nullable(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color").default("#10B981"),
    frequency: z.enum(HABIT_FREQUENCY_VALUES).default("DAILY"),
    targetDaysOfWeek: z
        .array(z.number().int().min(0).max(6))
        .max(7, "Maximum 7 days of week")
        .default([0, 1, 2, 3, 4, 5, 6]),
    targetCount: z
        .number()
        .int()
        .min(1, "Target count must be at least 1")
        .max(HABIT_LIMITS.MAX_TARGET_COUNT, `Target count must be at most ${HABIT_LIMITS.MAX_TARGET_COUNT}`)
        .default(1),
    preferredTime: z
        .string()
        .regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format")
        .optional()
        .nullable(),
    timeOfDay: z.enum(TIME_OF_DAY_VALUES).optional().nullable(),
});

/**
 * Create habit schema
 */
export const createHabitSchema = habitBaseSchema.extend({
    workspaceId: z.string().optional().nullable(),
});

/**
 * Update habit schema
 */
export const updateHabitSchema = habitBaseSchema.partial();

/**
 * Complete habit schema
 */
export const completeHabitSchema = z.object({
    note: z.string().max(500).optional().nullable(),
    value: z.number().optional().nullable(),
    completedAt: z.string().datetime().optional(),
});

/**
 * Habit filter schema
 */
export const habitFilterSchema = z.object({
    isActive: z.boolean().optional(),
    isPaused: z.boolean().optional(),
    frequency: z.enum(HABIT_FREQUENCY_VALUES).optional(),
    timeOfDay: z.enum(TIME_OF_DAY_VALUES).optional(),
    search: z.string().optional(),
});

/**
 * Habit stats query schema
 */
export const habitStatsQuerySchema = z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
});

/**
 * Type exports
 */
export type HabitBase = z.infer<typeof habitBaseSchema>;
export type CreateHabitDTO = z.infer<typeof createHabitSchema>;
export type UpdateHabitDTO = z.infer<typeof updateHabitSchema>;
export type CompleteHabitDTO = z.infer<typeof completeHabitSchema>;
export type HabitFilter = z.infer<typeof habitFilterSchema>;
export type HabitStatsQuery = z.infer<typeof habitStatsQuerySchema>;
