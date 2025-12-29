import { Injectable } from '@nestjs/common';
import { BaseResourceGuard } from './base-resource.guard';

@Injectable()
export class CommentGuard extends BaseResourceGuard {
  protected async getWorkspaceId(request: any): Promise<string | null> {
    const commentId = request.params.id;

    if (!commentId) {
      // For create operations, extract from body
      const taskId = request.body?.taskId;
      if (!taskId) return null;

      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
        select: {
          project: {
            select: {
              workspaceId: true,
            },
          },
        },
      });

      if (!task) {
        return null;
      }

      return task.project.workspaceId;
    }

    // For update/delete operations, fetch comment
    const commentData = await this.prisma.comment.findUnique({
      where: { id: commentId },
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

    if (!commentData) {
      return null;
    }

    return commentData.task.project.workspaceId;
  }
}
