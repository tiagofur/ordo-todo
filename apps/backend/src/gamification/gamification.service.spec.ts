import { Test, TestingModule } from '@nestjs/testing';
import { GamificationService } from './gamification.service';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Achievement, UserAchievement } from '@ordo-todo/core';
import type { IGamificationRepository } from '@ordo-todo/core';

describe('GamificationService', () => {
  let service: GamificationService;
  let gamificationRepository: jest.Mocked<IGamificationRepository>;
  let prisma: any;

  const mockNotificationsService = {
    create: jest.fn(),
  };

  const mockPrisma = {
    client: {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      task: {
        count: jest.fn(),
      },
      timeSession: {
        count: jest.fn(),
      },
    },
  };

  const mockAchievement = new Achievement({
    id: 'ach-1',
    code: 'FIRST_TASK',
    name: 'First Task',
    description: 'Complete one task',
    icon: 'icon',
    xpReward: 100,
  });

  let mockUserRepository: any;
  let mockAnalyticsRepository: any;

  beforeEach(async () => {
    gamificationRepository = {
      findAchievementByCode: jest.fn(),
      findAchievementById: jest.fn(),
      findAllAchievements: jest.fn(),
      createAchievement: jest.fn(),
      hasUnlocked: jest.fn(),
      unlockAchievement: jest.fn(),
      findUserAchievements: jest.fn(),
    } as any;

    mockUserRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      updateXpAndLevel: jest.fn().mockResolvedValue({}),
    };

    mockAnalyticsRepository = {
      countTasks: jest.fn().mockResolvedValue(1),
      getProductivityStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationService,
        { provide: 'GamificationRepository', useValue: gamificationRepository },
        { provide: 'UserRepository', useValue: mockUserRepository },
        {
          provide: 'TimerRepository',
          useValue: { findActiveByUserId: jest.fn(), findByUserId: jest.fn() },
        },
        { provide: 'AnalyticsRepository', useValue: mockAnalyticsRepository },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<GamificationService>(GamificationService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateLevel', () => {
    it('should calculate level based on XP', () => {
      // Level = floor(sqrt(XP / 100)) + 1
      expect(service.calculateLevel(0)).toBe(1);
      expect(service.calculateLevel(100)).toBe(2);
      expect(service.calculateLevel(400)).toBe(3);
    });
  });

  describe('addXp', () => {
    it('should add XP to user and update level', async () => {
      prisma.client.user.findUnique.mockResolvedValue({
        xp: 50,
        level: 1,
      });

      await service.addXp('user-123', 50, 'Test');

      expect(mockUserRepository.updateXpAndLevel).toHaveBeenCalledWith(
        'user-123',
        100,
        2,
      );
    });

    it('should handle level up and send notification', async () => {
      prisma.client.user.findUnique.mockResolvedValue({
        xp: 50,
        level: 1,
      });

      await service.addXp('user-123', 100, 'Test');

      expect(mockNotificationsService.create).toHaveBeenCalled();
    });
  });

  describe('awardTaskCompletion', () => {
    it('should add XP for task completion', async () => {
      prisma.client.user.findUnique.mockResolvedValue({ xp: 0, level: 1 });
      gamificationRepository.findAchievementByCode.mockResolvedValue(
        mockAchievement,
      );
      gamificationRepository.hasUnlocked.mockResolvedValue(true);

      await service.awardTaskCompletion('user-123');

      expect(mockUserRepository.updateXpAndLevel).toHaveBeenCalledWith(
        'user-123',
        50,
        1,
      );
    });
  });

  describe('unlockAchievement', () => {
    it('should unlock achievement if not already unlocked', async () => {
      const userId = 'user-123';

      gamificationRepository.findAchievementByCode.mockResolvedValue(
        mockAchievement,
      );
      gamificationRepository.hasUnlocked.mockResolvedValue(false);
      gamificationRepository.unlockAchievement.mockResolvedValue({} as any);

      // Mock addXp dependencies
      prisma.client.user.findUnique.mockResolvedValue({ xp: 0, level: 1 });

      await service.awardTaskCompletion(userId);

      expect(gamificationRepository.unlockAchievement).toHaveBeenCalled();
      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '¡Logro Desbloqueado!',
        }),
      );
    });
  });
});
