import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
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
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async onModuleInit() {
    await this.seedAchievements();
  }

  private async seedAchievements() {
    const achievements = [
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

    for (const achievement of achievements) {
      const existing = await this.prisma.achievement.findUnique({
        where: { code: achievement.code },
      });

      if (!existing) {
        await this.prisma.achievement.create({
          data: achievement,
        });
        this.logger.log(`Seeded achievement: ${achievement.name}`);
      }
    }
  }

  async addXp(userId: string, amount: number, source: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const newXp = (user.xp || 0) + amount;
    const currentLevel = user.level || 1;
    const newLevel = this.calculateLevel(newXp);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel,
      },
    });

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
      const completedTasks = await this.prisma.task.count({
        where: {
          creatorId: userId,
          status: 'COMPLETED',
        },
      });

      if (completedTasks >= 1) {
        await this.unlockAchievement(userId, 'FIRST_TASK');
      }
      if (completedTasks >= 10) {
        await this.unlockAchievement(userId, 'TASK_10');
      }
    } else if (type === 'POMODORO') {
      const completedPomodoros = await this.prisma.timeSession.count({
        where: {
          userId,
          type: 'WORK',
          wasCompleted: true,
        },
      });

      if (completedPomodoros >= 1) {
        await this.unlockAchievement(userId, 'FIRST_POMODORO');
      }
    }
  }

  private async unlockAchievement(userId: string, achievementCode: string) {
    const achievement = await this.prisma.achievement.findUnique({
      where: { code: achievementCode },
    });

    if (!achievement) return;

    const existing = await this.prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    if (existing) return;

    await this.prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id,
      },
    });

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
