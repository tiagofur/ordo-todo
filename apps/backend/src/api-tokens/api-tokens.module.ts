import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthAuditService } from '../auth/auth-audit.service';
import { ApiTokensController } from './api-tokens.controller';
import { ApiTokensService } from './api-tokens.service';
import { ApiTokenGuard } from './api-token.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [ApiTokensController],
  providers: [ApiTokensService, ApiTokenGuard, AuthAuditService],
  exports: [ApiTokensService, ApiTokenGuard],
})
export class ApiTokensModule {}
