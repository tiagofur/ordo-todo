import { Workspace } from "../model/workspace.entity";
import { WorkspaceRepository } from "../provider/workspace.repository";

export class GetDeletedWorkspacesUseCase {
    constructor(private workspaceRepository: WorkspaceRepository) { }

    async execute(userId: string): Promise<Workspace[]> {
        return this.workspaceRepository.findDeleted(userId);
    }
}
