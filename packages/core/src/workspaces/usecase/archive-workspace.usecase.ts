import { Workspace } from "../model/workspace.entity";
import { WorkspaceRepository } from "../provider/workspace.repository";

export class ArchiveWorkspaceUseCase {
    constructor(private workspaceRepository: WorkspaceRepository) { }

    async execute(id: string, userId: string): Promise<Workspace> {
        const workspace = await this.workspaceRepository.findById(id);
        if (!workspace) {
            throw new Error("Workspace not found");
        }

        if (workspace.props.ownerId !== userId) {
            throw new Error("Unauthorized");
        }

        const archivedWorkspace = workspace.archive();
        return this.workspaceRepository.update(archivedWorkspace);
    }
}
