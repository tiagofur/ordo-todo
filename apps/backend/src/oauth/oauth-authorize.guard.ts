import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Optional-session guard for /oauth/authorize (GET hop and consent
 * POST). MCP connector flows (ChatGPT, Claude…) open the authorization
 * endpoint in a browser tab, where a raw 401 JSON body reads as a
 * broken connection. So this guard never fails: with a session it
 * attaches the user; without one it lets the request through and the
 * controller bounces the tab to the web consent screen, which runs the
 * login hop itself and comes back.
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
      // No valid session: continue without `request.user`.
      return true;
    }
  }
}
