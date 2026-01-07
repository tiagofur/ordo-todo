import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
  ) {}

  async getMe(email: string) {
    const userByEmailUseCase = new UserByEmail(this.userRepository);
    const user = await userByEmailUseCase.execute(email);
    return user?.props;
  }

  /**
   * Get full user profile with subscription, integrations, and preferences
   */
  async getFullProfile(email: string): Promise<UserProfileResponseDto> {
    try {
      // Use explicit select to avoid issues with missing columns in database
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          emailVerified: true,
          image: true,
          phone: true,
          jobTitle: true,
          department: true,
          bio: true,
          timezone: true,
          locale: true,
          lastUsernameChangeAt: true,
          createdAt: true,
          updatedAt: true,
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
        username: user.username,
        name: user.name,
        emailVerified: user.emailVerified,
        image: user.image,
        phone: user.phone,
        jobTitle: user.jobTitle,
        department: user.department,
        bio: user.bio,
        timezone: user.timezone,
        locale: user.locale,
        lastUsernameChangeAt: user.lastUsernameChangeAt ?? null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        subscription: user.subscription
          ? {
              plan: user.subscription.plan as
                | 'FREE'
                | 'PRO'
                | 'TEAM'
                | 'ENTERPRISE',
              status: user.subscription.status,
              expiresAt: user.subscription.stripeCurrentPeriodEnd,
            }
          : null,
        integrations: (user.integrations ?? []).map((integration) => ({
          provider: String(integration.provider),
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
              morningEnergy: String(user.preferences.morningEnergy),
              afternoonEnergy: String(user.preferences.afternoonEnergy),
              eveningEnergy: String(user.preferences.eveningEnergy),
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
    } catch (error) {
      // Re-throw known exceptions
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Log unexpected errors with details for debugging
      console.error(
        '[UsersService.getFullProfile] Error loading profile for:',
        email,
        error,
      );
      throw new BadRequestException(
        `Failed to load profile data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async updateProfile(email: string, updateProfileDto: UpdateProfileDto) {
    // Use UserRepository to find user
    const userEntity = await this.userRepository.findByEmail(email);

    if (!userEntity) {
      throw new NotFoundException('User not found');
    }

    const userProps = userEntity.props;

    // Check if username is being updated and if it's unique
    if (updateProfileDto.username) {
      if (updateProfileDto.username !== userProps.username) {
        // Check 30-day cooldown
        if (userProps.lastUsernameChangeAt) {
          const daysSinceLastChange = Math.floor(
            (Date.now() - new Date(userProps.lastUsernameChangeAt).getTime()) /
              (1000 * 60 * 60 * 24),
          );
          if (daysSinceLastChange < 30) {
            throw new BadRequestException(
              `You can change your username again in ${30 - daysSinceLastChange} days`,
            );
          }
        }

        // Only select id to check existence (keep Prisma for username uniqueness check)
        const existingUser = await this.prisma.user.findUnique({
          where: { username: updateProfileDto.username },
          select: { id: true },
        });

        if (existingUser) {
          throw new BadRequestException('Username already taken');
        }
      }
    }

    // Prepare update data
    const updateData: any = {
      name: updateProfileDto.name,
      phone: updateProfileDto.phone,
      jobTitle: updateProfileDto.jobTitle,
      department: updateProfileDto.department,
      bio: updateProfileDto.bio,
      timezone: updateProfileDto.timezone,
      locale: updateProfileDto.locale,
      image: updateProfileDto.image,
    };

    // If username is being changed, update it and track the change time
    if (
      updateProfileDto.username &&
      updateProfileDto.username !== userProps.username
    ) {
      updateData.username = updateProfileDto.username;
      updateData.lastUsernameChangeAt = new Date();
    }

    // Update using UserRepository
    await this.userRepository.updateProps(userEntity, updateData);
    const updatedUser = await this.userRepository.findByEmail(email);

    return {
      success: true,
      user: {
        id: updatedUser!.id,
        name: updatedUser!.props.name,
        email: updatedUser!.props.email,
        username: updatedUser!.props.username,
        phone: updatedUser!.props.phone,
        jobTitle: updatedUser!.props.jobTitle,
        department: updatedUser!.props.department,
        bio: updatedUser!.props.bio,
        timezone: updatedUser!.props.timezone,
        locale: updatedUser!.props.locale,
        image: updatedUser!.props.image,
      },
    };
  }

  /**
   * Update user preferences (AI and privacy settings)
   */
  async updatePreferences(email: string, dto: UpdatePreferencesDto) {
    // Use UserRepository to find user
    const userEntity = await this.userRepository.findByEmail(email);

    if (!userEntity) {
      throw new NotFoundException('User not found');
    }

    // Upsert preferences using Prisma (specific upsert operation)
    const preferences = await this.prisma.userPreferences.upsert({
      where: { userId: userEntity.id },
      create: {
        userId: userEntity.id,
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
    // Use select with include for integrations only
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        integrations: {
          select: {
            id: true,
            provider: true,
            isActive: true,
            providerEmail: true,
            lastSyncAt: true,
            createdAt: true,
          },
        },
      },
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
    // Use UserRepository to find user
    const userEntity = await this.userRepository.findByEmail(email);

    if (!userEntity) {
      throw new NotFoundException('User not found');
    }

    // Delete user using UserRepository - cascades to all related data
    await this.userRepository.delete(userEntity.id);

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
        ownedTasks: {
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
      tasks: user.ownedTasks,
      activities: user.activities,
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Update user avatar URL
   *
   * @param email - User email
   * @param avatarUrl - New avatar URL
   * @returns Updated user
   * @throws {NotFoundException} If user not found
   */
  async updateAvatar(email: string, avatarUrl: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.updateProps(user, { image: avatarUrl });
  }

  /**
   * Remove user avatar
   *
   * @param email - User email
   * @returns void
   * @throws {NotFoundException} If user not found
   */
  async removeAvatar(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.updateProps(user, { image: null });
  }
}
