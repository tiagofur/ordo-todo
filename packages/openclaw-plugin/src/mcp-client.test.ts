import { describe, expect, it, vi } from 'vitest';
import { OrdoMcpClient, DEFAULT_SERVER_URL } from './mcp-client.js';

function mockFetch(handler: (body: any) => any) {
  return vi.fn(async (_url: string, init: any) => {
    const request = JSON.parse(init.body);
    return {
      ok: true,
      status: 200,
      json: async () => ({
        jsonrpc: '2.0',
        id: request.id,
        result: handler(request),
      }),
      text: async () => '',
    };
  });
}

describe('OrdoMcpClient', () => {
  it('should require a token', () => {
    expect(() => new OrdoMcpClient({ token: '' })).toThrow('token is required');
  });

  it('should initialize with the protocol handshake', async () => {
    const doFetch = mockFetch(() => ({
      serverInfo: { name: 'ordo-mcp', version: '0.1.0' },
    }));
    const client = new OrdoMcpClient({ token: 'ordo_pat_x' }, doFetch as any);

    const result = await client.initialize();

    expect(result.serverInfo.name).toBe('ordo-mcp');
    const [, init] = doFetch.mock.calls[0];
    expect(init.headers.authorization).toBe('Bearer ordo_pat_x');
    expect(JSON.parse(init.body).method).toBe('initialize');
  });

  it('should POST to the default server URL', async () => {
    const doFetch = mockFetch(() => ({ tools: [] }));
    const client = new OrdoMcpClient({ token: 't' }, doFetch as any);

    await client.listTools();

    expect(doFetch.mock.calls[0][0]).toBe(DEFAULT_SERVER_URL);
  });

  it('should call tools and parse text JSON results', async () => {
    const doFetch = mockFetch(() => ({
      content: [{ type: 'text', text: JSON.stringify([{ id: 'task-1' }]) }],
    }));
    const client = new OrdoMcpClient({ token: 't' }, doFetch as any);

    const result = await client.callTool('ordo_task_list', { projectId: 'p' });

    expect(result).toEqual([{ id: 'task-1' }]);
    const body = JSON.parse(doFetch.mock.calls[0][1].body);
    expect(body.params).toEqual({
      name: 'ordo_task_list',
      arguments: { projectId: 'p' },
    });
  });

  it('should throw readable errors on tool failures', async () => {
    const doFetch = mockFetch(() => ({
      isError: true,
      content: [{ type: 'text', text: JSON.stringify({ error: 'Task not found' }) }],
    }));
    const client = new OrdoMcpClient({ token: 't' }, doFetch as any);

    await expect(client.callTool('ordo_task_get', { id: 'x' })).rejects.toThrow(
      'Task not found',
    );
  });

  it('should translate 401 and 429 into actionable messages', async () => {
    const unauthorized = vi.fn(async () => ({
      ok: false,
      status: 401,
      json: async () => ({}),
      text: async () => '',
    }));
    const client401 = new OrdoMcpClient({ token: 'bad' }, unauthorized as any);
    await expect(client401.listTools()).rejects.toThrow('rejected the token');

    const limited = vi.fn(async () => ({
      ok: false,
      status: 429,
      json: async () => ({}),
      text: async () => '',
    }));
    const client429 = new OrdoMcpClient({ token: 't' }, limited as any);
    await expect(client429.listTools()).rejects.toThrow('rate limit');
  });

  it('should surface JSON-RPC errors', async () => {
    const doFetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        jsonrpc: '2.0',
        id: 1,
        error: { code: -32601, message: 'Method not found' },
      }),
      text: async () => '',
    }));
    const client = new OrdoMcpClient({ token: 't' }, doFetch as any);

    await expect(client.listTools()).rejects.toThrow('Method not found');
  });
});
