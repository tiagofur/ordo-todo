import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TagsModule } from '../tags/tags.module';
import { CommentsModule } from '../comments/comments.module';
import { AttachmentsModule } from '../attachments/attachments.module';
import { ActivitiesModule } from '../activities/activities.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [
    DatabaseModule,
    RepositoriesModule,
    ActivitiesModule,
    forwardRef(() => TagsModule),
    forwardRef(() => CommentsModule),
    forwardRef(() => AttachmentsModule),
    NotificationsModule,
    GamificationModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule { }
