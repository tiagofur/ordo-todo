/**
 * Workspace validation schemas
 * Shared across all applications for consistent workspace validation
 */

import { z } from "zod";
import { WORKSPACE_LIMITS } from "../constants/limits.constants";

/**
 * Workspace type enum
 */
export const WORKSPACE_TYPES = ["PERSONAL", "WORK", "TEAM"] as const;

import { MemberRole } from "../../workspaces/model/member-role.enum";

/**
 * Member role enum
 */
export const MEMBER_ROLES = [MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER, MemberRole.VIEWER] as const;

/**
 * Base workspace schema
 */
export const workspaceBaseSchema = z.object({
  name: z
    .string()
    .min(WORKSPACE_LIMITS.NAME_MIN_LENGTH, "Workspace name is required")
    .max(
      WORKSPACE_LIMITS.NAME_MAX_LENGTH,
      `Workspace name must be less than ${WORKSPACE_LIMITS.NAME_MAX_LENGTH} characters`,
    ),
  slug: z
    .string()
    .min(1, "Slug must be at least 1 character")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must only contain lowercase letters, numbers, and hyphens",
    )
    .optional(),
  description: z
    .string()
    .max(
      WORKSPACE_LIMITS.DESCRIPTION_MAX_LENGTH,
      `Description must be less than ${WORKSPACE_LIMITS.DESCRIPTION_MAX_LENGTH} characters`,
    )
    .optional(),
  type: z.enum(WORKSPACE_TYPES),
  color: z.string().optional(),
  icon: z.string().optional(),
});

/**
 * Create workspace schema
 */
export const createWorkspaceSchema = workspaceBaseSchema;

/**
 * Update workspace schema
 */
export const updateWorkspaceSchema = workspaceBaseSchema.partial();

/**
 * Workspace settings schema
 */
export const workspaceSettingsSchema = z.object({
  defaultTaskPriority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  defaultTaskStatus: z
    .enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"])
    .optional(),
  enableNotifications: z.boolean().optional(),
  enableEmailDigest: z.boolean().optional(),
  timezone: z.string().optional(),
});

/**
 * Invite member schema
 */
export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(MEMBER_ROLES),
  message: z.string().max(500).optional(),
});

/**
 * Update member role schema
 */
export const updateMemberRoleSchema = z.object({
  role: z.enum(MEMBER_ROLES),
});

/**
 * Accept invitation schema
 */
export const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Invitation token is required"),
});

/**
 * Transfer ownership schema
 */
export const transferOwnershipSchema = z.object({
  newOwnerId: z.string().min(1, "New owner is required"),
});

/**
 * Workspace filter schema
 */
export const workspaceFilterSchema = z.object({
  type: z.enum(WORKSPACE_TYPES).optional(),
  search: z.string().optional(),
});

/**
 * Type exports
 * Note: WorkspaceType is defined in workspaces domain, so we use WorkspaceTypeValue here
 */
export type WorkspaceTypeValue = (typeof WORKSPACE_TYPES)[number];
export type MemberRoleValue = (typeof MEMBER_ROLES)[number];
export type WorkspaceBase = z.infer<typeof workspaceBaseSchema>;
export type CreateWorkspaceDTO = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceDTO = z.infer<typeof updateWorkspaceSchema>;
export type WorkspaceSettingsDTO = z.infer<typeof workspaceSettingsSchema>;
export type InviteMemberDTO = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRole = z.infer<typeof updateMemberRoleSchema>;
export type AcceptInvitation = z.infer<typeof acceptInvitationSchema>;
export type TransferOwnership = z.infer<typeof transferOwnershipSchema>;
export type WorkspaceFilter = z.infer<typeof workspaceFilterSchema>;
