import { Controller, Get, Req } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { McpMetadataService } from './mcp-metadata.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('MCP')
@Controller('.well-known')
export class McpWellKnownController {
  constructor(private readonly metadata: McpMetadataService) {}

  @Public()
  @Get('oauth-protected-resource')
  @ApiExcludeEndpoint()
  protectedResource(@Req() req: Request) {
    const host = req.get('host');
    return this.metadata.getProtectedResourceMetadata(
      `${req.protocol}://${host}`,
    );
  }
}
