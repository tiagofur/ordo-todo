import { ProjectRepository } from "../provider/project.repository";

export class GetDeletedProjectsUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute(workspaceId: string): Promise<any[]> {
    const projects = await this.projectRepository.findDeleted(workspaceId);
    return projects.map((p) => p.props);
  }
}
