import { ProjectRepository } from "../provider/project.repository";

export class SoftDeleteProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute(id: string): Promise<void> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new Error("Project not found");
    }

    await this.projectRepository.softDelete(id);
  }
}
