import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { ActivitiesModule } from '../activities/activities.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    DatabaseModule,
    RepositoriesModule,
    ActivitiesModule,
    NotificationsModule,
    AIModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
