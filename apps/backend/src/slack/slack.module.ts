import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { V1Module } from '../v1/v1.module';
import { AIModule } from '../ai/ai.module';
import { SlackController } from './slack.controller';
import { SlackOAuthService } from './slack-oauth.service';
import { SlackNotifierService } from './slack-notifier.service';
import { SlackActionsService } from './slack-actions.service';
import { SlackSignatureGuard } from './slack-signature.guard';
import { SLACK_NOTIFIER } from './slack-notifier.port';

@Module({
  imports: [DatabaseModule, ConfigModule, V1Module, AIModule],
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
