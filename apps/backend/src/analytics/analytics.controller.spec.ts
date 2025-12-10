import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsController', () => {
    let controller: AnalyticsController;
    let analyticsService: jest.Mocked<AnalyticsService>;

    const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test' };

    beforeEach(async () => {
        const mockAnalyticsService = {
            getDailyMetrics: jest.fn(),
            getWeeklyMetrics: jest.fn(),
            getMonthlyMetrics: jest.fn(),
            getProductivityTrends: jest.fn(),
            getTaskCompletionRate: jest.fn(),
            getTimeDistribution: jest.fn(),
            getPeakHours: jest.fn(),
            getStreak: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AnalyticsController],
            providers: [
                { provide: AnalyticsService, useValue: mockAnalyticsService },
            ],
        }).compile();

        controller = module.get<AnalyticsController>(AnalyticsController);
        analyticsService = module.get<AnalyticsService>(AnalyticsService) as jest.Mocked<AnalyticsService>;
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getDailyMetrics', () => {
        it('should return daily metrics for date range', async () => {
            const mockMetrics = [
                { date: '2024-01-01', tasksCompleted: 5, minutesWorked: 120 },
                { date: '2024-01-02', tasksCompleted: 3, minutesWorked: 90 },
            ];
            analyticsService.getDailyMetrics.mockResolvedValue(mockMetrics as any);

            const result = await controller.getDailyMetrics(mockUser, '2024-01-01', '2024-01-31');

            expect(analyticsService.getDailyMetrics).toHaveBeenCalledWith(
                mockUser.id,
                expect.any(Date),
                expect.any(Date),
            );
            expect(result).toEqual(mockMetrics);
        });
    });

    describe('getWeeklyMetrics', () => {
        it('should return weekly aggregated metrics', async () => {
            const mockMetrics = {
                totalTasks: 25,
                totalMinutes: 600,
                avgTasksPerDay: 5,
                completionRate: 85,
            };
            analyticsService.getWeeklyMetrics.mockResolvedValue(mockMetrics);

            const result = await controller.getWeeklyMetrics(mockUser, '2024-01-01');

            expect(analyticsService.getWeeklyMetrics).toHaveBeenCalledWith(
                mockUser.id,
                expect.any(Date),
            );
            expect(result).toEqual(mockMetrics);
        });
    });

    describe('getMonthlyMetrics', () => {
        it('should return monthly aggregated metrics', async () => {
            const mockMetrics = {
                totalTasks: 100,
                totalMinutes: 2400,
                avgTasksPerDay: 4,
                daysWorked: 22,
            };
            analyticsService.getMonthlyMetrics.mockResolvedValue(mockMetrics);

            const result = await controller.getMonthlyMetrics(mockUser, '2024-01');

            expect(analyticsService.getMonthlyMetrics).toHaveBeenCalledWith(
                mockUser.id,
                expect.any(Date),
            );
            expect(result).toEqual(mockMetrics);
        });
    });

    describe('getProductivityTrends', () => {
        it('should return productivity trends', async () => {
            const mockTrends = {
                weeklyTrend: 'IMPROVING',
                monthlyTrend: 'STABLE',
                comparison: { lastWeek: 80, thisWeek: 85 },
            };
            analyticsService.getProductivityTrends.mockResolvedValue(mockTrends);

            const result = await controller.getProductivityTrends(mockUser);

            expect(analyticsService.getProductivityTrends).toHaveBeenCalledWith(mockUser.id);
            expect(result).toEqual(mockTrends);
        });
    });

    describe('getTaskCompletionRate', () => {
        it('should return task completion statistics', async () => {
            const mockRate = {
                overall: 75,
                byPriority: { HIGH: 90, MEDIUM: 70, LOW: 60 },
                byProject: [{ projectId: 'p1', rate: 80 }],
            };
            analyticsService.getTaskCompletionRate.mockResolvedValue(mockRate);

            const result = await controller.getTaskCompletionRate(mockUser);

            expect(analyticsService.getTaskCompletionRate).toHaveBeenCalledWith(mockUser.id);
            expect(result).toEqual(mockRate);
        });
    });

    describe('getTimeDistribution', () => {
        it('should return time distribution by category', async () => {
            const mockDistribution = [
                { category: 'Development', minutes: 300, percentage: 50 },
                { category: 'Meetings', minutes: 120, percentage: 20 },
                { category: 'Planning', minutes: 180, percentage: 30 },
            ];
            analyticsService.getTimeDistribution.mockResolvedValue(mockDistribution);

            const result = await controller.getTimeDistribution(mockUser, '2024-01-01', '2024-01-31');

            expect(analyticsService.getTimeDistribution).toHaveBeenCalledWith(
                mockUser.id,
                expect.any(Date),
                expect.any(Date),
            );
            expect(result).toEqual(mockDistribution);
        });
    });

    describe('getPeakHours', () => {
        it('should return peak productivity hours', async () => {
            const mockPeakHours = {
                hours: [9, 10, 11, 14, 15],
                bestDay: 'Tuesday',
                heatmap: [],
            };
            analyticsService.getPeakHours.mockResolvedValue(mockPeakHours);

            const result = await controller.getPeakHours(mockUser);

            expect(analyticsService.getPeakHours).toHaveBeenCalledWith(mockUser.id);
            expect(result).toEqual(mockPeakHours);
        });
    });

    describe('getStreak', () => {
        it('should return streak information', async () => {
            const mockStreak = {
                current: 7,
                longest: 15,
                lastActiveDate: '2024-01-15',
            };
            analyticsService.getStreak.mockResolvedValue(mockStreak);

            const result = await controller.getStreak(mockUser);

            expect(analyticsService.getStreak).toHaveBeenCalledWith(mockUser.id);
            expect(result).toEqual(mockStreak);
        });
    });
});
