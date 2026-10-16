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
    let finalSlug = workspaceNameSlug;
    let counter = 1;

    // Check for slug uniqueness within the owner's context
    if (props.ownerId) {
      const checkExists = async (slugToCheck: string): Promise<boolean> => {
        if (this.workspaceRepository.slugExistsForOwner) {
          return this.workspaceRepository.slugExistsForOwner(slugToCheck, props.ownerId!);
        }
        const existing = await this.workspaceRepository.findBySlug(slugToCheck, props.ownerId!);
        return !!existing;
      };

      while (await checkExists(finalSlug)) {
        finalSlug = `${workspaceNameSlug}-${counter}`;
        counter++;
      }
    }

    const workspace = Workspace.create({
      ...props,
      slug: finalSlug,
    });
    return this.workspaceRepository.create(workspace);
  }

  private generateSlug(name: string): string {
    const slug = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return slug || "workspace";
  }
}
