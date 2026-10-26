import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';

/**
 * Session guard for GET /oauth/authorize with a browser-friendly
 * failure mode. MCP connector flows (ChatGPT, Claude…) open the
 * authorization endpoint in a browser tab; a raw 401 JSON body there
 * reads as a broken connection. Without a session we bounce the tab to
 * the web app login instead; after signing in the user retries the
 * connector and the approve flow completes.
 *
 * Extends passport's AuthGuard directly, NOT JwtAuthGuard: the route
 * carries @Public() (to bypass the global session guard), and
 * JwtAuthGuard.canActivate honors that marker and would skip
 * authentication entirely.
 */
@Injectable()
export class OAuthAuthorizeGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      return (await super.canActivate(context)) as boolean;
    } catch {
      const http = context.switchToHttp();
      const req = http.getRequest<Request>();
      const res = http.getResponse<Response>();
      const frontend = process.env.FRONTEND_URL || 'http://localhost:3100';
      res.redirect(
        302,
        `${frontend}/login?next=${encodeURIComponent(req.originalUrl)}`,
      );
      // Response is committed; the handler sees no user and returns.
      return true;
    }
  }
}
