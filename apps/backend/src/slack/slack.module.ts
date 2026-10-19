import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { SlackController } from './slack.controller';
import { SlackOAuthService } from './slack-oauth.service';
import { SlackNotifierService } from './slack-notifier.service';
import { SlackActionsService } from './slack-actions.service';
import { SlackSignatureGuard } from './slack-signature.guard';
import { SLACK_NOTIFIER } from './slack-notifier.port';

@Module({
  // NOTE: V1Module/AIModule deliberately NOT imported: SlackModule is
  // imported (forwardRef) by NotificationsModule, which TasksModule
  // imports directly — closing that loop breaks ES evaluation
  // (V1Module.imports[0] === undefined at bootstrap). SlackActionsService
  // resolves V1TasksService/AIService lazily via ModuleRef instead.
  imports: [DatabaseModule, ConfigModule],
  controllers: [SlackController],
  providers: [
    SlackOAuthService,
    SlackNotifierService,
    SlackActionsService,
    SlackSignatureGuard,
    { provide: SLACK_NOTIFIER, useExisting: SlackNotifierService },
  ],
  exports: [SlackOAuthService, SlackSignatureGuard, SLACK_NOTIFIER],
})
export class SlackModule {}
