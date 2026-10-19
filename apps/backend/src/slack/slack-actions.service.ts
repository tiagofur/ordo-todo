import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { PrismaService } from '../database/prisma.service';
import { V1TasksService } from '../v1/v1-tasks.service';
import { AIService } from '../ai/ai.service';
import { SlackNotifierService } from './slack-notifier.service';

export interface BlockActionInput {
  actionId: string;
  value: string;
  teamId: string;
  slackUserId: string;
}

export interface MessageActionInput {
  teamId: string;
  slackUserId: string;
  channelId: string;
  messageText: string;
  messageTs: string;
  triggerId: string;
}

export interface SlashCommandInput {
  teamId: string;
  slackUserId: string;
  channelId: string;
  text: string;
}

/**
 * Handles Slack interactions (S3): Block Kit button callbacks, the
 * "Create task in Ordo" message action, and the `/ordo` slash command.
 *
 * Every entry resolves the Ordo user from the Slack (team, user) pair
 * — unknown pairs are rejected, never auto-provisioned. Button values
 * go through the notifier's HMAC verification (forgery/expiry safe).
 */
@Injectable()
export class SlackActionsService {
  private readonly logger = new Logger(SlackActionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly moduleRef: ModuleRef,
    private readonly notifier: SlackNotifierService,
  ) {}

  // Lazy resolution breaks the MODULE cycle
  // (Slack → V1 → Tasks → Notifications → Slack): services are looked
  // up at call time through the global injector instead of module
  // imports. Class imports below are values (needed as DI tokens)
  // but create no ES cycle: the service files don't loop back here.
  private get v1Tasks(): V1TasksService {
    return this.moduleRef.get(V1TasksService, { strict: false });
  }

  private get aiService(): AIService {
    return this.moduleRef.get(AIService, { strict: false });
  }

  async handleBlockAction(input: BlockActionInput): Promise<{ ok: true }> {
    const userId = await this.resolveUser(input.teamId, input.slackUserId);
    const { taskId } = await this.notifier.verifyAction(input.value);

    if (input.actionId === 'ordo_task_complete') {
      await this.v1Tasks.update(userId, taskId, {
        status: 'COMPLETED',
      } as never);
      this.logger.log(`Slack action: task ${taskId} completed by ${userId}`);
      return { ok: true };
    }
    if (input.actionId === 'ordo_task_postpone') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await this.v1Tasks.update(userId, taskId, {
        dueDate: tomorrow.toISOString().slice(0, 10),
      } as never);
      this.logger.log(`Slack action: task ${taskId} postponed by ${userId}`);
      return { ok: true };
    }
    if (input.actionId === 'ordo_task_view') {
      return { ok: true };
    }
    throw new BadRequestException(`Unknown action: ${input.actionId}`);
  }

  async handleMessageAction(
    input: MessageActionInput,
  ): Promise<{ taskId: string; messageLink: string }> {
    const userId = await this.resolveUser(input.teamId, input.slackUserId);
    const parsed = await this.aiService.parseNaturalLanguageTask(
      input.messageText,
      undefined,
      undefined,
    );
    const projectId = await this.defaultProjectFor(userId, input.teamId);
    const created = (await this.v1Tasks.create(userId, {
      title: parsed.title,
      description: parsed.description,
      projectId,
      priority: parsed.priority,
      dueDate: parsed.dueDate,
    } as never)) as { id: string };

    this.logger.log(
      `Slack message action: task ${created.id} created by ${userId}`,
    );
    return {
      taskId: created.id,
      messageLink: `https://slack.com/archives/${input.channelId}/p${input.messageTs.replace('.', '')}`,
    };
  }

  async handleSlashCommand(
    input: SlashCommandInput,
  ): Promise<{ text: string; ephemeral?: boolean }> {
    const userId = await this.resolveUser(input.teamId, input.slackUserId);
    const [subcommand, ...rest] = input.text.trim().split(/\s+/);
    const args = rest.join(' ');

    if (subcommand === 'create' && args) {
      const projectId = await this.defaultProjectFor(userId, input.teamId);
      const parsed = await this.aiService.parseNaturalLanguageTask(
        args,
        projectId,
        undefined,
      );
      const created = (await this.v1Tasks.create(userId, {
        title: parsed.title,
        description: parsed.description,
        projectId,
        priority: parsed.priority,
        dueDate: parsed.dueDate,
      } as never)) as { id: string };
      return { text: `Created task "${parsed.title}" (${created.id}).` };
    }

    if (subcommand === 'today' || subcommand === '') {
      const tasks = (await this.v1Tasks.list(userId, {})) as {
        id: string;
        title: string;
      }[];
      if (tasks.length === 0) {
        return { text: 'Nothing due — enjoy the calm.' };
      }
      const lines = tasks.map((task) => `• ${task.title}`).join('\n');
      return { text: `Today's tasks:\n${lines}` };
    }

    return {
      text: [
        'Usage:',
        '`/ordo create <task in your words>` — create a task',
        '`/ordo today` — list your tasks',
      ].join('\n'),
      ephemeral: true,
    };
  }

  private async resolveUser(
    teamId: string,
    slackUserId: string,
  ): Promise<string> {
    const mappings = await this.prisma.slackWorkspaceMap.findMany({
      where: { teamId, slackUserId },
    });
    const mapping = mappings[0];
    if (!mapping) {
      throw new UnauthorizedException(
        'Slack user is not linked to an Ordo account',
      );
    }
    return mapping.userId;
  }

  private async defaultProjectFor(
    userId: string,
    teamId: string,
  ): Promise<string> {
    const mapping = await this.prisma.slackWorkspaceMap.findFirst({
      where: { userId, teamId },
    });
    const projectId = mapping?.projectId;
    if (!projectId) {
      throw new BadRequestException(
        'No default project mapped for this Slack workspace. Map a channel to a project first.',
      );
    }
    return projectId;
  }
}
