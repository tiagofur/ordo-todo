import { Module } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { DatabaseModule } from '../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RepositoriesModule } from '../repositories/repositories.module';

@Module({
  imports: [DatabaseModule, NotificationsModule, RepositoriesModule],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule { }
