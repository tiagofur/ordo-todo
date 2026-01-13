import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtSecretRotationService } from './jwt-rotation.service';
import { AuthAuditService } from './auth-audit.service';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth/security')
export class AuthSecurityController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtSecretRotationService: JwtSecretRotationService,
    private readonly authAuditService: AuthAuditService,
  ) { }

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
  getRotationInfo() {
    return this.jwtSecretRotationService.getRotationInfo();
  }

  @Post('jwt-secret/rotate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rotate JWT secret',
    description:
      'Manually rotate the JWT secret. Should be called periodically by a scheduler.',
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
  rotateSecret() {
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
    description: 'Returns recent authentication events for monitoring',
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
  async getRecentLogs() {
    // TODO: Return actual logs from AuthAuditLog repository
    return [];
  }
}

