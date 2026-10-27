import { Injectable, Logger } from '@nestjs/common';
import {
  SubscriptionInterval,
  SubscriptionPlan,
  SubscriptionStatus,
} from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from '../database/prisma.service';
import { BillingConfig, StripePriceRef } from './billing.config';
import { StripeService } from './stripe.service';

export type WebhookProcessResult = 'processed' | 'duplicate' | 'ignored';

/** Stripe subscription status → our SubscriptionStatus enum (same names by design). */
export function mapStatus(
  status: Stripe.Subscription.Status,
): SubscriptionStatus | null {
  const map: Partial<Record<Stripe.Subscription.Status, SubscriptionStatus>> = {
    active: SubscriptionStatus.ACTIVE,
    trialing: SubscriptionStatus.TRIALING,
    past_due: SubscriptionStatus.PAST_DUE,
    canceled: SubscriptionStatus.CANCELED,
    unpaid: SubscriptionStatus.UNPAID,
    incomplete: SubscriptionStatus.INCOMPLETE,
    incomplete_expired: SubscriptionStatus.INCOMPLETE_EXPIRED,
    paused: SubscriptionStatus.UNPAID,
  };
  return map[status] ?? null;
}

/**
 * Checkout metadata stores planId/interval in lowercase ('pro' | 'team');
 * here they normalize to the Prisma enums. Unknown values yield undefined
 * so the caller keeps the existing plan instead of feeding Prisma garbage.
 */
export function planFromMetadata(
  value: string | undefined,
): SubscriptionPlan | undefined {
  if (!value) {
    return undefined;
  }
  const upper = value.toUpperCase();
  return (Object.values(SubscriptionPlan) as string[]).includes(upper)
    ? (upper as SubscriptionPlan)
    : undefined;
}

export function intervalFromMetadata(
  value: string | undefined,
): SubscriptionInterval | undefined {
  if (value === 'year') {
    return SubscriptionInterval.YEAR;
  }
  if (value === 'month') {
    return SubscriptionInterval.MONTH;
  }
  return undefined;
}

/**
 * Webhook event handlers (ODD 012 S3). Idempotency: every event.id is
 * recorded in BillingWebhookEvent inside the same logical step that applies
 * it; Stripe retries (at-least-once delivery) therefore apply at most once.
 *
 * Known limitation (documented in the T2 PR): the ledger dedupes per
 * event.id but does not order events — a very late retry of
 * invoice.payment_failed could set PAST_DUE after a successful renewal.
 * The next customer.subscription.updated self-corrects; T4 adds the
 * renewal-aware refill on invoice.paid.
 */
@Injectable()
export class BillingWebhookService {
  private readonly logger = new Logger(BillingWebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly billingConfig: BillingConfig,
  ) {}

  async processEvent(event: Stripe.Event): Promise<WebhookProcessResult> {
    const alreadyProcessed = await this.prisma.billingWebhookEvent.findUnique({
      where: { id: event.id },
    });
    if (alreadyProcessed) {
      return 'duplicate';
    }

    let result: WebhookProcessResult;
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        result = 'processed';
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
        await this.applySubscription(
          event.data.object,
          event.data.object.metadata?.userId,
        );
        result = 'processed';
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        result = 'processed';
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        result = 'processed';
        break;
      default:
        // invoice.paid etc.: no-op until T4 wires credit refills to renewals.
        result = 'ignored';
    }

    if (result === 'processed') {
      // Applied first, recorded after: handlers are idempotent upserts, so a
      // crash in between just makes Stripe's retry re-apply the same state.
      // The ledger keeps the normal retries from re-running the handler.
      try {
        await this.prisma.billingWebhookEvent.create({
          data: { id: event.id, type: event.type },
        });
      } catch (error) {
        if (!isUniqueConstraintError(error)) {
          throw error;
        }
        // A concurrent delivery won the race; the effect is already applied.
      }
    }
    return result;
  }

  private async handleCheckoutCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const userId = session.metadata?.userId;
    const subscriptionRef = session.subscription;
    if (!userId || !subscriptionRef) {
      return; // not a subscription checkout we created, or missing linkage
    }
    // Mirrors the customer handling: expand if the webhook ever delivers the
    // object, retrieve when it is the plain id (our configured case).
    const subscription =
      typeof subscriptionRef === 'string'
        ? await this.stripeService
            .getClient()
            .subscriptions.retrieve(subscriptionRef)
        : subscriptionRef;
    await this.applySubscription(subscription, userId, {
      stripeCustomerId:
        typeof session.customer === 'string'
          ? session.customer
          : session.customer?.id,
    });
  }

  private async handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    const existing = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });
    if (!existing) {
      return;
    }
    // Plan stays as-is: T4 turns CANCELED into a grace period before dropping
    // to FREE. Reading/exporting is never blocked by billing.
    await this.prisma.subscription.update({
      where: { id: existing.id },
      data: {
        status: SubscriptionStatus.CANCELED,
        cancelAtPeriodEnd: false,
      },
    });
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId =
      typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer?.id;
    if (!customerId) {
      return;
    }
    const existing = await this.prisma.subscription.findUnique({
      where: { stripeCustomerId: customerId },
    });
    if (!existing) {
      return;
    }
    await this.prisma.subscription.update({
      where: { id: existing.id },
      data: { status: SubscriptionStatus.PAST_DUE },
    });
  }

  /**
   * Syncs one Stripe Subscription object into our Subscription row (upsert),
   * resolving the Ordo plan from the configured price map, falling back to
   * checkout metadata.
   */
  private async applySubscription(
    subscription: Stripe.Subscription,
    fallbackUserId?: string,
    overrides: { stripeCustomerId?: string } = {},
  ): Promise<void> {
    const item = subscription.items.data[0];
    const priceRef: StripePriceRef | undefined = item
      ? this.billingConfig.planForPrice(item.price.id)
      : undefined;
    if (item && !priceRef) {
      // Paid price we don't recognize: fail closed on entitlements (the
      // metadata fallback below still names the plan) but leave a trace.
      this.logger.warn(
        `Precio de Stripe no configurado en STRIPE_PRICE_*: ${item.price.id} (suscripción ${subscription.id})`,
      );
    }
    const plan =
      priceRef?.plan ?? planFromMetadata(subscription.metadata?.planId);
    const interval =
      priceRef?.interval ??
      intervalFromMetadata(subscription.metadata?.interval);

    const status = mapStatus(subscription.status);
    const userId =
      fallbackUserId ?? (await this.userIdFromSubscription(subscription));
    if (!userId) {
      return; // webhook for a customer we never linked to a local user
    }

    const data = {
      status: status ?? undefined,
      stripeSubscriptionId: subscription.id,
      stripePriceId: item?.price.id,
      stripeCustomerId:
        overrides.stripeCustomerId ??
        (typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer?.id),
      interval: interval ?? undefined,
      seats: item?.quantity ?? 1,
      trialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      currentPeriodStart: item?.current_period_start
        ? new Date(item.current_period_start * 1000)
        : null,
      stripeCurrentPeriodEnd: item?.current_period_end
        ? new Date(item.current_period_end * 1000)
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };

    const existing = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    if (existing) {
      await this.prisma.subscription.update({
        where: { id: existing.id },
        data: {
          ...data,
          plan: plan ?? existing.plan,
        },
      });
    } else {
      await this.prisma.subscription.create({
        data: {
          ...data,
          userId,
          plan: plan ?? SubscriptionPlan.FREE,
          status: status ?? SubscriptionStatus.INCOMPLETE,
        },
      });
    }
  }

  private async userIdFromSubscription(
    subscription: Stripe.Subscription,
  ): Promise<string | undefined> {
    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer?.id;
    if (!customerId) {
      return undefined;
    }
    const existing = await this.prisma.subscription.findUnique({
      where: { stripeCustomerId: customerId },
      select: { userId: true },
    });
    return existing?.userId ?? subscription.metadata?.userId;
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}
