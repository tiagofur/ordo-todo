import { WorkspaceRepository } from "../provider/workspace.repository";

export class SoftDeleteWorkspaceUseCase {
  constructor(private workspaceRepository: WorkspaceRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const workspace = await this.workspaceRepository.findById(id);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    if (workspace.props.ownerId !== userId) {
      throw new Error("Unauthorized");
    }

    await this.workspaceRepository.softDelete(id);
  }
}
