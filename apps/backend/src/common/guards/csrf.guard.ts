import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CsrfService } from '../../auth/csrf.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Enforces the CSRF tokens issued by `CsrfService` (`GET /auth/csrf-token`).
 *
 * The check applies only where CSRF is a real threat: state-changing HTTP
 * requests authenticated by ambient credentials (cookies). Requests that
 * carry an explicit `Authorization` header (Bearer PAT/OAuth/token, used by
 * mobile, extension, MCP and e2e) are not ambient-authenticated, so CSRF
 * does not apply to them. `@Public` routes, safe methods and the `/auth/*`
 * flows (which cannot present a token yet) are skipped.
 *
 * The web client already attaches `x-csrf-token` to every non-/auth
 * mutation (apps/web/src/lib/api-client.ts), so this closes the loop.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly csrfService: CsrfService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    if (!request || SAFE_METHODS.has(request.method)) {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const authorization: string | undefined =
      request.headers?.authorization ?? request.headers?.Authorization;
    if (typeof authorization === 'string' && authorization.length > 0) {
      return true;
    }

    const url: string = request.url ?? request.route?.path ?? '';
    if (url.startsWith('/auth/') || url === '/auth') {
      return true;
    }

    const token: unknown = request.headers?.['x-csrf-token'];
    if (typeof token !== 'string' || !this.csrfService.validateToken(token)) {
      throw new ForbiddenException({
        statusCode: 403,
        code: 'CSRF_TOKEN_INVALID',
        message: 'Missing or invalid CSRF token',
      });
    }

    return true;
  }
}
