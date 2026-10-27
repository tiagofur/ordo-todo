import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BillingModule } from '../billing/billing.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';

@Module({
  imports: [DatabaseModule, RepositoriesModule, BillingModule],
  controllers: [AttachmentsController],
  providers: [AttachmentsService],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
