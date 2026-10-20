import { Module } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { RepositoriesModule } from '../repositories/repositories.module';

// T3a: SchedulingService triggers need the 'TaskRepository' provider.
// Scheduling stays stateless w.r.t. tasks/ai: it imports the repository
// layer only (no TasksModule/AIModule), so no DI cycles.
// PrismaService arrives via @Global DatabaseModule.
@Module({
  imports: [RepositoriesModule],
  providers: [SchedulingService],
  exports: [SchedulingService],
})
export class SchedulingModule {}
