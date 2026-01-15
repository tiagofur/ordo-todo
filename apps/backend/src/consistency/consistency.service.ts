import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConsistencyRepository } from './consistency.repository';
import { SetGoalDto, ConsistencyScoreResponseDto, ConsistencyStatsDto } from './dto';
import { ConsistencyScore, ConsistencyPeriod } from '@prisma/client';

@Injectable()
export class ConsistencyService {
    private readonly logger = new Logger(ConsistencyService.name);

    constructor(private readonly consistencyRepository: ConsistencyRepository) { }

    async getStats(userId: string): Promise<ConsistencyStatsDto> {
        const now = new Date();

        // Get week boundaries (Monday to Sunday)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // Get month boundaries
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Get scored data
        const [
            latestWeekly,
            thisWeekPublished,
            thisMonthPublished,
            totalPublished,
            recentScores,
            platformStats,
        ] = await Promise.all([
            this.consistencyRepository.findLatest(userId, 'WEEKLY'),
            this.consistencyRepository.getPublishedCountByPeriod(userId, startOfWeek, endOfWeek),
            this.consistencyRepository.getPublishedCountByPeriod(userId, startOfMonth, endOfMonth),
            this.consistencyRepository.getTotalPublished(userId),
            this.consistencyRepository.findByDateRange(
                userId,
                new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                now,
                'WEEKLY',
            ),
            this.consistencyRepository.getPublishedByPlatform(userId, startOfMonth, endOfMonth),
        ]);

        const targetContent = latestWeekly?.targetContent ?? 3;
        const thisWeekScore = Math.min(100, (thisWeekPublished / targetContent) * 100);

        return {
            currentStreak: latestWeekly?.currentStreak ?? 0,
            longestStreak: latestWeekly?.longestStreak ?? 0,
            thisWeekPublished,
            thisWeekTarget: targetContent,
            thisWeekScore: Math.round(thisWeekScore),
            thisMonthPublished,
            totalPublished,
            recentScores: recentScores.map((s) => this.mapToDto(s)),
            platformStats,
        };
    }

    async setGoal(userId: string, dto: SetGoalDto): Promise<ConsistencyScoreResponseDto> {
        const now = new Date();
        const periodType = dto.periodType || 'WEEKLY';

        // Get current streak info
        const latest = await this.consistencyRepository.findLatest(userId, periodType);

        const score = await this.consistencyRepository.upsert(
            userId,
            now,
            periodType,
            {
                targetContent: dto.targetContent,
                currentStreak: latest?.currentStreak ?? 0,
                longestStreak: latest?.longestStreak ?? 0,
            },
        );

        return this.mapToDto(score);
    }

    async getHistory(
        userId: string,
        options: { days?: number; periodType?: ConsistencyPeriod } = {},
    ): Promise<ConsistencyScoreResponseDto[]> {
        const { days = 90, periodType } = options;
        const now = new Date();
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        const scores = await this.consistencyRepository.findByDateRange(
            userId,
            startDate,
            now,
            periodType,
        );

        return scores.map((s) => this.mapToDto(s));
    }

    // Cron job to calculate weekly consistency scores every Monday at midnight
    @Cron('0 0 * * 1') // Every Monday at midnight
    async calculateWeeklyScores(): Promise<void> {
        this.logger.log('Calculating weekly consistency scores...');

        // This would need to iterate over all users
        // For now, this is a placeholder for the full implementation
        // In production, you'd use a job queue like Bull
    }

    // Helper to calculate and update a user's score
    async recalculateScore(userId: string): Promise<ConsistencyScoreResponseDto> {
        const now = new Date();

        // Get week boundaries
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // Get published count and platform breakdown
        const [publishedCount, platformBreakdown, latest] = await Promise.all([
            this.consistencyRepository.getPublishedCountByPeriod(userId, startOfWeek, endOfWeek),
            this.consistencyRepository.getPublishedByPlatform(userId, startOfWeek, endOfWeek),
            this.consistencyRepository.findLatest(userId, 'WEEKLY'),
        ]);

        const targetContent = latest?.targetContent ?? 3;
        const score = Math.min(100, (publishedCount / targetContent) * 100);

        // Calculate streak
        let currentStreak = latest?.currentStreak ?? 0;
        let longestStreak = latest?.longestStreak ?? 0;

        if (publishedCount >= targetContent) {
            currentStreak += 1;
            longestStreak = Math.max(longestStreak, currentStreak);
        } else if (publishedCount === 0) {
            currentStreak = 0;
        }

        const updated = await this.consistencyRepository.upsert(
            userId,
            startOfWeek,
            'WEEKLY',
            {
                score: Math.round(score),
                contentPublished: publishedCount,
                targetContent,
                currentStreak,
                longestStreak,
                platformBreakdown,
            },
        );

        return this.mapToDto(updated);
    }

    private mapToDto(score: ConsistencyScore): ConsistencyScoreResponseDto {
        return {
            id: score.id,
            userId: score.userId,
            date: score.date,
            periodType: score.periodType,
            score: score.score,
            contentPublished: score.contentPublished,
            targetContent: score.targetContent,
            currentStreak: score.currentStreak,
            longestStreak: score.longestStreak,
            platformBreakdown: score.platformBreakdown as Record<string, number> | undefined,
            createdAt: score.createdAt,
        };
    }
}
