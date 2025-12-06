import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { TimersController } from './timers.controller';
import { TimersService } from './timers.service';

import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [DatabaseModule, RepositoriesModule, GamificationModule],
  controllers: [TimersController],
  providers: [TimersService],
  exports: [TimersService],
})
export class TimersModule { }
