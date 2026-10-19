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
    execute: (_id: string, params: Record<string, unknown>) => Promise<AgentToolResult<unknown>>;
}
/**
 * Tool factories. Pure functions of (ctx, params) so they are unit
 * testable without the OpenClaw runtime; the plugin entry below only
 * wires them to `api.registerTool`.
 */
export declare function ordoTodayTool(getClient?: (ctx: ToolContext) => OrdoMcpClient): ToolDefinition;
export declare function ordoTaskCreateTool(getClient?: (ctx: ToolContext) => OrdoMcpClient): ToolDefinition;
export declare function ordoTaskDoneTool(getClient?: (ctx: ToolContext) => OrdoMcpClient): ToolDefinition;
export declare function ordoHabitsTool(getClient?: (ctx: ToolContext) => OrdoMcpClient): ToolDefinition;
export declare function ordoPlanDayTool(getClient?: (ctx: ToolContext) => OrdoMcpClient): ToolDefinition;
export declare function toolFactories(): ((getClient?: (ctx: ToolContext) => OrdoMcpClient) => ToolDefinition)[];
export {};
//# sourceMappingURL=tools.d.ts.map