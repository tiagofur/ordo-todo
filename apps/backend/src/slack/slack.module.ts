import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { SlackController } from './slack.controller';
import { SlackOAuthService } from './slack-oauth.service';
import { SlackNotifierService } from './slack-notifier.service';
import { SlackSignatureGuard } from './slack-signature.guard';
import { SLACK_NOTIFIER } from './slack-notifier.port';

@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [SlackController],
  providers: [
    SlackOAuthService,
    SlackNotifierService,
    SlackSignatureGuard,
    { provide: SLACK_NOTIFIER, useExisting: SlackNotifierService },
  ],
  exports: [SlackOAuthService, SlackSignatureGuard, SLACK_NOTIFIER],
})
export class SlackModule {}
