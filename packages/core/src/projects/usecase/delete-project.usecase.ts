import { ProjectRepository } from "../provider/project.repository";

export class DeleteProjectUseCase {
    constructor(private projectRepository: ProjectRepository) { }

    async execute(id: string): Promise<void> {
        const project = await this.projectRepository.findById(id);
        if (!project) {
            throw new Error("Project not found");
        }

        await this.projectRepository.delete(id);
    }
}
