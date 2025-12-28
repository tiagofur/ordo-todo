/**
 * Project Permissions Hook
 *
 * Provides granular permission checks for project actions based on project ownership
 * and workspace membership. Integrates with the workspace membership system to determine
 * what actions a user can perform on a project.
 *
 * @example
 * ```tsx
 * const { canEdit, canDelete, canArchive } = useProjectPermissions(project);
 *
 * return (
 *   <>
 *     {canEdit && <EditButton />}
 *     {canDelete && <DeleteButton />}
 *     {canArchive && <ArchiveButton />}
 *   </>
 * );
 * ```
 */

import { useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useWorkspaceMembers } from '@/lib/api-hooks';
import type { Project, MemberRole } from '@ordo-todo/api-client';

export interface ProjectPermissions {
  /** Can view project details */
  canView: boolean;
  /** Can edit project settings (name, description, color) */
  canEdit: boolean;
  /** Can delete the project */
  canDelete: boolean;
  /** Can archive/unarchive the project */
  canArchive: boolean;
  /** Can complete the project */
  canComplete: boolean;
  /** Can create tasks in this project */
  canCreateTasks: boolean;
  /** Can manage tasks (edit, delete) */
  canManageTasks: boolean;
  /** Can view project settings */
  canViewSettings: boolean;
  /** Can update project configuration */
  canUpdateSettings: boolean;
  /** The user's role in the workspace */
  workspaceRole: MemberRole | null;
  /** Whether the user is the project owner */
  isProjectOwner: boolean;
  /** Whether the user is the workspace owner or admin */
  isWorkspaceAdminOrOwner: boolean;
  /** Whether the user has edit access (project owner or workspace admin/owner) */
  hasEditAccess: boolean;
}

/**
 * Hook to check project permissions for the current user
 *
 * Permissions are based on:
 * 1. Project ownership (project.ownerId)
 * 2. Workspace membership role (OWNER > ADMIN > MEMBER > VIEWER)
 *
 * Permission hierarchy:
 * - Project Owner: Full control over the project
 * - Workspace OWNER/ADMIN: Can edit, archive, delete any project in workspace
 * - Workspace MEMBER: Can edit their own projects, view others
 * - Workspace VIEWER: Can only view projects
 *
 * @param project - The project to check permissions for
 * @returns Object containing permission flags and user role information
 */
export function useProjectPermissions(
  project: Project | null | undefined
): ProjectPermissions {
  const { user, isAuthenticated } = useAuth();
  const { data: members } = useWorkspaceMembers(project?.workspaceId ?? '');

  return useMemo(() => {
    // Default permissions (no access)
    const defaultPermissions: ProjectPermissions = {
      canView: false,
      canEdit: false,
      canDelete: false,
      canArchive: false,
      canComplete: false,
      canCreateTasks: false,
      canManageTasks: false,
      canViewSettings: false,
      canUpdateSettings: false,
      workspaceRole: null,
      isProjectOwner: false,
      isWorkspaceAdminOrOwner: false,
      hasEditAccess: false,
    };

    // If no project or not authenticated, return default permissions
    if (!project || !isAuthenticated || !user) {
      return defaultPermissions;
    }

    // Check if user is the project owner
    const isProjectOwner = project.ownerId === user.id;

    // Find user's membership in the workspace
    const membership = members?.find((m: { userId: string; role: MemberRole }) => m.userId === user.id);
    const workspaceRole = membership?.role ?? null;
    const isMember = !!membership;

    // If not a member and not project owner, no permissions
    if (!isMember && !isProjectOwner) {
      return defaultPermissions;
    }

    // Calculate permissions based on workspace role
    const isWorkspaceOwner = workspaceRole === 'OWNER';
    const isWorkspaceAdmin = workspaceRole === 'ADMIN';
    const isWorkspaceAdminOrOwner = isWorkspaceOwner || isWorkspaceAdmin;
    const isRegularMember = workspaceRole === 'MEMBER';
    const isViewer = workspaceRole === 'VIEWER';

    // Determine if user has edit access
    const hasEditAccess = isProjectOwner || isWorkspaceAdminOrOwner;

    return {
      // Everyone in workspace can view (including VIEWER)
      canView: isMember,

      // Project owner or workspace admin/owner can edit
      canEdit: hasEditAccess,

      // Only project owner or workspace owner can delete
      canDelete: isProjectOwner || isWorkspaceOwner,

      // Project owner or workspace admin/owner can archive
      canArchive: hasEditAccess,

      // Project owner or workspace admin/owner can mark as complete
      canComplete: hasEditAccess,

      // Project owner, workspace admin/owner, or regular member can create tasks
      // VIEWER cannot create tasks
      canCreateTasks: hasEditAccess || isRegularMember,

      // Project owner or workspace admin/owner can manage tasks
      canManageTasks: hasEditAccess,

      // Project owner or workspace admin/owner can view settings
      canViewSettings: hasEditAccess,

      // Project owner or workspace admin/owner can update settings
      canUpdateSettings: hasEditAccess,

      // User info
      workspaceRole,
      isProjectOwner,
      isWorkspaceAdminOrOwner,
      hasEditAccess,
    };
  }, [project, user, isAuthenticated, members]);
}

/**
 * Hook to check if the current user can perform any action on a project
 *
 * @param project - The project to check
 * @returns Whether the user has any permissions (useful for showing/hiding UI)
 */
export function useHasProjectAccess(project: Project | null | undefined): boolean {
  const permissions = useProjectPermissions(project);
  return permissions.canView;
}

/**
 * Check if user can perform an action based on workspace role hierarchy
 * OWNER > ADMIN > MEMBER > VIEWER
 */
export function canPerformProjectAction(
  workspaceRole: MemberRole | null,
  requiredRole: MemberRole
): boolean {
  if (!workspaceRole) return false;

  const roleHierarchy: Record<MemberRole, number> = {
    OWNER: 4,
    ADMIN: 3,
    MEMBER: 2,
    VIEWER: 1,
  };

  return roleHierarchy[workspaceRole] >= roleHierarchy[requiredRole];
}
