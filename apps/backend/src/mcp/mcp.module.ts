import { Module } from '@nestjs/common';
import { ApiTokensModule } from '../api-tokens/api-tokens.module';
import { OAuthModule } from '../oauth/oauth.module';
import { McpController } from './mcp.controller';
import { McpWellKnownController } from './mcp-well-known.controller';
import { McpProtocolService } from './mcp-protocol.service';
import { McpMetadataService } from './mcp-metadata.service';
import { McpAuthGuard } from './mcp-auth.guard';

@Module({
  imports: [ApiTokensModule, OAuthModule],
  controllers: [McpController, McpWellKnownController],
  providers: [McpProtocolService, McpMetadataService, McpAuthGuard],
  exports: [McpProtocolService, McpAuthGuard],
})
export class McpModule {}
