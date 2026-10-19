import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OAuth2Client,
  type Credentials,
} from 'google-auth-library';
import { GOOGLE_CALENDAR_SCOPE, ProviderTokens } from './calendar.constants';

/**
 * Google Calendar OAuth2 (authorization code + refresh).
 *
 * Uses `google-auth-library` for the token flows; Calendar Data API
 * calls (T2/T3) go over plain REST with the access token.
 */
@Injectable()
export class GoogleCalendarProvider {
  private readonly logger = new Logger(GoogleCalendarProvider.name);

  constructor(private readonly configService: ConfigService) {}

  createClient(): OAuth2Client {
    const clientId = this.configService.get<string>(
      'GOOGLE_CALENDAR_CLIENT_ID',
    );
    const clientSecret = this.configService.get<string>(
      'GOOGLE_CALENDAR_CLIENT_SECRET',
    );
    const redirectUri = this.configService.get<string>(
      'GOOGLE_CALENDAR_REDIRECT_URI',
    );
    if (!clientId || !clientSecret || !redirectUri) {
      throw new BadRequestException(
        'Google Calendar OAuth is not configured (GOOGLE_CALENDAR_CLIENT_ID/SECRET/REDIRECT_URI)',
      );
    }
    return new OAuth2Client(clientId, clientSecret, redirectUri);
  }

  getAuthorizeUrl(state: string): string {
    return this.createClient().generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: GOOGLE_CALENDAR_SCOPE,
      state,
    });
  }

  async exchangeCode(
    code: string,
    client?: Pick<OAuth2Client, 'getToken'>,
  ): Promise<ProviderTokens> {
    const oauth2 = client ?? this.createClient();
    try {
      const { tokens } = await oauth2.getToken(code);
      return this.toProviderTokens(tokens, undefined);
    } catch (error) {
      this.logger.warn(
        `Google code exchange failed: ${(error as Error).message}`,
      );
      throw new UnauthorizedException('Google rejected the authorization code');
    }
  }

  async refreshAccessToken(
    refreshToken: string,
    client?: Pick<OAuth2Client, 'setCredentials' | 'refreshAccessToken'>,
  ): Promise<ProviderTokens> {
    const oauth2 = client ?? this.createClient();
    try {
      oauth2.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await oauth2.refreshAccessToken();
      return this.toProviderTokens(credentials, refreshToken);
    } catch (error) {
      this.logger.warn(
        `Google token refresh failed: ${(error as Error).message}`,
      );
      throw new UnauthorizedException('Google rejected the refresh token');
    }
  }

  private toProviderTokens(
    tokens: Credentials,
    previousRefreshToken?: string,
  ): ProviderTokens {
    const accessToken = tokens.access_token;
    if (typeof accessToken !== 'string' || !accessToken) {
      throw new UnauthorizedException('Google issued no access token');
    }
    const refreshToken =
      typeof tokens.refresh_token === 'string' && tokens.refresh_token
        ? tokens.refresh_token
        : previousRefreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Google issued no refresh token');
    }
    const expiresAt =
      typeof tokens.expiry_date === 'number'
        ? new Date(tokens.expiry_date)
        : new Date(Date.now() + 3600_000);
    const scope =
      typeof tokens.scope === 'string' ? tokens.scope : GOOGLE_CALENDAR_SCOPE;
    return { accessToken, refreshToken, expiresAt, scope };
  }
}
