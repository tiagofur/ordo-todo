import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import type { StringValue } from 'ms';
import { PrismaService } from '../database/prisma.service';
import { AuthAuditService } from '../auth/auth-audit.service';
import { AuthEventType } from '../auth/types/auth-event.types';
import { API_TOKEN_SCOPES } from '../api-tokens/api-token.constants';
import {
  oAuthDelegates,
  type OAuthClientRecord,
  type OAuthRefreshTokenRecord,
} from './oauth.delegate';
import {
  BCRYPT_ROUNDS,
  OAUTH_ACCESS_TOKEN_TTL,
  OAUTH_CODE_CHALLENGE_METHODS,
  OAUTH_CODE_TTL_MS,
  OAUTH_GRANT_TYPES,
  OAUTH_REFRESH_TOKEN_PREFIX,
  OAUTH_REFRESH_TOKEN_TTL_MS,
} from './oauth.constants';
import { RegisterOAuthClientDto } from './dto/register-oauth-client.dto';

export interface RegisteredOAuthClient {
  client_id: string;
  client_name: string;
  redirect_uris: string[];
  scope: string;
}

export interface AuthorizeParams {
  userId: string;
  clientId: string;
  redirectUri: string;
  scope?: string;
  state?: string;
  codeChallenge: string;
  codeChallengeMethod: string;
}

/** Authorize-request params as the client sends them (no user yet). */
export type AuthorizeRequestParams = Omit<AuthorizeParams, 'userId'>;

export interface ValidatedAuthorizeRequest {
  client: OAuthClientRecord;
  grantedScopes: string[];
}

export interface OAuthConnection {
  clientId: string;
  clientName: string;
  scopes: string[];
  connectedAt: Date;
  lastRefreshedAt: Date;
}

export interface ExchangeCodeParams {
  code: string;
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface AuthorizationServerMetadata {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  revocation_endpoint: string;
  registration_endpoint: string;
  scopes_supported: string[];
  response_types_supported: string[];
  grant_types_supported: string[];
  code_challenge_methods_supported: string[];
  token_endpoint_auth_methods_supported: string[];
}

/**
 * OAuth 2.1 Authorization Server.
 *
 * Authorization code flow with mandatory S256 PKCE, refresh token
 * rotation, and client registration via Client ID Metadata Documents
 * (dynamic registration endpoint kept for compatibility).
 * Reused by the MCP server (001) and calendar sync (010).
 */
@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Optional()
    @Inject(AuthAuditService)
    private readonly audit?: AuthAuditService,
  ) {}

  async registerClient(
    metadataUrl: string | undefined,
    metadata: RegisterOAuthClientDto,
  ): Promise<RegisteredOAuthClient> {
    const requestedScopes = (metadata.scope ?? '')
      .split(' ')
      .map((scope) => scope.trim())
      .filter(Boolean);
    const knownScopes = API_TOKEN_SCOPES as readonly string[];
    const unknown = requestedScopes.filter(
      (scope) => !knownScopes.includes(scope),
    );
    if (unknown.length > 0) {
      throw new BadRequestException(`Unknown scopes: ${unknown.join(', ')}`);
    }

    // Two registration flavors, same stored shape:
    // - Client ID Metadata Document: the caller hosts its own metadata
    //   document; client_id is that document's origin and redirect URIs
    //   must live there too. Re-registration is idempotent (the id is
    //   the origin, so it collides by design — and only same-origin
    //   redirect URIs ever make it in).
    // - RFC 7591 dynamic client registration (what ChatGPT/Claude send):
    //   no metadata URL, client_id is ALWAYS minted here and any https
    //   redirect URI is accepted (loopback http allowed for native
    //   clients). Deriving the id from client_uri would let anyone
    //   re-register a well-known origin and graft their own callback
    //   URLs onto an existing client (OAuth code phishing), so DCR ids
    //   are strictly per-registration.
    let clientId: string;
    let validatedUris: string[];
    if (metadataUrl) {
      let origin: string;
      try {
        origin = new URL(metadataUrl).origin;
      } catch {
        throw new BadRequestException('Invalid metadata URL');
      }

      for (const redirectUri of metadata.redirect_uris) {
        let parsed: URL;
        try {
          parsed = new URL(redirectUri);
        } catch {
          throw new BadRequestException(`Invalid redirect URI: ${redirectUri}`);
        }
        if (parsed.protocol !== 'https:' || parsed.origin !== origin) {
          throw new BadRequestException(
            `Redirect URI must be https on ${origin}: ${redirectUri}`,
          );
        }
      }

      clientId = origin;
      validatedUris = metadata.redirect_uris;
    } else {
      for (const redirectUri of metadata.redirect_uris) {
        const parsed = this.parseRedirectUri(redirectUri);
        if (
          parsed.protocol !== 'https:' &&
          !['127.0.0.1', '[::1]', 'localhost'].includes(parsed.hostname)
        ) {
          throw new BadRequestException(
            `Redirect URI must be https (or http on loopback): ${redirectUri}`,
          );
        }
      }

      clientId = `ordo_cl_${randomBytes(12).toString('base64url')}`;
      validatedUris = metadata.redirect_uris;
    }

    const delegates = oAuthDelegates(this.prisma);
    const existing = await delegates.oAuthClient.findUnique({
      where: { clientId },
    });
    if (existing) {
      // Strict idempotency (only CIMD collides by design): re-asserting
      // the same client returns it untouched. Anything that would ADD
      // redirect URIs or scopes is rejected — a re-registration can
      // never widen what an existing client_id is allowed to do.
      const urisAllowed = validatedUris.every((uri) =>
        existing.redirectUris.includes(uri),
      );
      const scopesAllowed = requestedScopes.every((scope) =>
        existing.scopes.includes(scope),
      );
      if (!urisAllowed || !scopesAllowed) {
        throw new BadRequestException('invalid_client_metadata');
      }
      this.logger.log(`OAuth client re-registered (idempotent): ${clientId}`);
      return {
        client_id: existing.clientId,
        client_name: existing.clientName,
        redirect_uris: existing.redirectUris,
        scope: existing.scopes.join(' '),
      };
    }

    const created = await delegates.oAuthClient.create({
      data: {
        clientId,
        clientName: metadata.client_name,
        metadataUrl,
        redirectUris: validatedUris,
        scopes: requestedScopes,
      },
    });

    this.logger.log(`OAuth client registered: ${created.clientId}`);
    await this.audit?.logEvent({
      type: AuthEventType.OAUTH_CLIENT_REGISTERED,
      timestamp: new Date(),
      metadata: {
        clientId: created.clientId,
        clientName: created.clientName,
        scopes: created.scopes,
        redirectUris: created.redirectUris,
      },
    });

    return {
      client_id: created.clientId,
      client_name: created.clientName,
      redirect_uris: created.redirectUris,
      scope: created.scopes.join(' '),
    };
  }

  private parseRedirectUri(raw: string): URL {
    try {
      return new URL(raw);
    } catch {
      throw new BadRequestException(`Invalid URL: ${raw}`);
    }
  }

  /**
   * Validates an authorize request (client, redirect_uri, PKCE, scopes)
   * WITHOUT issuing anything. Used by the controller to decide the hop:
   * invalid → consent error screen, valid → consent screen or seamless
   * reconnect for clients with an active grant.
   */
  async validateAuthorizeRequest(
    params: AuthorizeRequestParams,
  ): Promise<ValidatedAuthorizeRequest> {
    const client = await oAuthDelegates(this.prisma).oAuthClient.findUnique({
      where: { clientId: params.clientId },
    });
    if (!client) {
      throw new NotFoundException('Unknown OAuth client');
    }

    if (!client.redirectUris.includes(params.redirectUri)) {
      throw new BadRequestException('redirect_uri is not registered');
    }

    if (
      !params.codeChallenge ||
      params.codeChallenge.length < 43 ||
      !(OAUTH_CODE_CHALLENGE_METHODS as readonly string[]).includes(
        params.codeChallengeMethod,
      )
    ) {
      throw new BadRequestException(
        'code_challenge (S256, 43+ chars) is required',
      );
    }

    const grantedScopes = this.resolveGrantedScopes(client, params.scope);

    return { client, grantedScopes };
  }

  /**
   * Scopes a code would carry for this client and requested `scope`.
   * Shared by validation and by the consent screen's client-info call,
   * so what the user sees is exactly what gets granted.
   */
  private resolveGrantedScopes(
    client: OAuthClientRecord,
    scope: string | undefined,
  ): string[] {
    const requestedScopes = (scope ?? '')
      .split(' ')
      .map((item) => item.trim())
      .filter(Boolean);
    if (client.scopes.length > 0) {
      // Registered scopes are a hard ceiling (CIMD + internal clients):
      // asking outside them is a protocol error.
      const outOfScope = requestedScopes.filter(
        (item) => !client.scopes.includes(item),
      );
      if (outOfScope.length > 0) {
        throw new BadRequestException(
          `Scopes not granted to client: ${outOfScope.join(', ')}`,
        );
      }
      return requestedScopes.length > 0 ? requestedScopes : [...client.scopes];
    }
    // Open DCR clients (ChatGPT, Claude…): anything they ask for is
    // clamped to the known vocabulary, and no request defaults to
    // read-only. The consent screen shows (and the user approves)
    // exactly these scopes.
    const granted = requestedScopes.filter((item) =>
      (API_TOKEN_SCOPES as readonly string[]).includes(item),
    );
    return granted.length > 0 ? granted : ['read'];
  }

  /**
   * True when the user still holds an unexpired refresh token for this
   * client — a live connection. Used to skip the consent screen on
   * reconnect (the client already holds equivalent power; asking again
   * would only train users to click through).
   */
  async hasActiveGrant(userId: string, clientId: string): Promise<boolean> {
    const token = await oAuthDelegates(this.prisma).oAuthRefreshToken.findFirst(
      {
        where: { userId, clientId, expiresAt: { gt: new Date() } },
      },
    );
    return token !== null;
  }

  /** RFC 6749 §4.1.2.1: user denied — redirect back with access_denied. */
  buildDeniedRedirect(redirectUri: string, state?: string): string {
    const redirect = new URL(redirectUri);
    redirect.searchParams.set('error', 'access_denied');
    if (state) {
      redirect.searchParams.set('state', state);
    }
    return redirect.toString();
  }

  /**
   * Public client facts for the consent screen: display name plus the
   * scopes a grant for `scope` would carry (null when the request would
   * be rejected, so the screen can refuse to show a misleading list).
   */
  async getClientInfo(
    clientId: string,
    scope?: string,
  ): Promise<{
    clientId: string;
    clientName: string;
    grantedScopes: string[] | null;
  } | null> {
    const client = await oAuthDelegates(this.prisma).oAuthClient.findUnique({
      where: { clientId },
    });
    if (!client) return null;
    let grantedScopes: string[] | null;
    try {
      grantedScopes = this.resolveGrantedScopes(client, scope);
    } catch {
      grantedScopes = null;
    }
    return {
      clientId: client.clientId,
      clientName: client.clientName,
      grantedScopes,
    };
  }

  /** Active connections (apps) for the user, newest activity first. */
  async listConnections(userId: string): Promise<OAuthConnection[]> {
    const delegates = oAuthDelegates(this.prisma);
    const tokens = await delegates.oAuthRefreshToken.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
    });

    const byClient = new Map<string, OAuthRefreshTokenRecord[]>();
    for (const token of tokens) {
      const list = byClient.get(token.clientId) ?? [];
      list.push(token);
      byClient.set(token.clientId, list);
    }

    const connections: OAuthConnection[] = [];
    for (const [clientId, clientTokens] of byClient) {
      const client = await delegates.oAuthClient.findUnique({
        where: { clientId },
      });
      const scopes = [...new Set(clientTokens.flatMap((t) => t.scopes))];
      const created = clientTokens.map((t) => t.createdAt.getTime());
      connections.push({
        clientId,
        clientName: client?.clientName || clientId,
        scopes,
        connectedAt: new Date(Math.min(...created)),
        lastRefreshedAt: new Date(Math.max(...created)),
      });
    }

    return connections.sort(
      (a, b) => b.lastRefreshedAt.getTime() - a.lastRefreshedAt.getTime(),
    );
  }

  /** Disconnect an app: revoke every refresh token of that client. */
  async disconnectClient(
    userId: string,
    clientId: string,
  ): Promise<{ revoked: number }> {
    const delegates = oAuthDelegates(this.prisma);
    const { count } = await delegates.oAuthRefreshToken.deleteMany({
      where: { userId, clientId },
    });
    this.logger.log(
      `OAuth connection disconnected (user ${userId}, client ${clientId}, ${count} token(s))`,
    );
    await this.audit?.logEvent({
      type: AuthEventType.TOKEN_REVOKED,
      timestamp: new Date(),
      metadata: { clientId, revoked: count, via: 'connections' },
    });
    return { revoked: count };
  }

  async authorize(params: AuthorizeParams): Promise<{ redirectUri: string }> {
    const { client, grantedScopes } =
      await this.validateAuthorizeRequest(params);

    const code = randomBytes(32).toString('base64url');
    await oAuthDelegates(this.prisma).oAuthAuthorizationCode.create({
      data: {
        code,
        userId: params.userId,
        clientId: client.clientId,
        redirectUri: params.redirectUri,
        scopes: grantedScopes,
        codeChallenge: params.codeChallenge,
        codeChallengeMethod: params.codeChallengeMethod,
        expiresAt: new Date(Date.now() + OAUTH_CODE_TTL_MS),
      },
    });

    const redirect = new URL(params.redirectUri);
    redirect.searchParams.set('code', code);
    if (params.state) {
      redirect.searchParams.set('state', params.state);
    }

    return { redirectUri: redirect.toString() };
  }

  async exchangeCode(params: ExchangeCodeParams): Promise<OAuthTokenResponse> {
    const stored = await oAuthDelegates(
      this.prisma,
    ).oAuthAuthorizationCode.findUnique({ where: { code: params.code } });

    if (!stored) {
      throw new BadRequestException('Invalid authorization code');
    }
    if (stored.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('Authorization code expired');
    }
    if (
      stored.clientId !== params.clientId ||
      stored.redirectUri !== params.redirectUri
    ) {
      throw new BadRequestException('Client or redirect mismatch');
    }
    if (!this.verifyPkce(params.codeVerifier, stored.codeChallenge)) {
      throw new UnauthorizedException('PKCE verification failed');
    }

    await oAuthDelegates(this.prisma).oAuthAuthorizationCode.delete({
      where: { id: stored.id },
    });

    const scope = stored.scopes.join(' ');
    const accessToken = await this.issueAccessToken(
      stored.userId,
      stored.clientId,
      scope,
    );
    const refreshToken = await this.issueRefreshToken(
      stored.userId,
      stored.clientId,
      stored.scopes,
    );

    this.logger.log(
      `OAuth code exchanged for user ${stored.userId} (client ${stored.clientId})`,
    );
    await this.audit?.logEvent({
      type: AuthEventType.OAUTH_TOKEN_ISSUED,
      userId: stored.userId,
      timestamp: new Date(),
      metadata: { clientId: stored.clientId, scope: stored.scopes.join(' ') },
    });

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: refreshToken,
      scope,
    };
  }

  async refresh(
    clientId: string,
    rawRefreshToken: string,
  ): Promise<OAuthTokenResponse> {
    const candidates = await this.findRefreshTokenCandidates(
      clientId,
      rawRefreshToken,
    );
    if (!candidates) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await oAuthDelegates(this.prisma).oAuthRefreshToken.delete({
      where: { id: candidates.id },
    });

    const scope = candidates.scopes.join(' ');
    const accessToken = await this.issueAccessToken(
      candidates.userId,
      candidates.clientId,
      scope,
    );
    const refreshToken = await this.issueRefreshToken(
      candidates.userId,
      candidates.clientId,
      candidates.scopes,
    );

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: refreshToken,
      scope,
    };
  }

  async revoke(clientId: string, rawToken: string): Promise<void> {
    const delegates = oAuthDelegates(this.prisma);
    // RFC 7009: unknown or unsupported tokens are ignored silently.
    // They must never trigger a mass wipe — the endpoint is public and
    // deleteMany({clientId}) here would let anyone revoke every
    // session of any client with one bogus request.
    if (!rawToken.startsWith(OAUTH_REFRESH_TOKEN_PREFIX)) {
      return;
    }

    const candidate = await this.findRefreshTokenCandidates(clientId, rawToken);
    if (!candidate) {
      return;
    }
    await delegates.oAuthRefreshToken.delete({ where: { id: candidate.id } });
    this.logger.log(`OAuth refresh token revoked (client ${clientId})`);
  }

  getAuthorizationServerMetadata(issuer: string): AuthorizationServerMetadata {
    const base = issuer.replace(/\/$/, '');
    const apiPrefix = this.configService.get<string>('API_PREFIX') ?? 'api/v1';

    return {
      issuer: base,
      authorization_endpoint: `${base}/${apiPrefix}/oauth/authorize`,
      token_endpoint: `${base}/${apiPrefix}/oauth/token`,
      userinfo_endpoint: `${base}/${apiPrefix}/oauth/userinfo`,
      revocation_endpoint: `${base}/${apiPrefix}/oauth/revoke`,
      registration_endpoint: `${base}/${apiPrefix}/oauth/register`,
      scopes_supported: [...API_TOKEN_SCOPES],
      response_types_supported: ['code'],
      grant_types_supported: [...OAUTH_GRANT_TYPES],
      code_challenge_methods_supported: [...OAUTH_CODE_CHALLENGE_METHODS],
      token_endpoint_auth_methods_supported: ['none'],
    };
  }

  private async issueAccessToken(
    userId: string,
    clientId: string,
    scope: string,
  ): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: userId,
        client_id: clientId,
        scope,
        tokenType: 'oauth_access',
      },
      { expiresIn: OAUTH_ACCESS_TOKEN_TTL as StringValue },
    );
  }

  private async issueRefreshToken(
    userId: string,
    clientId: string,
    scopes: string[],
  ): Promise<string> {
    const token = `${OAUTH_REFRESH_TOKEN_PREFIX}${randomBytes(32).toString('base64url')}`;
    const tokenHash = await bcrypt.hash(token, BCRYPT_ROUNDS);

    await oAuthDelegates(this.prisma).oAuthRefreshToken.create({
      data: {
        tokenHash,
        tokenPrefix: token.slice(-8),
        userId,
        clientId,
        scopes,
        expiresAt: new Date(Date.now() + OAUTH_REFRESH_TOKEN_TTL_MS),
      },
    });

    return token;
  }

  private verifyPkce(verifier: string, challenge: string): boolean {
    const computed = createHash('sha256')
      .update(verifier)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const a = Buffer.from(computed);
    const b = Buffer.from(challenge);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  private async findRefreshTokenCandidates(clientId: string, rawToken: string) {
    if (
      !rawToken.startsWith(OAUTH_REFRESH_TOKEN_PREFIX) ||
      rawToken.length < OAUTH_REFRESH_TOKEN_PREFIX.length + 8
    ) {
      return null;
    }

    const candidates = await oAuthDelegates(
      this.prisma,
    ).oAuthRefreshToken.findMany({
      where: { clientId, tokenPrefix: rawToken.slice(-8) },
    });

    for (const candidate of candidates) {
      if (
        candidate.expiresAt.getTime() > Date.now() &&
        (await bcrypt.compare(rawToken, candidate.tokenHash))
      ) {
        return candidate;
      }
    }

    return null;
  }
}
