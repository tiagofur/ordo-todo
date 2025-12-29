import { Injectable } from '@nestjs/common';
import { BaseResourceGuard } from './base-resource.guard';

@Injectable()
export class AttachmentGuard extends BaseResourceGuard {
  protected async getWorkspaceId(request: any): Promise<string | null> {
    const attachmentId = request.params.id;

    if (!attachmentId) {
      return null;
    }

    // Fetch attachment with task->project->workspace
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: {
        task: {
          include: {
            project: {
              select: {
                workspaceId: true,
              },
            },
          },
        },
      },
    });

    if (!attachment) {
      return null;
    }

    return attachment.task.project.workspaceId;
  }
}
