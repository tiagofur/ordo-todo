import { WorkspaceMember, MemberRole } from "../model/workspace-member.entity";
import { WorkspaceRepository } from "../provider/workspace.repository";

export class AddMemberToWorkspaceUseCase {
    constructor(private workspaceRepository: WorkspaceRepository) { }

    async execute(workspaceId: string, userId: string, role: MemberRole = "MEMBER"): Promise<WorkspaceMember> {
        // Check if workspace exists
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new Error("Workspace not found");
        }

        // Check if user is already a member
        const existingMember = await this.workspaceRepository.findMember(workspaceId, userId);
        if (existingMember) {
            throw new Error("User is already a member of this workspace");
        }

        const member = WorkspaceMember.create({
            workspaceId,
            userId,
            role,
        });

        return this.workspaceRepository.addMember(member);
    }
}
