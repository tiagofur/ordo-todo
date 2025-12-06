import { Injectable } from '@nestjs/common';
import { DailyMetrics as PrismaDailyMetrics } from '@prisma/client';
import { DailyMetrics, AnalyticsRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) { }

  private toDomain(prismaMetrics: PrismaDailyMetrics): DailyMetrics {
    return new DailyMetrics({
      id: prismaMetrics.id,
      userId: prismaMetrics.userId,
      date: prismaMetrics.date,
      tasksCreated: prismaMetrics.tasksCreated,
      tasksCompleted: prismaMetrics.tasksCompleted,
      subtasksCompleted: prismaMetrics.subtasksCompleted ?? 0,
      minutesWorked: prismaMetrics.minutesWorked,
      pomodorosCompleted: prismaMetrics.pomodorosCompleted,
      shortBreaksCompleted: (prismaMetrics as any).shortBreaksCompleted ?? 0,
      longBreaksCompleted: (prismaMetrics as any).longBreaksCompleted ?? 0,
      breakMinutes: (prismaMetrics as any).breakMinutes ?? 0,
      focusScore: prismaMetrics.focusScore ?? undefined,
      createdAt: prismaMetrics.createdAt,
    });
  }

  async save(metrics: DailyMetrics): Promise<void> {
    const data = {
      userId: metrics.props.userId,
      date: metrics.props.date,
      tasksCreated: metrics.props.tasksCreated,
      tasksCompleted: metrics.props.tasksCompleted,
      subtasksCompleted: metrics.props.subtasksCompleted,
      minutesWorked: metrics.props.minutesWorked,
      pomodorosCompleted: metrics.props.pomodorosCompleted,
      shortBreaksCompleted: metrics.props.shortBreaksCompleted,
      longBreaksCompleted: metrics.props.longBreaksCompleted,
      breakMinutes: metrics.props.breakMinutes,
      focusScore: metrics.props.focusScore,
    };

    await this.prisma.dailyMetrics.upsert({
      where: {
        userId_date: {
          userId: metrics.props.userId,
          date: metrics.props.date,
        },
      },
      create: data,
      update: data,
    });
  }

  async findByDate(userId: string, date: Date): Promise<DailyMetrics | null> {
    const metrics = await this.prisma.dailyMetrics.findUnique({
      where: {
        userId_date: {
          userId,
          date: date,
        },
      },
    });

    if (!metrics) return null;
    return this.toDomain(metrics);
  }

  async getRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DailyMetrics[]> {
    const metrics = await this.prisma.dailyMetrics.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return metrics.map((m) => this.toDomain(m));
  }
}
