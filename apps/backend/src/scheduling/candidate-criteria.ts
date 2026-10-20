// ODD 005 T3: shared day-plan candidate criterion.
//
// DECISION (documented per brief): EXTRACT, not duplicate. The T2 criterion
// lived inline in ai.service.ts buildDayPlan; T3 triggers must rebuild
// candidates with the SAME documented rule, so it now lives here and
// ai.service.ts delegates to it (same behavior, PRESERVE-verified by the
// untouched ai-optimal-schedule.spec.ts).
//
// Rule: open tasks (TODO/IN_PROGRESS) owned by the user that are EITHER
// planned for today (doDate is today in the USER's timezone) OR have no
// doDate but a dueDate within the next 7 days. Tasks without any date stay
// out; tasks planned for another day stay out.
import { toCalendarDateString, type Task as CoreTask } from '@ordo-todo/core';
import type { PlanTaskInput } from './day-planner';

export interface CandidateCriterionInput {
  tasks: CoreTask[];
  timezone: string;
  todayKey: string; // YYYY-MM-DD in the user's timezone ("today")
  weekFromNowMs: number; // Date.now() + 7d, injected for hermetic tests
}

export const toDateKey = (
  value: Date | string | null | undefined,
  timezone: string,
): string | null => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return toCalendarDateString(d, timezone) || null;
};

export const selectDayPlanCandidates = (
  input: CandidateCriterionInput,
): PlanTaskInput[] =>
  input.tasks
    .filter((t: CoreTask) => {
      if (t.props.status !== 'TODO' && t.props.status !== 'IN_PROGRESS')
        return false;
      const doDate = toDateKey(t.props.doDate, input.timezone);
      if (doDate === input.todayKey) return true;
      if (t.props.doDate) return false; // planned for another day
      const due = t.props.dueDate ? new Date(t.props.dueDate).getTime() : NaN;
      return !Number.isNaN(due) && due <= input.weekFromNowMs;
    })
    .map((t: CoreTask) => ({
      taskId: String(t.id),
      title: t.props.title,
      estimatedMinutes: t.props.estimatedMinutes ?? 30,
      doDate: toDateKey(t.props.doDate, input.timezone),
      dueDate: toDateKey(t.props.dueDate, input.timezone),
      priority: t.props.priority,
      energyRequired: t.props.energyRequired,
    }));
