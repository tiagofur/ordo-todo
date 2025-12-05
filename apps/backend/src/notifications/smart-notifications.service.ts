import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../database/prisma.service';
import { NotificationType, ResourceType } from '@prisma/client';

@Injectable()
export class SmartNotificationsService {
    private readonly logger = new Logger(SmartNotificationsService.name);

    constructor(
        private readonly notificationsService: NotificationsService,
        private readonly prisma: PrismaService,
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

            // Check if notification exists recently
            const existing = await this.prisma.notification.findFirst({
                where: {
                    userId: targetUserId,
                    type: 'DUE_DATE_APPROACHING',
                    resourceId: task.id,
                    createdAt: {
                        gte: new Date(now.getTime() - 2 * 60 * 60 * 1000) // Within last 2 hours
                    }
                }
            });

            if (!existing) {
                await this.notificationsService.create({
                    userId: targetUserId,
                    type: 'DUE_DATE_APPROACHING',
                    title: 'Tarea próxima a vencer',
                    message: `La tarea "${task.title}" vence pronto.`,
                    resourceId: task.id,
                    resourceType: 'TASK',
                });
                this.logger.log(`Sent reminder for task ${task.id} into user ${targetUserId}`);
            }
        }
    }
}
