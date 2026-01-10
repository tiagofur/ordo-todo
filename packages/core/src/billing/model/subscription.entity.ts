import { Entity } from '../../shared/entity';
import { SubscriptionPlan, SubscriptionStatus } from './subscription-enums';

// Re-export subscription enums for convenience
export { SubscriptionPlan, SubscriptionStatus };

/**
 * Properties for Subscription entity
 */
export interface SubscriptionProps {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripeCurrentPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Subscription entity represents user subscription plan
 *
 * Handles billing plans, subscription status, and Stripe integration.
 * Enforces business rules for plan upgrades, downgrades, and cancellations.
 *
 * @example
 * ```typescript
 * const subscription = new Subscription({
 *   id: 'sub-123',
 *   userId: 'user-456',
 *   plan: SubscriptionPlan.PRO,
 *   status: SubscriptionStatus.ACTIVE,
 *   stripeCustomerId: 'cus_xyz',
 *   stripeSubscriptionId: 'sub_xyz',
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * });
 *
 * subscription.isActive(); // true
 * subscription.canUpgradeTo(SubscriptionPlan.TEAM); // true
 * ```
 */
export class Subscription extends Entity<SubscriptionProps> {
  constructor(props: SubscriptionProps, mode: 'valid' | 'draft' = 'valid') {
    super(props, mode);
    if (mode === 'valid') {
      this.validate();
    }
  }

  /**
   * Validate subscription properties
   */
  private validate(): void {
    if (!this.props.userId || this.props.userId.trim() === '') {
      throw new Error('Subscription must have a valid userId');
    }
    if (!this.props.plan) {
      throw new Error('Subscription must have a plan');
    }
    if (!this.props.status) {
      throw new Error('Subscription must have a status');
    }

    // Validate Stripe IDs match the status
    if (this.props.status === SubscriptionStatus.ACTIVE) {
      if (!this.props.stripeSubscriptionId) {
        throw new Error('Active subscription must have stripeSubscriptionId');
      }
    }
  }

  // ===== Getters =====

  get userId(): string {
    return this.props.userId;
  }

  get plan(): SubscriptionPlan {
    return this.props.plan;
  }

  get status(): SubscriptionStatus {
    return this.props.status;
  }

  get stripeCustomerId(): string | undefined {
    return this.props.stripeCustomerId;
  }

  get stripeSubscriptionId(): string | undefined {
    return this.props.stripeSubscriptionId;
  }

  get stripePriceId(): string | undefined {
    return this.props.stripePriceId;
  }

  get stripeCurrentPeriodEnd(): Date | undefined {
    return this.props.stripeCurrentPeriodEnd;
  }

  // ===== Business Methods =====

  /**
   * Check if subscription is active
   */
  isActive(): boolean {
    return this.props.status === SubscriptionStatus.ACTIVE;
  }

  /**
   * Check if subscription is cancelled
   */
  isCancelled(): boolean {
    return this.props.status === SubscriptionStatus.CANCELED;
  }

  /**
   * Check if subscription is past due
   */
  isPastDue(): boolean {
    return this.props.status === SubscriptionStatus.PAST_DUE;
  }

  /**
   * Check if subscription is on trial
   */
  isTrial(): boolean {
    return this.props.status === SubscriptionStatus.TRIALING;
  }

  /**
   * Check if plan is free
   */
  isFree(): boolean {
    return this.props.plan === SubscriptionPlan.FREE;
  }

  /**
   * Check if plan is paid (PRO, TEAM, or ENTERPRISE)
   */
  isPaid(): boolean {
    return [SubscriptionPlan.PRO, SubscriptionPlan.TEAM, SubscriptionPlan.ENTERPRISE].includes(
      this.props.plan as any
    );
  }

  /**
   * Check if user can upgrade to a specific plan
   */
  canUpgradeTo(targetPlan: SubscriptionPlan): boolean {
    const planHierarchy = {
      [SubscriptionPlan.FREE]: 0,
      [SubscriptionPlan.PRO]: 1,
      [SubscriptionPlan.TEAM]: 2,
      [SubscriptionPlan.ENTERPRISE]: 3,
    };

    return planHierarchy[targetPlan] > planHierarchy[this.props.plan];
  }

  /**
   * Check if user can downgrade to a specific plan
   */
  canDowngradeTo(targetPlan: SubscriptionPlan): boolean {
    const planHierarchy = {
      [SubscriptionPlan.FREE]: 0,
      [SubscriptionPlan.PRO]: 1,
      [SubscriptionPlan.TEAM]: 2,
      [SubscriptionPlan.ENTERPRISE]: 3,
    };

    return planHierarchy[targetPlan] < planHierarchy[this.props.plan];
  }

  /**
   * Get plan level
   */
  getPlanLevel(): number {
    const planHierarchy = {
      [SubscriptionPlan.FREE]: 0,
      [SubscriptionPlan.PRO]: 1,
      [SubscriptionPlan.TEAM]: 2,
      [SubscriptionPlan.ENTERPRISE]: 3,
    };

    return planHierarchy[this.props.plan];
  }

  /**
   * Check if subscription has access to team features
   */
  hasTeamFeatures(): boolean {
    return this.getPlanLevel() >= 2;
  }

  /**
   * Check if subscription has access to enterprise features
   */
  hasEnterpriseFeatures(): boolean {
    return this.getPlanLevel() >= 3;
  }

  /**
   * Get days remaining in current billing period
   */
  getDaysRemainingInPeriod(): number | null {
    if (!this.props.stripeCurrentPeriodEnd) {
      return null;
    }

    const now = new Date();
    const periodEnd = new Date(this.props.stripeCurrentPeriodEnd);
    const diffMs = periodEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  /**
   * Check if subscription is in trial period
   */
  isInTrialPeriod(): boolean {
    return this.isTrial() && this.getDaysRemainingInPeriod() !== null;
  }
}
