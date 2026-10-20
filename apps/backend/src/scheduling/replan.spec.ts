import { replan } from './replan';
import type {
  DayPlan,
  PlanEvent,
  PlanTaskInput,
  WorkingHours,
} from './day-planner';

// ODD 005 S3 (T3): replan keeps frozen blocks fixed, re-runs the T2 engine
// over the free gaps for everything else, and reports what changed and why.
// Times are HH:MM on a single day; working hours 09:00-12:00, no lunch.
const WH: WorkingHours = { start: '09:00', end: '12:00' };
const EVENTS: PlanEvent[] = [];

const task = (
  taskId: string,
  estimatedMinutes: number,
  priority: PlanTaskInput['priority'] = 'MEDIUM',
): PlanTaskInput => ({
  taskId,
  title: taskId,
  estimatedMinutes,
  dueDate: null,
  priority,
});

// Previous plan: a(09:00-10:00) b(10:00-11:00) c(11:00-12:00).
const PREV: DayPlan = {
  blocks: [
    { taskId: 'a', start: '09:00', end: '10:00', reason: 'due seed' },
    { taskId: 'b', start: '10:00', end: '11:00', reason: 'due seed' },
    { taskId: 'c', start: '11:00', end: '12:00', reason: 'due seed' },
  ],
  unscheduled: [],
};

describe('replan (ODD 005 S3)', () => {
  it('moves later blocks earlier when a task finishes early, with reasons', () => {
    // Task a finished; b and c are still candidates.
    const { plan, changes } = replan({
      previous: PREV,
      frozenTaskIds: [],
      tasks: [task('b', 60), task('c', 60)],
      events: EVENTS,
      workingHours: WH,
      trigger: { kind: 'completed', taskId: 'a' },
    });

    expect(plan.blocks).toMatchObject([
      { taskId: 'b', start: '09:00', end: '10:00' },
      { taskId: 'c', start: '10:00', end: '11:00' },
    ]);
    // a disappeared from candidates -> removed; b/c moved earlier.
    expect(changes).toContainEqual(
      expect.objectContaining({ taskId: 'a', type: 'removed' }),
    );
    const movedB = changes.find((c) => c.taskId === 'b');
    expect(movedB).toMatchObject({
      type: 'moved',
      from: { start: '10:00', end: '11:00' },
      to: { start: '09:00', end: '10:00' },
    });
    expect(movedB!.reason).toMatch(/finished early|completed/);
    expect(changes.find((c) => c.taskId === 'c')).toMatchObject({
      type: 'moved',
    });
  });

  it('never moves a frozen block even when everything else changes', () => {
    // b is frozen at 10:00-11:00; a finished early and a new urgent task arrives.
    const { plan, changes } = replan({
      previous: PREV,
      frozenTaskIds: ['b'],
      tasks: [task('b', 60), task('c', 60), task('zzz-new', 30, 'URGENT')],
      events: EVENTS,
      workingHours: WH,
      trigger: { kind: 'completed', taskId: 'a' },
    });

    const frozen = plan.blocks.find((b) => b.taskId === 'b')!;
    expect([frozen.start, frozen.end]).toEqual(['10:00', '11:00']);
    expect(changes.find((c) => c.taskId === 'b')).toBeUndefined();
    expect(changes).toContainEqual(
      expect.objectContaining({ taskId: 'zzz-new', type: 'added' }),
    );
  });

  it('reports a frozen task that vanished as removed (never relocated)', () => {
    const { plan, changes } = replan({
      previous: PREV,
      frozenTaskIds: ['b'],
      tasks: [task('a', 60), task('c', 60)], // b gone from candidates
      events: EVENTS,
      workingHours: WH,
      trigger: { kind: 'completed', taskId: 'x-other' },
    });

    expect(plan.blocks.find((b) => b.taskId === 'b')).toBeUndefined();
    const removed = changes.find((c) => c.taskId === 'b');
    expect(removed).toMatchObject({ type: 'removed' });
    expect(removed!.reason).toMatch(/frozen|no longer|not.*candidate/i);
  });

  it('pushes later blocks when a task overruns, with reasons', () => {
    // a overran: it now needs 90min instead of 60.
    const { plan, changes } = replan({
      previous: PREV,
      frozenTaskIds: [],
      tasks: [task('a', 90), task('b', 60), task('c', 60)],
      events: EVENTS,
      workingHours: WH,
      trigger: { kind: 'overrun', taskId: 'a', actualMinutes: 90 },
    });

    expect(plan.blocks).toMatchObject([
      { taskId: 'a', start: '09:00', end: '10:30' },
      { taskId: 'b', start: '10:30', end: '11:30' },
    ]);
    // c no longer fits -> unscheduled; reported as removed with a reason.
    expect(plan.unscheduled.map((u) => u.taskId)).toContain('c');
    const movedB = changes.find((c) => c.taskId === 'b');
    expect(movedB).toMatchObject({ type: 'moved' });
    expect(movedB!.reason).toMatch(/overran|longer|pushed/i);
    // a kept its start but grew -> resized.
    expect(changes.find((c) => c.taskId === 'a')).toMatchObject({
      type: 'resized',
    });
  });

  it('treats calendar events as fixed busy time for the replanned part', () => {
    // 09:30-10:00 meeting; b/c replan around it, frozen a stays put.
    const prev: DayPlan = {
      blocks: [
        { taskId: 'a', start: '09:00', end: '09:30', reason: 'seed' },
        { taskId: 'b', start: '10:00', end: '11:00', reason: 'seed' },
      ],
      unscheduled: [],
    };
    const { plan } = replan({
      previous: prev,
      frozenTaskIds: ['a'],
      tasks: [task('a', 30), task('b', 60), task('c', 60)],
      events: [{ start: '09:30', end: '10:00' }],
      workingHours: WH,
      trigger: { kind: 'completed', taskId: 'zzz' },
    });

    expect(
      plan.blocks.find((b) => b.taskId === 'a'),
    ).toMatchObject({ start: '09:00', end: '09:30' });
    // b keeps 10:00-11:00 (urgent-first ordering is stable here), c fills 11:00.
    for (const b of plan.blocks) {
      if (b.taskId === 'a') continue;
      const s = Number(b.start.slice(0, 2)) * 60 + Number(b.start.slice(3));
      const e = Number(b.end.slice(0, 2)) * 60 + Number(b.end.slice(3));
      // Must not overlap 09:30-10:00 (570-600).
      expect(s >= 600 || e <= 570).toBe(true);
    }
  });

  it('returns zero changes when nothing moved', () => {
    const { plan, changes } = replan({
      previous: PREV,
      frozenTaskIds: [],
      tasks: [task('a', 60), task('b', 60), task('c', 60)],
      events: EVENTS,
      workingHours: WH,
      trigger: { kind: 'day-start' },
    });

    expect(plan.blocks).toMatchObject([
      { taskId: 'a', start: '09:00', end: '10:00' },
      { taskId: 'b', start: '10:00', end: '11:00' },
      { taskId: 'c', start: '11:00', end: '12:00' },
    ]);
    // Same slots -> no diff noise (day-start WITH a previous plan).
    expect(changes).toEqual([]);
  });

  it('is deterministic: same input -> identical plan and changes', () => {
    const input = {
      previous: PREV,
      frozenTaskIds: ['c'],
      tasks: [task('a', 60), task('b', 60), task('c', 60), task('d', 30)],
      events: EVENTS,
      workingHours: WH,
      trigger: { kind: 'completed', taskId: 'zzz' } as const,
    };
    const first = replan(input);
    const second = replan(structuredClone(input));
    expect(second).toEqual(first);
  });
});
