import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../database/prisma.service';
import { UserByEmail } from '@ordo-todo/core';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockUserRepository = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    updateProps: jest.fn(),
    delete: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userPreferences: {
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('should successfully get user by email', async () => {
      const email = 'test@example.com';
      const mockUser = {
        withoutPassword: jest.fn().mockReturnThis(),
        props: {
          id: 'user-123',
          email: email,
          username: 'testuser',
          name: 'Test User',
        },
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);

      const result = await service.getMe(email);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual({ ...mockUser.props, isAdmin: false });
    });

    it('flags the platform admin (ODD 019: default admin email)', async () => {
      const email = 'tiagofur@gmail.com';
      mockUserRepository.findByEmail.mockResolvedValue({
        withoutPassword: jest.fn().mockReturnThis(),
        props: { id: 'admin-1', email, username: 'tiago', name: 'Tiago' },
      } as any);

      const result = await service.getMe(email);

      expect(result).toMatchObject({ isAdmin: true });
    });

    it('should return null when user not found', async () => {
      const email = 'nonexistent@example.com';
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await service.getMe(email);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });
  });

  describe('getFullProfile', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User',
      emailVerified: new Date(),
      image: 'https://example.com/image.jpg',
      phone: '+1234567890',
      jobTitle: 'Developer',
      department: 'Engineering',
      bio: 'Software developer',
      timezone: 'America/New_York',
      locale: 'en',
      lastUsernameChangeAt: new Date('2025-01-01'),
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
      subscription: {
        plan: 'PRO',
        status: 'active',
        stripeCurrentPeriodEnd: new Date('2025-12-31'),
      },
      integrations: [
        {
          provider: 'GOOGLE',
          isActive: true,
          providerEmail: 'test@gmail.com',
          lastSyncAt: new Date(),
        },
      ],
      preferences: {
        enableAI: true,
        aiAggressiveness: 0.7,
        aiSuggestTaskDurations: true,
        aiSuggestPriorities: true,
        aiSuggestScheduling: true,
        aiWeeklyReports: true,
        morningEnergy: 'HIGH',
        afternoonEnergy: 'MEDIUM',
        eveningEnergy: 'LOW',
        shareAnalytics: true,
        showActivityStatus: true,
        taskRemindersEmail: true,
        weeklyDigestEmail: true,
        marketingEmail: false,
        completedTasksRetention: 30,
        timeSessionsRetention: 90,
      },
    };

    it('should successfully get full user profile', async () => {
      const email = 'test@example.com';
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser as any);

      const result = await service.getFullProfile(email);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        select: expect.any(Object),
      });
      expect(result).toHaveProperty('id', mockUser.id);
      expect(result).toHaveProperty('email', mockUser.email);
      expect(result).toHaveProperty('subscription');
      expect(result).toHaveProperty('integrations');
      expect(result).toHaveProperty('preferences');
      expect(result.subscription).toEqual({
        plan: 'PRO',
        status: 'active',
        expiresAt: mockUser.subscription.stripeCurrentPeriodEnd,
      });
      expect(result.integrations).toHaveLength(1);
      expect(result.integrations[0].provider).toBe('GOOGLE');
    });

    it('should throw NotFoundException when user not found', async () => {
      const email = 'nonexistent@example.com';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getFullProfile(email)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getFullProfile(email)).rejects.toThrow(
        'User not found',
      );
    });

    it('should handle user without subscription', async () => {
      const email = 'test@example.com';
      const userWithoutSubscription = { ...mockUser, subscription: null };
      mockPrismaService.user.findUnique.mockResolvedValue(
        userWithoutSubscription as any,
      );

      const result = await service.getFullProfile(email);

      expect(result.subscription).toBeNull();
    });

    it('should handle user without integrations', async () => {
      const email = 'test@example.com';
      const userWithoutIntegrations = { ...mockUser, integrations: [] };
      mockPrismaService.user.findUnique.mockResolvedValue(
        userWithoutIntegrations as any,
      );

      const result = await service.getFullProfile(email);

      expect(result.integrations).toEqual([]);
    });

    it('should handle database errors', async () => {
      const email = 'test@example.com';
      mockPrismaService.user.findUnique.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.getFullProfile(email)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getFullProfile(email)).rejects.toThrow(
        'Failed to load profile data',
      );
    });
  });

  describe('updateProfile', () => {
    const mockExistingUser = {
      id: 'user-123',
      props: {
        id: 'user-123',
        email: 'test@example.com',
        username: 'oldusername',
        name: 'Old Name',
        lastUsernameChangeAt: new Date('2025-01-01'),
      },
    };

    it('should successfully update profile without username change', async () => {
      const email = 'test@example.com';
      const updateProfileDto = {
        name: 'Updated Name',
        phone: '+9876543210',
        jobTitle: 'Senior Developer',
        bio: 'Updated bio',
      };

      mockUserRepository.findByEmail.mockResolvedValueOnce(
        mockExistingUser as any,
      );
      mockUserRepository.updateProps.mockResolvedValueOnce(undefined);
      const updatedEntity = {
        id: 'user-123',
        props: {
          ...mockExistingUser.props,
          name: updateProfileDto.name,
        },
      };
      mockUserRepository.findByEmail.mockResolvedValueOnce(
        updatedEntity as any,
      );

      const result = await service.updateProfile(
        email,
        updateProfileDto as any,
      );

      expect(mockUserRepository.updateProps).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.user.name).toBe(updateProfileDto.name);
    });

    it('should successfully update profile with new username', async () => {
      const email = 'test@example.com';
      const updateProfileDto = {
        username: 'newusername',
        name: 'Updated Name',
      };

      mockUserRepository.findByEmail.mockResolvedValueOnce(
        mockExistingUser as any,
      );
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null); // Username not taken
      mockUserRepository.updateProps.mockResolvedValueOnce(undefined);
      const updatedEntity = {
        id: 'user-123',
        props: {
          ...mockExistingUser.props,
          username: 'newusername',
          name: 'Updated Name',
        },
      };
      mockUserRepository.findByEmail.mockResolvedValueOnce(
        updatedEntity as any,
      );

      const result = await service.updateProfile(
        email,
        updateProfileDto as any,
      );

      expect(result.success).toBe(true);
      expect(result.user.username).toBe('newusername');
      expect(mockUserRepository.updateProps).toHaveBeenCalledWith(
        mockExistingUser,
        expect.objectContaining({
          username: 'newusername',
          lastUsernameChangeAt: expect.any(Date),
        }),
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      const email = 'nonexistent@example.com';
      const updateProfileDto = { name: 'Updated Name' };

      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.updateProfile(email, updateProfileDto as any),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateProfile(email, updateProfileDto as any),
      ).rejects.toThrow('User not found');
    });

    it('should throw BadRequestException when username is taken', async () => {
      const email = 'test@example.com';
      const updateProfileDto = { username: 'takenusername' };

      mockUserRepository.findByEmail.mockResolvedValue(mockExistingUser as any);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'other-user',
      } as any); // Username already exists

      await expect(
        service.updateProfile(email, updateProfileDto as any),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateProfile(email, updateProfileDto as any),
      ).rejects.toThrow('Username already taken');
    });

    it('should throw BadRequestException when username change cooldown not met', async () => {
      const email = 'test@example.com';
      const updateProfileDto = { username: 'newusername' };

      const recentChangeDate = new Date();
      recentChangeDate.setDate(recentChangeDate.getDate() - 10); // 10 days ago

      const userWithRecentChange = {
        id: 'user-123',
        props: {
          ...mockExistingUser.props,
          lastUsernameChangeAt: recentChangeDate,
        },
      };

      mockUserRepository.findByEmail.mockResolvedValue(
        userWithRecentChange as any,
      );

      await expect(
        service.updateProfile(email, updateProfileDto as any),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateProfile(email, updateProfileDto as any),
      ).rejects.toThrow('You can change your username again in 20 days');
    });
  });

  describe('updatePreferences', () => {
    it('should successfully create new preferences', async () => {
      const email = 'test@example.com';
      const updatePreferencesDto = {
        enableAI: true,
        aiAggressiveness: 0.8,
        shareAnalytics: true,
      };

      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-123',
        props: { id: 'user-123' },
      } as any);

      const createdPreferences = {
        userId: 'user-123',
        ...updatePreferencesDto,
        morningEnergy: 'HIGH',
        afternoonEnergy: 'MEDIUM',
        eveningEnergy: 'LOW',
        taskRemindersEmail: true,
        weeklyDigestEmail: true,
        marketingEmail: false,
        completedTasksRetention: 30,
        timeSessionsRetention: 90,
      };
      mockPrismaService.userPreferences.upsert.mockResolvedValue(
        createdPreferences as any,
      );

      const result = await service.updatePreferences(
        email,
        updatePreferencesDto as any,
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockPrismaService.userPreferences.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        create: { userId: 'user-123', ...updatePreferencesDto },
        update: updatePreferencesDto,
      });
      expect(result.success).toBe(true);
      expect(result.preferences).toEqual(
        expect.objectContaining(updatePreferencesDto),
      );
    });

    it('should successfully update existing preferences', async () => {
      const email = 'test@example.com';
      const updatePreferencesDto = {
        enableAI: false,
        shareAnalytics: false,
      };

      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-123',
        props: { id: 'user-123' },
      } as any);

      const updatedPreferences = {
        userId: 'user-123',
        ...updatePreferencesDto,
        aiAggressiveness: 0.5,
        morningEnergy: 'MEDIUM',
        afternoonEnergy: 'LOW',
        eveningEnergy: 'LOW',
        taskRemindersEmail: true,
        weeklyDigestEmail: false,
        marketingEmail: false,
        completedTasksRetention: 30,
        timeSessionsRetention: 90,
      };
      mockPrismaService.userPreferences.upsert.mockResolvedValue(
        updatedPreferences as any,
      );

      const result = await service.updatePreferences(
        email,
        updatePreferencesDto as any,
      );

      expect(result.success).toBe(true);
      expect(result.preferences.enableAI).toBe(false);
      expect(result.preferences.shareAnalytics).toBe(false);
    });

    it('should throw NotFoundException when user not found', async () => {
      const email = 'nonexistent@example.com';
      const updatePreferencesDto = { enableAI: true };

      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.updatePreferences(email, updatePreferencesDto as any),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updatePreferences(email, updatePreferencesDto as any),
      ).rejects.toThrow('User not found');
    });
  });

  describe('getIntegrations', () => {
    const mockIntegrations = [
      {
        id: 'integration-1',
        provider: 'GOOGLE',
        isActive: true,
        providerEmail: 'test@gmail.com',
        lastSyncAt: new Date(),
        createdAt: new Date(),
      },
      {
        id: 'integration-2',
        provider: 'GITHUB',
        isActive: false,
        providerEmail: 'test@github.com',
        lastSyncAt: null,
        createdAt: new Date(),
      },
    ];

    it('should successfully get user integrations', async () => {
      const email = 'test@example.com';

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
        integrations: mockIntegrations,
      } as any);

      const result = await service.getIntegrations(email);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        select: expect.any(Object),
      });
      expect(result).toHaveLength(2);
      expect(result[0].provider).toBe('GOOGLE');
      expect(result[1].provider).toBe('GITHUB');
    });

    it('should return empty array when no integrations', async () => {
      const email = 'test@example.com';

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
        integrations: [],
      } as any);

      const result = await service.getIntegrations(email);

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when user not found', async () => {
      const email = 'nonexistent@example.com';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getIntegrations(email)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getIntegrations(email)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('deleteAccount', () => {
    it('should successfully delete user account', async () => {
      const email = 'test@example.com';

      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-123',
      } as any);
      mockUserRepository.delete.mockResolvedValue(undefined);

      const result = await service.deleteAccount(email);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockUserRepository.delete).toHaveBeenCalledWith('user-123');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Account deleted successfully');
    });

    it('should throw NotFoundException when user not found', async () => {
      const email = 'nonexistent@example.com';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.deleteAccount(email)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.deleteAccount(email)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('exportData', () => {
    const mockExportData = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      phone: '+1234567890',
      jobTitle: 'Developer',
      department: 'Engineering',
      bio: 'Software developer',
      timezone: 'America/New_York',
      locale: 'en',
      createdAt: new Date(),
      preferences: { enableAI: true },
      subscription: { plan: 'PRO' },
      integrations: [],
      workspaces: [
        {
          workspace: { name: 'My Workspace' },
          role: 'OWNER',
          joinedAt: new Date(),
        },
      ],
      ownedTasks: [{ id: 'task-1', title: 'Task 1' }],
      activities: [{ id: 'activity-1', action: 'CREATED' }],
    };

    it('should successfully export user data', async () => {
      const email = 'test@example.com';

      mockPrismaService.user.findUnique.mockResolvedValue(
        mockExportData as any,
      );

      const result = await service.exportData(email);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: expect.any(Object),
      });
      expect(result).toHaveProperty('profile');
      expect(result).toHaveProperty('preferences');
      expect(result).toHaveProperty('subscription');
      expect(result).toHaveProperty('integrations');
      expect(result).toHaveProperty('workspaces');
      expect(result).toHaveProperty('tasks');
      expect(result).toHaveProperty('activities');
      expect(result).toHaveProperty('exportedAt');
      expect(result.profile.email).toBe(email);
      expect(result.workspaces).toHaveLength(1);
      expect(result.workspaces[0].role).toBe('OWNER');
    });

    it('should limit exported tasks and activities', async () => {
      const email = 'test@example.com';

      mockPrismaService.user.findUnique.mockResolvedValue(
        mockExportData as any,
      );

      const result = await service.exportData(email);

      // Verify the include configuration has limits
      const includeConfig =
        mockPrismaService.user.findUnique.mock.calls[0][0].include;
      expect(includeConfig.ownedTasks).toEqual({ take: 1000 });
      expect(includeConfig.activities).toEqual({ take: 1000 });
    });

    it('should throw NotFoundException when user not found', async () => {
      const email = 'nonexistent@example.com';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.exportData(email)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.exportData(email)).rejects.toThrow('User not found');
    });
  });
});
