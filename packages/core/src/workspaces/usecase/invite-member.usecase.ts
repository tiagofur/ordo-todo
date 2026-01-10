import { WorkspaceInvitation } from "../model/workspace-invitation.entity";
import { WorkspaceInvitationRepository } from "../provider/workspace-invitation.repository";
import { WorkspaceRepository } from "../provider/workspace.repository";
import { MemberRole } from "../model/workspace-member.entity";
import { HashService } from "../../shared/services/hash.service";
import { generateUuid } from "../../shared/uuid.util";

export class InviteMemberUseCase {
    constructor(
        private workspaceRepository: WorkspaceRepository,
        private invitationRepository: WorkspaceInvitationRepository,
        private hashService: HashService
    ) { }

    async execute(workspaceId: string, email: string, role: MemberRole, invitedById: string): Promise<{ invitation: WorkspaceInvitation, token: string }> {
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new Error("Workspace not found");
        }

        // Check if inviter is a member (and has permissions - simplified for now)
        // In a real app, we'd check permissions here.

        // Generate a secure random token
        const token = generateUuid();

        // Hash the token before storing it in the database
        // This ensures that even if the database is compromised, tokens cannot be used
        const tokenHash = await this.hashService.hash(token);

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
        // For now, we return the plain token so the controller can display it (dev mode) or send it.
        // IMPORTANT: The plain token should ONLY be sent via email, never stored or logged

        return { invitation: savedInvitation, token };
    }
}
