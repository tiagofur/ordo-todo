import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { BillingConfig } from './billing.config';

/**
 * Lazily builds the Stripe SDK client from STRIPE_SECRET_KEY. Every consumer
 * goes through getClient() so that a deployment without billing configured
 * fails with a clear 503 instead of crashing at boot (CI and e2e run without
 * Stripe keys on purpose).
 */
@Injectable()
export class StripeService {
  private client: Stripe | null = null;

  constructor(private readonly billingConfig: BillingConfig) {}

  getClient(): Stripe {
    const key = this.billingConfig.secretKey;
    if (!key) {
      throw new HttpException(
        'Billing no está configurado en este entorno (falta STRIPE_SECRET_KEY).',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    if (!this.client) {
      this.client = new Stripe(key);
    }
    return this.client;
  }
}
