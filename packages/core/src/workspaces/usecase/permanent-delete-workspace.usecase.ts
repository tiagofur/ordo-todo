import { WorkspaceRepository } from "../provider/workspace.repository";

export class PermanentDeleteWorkspaceUseCase {
    constructor(private workspaceRepository: WorkspaceRepository) { }

    async execute(id: string, userId: string): Promise<void> {
        const workspace = this.workspaceRepository.findByIdIncludeDeleted
          ? await this.workspaceRepository.findByIdIncludeDeleted(id)
          : (await this.workspaceRepository.findDeleted(userId)).find((w) => w.id === id);

        if (!workspace) {
            throw new Error("Workspace not found");
        }

        if (workspace.props.ownerId !== userId) {
            throw new Error("Unauthorized");
        }

        if (!workspace.props.isDeleted) {
            throw new Error("Workspace must be soft deleted first");
        }

        await this.workspaceRepository.permanentDelete(id);
    }
}
