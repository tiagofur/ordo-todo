import { ProjectRepository } from "../provider/project.repository";

export class RestoreProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute(id: string): Promise<void> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new Error("Project not found");
    }

    if (!project.props.isDeleted) {
      throw new Error("Project is not deleted");
    }

    await this.projectRepository.restore(id);
  }
}
