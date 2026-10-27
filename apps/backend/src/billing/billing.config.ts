import { Injectable } from '@nestjs/common';
import { SubscriptionInterval, SubscriptionPlan } from '@prisma/client';

/**
 * A Stripe price configured via env vars, mapped to the Ordo plan it buys.
 * Price IDs differ between Stripe test and live mode, so they live in env,
 * never in code (see docs/guides/billing.md).
 */
export interface StripePriceRef {
  priceId: string;
  plan: SubscriptionPlan;
  interval: SubscriptionInterval;
}

@Injectable()
export class BillingConfig {
  get secretKey(): string | undefined {
    return process.env.STRIPE_SECRET_KEY || undefined;
  }

  get webhookSecret(): string | undefined {
    return process.env.STRIPE_WEBHOOK_SECRET || undefined;
  }

  get frontendUrl(): string {
    return process.env.FRONTEND_URL || 'http://localhost:3100';
  }

  get prices(): StripePriceRef[] {
    const entries: Array<[string, SubscriptionPlan, SubscriptionInterval]> = [
      [
        'STRIPE_PRICE_PRO_MONTHLY',
        SubscriptionPlan.PRO,
        SubscriptionInterval.MONTH,
      ],
      [
        'STRIPE_PRICE_PRO_ANNUAL',
        SubscriptionPlan.PRO,
        SubscriptionInterval.YEAR,
      ],
      [
        'STRIPE_PRICE_TEAM_MONTHLY',
        SubscriptionPlan.TEAM,
        SubscriptionInterval.MONTH,
      ],
      [
        'STRIPE_PRICE_TEAM_ANNUAL',
        SubscriptionPlan.TEAM,
        SubscriptionInterval.YEAR,
      ],
    ];
    return entries
      .map(([env, plan, interval]) => ({
        priceId: process.env[env] || '',
        plan,
        interval,
      }))
      .filter((p) => p.priceId !== '');
  }

  priceFor(
    plan: SubscriptionPlan,
    interval: SubscriptionInterval,
  ): StripePriceRef | undefined {
    return this.prices.find((p) => p.plan === plan && p.interval === interval);
  }

  /** Plan an incoming webhook price belongs to; undefined for unknown prices. */
  planForPrice(priceId: string): StripePriceRef | undefined {
    return this.prices.find((p) => p.priceId === priceId);
  }
}
