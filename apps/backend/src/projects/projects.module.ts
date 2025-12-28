import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectGuard } from '../common/guards/project.guard';

import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [DatabaseModule, RepositoriesModule, WorkspacesModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectGuard],
  exports: [ProjectsService],
})
export class ProjectsModule {}
