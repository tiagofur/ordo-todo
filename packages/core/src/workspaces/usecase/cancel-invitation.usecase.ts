import { WorkspaceInvitationRepository } from "../provider/workspace-invitation.repository";

/**
 * ODD 018 S3: cancels a PENDING invitation (OWNER/ADMIN via controller
 * guard). Accepted, expired or already-cancelled invitations keep their
 * historical status — cancelling is only meaningful for pending ones.
 */
export class CancelInvitationUseCase {
    constructor(private invitationRepository: WorkspaceInvitationRepository) { }

    async execute(workspaceId: string, invitationId: string): Promise<void> {
        const invitation = await this.invitationRepository.findById(invitationId);
        if (!invitation || invitation.props.workspaceId !== workspaceId) {
            // Same message for missing and foreign invitations: no existence leak
            throw new Error("Invitation not found");
        }

        if (invitation.props.status !== "PENDING") {
            throw new Error("Invitation is not pending");
        }

        const cancelled = invitation.cancel();
        await this.invitationRepository.update(cancelled);
    }
}
