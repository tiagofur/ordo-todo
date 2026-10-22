import { WorkspaceRepository } from "../provider/workspace.repository";

/**
 * ODD 018 S3 / W6: any member except the owner may leave the workspace.
 * The owner cannot leave until an ownership-transfer flow exists —
 * otherwise the workspace would be orphaned.
 */
export class LeaveWorkspaceUseCase {
    constructor(private workspaceRepository: WorkspaceRepository) { }

    async execute(workspaceId: string, userId: string): Promise<void> {
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new Error("Workspace not found");
        }

        if (workspace.props.ownerId === userId) {
            throw new Error(
                "The workspace owner cannot leave; transfer ownership first",
            );
        }

        const member = await this.workspaceRepository.findMember(
            workspaceId,
            userId,
        );
        if (!member) {
            throw new Error("User is not a member of this workspace");
        }

        await this.workspaceRepository.removeMember(workspaceId, userId);
    }
}
