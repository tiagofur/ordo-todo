import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ApiTokensController } from './api-tokens.controller';
import { ApiTokensService } from './api-tokens.service';
import { ApiTokenGuard } from './api-token.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [ApiTokensController],
  providers: [ApiTokensService, ApiTokenGuard],
  exports: [ApiTokensService, ApiTokenGuard],
})
export class ApiTokensModule {}
