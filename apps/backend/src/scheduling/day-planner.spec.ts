import { planDay } from './day-planner';
import type { PlanEnergy, PlanPriority, PlanTaskInput } from './day-planner';

// 20-task fixture: varied dues/priorities/energies + busy calendar.
// 09:00-18:00 (540) - lunch 60 - events 90 = 390min free; t01..t10 sum to
// exactly 390, t11..t20 do not fit. [id, minutes, due, priority, energy?]
const ROWS: [string, number, string | null, PlanPriority, PlanEnergy?][] = [
  ['t01', 45, '2026-10-20', 'URGENT', 'HIGH'],
  ['t02', 30, '2026-10-20', 'HIGH', 'MEDIUM'],
  ['t03', 90, '2026-10-20', 'MEDIUM', 'LOW'],
  ['t04', 60, '2026-10-21', 'URGENT', 'HIGH'],
  ['t05', 45, '2026-10-21', 'HIGH', 'MEDIUM'],
  ['t06', 30, '2026-10-22', 'MEDIUM', 'LOW'],
  ['t07', 20, '2026-10-22', 'LOW', 'LOW'],
  ['t08', 25, '2026-10-23', 'HIGH', 'MEDIUM'],
  ['t09', 30, '2026-10-23', 'MEDIUM', 'MEDIUM'],
  ['t10', 15, '2026-10-25', 'LOW', 'LOW'],
  ['t11', 60, null, 'HIGH', 'HIGH'],
  ['t12', 45, null, 'HIGH', 'MEDIUM'],
  ['t13', 30, null, 'MEDIUM', 'HIGH'],
  ['t14', 30, null, 'MEDIUM', 'MEDIUM'],
  ['t15', 20, null, 'MEDIUM', 'LOW'],
  ['t16', 15, null, 'MEDIUM', 'LOW'],
  ['t17', 60, null, 'LOW', 'MEDIUM'],
  ['t18', 30, null, 'LOW', 'LOW'],
  ['t19', 15, null, 'LOW', 'LOW'],
  ['t20', 240, null, 'LOW', 'HIGH'],
];
const TASKS: PlanTaskInput[] = ROWS.map(
  ([taskId, estimatedMinutes, dueDate, priority, energyRequired]) => ({
    taskId,
    title: taskId,
    estimatedMinutes,
    dueDate,
    priority,
    energyRequired,
  }),
);
const INPUT = {
  tasks: TASKS,
  events: [
    { start: '10:00', end: '10:30' },
    { start: '15:00', end: '16:00' },
    { start: '19:00', end: '20:00' }, // outside work hours: ignored
  ],
  workingHours: {
    start: '09:00',
    end: '18:00',
    lunchStart: '13:00',
    lunchEnd: '14:00',
  },
  energyProfile: { peakHours: [9, 10, 11] },
};
const toMin = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};
const overlaps = (
  a: { start: string; end: string },
  b: { start: string; end: string },
) => toMin(a.start) < toMin(b.end) && toMin(b.start) < toMin(a.end);

describe('planDay (ODD 005 S2)', () => {
  it('never overlaps events/lunch/blocks and stays within work hours', () => {
    const plan = planDay(INPUT);
    const busy = [
      ...INPUT.events.slice(0, 2),
      { start: '13:00', end: '14:00' },
    ];
    for (const b of plan.blocks) {
      expect(toMin(b.start)).toBeGreaterThanOrEqual(toMin('09:00'));
      expect(toMin(b.end)).toBeLessThanOrEqual(toMin('18:00'));
      for (const o of busy) expect(overlaps(b, o)).toBe(false);
    }
    for (let i = 0; i < plan.blocks.length; i++)
      for (let j = i + 1; j < plan.blocks.length; j++)
        expect(overlaps(plan.blocks[i], plan.blocks[j])).toBe(false);
    const starts = plan.blocks.map((b) => toMin(b.start));
    expect([...starts].sort((a, b) => a - b)).toEqual(starts);
  });

  it('orders by due date first: nearest + URGENT leads, dated tasks fit', () => {
    const plan = planDay(INPUT);
    const ids = plan.blocks.map((b) => b.taskId);
    expect(plan.blocks[0]).toMatchObject({ taskId: 't01', start: '09:00' });
    expect(ids).toEqual(
      expect.arrayContaining([
        't01',
        't02',
        't03',
        't04',
        't05',
        't06',
        't07',
        't08',
        't09',
        't10',
      ]),
    );
    expect(plan.unscheduled.map((u) => u.taskId).sort()).toEqual(
      [
        't11',
        't12',
        't13',
        't14',
        't15',
        't16',
        't17',
        't18',
        't19',
        't20',
      ].sort(),
    );
  });

  it('places demanding tasks in peak hours and reports unfit tasks (T4 only exposes)', () => {
    const plan = planDay(INPUT);
    const t01 = plan.blocks.find((b) => b.taskId === 't01')!;
    expect([toMin(t01.start), toMin(t01.end)]).toEqual([9 * 60, 9 * 60 + 45]);
    expect(t01.reason).toMatch('peak');
    expect(plan.unscheduled).toHaveLength(10);
    expect(plan.unscheduled.find((u) => u.taskId === 't20')!.reason).toMatch(
      '240',
    );
  });

  it('is deterministic: deep-equal twice + snapshot', () => {
    const a = planDay(INPUT);
    expect(planDay(structuredClone(INPUT))).toEqual(a);
    expect(
      a.blocks.map((x) => `${x.taskId}@${x.start}-${x.end}`),
    ).toMatchSnapshot();
  });

  it('breaks full ties by taskId (stable order)', () => {
    const plan = planDay({
      tasks: [
        {
          taskId: 'b-task',
          title: 'b',
          estimatedMinutes: 30,
          dueDate: null,
          priority: 'MEDIUM',
        },
        {
          taskId: 'a-task',
          title: 'a',
          estimatedMinutes: 30,
          dueDate: null,
          priority: 'MEDIUM',
        },
      ],
      workingHours: { start: '09:00', end: '18:00' },
    });
    expect(plan.blocks.map((b) => b.taskId)).toEqual(['a-task', 'b-task']);
  });
});
