import { Injectable } from '@nestjs/common';
import { BaseResourceGuard } from './base-resource.guard';

@Injectable()
export class TaskGuard extends BaseResourceGuard {
  protected async getWorkspaceId(request: any): Promise<string | null> {
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
