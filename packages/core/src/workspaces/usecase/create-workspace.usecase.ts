import { Workspace, WorkspaceProps } from "../model/workspace.entity";
import { WorkspaceRepository } from "../provider/workspace.repository";

export class CreateWorkspaceUseCase {
    constructor(private workspaceRepository: WorkspaceRepository) { }

    async execute(props: Omit<WorkspaceProps, "id" | "slug" | "createdAt" | "updatedAt" | "isArchived" | "isDeleted" | "deletedAt">): Promise<Workspace> {
        const baseSlug = this.generateSlug(props.name);
        let slug = baseSlug;
        let counter = 1;

        while (await this.workspaceRepository.findBySlug(slug)) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        const workspace = Workspace.create({
            ...props,
            slug,
        });
        return this.workspaceRepository.create(workspace);
    }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}
