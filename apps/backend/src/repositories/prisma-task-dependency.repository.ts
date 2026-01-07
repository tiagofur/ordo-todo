import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  TaskDependency,
  TaskDependencyRepository,
  TaskDependencyInput,
} from '@ordo-todo/core';

/**
 * Prisma implementation of TaskDependencyRepository
 * Manages task dependencies and blocking relationships
 */
@Injectable()
export class PrismaTaskDependencyRepository implements TaskDependencyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: TaskDependencyInput): Promise<TaskDependency> {
    const data = await this.prisma.taskDependency.create({
      data: {
        blockingTaskId: input.blockingTaskId,
        blockedTaskId: input.blockedTaskId,
      },
    });

    return this.toDomain(data);
  }

  async findById(id: string): Promise<TaskDependency | null> {
    const data = await this.prisma.taskDependency.findUnique({
      where: { id },
    });

    return data ? this.toDomain(data) : null;
  }

  async findBlockingTasks(taskId: string): Promise<TaskDependency[]> {
    const dependencies = await this.prisma.taskDependency.findMany({
      where: { blockedTaskId: taskId },
    });

    return dependencies.map((d) => this.toDomain(d));
  }

  async findBlockedTasks(taskId: string): Promise<TaskDependency[]> {
    const dependencies = await this.prisma.taskDependency.findMany({
      where: { blockingTaskId: taskId },
    });

    return dependencies.map((d) => this.toDomain(d));
  }

  async exists(
    blockingTaskId: string,
    blockedTaskId: string,
  ): Promise<boolean> {
    const dependency = await this.prisma.taskDependency.findUnique({
      where: {
        blockingTaskId_blockedTaskId: {
          blockingTaskId,
          blockedTaskId,
        },
      },
    });

    return !!dependency;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.taskDependency.delete({
      where: { id },
    });
  }

  async deleteByTaskId(taskId: string): Promise<number> {
    const result = await this.prisma.taskDependency.deleteMany({
      where: {
        OR: [{ blockingTaskId: taskId }, { blockedTaskId: taskId }],
      },
    });

    return result.count;
  }

  async hasDependencies(taskId: string): Promise<boolean> {
    const count = await this.prisma.taskDependency.count({
      where: {
        OR: [{ blockingTaskId: taskId }, { blockedTaskId: taskId }],
      },
    });

    return count > 0;
  }

  /**
   * Convert Prisma model to domain entity
   */
  private toDomain(prismaDependency: any): TaskDependency {
    return new TaskDependency({
      id: prismaDependency.id,
      blockingTaskId: prismaDependency.blockingTaskId,
      blockedTaskId: prismaDependency.blockedTaskId,
      createdAt: prismaDependency.createdAt,
    });
  }
}
