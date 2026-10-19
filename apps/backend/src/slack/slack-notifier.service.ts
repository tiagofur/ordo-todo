import {
  Inject,
  Injectable,
  Logger,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebClient } from '@slack/web-api';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import type {
  SlackNotificationInput,
  SlackNotifier,
} from './slack-notifier.port';

export const SLACK_CLIENT_FACTORY = Symbol('SLACK_CLIENT_FACTORY');
export type SlackClientFactory = (token: string) => Pick<WebClient, 'chat'>;

/** Task notification types routed to Slack. Everything else stays in-app. */
const TASK_NOTIFICATION_TYPES = new Set([
  'TASK_DUE',
  'TASK_ASSIGNED',
  'TASK_MENTIONED',
  'TASK_UPDATED',
  'TASK_COMPLETED',
]);

/** Action buttons live 7 days; Slack shows expired ones as disabled. */
const ACTION_TTL_MS = 7 * 24 * 3600 * 1000;

const defaultFactory: SlackClientFactory = (token) =>
  new WebClient(token) as Pick<WebClient, 'chat'>;

/**
 * Routes task notifications to Slack DMs/channels (S2).
 *
 * Every message carries 3 action buttons (Complete, Postpone to
 * tomorrow, View) whose `value` is `taskId.timestamp.hmac` — signed
 * with the Slack signing secret and time-boxed, so callbacks can't
 * be forged or replayed after expiry.
 */
@Injectable()
export class SlackNotifierService implements SlackNotifier {
  private readonly logger = new Logger(SlackNotifierService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Optional()
    @Inject(SLACK_CLIENT_FACTORY)
    private readonly clientFactory: SlackClientFactory = defaultFactory,
  ) {}

  async notify(input: SlackNotificationInput): Promise<void> {
    if (!TASK_NOTIFICATION_TYPES.has(input.type) || !input.resourceId) {
      return;
    }
    const integrations = await this.prisma.userIntegration.findMany({
      where: { userId: input.userId, provider: 'SLACK', isActive: true },
    });
    if (integrations.length === 0) {
      return;
    }
    const mappings = await this.prisma.slackWorkspaceMap.findMany({
      where: { userId: input.userId },
    });
    for (const integration of integrations) {
      if (!integration.accessToken) continue;
      const teamMappings = mappings.filter(
        (mapping) =>
          (integration.settings as { teamId?: string } | null)?.teamId ===
          mapping.teamId,
      );
      const targets =
        teamMappings.length > 0
          ? teamMappings
          : [
              {
                slackUserId: null as string | null,
                channelId: null as string | null,
              },
            ];
      for (const target of targets) {
        const channel = target.channelId ?? target.slackUserId;
        if (!channel) continue;
        try {
          await this.postTaskMessage(
            integration.accessToken,
            channel,
            input as SlackNotificationInput & { resourceId: string },
          );
        } catch (error) {
          this.logger.warn(
            `Slack notify failed for user ${input.userId}: ${(error as Error).message}`,
          );
        }
      }
    }
  }

  async verifyAction(
    value: string,
    maxAgeMs: number = ACTION_TTL_MS,
  ): Promise<{ taskId: string; timestamp: number }> {
    const [taskId, timestamp, signature] = value.split('.');
    if (!taskId || !timestamp || !signature) {
      throw new UnauthorizedException('Invalid action value');
    }
    const secret = this.configService.get<string>('SLACK_SIGNING_SECRET');
    if (!secret) {
      throw new UnauthorizedException('Slack signing is not configured');
    }
    const expected = createHmac('sha256', secret)
      .update(`${taskId}.${timestamp}`)
      .digest('hex');
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Invalid action signature');
    }
    const ageMs = Date.now() - Number(timestamp);
    if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > maxAgeMs) {
      throw new UnauthorizedException('Action expired');
    }
    return { taskId, timestamp: Number(timestamp) };
  }

  private signAction(taskId: string): string {
    const secret = this.configService.get<string>('SLACK_SIGNING_SECRET');
    if (!secret) {
      throw new UnauthorizedException('Slack signing is not configured');
    }
    const timestamp = Date.now().toString();
    const signature = createHmac('sha256', secret)
      .update(`${taskId}.${timestamp}`)
      .digest('hex');
    return `${taskId}.${timestamp}.${signature}`;
  }

  private async postTaskMessage(
    token: string,
    channel: string,
    input: SlackNotificationInput & { resourceId: string },
  ): Promise<void> {
    const client = this.clientFactory(token);
    const value = this.signAction(input.resourceId);
    await client.chat.postMessage({
      channel,
      text: `${input.title}${input.message ? ` — ${input.message}` : ''}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${input.title}*\n${input.message ?? ''}`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              action_id: 'ordo_task_complete',
              text: { type: 'plain_text', text: 'Complete' },
              style: 'primary',
              value,
            },
            {
              type: 'button',
              action_id: 'ordo_task_postpone',
              text: { type: 'plain_text', text: 'Postpone to tomorrow' },
              value,
            },
            {
              type: 'button',
              action_id: 'ordo_task_view',
              text: { type: 'plain_text', text: 'View' },
              value,
            },
          ],
        },
      ],
    });
  }
}
