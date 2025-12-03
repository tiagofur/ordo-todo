import { Injectable } from '@nestjs/common';
import {
  Task as PrismaTask,
  TaskStatus as PrismaTaskStatus,
  Priority as PrismaPriority,
} from '@prisma/client';
import {
  Task,
  TaskRepository,
  TaskStatus,
  TaskPriority,
} from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaService) { }

  private toDomain(prismaTask: PrismaTask & { subTasks?: PrismaTask[]; project?: any }): Task {
    const taskData: any = {
      id: prismaTask.id,
      title: prismaTask.title,
      description: prismaTask.description ?? undefined,
      status: this.mapStatusToDomain(prismaTask.status),
      priority: this.mapPriorityToDomain(prismaTask.priority),
      dueDate: prismaTask.dueDate ?? undefined,
      projectId: prismaTask.projectId,
      creatorId: prismaTask.creatorId,
      parentTaskId: prismaTask.parentTaskId ?? undefined,
      subTasks: prismaTask.subTasks?.map((st) => this.toDomain(st)),
      tags: (prismaTask as any).tags?.map((t: any) => ({
        id: t.tag.id,
        name: t.tag.name,
        color: t.tag.color,
        workspaceId: t.tag.workspaceId,
      })),
      estimatedTime: prismaTask.estimatedMinutes ?? undefined,
      createdAt: prismaTask.createdAt,
      updatedAt: prismaTask.updatedAt,
    };

    // Include project information if available
    if ((prismaTask as any).project) {
      taskData.project = {
        id: (prismaTask as any).project.id,
        name: (prismaTask as any).project.name,
        color: (prismaTask as any).project.color,
      };
    }

    return new Task(taskData);
  }

  private mapStatusToDomain(status: PrismaTaskStatus): TaskStatus {
    switch (status) {
      case 'TODO':
        return 'TODO';
      case 'IN_PROGRESS':
        return 'IN_PROGRESS';
      case 'COMPLETED':
        return 'COMPLETED';
      case 'CANCELLED':
        return 'CANCELLED';
      default:
        return 'TODO';
    }
  }

  private mapPriorityToDomain(priority: PrismaPriority): TaskPriority {
    switch (priority) {
      case 'LOW':
        return 'LOW';
      case 'MEDIUM':
        return 'MEDIUM';
      case 'HIGH':
        return 'HIGH';
      case 'URGENT':
        return 'URGENT';
      default:
        return 'MEDIUM';
    }
  }

  private mapStatusToPrisma(status: TaskStatus): PrismaTaskStatus {
    switch (status) {
      case 'TODO':
        return 'TODO';
      case 'IN_PROGRESS':
        return 'IN_PROGRESS';
      case 'COMPLETED':
        return 'COMPLETED';
      case 'CANCELLED':
        return 'CANCELLED';
      default:
        return 'TODO';
    }
  }

  private mapPriorityToPrisma(priority: TaskPriority): PrismaPriority {
    switch (priority) {
      case 'LOW':
        return 'LOW';
      case 'MEDIUM':
        return 'MEDIUM';
      case 'HIGH':
        return 'HIGH';
      case 'URGENT':
        return 'URGENT';
      default:
        return 'MEDIUM';
    }
  }

  async save(task: Task): Promise<void> {
    const data = {
      id: task.id as string,
      title: task.props.title,
      description: task.props.description,
      status: this.mapStatusToPrisma(task.props.status),
      priority: this.mapPriorityToPrisma(task.props.priority),
      dueDate: task.props.dueDate,
      estimatedMinutes: task.props.estimatedTime,
      projectId: task.props.projectId,
      creatorId: task.props.creatorId,
      parentTaskId: task.props.parentTaskId ?? null,
    };

    await this.prisma.task.upsert({
      where: { id: task.id as string },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        subTasks: true,
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });
    if (!task) return null;
    return this.toDomain(task);
  }

  async findByCreatorId(
    creatorId: string,
    filters?: { projectId?: string; tags?: string[] },
  ): Promise<Task[]> {
    const where: any = { creatorId };

    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.tags = {
        some: {
          tagId: {
            in: filters.tags,
          },
        },
      };
    }

    const tasks = await this.prisma.task.findMany({
      where,
      include: {
        subTasks: true,
        tags: {
          include: { tag: true },
        },
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });
    return tasks.map((t) => this.toDomain(t));
  }

  async update(task: Task): Promise<void> {
    const data = {
      title: task.props.title,
      description: task.props.description,
      status: this.mapStatusToPrisma(task.props.status),
      priority: this.mapPriorityToPrisma(task.props.priority),
      dueDate: task.props.dueDate,
      estimatedMinutes: task.props.estimatedTime,
      projectId: task.props.projectId,
      creatorId: task.props.creatorId,
      parentTaskId: task.props.parentTaskId ?? null,
    };

    console.log(`[PrismaTaskRepository] Updating task ${task.id}`, {
      originalStatus: task.props.status,
      mappedStatus: data.status,
      data
    });

    await this.prisma.task.update({
      where: { id: task.id as string },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }
}
