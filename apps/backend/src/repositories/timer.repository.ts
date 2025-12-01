import { Injectable } from '@nestjs/common';
import {
  TimeSession as PrismaTimeSession,
  SessionType as PrismaSessionType,
} from '@prisma/client';
import { TimeSession, TimerRepository, SessionType } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaTimerRepository implements TimerRepository {
  constructor(private readonly prisma: PrismaService) { }

  private toDomain(prismaSession: PrismaTimeSession): TimeSession {
    const rawPauseData = prismaSession.pauseData;
    let pauseData: { startedAt: Date; endedAt: Date; duration: number }[] = [];
    let currentPauseStart: Date | undefined = undefined;

    if (
      rawPauseData &&
      typeof rawPauseData === 'object' &&
      !Array.isArray(rawPauseData)
    ) {
      const data = rawPauseData as Record<string, any>;
      if (Array.isArray(data.pauses)) {
        pauseData = data.pauses.map((item: unknown) => {
          const p = item as {
            startedAt: string | Date;
            endedAt: string | Date;
            duration: number | string;
          };
          return {
            startedAt: new Date(p.startedAt),
            endedAt: new Date(p.endedAt),
            duration: Number(p.duration),
          };
        });
      }
      if (data.currentPauseStart) {
        currentPauseStart = new Date(data.currentPauseStart as string);
      }
    } else if (Array.isArray(rawPauseData)) {
      pauseData = rawPauseData.map((item: unknown) => {
        const p = item as {
          startedAt: string | Date;
          endedAt: string | Date;
          duration: number | string;
        };
        return {
          startedAt: new Date(p.startedAt),
          endedAt: new Date(p.endedAt),
          duration: Number(p.duration),
        };
      });
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
      id: session.id as string,
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
      where: { id: session.id as string },
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
}
