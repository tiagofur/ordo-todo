import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  SubscriptionInterval,
  SubscriptionPlan,
  SubscriptionStatus,
} from '@prisma/client';
import { PLANS, type PlanId } from '@ordo-todo/config';
import Stripe from 'stripe';
import { PrismaService } from '../database/prisma.service';
import { BillingConfig } from './billing.config';
import { StripeService } from './stripe.service';
import { PlanLimitsService } from './plan-limits.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

export interface CheckoutSessionResult {
  url: string;
  sessionId: string;
}

export interface PortalSessionResult {
  url: string;
}

export interface UsageOverviewDto extends SubscriptionStateDto {
  effectivePlan: PlanId;
  limits: (typeof PLANS)[PlanId]['limits'];
  usage: {
    workspaces: number;
    projects: number;
    storageUsedBytes: number;
  };
  aiCredits: { balance: number };
}

export interface SubscriptionStateDto {
  plan: SubscriptionPlan;
  status: SubscriptionStatus | null;
  interval: SubscriptionInterval | null;
  seats: number;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: Date | null;
  graceEndsAt: Date | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  hasStripeCustomer: boolean;
}

const PLANS_WITH_CHECKOUT = new Set<string>(['pro', 'team']);

/**
 * Checkout + Customer Portal (ODD 012 S2). Subscription rows themselves are
 * only ever written by the webhook service — this service never trusts the
 * browser: hitting the webhook is the only path that flips someone to a paid
 * plan.
 */
@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly billingConfig: BillingConfig,
    private readonly planLimits: PlanLimitsService,
  ) {}

  async createCheckoutSession(
    userId: string,
    dto: CreateCheckoutDto,
  ): Promise<CheckoutSessionResult> {
    if (!PLANS_WITH_CHECKOUT.has(dto.planId)) {
      throw new BadRequestException(
        `El plan '${dto.planId}' no se compra por checkout (Free no se paga; Enterprise se contrata aparte).`,
      );
    }
    const plan: SubscriptionPlan =
      dto.planId === 'team' ? SubscriptionPlan.TEAM : SubscriptionPlan.PRO;
    const interval: SubscriptionInterval =
      dto.interval === 'year'
        ? SubscriptionInterval.YEAR
        : SubscriptionInterval.MONTH;

    const seats = dto.planId === 'team' ? (dto.seats ?? 2) : 1;
    if (dto.planId === 'team' && seats < 2) {
      throw new BadRequestException(
        'El plan Team requiere un mínimo de 2 asientos.',
      );
    }

    const priceRef = this.billingConfig.priceFor(plan, interval);
    if (!priceRef) {
      throw new HttpException(
        `No hay precio de Stripe configurado para ${dto.planId}/${dto.interval} (revisa STRIPE_PRICE_*).`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, subscription: true },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    // A user with a live paid subscription changes plan/cancel through the
    // portal; a second checkout would create a second Stripe subscription.
    const BLOCKING_STATUSES: SubscriptionStatus[] = [
      SubscriptionStatus.ACTIVE,
      SubscriptionStatus.TRIALING,
      SubscriptionStatus.PAST_DUE,
    ];
    if (
      user.subscription &&
      BLOCKING_STATUSES.includes(user.subscription.status) &&
      user.subscription.stripeSubscriptionId
    ) {
      throw new ConflictException(
        'Ya tienes una suscripción activa: usa el portal de facturación para cambiar de plan o cancelar.',
      );
    }

    const stripe = this.stripeService.getClient();
    const customerId = await this.ensureStripeCustomer(user, stripe);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: priceRef.priceId,
          quantity: seats,
        },
      ],
      subscription_data: {
        metadata: { userId, planId: dto.planId, interval: dto.interval },
      },
      metadata: { userId, planId: dto.planId, interval: dto.interval },
      success_url: `${this.billingConfig.frontendUrl}/settings/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.billingConfig.frontendUrl}/settings/billing?checkout=canceled`,
    });

    if (!session.url) {
      throw new HttpException(
        'Stripe no devolvió URL de checkout.',
        HttpStatus.BAD_GATEWAY,
      );
    }
    return { url: session.url, sessionId: session.id };
  }

  async createPortalSession(userId: string): Promise<PortalSessionResult> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      select: { stripeCustomerId: true },
    });
    if (!subscription?.stripeCustomerId) {
      throw new HttpException(
        'Aún no tienes suscripción: primero suscríbete desde la página de planes.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
    const stripe = this.stripeService.getClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${this.billingConfig.frontendUrl}/settings/billing`,
    });
    return { url: session.url };
  }

  async getSubscriptionState(userId: string): Promise<SubscriptionStateDto> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    if (!subscription) {
      return {
        plan: SubscriptionPlan.FREE,
        status: null,
        interval: null,
        seats: 1,
        cancelAtPeriodEnd: false,
        trialEndsAt: null,
        graceEndsAt: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        hasStripeCustomer: false,
      };
    }
    return {
      plan: subscription.plan,
      status: subscription.status,
      interval: subscription.interval,
      seats: subscription.seats,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      trialEndsAt: subscription.trialEndsAt,
      graceEndsAt: subscription.graceEndsAt,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.stripeCurrentPeriodEnd,
      hasStripeCustomer: Boolean(subscription.stripeCustomerId),
    };
  }

  /**
   * Everything the billing UI (T5) needs in one call: subscription state,
   * effective plan with its limits, current usage against them and the AI
   * credit balance. Usage mirrors the enforcement's semantics (owned
   * workspaces, projects/storage inside them, trash excluded) but
   * AGGREGATED across all owned workspaces, while the enforcement applies
   * per workspace — the aggregate is always ≥ any per-workspace count, so
   * the UI never shows headroom the enforcement would deny.
   */
  async getUsageOverview(
    userId: string,
    now: Date = new Date(),
  ): Promise<UsageOverviewDto> {
    const state = await this.getSubscriptionState(userId);
    const planId = await this.planLimits.getEffectivePlanId(userId, now);
    const limits = PLANS[planId].limits;

    const [workspaces, projects, storage, credits] = await Promise.all([
      this.prisma.workspace.count({
        where: { ownerId: userId, deletedAt: null },
      }),
      this.prisma.project.count({
        where: {
          workspace: { ownerId: userId, deletedAt: null },
          isDeleted: false,
        },
      }),
      this.prisma.attachment.aggregate({
        _sum: { filesize: true },
        where: {
          task: { project: { workspace: { ownerId: userId, deletedAt: null } } },
        },
      }),
      this.prisma.aiCreditAccount.findUnique({
        where: { userId },
        select: { balance: true },
      }),
    ]);

    return {
      ...state,
      effectivePlan: planId,
      limits,
      usage: {
        workspaces,
        projects,
        storageUsedBytes: storage._sum.filesize ?? 0,
      },
      aiCredits: { balance: credits?.balance ?? 0 },
    };
  }

  /**
   * Returns the Stripe customer for this user, creating (and persisting) one
   * on first purchase. The Subscription row is created with status INCOMPLETE
   * so the portal works right after checkout starts; the webhook flips it to
   * ACTIVE/TRIALING once Stripe confirms payment.
   */
  private async ensureStripeCustomer(
    user: {
      id: string;
      email: string;
      name: string | null;
      subscription: { stripeCustomerId: string | null } | null;
    },
    stripe: Stripe,
  ): Promise<string> {
    if (user.subscription?.stripeCustomerId) {
      return user.subscription.stripeCustomerId;
    }
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    await this.prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.INCOMPLETE,
        stripeCustomerId: customer.id,
      },
      update: { stripeCustomerId: customer.id },
    });
    return customer.id;
  }
}
