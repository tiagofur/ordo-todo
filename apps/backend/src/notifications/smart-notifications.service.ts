import { Injectable, Logger, Optional } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaService } from '../database/prisma.service';
import { BurnoutPreventionService } from '../ai/burnout-prevention.service';

@Injectable()
export class SmartNotificationsService {
  private readonly logger = new Logger(SmartNotificationsService.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
    @Optional() private readonly gateway?: NotificationsGateway,
    @Optional() private readonly burnoutService?: BurnoutPreventionService,
  ) { }

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

  // ============ BURNOUT PREVENTION CRON JOBS ============

  /**
   * Check for burnout risk daily at 6pm
   * Sends proactive notifications to users at risk
   */
  @Cron('0 18 * * *')
  async checkBurnoutRisk() {
    if (!this.burnoutService) {
      this.logger.warn('BurnoutPreventionService not available, skipping burnout check');
      return;
    }

    this.logger.log('Checking burnout risk for all users...');
    const users = await this.prisma.user.findMany({
      select: { id: true },
    });

    for (const user of users) {
      try {
        const intervention = await this.burnoutService.checkForIntervention(user.id);

        if (intervention && intervention.shouldNotify) {
          // Check if we already sent a burnout notification today
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const existing = await this.prisma.notification.findFirst({
            where: {
              userId: user.id,
              type: 'SYSTEM',
              title: { contains: 'bienestar' },
              createdAt: { gte: today },
            },
          });

          if (!existing) {
            await this.notificationsService.create({
              userId: user.id,
              type: 'SYSTEM',
              title: intervention.title,
              message: intervention.message,
              metadata: {
                interventionType: intervention.type,
                recommendations: intervention.recommendations,
              },
            });

            // Push via WebSocket if connected
            if (this.gateway && this.gateway.isUserConnected(user.id)) {
              this.gateway.sendInsight(user.id, {
                type: 'BURNOUT_WARNING',
                message: intervention.message,
                priority: intervention.type === 'CRITICAL_ALERT' ? 'HIGH' : 'MEDIUM',
                actionable: true,
                action: { type: 'SHOW_WELLBEING', data: {} },
              });
            }

            this.logger.log(
              `Sent ${intervention.type} to user ${user.id}`,
            );
          }
        }
      } catch (error) {
        this.logger.error(`Failed to check burnout for user ${user.id}`, error);
      }
    }
  }

  /**
   * Send weekly wellbeing report every Sunday at 8pm
   */
  @Cron('0 20 * * 0')
  async sendWeeklyWellbeingReport() {
    if (!this.burnoutService) {
      this.logger.warn('BurnoutPreventionService not available, skipping weekly report');
      return;
    }

    this.logger.log('Sending weekly wellbeing reports...');
    const users = await this.prisma.user.findMany({
      select: { id: true },
    });

    for (const user of users) {
      try {
        const summary = await this.burnoutService.generateWeeklyWellbeingSummary(user.id);

        // Build a nice summary message
        const scoreEmoji = summary.overallScore >= 80 ? '🌟' :
          summary.overallScore >= 60 ? '👍' :
            summary.overallScore >= 40 ? '⚠️' : '🔴';

        const highlights = summary.highlights.slice(0, 2).join('. ');
        const mainConcern = summary.concerns.length > 0 ? summary.concerns[0] : null;

        let message = `${scoreEmoji} Tu puntaje de bienestar esta semana: ${summary.overallScore}/100. `;
        if (highlights) {
          message += `Logros: ${highlights}. `;
        }
        if (mainConcern) {
          message += `Área de mejora: ${mainConcern}`;
        }

        await this.notificationsService.create({
          userId: user.id,
          type: 'SYSTEM',
          title: '📊 Resumen semanal de bienestar',
          message,
          metadata: {
            weeklyScore: summary.overallScore,
            burnoutRisk: summary.burnoutRisk,
            metrics: summary.metrics,
          },
        });

        this.logger.log(`Sent weekly wellbeing report to user ${user.id}`);
      } catch (error) {
        this.logger.error(`Failed to send weekly report to user ${user.id}`, error);
      }
    }
  }

  /**
   * Smart break reminder - checks every 15 minutes for users who need breaks
   * More intelligent than the 2-hour fixed timer
   */
  @Cron('*/15 * * * *')
  async smartBreakReminder() {
    if (!this.burnoutService) return;

    this.logger.debug('Running smart break reminder check...');
    const now = new Date();

    // Find active sessions
    const activeSessions = await this.prisma.timeSession.findMany({
      where: {
        endedAt: null,
        type: 'WORK',
      },
    });

    for (const session of activeSessions) {
      const sessionMinutes = Math.floor(
        (now.getTime() - new Date(session.startedAt).getTime()) / 60000,
      );

      // Only check if session is at least 75 minutes (give buffer before 90min threshold)
      if (sessionMinutes < 75) continue;

      try {
        const recommendations = await this.burnoutService.getRestRecommendations(
          session.userId,
        );

        const breakRec = recommendations.find(
          (r) => r.type === 'TAKE_BREAK' && r.priority === 'HIGH',
        );

        if (breakRec) {
          // Check if we already sent a break reminder recently
          const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
          const existing = await this.prisma.notification.findFirst({
            where: {
              userId: session.userId,
              type: 'SYSTEM',
              title: { contains: 'descanso' },
              createdAt: { gte: thirtyMinutesAgo },
            },
          });

          if (!existing) {
            await this.notificationsService.create({
              userId: session.userId,
              type: 'SYSTEM',
              title: '☕ Momento de descanso',
              message: breakRec.message,
              metadata: { sessionId: session.id, sessionMinutes },
            });

            // Push via WebSocket
            if (this.gateway && this.gateway.isUserConnected(session.userId)) {
              this.gateway.sendInsight(session.userId, {
                type: 'BREAK_REMINDER',
                message: breakRec.message,
                priority: 'MEDIUM',
                actionable: true,
                action: { type: 'SUGGEST_BREAK', data: {} },
              });
            }
          }
        }
      } catch (error) {
        this.logger.error(`Smart break check failed for user ${session.userId}`, error);
      }
    }
  }
}

