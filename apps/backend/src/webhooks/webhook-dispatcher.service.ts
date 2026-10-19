import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { createHmac } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { webhookDelegates } from './webhook.delegate';
import { WebhookCryptoService } from './webhook-crypto.service';
import {
  WEBHOOK_FETCH,
  WEBHOOK_MAX_ATTEMPTS,
  WEBHOOK_REQUEST_TIMEOUT_MS,
  webhookRetryDelayMs,
} from './webhook.constants';
import type { WebhookEvent, WebhookFetch } from './webhook.constants';

const defaultFetch: WebhookFetch = async (url, init) => {
  const response = await fetch(url, init);
  return { ok: response.ok, status: response.status };
};

/**
 * Dispatches signed webhook deliveries with scheduled retries.
 *
 * Each delivery is signed with HMAC-SHA256 over `{timestamp}.{body}`
 * and sent with `ordo-signature` / `ordo-timestamp` headers. Failures
 * are retried with exponential backoff by {@link retryDueDeliveries},
 * which runs every minute via `@Cron`.
 */
@Injectable()
export class WebhookDispatcherService {
  private readonly logger = new Logger(WebhookDispatcherService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: WebhookCryptoService,
    @Optional()
    @Inject(WEBHOOK_FETCH)
    private readonly doFetch: WebhookFetch = defaultFetch,
  ) {}

  async dispatch(
    event: WebhookEvent,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const delegates = webhookDelegates(this.prisma);
    const subscriptions = await delegates.webhookSubscription.findMany({
      where: { isActive: true },
    });

    const matching = subscriptions.filter((subscription) =>
      (subscription.events ?? []).includes(event),
    );

    for (const subscription of matching) {
      const delivery = await delegates.webhookDelivery.create({
        data: {
          subscriptionId: subscription.id as string,
          event,
          payload,
          status: 'pending',
          attempts: 0,
        },
      });
      await this.attemptDelivery(delivery.id);
    }
  }

  async redeliver(userId: string, deliveryId: string) {
    const delegates = webhookDelegates(this.prisma);
    const delivery = await delegates.webhookDelivery.findFirst({
      where: { id: deliveryId },
      include: { subscription: true },
    });
    if (!delivery || !delivery.subscription) {
      throw new NotFoundException('Webhook delivery not found');
    }
    if (delivery.subscription.userId !== userId) {
      throw new NotFoundException('Webhook delivery not found');
    }

    await delegates.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: 'pending',
        attempts: 0,
        lastError: null,
        nextRetryAt: null,
      },
    });
    await this.attemptDelivery(delivery.id);

    return { id: delivery.id, status: 'pending' as const };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async retryDueDeliveries(): Promise<void> {
    const delegates = webhookDelegates(this.prisma);
    const due = await delegates.webhookDelivery.findMany({
      where: { status: 'failed', nextRetryAt: { lte: new Date() } },
      include: { subscription: true },
    });

    for (const delivery of due) {
      await this.attemptDelivery(delivery.id);
    }
  }

  private async attemptDelivery(deliveryId: string): Promise<void> {
    const delegates = webhookDelegates(this.prisma);
    const delivery = await delegates.webhookDelivery.findFirst({
      where: { id: deliveryId },
      include: { subscription: true },
    });
    if (!delivery || !delivery.subscription) {
      return;
    }

    const secret = this.crypto.decryptSecret(
      delivery.subscription.secretCiphertext,
    );
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = JSON.stringify({
      id: delivery.id,
      event: delivery.event,
      timestamp,
      data: delivery.payload,
    });
    const signature = createHmac('sha256', secret)
      .update(`${timestamp}.${body}`)
      .digest('hex');

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      WEBHOOK_REQUEST_TIMEOUT_MS,
    );

    try {
      const response = await this.doFetch(delivery.subscription.url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'ordo-signature': signature,
          'ordo-timestamp': timestamp,
        },
        body,
        signal: controller.signal,
      });

      if (response.ok) {
        await delegates.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: 'delivered',
            attempts: delivery.attempts + 1,
            lastError: null,
            nextRetryAt: null,
          },
        });
        return;
      }

      await this.recordFailure(
        delivery.id,
        delivery.attempts + 1,
        `Receiver responded with status ${response.status}`,
      );
    } catch (error) {
      await this.recordFailure(
        delivery.id,
        delivery.attempts + 1,
        error instanceof Error ? error.message : 'Delivery failed',
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private async recordFailure(
    deliveryId: string,
    attempts: number,
    lastError: string,
  ): Promise<void> {
    const delegates = webhookDelegates(this.prisma);
    const exhausted = attempts >= WEBHOOK_MAX_ATTEMPTS;

    await delegates.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: 'failed',
        attempts,
        lastError,
        nextRetryAt: exhausted
          ? null
          : new Date(Date.now() + webhookRetryDelayMs(attempts)),
      },
    });

    if (exhausted) {
      this.logger.warn(
        `Webhook delivery ${deliveryId} exhausted after ${attempts} attempts`,
      );
    }
  }
}
