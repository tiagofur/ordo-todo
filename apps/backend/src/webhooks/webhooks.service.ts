import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { AuthAuditService } from '../auth/auth-audit.service';
import { AuthEventType } from '../auth/types/auth-event.types';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { webhookDelegates } from './webhook.delegate';
import { WebhookCryptoService } from './webhook-crypto.service';
import { WEBHOOK_EVENTS, WEBHOOK_SECRET_PREFIX } from './webhook.constants';

export interface CreatedWebhook {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: Date;
  secret: string;
}

export interface WebhookSummary {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface WebhookDeliverySummary {
  id: string;
  event: string;
  status: string;
  attempts: number;
  lastError: string | null;
  createdAt: Date;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: WebhookCryptoService,
    @Optional()
    @Inject(AuthAuditService)
    private readonly audit?: AuthAuditService,
  ) {}

  async create(userId: string, dto: CreateWebhookDto): Promise<CreatedWebhook> {
    let parsed: URL;
    try {
      parsed = new URL(dto.url);
    } catch {
      throw new BadRequestException('Invalid webhook URL');
    }
    if (parsed.protocol !== 'https:') {
      throw new BadRequestException('Webhook URL must use https');
    }

    const known = WEBHOOK_EVENTS as readonly string[];
    const unknown = dto.events.filter((event) => !known.includes(event));
    if (unknown.length > 0) {
      throw new BadRequestException(`Unknown events: ${unknown.join(', ')}`);
    }

    const secret = `${WEBHOOK_SECRET_PREFIX}${randomBytes(24).toString('base64url')}`;
    const { ciphertext, fingerprint } = this.crypto.encryptSecret(secret);

    const created = await webhookDelegates(
      this.prisma,
    ).webhookSubscription.create({
      data: {
        userId,
        url: dto.url,
        events: dto.events,
        secretCiphertext: ciphertext,
        secretFingerprint: fingerprint,
      },
    });

    this.logger.log(
      `Webhook subscription created for user ${userId} (${created.id})`,
    );
    await this.audit?.logEvent({
      type: AuthEventType.WEBHOOK_CREATED,
      userId,
      timestamp: new Date(),
      metadata: {
        subscriptionId: created.id,
        url: created.url,
        events: created.events,
      },
    });

    return {
      id: created.id,
      url: created.url,
      events: created.events,
      isActive: created.isActive,
      createdAt: created.createdAt,
      secret,
    };
  }

  async list(userId: string): Promise<WebhookSummary[]> {
    const subscriptions = await webhookDelegates(
      this.prisma,
    ).webhookSubscription.findMany({
      where: { userId },
      select: {
        id: true,
        url: true,
        events: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return subscriptions.map((subscription) => ({
      id: subscription.id as string,
      url: subscription.url as string,
      events: subscription.events ?? [],
      isActive: subscription.isActive as boolean,
      createdAt: subscription.createdAt as Date,
    }));
  }

  async remove(userId: string, subscriptionId: string): Promise<void> {
    const result = await webhookDelegates(
      this.prisma,
    ).webhookSubscription.deleteMany({
      where: { id: subscriptionId, userId },
    });

    if (result.count === 0) {
      throw new NotFoundException('Webhook subscription not found');
    }

    this.logger.log(
      `Webhook subscription ${subscriptionId} removed by user ${userId}`,
    );
    await this.audit?.logEvent({
      type: AuthEventType.WEBHOOK_DELETED,
      userId,
      timestamp: new Date(),
      metadata: { subscriptionId },
    });
  }

  async listDeliveries(
    userId: string,
    subscriptionId: string,
  ): Promise<WebhookDeliverySummary[]> {
    const subscription = await webhookDelegates(
      this.prisma,
    ).webhookSubscription.findFirst({
      where: { id: subscriptionId, userId },
    });
    if (!subscription) {
      throw new NotFoundException('Webhook subscription not found');
    }

    const deliveries = await webhookDelegates(
      this.prisma,
    ).webhookDelivery.findMany({
      where: { subscriptionId },
      orderBy: { createdAt: 'desc' },
    });

    return deliveries.map((delivery) => ({
      id: delivery.id,
      event: delivery.event,
      status: delivery.status,
      attempts: delivery.attempts,
      lastError: delivery.lastError,
      createdAt: delivery.createdAt,
    }));
  }
}
