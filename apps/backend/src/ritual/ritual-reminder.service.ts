import { Injectable, Logger, Optional } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { startOfTodayIn } from '../tasks/day-plan.service';

// ODD 006 S5 (T4): kind ritual reminders. A cron tick calls checkReminders
// with the current time; per user, at most one morning + one evening
// reminder per day, each inside a 15-minute window after the configured
// time (user TZ), skipped when already DONE, when disabled, or when a
// same-type notification already exists in the last 24h (dedup).
// Total silence outside hours: no window open → no notification, ever.
//
// NotificationsService is @Optional (precedent: RiskAlertService): if it
// does not resolve, reminders persist via Prisma directly (same dedup).
@Injectable()
export class RitualReminderService {
  private readonly logger = new Logger(RitualReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly notifications?: NotificationsService,
  ) {}

  // Every 15 minutes: windows are 15 minutes, so each window is hit once.
  @Cron('*/15 * * * *')
  async handleCron(): Promise<void> {
    await this.checkReminders(new Date());
  }

  async checkReminders(now: Date): Promise<void> {
    const users = await this.prisma.user.findMany({
      select: { id: true, timezone: true },
    });
    for (const user of users) {
      try {
        await this.checkUser(user.id, user.timezone ?? null, now);
      } catch (error) {
        this.logger.error(
          `Ritual reminders failed for user ${user.id}`,
          error as Error,
        );
      }
    }
  }

  private async checkUser(
    userId: string,
    rawTimezone: string | null,
    now: Date,
  ): Promise<void> {
    const prefs = await this.prisma.userPreferences.findUnique({
      where: { userId },
    });
    if (!prefs || !prefs.enableNotifications) return;
    const timezone = rawTimezone || 'America/Mexico_City';
    const minutesNow = minutesIn(timezone, now);
    const ritual = await this.prisma.ritualDay.findUnique({
      where: { userId_date: { userId, date: startOfTodayIn(timezone) } },
    });
    if (
      prefs.ritualMorningReminder &&
      ritual?.morningStatus !== 'DONE' &&
      inWindow(minutesNow, prefs.ritualMorningTime)
    ) {
      await this.notifyOnce(
        userId,
        'RITUAL_MORNING',
        'Ritual de mañana',
        'Tu plan de hoy está listo: revísalo y elige tu top-3.',
        now,
      );
    }
    if (
      prefs.ritualEveningReminder &&
      ritual?.eveningStatus !== 'DONE' &&
      inWindow(minutesNow, prefs.ritualEveningTime)
    ) {
      await this.notifyOnce(
        userId,
        'RITUAL_EVENING',
        'Ritual de cierre',
        'Cierra tu día: revisa qué se completó y mueve lo pendiente.',
        now,
      );
    }
  }

  private async notifyOnce(
    userId: string,
    type: 'RITUAL_MORNING' | 'RITUAL_EVENING',
    title: string,
    message: string,
    now: Date,
  ): Promise<void> {
    const existing = await this.prisma.notification.findFirst({
      where: {
        userId,
        type,
        createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      },
    });
    if (existing) return;
    if (this.notifications) {
      await this.notifications.create({
        userId,
        type,
        title,
        message,
        resourceType: 'TASK',
      });
    } else {
      await this.prisma.notification.create({
        data: { userId, type, title, message, resourceType: 'TASK' },
      });
    }
    this.logger.log(`Sent ${type} reminder to user ${userId}`);
  }
}

// Minutes since midnight in the given IANA timezone (pure, hermetic).
const minutesIn = (timezone: string, at: Date): number => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(at);
  const get = (t: string): number =>
    Number(parts.find((p) => p.type === t)?.value ?? 0);
  return get('hour') * 60 + get('minute');
};

// True when `now` (minutes) falls in [configured, configured + 15).
// Malformed configured times never match (fail silent, no crash).
const inWindow = (nowMinutes: number, configured: string): boolean => {
  const match = /^(\d{2}):(\d{2})$/.exec(configured);
  if (!match) return false;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return false;
  const start = h * 60 + m;
  return nowMinutes >= start && nowMinutes < start + 15;
};
