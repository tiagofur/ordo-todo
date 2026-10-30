import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { SlackOAuthService } from './slack-oauth.service';
import { SlackActionsService } from './slack-actions.service';
import { SlackSignatureGuard } from './slack-signature.guard';

@ApiTags('Slack')
@ApiBearerAuth()
@Controller('slack')
@UseGuards(JwtAuthGuard)
export class SlackController {
  constructor(
    private readonly oauth: SlackOAuthService,
    private readonly actions: SlackActionsService,
  ) {}

  @Post('install')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start Slack app install (returns install URL)' })
  startInstall(@CurrentUser() user: RequestUser) {
    const state = this.oauth.createInstallState(user.id);
    return { installUrl: this.oauth.getInstallUrl(state), state };
  }

  @Public()
  @Get('oauth/callback')
  @ApiOperation({ summary: 'Slack OAuth callback (exchanges the code)' })
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ): Promise<void> {
    // JD-002: the account comes from the signed state issued to the
    // authenticated initiator, never from the query string.
    const userId = this.oauth.verifyInstallState(state);
    await this.oauth.finishInstall(userId, code);
    res.redirect('/settings/integrations?connected=slack');
  }

  @Delete('team/:teamId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Uninstall Slack from a team (clean)' })
  uninstall(
    @CurrentUser() user: RequestUser,
    @Param('teamId') teamId: string,
  ): Promise<void> {
    return this.oauth.uninstall(user.email, teamId);
  }

  @Get('teams')
  @ApiOperation({ summary: 'List connected Slack teams + mappings' })
  teams(@CurrentUser() user: RequestUser) {
    return this.oauth.listTeams(user.email);
  }

  @Patch('mappings/:id')
  @ApiOperation({ summary: 'Update channel/project/summary/focus mapping' })
  updateMapping(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body()
    body: {
      channelId?: string | null;
      projectId?: string | null;
      dailySummary?: boolean;
      summaryHour?: number | null;
      focusSync?: boolean;
      focusDnd?: boolean;
    },
  ) {
    return this.oauth.updateMapping(user.email, id, body);
  }

  @Public()
  @UseGuards(SlackSignatureGuard)
  @Post('events')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Slack Events API endpoint (signed)' })
  async events(@Body() body: Record<string, unknown>) {
    // URL verification handshake.
    if (
      body.type === 'url_verification' &&
      typeof body.challenge === 'string'
    ) {
      return { challenge: body.challenge };
    }
    const event = body.event as { type?: string } | undefined;
    if (event?.type === 'app_uninstalled') {
      const teamId = (body.team_id as string) ?? '';
      if (teamId) {
        await this.oauth.handleAppUninstalled(teamId);
      }
    }
    // tokens_revoked lands in T4 (status cleanup).
    return { ok: true };
  }

  @Public()
  @UseGuards(SlackSignatureGuard)
  @Post('interactions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Slack interactions endpoint: buttons + message actions (signed)',
  })
  async interactions(@Body() body: Record<string, unknown>) {
    // Slack sends interactions as a form-encoded `payload` JSON string;
    // accept both raw JSON and the wrapped form for testability.
    const payload =
      typeof body.payload === 'string'
        ? (JSON.parse(body.payload) as Record<string, unknown>)
        : body;
    const type = payload.type as string | undefined;

    if (type === 'block_actions') {
      const actions = (payload.actions ?? []) as {
        action_id?: string;
        value?: string;
      }[];
      const action = actions[0];
      const team = payload.team as { id?: string } | undefined;
      const user = payload.user as { id?: string } | undefined;
      if (action?.action_id && action.value && team?.id && user?.id) {
        await this.actions.handleBlockAction({
          actionId: action.action_id,
          value: action.value,
          teamId: team.id,
          slackUserId: user.id,
        });
      }
      return { ok: true };
    }

    if (type === 'message_action') {
      const team = payload.team as { id?: string } | undefined;
      const user = payload.user as { id?: string } | undefined;
      const channel = payload.channel as { id?: string } | undefined;
      const message = payload.message as
        | { text?: string; ts?: string }
        | undefined;
      if (team?.id && user?.id && channel?.id && message?.text && message.ts) {
        const result = await this.actions.handleMessageAction({
          teamId: team.id,
          slackUserId: user.id,
          channelId: channel.id,
          messageText: message.text,
          messageTs: message.ts,
          triggerId: (payload.trigger_id as string) ?? '',
        });
        return {
          response_action: 'update',
          text: `Task created: ${result.taskId} (<${result.messageLink}|view message>)`,
        };
      }
      return { ok: true };
    }

    return { ok: true };
  }

  @Public()
  @UseGuards(SlackSignatureGuard)
  @Post('commands')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Slack slash commands: /ordo (signed)' })
  async commands(@Body() body: Record<string, unknown>) {
    const text = typeof body.text === 'string' ? body.text : '';
    const teamId = typeof body.team_id === 'string' ? body.team_id : '';
    const slackUserId = typeof body.user_id === 'string' ? body.user_id : '';
    const channelId =
      typeof body.channel_id === 'string' ? body.channel_id : '';
    if (!teamId || !slackUserId) {
      return {
        text: 'Could not identify your Slack user.',
        response_type: 'ephemeral',
      };
    }
    const result = await this.actions.handleSlashCommand({
      teamId,
      slackUserId,
      channelId,
      text,
    });
    return {
      text: result.text,
      response_type: result.ephemeral === false ? 'in_channel' : 'ephemeral',
    };
  }
}
