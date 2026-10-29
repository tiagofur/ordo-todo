import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { McpMetadataService } from './mcp-metadata.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('MCP')
@Controller('.well-known')
export class McpWellKnownController {
  constructor(
    private readonly metadata: McpMetadataService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Get('oauth-protected-resource')
  @ApiExcludeEndpoint()
  protectedResource(@Req() req: Request) {
    const host = req.get('host');
    return this.metadata.getProtectedResourceMetadata(
      `${req.protocol}://${host}`,
    );
  }

  /**
   * OpenAI Apps plugin portal: during domain verification it serves a
   * one-off token that must come back verbatim as text/plain from this
   * path on the MCP host. Empty env = no verification in progress → 404.
   */
  @Public()
  @Get('openai-apps-challenge')
  @ApiExcludeEndpoint()
  openaiAppsChallenge(@Res() res: Response) {
    const token = this.config.get<string>('OPENAI_APPS_CHALLENGE_TOKEN');
    if (!token) {
      res.status(HttpStatus.NOT_FOUND).end();
      return;
    }
    res.type('text/plain').send(token);
  }
}
