import { describe, expect, it, vi } from 'vitest';
import {
  ordoHabitsTool,
  ordoPlanDayTool,
  ordoTaskCreateTool,
  ordoTaskDoneTool,
  ordoTodayTool,
  toolFactories,
} from './tools.js';

function stubClient(calls: Record<string, unknown>) {
  return {
    callTool: vi.fn(async (name: string) => {
      if (!(name in calls)) throw new Error(`unexpected tool ${name}`);
      return calls[name];
    }),
  } as any;
}

describe('ordo tool factories', () => {
  it('should register exactly the 5 manifest tools', () => {
    const names = toolFactories().map((factory) => factory(() => ({}) as any).name);

    expect(names).toEqual([
      'ordo_today',
      'ordo_task_create',
      'ordo_task_done',
      'ordo_habits',
      'ordo_plan_day',
    ]);
  });

  it('ordo_today should combine tasks and habits', async () => {
    const tool = ordoTodayTool(
      () =>
        stubClient({
          ordo_task_list: [{ id: 'task-1' }],
          ordo_habit_today: [{ id: 'habit-1' }],
        }) as any,
    );

    const result: any = await tool.execute('x', {}, {});

    expect(JSON.parse(result.content[0].text)).toEqual({
      tasks: [{ id: 'task-1' }],
      habits: [{ id: 'habit-1' }],
    });
  });

  it('ordo_task_create should pass title, project and optional fields', async () => {
    const callTool = vi.fn(async () => ({ id: 'task-9' }));
    const tool = ordoTaskCreateTool(() => ({ callTool }) as any);

    const result: any = await tool.execute(
      'x',
      { title: 'Via chat', projectId: 'proj-1', priority: 'HIGH' },
      {},
    );

    expect(callTool).toHaveBeenCalledWith('ordo_task_create', {
      title: 'Via chat',
      projectId: 'proj-1',
      priority: 'HIGH',
    });
    expect(JSON.parse(result.content[0].text)).toEqual({ id: 'task-9' });
  });

  it('ordo_task_done should complete by id', async () => {
    const callTool = vi.fn(async () => ({ id: 'task-1', done: true }));
    const tool = ordoTaskDoneTool(() => ({ callTool }) as any);

    await tool.execute('x', { id: 'task-1' }, {});

    expect(callTool).toHaveBeenCalledWith('ordo_task_complete', { id: 'task-1' });
  });

  it('ordo_plan_day should fan out to 4 MCP tools', async () => {
    const callTool = vi.fn(async (name: string) => ({ from: name }));
    const tool = ordoPlanDayTool(() => ({ callTool }) as any);

    const result: any = await tool.execute('x', {}, {});

    expect(callTool).toHaveBeenCalledTimes(4);
    expect(JSON.parse(result.content[0].text)).toEqual({
      me: { from: 'ordo_me' },
      tasks: { from: 'ordo_task_list' },
      habits: { from: 'ordo_habit_today' },
      objectives: { from: 'ordo_objective_progress' },
    });
  });

  it('ordo_habits should return today habits payload', async () => {
    const tool = ordoHabitsTool(
      () => stubClient({ ordo_habit_today: [] }) as any,
    );

    const result: any = await tool.execute('x', {}, {});

    expect(JSON.parse(result.content[0].text)).toEqual([]);
  });
});
