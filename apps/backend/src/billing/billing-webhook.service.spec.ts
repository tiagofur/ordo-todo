import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionStatus } from '@prisma/client';
import type Stripe from 'stripe';
import { PrismaService } from '../database/prisma.service';
import { BillingConfig } from './billing.config';
import {
  BillingWebhookService,
  intervalFromMetadata,
  mapStatus,
  planFromMetadata,
} from './billing-webhook.service';
import { StripeService } from './stripe.service';

const TEST_PRICES = {
  STRIPE_PRICE_PRO_MONTHLY: 'price_pro_month',
  STRIPE_PRICE_TEAM_MONTHLY: 'price_team_month',
};

// Fixed epoch seconds — timezone-hermetic by construction.
const PERIOD_START_S = 1760000000;
const PERIOD_END_S = 1762592000;

const stripeSubscription = (overrides: Partial<Record<string, unknown>> = {}) =>
  ({
    id: 'sub_stripe_1',
    customer: 'cus_1',
    status: 'active',
    cancel_at_period_end: false,
    trial_end: null,
    metadata: {},
    items: {
      data: [
        {
          price: { id: 'price_pro_month' },
          quantity: 1,
          current_period_start: PERIOD_START_S,
          current_period_end: PERIOD_END_S,
        },
      ],
    },
    ...overrides,
  }) as unknown as Stripe.Subscription;

describe('mappers (plan/interval/status desde Stripe)', () => {
  it('mapStatus cubre los 8 estados de la API de Stripe', () => {
    expect(mapStatus('active')).toBe(SubscriptionStatus.ACTIVE);
    expect(mapStatus('trialing')).toBe(SubscriptionStatus.TRIALING);
    expect(mapStatus('past_due')).toBe(SubscriptionStatus.PAST_DUE);
    expect(mapStatus('canceled')).toBe(SubscriptionStatus.CANCELED);
    expect(mapStatus('unpaid')).toBe(SubscriptionStatus.UNPAID);
    expect(mapStatus('incomplete')).toBe(SubscriptionStatus.INCOMPLETE);
    expect(mapStatus('incomplete_expired')).toBe(
      SubscriptionStatus.INCOMPLETE_EXPIRED,
    );
    expect(mapStatus('paused')).toBe(SubscriptionStatus.UNPAID);
    expect(mapStatus('desconocido')).toBeNull();
  });

  it('planFromMetadata normaliza el planId en minúsculas que escribe el checkout', () => {
    expect(planFromMetadata('pro')).toBe('PRO');
    expect(planFromMetadata('team')).toBe('TEAM');
    expect(planFromMetadata('TEAM')).toBe('TEAM');
    expect(planFromMetadata('enterprise')).toBe('ENTERPRISE');
    expect(planFromMetadata('gratis')).toBeUndefined();
    expect(planFromMetadata(undefined)).toBeUndefined();
  });

  it('intervalFromMetadata mapea month y year', () => {
    expect(intervalFromMetadata('month')).toBe('MONTH');
    expect(intervalFromMetadata('year')).toBe('YEAR');
    expect(intervalFromMetadata('semanal')).toBeUndefined();
  });
});

describe('BillingWebhookService (ODD 012 S3)', () => {
  let service: BillingWebhookService;

  const mockWebhookEvent = { findUnique: jest.fn(), create: jest.fn() };
  const mockSubscriptionModel = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const mockPrisma = {
    billingWebhookEvent: mockWebhookEvent,
    subscription: mockSubscriptionModel,
  };

  const mockSubscriptionsRetrieve = jest.fn();
  const mockStripe = {
    subscriptions: { retrieve: mockSubscriptionsRetrieve },
  } as unknown as Stripe;

  const event = (
    type: string,
    dataObject: unknown,
    id = 'evt_1',
  ): Stripe.Event =>
    ({ id, type, data: { object: dataObject } }) as unknown as Stripe.Event;

  beforeAll(() => {
    Object.assign(process.env, TEST_PRICES);
  });

  afterAll(() => {
    for (const key of Object.keys(TEST_PRICES)) {
      delete process.env[key];
    }
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingWebhookService,
        BillingConfig,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: StripeService, useValue: { getClient: () => mockStripe } },
      ],
    }).compile();
    service = module.get<BillingWebhookService>(BillingWebhookService);
  });

  describe('idempotency (same event.id delivered again)', () => {
    it('processes once and answers "duplicate" on retries with no side effects', async () => {
      mockWebhookEvent.findUnique
        .mockResolvedValueOnce(null) // 1st delivery: not seen before
        .mockResolvedValueOnce({ id: 'evt_1' }) // 2nd delivery
        .mockResolvedValueOnce({ id: 'evt_1' }); // 3rd delivery
      mockSubscriptionsRetrieve.mockResolvedValue(stripeSubscription());
      mockSubscriptionModel.findUnique.mockResolvedValue(null);
      mockSubscriptionModel.create.mockResolvedValue({});
      mockWebhookEvent.create.mockResolvedValue({});

      const first = await service.processEvent(
        event('checkout.session.completed', {
          subscription: 'sub_stripe_1',
          customer: 'cus_1',
          metadata: { userId: 'u1' },
        }),
      );
      const second = await service.processEvent(
        event(
          'checkout.session.completed',
          {
            subscription: 'sub_stripe_1',
            customer: 'cus_1',
            metadata: { userId: 'u1' },
          },
          'evt_1',
        ),
      );
      const third = await service.processEvent(
        event(
          'checkout.session.completed',
          {
            subscription: 'sub_stripe_1',
            customer: 'cus_1',
            metadata: { userId: 'u1' },
          },
          'evt_1',
        ),
      );

      expect(first).toBe('processed');
      expect(second).toBe('duplicate');
      expect(third).toBe('duplicate');
      // 3 deliveries → exactly 1 applied effect
      expect(mockSubscriptionModel.create).toHaveBeenCalledTimes(1);
      expect(mockWebhookEvent.create).toHaveBeenCalledTimes(1);
    });

    it('rethrows errors that are not duplicate-key violations when recording', async () => {
      mockWebhookEvent.findUnique.mockResolvedValue(null);
      mockWebhookEvent.create.mockRejectedValue(new Error('db down'));
      mockSubscriptionModel.findUnique.mockResolvedValue(null);
      mockSubscriptionModel.update.mockResolvedValue({});

      await expect(
        service.processEvent(
          event('customer.subscription.updated', stripeSubscription()),
        ),
      ).rejects.toThrow('db down');
    });

    it('treats a concurrent-duplicate ledger insert as success (effect already applied)', async () => {
      mockWebhookEvent.findUnique.mockResolvedValue(null);
      mockWebhookEvent.create.mockRejectedValue({ code: 'P2002' });
      mockSubscriptionModel.findUnique.mockResolvedValue({
        id: 'row1',
        userId: 'u1',
        plan: 'PRO',
      });
      mockSubscriptionModel.update.mockResolvedValue({});

      const result = await service.processEvent(
        event(
          'customer.subscription.updated',
          stripeSubscription({ metadata: { userId: 'u1' } }),
        ),
      );

      expect(result).toBe('processed');
      expect(mockSubscriptionModel.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkout.session.completed', () => {
    it('creates the subscription row with plan, seats and periods from Stripe', async () => {
      mockWebhookEvent.create.mockResolvedValue({});
      mockSubscriptionsRetrieve.mockResolvedValue(
        stripeSubscription({ metadata: { userId: 'u1' } }),
      );
      mockSubscriptionModel.findUnique.mockResolvedValue(null);
      mockSubscriptionModel.create.mockResolvedValue({});

      const result = await service.processEvent(
        event('checkout.session.completed', {
          subscription: 'sub_stripe_1',
          customer: 'cus_1',
          metadata: { userId: 'u1' },
        }),
      );

      expect(result).toBe('processed');
      expect(mockSubscriptionsRetrieve).toHaveBeenCalledWith('sub_stripe_1');
      expect(mockSubscriptionModel.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'u1',
          plan: 'PRO',
          status: SubscriptionStatus.ACTIVE,
          stripeSubscriptionId: 'sub_stripe_1',
          stripeCustomerId: 'cus_1',
          stripePriceId: 'price_pro_month',
          seats: 1,
          currentPeriodStart: new Date(PERIOD_START_S * 1000),
          stripeCurrentPeriodEnd: new Date(PERIOD_END_S * 1000),
        }),
      });
    });

    it('ignores sessions without a subscription or user linkage', async () => {
      mockWebhookEvent.create.mockResolvedValue({});

      const result = await service.processEvent(
        event('checkout.session.completed', {
          customer: 'cus_1',
          metadata: {},
        }),
      );

      expect(result).toBe('processed');
      expect(mockSubscriptionsRetrieve).not.toHaveBeenCalled();
      expect(mockSubscriptionModel.create).not.toHaveBeenCalled();
    });
  });

  describe('customer.subscription.updated', () => {
    it('updates an existing row from the Stripe object', async () => {
      mockWebhookEvent.create.mockResolvedValue({});
      mockSubscriptionModel.findUnique.mockResolvedValue({
        id: 'row1',
        userId: 'u1',
        plan: 'PRO',
      });
      mockSubscriptionModel.update.mockResolvedValue({});

      await service.processEvent(
        event('customer.subscription.updated', stripeSubscription()),
      );

      expect(mockSubscriptionModel.update).toHaveBeenCalledWith({
        where: { id: 'row1' },
        data: expect.objectContaining({
          status: SubscriptionStatus.ACTIVE,
          seats: 1,
          cancelAtPeriodEnd: false,
        }),
      });
    });

    it('falls back to checkout metadata when the price is not in the configured map', async () => {
      mockWebhookEvent.create.mockResolvedValue({});
      mockSubscriptionModel.findUnique.mockResolvedValue(null);
      mockSubscriptionModel.create.mockResolvedValue({});
      mockSubscriptionsRetrieve.mockClear();

      await service.processEvent(
        event(
          'customer.subscription.updated',
          stripeSubscription({
            items: {
              data: [
                {
                  price: { id: 'price_unknown' },
                  quantity: 3,
                  current_period_start: PERIOD_START_S,
                  current_period_end: PERIOD_END_S,
                },
              ],
            },
            // Valor REAL que escribe el checkout (minúsculas): el fallback
            // debe normalizarlo, no reventar (hallazgo P2 de revisión).
            metadata: { userId: 'u2', planId: 'team', interval: 'year' },
          }),
        ),
      );

      expect(mockSubscriptionModel.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'u2',
          plan: 'TEAM',
          seats: 3,
        }),
      });
    });

    it('keeps the existing plan when neither the price map nor the metadata name one', async () => {
      mockWebhookEvent.create.mockResolvedValue({});
      mockSubscriptionModel.findUnique.mockResolvedValue({
        id: 'row1',
        userId: 'u1',
        plan: 'PRO',
      });
      mockSubscriptionModel.update.mockResolvedValue({});

      await service.processEvent(
        event(
          'customer.subscription.updated',
          stripeSubscription({
            items: {
              data: [
                {
                  price: { id: 'price_unknown' },
                  quantity: 1,
                  current_period_start: PERIOD_START_S,
                  current_period_end: PERIOD_END_S,
                },
              ],
            },
            metadata: {},
          }),
        ),
      );

      expect(mockSubscriptionModel.update).toHaveBeenCalledWith({
        where: { id: 'row1' },
        data: expect.objectContaining({ plan: 'PRO' }),
      });
    });
  });

  describe('customer.subscription.deleted', () => {
    it('marks the row CANCELED without touching the plan (grace is T4)', async () => {
      mockWebhookEvent.create.mockResolvedValue({});
      mockSubscriptionModel.findUnique.mockResolvedValue({
        id: 'row1',
        plan: 'PRO',
      });
      mockSubscriptionModel.update.mockResolvedValue({});

      const result = await service.processEvent(
        event('customer.subscription.deleted', stripeSubscription()),
      );

      expect(result).toBe('processed');
      const deletionCall = mockSubscriptionModel.update.mock.calls[0][0];
      expect(deletionCall).toEqual({
        where: { id: 'row1' },
        data: {
          status: SubscriptionStatus.CANCELED,
          cancelAtPeriodEnd: false,
          graceEndsAt: expect.any(Date),
        },
      });
      // gracia = GRACE_PERIOD_DAYS (14) desde la cancelación (±10 s)
      const grace = (deletionCall.data.graceEndsAt as Date).getTime();
      const expected = Date.now() + 14 * 24 * 60 * 60 * 1000;
      expect(Math.abs(grace - expected)).toBeLessThan(10_000);
    });

    it('does nothing for an unknown Stripe subscription', async () => {
      mockWebhookEvent.create.mockResolvedValue({});
      mockSubscriptionModel.findUnique.mockResolvedValue(null);

      await service.processEvent(
        event('customer.subscription.deleted', stripeSubscription()),
      );

      expect(mockSubscriptionModel.update).not.toHaveBeenCalled();
    });
  });

  describe('invoice.payment_failed', () => {
    it('moves the subscription to PAST_DUE', async () => {
      mockWebhookEvent.create.mockResolvedValue({});
      mockSubscriptionModel.findUnique.mockResolvedValue({ id: 'row1' });
      mockSubscriptionModel.update.mockResolvedValue({});

      const result = await service.processEvent(
        event('invoice.payment_failed', { customer: 'cus_1' }),
      );

      expect(result).toBe('processed');
      expect(mockSubscriptionModel.update).toHaveBeenCalledWith({
        where: { id: 'row1' },
        data: { status: SubscriptionStatus.PAST_DUE },
      });
    });
  });

  describe('uninteresting events', () => {
    it('answers "ignored" without touching rows (invoice.paid → T4)', async () => {
      mockWebhookEvent.create.mockResolvedValue({});

      const result = await service.processEvent(
        event('invoice.paid', { customer: 'cus_1' }),
      );

      expect(result).toBe('ignored');
      expect(mockSubscriptionModel.update).not.toHaveBeenCalled();
    });
  });
});
