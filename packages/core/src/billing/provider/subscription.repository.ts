import { Subscription } from '../model/subscription.entity';
import { SubscriptionPlan, SubscriptionStatus } from '../model/subscription-enums';

/**
 * Input for creating/updating subscription
 */
export interface SubscriptionInput {
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripeCurrentPeriodEnd?: Date;
}

/**
 * Repository interface for Subscription domain
 */
export interface SubscriptionRepository {
  /**
   * Create subscription
   */
  create(input: SubscriptionInput): Promise<Subscription>;

  /**
   * Get subscription by ID
   */
  findById(id: string): Promise<Subscription | null>;

  /**
   * Get subscription by user ID
   */
  findByUserId(userId: string): Promise<Subscription | null>;

  /**
   * Get subscription by Stripe customer ID
   */
  findByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | null>;

  /**
   * Get subscription by Stripe subscription ID
   */
  findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null>;

  /**
   * Update subscription
   */
  update(id: string, input: Partial<SubscriptionInput>): Promise<Subscription>;

  /**
   * Update subscription status
   */
  updateStatus(id: string, status: SubscriptionStatus): Promise<Subscription>;

  /**
   * Get all active subscriptions
   */
  findActive(): Promise<Subscription[]>;

  /**
   * Get subscriptions by plan
   */
  findByPlan(plan: SubscriptionPlan): Promise<Subscription[]>;

  /**
   * Get subscriptions expiring soon (within 7 days)
   */
  findExpiringSoon(): Promise<Subscription[]>;

  /**
   * Cancel subscription
   */
  cancel(id: string): Promise<Subscription>;
}
