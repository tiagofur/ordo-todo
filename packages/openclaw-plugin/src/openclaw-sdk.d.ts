/**
 * Minimal ambient declarations for the OpenClaw plugin SDK.
 *
 * `openclaw` is a peer (optional: true) — never a direct dependency —
 * because its preinstall script requires Node >=24 while this repo's
 * CI runs Node 20. These declarations mirror the exact SDK shapes the
 * plugin uses (verified against openclaw@2026.10.5):
 *
 * - `definePluginEntry` from `openclaw/plugin-sdk/core`
 * - `textResult` + `AgentToolResult` from `openclaw/plugin-sdk/tool-results`
 *
 * If the SDK changes these shapes, `openclaw plugins inspect ordo
 * --runtime --json` (runbook in README) catches it at publish time.
 */
declare module 'openclaw/plugin-sdk/core' {
  export interface OpenClawPluginToolContext {
    config?: Record<string, unknown>;
  }

  export interface OpenClawPluginApi {
    registerTool: (
      tool: unknown,
      opts?: Record<string, unknown>,
    ) => void;
    registerCommand: (command: {
      name: string;
      description: string;
      acceptsArgs?: boolean;
      handler: (ctx: { args?: string }) => Promise<{ text: string }>;
    }) => void;
  }

  export interface OpenClawPluginDefinition {
    id: string;
    name: string;
    description: string;
    register: (api: OpenClawPluginApi) => void;
  }

  export function definePluginEntry(
    definition: OpenClawPluginDefinition,
  ): OpenClawPluginDefinition;
}

declare module 'openclaw/plugin-sdk/tool-results' {
  export interface AgentToolResult<TDetails = unknown> {
    content: { type: 'text'; text: string }[];
    details?: TDetails;
  }

  export function textResult<TDetails>(
    text: string,
    details: TDetails,
  ): AgentToolResult<TDetails>;
  export function jsonResult<TDetails>(
    payload: TDetails,
  ): AgentToolResult<TDetails>;
}
