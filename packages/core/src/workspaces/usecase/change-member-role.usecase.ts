import { WorkspaceRepository } from "../provider/workspace.repository";
import { WorkspaceMemberRepository } from "../provider/workspace-member.repository";
import { MemberRole } from "../model/member-role.enum";

/**
 * ODD 018 S3 / W5: only OWNER/ADMIN reach this use case (controller guard).
 * The domain rules enforced here are:
 * - nobody may assign the OWNER role (ownership has no transfer flow yet)
 * - nobody may change the owner's role
 * - nobody may change their own role (self-demotion of the last admin or
 *   self-promotion both create states nobody can fix through the UI)
 */
export class ChangeMemberRoleUseCase {
    constructor(
        private workspaceRepository: WorkspaceRepository,
        private workspaceMemberRepository: WorkspaceMemberRepository,
    ) { }

    async execute(
        workspaceId: string,
        requesterId: string,
        targetUserId: string,
        newRole: MemberRole,
    ): Promise<void> {
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new Error("Workspace not found");
        }

        if (newRole === MemberRole.OWNER) {
            throw new Error("Cannot assign the OWNER role");
        }

        if (targetUserId === requesterId) {
            throw new Error("Cannot change your own role");
        }

        const member = await this.workspaceRepository.findMember(
            workspaceId,
            targetUserId,
        );
        if (!member) {
            throw new Error("Member not found");
        }

        // ownerId is nullable in the schema: a workspace with a null ownerId
        // but an OWNER membership row must be protected through the row too
        if (
            workspace.props.ownerId === targetUserId ||
            member.props.role === MemberRole.OWNER
        ) {
            throw new Error("Cannot change the owner role");
        }

        await this.workspaceMemberRepository.updateRole(
            String(member.id),
            newRole,
        );
    }
}
