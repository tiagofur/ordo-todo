import { Workspace } from "../model/workspace.entity";
import { WorkspaceMember, MemberRole } from "../model/workspace-member.entity";

/**
 * Workspace member with associated user information.
 *
 * Used for member listings to include user profile data.
 */
export interface MemberWithUser {
  /** The unique identifier of the user */
  userId: string;
  /** The member's role in the workspace */
  role: MemberRole;
  /** User profile information */
  user: {
    /** The user's unique identifier */
    id: string;
    /** The user's display name */
    name: string | null;
    /** The user's email address */
    email: string | null;
    /** The user's profile image URL */
    image: string | null;
  };
}

/**
 * Repository interface for Workspace entity.
 *
 * Provides data access methods for workspace persistence,
 * member management, and soft delete functionality.
 *
 * @example
 * ```typescript
 * class PrismaWorkspaceRepository implements WorkspaceRepository {
 *   async create(workspace: Workspace): Promise<Workspace> {
 *     const created = await prisma.workspace.create({
 *       data: workspace.toJSON()
 *     });
 *     return Workspace.fromPrisma(created);
 *   }
 *   // ... other methods
 * }
 * ```
 */
export interface WorkspaceRepository {
  /**
   * Creates a new workspace.
   *
   * @param workspace - The workspace entity to create
   * @returns Promise that resolves to the created workspace
   * @throws {Error} If validation fails or database operation fails
   *
   * @example
   * ```typescript
   * const workspace = new Workspace({
   *   name: 'My Workspace',
   *   type: WorkspaceType.PERSONAL,
   *   ownerId: 'user-123'
   * });
   * const created = await repository.create(workspace);
   * ```
   */
  create(workspace: Workspace): Promise<Workspace>;

  /**
   * Finds a workspace by its unique ID.
   *
   * @param id - The unique identifier of the workspace
   * @returns Promise that resolves to the workspace if found, null otherwise
   *
   * @example
   * ```typescript
   * const workspace = await repository.findById('workspace-123');
   * if (workspace) {
   *   console.log(workspace.name);
   * }
   * ```
   */
  findById(id: string): Promise<Workspace | null>;

  /**
   * Finds a workspace by its unique slug and owner.
   *
   * Used for shareable workspace URLs (e.g., /workspace/my-project).
   * Requires ownerId to prevent accessing workspaces with duplicate slugs
   * owned by different users.
   *
   * @param slug - The unique URL-friendly slug of the workspace
   * @param ownerId - The unique identifier of the workspace owner
   * @returns Promise that resolves to the workspace if found, null otherwise
   *
   * @example
   * ```typescript
   * const workspace = await repository.findBySlug('my-project', 'user-123');
   * if (workspace) {
   *   console.log(workspace.name);
   * }
   * ```
   */
  findBySlug(slug: string, ownerId: string): Promise<Workspace | null>;

  /**
   * Finds a workspace by owner ID and slug with complete statistics.
   *
   * Used for public workspace pages (e.g., /username/workspace-slug) where
   * full workspace data with stats (projects, members, tasks) is needed.
   *
   * Returns workspace data with:
   * - Owner information (id, username, name, email)
   * - Stats (projectCount, memberCount, taskCount)
   * - All workspace properties
   *
   * @param ownerId - The unique identifier of the workspace owner
   * @param slug - The unique URL-friendly slug of the workspace
   * @returns Promise that resolves to workspace with stats if found, null otherwise
   *
   * @example
   * ```typescript
   * const workspace = await repository.findByOwnerAndSlugWithStats('user-123', 'my-project');
   * if (workspace) {
   *   console.log(`${workspace.name}: ${workspace.stats.projectCount} projects`);
   * }
   * ```
   */
  findByOwnerAndSlugWithStats(
    ownerId: string,
    slug: string,
  ): Promise<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    tier: string;
    color: string;
    icon: string | null;
    ownerId: string;
    owner: {
      id: string;
      username: string;
      name: string | null;
      email: string | null;
    };
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
    stats: {
      projectCount: number;
      memberCount: number;
      taskCount: number;
    };
  } | null>;

  /**
   * Finds all workspaces owned by a specific user.
   *
   * @param ownerId - The unique identifier of the workspace owner
   * @returns Promise that resolves to an array of workspaces
   *
   * @example
   * ```typescript
   * const ownedWorkspaces = await repository.findByOwnerId('user-123');
   * ```
   */
  findByOwnerId(ownerId: string): Promise<Workspace[]>;

  /**
   * Finds all workspaces where the user is a member (including owner).
   *
   * Includes:
   * - Personal workspaces owned by the user
   * - Team workspaces where the user is a member
   *
   * @param userId - The unique identifier of the user
   * @returns Promise that resolves to an array of workspaces
   *
   * @example
   * ```typescript
   * const allWorkspaces = await repository.findByUserId('user-123');
   * ```
   */
  findByUserId(userId: string): Promise<Workspace[]>;

  /**
   * Finds all soft-deleted workspaces for a user.
   *
   * Useful for implementing a "trash" or "recycle bin" feature.
   *
   * @param userId - The unique identifier of the user
   * @returns Promise that resolves to an array of deleted workspaces
   *
   * @example
   * ```typescript
   * const deletedWorkspaces = await repository.findDeleted('user-123');
   * ```
   */
  findDeleted(userId: string): Promise<Workspace[]>;

  /**
   * Updates an existing workspace.
   *
   * @param workspace - The workspace entity with updated properties
   * @returns Promise that resolves to the updated workspace
   * @throws {Error} If the workspace doesn't exist or validation fails
   *
   * @example
   * ```typescript
   * const updated = workspace.clone({ name: 'Updated Name' });
   * await repository.update(updated);
   * ```
   */
  update(workspace: Workspace): Promise<Workspace>;

  /**
   * Alias for softDelete. Maintains compatibility with code using 'delete' terminology.
   *
   * @param id - The unique identifier of the workspace to delete
   * @returns Promise that resolves when the workspace is deleted
   * @see softDelete
   */
  delete(id: string): Promise<void>;

  /**
   * Soft deletes a workspace by marking it as deleted.
   *
   * The workspace remains in the database but is marked as deleted
   * and won't appear in normal queries.
   *
   * @param id - The unique identifier of the workspace to delete
   * @returns Promise that resolves when the workspace is soft deleted
   *
   * @example
   * ```typescript
   * await repository.softDelete('workspace-123');
   * ```
   */
  softDelete(id: string): Promise<void>;

  /**
   * Restores a previously soft-deleted workspace.
   *
   * @param id - The unique identifier of the workspace to restore
   * @returns Promise that resolves when the workspace is restored
   *
   * @example
   * ```typescript
   * await repository.restore('workspace-123');
   * ```
   */
  restore(id: string): Promise<void>;

  /**
   * Permanently deletes a workspace (hard delete).
   *
   * WARNING: This operation cannot be undone. Use softDelete
   * unless you absolutely need to permanently remove the workspace.
   *
   * @param id - The unique identifier of the workspace to delete
   * @returns Promise that resolves when the workspace is permanently deleted
   *
   * @example
   * ```typescript
   * await repository.permanentDelete('workspace-123');
   * ```
   */
  permanentDelete(id: string): Promise<void>;

  // ========== Member Management ==========

  /**
   * Adds a member to a workspace.
   *
   * @param member - The workspace member entity (userId, workspaceId, role)
   * @returns Promise that resolves to the created member
   * @throws {Error} If the user is already a member or validation fails
   *
   * @example
   * ```typescript
   * const member = new WorkspaceMember({
   *   workspaceId: 'workspace-123',
   *   userId: 'user-456',
   *   role: MemberRole.MEMBER
   * });
   * await repository.addMember(member);
   * ```
   */
  addMember(member: WorkspaceMember): Promise<WorkspaceMember>;

  /**
   * Removes a member from a workspace.
   *
   * @param workspaceId - The unique identifier of the workspace
   * @param userId - The unique identifier of the user to remove
   * @returns Promise that resolves when the member is removed
   *
   * @example
   * ```typescript
   * await repository.removeMember('workspace-123', 'user-456');
   * ```
   */
  removeMember(workspaceId: string, userId: string): Promise<void>;

  /**
   * Finds a specific member in a workspace.
   *
   * @param workspaceId - The unique identifier of the workspace
   * @param userId - The unique identifier of the user
   * @returns Promise that resolves to the member if found, null otherwise
   *
   * @example
   * ```typescript
   * const member = await repository.findMember('workspace-123', 'user-456');
   * if (member) {
   *   console.log(member.role);
   * }
   * ```
   */
  findMember(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMember | null>;

  /**
   * Lists all members of a workspace.
   *
   * @param workspaceId - The unique identifier of the workspace
   * @returns Promise that resolves to an array of workspace members
   *
   * @example
   * ```typescript
   * const members = await repository.listMembers('workspace-123');
   * members.forEach(member => {
   *   console.log(`${member.userId}: ${member.role}`);
   * });
   * ```
   */
  listMembers(workspaceId: string): Promise<WorkspaceMember[]>;

  /**
   * Lists all members of a workspace with user profile information.
   *
   * Includes user details (name, email, image) for display purposes.
   *
   * @param workspaceId - The unique identifier of the workspace
   * @returns Promise that resolves to an array of members with user info
   *
   * @example
   * ```typescript
   * const members = await repository.listMembersWithUser('workspace-123');
   * members.forEach(member => {
   *   console.log(`${member.user.name}: ${member.role}`);
   * });
   * ```
   */
  listMembersWithUser(workspaceId: string): Promise<MemberWithUser[]>;
}
