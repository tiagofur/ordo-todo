import { Module } from '@nestjs/common';
import { BillingConfig } from './billing.config';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { BillingWebhookService } from './billing-webhook.service';
import { StripeService } from './stripe.service';

@Module({
  controllers: [BillingController],
  providers: [
    BillingConfig,
    StripeService,
    BillingService,
    BillingWebhookService,
  ],
  exports: [BillingService],
})
export class BillingModule {}
