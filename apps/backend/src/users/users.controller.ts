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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
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
import { ImagesService } from '../images/images.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { BaseController } from '../common/base/base.controller';

/**
 * Users Controller
 *
 * Handles user-related operations including profile management,
 * avatar uploads, preferences, and subscription information.
 *
 * @extends BaseController
 */
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController extends BaseController {
  constructor(
    private readonly usersService: UsersService,
    private readonly imagesService: ImagesService,
  ) {
    super('UsersController');
  }

  /**
   * Get current user (basic info)
   *
   * Returns basic user information. Use this endpoint for lightweight
   * user data retrieval. For complete profile including subscription
   * and preferences, use GET /users/me/profile.
   *
   * @param user - Authenticated user from JWT token
   * @returns Basic user information (id, email, username, name, image)
   * @throws {UnauthorizedException} If JWT token is invalid or missing
   *
   * @example
   * ```typescript
   * const response = await fetch('/users/me', {
   *   headers: { 'Authorization': 'Bearer <token>' }
   * });
   * const user = await response.json();
   * // { id: 'clx123', email: 'user@example.com', username: 'johndoe', name: 'John Doe' }
   * ```
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
    this.logAction('get_me', user);
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

  /**
   * Upload avatar image
   *
   * Uploads and processes an avatar image for the authenticated user.
   * The image is automatically resized to 256x256px, optimized to JPEG
   * format with 85% quality, and saved to the server. Any existing
   * avatar is replaced.
   *
   * @param user - Authenticated user from JWT token
   * @param file - Uploaded image file (multipart/form-data)
   * @returns Object containing avatar URL and success message
   * @throws {BadRequestException} If file is not provided, exceeds 5MB, is not an image, or exceeds 4000x4000px
   * @throws {UnauthorizedException} If JWT token is invalid or missing
   *
   * @example
   * ```typescript
   * const formData = new FormData();
   * formData.append('avatar', fileInput.files[0]);
   *
   * const response = await fetch('/users/me/avatar', {
   *   method: 'POST',
   *   headers: { 'Authorization': 'Bearer <token>' },
   *   body: formData
   * });
   * const result = await response.json();
   * // { url: '/uploads/avatars/avatar-user-123-1234567890.jpg', message: 'Avatar uploaded successfully' }
   * ```
   */
  @Post('me/avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Upload user avatar',
    description:
      'Uploads and optimizes avatar image. Automatically resizes to 256x256px and optimizes for web. Supports JPEG, PNG, WEBP up to 5MB.',
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar uploaded successfully',
    schema: {
      example: {
        url: '/uploads/avatars/user-123-1234567890.jpg',
        message: 'Avatar uploaded successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file (size, format, or dimensions)',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @CurrentUser() user: RequestUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    this.logAction('upload_avatar', user, {
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    });

    // Process and optimize image
    const processed = await this.imagesService.processAvatar(file);

    // Get current user to check for existing avatar
    const currentUser = await this.usersService.getMe(user.email);

    // Delete old avatar if exists
    if (currentUser.image) {
      await this.imagesService.deleteAvatar(currentUser.image);
    }

    // Save new avatar
    const avatarUrl = await this.imagesService.saveAvatar(
      processed.buffer,
      user.id,
    );

    // Update user with new avatar URL
    await this.usersService.updateAvatar(user.email, avatarUrl);

    return {
      url: avatarUrl,
      message: 'Avatar uploaded successfully',
    };
  }

  /**
   * Delete avatar image
   *
   * Removes the current avatar image for the authenticated user.
   * The user's profile will revert to the default avatar. The avatar
   * file is deleted from the server. This operation is idempotent -
   * calling it when no avatar is set will return success.
   *
   * @param user - Authenticated user from JWT token
   * @returns Object containing success flag and message
   * @throws {UnauthorizedException} If JWT token is invalid or missing
   *
   * @example
   * ```typescript
   * const response = await fetch('/users/me/avatar', {
   *   method: 'DELETE',
   *   headers: { 'Authorization': 'Bearer <token>' }
   * });
   * const result = await response.json();
   * // { success: true, message: 'Avatar deleted successfully' }
   * ```
   */
  @Delete('me/avatar')
  @ApiOperation({
    summary: 'Delete user avatar',
    description: 'Removes the current avatar image and reverts to default.',
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Avatar deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteAvatar(@CurrentUser() user: RequestUser) {
    this.logAction('delete_avatar', user);

    // Get current user
    const currentUser = await this.usersService.getMe(user.email);

    // Delete avatar file if exists
    if (currentUser.image) {
      await this.imagesService.deleteAvatar(currentUser.image);
    }

    // Remove avatar URL from user
    await this.usersService.removeAvatar(user.email);

    return {
      success: true,
      message: 'Avatar deleted successfully',
    };
  }
}
