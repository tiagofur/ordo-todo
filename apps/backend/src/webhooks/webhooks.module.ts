import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { V1Module } from '../v1/v1.module';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WebhookDispatcherService } from './webhook-dispatcher.service';
import { WebhookCryptoService } from './webhook-crypto.service';

@Module({
  imports: [DatabaseModule, ConfigModule, V1Module],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhookDispatcherService, WebhookCryptoService],
  exports: [WebhooksService, WebhookDispatcherService],
})
export class WebhooksModule {}
