/**
 * Workspace Permissions Hook
 *
 * Provides granular permission checks for workspace actions based on user membership and role.
 * Integrates with the workspace membership system to determine what actions a user can perform.
 *
 * @example
 * ```tsx
 * const { canEdit, canDelete, canInvite } = useWorkspacePermissions(workspace);
 *
 * return (
 *   <>
 *     {canEdit && <EditButton />}
 *     {canDelete && <DeleteButton />}
 *     {canInvite && <InviteButton />}
 *   </>
 * );
 * ```
 */

import { useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useWorkspaceMembers } from '@/lib/api-hooks';
import type { Workspace, MemberRole } from '@ordo-todo/api-client';

export interface WorkspacePermissions {
  /** Can view workspace details */
  canView: boolean;
  /** Can edit workspace settings (name, description, type) */
  canEdit: boolean;
  /** Can delete/archive the workspace */
  canDelete: boolean;
  /** Can invite new members */
  canInvite: boolean;
  /** Can manage members (add, remove, change roles) */
  canManageMembers: boolean;
  /** Can view workspace settings */
  canViewSettings: boolean;
  /** Can update workspace configuration */
  canUpdateSettings: boolean;
  /** Can view audit logs */
  canViewAuditLogs: boolean;
  /** Can create projects in this workspace */
  canCreateProjects: boolean;
  /** The user's role in this workspace */
  userRole: MemberRole | null;
  /** Whether the user is the workspace owner */
  isOwner: boolean;
  /** Whether the user is an admin or owner */
  isAdminOrOwner: boolean;
  /** Whether the user is a member of the workspace */
  isMember: boolean;
}

/**
 * Hook to check workspace permissions for the current user
 *
 * @param workspace - The workspace to check permissions for
 * @returns Object containing permission flags and user role information
 */
export function useWorkspacePermissions(
  workspace: Workspace | null | undefined
): WorkspacePermissions {
  const { user, isAuthenticated } = useAuth();
  const { data: members } = useWorkspaceMembers(workspace?.id ?? '');

  return useMemo(() => {
    // Default permissions (no access)
    const defaultPermissions: WorkspacePermissions = {
      canView: false,
      canEdit: false,
      canDelete: false,
      canInvite: false,
      canManageMembers: false,
      canViewSettings: false,
      canUpdateSettings: false,
      canViewAuditLogs: false,
      canCreateProjects: false,
      userRole: null,
      isOwner: false,
      isAdminOrOwner: false,
      isMember: false,
    };

    // If no workspace or not authenticated, return default permissions
    if (!workspace || !isAuthenticated || !user) {
      return defaultPermissions;
    }

    // Check if user is the workspace owner
    const isOwner = workspace.ownerId === user.id;

    // Find user's membership
    const membership = members?.find((m) => m.userId === user.id);
    const userRole = membership?.role ?? null;
    const isMember = !!membership;

    // If not a member and not owner, no permissions
    if (!isMember && !isOwner) {
      return defaultPermissions;
    }

    // Calculate permissions based on role
    const isAdmin = userRole === 'ADMIN';
    const isAdminOrOwner = isOwner || isAdmin;
    const isRegularMember = userRole === 'MEMBER';
    const isViewer = userRole === 'VIEWER';

    return {
      // Everyone can view if they're a member
      canView: isMember || isOwner,

      // OWNER and ADMIN can edit workspace details
      canEdit: isAdminOrOwner,

      // Only OWNER can delete workspace
      canDelete: isOwner,

      // OWNER and ADMIN can invite members
      canInvite: isAdminOrOwner,

      // OWNER and ADMIN can manage members
      canManageMembers: isAdminOrOwner,

      // OWNER and ADMIN can view settings
      canViewSettings: isAdminOrOwner,

      // OWNER and ADMIN can update settings
      canUpdateSettings: isAdminOrOwner,

      // OWNER and ADMIN can view audit logs
      canViewAuditLogs: isAdminOrOwner,

      // OWNER, ADMIN, and MEMBER can create projects (not VIEWER)
      canCreateProjects: isAdminOrOwner || isRegularMember,

      // User info
      userRole,
      isOwner,
      isAdminOrOwner,
      isMember: isMember || isOwner,
    };
  }, [workspace, user, isAuthenticated, members]);
}

/**
 * Hook to get the current user's membership in a workspace
 *
 * @param workspaceId - The workspace ID to check membership for
 * @returns The user's membership object or null if not a member
 */
export function useWorkspaceMembership(workspaceId: string | null | undefined) {
  const { user, isAuthenticated } = useAuth();
  const { data: members, isLoading } = useWorkspaceMembers(workspaceId ?? '');

  const membership = useMemo(() => {
    if (!isAuthenticated || !user || !members) {
      return null;
    }

    return members.find((m) => m.userId === user.id) ?? null;
  }, [user, isAuthenticated, members]);

  return {
    membership,
    isLoading,
    isMember: !!membership,
    role: membership?.role ?? null,
  };
}

/**
 * Type guard to check if a role has specific permissions
 */
export function hasRole(
  userRole: MemberRole | null,
  requiredRoles: MemberRole[]
): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/**
 * Check if user can perform an action based on role hierarchy
 * OWNER > ADMIN > MEMBER > VIEWER
 */
export function canPerformAction(
  userRole: MemberRole | null,
  requiredRole: MemberRole
): boolean {
  if (!userRole) return false;

  const roleHierarchy: Record<MemberRole, number> = {
    OWNER: 4,
    ADMIN: 3,
    MEMBER: 2,
    VIEWER: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
