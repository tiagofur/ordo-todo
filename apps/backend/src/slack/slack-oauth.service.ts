import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import {
  SLACK_BOT_SCOPES,
  SLACK_OAUTH_AUTHORIZE_URL,
  SLACK_OAUTH_TOKEN_URL,
  SLACK_REQUEST_TIMEOUT_MS,
} from './slack.constants';

export interface SlackInstallResult {
  teamId: string;
  teamName: string | null;
  slackUserId: string | null;
}

interface FetchLike {
  (
    url: string,
    init: {
      method: string;
      headers: Record<string, string>;
      body?: string;
      signal?: AbortSignal;
    },
  ): Promise<{
    ok: boolean;
    status: number;
    json(): Promise<unknown>;
    text(): Promise<string>;
  }>;
}

const defaultFetch: FetchLike = async (url, init) => {
  const response = await fetch(url, init);
  return {
    ok: response.ok,
    status: response.status,
    json: () => response.json() as Promise<unknown>,
    text: () => response.text(),
  };
};

/**
 * Slack app installation lifecycle (S1+S6).
 *
 * OAuth v2 code exchange → bot token stored in `UserIntegration`
 * (provider SLACK) + team/user row in `SlackWorkspaceMap`.
 * Uninstall (user action or `app_uninstalled` event) removes every
 * trace: mappings first, then the grant.
 */
@Injectable()
export class SlackOAuthService {
  private readonly logger = new Logger(SlackOAuthService.name);
  private doFetch: FetchLike = defaultFetch;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private credentials(): {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  } {
    const clientId = this.configService.get<string>('SLACK_CLIENT_ID');
    const clientSecret = this.configService.get<string>('SLACK_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('SLACK_REDIRECT_URI');
    if (!clientId || !clientSecret || !redirectUri) {
      throw new BadRequestException(
        'Slack OAuth is not configured (SLACK_CLIENT_ID/SECRET/REDIRECT_URI)',
      );
    }
    return { clientId, clientSecret, redirectUri };
  }

  getInstallUrl(state: string): string {
    const { clientId, redirectUri } = this.credentials();
    const params = new URLSearchParams({
      client_id: clientId,
      scope: SLACK_BOT_SCOPES,
      redirect_uri: redirectUri,
      state,
    });
    return `${SLACK_OAUTH_AUTHORIZE_URL}?${params.toString()}`;
  }

  async finishInstall(
    email: string,
    code: string,
  ): Promise<SlackInstallResult> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { clientId, clientSecret, redirectUri } = this.credentials();
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    });
    const payload = await this.postForm(SLACK_OAUTH_TOKEN_URL, body);
    if (!payload.ok) {
      this.logger.warn(`Slack OAuth exchange failed: ${payload.error}`);
      throw new BadRequestException('Slack rejected the authorization code');
    }

    const team = payload.team as { id: string; name?: string };
    const authedUser = payload.authed_user as { id?: string } | undefined;
    await this.prisma.userIntegration.upsert({
      where: { userId_provider: { userId: user.id, provider: 'SLACK' } },
      update: {
        isActive: true,
        accessToken: payload.access_token as string,
        scope: payload.scope as string,
        providerUserId: authedUser?.id,
        settings: { teamId: team.id, teamName: team.name },
        lastSyncAt: new Date(),
      },
      create: {
        userId: user.id,
        provider: 'SLACK',
        isActive: true,
        accessToken: payload.access_token as string,
        scope: payload.scope as string,
        providerUserId: authedUser?.id,
        settings: { teamId: team.id, teamName: team.name },
        lastSyncAt: new Date(),
      },
    });
    await this.prisma.slackWorkspaceMap.upsert({
      where: {
        userId_teamId_channelId_projectId: {
          userId: user.id,
          teamId: team.id,
          channelId: '',
          projectId: '',
        },
      },
      update: { teamName: team.name, slackUserId: authedUser?.id },
      create: {
        userId: user.id,
        teamId: team.id,
        teamName: team.name,
        slackUserId: authedUser?.id,
        channelId: '',
        projectId: '',
      },
    });

    this.logger.log(`Slack installed: team ${team.id} for user ${user.id}`);
    return {
      teamId: team.id,
      teamName: team.name ?? null,
      slackUserId: authedUser?.id ?? null,
    };
  }

  async uninstall(email: string, teamId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.slackWorkspaceMap.deleteMany({
      where: { userId: user.id, teamId },
    });
    await this.prisma.userIntegration.deleteMany({
      where: { userId: user.id, provider: 'SLACK' },
    });
    this.logger.log(`Slack uninstalled: team ${teamId} for user ${user.id}`);
  }

  async handleAppUninstalled(teamId: string): Promise<void> {
    await this.prisma.slackWorkspaceMap.deleteMany({ where: { teamId } });
    this.logger.log(`Slack app_uninstalled: cleaned team ${teamId}`);
  }

  async listTeams(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.slackWorkspaceMap.findMany({
      where: { userId: user.id },
      orderBy: { teamName: 'asc' },
    });
  }

  async updateMapping(
    email: string,
    id: string,
    data: {
      channelId?: string | null;
      projectId?: string | null;
      dailySummary?: boolean;
      summaryHour?: number | null;
      focusSync?: boolean;
      focusDnd?: boolean;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const mapping = await this.prisma.slackWorkspaceMap.findFirst({
      where: { id, userId: user.id },
    });
    if (!mapping) {
      throw new NotFoundException('Slack mapping not found');
    }
    return this.prisma.slackWorkspaceMap.update({
      where: { id },
      data: {
        ...(data.channelId !== undefined ? { channelId: data.channelId } : {}),
        ...(data.projectId !== undefined ? { projectId: data.projectId } : {}),
        ...(data.dailySummary !== undefined
          ? { dailySummary: data.dailySummary }
          : {}),
        ...(data.summaryHour !== undefined
          ? { summaryHour: data.summaryHour }
          : {}),
        ...(data.focusSync !== undefined ? { focusSync: data.focusSync } : {}),
        ...(data.focusDnd !== undefined ? { focusDnd: data.focusDnd } : {}),
      },
    });
  }

  private async postForm(
    url: string,
    body: URLSearchParams,
  ): Promise<Record<string, unknown> & { ok: boolean; error?: string }> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      SLACK_REQUEST_TIMEOUT_MS,
    );
    try {
      const response = await this.doFetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new BadRequestException(
          `Slack token endpoint failed with status ${response.status}`,
        );
      }
      return (await response.json()) as Record<string, unknown> & {
        ok: boolean;
        error?: string;
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
