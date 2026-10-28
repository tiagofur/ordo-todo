import { Injectable } from '@nestjs/common';
import { BaseResourceGuard } from './base-resource.guard';

@Injectable()
export class CreateTaskGuard extends BaseResourceGuard {
  protected async getWorkspaceId(request: any): Promise<string | null> {
    const projectId = request.body.projectId;
    if (!projectId) return null;

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { workspaceId: true },
    });

    if (!project) return null;

    return project.workspaceId;
  }

  /**
   * ODD 021: creating a task without projectId is allowed — it becomes a
   * personal "express" task of the authenticated user. A projectId that was
   * provided but fails to resolve keeps the default deny (project not found).
   */
  protected async authorizeWithoutWorkspace(request: any): Promise<boolean> {
    return !request.body?.projectId;
  }
}
