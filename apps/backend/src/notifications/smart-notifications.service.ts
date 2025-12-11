import { Injectable, Logger, Optional } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SmartNotificationsService {
  private readonly logger = new Logger(SmartNotificationsService.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
    @Optional() private readonly gateway?: NotificationsGateway,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkUpcomingTasks() {
    this.logger.log('Checking upcoming tasks...');
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const tasks = await this.prisma.task.findMany({
      where: {
        dueDate: {
          gte: now,
          lte: oneHourLater,
        },
        status: {
          notIn: ['COMPLETED', 'CANCELLED'],
        },
      },
    });

    for (const task of tasks) {
      if (!task.assigneeId && !task.creatorId) continue;

      const targetUserId = task.assigneeId || task.creatorId;

      const existing = await this.prisma.notification.findFirst({
        where: {
          userId: targetUserId,
          type: 'DUE_DATE_APPROACHING',
          resourceId: task.id,
          createdAt: {
            gte: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          },
        },
      });

      if (!existing) {
        // Create persistent notification (this also pushes via WebSocket)
        await this.notificationsService.create({
          userId: targetUserId,
          type: 'DUE_DATE_APPROACHING',
          title: 'Tarea próxima a vencer',
          message: `La tarea "${task.title}" vence pronto.`,
          resourceId: task.id,
          resourceType: 'TASK',
        });

        // Also send a dedicated task reminder for connected users
        if (this.gateway && this.gateway.isUserConnected(targetUserId)) {
          const minutesUntilDue = task.dueDate
            ? Math.round((task.dueDate.getTime() - now.getTime()) / 60000)
            : 0;

          this.gateway.sendTaskReminder(targetUserId, {
            taskId: task.id,
            taskTitle: task.title,
            dueDate: task.dueDate!,
            priority: task.priority,
            minutesUntilDue,
          });
        }

        this.logger.log(
          `Sent reminder for task ${task.id} to user ${targetUserId}`,
        );
      }
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async checkLongWorkSessions() {
    this.logger.log('Checking for long work sessions...');
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const longSessions = await this.prisma.timeSession.findMany({
      where: {
        startedAt: {
          lte: twoHoursAgo,
        },
        endedAt: null,
        type: 'WORK',
      },
    });

    for (const session of longSessions) {
      const existing = await this.prisma.notification.findFirst({
        where: {
          userId: session.userId,
          type: 'SYSTEM',
          title: 'Tiempo de descanso',
          createdAt: {
            gte: new Date(now.getTime() - 60 * 60 * 1000),
          },
        },
      });

      if (!existing) {
        await this.notificationsService.create({
          userId: session.userId,
          type: 'SYSTEM',
          title: 'Tiempo de descanso',
          message:
            'Has estado trabajando por más de 2 horas. Considera tomar un descanso.',
          metadata: { sessionId: session.id },
        });
        this.logger.log(`Sent break reminder to user ${session.userId}`);
      }
    }
  }

  @Cron('0 9 * * 1-5')
  async sendDailyPlanningReminder() {
    this.logger.log('Sending daily planning reminders...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const users = await this.prisma.user.findMany({
      select: { id: true },
    });

    for (const user of users) {
      const tasksCreatedToday = await this.prisma.task.count({
        where: {
          creatorId: user.id,
          createdAt: {
            gte: today,
          },
        },
      });

      if (tasksCreatedToday === 0) {
        const existing = await this.prisma.notification.findFirst({
          where: {
            userId: user.id,
            type: 'SYSTEM',
            title: 'Planifica tu día',
            createdAt: {
              gte: today,
            },
          },
        });

        if (!existing) {
          await this.notificationsService.create({
            userId: user.id,
            type: 'SYSTEM',
            title: 'Planifica tu día',
            message:
              '¡Buenos días! Tómate un momento para planificar tus tareas del día.',
          });
          this.logger.log(`Sent daily planning reminder to user ${user.id}`);
        }
      }
    }
  }
}
