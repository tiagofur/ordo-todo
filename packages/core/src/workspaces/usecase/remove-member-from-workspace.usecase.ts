import { WorkspaceRepository } from "../provider/workspace.repository";

export class RemoveMemberFromWorkspaceUseCase {
    constructor(private workspaceRepository: WorkspaceRepository) { }

    async execute(workspaceId: string, userId: string): Promise<void> {
        // Check if workspace exists
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new Error("Workspace not found");
        }

        // Check if member exists
        const member = await this.workspaceRepository.findMember(workspaceId, userId);
        if (!member) {
            throw new Error("User is not a member of this workspace");
        }

        // Prevent removing the owner (if applicable logic exists, but for now simple removal)
        // Ideally we should check if the user is the owner, but ownerId is on Workspace.
        if (workspace.props.ownerId === userId) {
            throw new Error("Cannot remove the owner from the workspace");
        }

        await this.workspaceRepository.removeMember(workspaceId, userId);
    }
}
