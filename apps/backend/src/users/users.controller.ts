import {
  Controller,
  Get,
  Put,
  Patch,
  Delete,
  Body,
  UseGuards,
  Post,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current user (basic info)
   */
  @Get('me')
  @ApiOperation({
    summary: 'Get current user',
    description:
      'Returns basic user information including id, email, username, and name.',
  })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        email: 'user@example.com',
        username: 'johndoe',
        name: 'John Doe',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getMe(@CurrentUser() user: RequestUser) {
    return this.usersService.getMe(user.email);
  }

  /**
   * Get full profile with subscription, integrations, and preferences
   */
  @Get('me/profile')
  @ApiOperation({
    summary: 'Get full user profile',
    description:
      'Returns complete user profile including subscription details, third-party integrations, and user preferences.',
  })
  @ApiResponse({
    status: 200,
    description: 'Full profile retrieved successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        email: 'user@example.com',
        username: 'johndoe',
        name: 'John Doe',
        subscription: { plan: 'FREE', expiresAt: null },
        integrations: { google: null, notion: null },
        preferences: { theme: 'dark', language: 'en' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getProfile(@CurrentUser() user: RequestUser) {
    return this.usersService.getFullProfile(user.email);
  }

  /**
   * Update user profile
   */
  @Put('me')
  @ApiOperation({
    summary: 'Update user profile',
    description:
      'Updates user profile information. All fields are optional. Partial updates are allowed.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        email: 'user@example.com',
        username: 'johndoe',
        name: 'John Doe',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data (validation failed)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async updateProfile(
    @CurrentUser() user: RequestUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.email, updateProfileDto);
  }

  /**
   * Patch user profile (partial update)
   */
  @Patch('me/profile')
  @ApiOperation({
    summary: 'Patch user profile',
    description:
      'Performs partial update of user profile. Only provided fields will be updated.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile patched successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        email: 'user@example.com',
        username: 'johndoe',
        name: 'John Doe',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data (validation failed)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async patchProfile(
    @CurrentUser() user: RequestUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.email, updateProfileDto);
  }

  /**
   * Get user preferences
   */
  @Get('me/preferences')
  @ApiOperation({
    summary: 'Get user preferences',
    description:
      'Returns user preferences including theme, language, and AI/privacy settings.',
  })
  @ApiResponse({
    status: 200,
    description: 'Preferences retrieved successfully',
    schema: {
      example: {
        theme: 'dark',
        language: 'en',
        aiEnabled: true,
        dataSharingEnabled: false,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getPreferences(@CurrentUser() user: RequestUser) {
    const profile = await this.usersService.getFullProfile(user.email);
    return profile.preferences;
  }

  /**
   * Update user preferences (AI and privacy settings)
   */
  @Patch('me/preferences')
  @ApiOperation({
    summary: 'Update user preferences',
    description:
      'Updates user preferences including theme, language, AI features, and privacy settings.',
  })
  @ApiResponse({
    status: 200,
    description: 'Preferences updated successfully',
    schema: {
      example: {
        theme: 'dark',
        language: 'en',
        aiEnabled: true,
        dataSharingEnabled: false,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data (validation failed)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async updatePreferences(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.usersService.updatePreferences(user.email, dto);
  }

  /**
   * Get user integrations
   */
  @Get('me/integrations')
  @ApiOperation({
    summary: 'Get user integrations',
    description:
      'Returns connected third-party integrations (Google, Notion, etc.) and their connection status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Integrations retrieved successfully',
    schema: {
      example: {
        google: {
          connected: true,
          email: 'user@gmail.com',
          lastSyncAt: '2025-12-29T10:00:00Z',
        },
        notion: {
          connected: false,
          workspaceName: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getIntegrations(@CurrentUser() user: RequestUser) {
    return this.usersService.getIntegrations(user.email);
  }

  /**
   * Export user data (GDPR)
   */
  @Post('me/export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Export user data',
    description:
      'Exports all user data in JSON format for GDPR compliance. Returns a downloadable file attachment.',
  })
  @ApiResponse({
    status: 200,
    description: 'Data exported successfully',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            user: { type: 'object' },
            workspaces: { type: 'array' },
            projects: { type: 'array' },
            tasks: { type: 'array' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async exportData(@CurrentUser() user: RequestUser, @Res() res: Response) {
    const data = await this.usersService.exportData(user.email);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ordo-todo-export-${Date.now()}.json"`,
    );
    return res.send(JSON.stringify(data, null, 2));
  }

  /**
   * Delete user account
   */
  @Delete('me')
  @ApiOperation({
    summary: 'Delete user account',
    description:
      'Permanently deletes the user account and all associated data. This action cannot be undone.',
  })
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully',
    schema: {
      example: {
        message: 'Account deleted successfully',
        userId: 'clx1234567890',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteAccount(@CurrentUser() user: RequestUser) {
    return this.usersService.deleteAccount(user.email);
  }
}
