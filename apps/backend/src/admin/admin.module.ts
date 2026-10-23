import { Module } from '@nestjs/common';
import { RepositoriesModule } from '../repositories/repositories.module';
import { AdminController } from './admin.controller';
import { AdminGuard } from './admin.guard';
import { AdminUsersService } from './admin-users.service';
import { AdminOverviewService } from './admin-overview.service';
import { AdminInviteCodesService } from './admin-invite-codes.service';
import { AuthAuditService } from '../auth/auth-audit.service';

/**
 * Platform admin (ODD 019). Provides its own AuthAuditService instance so it
 * does not drag the whole AuthModule/WorkspacesModule graph; RepositoriesModule
 * exports the 'AuthAuditLogRepository' token the audit service injects, and
 * DatabaseModule is @Global so PrismaService resolves everywhere.
 */
@Module({
  imports: [RepositoriesModule],
  controllers: [AdminController],
  providers: [
    AdminGuard,
    AdminUsersService,
    AdminOverviewService,
    AdminInviteCodesService,
    AuthAuditService,
  ],
  exports: [AdminGuard, AdminUsersService],
})
export class AdminModule {}
