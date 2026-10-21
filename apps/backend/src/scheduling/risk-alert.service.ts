import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { TaskRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SchedulingService } from './scheduling.service';
import { toDateKey } from './candidate-criteria';
import { assessRisks, type RiskAlert } from './risk-alerts';

// ODD 005 S4: Nest wrapper around the pure assessRisks (T4).
//
// Reads the current plan via SchedulingService.replanOnDayStart (in-memory,
// no persistence). The persisted proposal (T3b) stores blocks only, without
// the unscheduled list assessRisks needs for the overload signal — so the
// endpoint assesses a fresh in-memory plan. T5/ritual unifies both views.
//
// DI rule (same as SchedulingService): repositories + Prisma only, plus
// NotificationsService via @Optional WITHOUT importing NotificationsModule
// (importing it would cycle: NotificationsModule -> AIModule -> Scheduling).
// NOTE: in production `notifications` is ALWAYS undefined (nothing in
// SchedulingModule's graph provides it), so the Prisma-direct fallback below
// is the real path, not the exceptional one. The @Optional branch exists for
// tests and for a future direct provider.
@Injectable()
export class RiskAlertService {
  private readonly logger = new Logger(RiskAlertService.name);

  constructor(
    @Optional()
    private readonly scheduling?: SchedulingService,
    @Optional()
    @Inject('TaskRepository')
    private readonly taskRepository?: TaskRepository,
    @Optional() private readonly prisma?: PrismaService,
    @Optional() private readonly notifications?: NotificationsService,
  ) {}

  async assessForUser(userId: string, daysAhead = 3): Promise<RiskAlert[]> {
    if (!this.scheduling || !this.taskRepository || !this.prisma) {
      throw new Error(
        'RiskAlertService needs SchedulingService, TaskRepository and ' +
          'PrismaService: import SchedulingModule (with RepositoriesModule).',
      );
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });
    const timezone = user?.timezone || 'America/Mexico_City';
    const todayKey = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    const { plan } = await this.scheduling.replanOnDayStart(userId);
    const tasks = await this.taskRepository.findByOwnerId(userId);
    // Deterministic alert order: findByOwnerId has no orderBy, so sort by
    // due date here (overload always first — assessRisks emits it first).
    // Undated tasks sink; ties break by taskId.
    const riskTasks = tasks
      .filter(
        (t) => t.props.status === 'TODO' || t.props.status === 'IN_PROGRESS',
      )
      .map((t) => ({
        taskId: String(t.id),
        title: t.props.title,
        dueDateKey: toDateKey(t.props.dueDate, timezone),
        doDateKey: toDateKey(t.props.doDate, timezone),
      }))
      .sort((a, b) => {
        const ad = a.dueDateKey ?? '9999-99-99';
        const bd = b.dueDateKey ?? '9999-99-99';
        if (ad !== bd) return ad < bd ? -1 : 1;
        return a.taskId < b.taskId ? -1 : a.taskId > b.taskId ? 1 : 0;
      });
    return assessRisks({ plan, tasks: riskTasks, todayKey, daysAhead });
  }

  // Proactive deadline-risk notifications, days ahead (smart-notifications
  // pattern: cron + dedup by type+resourceId). Runs daily; the endpoint
  // above stays the on-demand path.
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async notifyDeadlineRisks(): Promise<void> {
    if (!this.taskRepository || !this.prisma) {
      this.logger.warn(
        'notifyDeadlineRisks skipped: TaskRepository/Prisma not resolved.',
      );
      return;
    }
    const now = new Date();
    const users = await this.prisma.user.findMany({ select: { id: true } });
    for (const user of users) {
      let alerts: RiskAlert[];
      try {
        alerts = await this.assessForUser(user.id);
      } catch (error) {
        this.logger.error(
          `Risk assessment failed for user ${user.id}`,
          error as Error,
        );
        continue;
      }
      for (const alert of alerts) {
        if (alert.kind !== 'deadline-at-risk') continue;
        for (const taskId of alert.taskIds) {
          const existing = await this.prisma.notification.findFirst({
            where: {
              userId: user.id,
              type: 'DUE_DATE_APPROACHING',
              resourceId: taskId,
              createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
            },
          });
          if (existing) continue;
          if (this.notifications) {
            await this.notifications.create({
              userId: user.id,
              type: 'DUE_DATE_APPROACHING',
              title: 'Deadline at risk',
              message: alert.message,
              resourceId: taskId,
              resourceType: 'TASK',
            });
          } else {
            // @Optional fallback: persist directly (no WebSocket push).
            await this.prisma.notification.create({
              data: {
                userId: user.id,
                type: 'DUE_DATE_APPROACHING',
                title: 'Deadline at risk',
                message: alert.message,
                resourceId: taskId,
                resourceType: 'TASK',
              },
            });
          }
          this.logger.log(
            `Sent deadline-risk alert for task ${taskId} to user ${user.id}`,
          );
        }
      }
    }
  }
}
