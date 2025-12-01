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

  private toDomain(prismaTask: PrismaTask & { subTasks?: PrismaTask[] }): Task {
    return new Task({
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
      estimatedTime: prismaTask.estimatedMinutes ?? undefined,
      createdAt: prismaTask.createdAt,
      updatedAt: prismaTask.updatedAt,
    });
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
      include: { subTasks: true },
    });
    if (!task) return null;
    return this.toDomain(task);
  }

  async findByCreatorId(creatorId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({ where: { creatorId } });
    return tasks.map((t) => this.toDomain(t));
  }

  async update(task: Task): Promise<void> {
    await this.save(task);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }
}
