import { Module } from '@nestjs/common';
import { TasksModule } from '../tasks/tasks.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { AIModule } from '../ai/ai.module';
import { RitualService } from './ritual.service';
import { RitualController } from './ritual.controller';

// ODD 006 (T1): ritual state (morning/evening, streaks in T4).
// Imports TasksModule (DayPlanService) + RepositoriesModule (TaskRepository).
// ODD 006 S2 (T2): + AIModule (AIService.generateDailyReport PM summary).
// DIRECT import, not transitive: Nest does not re-export transitive
// imports, and TasksModule does not re-export AIModule (it only exports
// TasksService/DayPlanService) — RitualService could not resolve
// AIService without this line. No cycles: none of the three imports
// RitualModule back (bootstrap-verified).
// PrismaService arrives via @Global DatabaseModule.
@Module({
  imports: [TasksModule, RepositoriesModule, AIModule],
  controllers: [RitualController],
  providers: [RitualService],
  exports: [RitualService],
})
export class RitualModule {}
