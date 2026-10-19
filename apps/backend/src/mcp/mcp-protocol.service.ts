import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { z } from 'zod';
import { MCP_SERVER_NAME, MCP_SERVER_VERSION } from './mcp.constants';

/**
 * Owns the SDK `McpServer` instance and tool registration.
 *
 * T1 wires the transport plus a single health tool (`ordo_ping`).
 * Domain tools (`ordo_*`) are registered by the catalog in T3;
 * auth scoping arrives with T2.
 */
@Injectable()
export class McpProtocolService implements OnModuleDestroy {
  private readonly logger = new Logger(McpProtocolService.name);
  private readonly server: McpServer;
  private transport?: Transport;

  constructor() {
    this.server = new McpServer({
      name: MCP_SERVER_NAME,
      version: MCP_SERVER_VERSION,
    });
    this.registerHealthTools();
  }

  get serverInfo(): { name: string; version: string } {
    return { name: MCP_SERVER_NAME, version: MCP_SERVER_VERSION };
  }

  getServer(): McpServer {
    return this.server;
  }

  async connect(transport: Transport): Promise<void> {
    this.transport = transport;
    await this.server.connect(transport);
    this.logger.log('MCP server connected to transport');
  }

  async close(): Promise<void> {
    await this.server.close();
    this.transport = undefined;
  }

  async onModuleDestroy(): Promise<void> {
    await this.close().catch((error: unknown) => {
      this.logger.warn(`Error closing MCP server: ${(error as Error).message}`);
    });
  }

  private registerHealthTools(): void {
    this.server.registerTool(
      'ordo_ping',
      {
        title: 'Ordo ping',
        description: 'Health check for the Ordo MCP server. Always returns ok.',
        inputSchema: z.object({}).shape,
      },
      async () => ({
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ ok: true, server: MCP_SERVER_NAME }),
          },
        ],
      }),
    );
  }
}
