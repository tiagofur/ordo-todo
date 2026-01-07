import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { Achievement, UserAchievement } from '@ordo-todo/core';
import type { IGamificationRepository, UserRepository, TimerRepository, AnalyticsRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class GamificationService implements OnModuleInit {
  private readonly logger = new Logger(GamificationService.name);

  // XP Values
  private readonly XP_TASK_COMPLETED = 50;
  private readonly XP_POMODORO_COMPLETED = 25;
  private readonly XP_SUBTASK_COMPLETED = 10;

  constructor(
    @Inject('GamificationRepository')
    private readonly gamificationRepository: IGamificationRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('TimerRepository')
    private readonly timerRepository: TimerRepository,
    @Inject('AnalyticsRepository')
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly prisma: PrismaService, // Still needed for User XP/Level lookup (can be further optimized)
    private readonly notificationsService: NotificationsService,
  ) {}

  async onModuleInit() {
    try {
      await this.seedAchievements();
    } catch (error) {
      this.logger.warn(
        'Could not seed achievements - database may be unavailable. This is non-fatal.',
      );
    }
  }

  private async seedAchievements() {
    const achievementsData = [
      {
        code: 'FIRST_TASK',
        name: 'Primera Tarea',
        description: 'Completa tu primera tarea',
        icon: 'CheckCircle2',
        xpReward: 100,
      },
      {
        code: 'TASK_10',
        name: 'Productividad Constante',
        description: 'Completa 10 tareas',
        icon: 'Trophy',
        xpReward: 250,
      },
      {
        code: 'FIRST_POMODORO',
        name: 'Enfoque Inicial',
        description: 'Completa tu primer Pomodoro',
        icon: 'Timer',
        xpReward: 100,
      },
    ];

    for (const data of achievementsData) {
      const existing = await this.gamificationRepository.findAchievementByCode(
        data.code,
      );

      if (!existing) {
        const achievement = Achievement.create(data);
        await this.gamificationRepository.createAchievement(achievement);
        this.logger.log(`Seeded achievement: ${data.name}`);
      }
    }
  }

  async addXp(userId: string, amount: number, source: string) {
    // Get current XP and level from User entity
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true },
    });
    if (!user) return;

    const newXp = (user.xp || 0) + amount;
    const currentLevel = user.level || 1;
    const newLevel = this.calculateLevel(newXp);

    // Use UserRepository to update XP and level
    await this.userRepository.updateXpAndLevel(userId, newXp, newLevel);

    this.logger.log(
      `User ${userId} gained ${amount} XP from ${source}. Total XP: ${newXp}`,
    );

    if (newLevel > currentLevel) {
      await this.handleLevelUp(userId, newLevel);
    }
  }

  calculateLevel(xp: number): number {
    // Simple formula: Level = floor(sqrt(XP / 100)) + 1
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  private async handleLevelUp(userId: string, newLevel: number) {
    this.logger.log(`User ${userId} leveled up to ${newLevel}!`);

    await this.notificationsService.create({
      userId,
      type: NotificationType.SYSTEM,
      title: '¡Subiste de Nivel!',
      message: `¡Felicidades! Has alcanzado el nivel ${newLevel}.`,
      metadata: { level: newLevel },
    });
  }

  async awardTaskCompletion(userId: string) {
    await this.addXp(userId, this.XP_TASK_COMPLETED, 'Task Completion');
    await this.checkAchievements(userId, 'TASK');
  }

  async awardPomodoroCompletion(userId: string) {
    await this.addXp(userId, this.XP_POMODORO_COMPLETED, 'Pomodoro Completion');
    await this.checkAchievements(userId, 'POMODORO');
  }

  private async checkAchievements(userId: string, type: 'TASK' | 'POMODORO') {
    if (type === 'TASK') {
      // Use AnalyticsRepository to count completed tasks
      const completedTasks = await this.analyticsRepository.countTasks(userId, {
        status: 'COMPLETED',
      });

      if (completedTasks >= 1) {
        await this.unlockAchievement(userId, 'FIRST_TASK');
      }
      if (completedTasks >= 10) {
        await this.unlockAchievement(userId, 'TASK_10');
      }
    } else if (type === 'POMODORO') {
      // Use TimerRepository to count completed WORK sessions
      const completedPomodoros = await this.timerRepository.countCompletedSessions(
        userId,
        'WORK',
      );

      if (completedPomodoros >= 1) {
        await this.unlockAchievement(userId, 'FIRST_POMODORO');
      }
    }
  }

  private async unlockAchievement(userId: string, achievementCode: string) {
    const achievement =
      await this.gamificationRepository.findAchievementByCode(achievementCode);

    if (!achievement) return;

    const hasUnlocked = await this.gamificationRepository.hasUnlocked(
      userId,
      achievement.id as string,
    );

    if (hasUnlocked) return;

    const userAchievement = UserAchievement.create({
      userId,
      achievementId: achievement.id as string,
    });

    await this.gamificationRepository.unlockAchievement(userAchievement);

    if (achievement.xpReward > 0) {
      await this.addXp(
        userId,
        achievement.xpReward,
        `Achievement: ${achievement.name}`,
      );
    }

    await this.notificationsService.create({
      userId,
      type: NotificationType.SYSTEM,
      title: '¡Logro Desbloqueado!',
      message: `Has desbloqueado: ${achievement.name}`,
      metadata: { achievementId: achievement.id, icon: achievement.icon },
    });

    this.logger.log(`User ${userId} unlocked achievement ${achievementCode}`);
  }
}
