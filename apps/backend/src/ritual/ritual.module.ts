import { Module } from '@nestjs/common';
import { TasksModule } from '../tasks/tasks.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { RitualService } from './ritual.service';
import { RitualController } from './ritual.controller';

// ODD 006 (T1): ritual state (morning/evening, streaks in T4).
// Imports TasksModule (DayPlanService) + RepositoriesModule (TaskRepository).
// No cycles: neither TasksModule nor RepositoriesModule imports RitualModule.
// PrismaService arrives via @Global DatabaseModule.
@Module({
  imports: [TasksModule, RepositoriesModule],
  controllers: [RitualController],
  providers: [RitualService],
  exports: [RitualService],
})
export class RitualModule {}
