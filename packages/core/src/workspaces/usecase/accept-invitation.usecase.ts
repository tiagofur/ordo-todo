import { WorkspaceInvitation } from "../model/workspace-invitation.entity";
import { WorkspaceInvitationRepository } from "../provider/workspace-invitation.repository";
import { WorkspaceRepository } from "../provider/workspace.repository";
import { WorkspaceMember } from "../model/workspace-member.entity";

export class AcceptInvitationUseCase {
    constructor(
        private workspaceRepository: WorkspaceRepository,
        private invitationRepository: WorkspaceInvitationRepository
    ) { }

    async execute(token: string, userId: string): Promise<void> {
        const invitation = await this.invitationRepository.findByToken(token);
        if (!invitation) {
            throw new Error("Invalid invitation token");
        }

        if (invitation.isExpired()) {
            throw new Error("Invitation expired");
        }

        if (invitation.props.status !== "PENDING") {
            throw new Error("Invitation is not pending");
        }

        // Add member to workspace
        const member = WorkspaceMember.create({
            workspaceId: invitation.props.workspaceId,
            userId: userId,
            role: invitation.props.role,
        });

        await this.workspaceRepository.addMember(member);

        // Mark invitation as accepted
        const acceptedInvitation = invitation.accept();
        await this.invitationRepository.update(acceptedInvitation);
    }
}
