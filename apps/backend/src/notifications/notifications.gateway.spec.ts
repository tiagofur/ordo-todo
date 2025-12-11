import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from './notifications.gateway';
import { JwtService } from '@nestjs/jwt';
import { Socket, Server } from 'socket.io';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let jwtService: jest.Mocked<JwtService>;

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  } as unknown as Server;

  const createMockSocket = (
    data: Partial<Socket['data']> = {},
    auth: any = {},
  ): Socket => {
    return {
      id: 'socket-123',
      data,
      handshake: { auth, headers: {} },
      join: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
    } as unknown as Socket;
  };

  beforeEach(async () => {
    const mockJwtService = {
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
    jwtService = module.get<JwtService>(JwtService) as jest.Mocked<JwtService>;
    gateway.server = mockServer;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should authenticate and track socket connection', async () => {
      const mockSocket = createMockSocket({}, { token: 'valid-token' });
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user-123' });

      await gateway.handleConnection(mockSocket);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
      expect(mockSocket.data.userId).toBe('user-123');
      expect(mockSocket.join).toHaveBeenCalledWith('user:user-123');
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'connected',
        expect.objectContaining({
          message: 'Connected to notifications',
          userId: 'user-123',
        }),
      );
    });

    it('should reject connection without token', async () => {
      const mockSocket = createMockSocket({}, {});

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should reject connection with invalid token', async () => {
      const mockSocket = createMockSocket({}, { token: 'invalid-token' });
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should support authorization header', async () => {
      const mockSocket = {
        id: 'socket-456',
        data: {},
        handshake: {
          auth: {},
          headers: { authorization: 'Bearer header-token' },
        },
        join: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
      } as unknown as Socket;
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user-456' });

      await gateway.handleConnection(mockSocket);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('header-token');
    });
  });

  describe('handleDisconnect', () => {
    it('should clean up user tracking on disconnect', async () => {
      const mockSocket = createMockSocket({}, { token: 'valid-token' });
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user-123' });

      // Connect first
      await gateway.handleConnection(mockSocket);
      expect(gateway.isUserConnected('user-123')).toBe(true);

      // Then disconnect
      gateway.handleDisconnect(mockSocket);
      expect(gateway.isUserConnected('user-123')).toBe(false);
    });
  });

  describe('sendNotification', () => {
    it('should emit notification to user room', () => {
      const notification = {
        id: 'notif-123',
        type: 'TASK_REMINDER',
        title: 'Task due soon',
        createdAt: new Date(),
      };

      gateway.sendNotification('user-123', notification);

      expect(mockServer.to).toHaveBeenCalledWith('user:user-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'notification:new',
        notification,
      );
    });
  });

  describe('sendTaskReminder', () => {
    it('should emit task reminder to user room', () => {
      const reminder = {
        taskId: 'task-123',
        taskTitle: 'Complete report',
        dueDate: new Date(),
        priority: 'HIGH',
        minutesUntilDue: 30,
      };

      gateway.sendTaskReminder('user-123', reminder);

      expect(mockServer.to).toHaveBeenCalledWith('user:user-123');
      expect(mockServer.emit).toHaveBeenCalledWith('task:reminder', reminder);
    });
  });

  describe('sendTimerAlert', () => {
    it('should emit timer alert to user room', () => {
      const alert = {
        type: 'SESSION_COMPLETE' as const,
        message: 'Great work! Session completed.',
        taskId: 'task-123',
        sessionId: 'session-456',
      };

      gateway.sendTimerAlert('user-123', alert);

      expect(mockServer.to).toHaveBeenCalledWith('user:user-123');
      expect(mockServer.emit).toHaveBeenCalledWith('timer:alert', alert);
    });
  });

  describe('sendInsight', () => {
    it('should emit AI insight to user room', () => {
      const insight = {
        type: 'PEAK_HOUR_TIP',
        message: 'This is your peak productivity hour!',
        priority: 'MEDIUM' as const,
        actionable: true,
      };

      gateway.sendInsight('user-123', insight);

      expect(mockServer.to).toHaveBeenCalledWith('user:user-123');
      expect(mockServer.emit).toHaveBeenCalledWith('ai:insight', insight);
    });
  });

  describe('sendUnreadCount', () => {
    it('should emit unread count to user room', () => {
      gateway.sendUnreadCount('user-123', 5);

      expect(mockServer.to).toHaveBeenCalledWith('user:user-123');
      expect(mockServer.emit).toHaveBeenCalledWith('notification:count', {
        count: 5,
      });
    });
  });

  describe('handlePing', () => {
    it('should return pong response', () => {
      const mockSocket = createMockSocket({ userId: 'user-123' });

      const result = gateway.handlePing(mockSocket);

      expect(result).toEqual({ event: 'pong', data: { pong: true } });
    });
  });

  describe('utility methods', () => {
    it('should track connected users count', async () => {
      const socket1 = createMockSocket({}, { token: 'token1' });
      const socket2 = createMockSocket({}, { token: 'token2' });
      socket2.id = 'socket-456';

      jwtService.verifyAsync.mockResolvedValueOnce({ sub: 'user-1' });
      jwtService.verifyAsync.mockResolvedValueOnce({ sub: 'user-2' });

      await gateway.handleConnection(socket1);
      await gateway.handleConnection(socket2);

      expect(gateway.getConnectedUsersCount()).toBe(2);
    });

    it('should get socket IDs for user', async () => {
      const mockSocket = createMockSocket({}, { token: 'valid-token' });
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user-123' });

      await gateway.handleConnection(mockSocket);

      const socketIds = gateway.getUserSocketIds('user-123');
      expect(socketIds).toContain('socket-123');
    });

    it('should return empty array for non-connected user', () => {
      const socketIds = gateway.getUserSocketIds('non-existent');
      expect(socketIds).toEqual([]);
    });
  });
});
