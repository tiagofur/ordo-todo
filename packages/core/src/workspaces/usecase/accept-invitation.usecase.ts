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
        let matchedInvitation: WorkspaceInvitation | null = null;

        // 1. Fast path: Direct O(1) lookup using deterministic hash
        try {
            const hashedToken = await this.hashService.hash(token);
            matchedInvitation = await this.invitationRepository.findByToken(hashedToken);
        } catch {
            // Fallback to scan
        }

        // 2. Slow path: Fallback for legacy bcrypt hashes
        if (!matchedInvitation) {
            const pendingInvitations = await this.invitationRepository.findPendingInvitations();
            for (const invitation of pendingInvitations) {
                const isValid = await this.hashService.compare(token, invitation.props.tokenHash);
                if (isValid) {
                    matchedInvitation = invitation;
                    break;
                }
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
