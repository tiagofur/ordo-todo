import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AIModule } from '../ai/ai.module';
import { AgentJobsController } from './agent-jobs.controller';
import { AgentJobsService } from './agent-jobs.service';
import { AgentJobsScheduler } from './agent-jobs.scheduler';

@Module({
  imports: [DatabaseModule, RepositoriesModule, NotificationsModule, AIModule],
  controllers: [AgentJobsController],
  providers: [AgentJobsService, AgentJobsScheduler],
  exports: [AgentJobsService],
})
export class AgentJobsModule {}
