import { Injectable } from '@nestjs/common';
import { BaseResourceGuard } from './base-resource.guard';

/**
 * Resolves the workspace behind an attachment route and defers to
 * BaseResourceGuard for the membership check. The id is taken from, in order,
 * the attachment (`/:id`), the project (`/project/:projectId`) or the task in
 * the body (`POST /`).
 */
@Injectable()
export class AttachmentGuard extends BaseResourceGuard {
  protected async getWorkspaceId(request: any): Promise<string | null> {
    const attachmentId: string | undefined = request.params?.id;
    const projectId: string | undefined = request.params?.projectId;
    const taskId: string | undefined = request.body?.taskId;

    if (attachmentId) {
      const attachment = await this.prisma.attachment.findUnique({
        where: { id: attachmentId },
        select: {
          task: { select: { project: { select: { workspaceId: true } } } },
        },
      });
      return attachment?.task.project.workspaceId ?? null;
    }

    if (projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { workspaceId: true },
      });
      return project?.workspaceId ?? null;
    }

    if (taskId) {
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
        select: { project: { select: { workspaceId: true } } },
      });
      return task?.project.workspaceId ?? null;
    }

    return null;
  }
}
