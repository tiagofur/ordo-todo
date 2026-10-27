import { Module } from '@nestjs/common';
import { BillingConfig } from './billing.config';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { StripeService } from './stripe.service';

@Module({
  controllers: [BillingController],
  providers: [BillingConfig, StripeService, BillingService],
  exports: [BillingService],
})
export class BillingModule {}
