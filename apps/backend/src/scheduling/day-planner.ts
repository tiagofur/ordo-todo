// ODD 005 S2: deterministic day-plan engine (T2).
// PURE: same input -> same output. No Date.now(), no randomness, no LLM.
// Times are "HH:MM" strings on a single day; dates are "YYYY-MM-DD".

export type PlanPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type PlanEnergy = 'LOW' | 'MEDIUM' | 'HIGH';

export interface PlanTaskInput {
  taskId: string;
  title: string;
  estimatedMinutes: number;
  doDate?: string | null;
  dueDate?: string | null;
  priority: PlanPriority;
  energyRequired?: PlanEnergy;
}
export interface PlanEvent {
  start: string;
  end: string;
}
export interface WorkingHours {
  start: string;
  end: string;
  lunchStart?: string;
  lunchEnd?: string;
}
export interface EnergyProfile {
  peakHours?: number[];
}
export interface PlanDayInput {
  tasks: PlanTaskInput[];
  events?: PlanEvent[];
  workingHours: WorkingHours;
  energyProfile?: EnergyProfile;
}
export interface PlanBlock {
  taskId: string;
  start: string;
  end: string;
  reason: string;
}
export interface UnscheduledTask {
  taskId: string;
  reason: string;
}
export interface DayPlan {
  blocks: PlanBlock[];
  unscheduled: UnscheduledTask[];
}

const PRIORITY_RANK: Record<PlanPriority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};
const ENERGY_RANK: Record<PlanEnergy, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

const toMin = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const toHHMM = (min: number): string =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

interface Slot {
  start: number;
  end: number;
}

// Free slots = work day minus events + lunch (clipped), one left-to-right pass.
const freeSlots = (wh: WorkingHours, events: PlanEvent[]): Slot[] => {
  const dayStart = toMin(wh.start);
  const dayEnd = toMin(wh.end);
  const clip = (s: string, e: string): Slot | null => {
    const start = Math.max(toMin(s), dayStart);
    const end = Math.min(toMin(e), dayEnd);
    return end > start ? { start, end } : null;
  };
  const busy = [
    ...events.map((ev) => clip(ev.start, ev.end)),
    wh.lunchStart && wh.lunchEnd ? clip(wh.lunchStart, wh.lunchEnd) : null,
  ]
    .filter((s): s is Slot => s !== null)
    .sort((a, b) => a.start - b.start || a.end - b.end);
  const free: Slot[] = [];
  let cursor = dayStart;
  for (const b of busy) {
    if (b.start > cursor) free.push({ start: cursor, end: b.start });
    cursor = Math.max(cursor, b.end);
  }
  if (cursor < dayEnd) free.push({ start: cursor, end: dayEnd });
  return free;
};

// ODD S2 order: dueDate (nearest; undated last), priority, energy demand,
// taskId (stable tiebreak -> fully deterministic).
const rank = (t: PlanTaskInput): [string, number, number, string] => [
  t.dueDate ?? '9999-99-99',
  PRIORITY_RANK[t.priority],
  t.energyRequired ? ENERGY_RANK[t.energyRequired] : 2,
  t.taskId,
];
const cmpRank = (
  a: [string, number, number, string],
  b: [string, number, number, string],
): number =>
  a[0] < b[0]
    ? -1
    : a[0] > b[0]
      ? 1
      : a[1] - b[1] || a[2] - b[2] || (a[3] < b[3] ? -1 : a[3] > b[3] ? 1 : 0);

export const planDay = (input: PlanDayInput): DayPlan => {
  const free = freeSlots(input.workingHours, input.events ?? []);
  const peaks = new Set(input.energyProfile?.peakHours ?? []);
  const ordered = [...input.tasks].sort((a, b) => cmpRank(rank(a), rank(b)));
  const blocks: PlanBlock[] = [];
  const unscheduled: UnscheduledTask[] = [];

  for (const task of ordered) {
    const need = Math.max(0, Math.round(task.estimatedMinutes));
    const slot = free.find((s) => s.end - s.start >= need);
    if (!slot) {
      unscheduled.push({
        taskId: task.taskId,
        reason: `needs ${need}min but no free slot fits today`,
      });
      continue;
    }
    const start = slot.start;
    slot.start += need;
    const reasons = [
      task.dueDate ? `due ${task.dueDate}` : 'no due date',
      `priority ${task.priority.toLowerCase()}`,
    ];
    if (task.energyRequired === 'HIGH' && peaks.has(Math.floor(start / 60)))
      reasons.push('peak energy hours');
    blocks.push({
      taskId: task.taskId,
      start: toHHMM(start),
      end: toHHMM(start + need),
      reason: reasons.join(', '),
    });
  }
  blocks.sort((a, b) => toMin(a.start) - toMin(b.start));
  return { blocks, unscheduled };
};
