import { Project, ProjectProps } from "../model/project.entity";
import { ProjectRepository } from "../provider/project.repository";

export class CreateProjectUseCase {
    constructor(private projectRepository: ProjectRepository) { }

    async execute(props: Omit<ProjectProps, "id" | "createdAt" | "updatedAt" | "position" | "archived" | "completed" | "completedAt">): Promise<Project> {
        const project = Project.create(props);
        return this.projectRepository.create(project);
    }
}
