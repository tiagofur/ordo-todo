import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseResourceGuard } from './base-resource.guard';

/**
 * Authorization for custom-field routes.
 *
 * Resolves the workspace through the project (`:projectId`), the field
 * (`:id` -> field.project) or the task (`:taskId` -> task.project), then
 * defers to {@link BaseResourceGuard} for the membership check.
 * Express tasks without project fall back to the owner/assignee check.
 */
@Injectable()
export class CustomFieldGuard extends BaseResourceGuard {
  protected async getWorkspaceId(request: any): Promise<string | null> {
    const projectId: string | undefined = request.params?.projectId;
    if (projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { workspaceId: true },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      return project.workspaceId;
    }

    const fieldId: string | undefined = request.params?.id;
    if (fieldId) {
      const field = await this.prisma.customField.findUnique({
        where: { id: fieldId },
        select: { project: { select: { workspaceId: true } } },
      });

      if (!field) {
        throw new NotFoundException('Custom field not found');
      }

      return field.project.workspaceId;
    }

    const taskId: string | undefined = request.params?.taskId;
    if (taskId) {
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
        select: {
          ownerId: true,
          assigneeId: true,
          project: { select: { workspaceId: true } },
        },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      return task.project?.workspaceId ?? null;
    }

    return null;
  }

  protected async authorizeWithoutWorkspace(
    request: any,
    user: { id: string },
  ): Promise<boolean> {
    const taskId: string | undefined = request.params?.taskId;
    if (!taskId) return false;

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { ownerId: true, assigneeId: true },
    });
    if (!task) return false;

    return task.ownerId === user.id || task.assigneeId === user.id;
  }
}
