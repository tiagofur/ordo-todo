import { Module } from '@nestjs/common';
import { FAQService } from './faq.service';
import { FAQController } from './faq.controller';
import { RepositoriesModule } from '../repositories/repositories.module';
import { AdminGuard } from '../admin/admin.guard';

@Module({
  imports: [RepositoriesModule],
  controllers: [FAQController],
  providers: [FAQService, AdminGuard],
  exports: [FAQService],
})
export class FAQModule {}
