import {
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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { CalendarConnectionsService } from './calendar-connections.service';
import { CalendarConflictsService } from './calendar-conflicts.service';

@ApiTags('Calendar Sync')
@ApiBearerAuth()
@Controller('integrations/calendar')
@UseGuards(JwtAuthGuard)
export class CalendarConnectionsController {
  constructor(
    private readonly connections: CalendarConnectionsService,
    private readonly conflicts: CalendarConflictsService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Per-account sync status for the UI' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ok / error / re-auth-required / never-synced per provider.',
  })
  status(@CurrentUser() user: RequestUser) {
    return this.conflicts.accountStatus(user.id);
  }

  @Post(':provider/connect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start calendar OAuth (returns authorize URL)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Authorize URL + state.' })
  startConnect(
    @CurrentUser() user: RequestUser,
    @Param('provider') provider: string,
  ) {
    return this.connections.startConnect(user.email, provider);
  }

  @Public()
  @Get(':provider/callback')
  @ApiOperation({ summary: 'OAuth callback (exchanges the code)' })
  async callback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ): Promise<void> {
    // JD-003: the account comes from the signed state issued to the
    // authenticated initiator, never from the query string.
    const userId = this.connections.verifyConnectState(state);
    await this.connections.finishConnect(
      userId,
      provider as 'GOOGLE_CALENDAR' | 'MICROSOFT_CALENDAR',
      code,
    );
    res.redirect('/settings/integrations?connected=calendar');
  }

  @Delete(':provider')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Disconnect calendar provider' })
  disconnect(
    @CurrentUser() user: RequestUser,
    @Param('provider') provider: string,
  ): Promise<void> {
    return this.connections.disconnect(user.email, provider);
  }
}
