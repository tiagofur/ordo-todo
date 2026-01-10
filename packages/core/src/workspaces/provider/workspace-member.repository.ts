import { WorkspaceMember } from '../model/workspace-member.entity';
import { MemberRole } from '../model/member-role.enum';

/**
 * Input for creating workspace member
 */
export interface WorkspaceMemberInput {
  workspaceId: string;
  userId: string;
  role: MemberRole;
}

/**
 * Repository interface for WorkspaceMember domain
 */
export interface WorkspaceMemberRepository {
  /**
   * Add member to workspace
   */
  create(input: WorkspaceMemberInput): Promise<WorkspaceMember>;

  /**
   * Get member by ID
   */
  findById(id: string): Promise<WorkspaceMember | null>;

  /**
   * Get member by workspace and user
   */
  findByWorkspaceAndUser(
    workspaceId: string,
    userId: string
  ): Promise<WorkspaceMember | null>;

  /**
   * Get all members of a workspace
   */
  findByWorkspace(workspaceId: string): Promise<WorkspaceMember[]>;

  /**
   * Get all workspaces for a user
   */
  findByUser(userId: string): Promise<WorkspaceMember[]>;

  /**
   * Get members by role in workspace
   */
  findByWorkspaceAndRole(
    workspaceId: string,
    role: MemberRole
  ): Promise<WorkspaceMember[]>;

  /**
   * Update member role
   */
  updateRole(id: string, role: MemberRole): Promise<WorkspaceMember>;

  /**
   * Remove member from workspace
   */
  delete(id: string): Promise<void>;

  /**
   * Remove member from workspace by workspace and user
   */
  deleteByWorkspaceAndUser(
    workspaceId: string,
    userId: string
  ): Promise<void>;

  /**
   * Check if user is member of workspace
   */
  isMember(workspaceId: string, userId: string): Promise<boolean>;

  /**
   * Count members in workspace
   */
  countMembers(workspaceId: string): Promise<number>;

  /**
   * Get workspace owner
   */
  findOwner(workspaceId: string): Promise<WorkspaceMember | null>;

  /**
   * Get workspace admins (including owner)
   */
  findAdmins(workspaceId: string): Promise<WorkspaceMember[]>;
}
