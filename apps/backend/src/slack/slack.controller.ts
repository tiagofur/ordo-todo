import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { SlackSignatureGuard } from './slack-signature.guard';

@ApiTags('Slack')
@ApiBearerAuth()
@Controller('slack')
@UseGuards(JwtAuthGuard)
export class SlackController {
  constructor(private readonly oauth: SlackOAuthService) {}

  @Post('install')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start Slack app install (returns install URL)' })
  startInstall(@CurrentUser() user: RequestUser) {
    void user;
    const state = Math.random().toString(36).slice(2);
    return { installUrl: this.oauth.getInstallUrl(state), state };
  }

  @Public()
  @Get('oauth/callback')
  @ApiOperation({ summary: 'Slack OAuth callback (exchanges the code)' })
  async callback(
    @Query('code') code: string,
    @Query('email') email: string,
    @Res() res: Response,
  ): Promise<void> {
    await this.oauth.finishInstall(email, code);
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
    // tokens_revoked + message shortcuts land in T2/T3.
    return { ok: true };
  }
}
