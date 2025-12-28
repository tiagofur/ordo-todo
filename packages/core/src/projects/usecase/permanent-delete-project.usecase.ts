import { ProjectRepository } from "../provider/project.repository";

export class PermanentDeleteProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute(id: string): Promise<void> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new Error("Project not found");
    }

    if (!project.props.isDeleted) {
      throw new Error("Project must be soft deleted first");
    }

    await this.projectRepository.permanentDelete(id);
  }
}
