import { Module } from '@nestjs/common';
import { McpController } from './mcp.controller';
import { McpProtocolService } from './mcp-protocol.service';

@Module({
  controllers: [McpController],
  providers: [McpProtocolService],
  exports: [McpProtocolService],
})
export class McpModule {}
