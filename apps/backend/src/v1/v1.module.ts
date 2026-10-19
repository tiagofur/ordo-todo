import { Module } from '@nestjs/common';
import { TasksModule } from '../tasks/tasks.module';
import { ProjectsModule } from '../projects/projects.module';
import { CommentsModule } from '../comments/comments.module';
import { UsersModule } from '../users/users.module';
import { ApiTokensModule } from '../api-tokens/api-tokens.module';
import { PublicApiGuard } from './public-api.guard';
import { V1TasksService } from './v1-tasks.service';
import { V1TasksController } from './v1-tasks.controller';
import { V1ProjectsService } from './v1-projects.service';
import { V1ProjectsController } from './v1-projects.controller';
import { V1CommentsService } from './v1-comments.service';
import { V1CommentsController } from './v1-comments.controller';
import { V1UsersController } from './v1-users.controller';

@Module({
  imports: [
    TasksModule,
    ProjectsModule,
    CommentsModule,
    UsersModule,
    ApiTokensModule,
  ],
  controllers: [
    V1TasksController,
    V1ProjectsController,
    V1CommentsController,
    V1UsersController,
  ],
  providers: [
    PublicApiGuard,
    V1TasksService,
    V1ProjectsService,
    V1CommentsService,
  ],
  exports: [PublicApiGuard],
})
export class V1Module {}
