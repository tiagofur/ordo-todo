import { WorkspaceInvitation } from "../model/workspace-invitation.entity";

export interface WorkspaceInvitationRepository {
    create(invitation: WorkspaceInvitation): Promise<WorkspaceInvitation>;
    findById(id: string): Promise<WorkspaceInvitation | null>;

    /**
     * @deprecated Use findPendingInvitations() instead and compare hashes manually
     * This method is kept for backward compatibility but won't work with hashed tokens
     */
    findByToken(tokenHash: string): Promise<WorkspaceInvitation | null>;

    /**
     * Find all pending invitations (for hash comparison)
     * Used when searching by token with bcrypt hashes
     */
    findPendingInvitations(): Promise<WorkspaceInvitation[]>;

    findByWorkspaceId(workspaceId: string): Promise<WorkspaceInvitation[]>;
    findByEmail(email: string): Promise<WorkspaceInvitation[]>;
    update(invitation: WorkspaceInvitation): Promise<WorkspaceInvitation>;
    delete(id: string): Promise<void>;
}
