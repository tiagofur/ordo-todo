/**
 * Billing DTOs and response shapes.
 * Contract mirrored from the backend billing controller; the web bespoke
 * client uses identical shapes (apps/web S6), now unified here.
 */

export interface BillingLimits {
  tasks: number;
  projects: number;
  workspaces: number;
  storageGb: number | null;
  minSeats: number;
  advancedAi: boolean;
  aiCreditsPerMonth: number | null;
}

export interface BillingUsageOverview {
  plan: 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE';
  status: string | null;
  interval: 'MONTH' | 'YEAR' | null;
  seats: number;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: string | null;
  graceEndsAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  hasStripeCustomer: boolean;
  effectivePlan: 'free' | 'pro' | 'team' | 'enterprise';
  limits: BillingLimits;
  usage: {
    workspaces: number;
    projects: number;
    storageUsedBytes: number;
  };
  aiCredits: { balance: number };
}

export type BillingPlanId = 'pro' | 'team';
export type BillingInterval = 'month' | 'year';

export interface CheckoutSessionResult {
  url: string;
  sessionId: string;
}

export interface PortalSessionResult {
  url: string;
}
