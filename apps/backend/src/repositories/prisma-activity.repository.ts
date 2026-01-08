import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  Activity,
  ActivityRepository,
  CreateActivityInput,
} from '@ordo-todo/core';

/**
 * Prisma implementation of ActivityRepository
 * Manages activity logging for task audit trails
 */
@Injectable()
export class PrismaActivityRepository implements ActivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async logActivity(input: CreateActivityInput): Promise<Activity> {
    const data = await this.prisma.activity.create({
      data: {
        taskId: input.taskId,
        userId: input.userId,
        type: input.type,
        metadata: input.metadata as any,
      },
    });

    return this.toDomain(data);
  }

  async getTaskActivities(
    taskId: string,
    limit: number = 50,
  ): Promise<Activity[]> {
    const activities = await this.prisma.activity.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return activities.map((a) => this.toDomain(a));
  }

  async getUserActivities(
    userId: string,
    limit: number = 50,
  ): Promise<Activity[]> {
    const activities = await this.prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return activities.map((a) => this.toDomain(a));
  }

  async getActivitiesByType(
    type: any,
    limit: number = 50,
  ): Promise<Activity[]> {
    const activities = await this.prisma.activity.findMany({
      where: { type },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return activities.map((a) => this.toDomain(a));
  }

  async getActivitiesByDateRange(
    startDate: Date,
    endDate: Date,
    taskId?: string,
  ): Promise<Activity[]> {
    const activities = await this.prisma.activity.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        ...(taskId && { taskId }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return activities.map((a) => this.toDomain(a));
  }

  async deleteOldActivities(beforeDate: Date): Promise<number> {
    const result = await this.prisma.activity.deleteMany({
      where: {
        createdAt: {
          lt: beforeDate,
        },
      },
    });

    return result.count;
  }

  /**
   * Convert Prisma model to domain entity
   */
  private toDomain(prismaActivity: any): Activity {
    return new Activity({
      id: prismaActivity.id,
      taskId: prismaActivity.taskId,
      userId: prismaActivity.userId,
      type: prismaActivity.type,
      metadata: prismaActivity.metadata,
      createdAt: prismaActivity.createdAt,
    });
  }
}
