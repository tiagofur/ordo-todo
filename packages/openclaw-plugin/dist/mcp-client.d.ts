export declare const DEFAULT_SERVER_URL = "https://ordotodo.app/mcp";
export declare const MCP_PROTOCOL_VERSION = "2025-06-18";
export declare const PLUGIN_CLIENT_NAME = "ordo-openclaw-plugin";
export declare const PLUGIN_CLIENT_VERSION = "0.1.0";
export interface OrdoPluginConfig {
    serverUrl?: string;
    token: string;
}
export interface JsonRpcResponse {
    jsonrpc: '2.0';
    id: number | string;
    result?: unknown;
    error?: {
        code: number;
        message: string;
        data?: unknown;
    };
}
export type FetchLike = (url: string, init: {
    method: string;
    headers: Record<string, string>;
    body: string;
}) => Promise<{
    ok: boolean;
    status: number;
    json(): Promise<unknown>;
    text(): Promise<string>;
}>;
/**
 * Minimal MCP client over Streamable HTTP (stateless POST).
 *
 * Speaks to the Ordo MCP server (`POST /mcp`, JSON-RPC 2.0) with the
 * user's token. Kept dependency-free (injected fetch) so it is unit
 * testable without the OpenClaw runtime.
 */
export declare class OrdoMcpClient {
    private readonly serverUrl;
    private readonly token;
    private readonly doFetch;
    private nextId;
    constructor(config: OrdoPluginConfig, doFetch?: FetchLike);
    initialize(): Promise<{
        serverInfo: {
            name: string;
            version: string;
        };
    }>;
    listTools(): Promise<{
        name: string;
        description?: string;
    }[]>;
    callTool<T = unknown>(name: string, args?: Record<string, unknown>): Promise<T>;
    private request;
}
//# sourceMappingURL=mcp-client.d.ts.map