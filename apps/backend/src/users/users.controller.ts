import { Controller, Get, Put, Patch, Delete, Body, UseGuards, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  /**
   * Get current user (basic info)
   */
  @Get('me')
  async getMe(@CurrentUser() user: RequestUser) {
    return this.usersService.getMe(user.email);
  }

  /**
   * Get full profile with subscription, integrations, and preferences
   */
  @Get('me/profile')
  async getProfile(@CurrentUser() user: RequestUser) {
    return this.usersService.getFullProfile(user.email);
  }

  /**
   * Update user profile
   */
  @Put('me')
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
  async getPreferences(@CurrentUser() user: RequestUser) {
    const profile = await this.usersService.getFullProfile(user.email);
    return profile.preferences;
  }

  /**
   * Update user preferences (AI and privacy settings)
   */
  @Patch('me/preferences')
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
  async getIntegrations(@CurrentUser() user: RequestUser) {
    return this.usersService.getIntegrations(user.email);
  }

  /**
   * Export user data (GDPR)
   */
  @Post('me/export')
  async exportData(@CurrentUser() user: RequestUser, @Res() res: Response) {
    const data = await this.usersService.exportData(user.email);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="ordo-todo-export-${Date.now()}.json"`);
    return res.send(JSON.stringify(data, null, 2));
  }

  /**
   * Delete user account
   */
  @Delete('me')
  async deleteAccount(@CurrentUser() user: RequestUser) {
    return this.usersService.deleteAccount(user.email);
  }
}
