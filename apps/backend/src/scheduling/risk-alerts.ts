// ODD 005 S4: pure risk assessment over a day plan (T4).
// PURE: same input -> same output. No Date.now(), no randomness, no I/O.
// All dates arrive as pre-normalized "YYYY-MM-DD" keys, so this module does
// ZERO timezone math (callers normalize with the user's timezone, same as the
// T2/T3 candidate criterion). Specs are hermetic by construction.
//
// Wording follows promises-audit: honest, no absolutes ("never miss a
// deadline" is PROHIBITED). Messages describe what the planner sees today.

import type { DayPlan } from './day-planner';

export type RiskKind = 'overload' | 'deadline-at-risk';

export interface RiskOption {
  label: string;
  action:
    | 'reschedule'
    | 'split-task'
    | 'delegate'
    | 'renegotiate'
    | 'freeze-less'
    | 'extend-day';
}

export interface RiskAlert {
  kind: RiskKind;
  taskIds: string[];
  message: string;
  options: RiskOption[];
}

export interface RiskTaskInput {
  taskId: string;
  title: string;
  dueDateKey: string | null; // YYYY-MM-DD or null
  doDateKey?: string | null; // YYYY-MM-DD or null
}

export interface AssessRisksInput {
  plan: DayPlan;
  tasks: RiskTaskInput[];
  todayKey: string; // YYYY-MM-DD in the user's timezone
  daysAhead?: number; // default 3
}

// Calendar-day distance between two YYYY-MM-DD keys, via UTC midnights.
// Pure string math — no local-time getters, no DST drift.
const daysBetween = (fromKey: string, toKey: string): number => {
  const ms =
    Date.parse(`${toKey}T00:00:00Z`) - Date.parse(`${fromKey}T00:00:00Z`);
  return Math.round(ms / (24 * 60 * 60 * 1000));
};

const OVERLOAD_OPTIONS: RiskOption[] = [
  { label: 'Move some tasks to another day', action: 'reschedule' },
  { label: 'Split a large task into smaller parts', action: 'split-task' },
  { label: 'Delegate or reassign a task', action: 'delegate' },
  { label: 'Extend today with an evening block', action: 'extend-day' },
];

const DEADLINE_OPTIONS: RiskOption[] = [
  { label: 'Schedule it earlier (move its do date)', action: 'reschedule' },
  { label: 'Split it so part fits sooner', action: 'split-task' },
  { label: 'Renegotiate the due date', action: 'renegotiate' },
  { label: 'Freeze fewer blocks to free room', action: 'freeze-less' },
];

export const assessRisks = (input: AssessRisksInput): RiskAlert[] => {
  const daysAhead = input.daysAhead ?? 3;
  const alerts: RiskAlert[] = [];
  const plannedToday = new Set(input.plan.blocks.map((b) => b.taskId));

  // Overload: the plan admits it does not all fit today.
  if (input.plan.unscheduled.length > 0) {
    const ids = input.plan.unscheduled.map((u) => u.taskId);
    const titles = new Map(input.tasks.map((t) => [t.taskId, t.title]));
    const named = ids
      .slice(0, 3)
      .map((id) => `"${titles.get(id) ?? id}"`)
      .join(', ');
    const rest = ids.length > 3 ? ` and ${ids.length - 3} more` : '';
    alerts.push({
      kind: 'overload',
      taskIds: ids,
      message:
        `Today's plan looks tight: ${ids.length} ` +
        `${ids.length === 1 ? 'task does' : 'tasks do'} not fit ` +
        `(${named}${rest}). This is based on current estimates, which may shift.`,
      options: OVERLOAD_OPTIONS,
    });
  }

  // Deadline at risk: due within daysAhead AND (not scheduled today OR not
  // planned for today at all). A task already in today's blocks with a doDate
  // of today is being worked on — no alert.
  for (const t of input.tasks) {
    if (!t.dueDateKey) continue;
    const daysLeft = daysBetween(input.todayKey, t.dueDateKey);
    if (daysLeft < 0 || daysLeft > daysAhead) continue;
    const workedToday =
      plannedToday.has(t.taskId) &&
      (t.doDateKey ?? input.todayKey) === input.todayKey;
    if (workedToday) continue;
    const when =
      daysLeft === 0
        ? 'due today'
        : `due in ${daysLeft} day${daysLeft === 1 ? '' : 's'} (${t.dueDateKey})`;
    alerts.push({
      kind: 'deadline-at-risk',
      taskIds: [t.taskId],
      message:
        `"${t.title}" is ${when} and has no room in today's plan yet. ` +
        `Worth a look before the day fills up.`,
      options: DEADLINE_OPTIONS,
    });
  }

  return alerts;
};
