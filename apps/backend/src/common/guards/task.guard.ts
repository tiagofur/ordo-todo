import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
    this.logger.log(
      `[TaskGuard] Query params: ${JSON.stringify(request.query)}`,
    );
    this.logger.log(`[TaskGuard] ProjectId from query: ${projectId}`);

    // Check if this is the /deleted endpoint
    const isDeletedEndpoint =
      request.url?.includes('/deleted') ||
      request.route?.path?.includes('deleted') ||
      request.query?.projectId !== undefined;

    if (projectId && isDeletedEndpoint) {
      this.logger.log(
        `[TaskGuard] Detected /deleted endpoint with projectId: ${projectId}`,
      );

      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { workspaceId: true },
      });

      if (!project) {
        this.logger.warn(`[TaskGuard] Project not found: ${projectId}`);
        return null;
      }

      this.logger.log(
        `[TaskGuard] Found workspaceId: ${project.workspaceId} for project: ${projectId}`,
      );
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
      throw new NotFoundException('Task not found');
    }

    // ODD 021: task without project ("express") has no workspace context;
    // falls through to authorizeWithoutWorkspace (owner/assignee check).
    return task.project?.workspaceId ?? null;
  }

  /**
   * ODD 021: authorization fallback when no workspace can be resolved.
   *
   * - `GET /tasks/deleted` without `?projectId=`: allowed for any
   *   authenticated user; the service only ever returns the caller's own
   *   deleted express tasks.
   * - Task-scoped routes on a task without project ("express"): owner or
   *   assignee only — express tasks never inherit workspace memberships.
   */
  protected async authorizeWithoutWorkspace(
    request: any,
    user: { id: string },
  ): Promise<boolean> {
    const isDeletedEndpoint =
      request.route?.path?.includes('deleted') ||
      request.url?.includes('/deleted');
    if (isDeletedEndpoint && request.query?.projectId === undefined) {
      return true;
    }

    const taskId = request.params?.id;
    if (!taskId) return false;

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { ownerId: true, assigneeId: true },
    });
    if (!task) return false;

    return task.ownerId === user.id || task.assigneeId === user.id;
  }
}
