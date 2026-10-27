/**
 * Single source of truth for Ordo plans, limits, trial and grace.
 *
 * Business decisions recorded 2026-10-21 (issue #328, unblocks #240-T1)
 * and 2026-10-26 (issue #240, billing launch): annual prices at -25% vs
 * monthly, and AI as monthly credit refills on paid plans (the ODD 004 S6
 * credit ledger is the unit of consumption; credit packs are deferred until
 * external agents reach GA).
 * Clarified 2026-10-22 (#328): Team workspaces inherit Pro (3),
 * Enterprise workspaces inherit Team (3), Enterprise storage is custom (null).
 * Prices are USD-only and BETA: billing is not live yet (issue #240)
 * and backend enforcement (ODD 012 S4) reads the same values.
 *
 * Lives in @ordo-todo/config so pricing (webpage), enforcement (backend)
 * and vote weights (roadmap) consume exactly one table.
 */

export type PlanId = 'free' | 'pro' | 'team' | 'enterprise';

export interface PlanLimits {
  /** Active tasks: -1 means unlimited */
  tasks: number;
  /** Projects: -1 means unlimited */
  projects: number;
  workspaces: number;
  /** Storage in GB; null = custom (enterprise) */
  storageGb: number | null;
  /** Minimum seats for team billing */
  minSeats: number;
  advancedAi: boolean;
  /**
   * AI credits refilled every billing month while subscribed (ask=1,
   * tool=2, report=5). 0 = none beyond the one-time trial; null = custom
   * (enterprise).
   */
  aiCreditsPerMonth: number | null;
}

export interface Plan {
  id: PlanId;
  /** USD monthly price per seat; null = custom (enterprise) */
  priceUsd: number | null;
  /** USD annual price per seat (-25% vs monthly); null = custom (enterprise) */
  annualPriceUsd: number | null;
  /** Roadmap vote weight (ODD 012 S4: single source, previously duplicated) */
  voteWeight: number;
  limits: PlanLimits;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    priceUsd: 0,
    annualPriceUsd: 0,
    voteWeight: 1,
    limits: {
      tasks: -1,
      projects: 3,
      workspaces: 1,
      storageGb: 0.1,
      minSeats: 1,
      advancedAi: false,
      aiCreditsPerMonth: 0,
    },
  },
  pro: {
    id: 'pro',
    priceUsd: 9,
    annualPriceUsd: 81,
    voteWeight: 3,
    limits: {
      tasks: -1,
      projects: -1,
      workspaces: 3,
      storageGb: 10,
      minSeats: 1,
      advancedAi: true,
      aiCreditsPerMonth: 500,
    },
  },
  team: {
    id: 'team',
    priceUsd: 19,
    annualPriceUsd: 171,
    voteWeight: 5,
    limits: {
      tasks: -1,
      projects: -1,
      workspaces: 3,
      storageGb: 100,
      minSeats: 2,
      advancedAi: true,
      aiCreditsPerMonth: 500,
    },
  },
  enterprise: {
    id: 'enterprise',
    priceUsd: null,
    annualPriceUsd: null,
    voteWeight: 10,
    limits: {
      tasks: -1,
      projects: -1,
      workspaces: 3,
      storageGb: null,
      minSeats: 1,
      advancedAi: true,
      aiCreditsPerMonth: null,
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
  if (unit === 'gb') return value < 1 ? `${Math.round(value * 1000)}MB` : `${value}GB`;
  return String(value);
}
