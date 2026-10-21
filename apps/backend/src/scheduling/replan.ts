// ODD 005 S3: deterministic replan engine (T3a).
// PURE: same input -> same output. No Date.now(), no randomness, no LLM.
// Reuses the T2 planDay engine for everything NOT frozen: frozen blocks enter
// as fixed busy time (exactly like calendar events) and the rest replans over
// the free gaps. Then diffs previous vs new plan into human-readable changes.
import {
  planDay,
  type DayPlan,
  type PlanBlock,
  type PlanEvent,
  type PlanTaskInput,
  type WorkingHours,
} from './day-planner';

export type PlanChangeType = 'moved' | 'added' | 'removed' | 'resized';

export interface PlanChangeSlot {
  start: string;
  end: string;
}

export interface PlanChange {
  taskId: string;
  type: PlanChangeType;
  from?: PlanChangeSlot;
  to?: PlanChangeSlot;
  reason: string;
}

export type ReplanTrigger =
  | { kind: 'completed'; taskId: string }
  | { kind: 'overrun'; taskId: string; actualMinutes: number }
  | { kind: 'day-start' };

export interface ReplanInput {
  previous: DayPlan;
  frozenTaskIds: string[];
  tasks: PlanTaskInput[];
  events?: PlanEvent[];
  workingHours: WorkingHours;
  trigger: ReplanTrigger;
  energyPeakHours?: number[];
}

export interface ReplanResult {
  plan: DayPlan;
  changes: PlanChange[];
}

const slotOf = (b: PlanBlock): PlanChangeSlot => ({
  start: b.start,
  end: b.end,
});

// Trigger-aware reason for a moved block ("what changed and why", S3 check).
const movedReason = (
  taskId: string,
  prev: PlanBlock,
  next: PlanBlock,
  trigger: ReplanTrigger,
): string => {
  const direction =
    next.start < prev.start
      ? `moved earlier to ${next.start}`
      : `moved to ${next.start}`;
  if (trigger.kind === 'completed' && trigger.taskId !== taskId)
    return `${direction} because ${trigger.taskId} finished early`;
  if (trigger.kind === 'overrun' && trigger.taskId !== taskId)
    return `${direction} because ${trigger.taskId} overran to ${trigger.actualMinutes}min`;
  if (trigger.kind === 'overrun' && trigger.taskId === taskId)
    return `rescheduled to ${next.start} after overrunning to ${trigger.actualMinutes}min`;
  return `${direction} in the replan`;
};

export const replan = (input: ReplanInput): ReplanResult => {
  const frozen = new Set(input.frozenTaskIds);
  const byId = new Map(input.tasks.map((t) => [t.taskId, t]));
  const prevById = new Map(input.previous.blocks.map((b) => [b.taskId, b]));

  // HARD RULE: a frozen block NEVER moves. Frozen tasks present in both the
  // previous plan and the candidates keep their exact previous slot and enter
  // the engine as fixed busy time. Frozen tasks missing from candidates are
  // reported as removed (never relocated).
  const keptFrozen: PlanBlock[] = [];
  const frozenBusy: PlanEvent[] = [];
  const missingFrozen: string[] = [];
  for (const taskId of input.frozenTaskIds) {
    const prev = prevById.get(taskId);
    if (prev && byId.has(taskId)) {
      keptFrozen.push({ ...prev });
      frozenBusy.push({ start: prev.start, end: prev.end });
    } else if (prev) {
      missingFrozen.push(taskId);
    }
  }
  // Frozen id with no previous block: nothing to keep — the candidate (if
  // any) replans normally below instead of being silently dropped.
  const keptIds = new Set(keptFrozen.map((b) => b.taskId));
  const unfrozen = input.tasks.filter((t) => !keptIds.has(t.taskId));
  const replanned = planDay({
    tasks: unfrozen,
    events: [...(input.events ?? []), ...frozenBusy],
    workingHours: input.workingHours,
    energyProfile:
      input.energyPeakHours !== undefined
        ? { peakHours: input.energyPeakHours }
        : undefined,
  });

  const blocks = [...keptFrozen, ...replanned.blocks].sort((a, b) =>
    a.start < b.start ? -1 : a.start > b.start ? 1 : 0,
  );
  const plan: DayPlan = { blocks, unscheduled: replanned.unscheduled };

  // Diff previous vs new: added / removed / moved / resized + why.
  // Exactly ONE change per affected task (no duplicates): a task that no
  // longer fits is reported once, with the engine's rich reason when known.
  const changes: PlanChange[] = [];
  const nextById = new Map(blocks.map((b) => [b.taskId, b]));
  const unscheduledById = new Map(
    replanned.unscheduled.map((u) => [u.taskId, u.reason]),
  );

  for (const prev of input.previous.blocks) {
    if (frozen.has(prev.taskId)) continue; // kept ones never change; missing handled below
    const next = nextById.get(prev.taskId);
    if (!next) {
      const overflow = unscheduledById.get(prev.taskId);
      changes.push({
        taskId: prev.taskId,
        type: 'removed',
        from: slotOf(prev),
        reason:
          input.trigger.kind === 'completed' &&
          input.trigger.taskId === prev.taskId
            ? `completed, removed from the plan`
            : overflow
              ? `no longer fits today (${overflow})`
              : `no longer fits today (${prev.start}-${prev.end} freed)`,
      });
      continue;
    }
    if (next.start === prev.start && next.end === prev.end) continue; // unchanged
    if (next.start === prev.start) {
      changes.push({
        taskId: prev.taskId,
        type: 'resized',
        from: slotOf(prev),
        to: slotOf(next),
        reason:
          input.trigger.kind === 'overrun' &&
          input.trigger.taskId === prev.taskId
            ? `grew to ${next.end} after overrunning to ${input.trigger.actualMinutes}min`
            : `resized to ${next.start}-${next.end} in the replan`,
      });
    } else {
      changes.push({
        taskId: prev.taskId,
        type: 'moved',
        from: slotOf(prev),
        to: slotOf(next),
        reason: movedReason(prev.taskId, prev, next, input.trigger),
      });
    }
  }

  for (const id of missingFrozen) {
    const prev = prevById.get(id)!;
    changes.push({
      taskId: id,
      type: 'removed',
      from: slotOf(prev),
      reason: `frozen block ${prev.start}-${prev.end} dropped: task is no longer a candidate today`,
    });
  }

  const prevIds = new Set(input.previous.blocks.map((b) => b.taskId));
  for (const b of blocks) {
    if (!prevIds.has(b.taskId)) {
      changes.push({
        taskId: b.taskId,
        type: 'added',
        to: slotOf(b),
        reason:
          input.trigger.kind === 'day-start' &&
          input.previous.blocks.length === 0
            ? `scheduled at ${b.start} in the first plan of the day`
            : `scheduled at ${b.start} in the replan`,
      });
    }
  }
  // Deterministic change order: by taskId (stable output, one per task).
  changes.sort((a, b) =>
    a.taskId < b.taskId ? -1 : a.taskId > b.taskId ? 1 : 0,
  );
  return { plan, changes };
};
