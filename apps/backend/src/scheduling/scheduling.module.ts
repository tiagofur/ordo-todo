import { Module } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { DurationLearningService } from './duration-learning.service';
import { RiskAlertService } from './risk-alert.service';
import { RepositoriesModule } from '../repositories/repositories.module';

// T3a: SchedulingService triggers need the 'TaskRepository' provider.
// Scheduling stays stateless w.r.t. tasks/ai: it imports the repository
// layer only (no TasksModule/AIModule), so no DI cycles.
// PrismaService arrives via @Global DatabaseModule.
// T4: DurationLearningService (S5) + RiskAlertService (S4) follow the same
// rule — repositories only. RiskAlertService takes NotificationsService via
// @Optional (never imported as a module: no cycle, may be undefined).
@Module({
  imports: [RepositoriesModule],
  providers: [SchedulingService, DurationLearningService, RiskAlertService],
  exports: [SchedulingService, DurationLearningService, RiskAlertService],
})
export class SchedulingModule {}
