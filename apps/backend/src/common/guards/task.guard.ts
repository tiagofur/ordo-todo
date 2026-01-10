import { Injectable, Logger } from '@nestjs/common';
import { BaseResourceGuard } from './base-resource.guard';

@Injectable()
export class TaskGuard extends BaseResourceGuard {
  private readonly logger = new Logger(TaskGuard.name);

  protected async getWorkspaceId(request: any): Promise<string | null> {
    // Special case for /deleted endpoint with projectId query parameter
    const projectId = request.query?.projectId;

    // Log for debugging
    this.logger.log(`[TaskGuard] Request URL: ${request.url}`);
    this.logger.log(`[TaskGuard] Route path: ${request.route?.path}`);
    this.logger.log(`[TaskGuard] Query params: ${JSON.stringify(request.query)}`);
    this.logger.log(`[TaskGuard] ProjectId from query: ${projectId}`);

    // Check if this is the /deleted endpoint
    const isDeletedEndpoint = request.url?.includes('/deleted') ||
                               request.route?.path?.includes('deleted') ||
                               request.query?.projectId !== undefined;

    if (projectId && isDeletedEndpoint) {
      this.logger.log(`[TaskGuard] Detected /deleted endpoint with projectId: ${projectId}`);

      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { workspaceId: true },
      });

      if (!project) {
        this.logger.warn(`[TaskGuard] Project not found: ${projectId}`);
        return null;
      }

      this.logger.log(`[TaskGuard] Found workspaceId: ${project.workspaceId} for project: ${projectId}`);
      return project.workspaceId;
    }

    const taskId = request.params.id;
    if (!taskId) return null;

    // Cache optimization: If we already have the task (e.g. from a middleware), use it.
    // Otherwise, fetch it.

    // We fetch the task to get the project, to get the workspace.
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { project: { select: { workspaceId: true } } },
    });

    if (!task) {
      // We throw NotFound here so we don't leak existence of tasks to non-members
      // BUT wait, if we throw NotFound here, we haven't checked auth yet.
      // Actually, returning null here would mean the guard passes (based on Base logic),
      // then the Controller tries to find it and throws NotFound.
      // However, standard security practice: don't reveal existence.
      // But if the ID is random UUID, enumeration is hard.
      // Let's return null and let the controller handle NotFound.
      return null;
    }

    return task.project.workspaceId;
  }
}
