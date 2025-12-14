/**
 * User validation schemas
 * Shared across all applications for consistent user validation
 */

import { z } from "zod";
import { USER_LIMITS } from "../constants/limits.constants";

/**
 * User registration schema
 */
export const registerUserSchema = z.object({
    name: z
        .string()
        .min(USER_LIMITS.NAME_MIN_LENGTH, `Name must be at least ${USER_LIMITS.NAME_MIN_LENGTH} characters`)
        .max(USER_LIMITS.NAME_MAX_LENGTH, `Name must be less than ${USER_LIMITS.NAME_MAX_LENGTH} characters`),
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be less than 20 characters")
        .regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, hyphens, and underscores"),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(USER_LIMITS.PASSWORD_MIN_LENGTH, `Password must be at least ${USER_LIMITS.PASSWORD_MIN_LENGTH} characters`)
        .max(USER_LIMITS.PASSWORD_MAX_LENGTH, `Password must be less than ${USER_LIMITS.PASSWORD_MAX_LENGTH} characters`),
});

/**
 * User login schema
 */
export const loginUserSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

/**
 * Update user profile schema
 */
export const updateUserProfileSchema = z.object({
    name: z
        .string()
        .min(USER_LIMITS.NAME_MIN_LENGTH)
        .max(USER_LIMITS.NAME_MAX_LENGTH)
        .optional(),
    bio: z.string().max(USER_LIMITS.BIO_MAX_LENGTH).optional(),
    avatar: z.string().url().optional().nullable(),
    timezone: z.string().optional(),
    language: z.enum(["en", "es", "pt-BR"]).optional(),
});

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
        .string()
        .min(USER_LIMITS.PASSWORD_MIN_LENGTH, `Password must be at least ${USER_LIMITS.PASSWORD_MIN_LENGTH} characters`)
        .max(USER_LIMITS.PASSWORD_MAX_LENGTH),
});

/**
 * Reset password request schema
 */
export const resetPasswordRequestSchema = z.object({
    email: z.string().email("Invalid email address"),
});

/**
 * Reset password schema
 */
export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z
        .string()
        .min(USER_LIMITS.PASSWORD_MIN_LENGTH, `Password must be at least ${USER_LIMITS.PASSWORD_MIN_LENGTH} characters`)
        .max(USER_LIMITS.PASSWORD_MAX_LENGTH),
});

/**
 * User preferences schema
 */
export const userPreferencesSchema = z.object({
    theme: z.enum(["light", "dark", "system"]).optional(),
    language: z.enum(["en", "es", "pt-BR"]).optional(),
    timezone: z.string().optional(),
    notifications: z.object({
        email: z.boolean().optional(),
        push: z.boolean().optional(),
        desktop: z.boolean().optional(),
    }).optional(),
    pomodoro: z.object({
        workDuration: z.number().int().min(1).max(120).optional(),
        shortBreakDuration: z.number().int().min(1).max(30).optional(),
        longBreakDuration: z.number().int().min(1).max(60).optional(),
        pomodorosUntilLongBreak: z.number().int().min(2).max(10).optional(),
        autoStartBreaks: z.boolean().optional(),
        autoStartPomodoros: z.boolean().optional(),
        soundEnabled: z.boolean().optional(),
    }).optional(),
});

/**
 * Type exports
 */
export type RegisterUserDTO = z.infer<typeof registerUserSchema>;
export type LoginUserDTO = z.infer<typeof loginUserSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
/**
 * Username validation schema
 */
export const usernameValidationSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be less than 20 characters")
        .regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, hyphens, and underscores"),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type UsernameValidation = z.infer<typeof usernameValidationSchema>;
