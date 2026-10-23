import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resolveAdminEmails } from '../common/utils/admin-emails';

/**
 * Platform-level admin gate (ODD 019 A5). Reusable guard for /admin
 * endpoints, mirroring the ADMIN_EMAILS / ADMIN_API_KEY precedent of
 * AuthSecurityController.assertAdminAccess. The global JwtAuthGuard runs
 * first, so `request.user` is always a verified JWT identity here.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const apiKey = this.configService.get<string>('ADMIN_API_KEY');
    if (apiKey && request.headers?.['x-admin-api-key'] === apiKey) {
      return true;
    }

    const adminEmails = resolveAdminEmails(this.configService);

    const email = request.user?.email?.toLowerCase();
    if (email && adminEmails.includes(email)) {
      return true;
    }

    throw new ForbiddenException({
      statusCode: 403,
      code: 'ADMIN_REQUIRED',
      message: 'This endpoint requires a platform admin',
    });
  }
}
