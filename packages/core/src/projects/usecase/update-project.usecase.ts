import { Project, ProjectProps } from "../model/project.entity";
import { ProjectRepository } from "../provider/project.repository";

export class UpdateProjectUseCase {
    constructor(private projectRepository: ProjectRepository) { }

    async execute(id: string, props: Partial<Omit<ProjectProps, "id" | "workspaceId" | "createdAt">>): Promise<Project> {
        const project = await this.projectRepository.findById(id);
        if (!project) {
            throw new Error("Project not found");
        }

        const updatedProject = project.update(props);
        return this.projectRepository.update(updatedProject);
    }
}
