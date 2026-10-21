import { Module } from '@nestjs/common';
import { ApiTokensModule } from '../api-tokens/api-tokens.module';
import { OAuthModule } from '../oauth/oauth.module';
import { V1Module } from '../v1/v1.module';
import { TasksModule } from '../tasks/tasks.module';
import { SchedulingModule } from '../scheduling/scheduling.module';
import { SearchModule } from '../search/search.module';
import { HabitsModule } from '../habits/habits.module';
import { ObjectivesModule } from '../objectives/objectives.module';
import { AuthAuditService } from '../auth/auth-audit.service';
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
    // ODD 005 S6 (T5): RiskAlertService for ordo_day_plan risks.
    // No cycle: SchedulingModule imports RepositoriesModule only.
    SchedulingModule,
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
    AuthAuditService,
  ],
  exports: [McpProtocolService, McpAuthGuard],
})
export class McpModule {}
