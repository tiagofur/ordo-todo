import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma, ConsistencyScore, ConsistencyPeriod } from '@prisma/client';

@Injectable()
export class ConsistencyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(
    userId: string,
    date: Date,
    periodType: ConsistencyPeriod,
    data: Partial<{
      score: number;
      contentPublished: number;
      targetContent: number;
      currentStreak: number;
      longestStreak: number;
      platformBreakdown: Prisma.InputJsonValue;
    }>,
  ): Promise<ConsistencyScore> {
    const dateOnly = new Date(date.toISOString().split('T')[0]);

    return this.prisma.consistencyScore.upsert({
      where: {
        userId_date_periodType: {
          userId,
          date: dateOnly,
          periodType,
        },
      },
      create: {
        userId,
        date: dateOnly,
        periodType,
        ...data,
      },
      update: data,
    });
  }

  async findLatest(
    userId: string,
    periodType: ConsistencyPeriod,
  ): Promise<ConsistencyScore | null> {
    return this.prisma.consistencyScore.findFirst({
      where: { userId, periodType },
      orderBy: { date: 'desc' },
    });
  }

  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    periodType?: ConsistencyPeriod,
  ): Promise<ConsistencyScore[]> {
    return this.prisma.consistencyScore.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        ...(periodType && { periodType }),
      },
      orderBy: { date: 'desc' },
    });
  }

  async getPublishedCountByPeriod(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return this.prisma.socialPost.count({
      where: {
        userId,
        status: 'PUBLISHED',
        publishedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  async getPublishedByPlatform(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>> {
    const result = await this.prisma.socialPost.groupBy({
      by: ['platform'],
      where: {
        userId,
        status: 'PUBLISHED',
        publishedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    });

    return result.reduce(
      (acc, item) => {
        acc[item.platform] = item._count.id;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  async getTotalPublished(userId: string): Promise<number> {
    return this.prisma.socialPost.count({
      where: {
        userId,
        status: 'PUBLISHED',
      },
    });
  }
}
