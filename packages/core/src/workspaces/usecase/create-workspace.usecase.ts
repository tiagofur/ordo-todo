import { Workspace, WorkspaceProps } from "../model/workspace.entity";
import { WorkspaceRepository } from "../provider/workspace.repository";

export class CreateWorkspaceUseCase {
  constructor(
    private workspaceRepository: WorkspaceRepository,
    private ownerUsername?: string,
  ) { }

  async execute(
    props: Omit<
      WorkspaceProps,
      | "id"
      | "slug"
      | "createdAt"
      | "updatedAt"
      | "isArchived"
      | "isDeleted"
      | "deletedAt"
    >,
    ownerUsername?: string,
  ): Promise<Workspace> {
    const username = ownerUsername || this.ownerUsername;
    const workspaceNameSlug = this.generateSlug(props.name);

    const slug = workspaceNameSlug;

    let finalSlug = slug;
    let counter = 1;

    while (await this.workspaceRepository.findBySlug(finalSlug, props.ownerId)) {
      if (username) {
        finalSlug = `${username}/${workspaceNameSlug}-${counter}`;
      } else {
        finalSlug = `${workspaceNameSlug}-${counter}`;
      }
      counter++;
    }

    const workspace = Workspace.create({
      ...props,
      slug: finalSlug,
    });
    return this.workspaceRepository.create(workspace);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
