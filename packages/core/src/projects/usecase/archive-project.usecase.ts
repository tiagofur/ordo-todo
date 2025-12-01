import { Project } from "../model/project.entity";
import { ProjectRepository } from "../provider/project.repository";

export class ArchiveProjectUseCase {
    constructor(private projectRepository: ProjectRepository) { }

    async execute(id: string): Promise<Project> {
        const project = await this.projectRepository.findById(id);
        if (!project) {
            throw new Error("Project not found");
        }

        console.log('🔍 Current archived status:', project.props.archived);
        // Toggle archive status: if archived, unarchive it; if not archived, archive it
        const updatedProject = project.props.archived ? project.unarchive() : project.archive();
        console.log('🔄 New archived status:', updatedProject.props.archived);
        return this.projectRepository.update(updatedProject);
    }
}
