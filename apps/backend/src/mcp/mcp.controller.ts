import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { McpProtocolService } from './mcp-protocol.service';
import { McpAuthGuard } from './mcp-auth.guard';
import { TokenRateLimitGuard } from '../v1/token-rate-limit.guard';
import { runWithMcpContext } from './mcp-context';
import { Public } from '../common/decorators/public.decorator';

/**
 * Streamable HTTP endpoint for the MCP server (S1).
 *
 * Stateless mode (`sessionIdGenerator: undefined`): every request gets
 * a fresh transport, no session tracking, no SSE streams held open.
 * {@link McpAuthGuard} authenticates (PAT or OAuth) and
 * {@link TokenRateLimitGuard} throttles per token before the SDK
 * sees the request.
 */
@ApiTags('MCP')
@Controller('mcp')
export class McpController {
  constructor(private readonly protocol: McpProtocolService) {}

  // @Public skips the global session-JWT guard; McpAuthGuard (PAT or
  // OAuth) + TokenRateLimitGuard are the real protection for this endpoint.
  @Public()
  @UseGuards(McpAuthGuard, TokenRateLimitGuard)
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async handlePost(@Req() req: Request, @Res() res: Response): Promise<void> {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    res.on('close', () => {
      void transport.close();
    });
    const user = (req as unknown as { user: { id: string } }).user;
    const scopes = (req as unknown as { mcpScopes?: string[] }).mcpScopes ?? [];
    const oauth = (req as unknown as { oauth?: { clientId?: string } }).oauth;
    const apiToken = (req as unknown as { apiToken?: { id?: string } })
      .apiToken;
    await this.protocol.getServer().connect(transport);
    await runWithMcpContext(
      {
        userId: user.id,
        scopes,
        clientId: oauth?.clientId,
        tokenId: apiToken?.id,
      },
      () => transport.handleRequest(req as never, res as never, req.body),
    );
  }

  @Public()
  @Get()
  @ApiExcludeEndpoint()
  async handleGet(@Req() req: Request, @Res() res: Response): Promise<void> {
    // Stateless mode: no standalone SSE streams. Clients must use POST.
    res.status(HttpStatus.METHOD_NOT_ALLOWED).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Stateless MCP server: use POST /mcp for all requests',
      },
      id: null,
    });
  }

  @Public()
  @Delete()
  @ApiExcludeEndpoint()
  async handleDelete(@Req() req: Request, @Res() res: Response): Promise<void> {
    // Stateless mode: nothing to terminate server-side.
    res.status(HttpStatus.OK).json({ ok: true });
  }
}
