import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionStatus } from '@prisma/client';
import type Stripe from 'stripe';
import { PrismaService } from '../database/prisma.service';
import { PlanLimitsService } from './plan-limits.service';
import { BillingConfig } from './billing.config';
import { BillingService } from './billing.service';
import { StripeService } from './stripe.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

const TEST_PRICES = {
  STRIPE_PRICE_PRO_MONTHLY: 'price_pro_month',
  STRIPE_PRICE_PRO_ANNUAL: 'price_pro_year',
  STRIPE_PRICE_TEAM_MONTHLY: 'price_team_month',
  STRIPE_PRICE_TEAM_ANNUAL: 'price_team_year',
};

describe('BillingService (ODD 012 S2)', () => {
  let service: BillingService;

  const mockSubscriptionModel = {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  };
  const mockUserModel = { findUnique: jest.fn() };
  const mockWorkspace = { count: jest.fn().mockResolvedValue(0) };
  const mockProject = { count: jest.fn().mockResolvedValue(0) };
  const mockAttachment = {
    aggregate: jest.fn().mockResolvedValue({ _sum: { filesize: 0 } }),
  };
  const mockCredits = { findUnique: jest.fn().mockResolvedValue(null) };
  const mockPrisma = {
    subscription: mockSubscriptionModel,
    user: mockUserModel,
    workspace: mockWorkspace,
    project: mockProject,
    attachment: mockAttachment,
    aiCreditAccount: mockCredits,
  };

  const mockCustomersCreate = jest.fn();
  const mockCheckoutCreate = jest.fn();
  const mockPortalCreate = jest.fn();
  const mockStripe = {
    customers: { create: mockCustomersCreate },
    checkout: { sessions: { create: mockCheckoutCreate } },
    billingPortal: { sessions: { create: mockPortalCreate } },
  } as unknown as Stripe;

  const getSession = () =>
    ({
      getClient: jest.fn(() => mockStripe),
    }) as unknown as StripeService;

  const dto: CreateCheckoutDto = { planId: 'pro', interval: 'month' };

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
        BillingService,
        BillingConfig,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: StripeService, useValue: getSession() },
        {
          provide: PlanLimitsService,
          useValue: { getEffectivePlanId: jest.fn().mockResolvedValue('free') },
        },
      ],
    }).compile();
    service = module.get<BillingService>(BillingService);
  });

  describe('createCheckoutSession', () => {
    const activeUser = {
      id: 'u1',
      email: 'u1@test.dev',
      name: 'Usuaria Uno',
      subscription: null,
    };

    it('creates a Stripe customer on first purchase and persists it (INCOMPLETE)', async () => {
      mockUserModel.findUnique.mockResolvedValue(activeUser);
      mockCustomersCreate.mockResolvedValue({ id: 'cus_new' });
      mockCheckoutCreate.mockResolvedValue({
        id: 'cs_1',
        url: 'https://checkout.stripe.com/x',
      });

      const result = await service.createCheckoutSession('u1', dto);

      expect(mockCustomersCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'u1@test.dev',
          metadata: { userId: 'u1' },
        }),
      );
      expect(mockSubscriptionModel.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1' },
          create: expect.objectContaining({
            plan: 'FREE',
            status: SubscriptionStatus.INCOMPLETE,
            stripeCustomerId: 'cus_new',
          }),
        }),
      );
      expect(mockCheckoutCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription',
          customer: 'cus_new',
          line_items: [{ price: 'price_pro_month', quantity: 1 }],
        }),
      );
      expect(result.url).toBe('https://checkout.stripe.com/x');
    });

    it('reuses the existing Stripe customer', async () => {
      mockUserModel.findUnique.mockResolvedValue({
        ...activeUser,
        subscription: { stripeCustomerId: 'cus_existing' },
      });
      mockCheckoutCreate.mockResolvedValue({
        id: 'cs_2',
        url: 'https://checkout.stripe.com/y',
      });

      await service.createCheckoutSession('u1', dto);

      expect(mockCustomersCreate).not.toHaveBeenCalled();
      expect(mockCheckoutCreate).toHaveBeenCalledWith(
        expect.objectContaining({ customer: 'cus_existing' }),
      );
    });

    it('buys Team with one price line at the requested seat count', async () => {
      mockUserModel.findUnique.mockResolvedValue(activeUser);
      mockCheckoutCreate.mockResolvedValue({
        id: 'cs_3',
        url: 'https://checkout.stripe.com/z',
      });

      await service.createCheckoutSession('u1', {
        planId: 'team',
        interval: 'year',
        seats: 5,
      });

      expect(mockCheckoutCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [{ price: 'price_team_year', quantity: 5 }],
        }),
      );
    });

    it('rejects Team with fewer than 2 seats', async () => {
      await expect(
        service.createCheckoutSession('u1', {
          planId: 'team',
          interval: 'month',
          seats: 1,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockCheckoutCreate).not.toHaveBeenCalled();
    });

    it('rejects plans that are not bought through checkout', async () => {
      await expect(
        service.createCheckoutSession('u1', {
          planId: 'enterprise' as unknown as 'pro',
          interval: 'month',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('sends an existing paid subscriber to the portal instead of a second checkout', async () => {
      mockUserModel.findUnique.mockResolvedValue({
        ...activeUser,
        subscription: {
          stripeCustomerId: 'cus_existing',
          status: SubscriptionStatus.ACTIVE,
          stripeSubscriptionId: 'sub_1',
        },
      });

      await expect(service.createCheckoutSession('u1', dto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockCheckoutCreate).not.toHaveBeenCalled();
    });

    it('fails with 503 when the price for the plan/cycle is not configured', async () => {
      delete process.env.STRIPE_PRICE_PRO_ANNUAL;
      mockUserModel.findUnique.mockResolvedValue(activeUser);
      try {
        await expect(
          service.createCheckoutSession('u1', {
            planId: 'pro',
            interval: 'year',
          }),
        ).rejects.toMatchObject({ status: HttpStatus.SERVICE_UNAVAILABLE });
      } finally {
        process.env.STRIPE_PRICE_PRO_ANNUAL =
          TEST_PRICES.STRIPE_PRICE_PRO_ANNUAL;
      }
    });

    it('fails with 404 for an unknown user', async () => {
      mockUserModel.findUnique.mockResolvedValue(null);
      await expect(service.createCheckoutSession('ghost', dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createPortalSession', () => {
    it('returns 402 when the user has no Stripe customer yet', async () => {
      mockSubscriptionModel.findUnique.mockResolvedValue(null);
      await expect(service.createPortalSession('u1')).rejects.toMatchObject({
        status: HttpStatus.PAYMENT_REQUIRED,
      });
    });

    it('creates a portal session for an existing customer', async () => {
      mockSubscriptionModel.findUnique.mockResolvedValue({
        stripeCustomerId: 'cus_existing',
      });
      mockPortalCreate.mockResolvedValue({
        url: 'https://billing.stripe.com/p/session',
      });

      const result = await service.createPortalSession('u1');

      expect(mockPortalCreate).toHaveBeenCalledWith(
        expect.objectContaining({ customer: 'cus_existing' }),
      );
      expect(result.url).toBe('https://billing.stripe.com/p/session');
    });
  });

  describe('getSubscriptionState', () => {
    it('returns Free defaults when there is no subscription row', async () => {
      mockSubscriptionModel.findUnique.mockResolvedValue(null);

      const state = await service.getSubscriptionState('u1');

      expect(state).toEqual(
        expect.objectContaining({
          plan: 'FREE',
          status: null,
          seats: 1,
          hasStripeCustomer: false,
        }),
      );
    });

    it('maps the row fields for the UI', async () => {
      mockSubscriptionModel.findUnique.mockResolvedValue({
        plan: 'PRO',
        status: SubscriptionStatus.ACTIVE,
        interval: 'MONTH',
        seats: 1,
        cancelAtPeriodEnd: false,
        trialEndsAt: null,
        currentPeriodStart: new Date(0),
        stripeCurrentPeriodEnd: new Date(0),
        stripeCustomerId: 'cus_existing',
      });

      const state = await service.getSubscriptionState('u1');

      expect(state).toEqual(
        expect.objectContaining({
          plan: 'PRO',
          status: SubscriptionStatus.ACTIVE,
          interval: 'MONTH',
          currentPeriodEnd: new Date(0),
          hasStripeCustomer: true,
        }),
      );
    });
  });

  describe('getUsageOverview (ODD 012 S6/T5)', () => {
    it('compone estado + límites del plan efectivo + uso + créditos', async () => {
      mockSubscriptionModel.findUnique.mockResolvedValue({
        plan: 'PRO',
        status: 'ACTIVE',
        interval: 'MONTH',
        seats: 1,
        cancelAtPeriodEnd: false,
        trialEndsAt: null,
        graceEndsAt: null,
        currentPeriodStart: new Date(0),
        stripeCurrentPeriodEnd: new Date(0),
        stripeCustomerId: 'cus_existing',
      });
      mockWorkspace.count.mockResolvedValue(2);
      mockProject.count.mockResolvedValue(7);
      mockAttachment.aggregate.mockResolvedValue({ _sum: { filesize: 512 } });
      mockCredits.findUnique.mockResolvedValue({ balance: 37 });

      const overview = await service.getUsageOverview('u1');

      expect(overview).toEqual(
        expect.objectContaining({
          plan: 'PRO',
          status: 'ACTIVE',
          effectivePlan: 'free', // el mock por defecto del PlanLimitsService
          usage: { workspaces: 2, projects: 7, storageUsedBytes: 512 },
          aiCredits: { balance: 37 },
        }),
      );
      expect(overview.limits.projects).toBe(3); // límites del plan free
    });

    it('sin cuenta de créditos ni datos → ceros, plan Free', async () => {
      mockSubscriptionModel.findUnique.mockResolvedValue(null);
      mockWorkspace.count.mockResolvedValue(0);
      mockAttachment.aggregate.mockResolvedValue({ _sum: { filesize: null } });
      mockCredits.findUnique.mockResolvedValue(null);

      const overview = await service.getUsageOverview('u1');

      expect(overview.effectivePlan).toBe('free');
      expect(overview.aiCredits).toEqual({ balance: 0 });
      expect(overview.usage.storageUsedBytes).toBe(0);
    });
  });

  describe('Stripe not configured', () => {
    it('checkout fails with 503 and a clear message', async () => {
      const realKey = process.env.STRIPE_SECRET_KEY;
      delete process.env.STRIPE_SECRET_KEY;
      mockUserModel.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'u1@test.dev',
        name: 'Usuaria Uno',
        subscription: null,
      });
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          BillingService,
          BillingConfig,
          { provide: PrismaService, useValue: mockPrisma },
          {
            provide: StripeService,
            useValue: new StripeService(new BillingConfig()),
          },
          {
            provide: PlanLimitsService,
            useValue: { getEffectivePlanId: jest.fn().mockResolvedValue('free') },
          },
        ],
      }).compile();
      const unconfigured = module.get<BillingService>(BillingService);
      try {
        await expect(
          unconfigured.createCheckoutSession('u1', dto),
        ).rejects.toThrow(HttpException);
        await expect(
          unconfigured.createCheckoutSession('u1', dto),
        ).rejects.toMatchObject({
          status: HttpStatus.SERVICE_UNAVAILABLE,
        });
      } finally {
        process.env.STRIPE_SECRET_KEY = realKey;
      }
    });
  });
});
