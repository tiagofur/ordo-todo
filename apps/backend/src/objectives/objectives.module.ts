import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ObjectivesController } from './objectives.controller';
import { ObjectivesService } from './objectives.service';
import { RepositoriesModule } from '../repositories/repositories.module';

@Module({
  imports: [DatabaseModule, RepositoriesModule],
  controllers: [ObjectivesController],
  providers: [ObjectivesService],
  exports: [ObjectivesService],
})
export class ObjectivesModule { }
