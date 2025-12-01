import { Project } from "../model/project.entity";

export interface ProjectRepository {
    create(project: Project): Promise<Project>;
    findById(id: string): Promise<Project | null>;
    findByWorkspaceId(workspaceId: string): Promise<Project[]>;
    findAllByUserId(userId: string): Promise<Project[]>;
    update(project: Project): Promise<Project>;
    delete(id: string): Promise<void>;
}
