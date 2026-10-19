import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WebClient } from '@slack/web-api';
import { PrismaService } from '../database/prisma.service';
import { V1TasksService } from '../v1/v1-tasks.service';
import { SLACK_CLIENT_FACTORY } from './slack-notifier.service';

type SlackClient = Pick<WebClient, 'chat'>;
type SlackClientFactory = (token: string) => SlackClient;

const defaultFactory: SlackClientFactory = (token) =>
  new WebClient(token) as unknown as SlackClient;

/**
 * Posts the daily briefing to subscribed Slack channels (S5).
 *
 * Runs hourly and delivers to mappings with `dailySummary: true`
 * whose `summaryHour` (UTC) matches the current hour. Content: open
 * tasks + recently completed, same data as the in-app daily summary.
 */
@Injectable()
export class SlackDigestService {
  private readonly logger = new Logger(SlackDigestService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly v1Tasks: V1TasksService,
    @Optional()
    @Inject(SLACK_CLIENT_FACTORY)
    private readonly clientFactory: SlackClientFactory = defaultFactory,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron(): Promise<void> {
    await this.runHourly(new Date());
  }

  async runHourly(now: Date): Promise<{ posted: number }> {
    const hour = now.getUTCHours();
    const integrations = await this.prisma.userIntegration.findMany({
      where: { provider: 'SLACK', isActive: true },
    });
    let posted = 0;
    for (const integration of integrations) {
      if (!integration.accessToken) continue;
      const teamId = (integration.settings as { teamId?: string } | null)
        ?.teamId;
      const mappings = await this.prisma.slackWorkspaceMap.findMany({
        where: {
          userId: integration.userId,
          teamId: teamId ?? '',
          dailySummary: true,
          channelId: { not: '' },
        },
      });
      for (const mapping of mappings) {
        if (mapping.summaryHour !== hour || !mapping.channelId) continue;
        try {
          await this.postBriefing(
            integration.accessToken,
            integration.userId,
            mapping.channelId,
          );
          posted += 1;
        } catch (error) {
          this.logger.warn(
            `Slack digest failed for user ${integration.userId}: ${(error as Error).message}`,
          );
        }
      }
    }
    return { posted };
  }

  private async postBriefing(
    token: string,
    userId: string,
    channelId: string,
  ): Promise<void> {
    const tasks = (await this.v1Tasks.list(userId, {})) as {
      id: string;
      title: string;
      status: string;
    }[];
    const open = tasks.filter((task) => task.status !== 'COMPLETED');
    const done = tasks.filter((task) => task.status === 'COMPLETED');
    const lines = [
      '*Good morning — your Ordo briefing*',
      '',
      `*Open (${open.length})*`,
      ...open.slice(0, 10).map((task) => `• ${task.title}`),
    ];
    if (done.length > 0) {
      lines.push('', `*Recently completed (${done.length})*`);
      lines.push(...done.slice(0, 5).map((task) => `• ~${task.title}~`));
    }
    if (open.length === 0) {
      lines.push('Nothing open — enjoy the calm.');
    }
    const client = this.clientFactory(token);
    await client.chat.postMessage({
      channel: channelId,
      text: lines.join('\n'),
      blocks: [
        {
          type: 'section',
          text: { type: 'mrkdwn', text: lines.join('\n') },
        },
      ],
    });
  }
}
