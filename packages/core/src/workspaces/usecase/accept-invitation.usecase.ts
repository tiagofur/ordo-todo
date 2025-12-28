import { WorkspaceInvitation } from "../model/workspace-invitation.entity";
import { WorkspaceInvitationRepository } from "../provider/workspace-invitation.repository";
import { WorkspaceRepository } from "../provider/workspace.repository";
import { WorkspaceMember } from "../model/workspace-member.entity";
import { HashService } from "../../shared/services/hash.service";

export class AcceptInvitationUseCase {
    constructor(
        private workspaceRepository: WorkspaceRepository,
        private invitationRepository: WorkspaceInvitationRepository,
        private hashService: HashService
    ) { }

    async execute(token: string, userId: string): Promise<void> {
        // Since we now store hashed tokens with bcrypt, we can't search directly by hash
        // (bcrypt generates different hashes each time even for the same input)
        // Instead, we fetch all pending invitations and compare the token against each hash

        const pendingInvitations = await this.invitationRepository.findPendingInvitations();

        if (pendingInvitations.length === 0) {
            throw new Error("Invalid invitation token");
        }

        // Find the invitation that matches the provided token
        let matchedInvitation: WorkspaceInvitation | null = null;

        for (const invitation of pendingInvitations) {
            const isValid = await this.hashService.compare(token, invitation.props.tokenHash);
            if (isValid) {
                matchedInvitation = invitation;
                break;
            }
        }

        if (!matchedInvitation) {
            throw new Error("Invalid invitation token");
        }

        if (matchedInvitation.isExpired()) {
            throw new Error("Invitation expired");
        }

        const workspaceId = matchedInvitation.props.workspaceId;

        // Check if user is already a member of the workspace
        const existingMember = await this.workspaceRepository.findMember(workspaceId, userId);
        if (existingMember) {
            // User is already a member - just mark the invitation as accepted and return
            // This makes the operation idempotent and allows accepting invitations multiple times safely
            const acceptedInvitation = matchedInvitation.accept();
            await this.invitationRepository.update(acceptedInvitation);
            return;
        }

        // Add member to workspace
        const member = WorkspaceMember.create({
            workspaceId,
            userId,
            role: matchedInvitation.props.role,
        });

        await this.workspaceRepository.addMember(member);

        // Mark invitation as accepted
        const acceptedInvitation = matchedInvitation.accept();
        await this.invitationRepository.update(acceptedInvitation);
    }
}
