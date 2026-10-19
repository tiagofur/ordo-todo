import { PrismaService } from '../database/prisma.service';

/**
 * Minimal structural shapes of the Prisma webhook delegates.
 *
 * Same rationale as `api-token.delegate.ts`: the generated client in a
 * fresh checkout predates these models until `prisma generate` runs.
 * Unit tests mock these delegates.
 */
export interface WebhookSubscriptionRecord {
  id: string;
  userId: string;
  url: string;
  events: string[];
  secretCiphertext: string;
  secretFingerprint: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookDeliveryRecord {
  id: string;
  subscriptionId: string;
  event: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'delivered' | 'failed';
  attempts: number;
  lastError: string | null;
  nextRetryAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  subscription?: WebhookSubscriptionRecord;
}

interface DelegateSubscription {
  create(args: {
    data: {
      userId: string;
      url: string;
      events: string[];
      secretCiphertext: string;
      secretFingerprint: string;
    };
  }): Promise<WebhookSubscriptionRecord>;
  findMany(args: {
    where: { userId?: string; isActive?: boolean };
    select?: Record<string, boolean>;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<Partial<WebhookSubscriptionRecord>[]>;
  findFirst(args: {
    where: { id: string; userId: string };
  }): Promise<WebhookSubscriptionRecord | null>;
  deleteMany(args: {
    where: { id: string; userId: string };
  }): Promise<{ count: number }>;
}

interface DelegateDelivery {
  create(args: {
    data: {
      subscriptionId: string;
      event: string;
      payload: Record<string, unknown>;
      status: 'pending' | 'delivered' | 'failed';
      attempts: number;
      lastError?: string | null;
      nextRetryAt?: Date | null;
    };
  }): Promise<WebhookDeliveryRecord>;
  findMany(args: {
    where: {
      subscriptionId?: string;
      status?: 'pending' | 'delivered' | 'failed';
      nextRetryAt?: { lte: Date };
    };
    include?: { subscription: boolean };
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<WebhookDeliveryRecord[]>;
  findFirst(args: {
    where: { id: string };
    include?: { subscription: boolean };
  }): Promise<WebhookDeliveryRecord | null>;
  update(args: {
    where: { id: string };
    data: Partial<
      Pick<
        WebhookDeliveryRecord,
        'status' | 'attempts' | 'lastError' | 'nextRetryAt'
      >
    >;
  }): Promise<WebhookDeliveryRecord>;
}

interface WebhookDelegates {
  webhookSubscription: DelegateSubscription;
  webhookDelivery: DelegateDelivery;
}

export function webhookDelegates(prisma: PrismaService): WebhookDelegates {
  return prisma as unknown as WebhookDelegates;
}
