import { Module } from '@nestjs/common';
import { ApiTokensModule } from '../api-tokens/api-tokens.module';
import { OAuthModule } from '../oauth/oauth.module';
import { V1Module } from '../v1/v1.module';
import { TasksModule } from '../tasks/tasks.module';
import { SearchModule } from '../search/search.module';
import { HabitsModule } from '../habits/habits.module';
import { ObjectivesModule } from '../objectives/objectives.module';
import { McpController } from './mcp.controller';
import { McpWellKnownController } from './mcp-well-known.controller';
import { McpProtocolService } from './mcp-protocol.service';
import { McpCatalogService } from './mcp-catalog.service';
import { McpMetadataService } from './mcp-metadata.service';
import { McpAuthGuard } from './mcp-auth.guard';

@Module({
  imports: [
    ApiTokensModule,
    OAuthModule,
    V1Module,
    TasksModule,
    SearchModule,
    HabitsModule,
    ObjectivesModule,
  ],
  controllers: [McpController, McpWellKnownController],
  providers: [
    McpProtocolService,
    McpCatalogService,
    McpMetadataService,
    McpAuthGuard,
  ],
  exports: [McpProtocolService, McpAuthGuard],
})
export class McpModule {}
