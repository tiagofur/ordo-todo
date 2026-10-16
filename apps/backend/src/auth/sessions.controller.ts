import {
  Controller,
  Get,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { SessionsService, SessionInfo } from './sessions.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

interface RequestUser {
  id: string;
  email: string;
  username: string;
  name: string;
}

@ApiTags('Sessions')
@ApiBearerAuth()
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  /**
   * Get all active sessions for the current user
   */
  @Get()
  @ApiOperation({
    summary: 'Get all active sessions',
    description:
      'Returns a list of all active sessions for the current user across all devices',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active sessions',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '550e8400-e29b-41d4-a716-446655440000',
          },
          deviceName: { type: 'string', example: 'Chrome on Windows' },
          deviceType: {
            type: 'string',
            enum: ['web', 'mobile', 'desktop'],
            example: 'web',
          },
          os: { type: 'string', example: 'Windows 11' },
          browser: { type: 'string', example: 'Chrome 120' },
          ip: { type: 'string', example: '192.168.*.*' },
          location: { type: 'string', example: 'Mexico City, MX' },
          lastActive: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          isCurrent: { type: 'boolean', example: true },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSessions(
    @CurrentUser() user: RequestUser,
    @Req() req: Request,
  ): Promise<SessionInfo[]> {
    const refreshToken = req.cookies?.refresh_token;
    return this.sessionsService.getUserSessions(user.id, refreshToken);
  }

  /**
   * Get session count for the current user
   */
  @Get('count')
  @ApiOperation({
    summary: 'Get active session count',
    description: 'Returns the number of active sessions for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Session count',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 3 },
      },
    },
  })
  async getSessionCount(
    @CurrentUser() user: RequestUser,
  ): Promise<{ count: number }> {
    const count = await this.sessionsService.getSessionCount(user.id);
    return { count };
  }

  /**
   * Revoke a specific session by ID
   */
  @Delete(':sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke a specific session',
    description: 'Revokes a specific session, logging out that device',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'The ID of the session to revoke',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Session revoked successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Session revoked successfully' },
        sessionId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async revokeSession(
    @CurrentUser() user: RequestUser,
    @Param('sessionId') sessionId: string,
    @Req() req: Request,
  ): Promise<{ message: string; sessionId: string }> {
    // Check if trying to revoke current session
    const refreshToken = req.cookies?.refresh_token;
    const sessions = await this.sessionsService.getUserSessions(
      user.id,
      refreshToken,
    );
    const sessionToRevoke = sessions.find((s) => s.id === sessionId);

    if (sessionToRevoke?.isCurrent) {
      throw new UnauthorizedException(
        'Cannot revoke current session. Use logout instead.',
      );
    }

    await this.sessionsService.revokeSession(user.id, sessionId);

    return {
      message: 'Session revoked successfully',
      sessionId,
    };
  }

  /**
   * Revoke all sessions except the current one
   */
  @Delete('others/all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke all other sessions',
    description:
      'Revokes all sessions except the current one, logging out all other devices',
  })
  @ApiResponse({
    status: 200,
    description: 'Other sessions revoked successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Revoked 2 sessions' },
        revokedCount: { type: 'number', example: 2 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async revokeOtherSessions(
    @CurrentUser() user: RequestUser,
    @Req() req: Request,
  ): Promise<{ message: string; revokedCount: number }> {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('No active session found');
    }

    const revokedCount = await this.sessionsService.revokeAllOtherSessions(
      user.id,
      refreshToken,
    );

    return {
      message: `Revoked ${revokedCount} session${revokedCount !== 1 ? 's' : ''}`,
      revokedCount,
    };
  }
}
