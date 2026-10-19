import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CALENDAR_FETCH,
  CALENDAR_REQUEST_TIMEOUT_MS,
  MICROSOFT_AUTH_URL,
  MICROSOFT_SCOPES,
  MICROSOFT_TOKEN_URL,
} from './calendar.constants';
import type {
  CalendarFetch,
  ProviderTokens,
} from './calendar.constants';

const defaultFetch: CalendarFetch = async (url, init) => {
  const response = await fetch(url, init);
  return {
    ok: response.ok,
    status: response.status,
    json: () => response.json() as Promise<unknown>,
    text: () => response.text(),
  };
};

/**
 * Outlook/Microsoft Graph Calendar OAuth2 (authorization code + refresh).
 *
 * Plain REST over fetch — no Microsoft SDK. Token endpoint uses
 * form-encoded requests per RFC 6749.
 */
@Injectable()
export class OutlookCalendarProvider {
  private readonly logger = new Logger(OutlookCalendarProvider.name);

  constructor(
    private readonly configService: ConfigService,
    @Optional()
    @Inject(CALENDAR_FETCH)
    private readonly doFetch: CalendarFetch = defaultFetch,
  ) {}

  private credentials(): {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  } {
    const clientId = this.configService.get<string>('MICROSOFT_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'MICROSOFT_CLIENT_SECRET',
    );
    const redirectUri = this.configService.get<string>(
      'MICROSOFT_REDIRECT_URI',
    );
    if (!clientId || !clientSecret || !redirectUri) {
      throw new BadRequestException(
        'Microsoft Calendar OAuth is not configured (MICROSOFT_CLIENT_ID/SECRET/REDIRECT_URI)',
      );
    }
    return { clientId, clientSecret, redirectUri };
  }

  getAuthorizeUrl(state: string): string {
    const { clientId, redirectUri } = this.credentials();
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      response_mode: 'query',
      scope: MICROSOFT_SCOPES,
      state,
    });
    return `${MICROSOFT_AUTH_URL}?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<ProviderTokens> {
    const { clientId, clientSecret, redirectUri } = this.credentials();
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    });
    return this.tokenRequest(body, undefined, 'authorization code');
  }

  async refreshAccessToken(refreshToken: string): Promise<ProviderTokens> {
    const { clientId, clientSecret } = this.credentials();
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
    return this.tokenRequest(body, refreshToken, 'refresh token');
  }

  private async tokenRequest(
    body: URLSearchParams,
    previousRefreshToken: string | undefined,
    what: string,
  ): Promise<ProviderTokens> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      CALENDAR_REQUEST_TIMEOUT_MS,
    );
    try {
      const response = await this.doFetch(MICROSOFT_TOKEN_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: controller.signal,
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        this.logger.warn(
          `Microsoft token endpoint rejected ${what}: ${response.status} ${text.slice(0, 200)}`,
        );
        throw new UnauthorizedException(`Microsoft rejected the ${what}`);
      }
      const tokens = (await response.json()) as Record<string, unknown>;
      return this.toProviderTokens(tokens, previousRefreshToken);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.warn(
        `Microsoft token request failed: ${(error as Error).message}`,
      );
      throw new UnauthorizedException(`Microsoft token request failed`);
    } finally {
      clearTimeout(timeout);
    }
  }

  private toProviderTokens(
    tokens: Record<string, unknown>,
    previousRefreshToken?: string,
  ): ProviderTokens {
    const accessToken = tokens.access_token;
    if (typeof accessToken !== 'string' || !accessToken) {
      throw new UnauthorizedException('Microsoft issued no access token');
    }
    const refreshToken =
      typeof tokens.refresh_token === 'string' && tokens.refresh_token
        ? tokens.refresh_token
        : previousRefreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Microsoft issued no refresh token');
    }
    const expiresIn =
      typeof tokens.expires_in === 'number' ? tokens.expires_in : 3600;
    const scope =
      typeof tokens.scope === 'string' ? tokens.scope : MICROSOFT_SCOPES;
    return {
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      scope,
    };
  }
}
