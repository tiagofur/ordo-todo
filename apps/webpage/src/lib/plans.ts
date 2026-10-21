/**
 * Single source of truth for Ordo plans, limits, trial and grace.
 *
 * Business decision recorded 2026-10-21 (issue #328, unblocks #240-T1).
 * Prices are USD-only and BETA: billing is not live yet (issue #240)
 * and no limits are enforced. This file states intent, not a contract.
 *
 * When billing goes live, #240 extends this table with Stripe price IDs
 * and backend enforcement reads the same values.
 */

export type PlanId = 'free' | 'pro' | 'team' | 'enterprise';

export interface PlanLimits {
  /** Active tasks: -1 means unlimited */
  tasks: number;
  /** Projects: -1 means unlimited */
  projects: number;
  workspaces: number;
  /** Storage in GB */
  storageGb: number;
  /** Minimum seats for team billing */
  minSeats: number;
  advancedAi: boolean;
}

export interface Plan {
  id: PlanId;
  /** USD monthly price per seat; null = custom (enterprise) */
  priceUsd: number | null;
  limits: PlanLimits;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    priceUsd: 0,
    limits: {
      tasks: -1,
      projects: 3,
      workspaces: 1,
      storageGb: 0.1,
      minSeats: 1,
      advancedAi: false,
    },
  },
  pro: {
    id: 'pro',
    priceUsd: 9,
    limits: {
      tasks: -1,
      projects: -1,
      workspaces: 3,
      storageGb: 10,
      minSeats: 1,
      advancedAi: true,
    },
  },
  team: {
    id: 'team',
    priceUsd: 19,
    limits: {
      tasks: -1,
      projects: -1,
      workspaces: -1,
      storageGb: 100,
      minSeats: 2,
      advancedAi: true,
    },
  },
  enterprise: {
    id: 'enterprise',
    priceUsd: null,
    limits: {
      tasks: -1,
      projects: -1,
      workspaces: -1,
      storageGb: -1,
      minSeats: 1,
      advancedAi: true,
    },
  },
};

export const TRIAL = {
  days: 14,
  plan: 'pro' as PlanId,
  requiresCard: false,
} as const;

export const GRACE_PERIOD_DAYS = 14;

export function formatLimit(
  value: number,
  unit: 'count' | 'gb',
  unlimitedLabel: string,
): string {
  if (value === -1) return unlimitedLabel;
  if (unit === 'gb') return value < 1 ? `${value * 1000}MB` : `${value}GB`;
  return String(value);
}
