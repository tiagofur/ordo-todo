export const DEFAULT_SERVER_URL = 'https://ordotodo.app/mcp';
export const MCP_PROTOCOL_VERSION = '2025-06-18';
export const PLUGIN_CLIENT_NAME = 'ordo-openclaw-plugin';
export const PLUGIN_CLIENT_VERSION = '0.1.0';

export interface OrdoPluginConfig {
  serverUrl?: string;
  token: string;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export type FetchLike = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string },
) => Promise<{ ok: boolean; status: number; json(): Promise<unknown>; text(): Promise<string> }>;

/**
 * Minimal MCP client over Streamable HTTP (stateless POST).
 *
 * Speaks to the Ordo MCP server (`POST /mcp`, JSON-RPC 2.0) with the
 * user's token. Kept dependency-free (injected fetch) so it is unit
 * testable without the OpenClaw runtime.
 */
export class OrdoMcpClient {
  private readonly serverUrl: string;
  private readonly token: string;
  private readonly doFetch: FetchLike;
  private nextId = 1;

  constructor(config: OrdoPluginConfig, doFetch?: FetchLike) {
    if (!config.token) {
      throw new Error('Ordo token is required (ordo_pat_... or OAuth access token)');
    }
    this.serverUrl = config.serverUrl ?? DEFAULT_SERVER_URL;
    this.token = config.token;
    this.doFetch = doFetch ?? (fetch as unknown as FetchLike);
  }

  async initialize(): Promise<{ serverInfo: { name: string; version: string } }> {
    const result = await this.request('initialize', {
      protocolVersion: MCP_PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: PLUGIN_CLIENT_NAME, version: PLUGIN_CLIENT_VERSION },
    });
    return result as { serverInfo: { name: string; version: string } };
  }

  async listTools(): Promise<{ name: string; description?: string }[]> {
    const result = await this.request('tools/list', {});
    return ((result as { tools?: { name: string; description?: string }[] }).tools ?? []);
  }

  async callTool<T = unknown>(
    name: string,
    args: Record<string, unknown> = {},
  ): Promise<T> {
    const result = (await this.request('tools/call', {
      name,
      arguments: args,
    })) as {
      content?: { type: string; text?: string }[];
      isError?: boolean;
    };
    const text = result.content?.find((part) => part.type === 'text')?.text ?? '';
    let parsed: unknown = text;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }
    if (result.isError) {
      const message =
        typeof parsed === 'object' && parsed !== null && 'error' in parsed
          ? String((parsed as { error: unknown }).error)
          : text || `Tool ${name} failed`;
      throw new Error(message);
    }
    return parsed as T;
  }

  private async request(method: string, params: unknown): Promise<unknown> {
    const id = this.nextId++;
    const response = await this.doFetch(this.serverUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
        authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Ordo rejected the token (401). Check the token in the plugin config.');
      }
      if (response.status === 429) {
        throw new Error('Ordo rate limit exceeded. Wait a minute and retry.');
      }
      throw new Error(`Ordo MCP request failed with status ${response.status}`);
    }
    const payload = (await response.json()) as JsonRpcResponse;
    if (payload.error) {
      throw new Error(payload.error.message || `MCP error ${payload.error.code}`);
    }
    return payload.result;
  }
}
