import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { GRACE_PERIOD_DAYS, TRIAL } from '@ordo-todo/config';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../email/email.service';

const DAY_MS = 24 * 60 * 60 * 1000;
const REMINDER_DAYS_BEFORE = 3;

/**
 * Trial and grace lifecycle (ODD 012 S5/T4). Business rules from the single
 * plans table: 14 days of Pro WITHOUT card for every new account, and a 14
 * day grace period after cancellation with full data access.
 *
 * Timeline (simulated-clock tested):
 *   registro → TRIALING PRO (trialEndsAt = +14d)
 *   → recordatorio a 3 días del fin (una vez)
 *   → expira: plan FREE + status CANCELED (el usuario puede suscribirse)
 *   → si se suscribe y cancela: webhook pone CANCELED + graceEndsAt = +14d
 *   → expira gracia: plan FREE (leer/exportar jamás se bloquea)
 */
@Injectable()
export class PlanLifecycleService {
  private readonly logger = new Logger(PlanLifecycleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Grants the no-card Pro trial to a NEW account. Idempotent: a checkout
   * that already created the row (INCOMPLETE) is never touched, and calling
   * it twice never stacks trials.
   */
  async startTrialForNewUser(
    userId: string,
    now: Date = new Date(),
  ): Promise<void> {
    const existing = await this.prisma.subscription.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (existing) {
      return;
    }
    await this.prisma.subscription.create({
      data: {
        userId,
        plan: SubscriptionPlan.PRO,
        status: SubscriptionStatus.TRIALING,
        trialEndsAt: new Date(now.getTime() + TRIAL.days * DAY_MS),
        seats: 1,
      },
    });
  }

  /** TRIALING with trialEndsAt in the past → plan FREE, status CANCELED. */
  async expireEndedTrials(now: Date = new Date()): Promise<number> {
    const expired = await this.prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.TRIALING,
        trialEndsAt: { lt: now },
      },
      select: { id: true, userId: true },
    });
    for (const sub of expired) {
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: {
          plan: SubscriptionPlan.FREE,
          status: SubscriptionStatus.CANCELED,
        },
      });
    }
    if (expired.length > 0) {
      this.logger.log(`${expired.length} trial(s) expirados → FREE`);
    }
    return expired.length;
  }

  /** CANCELED past their grace period → plan FREE (datos siempre accesibles). */
  async endExpiredGracePeriods(now: Date = new Date()): Promise<number> {
    const expired = await this.prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.CANCELED,
        graceEndsAt: { lt: now },
        plan: { not: SubscriptionPlan.FREE },
      },
      select: { id: true },
    });
    for (const sub of expired) {
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { plan: SubscriptionPlan.FREE, graceEndsAt: null },
      });
    }
    if (expired.length > 0) {
      this.logger.log(`${expired.length} gracia(s) terminadas → FREE`);
    }
    return expired.length;
  }

  /** One-time reminder REMINDER_DAYS_BEFORE days before the trial ends. */
  async sendTrialEndingReminders(now: Date = new Date()): Promise<number> {
    const horizon = new Date(now.getTime() + REMINDER_DAYS_BEFORE * DAY_MS);
    const subs = await this.prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.TRIALING,
        trialEndsAt: { lte: horizon, gt: now },
        trialReminderSentAt: null,
      },
      include: { user: { select: { email: true, name: true } } },
    });

    let sent = 0;
    for (const sub of subs) {
      const daysLeft = Math.max(
        1,
        Math.ceil((sub.trialEndsAt!.getTime() - now.getTime()) / DAY_MS),
      );
      try {
        await this.emailService.sendEmail({
          to: sub.user.email,
          subject: `Tu prueba de Ordo Pro termina en ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'}`,
          text: `Hola ${sub.user.name ?? ''}: tu prueba de Ordo Pro termina el ${sub.trialEndsAt!.toISOString().slice(0, 10)}. Después pasarás al plan Free (tus datos siempre estarán accesibles). Puedes suscribirte cuando quieras para mantener Pro.`,
          html: `<p>Hola ${sub.user.name ?? ''}:</p><p>Tu prueba de <strong>Ordo Pro</strong> termina el <strong>${sub.trialEndsAt!.toISOString().slice(0, 10)}</strong> (${daysLeft} ${daysLeft === 1 ? 'día' : 'días'}).</p><p>Después pasarás al plan Free — tus datos siempre estarán accesibles. Puedes suscribirte cuando quieras para mantener Pro.</p>`,
        });
        sent += 1;
      } catch (error) {
        // Sin marcar: el próximo barrido reintenta el envío.
        this.logger.warn(
          `No se pudo enviar el recordatorio de trial a ${sub.user.email}: ${(error as Error).message}`,
        );
        continue;
      }
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { trialReminderSentAt: now },
      });
    }
    return sent;
  }

  /** Barrido horario: expira trials, cierra gracias y envía recordatorios. */
  @Cron(CronExpression.EVERY_HOUR)
  async runLifecycleSweeps(): Promise<void> {
    for (const [name, sweep] of [
      ['expireEndedTrials', () => this.expireEndedTrials()],
      ['endExpiredGracePeriods', () => this.endExpiredGracePeriods()],
      ['sendTrialEndingReminders', () => this.sendTrialEndingReminders()],
    ] as const) {
      try {
        await sweep();
      } catch (error) {
        this.logger.error(`Sweep ${name} falló: ${(error as Error).message}`);
      }
    }
  }
}
