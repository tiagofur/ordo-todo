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
import { oAuthDelegates } from './oauth.delegate';
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
    metadataUrl: string,
    metadata: RegisterOAuthClientDto,
  ): Promise<RegisteredOAuthClient> {
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

    const created = await oAuthDelegates(this.prisma).oAuthClient.create({
      data: {
        clientId: origin,
        clientName: metadata.client_name,
        metadataUrl,
        redirectUris: metadata.redirect_uris,
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
      },
    });

    return {
      client_id: created.clientId,
      client_name: created.clientName,
      redirect_uris: created.redirectUris,
      scope: created.scopes.join(' '),
    };
  }

  async authorize(params: AuthorizeParams): Promise<{ redirectUri: string }> {
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
      !(OAUTH_CODE_CHALLENGE_METHODS as readonly string[]).includes(
        params.codeChallengeMethod,
      )
    ) {
      throw new BadRequestException(
        'Only S256 code_challenge_method is supported',
      );
    }

    const requestedScopes = (params.scope ?? '')
      .split(' ')
      .map((scope) => scope.trim())
      .filter(Boolean);
    const outOfScope = requestedScopes.filter(
      (scope) => !client.scopes.includes(scope),
    );
    if (outOfScope.length > 0) {
      throw new BadRequestException(
        `Scopes not granted to client: ${outOfScope.join(', ')}`,
      );
    }

    const code = randomBytes(32).toString('base64url');
    await oAuthDelegates(this.prisma).oAuthAuthorizationCode.create({
      data: {
        code,
        userId: params.userId,
        clientId: client.clientId,
        redirectUri: params.redirectUri,
        scopes: requestedScopes,
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
    if (!rawToken.startsWith(OAUTH_REFRESH_TOKEN_PREFIX)) {
      await delegates.oAuthRefreshToken.deleteMany({ where: { clientId } });
      return;
    }

    const candidate = await this.findRefreshTokenCandidates(clientId, rawToken);
    if (candidate) {
      await delegates.oAuthRefreshToken.delete({ where: { id: candidate.id } });
      this.logger.log(`OAuth refresh token revoked (client ${clientId})`);
      return;
    }

    await delegates.oAuthRefreshToken.deleteMany({ where: { clientId } });
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

    const delegates = oAuthDelegates(this.prisma) as unknown as {
      oAuthRefreshToken: {
        findMany(args: {
          where: { clientId: string; tokenPrefix: string };
        }): Promise<
          {
            id: string;
            userId: string;
            clientId: string;
            tokenHash: string;
            scopes: string[];
            expiresAt: Date;
          }[]
        >;
      };
    };

    const candidates = await delegates.oAuthRefreshToken.findMany({
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
