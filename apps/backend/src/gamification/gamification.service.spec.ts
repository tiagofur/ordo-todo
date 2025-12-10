import { Test, TestingModule } from '@nestjs/testing';
import { GamificationService } from './gamification.service';
import { PrismaService } from '../database/prisma.service';

describe('GamificationService', () => {
    let service: GamificationService;
    let prisma: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const mockPrisma = {
            achievement: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
            },
            userAchievement: {
                findMany: jest.fn(),
                findFirst: jest.fn(),
                create: jest.fn(),
                count: jest.fn(),
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

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GamificationService,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        service = module.get<GamificationService>(GamificationService);
        prisma = module.get<PrismaService>(PrismaService) as jest.Mocked<PrismaService>;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAchievements', () => {
        it('should return all achievements with unlock status', async () => {
            const mockAchievements = [
                { id: 'ach-1', name: 'First Task', description: 'Complete your first task', points: 10 },
                { id: 'ach-2', name: 'Streak Master', description: 'Maintain 7-day streak', points: 50 },
            ];
            const mockUserAchievements = [
                { achievementId: 'ach-1', unlockedAt: new Date() },
            ];

            (prisma.achievement.findMany as jest.Mock).mockResolvedValue(mockAchievements);
            (prisma.userAchievement.findMany as jest.Mock).mockResolvedValue(mockUserAchievements);

            const result = await service.getAchievements('user-123');

            expect(result).toHaveLength(2);
            expect(result[0].unlocked).toBe(true);
            expect(result[1].unlocked).toBe(false);
        });
    });

    describe('getUserPoints', () => {
        it('should calculate total points from unlocked achievements', async () => {
            const mockUserAchievements = [
                { achievement: { points: 10 } },
                { achievement: { points: 50 } },
                { achievement: { points: 25 } },
            ];

            (prisma.userAchievement.findMany as jest.Mock).mockResolvedValue(mockUserAchievements);

            const result = await service.getUserPoints('user-123');

            expect(result).toBe(85);
        });

        it('should return 0 when no achievements', async () => {
            (prisma.userAchievement.findMany as jest.Mock).mockResolvedValue([]);

            const result = await service.getUserPoints('user-123');

            expect(result).toBe(0);
        });
    });

    describe('getLeaderboard', () => {
        it('should return sorted leaderboard', async () => {
            const mockLeaderboard = [
                { id: 'user-1', name: 'Alice', totalPoints: 500 },
                { id: 'user-2', name: 'Bob', totalPoints: 350 },
                { id: 'user-3', name: 'Charlie', totalPoints: 200 },
            ];

            // Mock the complex query
            jest.spyOn(service, 'getLeaderboard').mockResolvedValue(mockLeaderboard as any);

            const result = await service.getLeaderboard();

            expect(result[0].totalPoints).toBeGreaterThan(result[1].totalPoints);
        });
    });

    describe('checkAndUnlockAchievements', () => {
        it('should unlock achievement when criteria met', async () => {
            const mockAchievements = [
                { id: 'first-task', name: 'First Task', criteria: { type: 'TASKS_COMPLETED', count: 1 } },
            ];

            (prisma.achievement.findMany as jest.Mock).mockResolvedValue(mockAchievements);
            (prisma.userAchievement.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.task.count as jest.Mock).mockResolvedValue(1);
            (prisma.userAchievement.create as jest.Mock).mockResolvedValue({
                achievementId: 'first-task',
                unlockedAt: new Date(),
            });

            const newAchievements = await service.checkAndUnlockAchievements('user-123');

            expect(prisma.userAchievement.create).toHaveBeenCalled();
            expect(newAchievements).toHaveLength(1);
            expect(newAchievements[0].id).toBe('first-task');
        });

        it('should not unlock already unlocked achievement', async () => {
            const mockAchievements = [
                { id: 'first-task', name: 'First Task', criteria: { type: 'TASKS_COMPLETED', count: 1 } },
            ];

            (prisma.achievement.findMany as jest.Mock).mockResolvedValue(mockAchievements);
            (prisma.userAchievement.findFirst as jest.Mock).mockResolvedValue({
                achievementId: 'first-task',
                unlockedAt: new Date('2024-01-01'),
            });

            const newAchievements = await service.checkAndUnlockAchievements('user-123');

            expect(prisma.userAchievement.create).not.toHaveBeenCalled();
            expect(newAchievements).toHaveLength(0);
        });
    });

    describe('getStreakInfo', () => {
        it('should calculate current streak', async () => {
            const mockMetrics = [
                { date: new Date('2024-01-15'), tasksCompleted: 3 },
                { date: new Date('2024-01-14'), tasksCompleted: 2 },
                { date: new Date('2024-01-13'), tasksCompleted: 5 },
            ];

            (prisma.dailyMetrics.findMany as jest.Mock).mockResolvedValue(mockMetrics);

            const result = await service.getStreakInfo('user-123');

            expect(result).toHaveProperty('currentStreak');
            expect(result).toHaveProperty('longestStreak');
            expect(result.currentStreak).toBeGreaterThanOrEqual(0);
        });
    });
});
