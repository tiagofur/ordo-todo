import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  Req,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtSecretRotationService } from './jwt-rotation.service';
import { AuthAuditService } from './auth-audit.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth/security')
export class AuthSecurityController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtSecretRotationService: JwtSecretRotationService,
    private readonly authAuditService: AuthAuditService,
    private readonly configService: ConfigService,
  ) {}

  private assertAdminAccess(user?: any, req?: Request): void {
    const adminApiKey = this.configService.get<string>('ADMIN_API_KEY');
    const providedKey = req?.headers?.['x-admin-api-key'];

    if (adminApiKey && providedKey && providedKey === adminApiKey) {
      return;
    }

    const adminEmailsRaw =
      this.configService.get<string>('ADMIN_EMAILS') || '';
    const adminEmails = adminEmailsRaw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (
      user?.email &&
      adminEmails.length > 0 &&
      adminEmails.includes(String(user.email).toLowerCase())
    ) {
      return;
    }

    if (user?.role === 'ADMIN' || user?.isAdmin === true) {
      return;
    }

    throw new ForbiddenException(
      'Administrator privileges required for security operations',
    );
  }

  @Get('jwt-secret/rotation-info')
  @ApiOperation({
    summary: 'Get JWT secret rotation information',
    description: 'Returns current JWT secret rotation status and configuration',
  })
  @ApiResponse({
    status: 200,
    description: 'Rotation information',
    schema: {
      type: 'object',
      properties: {
        currentSecret: { type: 'string' },
        lastRotation: { type: 'string' },
        daysSinceRotation: { type: 'number' },
        rotationInterval: { type: 'number' },
        needsRotation: { type: 'boolean' },
      },
    },
  })
  getRotationInfo(@CurrentUser() user?: any, @Req() req?: Request) {
    this.assertAdminAccess(user, req);
    return this.jwtSecretRotationService.getRotationInfo();
  }

  @Post('jwt-secret/rotate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rotate JWT secret',
    description:
      'Manually rotate the JWT secret. Restricted to administrators.',
  })
  @ApiResponse({
    status: 200,
    description: 'Secret rotated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        newSecret: { type: 'string' },
        previousSecret: { type: 'string' },
        rotationDate: { type: 'string' },
      },
    },
  })
  rotateSecret(@CurrentUser() user?: any, @Req() req?: Request) {
    this.assertAdminAccess(user, req);
    this.jwtSecretRotationService.rotateSecret();
    return {
      message: 'JWT secret rotated successfully',
      newSecret: '***',
      previousSecret: '***',
      rotationDate: new Date().toISOString(),
    };
  }

  @Get('audit/recent')
  @ApiOperation({
    summary: 'Get recent auth audit logs',
    description:
      'Returns recent authentication events for the current authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent audit logs',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          userId: { type: 'string' },
          email: { type: 'string' },
          ip: { type: 'string' },
          userAgent: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
    },
  })
  async getRecentLogs(
    @CurrentUser() user?: any,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.authAuditService.getRecentLogs({
      userId: user?.id,
      limit: Number.isNaN(parsedLimit) ? 50 : parsedLimit,
    });
  }
}
