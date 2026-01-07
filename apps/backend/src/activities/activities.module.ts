import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { ActivitiesService } from './activities.service';
import { LogActivityUseCase } from '@ordo-todo/core';
import { GetTaskActivitiesUseCase } from '@ordo-todo/core';

@Module({
  imports: [DatabaseModule, RepositoriesModule],
  providers: [
    ActivitiesService,
    {
      provide: 'LogActivityUseCase',
      useFactory: (activityRepo: any) => new LogActivityUseCase(activityRepo),
      inject: ['ActivityRepository'],
    },
    {
      provide: 'GetTaskActivitiesUseCase',
      useFactory: (activityRepo: any) => new GetTaskActivitiesUseCase(activityRepo),
      inject: ['ActivityRepository'],
    },
  ],
  exports: [ActivitiesService, 'LogActivityUseCase', 'GetTaskActivitiesUseCase'],
})
export class ActivitiesModule {}
