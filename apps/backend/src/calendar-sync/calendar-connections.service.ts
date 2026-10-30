import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { GoogleCalendarProvider } from './google-calendar.provider';
import { OutlookCalendarProvider } from './outlook-calendar.provider';
import { TOKEN_REFRESH_SKEW_MS } from './calendar.constants';

export type SupportedCalendarProvider =
  | 'GOOGLE_CALENDAR'
  | 'MICROSOFT_CALENDAR';

const PROVIDER_LABELS: Record<SupportedCalendarProvider, string> = {
  GOOGLE_CALENDAR: 'Google',
  MICROSOFT_CALENDAR: 'Microsoft',
};

export interface CalendarConnectionSummary {
  id: string;
  provider: string;
  isActive: boolean;
  providerEmail: string | null;
  lastSyncAt: Date | null;
}

/**
 * Owns the calendar OAuth lifecycle: connect (authorize URL + code
 * exchange), silent refresh with skew, re-auth flagging when the
 * grant dies, and disconnect. Replaces the `connectIntegration` stub
 * in `UsersService` for the two calendar providers.
 */
@Injectable()
export class CalendarConnectionsService {
  private readonly logger = new Logger(CalendarConnectionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly google: GoogleCalendarProvider,
    private readonly outlook: OutlookCalendarProvider,
    private readonly jwtService: JwtService,
  ) {}

  private providerFor(provider: string) {
    if (provider === 'GOOGLE_CALENDAR') return this.google;
    if (provider === 'MICROSOFT_CALENDAR') return this.outlook;
    throw new BadRequestException(
      `Calendar sync supports GOOGLE_CALENDAR and MICROSOFT_CALENDAR, got: ${provider}`,
    );
  }

  async startConnect(
    email: string,
    provider: string,
  ): Promise<{ authorizeUrl: string; state: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const state = this.createConnectState(user.id);
    return {
      authorizeUrl: this.providerFor(provider).getAuthorizeUrl(state),
      state,
    };
  }

  /**
   * JD-003: the OAuth state is a signed, short-lived JWT binding the
   * callback to the authenticated initiator — the account can no longer
   * be chosen from the query string.
   */
  createConnectState(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, tokenType: 'calendar_oauth_state' },
      { expiresIn: '10m' },
    );
  }

  /** Verifies the signed state and returns the bound user id (or 401). */
  verifyConnectState(state: string): string {
    let payload: { sub?: string; tokenType?: string };
    try {
      payload = this.jwtService.verify<{ sub?: string; tokenType?: string }>(
        state,
      );
    } catch {
      throw new UnauthorizedException('Invalid calendar OAuth state');
    }
    if (payload.tokenType !== 'calendar_oauth_state' || !payload.sub) {
      throw new UnauthorizedException('Invalid calendar OAuth state');
    }
    return payload.sub;
  }

  async finishConnect(
    userId: string,
    provider: SupportedCalendarProvider,
    code: string,
    providerEmail?: string,
  ): Promise<CalendarConnectionSummary> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const tokens = await this.providerFor(provider).exchangeCode(code);
    const integration = await this.prisma.userIntegration.upsert({
      where: { userId_provider: { userId: user.id, provider } },
      update: {
        isActive: true,
        providerEmail: providerEmail || user.email,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        scope: tokens.scope,
        settings: {},
        lastSyncAt: new Date(),
      },
      create: {
        userId: user.id,
        provider,
        isActive: true,
        providerEmail: providerEmail || user.email,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        scope: tokens.scope,
        settings: {},
        lastSyncAt: new Date(),
      },
    });

    this.logger.log(`Calendar connected: ${provider} for user ${user.id}`);
    return {
      id: integration.id,
      provider: integration.provider,
      isActive: true,
      providerEmail: integration.providerEmail,
      lastSyncAt: integration.lastSyncAt,
    };
  }

  /**
   * Returns a valid access token, refreshing silently when expired or
   * within the skew window. When the grant is dead (invalid_grant),
   * flags the integration for re-auth and throws a human message.
   */
  async getAccessToken(
    userId: string,
    provider: SupportedCalendarProvider,
  ): Promise<string> {
    const integration = await this.prisma.userIntegration.findUnique({
      where: { userId_provider: { userId, provider } },
    });
    if (!integration || !integration.isActive) {
      throw new NotFoundException(`${provider} is not connected`);
    }
    if (
      integration.expiresAt &&
      integration.expiresAt.getTime() - Date.now() > TOKEN_REFRESH_SKEW_MS &&
      integration.accessToken
    ) {
      return integration.accessToken;
    }
    if (!integration.refreshToken) {
      await this.flagReAuth(integration.id);
      throw new UnauthorizedException(this.reAuthMessage(provider));
    }
    try {
      const tokens = await this.providerFor(provider).refreshAccessToken(
        integration.refreshToken,
      );
      await this.prisma.userIntegration.upsert({
        where: { userId_provider: { userId, provider } },
        update: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          scope: tokens.scope ?? integration.scope,
          lastSyncAt: new Date(),
        },
        create: {
          userId,
          provider,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          scope: tokens.scope,
          settings: {},
        },
      });
      return tokens.accessToken;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        await this.flagReAuth(integration.id);
        throw new UnauthorizedException(this.reAuthMessage(provider));
      }
      throw error;
    }
  }

  async disconnect(email: string, provider: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.userIntegration.deleteMany({
      where: { userId: user.id, provider: provider as never },
    });
    this.logger.log(`Calendar disconnected: ${provider} for user ${user.id}`);
  }

  private reAuthMessage(provider: SupportedCalendarProvider): string {
    return `Reconnect your ${PROVIDER_LABELS[provider]} account to resume calendar sync`;
  }

  private async flagReAuth(integrationId: string): Promise<void> {
    await this.prisma.userIntegration.update({
      where: { id: integrationId },
      data: {
        isActive: false,
        settings: { status: 're-auth-required' },
      },
    });
  }
}
