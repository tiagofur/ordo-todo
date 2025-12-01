import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ActivitiesService } from './activities.service';

@Module({
  imports: [DatabaseModule],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
