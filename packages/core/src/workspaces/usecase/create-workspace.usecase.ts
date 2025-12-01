import { Workspace, WorkspaceProps } from "../model/workspace.entity";
import { WorkspaceRepository } from "../provider/workspace.repository";

export class CreateWorkspaceUseCase {
    constructor(private workspaceRepository: WorkspaceRepository) { }

    async execute(props: Omit<WorkspaceProps, "id" | "createdAt" | "updatedAt">): Promise<Workspace> {
        const workspace = Workspace.create(props);
        return this.workspaceRepository.create(workspace);
    }
}
