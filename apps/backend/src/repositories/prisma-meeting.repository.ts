import { Injectable, Logger } from '@nestjs/common';
import {
  Meeting,
  MeetingAnalysis,
  ActionItem,
  MeetingRepository,
} from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import { Prisma, Meeting as PrismaMeeting } from '@prisma/client';

/**
 * Prisma implementation of the MeetingRepository interface.
 */
@Injectable()
export class PrismaMeetingRepository implements MeetingRepository {
  private readonly logger = new Logger(PrismaMeetingRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(meeting: Meeting): Promise<Meeting> {
    const prismaMeeting = await this.prisma.meeting.create({
      data: {
        id: meeting.id,
        userId: meeting.userId,
        title: meeting.title,
        date: meeting.date,
        duration: meeting.duration,
        transcript: meeting.transcript || null,
        audioUrl: meeting.audioUrl || null,
        analysis: meeting.analysis
          ? (meeting.analysis as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        projectId: meeting.projectId || null,
        createdAt: meeting.createdAt,
        updatedAt: meeting.updatedAt,
      },
    });

    return this.toDomain(prismaMeeting);
  }

  async findById(id: string): Promise<Meeting | null> {
    const prismaMeeting = await this.prisma.meeting.findUnique({
      where: { id },
    });

    return prismaMeeting ? this.toDomain(prismaMeeting) : null;
  }

  async findByUserId(userId: string): Promise<Meeting[]> {
    const prismaMeetings = await this.prisma.meeting.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return prismaMeetings.map((m) => this.toDomain(m));
  }

  async findByProjectId(projectId: string): Promise<Meeting[]> {
    const prismaMeetings = await this.prisma.meeting.findMany({
      where: { projectId },
      orderBy: { date: 'desc' },
    });

    return prismaMeetings.map((m) => this.toDomain(m));
  }

  async update(meeting: Meeting): Promise<Meeting> {
    const prismaMeeting = await this.prisma.meeting.update({
      where: { id: meeting.id },
      data: {
        title: meeting.title,
        date: meeting.date,
        duration: meeting.duration,
        transcript: meeting.transcript || null,
        audioUrl: meeting.audioUrl || null,
        analysis: meeting.analysis
          ? (meeting.analysis as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        projectId: meeting.projectId || null,
        updatedAt: new Date(),
      },
    });

    return this.toDomain(prismaMeeting);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.meeting.delete({
      where: { id },
    });
  }

  async findUpcoming(userId: string, days: number = 7): Promise<Meeting[]> {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    const prismaMeetings = await this.prisma.meeting.findMany({
      where: {
        userId,
        date: {
          gte: now,
          lte: future,
        },
      },
      orderBy: { date: 'asc' },
    });

    return prismaMeetings.map((m) => this.toDomain(m));
  }

  async findPast(userId: string): Promise<Meeting[]> {
    const now = new Date();

    const prismaMeetings = await this.prisma.meeting.findMany({
      where: {
        userId,
        date: {
          lt: now,
        },
      },
      orderBy: { date: 'desc' },
    });

    return prismaMeetings.map((m) => this.toDomain(m));
  }

  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Meeting[]> {
    const prismaMeetings = await this.prisma.meeting.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    return prismaMeetings.map((m) => this.toDomain(m));
  }

  async findWithTranscript(userId: string): Promise<Meeting[]> {
    const prismaMeetings = await this.prisma.meeting.findMany({
      where: {
        userId,
        transcript: {
          not: null,
        },
      },
      orderBy: { date: 'desc' },
    });

    return prismaMeetings.map((m) => this.toDomain(m));
  }

  async findWithAnalysis(userId: string): Promise<Meeting[]> {
    const prismaMeetings = await this.prisma.meeting.findMany({
      where: {
        userId,
        analysis: {
          not: Prisma.AnyNull,
        },
      },
      orderBy: { date: 'desc' },
    });

    return prismaMeetings.map((m) => this.toDomain(m));
  }

  async countByUserId(userId: string): Promise<number> {
    return await this.prisma.meeting.count({
      where: { userId },
    });
  }

  async getTotalDuration(userId: string): Promise<number> {
    const meetings = await this.prisma.meeting.findMany({
      where: { userId },
      select: { duration: true },
    });

    return meetings.reduce((sum, m) => sum + m.duration, 0);
  }

  async getMeetingsStats(userId: string): Promise<{
    total: number;
    withTranscript: number;
    withAnalysis: number;
    totalHours: number;
    avgDuration: number;
  }> {
    const [total, withTranscript, withAnalysis, meetings] = await Promise.all([
      this.prisma.meeting.count({ where: { userId } }),
      this.prisma.meeting.count({
        where: { userId, transcript: { not: null } },
      }),
      this.prisma.meeting.count({
        where: { userId, analysis: { not: Prisma.AnyNull } },
      }),
      this.prisma.meeting.findMany({
        where: { userId },
        select: { duration: true },
      }),
    ]);

    const totalMinutes = meetings.reduce((sum, m) => sum + m.duration, 0);
    const avgDuration = total > 0 ? Math.round(totalMinutes / total) : 0;

    return {
      total,
      withTranscript,
      withAnalysis,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      avgDuration,
    };
  }

  private toDomain(prismaMeeting: PrismaMeeting): Meeting {
    return new Meeting({
      id: prismaMeeting.id,
      userId: prismaMeeting.userId,
      title: prismaMeeting.title,
      date: prismaMeeting.date,
      duration: prismaMeeting.duration,
      transcript: prismaMeeting.transcript || undefined,
      audioUrl: prismaMeeting.audioUrl || undefined,
      analysis: prismaMeeting.analysis
        ? this.parseAnalysis(prismaMeeting.analysis as any)
        : undefined,
      projectId: prismaMeeting.projectId || undefined,
      createdAt: prismaMeeting.createdAt,
      updatedAt: prismaMeeting.updatedAt,
    });
  }

  private parseAnalysis(analysisJson: any): MeetingAnalysis {
    // Parse JSON into MeetingAnalysis domain object
    return new MeetingAnalysis({
      summary: analysisJson.summary || '',
      keyPoints: analysisJson.keyPoints || [],
      actionItems: (analysisJson.actionItems || []).map(
        (item: any) =>
          new ActionItem({
            id: item.id || 'temp',
            title: item.title,
            description: item.description,
            assignee: item.assignee,
            dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
            priority: item.priority,
            context: item.context || '',
            completed: item.completed,
            taskId: item.taskId,
          }),
      ),
      decisions: (analysisJson.decisions || []).map((d: any) => ({
        decision: d.decision,
        context: d.context,
        participants: d.participants,
      })),
      participants: (analysisJson.participants || []).map((p: any) => ({
        name: p.name,
        role: p.role,
        speakingTime: p.speakingTime,
      })),
      topics: (analysisJson.topics || []).map((t: any) => ({
        topic: t.topic,
        duration: t.duration,
        summary: t.summary,
      })),
      sentiment: analysisJson.sentiment || 'NEUTRAL',
      followUpRequired: analysisJson.followUpRequired || false,
      suggestedFollowUpDate: analysisJson.suggestedFollowUpDate
        ? new Date(analysisJson.suggestedFollowUpDate)
        : undefined,
    });
  }
}
