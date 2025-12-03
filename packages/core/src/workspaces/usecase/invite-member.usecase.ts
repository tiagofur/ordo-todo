import { WorkspaceInvitation } from "../model/workspace-invitation.entity";
import { WorkspaceInvitationRepository } from "../provider/workspace-invitation.repository";
import { WorkspaceRepository } from "../provider/workspace.repository";
import { MemberRole } from "../model/workspace-member.entity";
import { v4 as uuidv4 } from 'uuid';

export class InviteMemberUseCase {
    constructor(
        private workspaceRepository: WorkspaceRepository,
        private invitationRepository: WorkspaceInvitationRepository
    ) { }

    async execute(workspaceId: string, email: string, role: MemberRole, invitedById: string): Promise<{ invitation: WorkspaceInvitation, token: string }> {
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new Error("Workspace not found");
        }

        // Check if inviter is a member (and has permissions - simplified for now)
        // In a real app, we'd check permissions here.

        const token = uuidv4();
        // In a real app, we should hash this token. For MVP, we store it as is or a simple transform.
        // We'll store the token directly in tokenHash for now to allow retrieval.
        const tokenHash = token;

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

        const invitation = WorkspaceInvitation.create({
            workspaceId,
            email,
            tokenHash,
            role,
            invitedById,
            expiresAt,
        });

        const savedInvitation = await this.invitationRepository.create(invitation);

        // Here we would trigger an event or call a service to send the email.
        // For now, we return the token so the controller can display it (dev mode) or send it.

        return { invitation: savedInvitation, token };
    }
}
