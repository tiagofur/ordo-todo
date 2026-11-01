import { Module } from '@nestjs/common';
import { ChangelogService } from './changelog.service';
import { ChangelogController } from './changelog.controller';
import { DatabaseModule } from '../database/database.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { AdminGuard } from '../admin/admin.guard';

@Module({
  imports: [DatabaseModule, RepositoriesModule],
  controllers: [ChangelogController],
  providers: [ChangelogService, AdminGuard],
  exports: [ChangelogService],
})
export class ChangelogModule {}
