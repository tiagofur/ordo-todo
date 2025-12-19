import { Test, TestingModule } from '@nestjs/testing';
import { GamificationService } from './gamification.service';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('GamificationService', () => {
  let service: GamificationService;
  let prisma: jest.Mocked<PrismaService>;

  const mockNotificationsService = {
    create: jest.fn(),
    sendToUser: jest.fn(),
    emitToUser: jest.fn(),
  };

  const mockPrisma = {
    achievement: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    userAchievement: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    task: {
      count: jest.fn(),
    },
    timeSession: {
      aggregate: jest.fn(),
      count: jest.fn(),
    },
    dailyMetrics: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<GamificationService>(GamificationService);
    prisma = module.get<PrismaService>(
      PrismaService,
    ) as jest.Mocked<PrismaService>;
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
      expect(service.calculateLevel(900)).toBe(4);
    });
  });

  describe('addXp', () => {
    it('should add XP to user and update level', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        xp: 50,
        level: 1,
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-123',
        xp: 100,
        level: 2,
      });

      await service.addXp('user-123', 50, 'Test');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: { xp: true, level: true },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          xp: 100,
          level: expect.any(Number),
        },
      });
    });

    it('should handle level up and send notification', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        xp: 50,
        level: 1,
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      await service.addXp('user-123', 100, 'Test');

      // When leveling up, notification should be created
      expect(mockNotificationsService.create).toHaveBeenCalled();
    });

    it('should not fail if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.addXp('user-123', 50, 'Test'),
      ).resolves.not.toThrow();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('awardTaskCompletion', () => {
    it('should add XP for task completion', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        xp: 0,
        level: 1,
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({});
      (prisma.task.count as jest.Mock).mockResolvedValue(1);
      (prisma.achievement.findUnique as jest.Mock).mockResolvedValue(null);

      await service.awardTaskCompletion('user-123');

      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe('awardPomodoroCompletion', () => {
    it('should add XP for pomodoro completion', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        xp: 0,
        level: 1,
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({});
      (prisma.timeSession.count as jest.Mock).mockResolvedValue(1);
      (prisma.achievement.findUnique as jest.Mock).mockResolvedValue(null);

      await service.awardPomodoroCompletion('user-123');

      expect(prisma.user.update).toHaveBeenCalled();
    });
  });
});
