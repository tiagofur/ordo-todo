import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { SlackController } from './slack.controller';
import { SlackOAuthService } from './slack-oauth.service';
import { SlackSignatureGuard } from './slack-signature.guard';

@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [SlackController],
  providers: [SlackOAuthService, SlackSignatureGuard],
  exports: [SlackOAuthService, SlackSignatureGuard],
})
export class SlackModule {}
