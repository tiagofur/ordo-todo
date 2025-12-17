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
      getDateRangeMetrics: jest.fn(),
      getDashboardStats: jest.fn(),
      getHeatmapData: jest.fn(),
      getProjectTimeDistribution: jest.fn(),
      getTaskStatusDistribution: jest.fn(),
      getProductivityStreak: jest.fn(),
      getTeamMetrics: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        { provide: AnalyticsService, useValue: mockAnalyticsService },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    analyticsService = module.get<AnalyticsService>(
      AnalyticsService,
    ) as jest.Mocked<AnalyticsService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDailyMetrics', () => {
    it('should return daily metrics for a single date', async () => {
      const mockMetrics = { tasksCompleted: 5, minutesWorked: 120 };
      analyticsService.getDailyMetrics.mockResolvedValue(mockMetrics as any);

      const result = await controller.getDailyMetrics(
        mockUser,
        '2024-01-15',
        undefined,
        undefined,
      );

      expect(analyticsService.getDailyMetrics).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(Date),
      );
      expect(result).toEqual(mockMetrics);
    });

    it('should return date range metrics when startDate is provided', async () => {
      const mockMetrics = [
        { date: '2024-01-01', tasksCompleted: 5, minutesWorked: 120 },
        { date: '2024-01-02', tasksCompleted: 3, minutesWorked: 90 },
      ];
      analyticsService.getDateRangeMetrics.mockResolvedValue(mockMetrics as any);

      const result = await controller.getDailyMetrics(
        mockUser,
        undefined,
        '2024-01-01',
        '2024-01-31',
      );

      expect(analyticsService.getDateRangeMetrics).toHaveBeenCalledWith(
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

  describe('getDateRangeMetrics', () => {
    it('should return date range metrics', async () => {
      const mockMetrics = [
        { date: '2024-01-01', tasksCompleted: 5 },
        { date: '2024-01-02', tasksCompleted: 3 },
      ];
      analyticsService.getDateRangeMetrics.mockResolvedValue(mockMetrics as any);

      const result = await controller.getDateRangeMetrics(
        mockUser,
        '2024-01-01',
        '2024-01-31',
      );

      expect(analyticsService.getDateRangeMetrics).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(Date),
        expect.any(Date),
      );
      expect(result).toEqual(mockMetrics);
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const mockStats = {
        tasksCompleted: 10,
        tasksInProgress: 5,
        overdue: 2,
      };
      analyticsService.getDashboardStats.mockResolvedValue(mockStats);

      const result = await controller.getDashboardStats(mockUser);

      expect(analyticsService.getDashboardStats).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(result).toEqual(mockStats);
    });
  });

  describe('getHeatmap', () => {
    it('should return heatmap data', async () => {
      const mockHeatmap = [
        { date: '2024-01-01', count: 5 },
        { date: '2024-01-02', count: 3 },
      ];
      analyticsService.getHeatmapData.mockResolvedValue(mockHeatmap);

      const result = await controller.getHeatmap(mockUser);

      expect(analyticsService.getHeatmapData).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockHeatmap);
    });
  });

  describe('getProjectDistribution', () => {
    it('should return project distribution data', async () => {
      const mockDistribution = [
        { projectId: 'p1', projectName: 'Project 1', minutes: 300 },
        { projectId: 'p2', projectName: 'Project 2', minutes: 200 },
      ];
      analyticsService.getProjectTimeDistribution.mockResolvedValue(mockDistribution);

      const result = await controller.getProjectDistribution(mockUser);

      expect(analyticsService.getProjectTimeDistribution).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(result).toEqual(mockDistribution);
    });
  });

  describe('getTaskStatusDistribution', () => {
    it('should return task status distribution data', async () => {
      const mockDistribution = [
        { status: 'TODO', count: 10 },
        { status: 'IN_PROGRESS', count: 5 },
        { status: 'DONE', count: 20 },
      ];
      analyticsService.getTaskStatusDistribution.mockResolvedValue(mockDistribution);

      const result = await controller.getTaskStatusDistribution(mockUser);

      expect(analyticsService.getTaskStatusDistribution).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(result).toEqual(mockDistribution);
    });
  });

  describe('getProductivityStreak', () => {
    it('should return streak information', async () => {
      const mockStreak = {
        current: 7,
        longest: 15,
        lastActiveDate: '2024-01-15',
      };
      analyticsService.getProductivityStreak.mockResolvedValue(mockStreak);

      const result = await controller.getProductivityStreak(mockUser);

      expect(analyticsService.getProductivityStreak).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(result).toEqual(mockStreak);
    });
  });

  describe('getTeamMetrics', () => {
    it('should return team metrics for a workspace', async () => {
      const mockTeamMetrics = {
        totalTasks: 50,
        completedTasks: 30,
        members: [],
      };
      analyticsService.getTeamMetrics.mockResolvedValue(mockTeamMetrics);

      const result = await controller.getTeamMetrics(
        'workspace-123',
        '2024-01-01',
        '2024-01-31',
      );

      expect(analyticsService.getTeamMetrics).toHaveBeenCalledWith(
        'workspace-123',
        expect.any(Date),
        expect.any(Date),
      );
      expect(result).toEqual(mockTeamMetrics);
    });
  });
});
