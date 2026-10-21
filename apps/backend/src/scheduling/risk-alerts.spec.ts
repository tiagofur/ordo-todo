import { assessRisks } from './risk-alerts';
import type { DayPlan } from './day-planner';

// ODD 005 S4 (T4): pure risk assessment over a day plan.
// PURE: dateKeys are pre-normalized "YYYY-MM-DD" strings, so no Date/TZ math
// happens here — these specs are hermetic by construction.
describe('assessRisks (ODD 005 S4)', () => {
  const TODAY = '2026-10-20';

  const block = (taskId: string, start = '09:00', end = '10:00') => ({
    taskId,
    start,
    end,
    reason: 'seed',
  });

  it('overloaded plan -> one overload alert with >=2 actionable options', () => {
    const plan: DayPlan = {
      blocks: [block('a')],
      unscheduled: [
        { taskId: 'b', reason: 'needs 120min but no free slot fits today' },
        { taskId: 'c', reason: 'needs 60min but no free slot fits today' },
      ],
    };

    const alerts = assessRisks({
      plan,
      tasks: [
        { taskId: 'a', title: 'A', dueDateKey: null },
        { taskId: 'b', title: 'B', dueDateKey: null },
        { taskId: 'c', title: 'C', dueDateKey: null },
      ],
      todayKey: TODAY,
    });

    const overload = alerts.filter((a) => a.kind === 'overload');
    expect(overload).toHaveLength(1);
    expect(overload[0].taskIds).toEqual(expect.arrayContaining(['b', 'c']));
    expect(overload[0].options.length).toBeGreaterThanOrEqual(2);
    // Honest wording: no absolutes ("never", "guarantee", ...).
    expect(overload[0].message).not.toMatch(
      /nunca|never|garantiz|siempre|always/i,
    );
    expect(overload[0].message).toMatch(/b|c|2 tareas/is);
  });

  it('due date in 2 days with no room -> deadline-at-risk alert with >=2 options', () => {
    const plan: DayPlan = {
      blocks: [block('a')],
      unscheduled: [{ taskId: 'b', reason: 'no free slot fits today' }],
    };

    const alerts = assessRisks({
      plan,
      tasks: [
        { taskId: 'a', title: 'A', dueDateKey: null },
        { taskId: 'b', title: 'Fix billing bug', dueDateKey: '2026-10-22' },
      ],
      todayKey: TODAY,
    });

    const deadlines = alerts.filter((a) => a.kind === 'deadline-at-risk');
    expect(deadlines).toHaveLength(1);
    expect(deadlines[0].taskIds).toEqual(['b']);
    expect(deadlines[0].options.length).toBeGreaterThanOrEqual(2);
    expect(deadlines[0].message).not.toMatch(
      /nunca|never|garantiz|siempre|always/i,
    );
    expect(deadlines[0].message).toMatch(/2026-10-22|2 d.as/i);
  });

  it('due date within daysAhead but planned today -> no deadline alert', () => {
    const plan: DayPlan = {
      blocks: [block('a'), block('b', '10:00', '11:00')],
      unscheduled: [],
    };

    const alerts = assessRisks({
      plan,
      tasks: [
        { taskId: 'a', title: 'A', dueDateKey: null },
        {
          taskId: 'b',
          title: 'B',
          dueDateKey: '2026-10-21',
          doDateKey: '2026-10-20',
        },
      ],
      todayKey: TODAY,
    });

    expect(alerts).toHaveLength(0);
  });

  it('due date beyond daysAhead -> no alert even when unscheduled today', () => {
    const plan: DayPlan = {
      blocks: [],
      unscheduled: [{ taskId: 'b', reason: 'no free slot fits today' }],
    };

    const alerts = assessRisks({
      plan,
      tasks: [{ taskId: 'b', title: 'B', dueDateKey: '2026-12-01' }],
      todayKey: TODAY,
      daysAhead: 3,
    });

    // Overload still fires (plan does not fit), but no deadline alert.
    expect(alerts.filter((a) => a.kind === 'deadline-at-risk')).toHaveLength(0);
    expect(alerts.filter((a) => a.kind === 'overload')).toHaveLength(1);
  });

  it('task without doDate and due tomorrow, not in plan -> deadline alert', () => {
    const plan: DayPlan = { blocks: [], unscheduled: [] };

    const alerts = assessRisks({
      plan,
      tasks: [{ taskId: 'x', title: 'Renew cert', dueDateKey: '2026-10-21' }],
      todayKey: TODAY,
    });

    const deadlines = alerts.filter((a) => a.kind === 'deadline-at-risk');
    expect(deadlines).toHaveLength(1);
    expect(deadlines[0].taskIds).toEqual(['x']);
    expect(deadlines[0].options.length).toBeGreaterThanOrEqual(2);
  });

  it('respects a custom daysAhead window', () => {
    const plan: DayPlan = { blocks: [], unscheduled: [] };
    const tasks = [{ taskId: 'x', title: 'X', dueDateKey: '2026-10-25' }];

    expect(
      assessRisks({ plan, tasks, todayKey: TODAY, daysAhead: 3 }).filter(
        (a) => a.kind === 'deadline-at-risk',
      ),
    ).toHaveLength(0);
    expect(
      assessRisks({ plan, tasks, todayKey: TODAY, daysAhead: 7 }).filter(
        (a) => a.kind === 'deadline-at-risk',
      ),
    ).toHaveLength(1);
  });
});
