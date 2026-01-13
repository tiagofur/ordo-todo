import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be less than 20 characters")
  .regex(
    /^[a-z0-9_-]+$/,
    "Username can only contain lowercase letters, numbers, hyphens, and underscores",
  );

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be less than 100 characters")
  .regex(/^(?=.*[a-z])/, "Password must contain at least one lowercase letter")
  .regex(/^(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
  .regex(/^(?=.*\d)/, "Password must contain at least one number")
  .regex(
    /^(?=.*[\W_])/,
    "Password must contain at least one special character",
  );

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address")
  .max(255, "Email must be less than 255 characters");

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters");

export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  name: nameSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z
  .object({
    name: nameSchema,
  })
  .partial();

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
