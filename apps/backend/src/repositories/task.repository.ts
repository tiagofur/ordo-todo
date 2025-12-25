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
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(
    prismaTask: PrismaTask & {
      subTasks?: PrismaTask[];
      project?: any;
      assignee?: any;
      creator?: any;
      recurrence?: any;
    },
  ): Task {
    const taskData: any = {
      id: prismaTask.id,
      title: prismaTask.title,
      description: prismaTask.description ?? undefined,
      status: this.mapStatusToDomain(prismaTask.status),
      priority: this.mapPriorityToDomain(prismaTask.priority),
      dueDate: prismaTask.dueDate ?? undefined,
      startDate: prismaTask.startDate ?? undefined,
      scheduledDate: prismaTask.scheduledDate ?? undefined,
      scheduledTime: prismaTask.scheduledTime ?? undefined,
      scheduledEndTime: prismaTask.scheduledEndTime ?? undefined,
      isTimeBlocked: prismaTask.isTimeBlocked,
      projectId: prismaTask.projectId,
      creatorId: prismaTask.creatorId,
      assigneeId: prismaTask.assigneeId ?? undefined,
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
      recurrence: prismaTask.recurrence
        ? {
            pattern: prismaTask.recurrence.pattern,
            interval: prismaTask.recurrence.interval,
            daysOfWeek: prismaTask.recurrence.daysOfWeek,
            dayOfMonth: prismaTask.recurrence.dayOfMonth,
            endDate: prismaTask.recurrence.endDate,
          }
        : undefined,
    };

    // Include project information if available
    if ((prismaTask as any).project) {
      taskData.project = {
        id: (prismaTask as any).project.id,
        name: (prismaTask as any).project.name,
        color: (prismaTask as any).project.color,
      };
    }

    // Include assignee information if available
    if ((prismaTask as any).assignee) {
      taskData.assignee = {
        id: (prismaTask as any).assignee.id,
        name: (prismaTask as any).assignee.name,
        image: (prismaTask as any).assignee.image,
      };
    }

    // Include creator information if available
    if ((prismaTask as any).creator) {
      taskData.creator = {
        id: (prismaTask as any).creator.id,
        name: (prismaTask as any).creator.name,
        image: (prismaTask as any).creator.image,
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
    const data: any = {
      id: task.id as string,
      title: task.props.title,
      description: task.props.description,
      status: this.mapStatusToPrisma(task.props.status),
      priority: this.mapPriorityToPrisma(task.props.priority),
      dueDate: task.props.dueDate,
      startDate: task.props.startDate,
      scheduledDate: task.props.scheduledDate,
      scheduledTime: task.props.scheduledTime,
      scheduledEndTime: task.props.scheduledEndTime,
      isTimeBlocked: task.props.isTimeBlocked,
      estimatedMinutes: task.props.estimatedTime,
      projectId: task.props.projectId,
      creatorId: task.props.creatorId,
      parentTaskId: task.props.parentTaskId ?? null,
    };

    if (task.props.recurrence) {
      data.recurrence = {
        create: {
          pattern: task.props.recurrence.pattern,
          interval: task.props.recurrence.interval,
          daysOfWeek: task.props.recurrence.daysOfWeek,
          dayOfMonth: task.props.recurrence.dayOfMonth,
          endDate: task.props.recurrence.endDate,
        },
      };
    }

    await this.prisma.task.upsert({
      where: { id: task.id as string },
      create: data,
      update: {
        ...data,
        recurrence: task.props.recurrence
          ? {
              upsert: {
                create: {
                  pattern: task.props.recurrence.pattern,
                  interval: task.props.recurrence.interval,
                  daysOfWeek: task.props.recurrence.daysOfWeek,
                  dayOfMonth: task.props.recurrence.dayOfMonth,
                  endDate: task.props.recurrence.endDate,
                },
                update: {
                  pattern: task.props.recurrence.pattern,
                  interval: task.props.recurrence.interval,
                  daysOfWeek: task.props.recurrence.daysOfWeek,
                  dayOfMonth: task.props.recurrence.dayOfMonth,
                  endDate: task.props.recurrence.endDate,
                },
              },
            }
          : undefined,
      },
    });
  }

  async findById(id: string): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        subTasks: true,
        recurrence: true,
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
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
        recurrence: true,
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
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    return tasks.map((t) => this.toDomain(t));
  }

  async update(task: Task): Promise<void> {
    const data: any = {
      title: task.props.title,
      description: task.props.description,
      status: this.mapStatusToPrisma(task.props.status),
      priority: this.mapPriorityToPrisma(task.props.priority),
      dueDate: task.props.dueDate,
      startDate: task.props.startDate,
      scheduledDate: task.props.scheduledDate,
      scheduledTime: task.props.scheduledTime,
      scheduledEndTime: task.props.scheduledEndTime,
      isTimeBlocked: task.props.isTimeBlocked,
      estimatedMinutes: task.props.estimatedTime,
      projectId: task.props.projectId,
      creatorId: task.props.creatorId,
      parentTaskId: task.props.parentTaskId ?? null,
    };

    // Handle assigneeId - only include if explicitly set (even if null to unassign)
    if (task.props.assigneeId !== undefined) {
      data.assigneeId = task.props.assigneeId;
    }

    await this.prisma.task.update({
      where: { id: task.id as string },
      data: {
        ...data,
        recurrence: task.props.recurrence
          ? {
              upsert: {
                create: {
                  pattern: task.props.recurrence.pattern,
                  interval: task.props.recurrence.interval,
                  daysOfWeek: task.props.recurrence.daysOfWeek,
                  dayOfMonth: task.props.recurrence.dayOfMonth,
                  endDate: task.props.recurrence.endDate,
                },
                update: {
                  pattern: task.props.recurrence.pattern,
                  interval: task.props.recurrence.interval,
                  daysOfWeek: task.props.recurrence.daysOfWeek,
                  dayOfMonth: task.props.recurrence.dayOfMonth,
                  endDate: task.props.recurrence.endDate,
                },
              },
            }
          : undefined,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }
}
