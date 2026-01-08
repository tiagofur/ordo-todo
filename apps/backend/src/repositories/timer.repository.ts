import { Injectable } from '@nestjs/common';
import {
  TimeSession as PrismaTimeSession,
  SessionType as PrismaSessionType,
} from '@prisma/client';
import {
  TimeSession,
  TimerRepository,
  SessionType,
  SessionFilters,
  PaginationParams,
  PaginatedSessions,
  SessionStats,
} from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaTimerRepository implements TimerRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaSession: PrismaTimeSession): TimeSession {
    // console.log('toDomain processing session:', prismaSession.id);
    const rawPauseData = prismaSession.pauseData;
    let pauseData: { startedAt: Date; endedAt: Date; duration: number }[] = [];
    let currentPauseStart: Date | undefined = undefined;

    try {
      if (
        rawPauseData &&
        typeof rawPauseData === 'object' &&
        !Array.isArray(rawPauseData)
      ) {
        const data = rawPauseData as Record<string, any>;
        if (Array.isArray(data.pauses)) {
          pauseData = data.pauses
            .filter((p: any) => p && p.startedAt && p.endedAt)
            .map((item: unknown) => {
              const p = item as {
                startedAt: string | Date;
                endedAt: string | Date;
                duration: number | string;
              };
              return {
                startedAt: new Date(p.startedAt),
                endedAt: new Date(p.endedAt),
                duration: Number(p.duration || 0),
              };
            });
        }
        if (data.currentPauseStart) {
          currentPauseStart = new Date(data.currentPauseStart as string);
        }
      } else if (Array.isArray(rawPauseData)) {
        pauseData = rawPauseData
          .filter((p: any) => p && p.startedAt && p.endedAt)
          .map((item: unknown) => {
            const p = item as {
              startedAt: string | Date;
              endedAt: string | Date;
              duration: number | string;
            };
            return {
              startedAt: new Date(p.startedAt),
              endedAt: new Date(p.endedAt),
              duration: Number(p.duration || 0),
            };
          });
      }
    } catch (error) {
      console.error(
        'Error parsing pauseData for session:',
        prismaSession.id,
        error,
      );
      pauseData = [];
      currentPauseStart = undefined;
    }

    return new TimeSession({
      id: prismaSession.id,
      taskId: prismaSession.taskId ?? undefined,
      userId: prismaSession.userId,
      startedAt: prismaSession.startedAt,
      endedAt: prismaSession.endedAt ?? undefined,
      duration: prismaSession.duration ?? undefined,
      type: this.mapTypeToDomain(prismaSession.type),
      wasCompleted: prismaSession.wasCompleted,
      wasInterrupted: prismaSession.wasInterrupted,
      pauseCount: prismaSession.pauseCount,
      totalPauseTime: prismaSession.totalPauseTime,
      pauseData: pauseData,
      currentPauseStart: currentPauseStart,
      parentSessionId: prismaSession.parentSessionId ?? undefined,
      splitReason: prismaSession.splitReason ?? undefined,
      createdAt: prismaSession.createdAt,
    });
  }

  private mapTypeToDomain(type: PrismaSessionType): SessionType {
    switch (type) {
      case PrismaSessionType.WORK:
        return 'WORK';
      case PrismaSessionType.SHORT_BREAK:
        return 'SHORT_BREAK';
      case PrismaSessionType.LONG_BREAK:
        return 'LONG_BREAK';
      case PrismaSessionType.CONTINUOUS:
        return 'CONTINUOUS';
      default:
        return 'WORK';
    }
  }

  private mapTypeToPrisma(type: SessionType): PrismaSessionType {
    switch (type) {
      case 'WORK':
        return PrismaSessionType.WORK;
      case 'SHORT_BREAK':
        return PrismaSessionType.SHORT_BREAK;
      case 'LONG_BREAK':
        return PrismaSessionType.LONG_BREAK;
      case 'CONTINUOUS':
        return PrismaSessionType.CONTINUOUS;
      default:
        return PrismaSessionType.WORK;
    }
  }

  async create(session: TimeSession): Promise<TimeSession> {
    const pauseDataToStore = {
      pauses:
        session.props.pauseData?.map((p) => ({
          startedAt: p.startedAt.toISOString(),
          endedAt: p.endedAt.toISOString(),
          duration: p.duration,
        })) ?? [],
      currentPauseStart: session.props.currentPauseStart?.toISOString() ?? null,
    };

    const data: any = {
      id: session.id,
      userId: session.props.userId,
      startedAt: session.props.startedAt,
      type: this.mapTypeToPrisma(session.props.type),
      wasCompleted: session.props.wasCompleted,
      wasInterrupted: session.props.wasInterrupted,
      pauseCount: session.props.pauseCount ?? 0,
      totalPauseTime: session.props.totalPauseTime ?? 0,
      pauseData: pauseDataToStore,
    };

    // Add optional fields only if they have values
    if (session.props.taskId !== undefined) {
      data.taskId = session.props.taskId;
    }
    if (session.props.parentSessionId !== undefined) {
      data.parentSessionId = session.props.parentSessionId;
    }
    if (session.props.splitReason !== undefined) {
      data.splitReason = session.props.splitReason;
    }

    const created = await this.prisma.timeSession.create({
      data,
    });

    return this.toDomain(created);
  }

  async update(session: TimeSession): Promise<TimeSession> {
    const pauseDataToStore = {
      pauses:
        session.props.pauseData?.map((p) => ({
          startedAt: p.startedAt.toISOString(),
          endedAt: p.endedAt.toISOString(),
          duration: p.duration,
        })) ?? [],
      currentPauseStart: session.props.currentPauseStart?.toISOString() ?? null,
    };

    const data = {
      endedAt: session.props.endedAt,
      duration: session.props.duration,
      wasCompleted: session.props.wasCompleted,
      wasInterrupted: session.props.wasInterrupted,
      pauseCount: session.props.pauseCount,
      totalPauseTime: session.props.totalPauseTime,
      pauseData: pauseDataToStore,
      splitReason: session.props.splitReason,
    };

    const updated = await this.prisma.timeSession.update({
      where: { id: session.id },
      data: data,
    });

    return this.toDomain(updated);
  }

  async findById(id: string): Promise<TimeSession | null> {
    const session = await this.prisma.timeSession.findUnique({ where: { id } });
    if (!session) return null;
    return this.toDomain(session);
  }

  async findActiveSession(userId: string): Promise<TimeSession | null> {
    const session = await this.prisma.timeSession.findFirst({
      where: {
        userId,
        endedAt: null,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });
    if (!session) return null;
    return this.toDomain(session);
  }

  async findByTaskId(taskId: string): Promise<TimeSession[]> {
    const sessions = await this.prisma.timeSession.findMany({
      where: { taskId },
    });
    return sessions.map((s) => this.toDomain(s));
  }

  async findByUserId(userId: string): Promise<TimeSession[]> {
    const sessions = await this.prisma.timeSession.findMany({
      where: { userId },
    });
    return sessions.map((s) => this.toDomain(s));
  }

  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TimeSession[]> {
    const sessions = await this.prisma.timeSession.findMany({
      where: {
        userId,
        startedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        startedAt: 'asc',
      },
    });
    return sessions.map((s) => this.toDomain(s));
  }

  async findWithFilters(
    userId: string,
    filters: SessionFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedSessions> {
    const where: any = { userId };

    if (filters.taskId) {
      where.taskId = filters.taskId;
    }

    if (filters.type) {
      where.type = this.mapTypeToPrisma(filters.type);
    }

    if (filters.startDate || filters.endDate) {
      where.startedAt = {};
      if (filters.startDate) {
        where.startedAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.startedAt.lte = filters.endDate;
      }
    }

    if (filters.completedOnly) {
      where.wasCompleted = true;
      where.endedAt = { not: null };
    }

    const [sessions, total] = await Promise.all([
      this.prisma.timeSession.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      this.prisma.timeSession.count({ where }),
    ]);

    return {
      sessions: sessions.map((s) => this.toDomain(s)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async getStats(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<SessionStats> {
    const where: any = {
      userId,
      endedAt: { not: null }, // Only completed sessions
    };

    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) {
        where.startedAt.gte = startDate;
      }
      if (endDate) {
        where.startedAt.lte = endDate;
      }
    }

    const sessions = await this.prisma.timeSession.findMany({ where });

    const stats: SessionStats = {
      totalSessions: sessions.length,
      totalWorkSessions: 0,
      totalBreakSessions: 0,
      totalMinutesWorked: 0,
      totalBreakMinutes: 0,
      pomodorosCompleted: 0,
      totalPauses: 0,
      totalPauseSeconds: 0,
      completedSessions: 0,
      byType: {
        WORK: { count: 0, totalMinutes: 0 },
        SHORT_BREAK: { count: 0, totalMinutes: 0 },
        LONG_BREAK: { count: 0, totalMinutes: 0 },
        CONTINUOUS: { count: 0, totalMinutes: 0 },
      },
    };

    for (const session of sessions) {
      const duration = session.duration ?? 0;
      const type = this.mapTypeToDomain(session.type);

      stats.byType[type].count++;
      stats.byType[type].totalMinutes += duration;

      if (type === 'WORK' || type === 'CONTINUOUS') {
        stats.totalWorkSessions++;
        stats.totalMinutesWorked += duration;
        if (session.wasCompleted && type === 'WORK') {
          stats.pomodorosCompleted++;
        }
      } else {
        stats.totalBreakSessions++;
        stats.totalBreakMinutes += duration;
      }

      if (session.wasCompleted) {
        stats.completedSessions++;
      }

      stats.totalPauses += session.pauseCount;
      stats.totalPauseSeconds += session.totalPauseTime;
    }

    return stats;
  }

  async getTaskTimeStats(
    userId: string,
    taskId: string,
  ): Promise<{
    totalSessions: number;
    totalMinutes: number;
    completedSessions: number;
    lastSessionAt?: Date;
  }> {
    const sessions = await this.prisma.timeSession.findMany({
      where: {
        userId,
        taskId,
        endedAt: { not: null },
      },
      orderBy: { startedAt: 'desc' },
    });

    return {
      totalSessions: sessions.length,
      totalMinutes: sessions.reduce((acc, s) => acc + (s.duration ?? 0), 0),
      completedSessions: sessions.filter((s) => s.wasCompleted).length,
      lastSessionAt: sessions[0]?.startedAt,
    };
  }

  async findByUserIdWithTaskAndProject(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<
    Array<{
      id: string;
      startedAt: Date;
      duration: number | null;
      task: {
        id: string;
        project: {
          name: string;
        } | null;
      } | null;
    }>
  > {
    const sessions = await this.prisma.timeSession.findMany({
      where: {
        userId,
        startedAt: { gte: startDate, lte: endDate },
      },
      include: {
        task: {
          include: { project: true },
        },
      },
    });

    return sessions.map((s) => ({
      id: s.id,
      startedAt: s.startedAt,
      duration: s.duration,
      task: s.task
        ? {
            id: s.task.id,
            project: s.task.project ? { name: s.task.project.name } : null,
          }
        : null,
    }));
  }

  async countCompletedSessions(
    userId: string,
    type?: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK',
  ): Promise<number> {
    const where: any = {
      userId,
      wasCompleted: true,
    };

    if (type) {
      where.type = this.mapTypeToPrisma(type);
    }

    return this.prisma.timeSession.count({ where });
  }
}
