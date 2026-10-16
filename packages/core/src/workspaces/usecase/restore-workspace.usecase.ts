import { WorkspaceRepository } from "../provider/workspace.repository";

export class RestoreWorkspaceUseCase {
  constructor(private workspaceRepository: WorkspaceRepository) {}

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

    await this.workspaceRepository.restore(id);
  }
}
