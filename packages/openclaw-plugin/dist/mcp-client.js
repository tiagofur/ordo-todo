export const DEFAULT_SERVER_URL = 'https://ordotodo.app/mcp';
export const MCP_PROTOCOL_VERSION = '2025-06-18';
export const PLUGIN_CLIENT_NAME = 'ordo-openclaw-plugin';
export const PLUGIN_CLIENT_VERSION = '0.1.0';
/**
 * Minimal MCP client over Streamable HTTP (stateless POST).
 *
 * Speaks to the Ordo MCP server (`POST /mcp`, JSON-RPC 2.0) with the
 * user's token. Kept dependency-free (injected fetch) so it is unit
 * testable without the OpenClaw runtime.
 */
export class OrdoMcpClient {
    serverUrl;
    token;
    doFetch;
    nextId = 1;
    constructor(config, doFetch) {
        if (!config.token) {
            throw new Error('Ordo token is required (ordo_pat_... or OAuth access token)');
        }
        this.serverUrl = config.serverUrl ?? DEFAULT_SERVER_URL;
        this.token = config.token;
        this.doFetch = doFetch ?? fetch;
    }
    async initialize() {
        const result = await this.request('initialize', {
            protocolVersion: MCP_PROTOCOL_VERSION,
            capabilities: {},
            clientInfo: { name: PLUGIN_CLIENT_NAME, version: PLUGIN_CLIENT_VERSION },
        });
        return result;
    }
    async listTools() {
        const result = await this.request('tools/list', {});
        return (result.tools ?? []);
    }
    async callTool(name, args = {}) {
        const result = (await this.request('tools/call', {
            name,
            arguments: args,
        }));
        const text = result.content?.find((part) => part.type === 'text')?.text ?? '';
        let parsed = text;
        try {
            parsed = text ? JSON.parse(text) : null;
        }
        catch {
            parsed = text;
        }
        if (result.isError) {
            const message = typeof parsed === 'object' && parsed !== null && 'error' in parsed
                ? String(parsed.error)
                : text || `Tool ${name} failed`;
            throw new Error(message);
        }
        return parsed;
    }
    async request(method, params) {
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
        const payload = (await response.json());
        if (payload.error) {
            throw new Error(payload.error.message || `MCP error ${payload.error.code}`);
        }
        return payload.result;
    }
}
