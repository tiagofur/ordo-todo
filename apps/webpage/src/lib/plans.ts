/**
 * Thin re-export of the single plans table (ODD 012 S1).
 *
 * The source of truth moved to `@ordo-todo/config/src/plans.ts` so the
 * backend enforcement, the pricing page and the roadmap vote weights all
 * read the exact same values. Keep imports here stable for the webpage.
 */
export {
  PLANS,
  TRIAL,
  GRACE_PERIOD_DAYS,
  formatLimit,
  type PlanId,
  type Plan,
  type PlanLimits,
} from '@ordo-todo/config';
