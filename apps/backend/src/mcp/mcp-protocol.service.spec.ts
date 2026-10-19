import { Test, TestingModule } from '@nestjs/testing';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpProtocolService } from './mcp-protocol.service';

describe('McpProtocolService (against official SDK client)', () => {
  let service: McpProtocolService;
  let client: Client;
  let clientTransport: InstanceType<typeof InMemoryTransport>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [McpProtocolService],
    }).compile();

    service = module.get<McpProtocolService>(McpProtocolService);

    const [serverTransport, linkedClientTransport] =
      InMemoryTransport.createLinkedPair();
    clientTransport = linkedClientTransport;
    await service.connect(serverTransport);

    client = new Client({ name: 'test-client', version: '0.0.0' });
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await client.close().catch(() => undefined);
    await service.close().catch(() => undefined);
  });

  it('should complete the initialize handshake', async () => {
    const result = await client.listTools();

    expect(result.tools.map((tool) => tool.name)).toContain('ordo_ping');
  });

  it('should list registered tools with input schemas', async () => {
    const { tools } = await client.listTools();
    const ping = tools.find((tool) => tool.name === 'ordo_ping');

    expect(ping).toBeDefined();
    expect(ping?.inputSchema).toEqual(
      expect.objectContaining({ type: 'object' }),
    );
  });

  it('should call a tool and return text content', async () => {
    const result = await client.callTool({ name: 'ordo_ping', arguments: {} });

    expect(result.content).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'text' })]),
    );
  });

  it('should return isError for unknown tools', async () => {
    const result = await client.callTool({
      name: 'ordo_nope',
      arguments: {},
    });

    expect(result.isError).toBe(true);
  });
});
