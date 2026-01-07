import { Injectable, Logger } from '@nestjs/common';
import {
  FocusPreferences,
  FocusRepository,
  FocusStats,
  TrackUsageRecord,
} from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Prisma implementation of the FocusRepository interface.
 *
 * Manages focus preferences, statistics, and track usage analytics.
 * Preferences are stored in User.preferences JSON field.
 */
@Injectable()
export class PrismaFocusRepository implements FocusRepository {
  private readonly logger = new Logger(PrismaFocusRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async getUserPreferences(userId: string): Promise<FocusPreferences | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    if (!user) {
      return null;
    }

    const prefs = (user.preferences as Record<string, any>)?.focusAudio;

    if (!prefs) {
      return null;
    }

    return new FocusPreferences({
      id: 'prefs',
      userId,
      favoriteTrackIds: prefs.favoriteTrackIds || [],
      defaultVolume: prefs.defaultVolume ?? 50,
      enableTransitions: prefs.enableTransitions ?? true,
      preferredModeId: prefs.preferredModeId || null,
    });
  }

  async saveUserPreferences(preferences: FocusPreferences): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: preferences.userId },
      select: { preferences: true },
    });

    const currentPrefs = (user?.preferences as Record<string, any>) || {};
    currentPrefs.focusAudio = {
      favoriteTrackIds: preferences.favoriteTrackIds,
      defaultVolume: preferences.defaultVolume,
      enableTransitions: preferences.enableTransitions,
      preferredModeId: preferences.preferredModeId,
    };

    await this.prisma.user.update({
      where: { id: preferences.userId },
      data: { preferences: currentPrefs as Prisma.InputJsonValue },
    });
  }

  async getFocusStats(userId: string): Promise<FocusStats> {
    // Get completed work sessions
    const sessions = await this.prisma.timeSession.findMany({
      where: {
        userId,
        type: 'WORK',
        duration: { not: null },
      },
      orderBy: { startedAt: 'desc' },
      take: 100,
    });

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const avgSessionLength = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    // Get favorite track from usage analytics (if available)
    const mostUsedTracks = await this.getMostUsedTracks(userId, 1);
    const favoriteTrack = mostUsedTracks.length > 0 ? mostUsedTracks[0].trackId : null;

    // Get most used mode from user preferences
    const preferredMode = await this.getMostUsedMode(userId);

    // Calculate streak
    const streakDays = await this.calculateFocusStreak(userId);

    return new FocusStats({
      totalSessions,
      totalFocusMinutes: totalMinutes,
      avgSessionLength,
      favoriteTrack,
      preferredMode,
      streakDays,
    });
  }

  async calculateFocusStreak(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    const checkDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dayStart = new Date(checkDate);
      const dayEnd = new Date(checkDate);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const hasSession = await this.prisma.timeSession.findFirst({
        where: {
          userId,
          type: 'WORK',
          startedAt: { gte: dayStart, lt: dayEnd },
          duration: { gte: 5 }, // At least 5 minutes
        },
      });

      if (hasSession) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  async recordTrackUsage(record: TrackUsageRecord): Promise<void> {
    this.logger.debug(
      `Recording track usage: user=${record.userId}, track=${record.trackId}, duration=${record.durationMinutes}min`,
    );

    // For now, just log it. In production, you might want to store this in a separate table
    // for more detailed analytics
    // await this.prisma.focusTrackUsage.create({
    //   data: {
    //     userId: record.userId,
    //     trackId: record.trackId,
    //     durationMinutes: record.durationMinutes,
    //     recordedAt: record.recordedAt || new Date(),
    //   },
    // });
  }

  async getMostUsedTracks(
    userId: string,
    limit: number = 10,
  ): Promise<Array<{ trackId: string; count: number }>> {
    // This would require a separate table to track usage
    // For now, return empty array
    // In production, you'd query from focusTrackUsage table
    return [];
  }

  async getMostUsedMode(userId: string): Promise<string | null> {
    const prefs = await this.getUserPreferences(userId);
    return prefs?.preferredModeId || null;
  }
}
