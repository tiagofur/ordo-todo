import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { GamificationModule } from '../gamification/gamification.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { HabitsController } from './habits.controller';
import { HabitsService } from './habits.service';

@Module({
  imports: [DatabaseModule, GamificationModule, RepositoriesModule],
  controllers: [HabitsController],
  providers: [HabitsService],
  exports: [HabitsService],
})
export class HabitsModule {}
