import { ProjectRepository } from "../provider/project.repository";
import { Project } from "../model/project.entity";

export class GetDeletedProjectsUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute(workspaceId: string): Promise<Project[]> {
    const projects = await this.projectRepository.findDeleted(workspaceId);
    return projects;
  }
}
