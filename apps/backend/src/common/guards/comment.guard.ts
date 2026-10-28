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

      return task.project?.workspaceId ?? null;
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

    return commentData.task.project?.workspaceId ?? null;
  }

  /**
   * ODD 021: un comentario en una tarea express (sin proyecto) no tiene
   * workspace; autoriza por owner/assignee de la tarea.
   */
  protected async authorizeWithoutWorkspace(
    request: any,
    user: { id: string },
  ): Promise<boolean> {
    const commentId = request.params?.id;
    const taskId: string | undefined = commentId
      ? (
          await this.prisma.comment.findUnique({
            where: { id: commentId },
            select: { taskId: true },
          })
        )?.taskId
      : request.body?.taskId;
    if (!taskId) return false;

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { ownerId: true, assigneeId: true },
    });
    if (!task) return false;

    return task.ownerId === user.id || task.assigneeId === user.id;
  }
}
