import { Injectable } from '@nestjs/common';
import {
    Achievement,
    UserAchievement,
} from '@ordo-todo/core';
import type { IGamificationRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import {
    Achievement as PrismaAchievement,
    UserAchievement as PrismaUserAchievement,
} from '@prisma/client';

/**
 * Prisma implementation of the IGamificationRepository interface.
 */
@Injectable()
export class PrismaGamificationRepository implements IGamificationRepository {
    constructor(private readonly prisma: PrismaService) { }

    // ============ Achievement Operations ============

    async findAchievementByCode(code: string): Promise<Achievement | null> {
        const achievement = await this.prisma.achievement.findUnique({
            where: { code },
        });

        return achievement ? this.achievementToDomain(achievement) : null;
    }

    async findAchievementById(id: string): Promise<Achievement | null> {
        const achievement = await this.prisma.achievement.findUnique({
            where: { id },
        });

        return achievement ? this.achievementToDomain(achievement) : null;
    }

    async findAllAchievements(): Promise<Achievement[]> {
        const achievements = await this.prisma.achievement.findMany({
            orderBy: { xpReward: 'asc' },
        });

        return achievements.map((a) => this.achievementToDomain(a));
    }

    async createAchievement(achievement: Achievement): Promise<Achievement> {
        const created = await this.prisma.achievement.create({
            data: {
                id: achievement.id as string,
                code: achievement.props.code,
                name: achievement.props.name,
                description: achievement.props.description,
                icon: achievement.props.icon,
                xpReward: achievement.props.xpReward,
            },
        });

        return this.achievementToDomain(created);
    }

    // ============ UserAchievement Operations ============

    async hasUnlocked(userId: string, achievementId: string): Promise<boolean> {
        const existing = await this.prisma.userAchievement.findUnique({
            where: {
                userId_achievementId: {
                    userId,
                    achievementId,
                },
            },
        });

        return !!existing;
    }

    async unlockAchievement(
        userAchievement: UserAchievement,
    ): Promise<UserAchievement> {
        const created = await this.prisma.userAchievement.create({
            data: {
                id: userAchievement.id as string,
                userId: userAchievement.props.userId,
                achievementId: userAchievement.props.achievementId,
            },
        });

        return this.userAchievementToDomain(created);
    }

    async findUserAchievements(userId: string): Promise<UserAchievement[]> {
        const achievements = await this.prisma.userAchievement.findMany({
            where: { userId },
            orderBy: { unlockedAt: 'desc' },
        });

        return achievements.map((a) => this.userAchievementToDomain(a));
    }

    // ============ Domain Mappers ============

    private achievementToDomain(prismaAchievement: PrismaAchievement): Achievement {
        return new Achievement({
            id: prismaAchievement.id,
            code: prismaAchievement.code,
            name: prismaAchievement.name,
            description: prismaAchievement.description,
            icon: prismaAchievement.icon,
            xpReward: prismaAchievement.xpReward,
            createdAt: prismaAchievement.createdAt,
            updatedAt: prismaAchievement.updatedAt,
        });
    }

    private userAchievementToDomain(
        prismaUserAchievement: PrismaUserAchievement,
    ): UserAchievement {
        return new UserAchievement({
            id: prismaUserAchievement.id,
            userId: prismaUserAchievement.userId,
            achievementId: prismaUserAchievement.achievementId,
            unlockedAt: prismaUserAchievement.unlockedAt,
        });
    }
}
