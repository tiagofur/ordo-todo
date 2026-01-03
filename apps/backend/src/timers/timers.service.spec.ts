import { Test, TestingModule } from '@nestjs/testing';
import { TimersService } from './timers.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { GamificationService } from '../gamification/gamification.service';
import {
  StartTimerUseCase,
  StopTimerUseCase,
  PauseTimerUseCase,
  ResumeTimerUseCase,
  SwitchTaskUseCase,
  UpdateDailyMetricsUseCase,
  CalculateFocusScoreUseCase,
  LearnFromSessionUseCase,
} from '@ordo-todo/core';

describe('TimersService', () => {
  let service: TimersService;
  let gamificationService: GamificationService;

  const mockTimerRepository = {
    findActiveSession: jest.fn(),
    findWithFilters: jest.fn(),
    getTaskTimeStats: jest.fn(),
    getStats: jest.fn(),
    findByUserIdAndDateRange: jest.fn(),
    save: jest.fn(),
  };

  const mockTaskRepository = {
    findById: jest.fn(),
  };

  const mockAnalyticsRepository = {
    findByDate: jest.fn(),
    save: jest.fn(),
  };

  const mockAIProfileRepository = {
    findByUserId: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
  };

  const mockGamificationService = {
    awardPomodoroCompletion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimersService,
        {
          provide: 'TimerRepository',
          useValue: mockTimerRepository,
        },
        {
          provide: 'TaskRepository',
          useValue: mockTaskRepository,
        },
        {
          provide: 'AnalyticsRepository',
          useValue: mockAnalyticsRepository,
        },
        {
          provide: 'AIProfileRepository',
          useValue: mockAIProfileRepository,
        },
        {
          provide: GamificationService,
          useValue: mockGamificationService,
        },
      ],
    }).compile();

    service = module.get<TimersService>(TimersService);
    gamificationService = module.get<GamificationService>(GamificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('start', () => {
    it('should successfully start a WORK timer session', async () => {
      const userId = 'user-123';
      const startTimerDto = {
        taskId: 'task-123',
        type: 'WORK',
        notes: 'Focus on documentation',
      };

      const mockSession = {
        props: {
          id: 'session-123',
          userId: userId,
          taskId: 'task-123',
          type: 'WORK',
          startedAt: new Date(),
          notes: 'Focus on documentation',
        },
      };

      const executeSpy = jest.spyOn(StartTimerUseCase.prototype, 'execute');
      executeSpy.mockResolvedValue(mockSession as any);

      const result = await service.start(startTimerDto as any, userId);

      expect(executeSpy).toHaveBeenCalledWith(userId, 'task-123', 'WORK');
      expect(result).toEqual(mockSession.props);
    });

    it('should successfully start a POMODORO timer session', async () => {
      const userId = 'user-123';
      const startTimerDto = {
        taskId: 'task-123',
        type: 'POMODORO',
      };

      const mockSession = {
        props: {
          id: 'session-123',
          userId: userId,
          taskId: 'task-123',
          type: 'POMODORO',
          startedAt: new Date(),
        },
      };

      const executeSpy = jest.spyOn(StartTimerUseCase.prototype, 'execute');
      executeSpy.mockResolvedValue(mockSession as any);

      const result = await service.start(startTimerDto as any, userId);

      expect(executeSpy).toHaveBeenCalledWith(userId, 'task-123', 'POMODORO');
      expect(result).toEqual(mockSession.props);
    });

    it('should default to WORK type when not specified', async () => {
      const userId = 'user-123';
      const startTimerDto = {
        taskId: 'task-123',
      };

      const mockSession = {
        props: {
          id: 'session-123',
          userId: userId,
          taskId: 'task-123',
          type: 'WORK',
          startedAt: new Date(),
        },
      };

      const executeSpy = jest.spyOn(StartTimerUseCase.prototype, 'execute');
      executeSpy.mockResolvedValue(mockSession as any);

      const result = await service.start(startTimerDto as any, userId);

      expect(executeSpy).toHaveBeenCalledWith(userId, 'task-123', 'WORK');
    });
  });

  describe('stop', () => {
    it('should successfully stop a WORK session and track metrics', async () => {
      const userId = 'user-123';
      const stopTimerDto = {
        sessionId: 'session-123',
        wasCompleted: true,
        notes: 'Completed successfully',
      };

      const mockSession = {
        props: {
          id: 'session-123',
          userId: userId,
          type: 'WORK',
          duration: 25,
          totalPauseTime: 180,
          pauseCount: 2,
          endedAt: new Date(),
          wasCompleted: true,
        },
      };

      const executeSpy = jest.spyOn(StopTimerUseCase.prototype, 'execute');
      executeSpy.mockResolvedValue(mockSession as any);

      const updateMetricsSpy = jest.spyOn(
        UpdateDailyMetricsUseCase.prototype,
        'execute',
      );
      updateMetricsSpy.mockResolvedValue({} as any);

      mockAnalyticsRepository.save = jest.fn().mockResolvedValue(undefined);

      const learnFromSessionSpy = jest.spyOn(
        LearnFromSessionUseCase.prototype,
        'execute',
      );
      learnFromSessionSpy.mockResolvedValue(undefined);

      mockGamificationService.awardPomodoroCompletion = jest
        .fn()
        .mockResolvedValue(undefined);

      const result = await service.stop(stopTimerDto as any, userId);

      expect(executeSpy).toHaveBeenCalledWith(userId, true);
      expect(updateMetricsSpy).toHaveBeenCalled();
      expect(learnFromSessionSpy).toHaveBeenCalled();
      expect(
        mockGamificationService.awardPomodoroCompletion,
      ).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockSession.props);
    });

    it('should successfully stop a CONTINUOUS session and track metrics', async () => {
      const userId = 'user-123';
      const stopTimerDto = {
        sessionId: 'session-123',
        wasCompleted: true,
      };

      const mockSession = {
        props: {
          id: 'session-123',
          userId: userId,
          type: 'CONTINUOUS',
          duration: 60,
          totalPauseTime: 0,
          pauseCount: 0,
          endedAt: new Date(),
          wasCompleted: true,
        },
      };

      const executeSpy = jest.spyOn(StopTimerUseCase.prototype, 'execute');
      executeSpy.mockResolvedValue(mockSession as any);

      const updateMetricsSpy = jest.spyOn(
        UpdateDailyMetricsUseCase.prototype,
        'execute',
      );
      updateMetricsSpy.mockResolvedValue({} as any);

      mockAnalyticsRepository.save = jest.fn().mockResolvedValue(undefined);

      const learnFromSessionSpy = jest.spyOn(
        LearnFromSessionUseCase.prototype,
        'execute',
      );
      learnFromSessionSpy.mockResolvedValue(undefined);

      const result = await service.stop(stopTimerDto as any, userId);

      expect(updateMetricsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          pomodorosCompleted: 0, // CONTINUOUS doesn't count as pomodoro
        }),
      );
      expect(result).toEqual(mockSession.props);
    });

    it('should successfully stop a SHORT_BREAK session and track metrics', async () => {
      const userId = 'user-123';
      const stopTimerDto = {
        sessionId: 'session-123',
        wasCompleted: true,
      };

      const mockSession = {
        props: {
          id: 'session-123',
          userId: userId,
          type: 'SHORT_BREAK',
          duration: 5,
          endedAt: new Date(),
          wasCompleted: true,
        },
      };

      const executeSpy = jest.spyOn(StopTimerUseCase.prototype, 'execute');
      executeSpy.mockResolvedValue(mockSession as any);

      const updateMetricsSpy = jest.spyOn(
        UpdateDailyMetricsUseCase.prototype,
        'execute',
      );
      updateMetricsSpy.mockResolvedValue({} as any);

      mockAnalyticsRepository.save = jest.fn().mockResolvedValue(undefined);

      const result = await service.stop(stopTimerDto as any, userId);

      expect(updateMetricsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          shortBreaksCompleted: 1,
        }),
      );
      expect(result).toEqual(mockSession.props);
    });

    it('should successfully stop a LONG_BREAK session and track metrics', async () => {
      const userId = 'user-123';
      const stopTimerDto = {
        sessionId: 'session-123',
        wasCompleted: true,
      };

      const mockSession = {
        props: {
          id: 'session-123',
          userId: userId,
          type: 'LONG_BREAK',
          duration: 15,
          endedAt: new Date(),
          wasCompleted: true,
        },
      };

      const executeSpy = jest.spyOn(StopTimerUseCase.prototype, 'execute');
      executeSpy.mockResolvedValue(mockSession as any);

      const updateMetricsSpy = jest.spyOn(
        UpdateDailyMetricsUseCase.prototype,
        'execute',
      );
      updateMetricsSpy.mockResolvedValue({} as any);

      mockAnalyticsRepository.save = jest.fn().mockResolvedValue(undefined);

      const result = await service.stop(stopTimerDto as any, userId);

      expect(updateMetricsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          longBreaksCompleted: 1,
        }),
      );
      expect(result).toEqual(mockSession.props);
    });

    it('should not track metrics when session not completed', async () => {
      const userId = 'user-123';
      const stopTimerDto = {
        sessionId: 'session-123',
        wasCompleted: false,
      };

      const mockSession = {
        props: {
          id: 'session-123',
          userId: userId,
          type: 'WORK',
          duration: 10,
          endedAt: new Date(),
          wasCompleted: false,
        },
      };

      const executeSpy = jest.spyOn(StopTimerUseCase.prototype, 'execute');
      executeSpy.mockResolvedValue(mockSession as any);

      const updateMetricsSpy = jest.spyOn(
        UpdateDailyMetricsUseCase.prototype,
        'execute',
      );

      const result = await service.stop(stopTimerDto as any, userId);

      expect(executeSpy).toHaveBeenCalledWith(userId, false);
      expect(updateMetricsSpy).not.toHaveBeenCalled();
      expect(result).toEqual(mockSession.props);
    });

    it('should handle learning failure gracefully', async () => {
      const userId = 'user-123';
      const stopTimerDto = {
        sessionId: 'session-123',
        wasCompleted: true,
      };

      const mockSession = {
        props: {
          id: 'session-123',
          userId: userId,
          type: 'WORK',
          duration: 25,
          totalPauseTime: 0,
          pauseCount: 0,
          endedAt: new Date(),
          wasCompleted: true,
        },
      };

      const executeSpy = jest.spyOn(StopTimerUseCase.prototype, 'execute');
      executeSpy.mockResolvedValue(mockSession as any);

      const updateMetricsSpy = jest.spyOn(
        UpdateDailyMetricsUseCase.prototype,
        'execute',
      );
      updateMetricsSpy.mockResolvedValue({} as any);

      mockAnalyticsRepository.save = jest.fn().mockResolvedValue(undefined);

      const learnFromSessionSpy = jest.spyOn(
        LearnFromSessionUseCase.prototype,
        'execute',
      );
      learnFromSessionSpy.mockRejectedValue(new Error('Learning failed'));

      mockGamificationService.awardPomodoroCompletion = jest
        .fn()
        .mockResolvedValue(undefined);

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await service.stop(stopTimerDto as any, userId);

      expect(executeSpy).toHaveBeenCalled();
      expect(updateMetricsSpy).toHaveBeenCalled();
      expect(learnFromSessionSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to learn from session:',
        expect.any(Error),
      );
      expect(result).toEqual(mockSession.props);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('pause', () => {
    it('should successfully pause a timer', async () => {
      const userId = 'user-123';
      const pauseTimerDto = {
        pauseStartedAt: new Date(),
      };

      const mockSession = {
        props: {
          id: 'session-123',
          userId: userId,
          type: 'WORK',
          startedAt: new Date(),
          currentPauseStart: new Date(),
        },
      };

      const executeSpy = jest.spyOn(PauseTimerUseCase.prototype, 'execute');
      executeSpy.mockResolvedValue(mockSession as any);

      const result = await service.pause(pauseTimerDto as any, userId);

      expect(executeSpy).toHaveBeenCalledWith(userId, expect.any(Date));
      expect(result).toEqual(mockSession.props);
    });
  });

  describe('resume', () => {
    it('should successfully resume a paused timer', async () => {
      const userId = 'user-123';
      const pauseStartedAt = new Date();
      const resumeTimerDto = {
        pauseStartedAt: pauseStartedAt,
      };

      const mockSession = {
        props: {
          id: 'session-123',
          userId: userId,
          type: 'WORK',
          startedAt: new Date(),
          totalPauseTime: 120,
          currentPauseStart: undefined,
        },
      };

      const executeSpy = jest.spyOn(ResumeTimerUseCase.prototype, 'execute');
      executeSpy.mockResolvedValue(mockSession as any);

      const result = await service.resume(resumeTimerDto as any, userId);

      expect(executeSpy).toHaveBeenCalledWith(userId, pauseStartedAt, expect.any(Date));
      expect(result).toEqual(mockSession.props);
    });
  });

  describe('switchTask', () => {
    it('should successfully switch to a new task', async () => {
      const userId = 'user-123';
      const switchTaskDto = {
        newTaskId: 'new-task-123',
        type: 'WORK',
        splitReason: 'TASK_SWITCH',
      };

      const mockOldSession = {
        props: {
          id: 'old-session-123',
          userId: userId,
          taskId: 'old-task-123',
          type: 'WORK',
          endedAt: new Date(),
        },
      };

      const mockNewSession = {
        props: {
          id: 'new-session-123',
          userId: userId,
          taskId: 'new-task-123',
          type: 'WORK',
          startedAt: new Date(),
        },
      };

      const executeSpy = jest.spyOn(SwitchTaskUseCase.prototype, 'execute');
      executeSpy.mockResolvedValue({
        oldSession: mockOldSession as any,
        newSession: mockNewSession as any,
      });

      const result = await service.switchTask(switchTaskDto as any, userId);

      expect(executeSpy).toHaveBeenCalledWith(
        userId,
        'new-task-123',
        'WORK',
        'TASK_SWITCH',
      );
      expect(result).toEqual({
        oldSession: mockOldSession.props,
        newSession: mockNewSession.props,
      });
    });
  });

  describe('getActive', () => {
    it('should successfully get active session with elapsed time', async () => {
      const userId = 'user-123';
      const startedAt = new Date();
      startedAt.setMinutes(startedAt.getMinutes() - 5); // Started 5 minutes ago

      const mockSession = {
        props: {
          id: 'session-123',
          userId: userId,
          type: 'WORK',
          startedAt: startedAt,
          totalPauseTime: 60,
          currentPauseStart: undefined,
        },
      };

      mockTimerRepository.findActiveSession.mockResolvedValue(mockSession as any);

      const result = await service.getActive(userId);

      expect(mockTimerRepository.findActiveSession).toHaveBeenCalledWith(userId);
      expect(result).toHaveProperty('elapsedSeconds');
      expect(result.elapsedSeconds).toBeGreaterThan(0);
      expect(result.isPaused).toBe(false);
    });

    it('should calculate elapsed time correctly when paused', async () => {
      const userId = 'user-123';
      const startedAt = new Date();
      startedAt.setMinutes(startedAt.getMinutes() - 10);

      const currentPauseStart = new Date();
      currentPauseStart.setMinutes(currentPauseStart.getMinutes() - 2);

      const mockSession = {
        props: {
          id: 'session-123',
          userId: userId,
          type: 'WORK',
          startedAt: startedAt,
          totalPauseTime: 60,
          currentPauseStart: currentPauseStart,
        },
      };

      mockTimerRepository.findActiveSession.mockResolvedValue(mockSession as any);

      const result = await service.getActive(userId);

      expect(result.isPaused).toBe(true);
      expect(result.elapsedSeconds).toBeGreaterThan(0);
    });

    it('should return null when no active session', async () => {
      const userId = 'user-123';

      mockTimerRepository.findActiveSession.mockResolvedValue(null);

      const result = await service.getActive(userId);

      expect(result).toBeNull();
    });
  });

  describe('getSessionHistory', () => {
    it('should successfully get session history with filters', async () => {
      const userId = 'user-123';
      const getSessionsDto = {
        taskId: 'task-123',
        type: 'WORK',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        completedOnly: true,
        page: 1,
        limit: 20,
      };

      const mockSessions = [
        {
          props: {
            id: 'session-1',
            userId: userId,
            taskId: 'task-123',
            type: 'WORK',
            duration: 25,
            startedAt: new Date('2025-01-15'),
          },
        },
        {
          props: {
            id: 'session-2',
            userId: userId,
            taskId: 'task-123',
            type: 'WORK',
            duration: 25,
            startedAt: new Date('2025-01-16'),
          },
        },
      ];

      mockTimerRepository.findWithFilters.mockResolvedValue({
        sessions: mockSessions as any,
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const result = await service.getSessionHistory(getSessionsDto as any, userId);

      expect(mockTimerRepository.findWithFilters).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          taskId: 'task-123',
          type: 'WORK',
        }),
        { page: 1, limit: 20 },
      );
      expect(result.sessions).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should use default pagination when not provided', async () => {
      const userId = 'user-123';
      const getSessionsDto = {};

      mockTimerRepository.findWithFilters.mockResolvedValue({
        sessions: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      await service.getSessionHistory(getSessionsDto as any, userId);

      expect(mockTimerRepository.findWithFilters).toHaveBeenCalledWith(
        userId,
        expect.anything(),
        { page: 1, limit: 20 },
      );
    });
  });

  describe('getTaskSessions', () => {
    it('should successfully get task session stats', async () => {
      const userId = 'user-123';
      const taskId = 'task-123';

      const mockStats = {
        totalSessions: 5,
        totalMinutes: 125,
        completedSessions: 4,
        lastSessionAt: new Date('2025-01-15'),
      };

      const mockTask = {
        props: {
          id: taskId,
          title: 'Test Task',
        },
      };

      mockTimerRepository.getTaskTimeStats.mockResolvedValue(mockStats);
      mockTaskRepository.findById.mockResolvedValue(mockTask as any);

      const result = await service.getTaskSessions(taskId, userId);

      expect(mockTimerRepository.getTaskTimeStats).toHaveBeenCalledWith(
        userId,
        taskId,
      );
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(result).toEqual({
        taskId: taskId,
        taskTitle: 'Test Task',
        totalSessions: 5,
        totalMinutes: 125,
        completedSessions: 4,
        avgSessionDuration: 25,
        lastSessionAt: mockStats.lastSessionAt,
      });
    });

    it('should return 0 avg duration when no sessions', async () => {
      const userId = 'user-123';
      const taskId = 'task-123';

      const mockStats = {
        totalSessions: 0,
        totalMinutes: 0,
        completedSessions: 0,
        lastSessionAt: null,
      };

      const mockTask = {
        props: {
          id: taskId,
          title: 'Test Task',
        },
      };

      mockTimerRepository.getTaskTimeStats.mockResolvedValue(mockStats);
      mockTaskRepository.findById.mockResolvedValue(mockTask as any);

      const result = await service.getTaskSessions(taskId, userId);

      expect(result.avgSessionDuration).toBe(0);
    });
  });

  describe('getTimerStats', () => {
    it('should successfully get overall timer stats', async () => {
      const userId = 'user-123';
      const getStatsDto = {
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      };

      const mockStats = {
        totalSessions: 50,
        totalWorkSessions: 40,
        totalBreakSessions: 10,
        totalMinutesWorked: 1000,
        totalBreakMinutes: 50,
        totalPauseSeconds: 600,
        totalPauses: 20,
        completedSessions: 45,
        pomodorosCompleted: 40,
        byType: {
          WORK: 40,
          SHORT_BREAK: 8,
          LONG_BREAK: 2,
        },
      };

      const mockDailySessions = [
        {
          props: {
            id: 'session-1',
            type: 'WORK',
            duration: 25,
            startedAt: new Date(),
            endedAt: new Date(),
            wasCompleted: true,
          },
        },
      ];

      mockTimerRepository.getStats.mockResolvedValue(mockStats);
      mockTimerRepository.findByUserIdAndDateRange.mockResolvedValue(
        mockDailySessions as any,
      );

      const result = await service.getTimerStats(getStatsDto as any, userId);

      expect(mockTimerRepository.getStats).toHaveBeenCalledWith(
        userId,
        expect.any(Date),
        expect.any(Date),
      );
      expect(result).toHaveProperty('totalSessions', 50);
      expect(result).toHaveProperty('avgSessionDuration');
      expect(result).toHaveProperty('avgFocusScore');
      expect(result).toHaveProperty('completionRate');
      expect(result).toHaveProperty('dailyBreakdown');
      expect(Array.isArray(result.dailyBreakdown)).toBe(true);
      expect(result.dailyBreakdown).toHaveLength(7);
    });

    it('should calculate stats correctly with no sessions', async () => {
      const userId = 'user-123';
      const getStatsDto = {};

      const mockStats = {
        totalSessions: 0,
        totalWorkSessions: 0,
        totalBreakSessions: 0,
        totalMinutesWorked: 0,
        totalBreakMinutes: 0,
        totalPauseSeconds: 0,
        totalPauses: 0,
        completedSessions: 0,
        pomodorosCompleted: 0,
        byType: {},
      };

      mockTimerRepository.getStats.mockResolvedValue(mockStats);
      mockTimerRepository.findByUserIdAndDateRange.mockResolvedValue([]);

      const result = await service.getTimerStats(getStatsDto as any, userId);

      expect(result.avgSessionDuration).toBe(0);
      expect(result.avgFocusScore).toBe(0);
      expect(result.completionRate).toBe(0);
      expect(result.avgPausesPerSession).toBe(0);
    });

    it('should calculate focus score correctly', async () => {
      const userId = 'user-123';
      const getStatsDto = {};

      const mockStats = {
        totalSessions: 10,
        totalWorkSessions: 10,
        totalBreakSessions: 0,
        totalMinutesWorked: 250,
        totalBreakMinutes: 0,
        totalPauseSeconds: 300, // 5 minutes of pause
        totalPauses: 5,
        completedSessions: 10,
        pomodorosCompleted: 10,
        byType: { WORK: 10 },
      };

      mockTimerRepository.getStats.mockResolvedValue(mockStats);
      mockTimerRepository.findByUserIdAndDateRange.mockResolvedValue([]);

      const result = await service.getTimerStats(getStatsDto as any, userId);

      // Focus score = (totalWorkSeconds / (totalWorkSeconds + totalPauseSeconds)) * 100
      // = (15000 / (15000 + 300)) * 100 = 98.04
      expect(result.avgFocusScore).toBeGreaterThan(95);
      expect(result.avgFocusScore).toBeLessThanOrEqual(100);
    });
  });
});
