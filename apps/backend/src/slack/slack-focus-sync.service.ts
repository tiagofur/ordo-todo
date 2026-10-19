import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { WebClient } from '@slack/web-api';
import { PrismaService } from '../database/prisma.service';
import { SLACK_CLIENT_FACTORY } from './slack-notifier.service';

export const SLACK_FOCUS_SYNC = Symbol('SLACK_FOCUS_SYNC');

export interface SlackFocusSync {
  onFocusStart(userId: string, endsAt: Date, minutes: number): Promise<void>;
  onFocusEnd(userId: string): Promise<void>;
}

type SlackClient = Pick<WebClient, 'users' | 'dnd'>;
type SlackClientFactory = (token: string) => SlackClient;

const defaultFactory: SlackClientFactory = (token) =>
  new WebClient(token) as unknown as SlackClient;

/**
 * Syncs Ordo focus sessions to the Slack status (S4).
 *
 * Explicit opt-in per (user, team) via `focusSync` on the workspace
 * map; DND snooze is a second opt-in (`focusDnd`). Start sets
 * `:tomato: foco hasta HH:MM` (+ snooze); end clears both, restoring
 * whatever the user had before (Slack keeps no history — clearing is
 * the documented behavior).
 */
@Injectable()
export class SlackFocusSyncService implements SlackFocusSync {
  private readonly logger = new Logger(SlackFocusSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    @Inject(SLACK_CLIENT_FACTORY)
    private readonly clientFactory: SlackClientFactory = defaultFactory,
  ) {}

  async onFocusStart(
    userId: string,
    endsAt: Date,
    minutes: number,
  ): Promise<void> {
    const targets = await this.optedInTargets(userId);
    for (const target of targets) {
      const client = this.clientFactory(target.token);
      const time = endsAt.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      });
      try {
        await client.users.profile.set({
          profile: {
            status_text: `foco hasta ${time}`,
            status_emoji: ':tomato:',
            status_expiration: Math.floor(endsAt.getTime() / 1000),
          } as never,
        });
        if (target.dnd) {
          await client.dnd.setSnooze({ num_minutes: minutes } as never);
        }
      } catch (error) {
        this.logger.warn(
          `Slack focus start failed for user ${userId}: ${(error as Error).message}`,
        );
      }
    }
  }

  async onFocusEnd(userId: string): Promise<void> {
    const targets = await this.optedInTargets(userId);
    for (const target of targets) {
      const client = this.clientFactory(target.token);
      try {
        await client.users.profile.set({
          profile: { status_text: '', status_emoji: '' } as never,
        });
        if (target.dnd) {
          await client.dnd.endSnooze();
        }
      } catch (error) {
        this.logger.warn(
          `Slack focus end failed for user ${userId}: ${(error as Error).message}`,
        );
      }
    }
  }

  private async optedInTargets(
    userId: string,
  ): Promise<{ token: string; dnd: boolean }[]> {
    const integrations = await this.prisma.userIntegration.findMany({
      where: { userId, provider: 'SLACK', isActive: true },
    });
    const mappings = await this.prisma.slackWorkspaceMap.findMany({
      where: { userId },
    });
    const targets: { token: string; dnd: boolean }[] = [];
    for (const integration of integrations) {
      if (!integration.accessToken) continue;
      const teamId = (integration.settings as { teamId?: string } | null)
        ?.teamId;
      const mapping = mappings.find(
        (entry) => entry.teamId === teamId && entry.focusSync === true,
      );
      if (mapping) {
        targets.push({
          token: integration.accessToken,
          dnd: mapping.focusDnd === true,
        });
      }
    }
    return targets;
  }
}
