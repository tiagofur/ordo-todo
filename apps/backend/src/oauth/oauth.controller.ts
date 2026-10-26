import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import {
  OAuthService,
  type AuthorizeRequestParams,
  type ValidatedAuthorizeRequest,
} from './oauth.service';
import { OAuthGuard } from './oauth.guard';
import { OAuthAuthorizeGuard } from './oauth-authorize.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { OAuthRevokeDto } from './dto/oauth-revoke.dto';

/**
 * Authorize-request params forwarded verbatim to the web consent screen
 * and posted back with the decision. Anything else on the query (e.g.
 * RFC 8707 `resource`) is dropped so the hop never reflects junk.
 */
const AUTHORIZE_FORWARD_PARAMS = [
  'client_id',
  'redirect_uri',
  'scope',
  'state',
  'code_challenge',
  'code_challenge_method',
] as const;

@ApiTags('OAuth')
@Controller('oauth')
export class OAuthController {
  private readonly logger = new Logger(OAuthController.name);

  constructor(private readonly oauthService: OAuthService) {}

  private asString(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private asStringOrUndefined(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
  }

  private frontendUrl(): string {
    return process.env.FRONTEND_URL || 'http://localhost:3100';
  }

  private authorizeParamsFrom(
    source: Record<string, unknown>,
  ): AuthorizeRequestParams {
    return {
      clientId: this.asString(source.client_id),
      redirectUri: this.asString(source.redirect_uri),
      scope: this.asString(source.scope),
      state: this.asString(source.state),
      codeChallenge: this.asString(source.code_challenge),
      codeChallengeMethod: this.asString(source.code_challenge_method),
    };
  }

  /**
   * Web consent screen URL carrying the authorize request. The screen
   * runs the login hop when needed, shows what the client asks for and
   * posts the decision back to POST /oauth/authorize.
   */
  private connectUrl(
    source: Record<string, unknown>,
    extra?: Record<string, string>,
  ): string {
    const url = new URL('/connect/authorize', this.frontendUrl());
    for (const key of AUTHORIZE_FORWARD_PARAMS) {
      const value = this.asString(source[key]);
      if (value) url.searchParams.set(key, value);
    }
    for (const [key, value] of Object.entries(extra ?? {})) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  }

  /**
   * Consent-CSRF defense on top of SameSite=Lax: a decision may only be
   * posted from one of our own web origins. Browsers always send Origin
   * on form POSTs; Referer is the fallback. Requests with neither header
   * are non-browser and cannot ride the session cookie anyway.
   *
   * The allowlist covers FRONTEND_URL plus its www/apex twin — deploys
   * disagree on the canonical host and a 301 between them must not
   * break the consent POST — and the CORS_ORIGINS list.
   */
  private trustedOrigins(): Set<string> {
    const origins = new Set<string>();
    const add = (raw: string | undefined) => {
      if (!raw) return;
      try {
        origins.add(new URL(raw).origin);
      } catch {
        // Not a URL (e.g. "exp://" style schemes): ignore.
      }
    };
    const frontend = this.frontendUrl();
    add(frontend);
    try {
      const { protocol, hostname } = new URL(frontend);
      add(
        hostname.startsWith('www.')
          ? `${protocol}//${hostname.slice(4)}`
          : `${protocol}//www.${hostname}`,
      );
    } catch {
      // frontendUrl() already parsed; unreachable in practice.
    }
    for (const raw of (process.env.CORS_ORIGINS ?? '').split(',')) {
      add(raw.trim());
    }
    return origins;
  }

  private isTrustedOrigin(req: Request): boolean {
    const trusted = this.trustedOrigins();
    const matches = (header: string) => {
      try {
        return trusted.has(new URL(header).origin);
      } catch {
        return false;
      }
    };
    const origin = req.get('origin');
    if (origin) return matches(origin);
    const referer = req.get('referer');
    if (referer) return matches(referer);
    return true;
  }

  @Public()
  @Get('.well-known/oauth-authorization-server')
  @ApiOperation({ summary: 'OAuth authorization server metadata (RFC 8414)' })
  metadata(@Req() req: Request) {
    const host = req.get('host');
    return this.oauthService.getAuthorizationServerMetadata(
      `${req.protocol}://${host}`,
    );
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Register an OAuth client (RFC 7591 DCR or Client ID Metadata Document)',
  })
  register(@Body() raw: Record<string, unknown>) {
    // Read straight off the body: third-party clients post extra RFC 7591
    // fields, and class-based validation here would reject the flow over
    // properties this endpoint never needs.
    const uris = Array.isArray(raw?.redirect_uris) ? raw.redirect_uris : [];
    return this.oauthService.registerClient(
      this.asStringOrUndefined(raw?.metadataUrl),
      {
        client_name: this.asString(raw?.client_name),
        redirect_uris: uris.filter(
          (uri): uri is string => typeof uri === 'string',
        ),
        scope: this.asStringOrUndefined(raw?.scope),
        client_uri: this.asStringOrUndefined(raw?.client_uri),
      },
    );
  }

  @Public()
  @UseGuards(OAuthAuthorizeGuard)
  @ApiBearerAuth()
  @Get('authorize')
  @ApiOperation({
    summary:
      'Authorization endpoint: validates the request, then hops to the web consent screen (or reconnects seamlessly)',
  })
  async authorize(
    @CurrentUser() user: RequestUser | undefined,
    @Query() query: Record<string, unknown>,
    @Res() res: Response,
  ): Promise<void> {
    const params = this.authorizeParamsFrom(query);
    let validated: ValidatedAuthorizeRequest;
    try {
      validated = await this.oauthService.validateAuthorizeRequest(params);
    } catch (error) {
      // Never redirect to an unvalidated redirect_uri: the error lands
      // on our own screen and the user closes the tab.
      this.logger.warn(
        `Rejected authorize request for client "${params.clientId}": ${
          (error as Error).message
        }`,
      );
      res.redirect(this.connectUrl(query, { ordo_error: 'invalid_request' }));
      return;
    }

    // Reconnect: the client already holds a live grant covering
    // everything it asks for, so consent would only be a formality.
    // Mint and go straight back. A broader ask falls through to the
    // consent screen (no silent scope upgrades).
    if (user) {
      const liveScopes = await this.oauthService.findLiveGrantScopes(
        user.id,
        validated.client.clientId,
      );
      const fitsLiveGrant =
        liveScopes !== null &&
        validated.grantedScopes.every((scope) => liveScopes.includes(scope));
      if (fitsLiveGrant) {
        const { redirectUri } = await this.oauthService.authorize({
          userId: user.id,
          ...params,
        });
        res.redirect(redirectUri);
        return;
      }
    }

    // First connection (or no session): the web consent screen takes
    // over — it signs the user in if needed and posts the decision back.
    res.redirect(this.connectUrl(query));
  }

  @Public()
  @UseGuards(OAuthAuthorizeGuard)
  @ApiBearerAuth()
  @Post('authorize')
  @ApiOperation({
    summary:
      'Consent decision from the web screen: approve mints a code, deny returns access_denied (RFC 6749 §4.1.2.1)',
  })
  async authorizeDecision(
    @CurrentUser() user: RequestUser | undefined,
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    if (!this.isTrustedOrigin(req)) {
      throw new ForbiddenException('Untrusted origin for consent decision');
    }

    const params = this.authorizeParamsFrom(body);
    try {
      await this.oauthService.validateAuthorizeRequest(params);
    } catch (error) {
      this.logger.warn(
        `Rejected consent decision for client "${params.clientId}": ${
          (error as Error).message
        }`,
      );
      res.redirect(this.connectUrl(body, { ordo_error: 'invalid_request' }));
      return;
    }

    if (!user) {
      // Session ended while the screen was open: back to it, the login
      // hop runs again and the decision can be re-posted.
      res.redirect(this.connectUrl(body));
      return;
    }

    const decision = this.asString(body.decision);
    if (decision === 'deny') {
      res.redirect(
        this.oauthService.buildDeniedRedirect(params.redirectUri, params.state),
      );
      return;
    }
    if (decision !== 'approve') {
      res.redirect(this.connectUrl(body, { ordo_error: 'invalid_request' }));
      return;
    }

    const { redirectUri } = await this.oauthService.authorize({
      userId: user.id,
      ...params,
    });
    res.redirect(redirectUri);
  }

  @Public()
  @Get('authorize/client')
  @ApiOperation({
    summary:
      'Public client facts for the consent screen (name + scopes a grant would carry)',
  })
  async authorizeClient(
    @Query('client_id') clientId: string | undefined,
    @Query('scope') scope: string | undefined,
  ) {
    const client = await this.oauthService.getClientInfo(
      this.asString(clientId),
      this.asStringOrUndefined(scope),
    );
    if (!client) {
      throw new NotFoundException('Unknown OAuth client');
    }
    return client;
  }

  @ApiBearerAuth()
  @Get('connections')
  @ApiOperation({
    summary: 'Apps connected to the current user via OAuth (active grants)',
  })
  connections(@CurrentUser() user: RequestUser) {
    return this.oauthService.listConnections(user.id);
  }

  @ApiBearerAuth()
  @Delete('connections')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Disconnect an app: revokes every refresh token of that client',
  })
  disconnect(
    @CurrentUser() user: RequestUser,
    @Query('client_id') clientId: string | undefined,
  ) {
    const id = this.asString(clientId);
    if (!id) {
      throw new BadRequestException('client_id is required');
    }
    return this.oauthService.disconnectClient(user.id, id);
  }

  @Public()
  @Post('token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange code or refresh token (RFC 6749)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Token response.' })
  token(@Body() raw: Record<string, unknown>) {
    const str = (key: string) => this.asString(raw?.[key]);
    const grantType = str('grant_type');

    if (grantType === 'authorization_code') {
      const code = str('code');
      const clientId = str('client_id');
      const redirectUri = str('redirect_uri');
      const codeVerifier = str('code_verifier');
      if (!code || !clientId || !redirectUri || !codeVerifier) {
        throw new BadRequestException('invalid_request');
      }
      return this.oauthService.exchangeCode({
        code,
        clientId,
        redirectUri,
        codeVerifier,
      });
    }

    if (grantType === 'refresh_token') {
      const refreshToken = str('refresh_token');
      const clientId = str('client_id');
      if (!refreshToken || !clientId) {
        throw new BadRequestException('invalid_request');
      }
      return this.oauthService.refresh(clientId, refreshToken);
    }

    throw new BadRequestException('unsupported_grant_type');
  }

  @Public()
  @Post('revoke')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke an OAuth refresh token (RFC 7009)' })
  revoke(@Body() dto: OAuthRevokeDto): Promise<void> {
    return this.oauthService.revoke(dto.client_id ?? '', dto.token);
  }

  @UseGuards(OAuthGuard)
  @ApiBearerAuth()
  @Get('userinfo')
  @ApiOperation({ summary: 'OpenID-style userinfo for the access token' })
  userinfo(@CurrentUser() user: RequestUser) {
    return { sub: user.id, email: user.email, name: user.name };
  }
}
