import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ActivitiesModule } from '../activities/activities.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [DatabaseModule, ActivitiesModule, NotificationsModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule { }
