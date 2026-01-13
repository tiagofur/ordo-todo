"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = exports.nameSchema = exports.emailSchema = exports.passwordSchema = exports.usernameSchema = void 0;
const zod_1 = require("zod");
exports.usernameSchema = zod_1.z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, hyphens, and underscores");
exports.passwordSchema = zod_1.z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/^(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .regex(/^(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .regex(/^(?=.*\d)/, "Password must contain at least one number")
    .regex(/^(?=.*[\W_])/, "Password must contain at least one special character");
exports.emailSchema = zod_1.z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters");
exports.nameSchema = zod_1.z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters");
exports.registerSchema = zod_1.z.object({
    email: exports.emailSchema,
    username: exports.usernameSchema,
    password: exports.passwordSchema,
    name: exports.nameSchema,
});
exports.loginSchema = zod_1.z.object({
    email: exports.emailSchema,
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.updateProfileSchema = zod_1.z
    .object({
    name: exports.nameSchema,
})
    .partial();
exports.forgotPasswordSchema = zod_1.z.object({
    email: exports.emailSchema,
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Reset token is required"),
    password: exports.passwordSchema,
});
//# sourceMappingURL=auth.js.map