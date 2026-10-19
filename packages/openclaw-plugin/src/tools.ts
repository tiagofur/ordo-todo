import { textResult } from 'openclaw/plugin-sdk/tool-results';
import type { AgentToolResult } from 'openclaw/plugin-sdk/tool-results';
import { OrdoMcpClient } from './mcp-client.js';
import type { OrdoPluginConfig } from './mcp-client.js';

interface ToolContext {
  config?: OrdoPluginConfig;
}

interface ToolDefinition {
  name: string;
  label: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (
    _id: string,
    params: Record<string, unknown>,
  ) => Promise<AgentToolResult<unknown>>;
}

interface PluginApi {
  registerTool: (tool: ToolDefinition, opts?: Record<string, unknown>) => void;
  registerCommand: (command: {
    name: string;
    description: string;
    acceptsArgs?: boolean;
    handler: (ctx: { args?: string }) => Promise<{ text: string }>;
  }) => void;
}

function text(payload: unknown, details?: unknown) {
  return textResult(
    JSON.stringify(payload, null, 2),
    details ?? payload,
  );
}

function clientFrom(ctx: ToolContext): OrdoMcpClient {
  const token = ctx.config?.token ?? process.env.ORDO_TOKEN ?? '';
  return new OrdoMcpClient({
    serverUrl: ctx.config?.serverUrl,
    token,
  });
}

function param(params: Record<string, unknown>, key: string): string {
  const value = params[key];
  return typeof value === 'string' ? value : '';
}

/**
 * Tool factories. Pure functions of (ctx, params) so they are unit
 * testable without the OpenClaw runtime; the plugin entry below only
 * wires them to `api.registerTool`.
 */
export function ordoTodayTool(getClient: (ctx: ToolContext) => OrdoMcpClient = clientFrom): ToolDefinition {
  return {
    name: 'ordo_today',
    label: 'Ordo today',
    description:
      'What is on today: due/overdue tasks plus habits left. Start here every morning.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
    async execute(_id, _params, ctx?: ToolContext) {
      const client = getClient(ctx ?? {});
      const [tasks, habits] = await Promise.all([
        client.callTool('ordo_task_list', {}),
        client.callTool('ordo_habit_today', {}),
      ]);
      return text({ tasks, habits });
    },
  };
}

export function ordoTaskCreateTool(getClient: (ctx: ToolContext) => OrdoMcpClient = clientFrom): ToolDefinition {
  return {
    name: 'ordo_task_create',
    label: 'Ordo create task',
    description: 'Create an Ordo task. Needs a title and a project id.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        projectId: { type: 'string' },
        description: { type: 'string' },
        priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
      },
      required: ['title', 'projectId'],
      additionalProperties: false,
    },
    async execute(_id, params, ctx?: ToolContext) {
      const client = getClient(ctx ?? {});
      const created = await client.callTool('ordo_task_create', {
        title: param(params, 'title'),
        projectId: param(params, 'projectId'),
        ...(param(params, 'description')
          ? { description: param(params, 'description') }
          : {}),
        ...(param(params, 'priority') ? { priority: param(params, 'priority') } : {}),
      });
      return text(created);
    },
  };
}

export function ordoTaskDoneTool(getClient: (ctx: ToolContext) => OrdoMcpClient = clientFrom): ToolDefinition {
  return {
    name: 'ordo_task_done',
    label: 'Ordo complete task',
    description: 'Mark an Ordo task as completed by id.',
    parameters: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
      additionalProperties: false,
    },
    async execute(_id, params, ctx?: ToolContext) {
      const client = getClient(ctx ?? {});
      const done = await client.callTool('ordo_task_complete', {
        id: param(params, 'id'),
      });
      return text(done);
    },
  };
}

export function ordoHabitsTool(getClient: (ctx: ToolContext) => OrdoMcpClient = clientFrom): ToolDefinition {
  return {
    name: 'ordo_habits',
    label: 'Ordo habits',
    description: "Today's habits with completion status.",
    parameters: { type: 'object', properties: {}, additionalProperties: false },
    async execute(_id, _params, ctx?: ToolContext) {
      const client = getClient(ctx ?? {});
      return text(await client.callTool('ordo_habit_today', {}));
    },
  };
}

export function ordoPlanDayTool(getClient: (ctx: ToolContext) => OrdoMcpClient = clientFrom): ToolDefinition {
  return {
    name: 'ordo_plan_day',
    label: 'Ordo plan day',
    description:
      'Day briefing: tasks, habits and objective progress in one summary payload.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
    async execute(_id, _params, ctx?: ToolContext) {
      const client = getClient(ctx ?? {});
      const [tasks, habits, objectives, me] = await Promise.all([
        client.callTool('ordo_task_list', {}),
        client.callTool('ordo_habit_today', {}),
        client.callTool('ordo_objective_progress', {}),
        client.callTool('ordo_me', {}),
      ]);
      return text({ me, tasks, habits, objectives });
    },
  };
}

export function toolFactories(): ((
  getClient?: (ctx: ToolContext) => OrdoMcpClient,
) => ToolDefinition)[] {
  return [
    ordoTodayTool,
    ordoTaskCreateTool,
    ordoTaskDoneTool,
    ordoHabitsTool,
    ordoPlanDayTool,
  ];
}
