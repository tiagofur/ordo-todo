import { WorkspaceInvitation } from "../model/workspace-invitation.entity";

/**
 * Repository interface for WorkspaceInvitation entity persistence operations.
 *
 * This interface defines the contract for workspace invitation data access, providing methods
 * for creating, finding, and managing workspace member invitations. Invitations are used to
 * invite users to join a workspace via email, with secure token-based acceptance.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaWorkspaceInvitationRepository implements WorkspaceInvitationRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async create(invitation: WorkspaceInvitation): Promise<WorkspaceInvitation> {
 *     const data = await this.prisma.workspaceInvitation.create({
 *       data: {
 *         id: invitation.id,
 *         workspaceId: invitation.workspaceId,
 *         email: invitation.email,
 *         tokenHash: invitation.tokenHash,
 *         role: invitation.role,
 *         invitedBy: invitation.invitedBy,
 *         expiresAt: invitation.expiresAt,
 *         createdAt: invitation.createdAt
 *       }
 *     });
 *     return new WorkspaceInvitation(data);
 *   }
 *
 *   async findPendingInvitations(): Promise<WorkspaceInvitation[]> {
 *     const invitations = await this.prisma.workspaceInvitation.findMany({
 *       where: { status: 'PENDING' }
 *     });
 *     return invitations.map(i => new WorkspaceInvitation(i));
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/workspace-invitation.entity.ts | WorkspaceInvitation entity}
 */
export interface WorkspaceInvitationRepository {
  /**
   * Creates a new workspace invitation.
   *
   * Used when a workspace owner or admin invites a new member via email.
   * Generates a secure token that will be sent to the invitee's email for verification.
   *
   * @param invitation - The invitation entity to create (must be valid)
   * @returns Promise resolving to the created invitation with database-generated fields
   * @throws {Error} If invitation validation fails or database constraint is violated
   *
   * @example
   * ```typescript
   * const invitation = new WorkspaceInvitation({
   *   workspaceId: 'workspace-123',
   *   email: 'newmember@example.com',
   *   tokenHash: 'hashed_token_here',
   *   role: 'MEMBER',
   *   invitedBy: 'user-456',
   *   expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
   * });
   *
   * const created = await repository.create(invitation);
   * console.log(`Invitation created for ${created.email}`);
   * // Send email with invitation link containing token
   * ```
   */
  create(invitation: WorkspaceInvitation): Promise<WorkspaceInvitation>;

  /**
   * Finds an invitation by its unique ID.
   *
   * Used for retrieving invitation details when the ID is known, such as when
   * an admin views invitation details or when checking invitation status.
   *
   * @param id - The unique identifier of the invitation
   * @returns Promise resolving to the invitation if found, null otherwise
   *
   * @example
   * ```typescript
   * const invitation = await repository.findById('inv-abc-123');
   * if (invitation) {
   *   console.log(`Invitation for ${invitation.email}`);
   *   console.log(`Status: ${invitation.status}`);
   *   console.log(`Role: ${invitation.role}`);
   * } else {
   *   console.log('Invitation not found');
   * }
   * ```
   */
  findById(id: string): Promise<WorkspaceInvitation | null>;

  /**
   * Finds an invitation by token hash.
   *
   * @deprecated Use findPendingInvitations() instead and compare hashes manually.
   * This method is kept for backward compatibility but won't work with hashed tokens.
   *
   * Previously used for validating invitation tokens when a user clicks an invitation link.
   * Due to bcrypt hashing, direct lookup is not possible. Use findPendingInvitations()
   * and compare the token hashes manually.
   *
   * @param tokenHash - The hashed token to search for
   * @returns Promise resolving to the invitation if found, null otherwise
   * @deprecated Use findPendingInvitations() and verify tokens manually
   */
  findByToken(tokenHash: string): Promise<WorkspaceInvitation | null>;

  /**
   * Finds all pending invitations for hash comparison.
   *
   * Used when validating invitation tokens. Since tokens are hashed using bcrypt for security,
   * we need to fetch all pending invitations and manually compare the token hash using
   * bcrypt.compare(). This is intentional for security reasons.
   *
   * @returns Promise resolving to an array of pending invitations (empty array if none found)
   *
   * @example
   * ```typescript
   * // When a user clicks an invitation link with a token
   * const token = request.query.token as string;
   * const pendingInvitations = await repository.findPendingInvitations();
   *
   * // Find matching invitation by comparing hashes
   * let matchingInvitation: WorkspaceInvitation | null = null;
   * for (const invitation of pendingInvitations) {
   *   const isValid = await bcrypt.compare(token, invitation.tokenHash);
   *   if (isValid) {
   *     matchingInvitation = invitation;
   *     break;
   *   }
   * }
   *
   * if (matchingInvitation) {
   *   console.log(`Valid invitation found for ${matchingInvitation.email}`);
   *   // Proceed with invitation acceptance
   * } else {
   *   console.log('Invalid or expired invitation token');
   * }
   * ```
   */
  findPendingInvitations(): Promise<WorkspaceInvitation[]>;

  /**
   * Finds all invitations for a specific workspace.
   *
   * Used for displaying the invitation list in workspace settings, showing all
   * pending, accepted, and expired invitations for that workspace.
   *
   * @param workspaceId - The workspace ID to find invitations for
   * @returns Promise resolving to an array of invitations (empty array if none found)
   *
   * @example
   * ```typescript
   * const invitations = await repository.findByWorkspaceId('workspace-123');
   * console.log(`Found ${invitations.length} invitations`);
   *
   * // Group by status
   * const pending = invitations.filter(i => i.status === 'PENDING');
   * const accepted = invitations.filter(i => i.status === 'ACCEPTED');
   * const expired = invitations.filter(i => i.status === 'EXPIRED');
   *
   * console.log(`Pending: ${pending.length}, Accepted: ${accepted.length}, Expired: ${expired.length}`);
   * ```
   */
  findByWorkspaceId(workspaceId: string): Promise<WorkspaceInvitation[]>;

  /**
   * Finds all invitations for a specific email address.
   *
   * Used for displaying invitations sent to a particular email, such as when a user
   * checks their pending invitations or when preventing duplicate invitations.
   *
   * @param email - The email address to find invitations for
   * @returns Promise resolving to an array of invitations (empty array if none found)
   *
   * @example
   * ```typescript
   * const invitations = await repository.findByEmail('user@example.com');
   * console.log(`Found ${invitations.length} invitations for this email`);
   *
   * // Show pending invitations
   * const pending = invitations.filter(i => i.status === 'PENDING' && !i.isExpired());
   * pending.forEach(invitation => {
   *   console.log(`${invitation.workspaceId} - ${invitation.role}`);
   * });
   *
   * // Check for duplicate before sending new invitation
   * const existingPending = invitations.find(i =>
   *   i.status === 'PENDING' &&
   *   i.workspaceId === newWorkspaceId &&
   *   !i.isExpired()
   * );
   * if (existingPending) {
   *   console.log('User already has a pending invitation for this workspace');
   * }
   * ```
   */
  findByEmail(email: string): Promise<WorkspaceInvitation[]>;

  /**
   * Updates an existing invitation.
   *
   * Used when modifying invitation details, such as changing status (PENDING → ACCEPTED),
   * updating role, or extending expiration date.
   *
   * @param invitation - The invitation entity with updated fields
   * @returns Promise resolving to the updated invitation
   * @throws {NotFoundException} If the invitation doesn't exist
   * @throws {Error} If validation fails or database constraint is violated
   *
   * @example
   * ```typescript
   * const existing = await repository.findById('inv-123');
   * if (existing) {
   *   const accepted = existing.clone({
   *     status: 'ACCEPTED',
   *     acceptedAt: new Date(),
   *     acceptedBy: 'user-789'
   *   });
   *   await repository.update(accepted);
   *   console.log('Invitation accepted');
   *
   *   // Add user to workspace members
   *   await addWorkspaceMember(existing.workspaceId, acceptedBy, existing.role);
   * }
   * ```
   */
  update(invitation: WorkspaceInvitation): Promise<WorkspaceInvitation>;

  /**
   * Deletes an invitation.
   *
   * Used when revoking an invitation, cleaning up expired invitations, or when
   * a user declines an invitation (mark as declined or delete).
   *
   * @param id - The unique identifier of the invitation to delete
   * @returns Promise resolving when the deletion is complete
   * @throws {NotFoundException} If the invitation doesn't exist
   *
   * @example
   * ```typescript
   * // Revoke a pending invitation
   * await repository.delete('inv-abc-123');
   * console.log('Invitation revoked');
   *
   * // Cleanup expired invitations
   * const invitations = await repository.findByWorkspaceId('workspace-123');
   * for (const invitation of invitations) {
   *   if (invitation.isExpired()) {
   *     await repository.delete(invitation.id);
   *     console.log(`Deleted expired invitation for ${invitation.email}`);
   *   }
   * }
   * ```
   */
  delete(id: string): Promise<void>;
}
