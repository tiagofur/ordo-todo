import { Module } from '@nestjs/common';
import { CustomFieldsController } from './custom-fields.controller';
import { CustomFieldsService } from './custom-fields.service';
import { DatabaseModule } from '@/database/database.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { CustomFieldGuard } from '../common/guards/custom-field.guard';

@Module({
  imports: [DatabaseModule, RepositoriesModule],
  controllers: [CustomFieldsController],
  providers: [CustomFieldsService, CustomFieldGuard],
  exports: [CustomFieldsService],
})
export class CustomFieldsModule {}
