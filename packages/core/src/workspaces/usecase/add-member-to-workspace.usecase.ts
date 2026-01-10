import { WorkspaceMember } from "../model/workspace-member.entity";
import { MemberRole } from "../model/member-role.enum";
import { WorkspaceRepository } from "../provider/workspace.repository";

export class AddMemberToWorkspaceUseCase {
    constructor(private workspaceRepository: WorkspaceRepository) { }

    async execute(workspaceId: string, userId: string, role: MemberRole = MemberRole.MEMBER): Promise<WorkspaceMember> {
        // Check if workspace exists
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new Error("Workspace not found");
        }

        // Check if user is already a member
        const existingMember = await this.workspaceRepository.findMember(workspaceId, userId);
        if (existingMember) {
            // If already a member, return existing member (idempotent operation)
            // This handles the case where the repository already added the owner as member during workspace creation
            return existingMember;
        }

        const member = WorkspaceMember.create({
            workspaceId,
            userId,
            role,
        });

        return this.workspaceRepository.addMember(member);
    }
}
