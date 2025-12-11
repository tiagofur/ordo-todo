import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { GamificationModule } from '../gamification/gamification.module';
import { HabitsController } from './habits.controller';
import { HabitsService } from './habits.service';

@Module({
  imports: [DatabaseModule, GamificationModule],
  controllers: [HabitsController],
  providers: [HabitsService],
  exports: [HabitsService],
})
export class HabitsModule {}
