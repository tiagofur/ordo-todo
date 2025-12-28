import { Project } from "../model/project.entity";

export interface ProjectRepository {
  create(project: Project): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findBySlug(slug: string, workspaceId: string): Promise<Project | null>;
  findByWorkspaceId(workspaceId: string): Promise<Project[]>;
  findAllByUserId(userId: string): Promise<Project[]>;
  update(project: Project): Promise<Project>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  permanentDelete(id: string): Promise<void>;
  findDeleted(workspaceId: string): Promise<Project[]>;
}
