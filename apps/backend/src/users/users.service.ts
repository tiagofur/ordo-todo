import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import type { UserRepository } from '@ordo-todo/core';
import { UserByEmail, ChangeUserName } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UserProfileResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) { }

  async getMe(email: string) {
    const userByEmailUseCase = new UserByEmail(this.userRepository);
    const user = await userByEmailUseCase.execute(email);
    return user?.props;
  }

  /**
   * Get full user profile with subscription, integrations, and preferences
   */
  async getFullProfile(email: string): Promise<UserProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        subscription: true,
        integrations: true,
        preferences: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      image: user.image,
      phone: user.phone,
      jobTitle: user.jobTitle,
      department: user.department,
      bio: user.bio,
      timezone: user.timezone,
      locale: user.locale,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      subscription: user.subscription
        ? {
          plan: user.subscription.plan,
          status: user.subscription.status,
          expiresAt: user.subscription.stripeCurrentPeriodEnd,
        }
        : null,
      integrations: user.integrations.map((integration) => ({
        provider: integration.provider,
        isActive: integration.isActive,
        providerEmail: integration.providerEmail,
        lastSyncAt: integration.lastSyncAt,
      })),
      preferences: user.preferences
        ? {
          enableAI: user.preferences.enableAI,
          aiAggressiveness: user.preferences.aiAggressiveness,
          aiSuggestTaskDurations: user.preferences.aiSuggestTaskDurations,
          aiSuggestPriorities: user.preferences.aiSuggestPriorities,
          aiSuggestScheduling: user.preferences.aiSuggestScheduling,
          aiWeeklyReports: user.preferences.aiWeeklyReports,
          morningEnergy: user.preferences.morningEnergy,
          afternoonEnergy: user.preferences.afternoonEnergy,
          eveningEnergy: user.preferences.eveningEnergy,
          shareAnalytics: user.preferences.shareAnalytics,
          showActivityStatus: user.preferences.showActivityStatus,
          taskRemindersEmail: user.preferences.taskRemindersEmail,
          weeklyDigestEmail: user.preferences.weeklyDigestEmail,
          marketingEmail: user.preferences.marketingEmail,
          completedTasksRetention: user.preferences.completedTasksRetention,
          timeSessionsRetention: user.preferences.timeSessionsRetention,
        }
        : null,
    };
  }

  async updateProfile(email: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if username is being updated and if it's unique
    if (updateProfileDto.username) {
      if (updateProfileDto.username !== user.username) {
        const existingUser = await this.prisma.user.findUnique({
          where: { username: updateProfileDto.username },
        });

        if (existingUser) {
          throw new BadRequestException('Username already taken');
        }
      }
    }

    // Update extended profile fields directly in Prisma
    const updatedUser = await this.prisma.user.update({
      where: { email },
      data: {
        name: updateProfileDto.name,
        username: updateProfileDto.username,
        phone: updateProfileDto.phone,
        jobTitle: updateProfileDto.jobTitle,
        department: updateProfileDto.department,
        bio: updateProfileDto.bio,
        timezone: updateProfileDto.timezone,
        locale: updateProfileDto.locale,
        image: updateProfileDto.image,
      },
    });

    return {
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        phone: updatedUser.phone,
        jobTitle: updatedUser.jobTitle,
        department: updatedUser.department,
        bio: updatedUser.bio,
        timezone: updatedUser.timezone,
        locale: updatedUser.locale,
        image: updatedUser.image,
      },
    };
  }

  /**
   * Update user preferences (AI and privacy settings)
   */
  async updatePreferences(email: string, dto: UpdatePreferencesDto) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { preferences: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Upsert preferences
    const preferences = await this.prisma.userPreferences.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...dto,
      },
      update: {
        ...dto,
      },
    });

    return {
      success: true,
      preferences: {
        enableAI: preferences.enableAI,
        aiAggressiveness: preferences.aiAggressiveness,
        aiSuggestTaskDurations: preferences.aiSuggestTaskDurations,
        aiSuggestPriorities: preferences.aiSuggestPriorities,
        aiSuggestScheduling: preferences.aiSuggestScheduling,
        aiWeeklyReports: preferences.aiWeeklyReports,
        morningEnergy: preferences.morningEnergy,
        afternoonEnergy: preferences.afternoonEnergy,
        eveningEnergy: preferences.eveningEnergy,
        shareAnalytics: preferences.shareAnalytics,
        showActivityStatus: preferences.showActivityStatus,
        taskRemindersEmail: preferences.taskRemindersEmail,
        weeklyDigestEmail: preferences.weeklyDigestEmail,
        marketingEmail: preferences.marketingEmail,
        completedTasksRetention: preferences.completedTasksRetention,
        timeSessionsRetention: preferences.timeSessionsRetention,
      },
    };
  }

  /**
   * Get user integrations
   */
  async getIntegrations(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { integrations: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.integrations.map((integration) => ({
      id: integration.id,
      provider: integration.provider,
      isActive: integration.isActive,
      providerEmail: integration.providerEmail,
      lastSyncAt: integration.lastSyncAt,
      createdAt: integration.createdAt,
    }));
  }

  /**
   * Delete user account and all associated data
   */
  async deleteAccount(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete user - cascades to all related data due to Prisma schema
    await this.prisma.user.delete({
      where: { id: user.id },
    });

    return { success: true, message: 'Account deleted successfully' };
  }

  /**
   * Export user data (GDPR compliance)
   */
  async exportData(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        preferences: true,
        subscription: true,
        integrations: true,
        workspaces: {
          include: {
            workspace: true,
          },
        },
        createdTasks: {
          take: 1000, // Limit for performance
        },
        activities: {
          take: 1000,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Return data in a structured format
    return {
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        jobTitle: user.jobTitle,
        department: user.department,
        bio: user.bio,
        timezone: user.timezone,
        locale: user.locale,
        createdAt: user.createdAt,
      },
      preferences: user.preferences,
      subscription: user.subscription,
      integrations: user.integrations,
      workspaces: user.workspaces.map((wm) => ({
        name: wm.workspace.name,
        role: wm.role,
        joinedAt: wm.joinedAt,
      })),
      tasks: user.createdTasks,
      activities: user.activities,
      exportedAt: new Date().toISOString(),
    };
  }
}
