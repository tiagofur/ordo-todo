import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

/**
 * OAuth callback error filter.
 *
 * When the passport strategy throws during the callback (e.g. a new OAuth
 * user while REGISTRATION_MODE=invite-only → REGISTRATION_INVITE_ONLY), the
 * controller never runs and the browser would show a bare JSON error. This
 * filter turns that into a redirect back to where the flow started:
 *
 * - native shells (`state=desktop|mobile`) → `ordo://auth/callback?error=…`
 *   deep link, handled by the desktop/mobile OAuth listener;
 * - web (no state or anything else) → `${FRONTEND_URL}/login?error=…`, shown
 *   by the sign-in page.
 *
 * Only applied to the OAuth callbacks (`@UseFilters` on the controller
 * methods), so all other errors keep flowing to the global filter.
 */
@Catch()
export class OAuthCallbackExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(OAuthCallbackExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const body =
      exception instanceof HttpException ? exception.getResponse() : null;
    const code =
      typeof body === 'object' && body !== null
        ? (body as Record<string, unknown>).code
        : undefined;
    const errorParam =
      typeof code === 'string' && /^[A-Z0-9_]+$/.test(code)
        ? code.toLowerCase()
        : 'oauth_failed';

    this.logger.warn(
      `OAuth callback failed (status ${status}, error=${errorParam}): ` +
        `${exception instanceof Error ? exception.message : String(exception)}`,
    );

    const state = request?.query?.state;
    if (state === 'desktop' || state === 'mobile') {
      return httpAdapter.redirect(
        response,
        302,
        `ordo://auth/callback?error=${errorParam}`,
      );
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3100';
    return httpAdapter.redirect(
      response,
      302,
      `${frontendUrl}/login?error=${errorParam}`,
    );
  }
}
