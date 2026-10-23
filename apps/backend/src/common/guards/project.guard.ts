import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseResourceGuard } from './base-resource.guard';

@Injectable()
export class ProjectGuard extends BaseResourceGuard {
  protected async getWorkspaceId(request: any): Promise<string | null> {
    const projectId = request.params.id;
    const workspaceSlug = request.params.workspaceSlug;

    // If workspaceSlug is present (for /by-slug/:workspaceSlug/:projectSlug endpoint)
    if (workspaceSlug) {
      const userId = request.user?.id;
      const workspace = await this.prisma.workspace.findFirst({
        where: {
          slug: workspaceSlug,
          isDeleted: false,
          ...(userId
            ? {
                OR: [{ ownerId: userId }, { members: { some: { userId } } }],
              }
            : {}),
        },
        select: { id: true },
      });
      return workspace?.id || null;
    }

    // Check if it's a create request with workspaceId in body
    if (!projectId) {
      if (request.body && request.body.workspaceId) {
        return request.body.workspaceId;
      }
      if (request.query && request.query.workspaceId) {
        return request.query.workspaceId;
      }
      return null;
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { workspaceId: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project.workspaceId;
  }
}
