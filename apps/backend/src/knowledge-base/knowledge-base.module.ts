import { Module } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { RepositoriesModule } from '../repositories/repositories.module';
import { AdminGuard } from '../admin/admin.guard';

@Module({
  imports: [RepositoriesModule],
  controllers: [KnowledgeBaseController],
  providers: [KnowledgeBaseService, AdminGuard],
  exports: [KnowledgeBaseService],
})
export class KnowledgeBaseModule {}
