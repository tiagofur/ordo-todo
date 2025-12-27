import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { BcryptHashService } from '../common/services/bcrypt-hash.service';

@Module({
  imports: [DatabaseModule, RepositoriesModule],
  controllers: [WorkspacesController],
  providers: [
    WorkspacesService,
    {
      provide: 'HashService',
      useClass: BcryptHashService,
    },
  ],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
