import { Test, TestingModule } from '@nestjs/testing';
import { TimersController } from './timers.controller';
import { TimersService } from './timers.service';

describe('TimersController', () => {
    let controller: TimersController;
    let timersService: jest.Mocked<TimersService>;

    const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test' };

    beforeEach(async () => {
        const mockTimersService = {
            start: jest.fn(),
            stop: jest.fn(),
            pause: jest.fn(),
            resume: jest.fn(),
            switchTask: jest.fn(),
            getActive: jest.fn(),
            getSessionHistory: jest.fn(),
            getTimerStats: jest.fn(),
            getTaskSessions: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [TimersController],
            providers: [
                { provide: TimersService, useValue: mockTimersService },
            ],
        }).compile();

        controller = module.get<TimersController>(TimersController);
        timersService = module.get<TimersService>(TimersService) as jest.Mocked<TimersService>;
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('start', () => {
        it('should start a new timer session', async () => {
            const dto = { taskId: 'task-123', type: 'WORK' as const };
            const mockSession = { id: 'session-123', userId: mockUser.id, ...dto };
            timersService.start.mockResolvedValue(mockSession as any);

            const result = await controller.start(dto as any, mockUser);

            expect(timersService.start).toHaveBeenCalledWith(dto, mockUser.id);
            expect(result).toEqual(mockSession);
        });
    });

    describe('getActive', () => {
        it('should return active session for user', async () => {
            const mockSession = { id: 'session-123', type: 'WORK', endedAt: null };
            timersService.getActive.mockResolvedValue(mockSession as any);

            const result = await controller.getActive(mockUser);

            expect(timersService.getActive).toHaveBeenCalledWith(mockUser.id);
            expect(result).toEqual(mockSession);
        });

        it('should return null when no active session', async () => {
            timersService.getActive.mockResolvedValue(null);

            const result = await controller.getActive(mockUser);

            expect(result).toBeNull();
        });
    });

    describe('stop', () => {
        it('should stop active session', async () => {
            const dto = { sessionId: 'session-123' };
            const endedSession = { id: 'session-123', endedAt: new Date(), duration: 25 };
            timersService.stop.mockResolvedValue(endedSession as any);

            const result = await controller.stop(dto as any, mockUser);

            expect(timersService.stop).toHaveBeenCalledWith(dto, mockUser.id);
            expect(result).toEqual(endedSession);
        });
    });

    describe('pause', () => {
        it('should pause active session', async () => {
            const dto = { sessionId: 'session-123' };
            const pausedSession = { id: 'session-123', isPaused: true };
            timersService.pause.mockResolvedValue(pausedSession as any);

            const result = await controller.pause(dto as any, mockUser);

            expect(timersService.pause).toHaveBeenCalledWith(dto, mockUser.id);
            expect(result).toEqual(pausedSession);
        });
    });

    describe('resume', () => {
        it('should resume paused session', async () => {
            const dto = { sessionId: 'session-123' };
            const resumedSession = { id: 'session-123', isPaused: false };
            timersService.resume.mockResolvedValue(resumedSession as any);

            const result = await controller.resume(dto as any, mockUser);

            expect(timersService.resume).toHaveBeenCalledWith(dto, mockUser.id);
            expect(result).toEqual(resumedSession);
        });
    });

    describe('getHistory', () => {
        it('should return session history', async () => {
            const dto = { limit: 10, offset: 0 };
            const mockSessions = [
                { id: 'session-1', type: 'WORK', duration: 25 },
                { id: 'session-2', type: 'BREAK', duration: 5 },
            ];
            timersService.getSessionHistory.mockResolvedValue(mockSessions as any);

            const result = await controller.getHistory(dto as any, mockUser);

            expect(timersService.getSessionHistory).toHaveBeenCalledWith(dto, mockUser.id);
            expect(result).toEqual(mockSessions);
        });
    });

    describe('getStats', () => {
        it('should return timer statistics', async () => {
            const dto = {};
            const mockStats = {
                todayMinutes: 120,
                weekMinutes: 600,
                todaySessions: 5,
                currentStreak: 3,
            };
            timersService.getTimerStats.mockResolvedValue(mockStats as any);

            const result = await controller.getStats(dto as any, mockUser);

            expect(timersService.getTimerStats).toHaveBeenCalledWith(dto, mockUser.id);
            expect(result).toEqual(mockStats);
        });
    });

    describe('getTaskSessions', () => {
        it('should return sessions for specific task', async () => {
            const taskId = 'task-123';
            const mockSessions = [{ id: 'session-1', taskId, duration: 30 }];
            timersService.getTaskSessions.mockResolvedValue(mockSessions as any);

            const result = await controller.getTaskSessions(taskId, mockUser);

            expect(timersService.getTaskSessions).toHaveBeenCalledWith(taskId, mockUser.id);
            expect(result).toEqual(mockSessions);
        });
    });
});
