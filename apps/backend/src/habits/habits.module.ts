import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { GamificationModule } from '../gamification/gamification.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { HabitsController } from './habits.controller';
import { HabitsService } from './habits.service';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [DatabaseModule, GamificationModule, RepositoriesModule, AIModule],
  controllers: [HabitsController],
  providers: [HabitsService],
  exports: [HabitsService],
})
export class HabitsModule {}
