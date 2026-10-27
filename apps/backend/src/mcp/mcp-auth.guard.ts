import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OAuthGuard } from '../oauth/oauth.guard';
import { ApiTokenGuard } from '../api-tokens/api-token.guard';
import { MCP_SCOPES_KEY } from './mcp-scopes.decorator';
import { MCP_RESOURCE_SCOPES } from './mcp-metadata.service';

/**
 * Authentication + scope enforcement for the MCP endpoint.
 *
 * Accepts OAuth access tokens (via {@link OAuthGuard}) and personal
 * access tokens (via {@link ApiTokenGuard}), then enforces the scopes
 * declared with {@link RequireMcpScopes}. On insufficient scope it
 * throws 403 listing EVERY missing scope at once plus a
 * `WWW-Authenticate: scope="…"` header, so clients can step up in a
 * single round-trip instead of discovering scopes one by one.
 */
@Injectable()
export class McpAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly oAuthGuard: OAuthGuard,
    private readonly apiTokenGuard: ApiTokenGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const header: string | undefined =
      request.get?.('authorization') ?? request.headers?.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

    if (!token) {
      // RFC 9728 challenge: MCP clients start discovery from this header
      // when they don't probe the well-known path up front. The `scope`
      // attribute is what Claude requests on /authorize — keep it to the
      // scopes the MCP tools actually use (admin:webhooks is PAT-only).
      const host = request.get?.('host') ?? '';
      const proto = request.protocol ?? 'https';
      const response = http.getResponse();
      response.header?.(
        'WWW-Authenticate',
        `Bearer resource_metadata="${proto}://${host}/.well-known/oauth-protected-resource", scope="${MCP_RESOURCE_SCOPES.join(' ')}"`,
      );
      throw new UnauthorizedException('Missing bearer token');
    }

    if (token.startsWith('ordo_pat_')) {
      await this.apiTokenGuard.canActivate(context);
    } else {
      await this.oAuthGuard.canActivate(context);
    }

    const granted = this.grantedScopes(request);
    request.mcpScopes = granted;

    const required =
      this.reflector.getAllAndOverride<string[]>(MCP_SCOPES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    const missing = required.filter((scope) => !granted.includes(scope));
    if (missing.length > 0) {
      const response = http.getResponse();
      response.header?.(
        'WWW-Authenticate',
        `Bearer error="insufficient_scope", scope="${missing.join(' ')}"`,
      );
      throw new ForbiddenException({
        message: 'Insufficient scope',
        missingScopes: missing,
      });
    }

    return true;
  }

  private grantedScopes(request: {
    apiToken?: { scopes?: string[] };
    oauth?: { scopes?: string[] };
  }): string[] {
    if (request.apiToken?.scopes) {
      return request.apiToken.scopes;
    }
    if (request.oauth?.scopes) {
      return Array.isArray(request.oauth.scopes)
        ? request.oauth.scopes
        : String(request.oauth.scopes).split(' ').filter(Boolean);
    }
    return [];
  }
}
