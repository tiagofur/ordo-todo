import { Test, TestingModule } from '@nestjs/testing';
import { CollaborationGateway } from './collaboration.gateway';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket, Server } from 'socket.io';

describe('CollaborationGateway', () => {
    let gateway: CollaborationGateway;
    let jwtService: jest.Mocked<JwtService>;
    let configService: jest.Mocked<ConfigService>;

    const mockServer = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
    } as unknown as Server;

    const createMockSocket = (userId?: string, token?: string): Socket => {
        return {
            id: 'socket-123',
            data: { userId },
            handshake: {
                auth: { token },
                headers: {},
            },
            join: jest.fn(),
            leave: jest.fn(),
            emit: jest.fn(),
            disconnect: jest.fn(),
            broadcast: {
                to: jest.fn().mockReturnThis(),
                emit: jest.fn(),
            },
        } as unknown as Socket;
    };

    beforeEach(async () => {
        const mockJwtService = {
            verifyAsync: jest.fn(),
        };

        const mockConfigService = {
            get: jest.fn((key: string) => {
                if (key === 'CORS_ORIGINS') return 'http://localhost:3000';
                return undefined;
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CollaborationGateway,
                { provide: JwtService, useValue: mockJwtService },
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        gateway = module.get<CollaborationGateway>(CollaborationGateway);
        jwtService = module.get<JwtService>(JwtService) as jest.Mocked<JwtService>;
        configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
        gateway.server = mockServer;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    describe('handleConnection', () => {
        it('should authenticate user with valid token', async () => {
            const mockSocket = createMockSocket(undefined, 'valid-token');
            jwtService.verifyAsync.mockResolvedValue({ sub: 'user-123', email: 'test@example.com' });

            await gateway.handleConnection(mockSocket);

            expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
            expect(mockSocket.data.userId).toBe('user-123');
        });

        it('should disconnect socket without token', async () => {
            const mockSocket = createMockSocket(undefined, undefined);

            await gateway.handleConnection(mockSocket);

            expect(mockSocket.disconnect).toHaveBeenCalled();
        });

        it('should disconnect socket with invalid token', async () => {
            const mockSocket = createMockSocket(undefined, 'invalid-token');
            jwtService.verifyAsync.mockRejectedValue(new Error('Invalid'));

            await gateway.handleConnection(mockSocket);

            expect(mockSocket.disconnect).toHaveBeenCalled();
        });
    });

    describe('handleDisconnect', () => {
        it('should handle user disconnection', () => {
            const mockSocket = createMockSocket('user-123');

            // Should not throw
            expect(() => gateway.handleDisconnect(mockSocket)).not.toThrow();
        });
    });

    describe('handleJoinWorkspace', () => {
        it('should join user to workspace room', () => {
            const mockSocket = createMockSocket('user-123');
            const data = { workspaceId: 'ws-456' };

            gateway.handleJoinWorkspace(mockSocket, data);

            expect(mockSocket.join).toHaveBeenCalledWith('workspace:ws-456');
        });
    });

    describe('handleLeaveWorkspace', () => {
        it('should leave workspace room', () => {
            const mockSocket = createMockSocket('user-123');
            const data = { workspaceId: 'ws-456' };

            gateway.handleLeaveWorkspace(mockSocket, data);

            expect(mockSocket.leave).toHaveBeenCalledWith('workspace:ws-456');
        });
    });

    describe('handleJoinTask', () => {
        it('should join user to task room', () => {
            const mockSocket = createMockSocket('user-123');
            const data = { taskId: 'task-789' };

            gateway.handleJoinTask(mockSocket, data);

            expect(mockSocket.join).toHaveBeenCalledWith('task:task-789');
        });
    });

    describe('handleLeaveTask', () => {
        it('should leave task room', () => {
            const mockSocket = createMockSocket('user-123');
            const data = { taskId: 'task-789' };

            gateway.handleLeaveTask(mockSocket, data);

            expect(mockSocket.leave).toHaveBeenCalledWith('task:task-789');
        });
    });

    describe('handleTaskUpdate', () => {
        it('should broadcast task update to room', () => {
            const mockSocket = createMockSocket('user-123');
            const data = {
                taskId: 'task-789',
                changes: { status: 'COMPLETED' },
            };

            gateway.handleTaskUpdate(mockSocket, data);

            // Should broadcast to task room excluding sender
            expect(mockSocket.broadcast.to).toHaveBeenCalledWith('task:task-789');
            expect(mockSocket.broadcast.emit).toHaveBeenCalledWith('task:updated', expect.objectContaining({
                taskId: 'task-789',
                changes: { status: 'COMPLETED' },
                updatedBy: 'user-123',
            }));
        });
    });

    describe('emitToWorkspace', () => {
        it('should emit event to workspace room', () => {
            gateway.emitToWorkspace('ws-123', 'test-event', { data: 'test' });

            expect(mockServer.to).toHaveBeenCalledWith('workspace:ws-123');
            expect(mockServer.emit).toHaveBeenCalledWith('test-event', { data: 'test' });
        });
    });

    describe('emitToTask', () => {
        it('should emit event to task room', () => {
            gateway.emitToTask('task-123', 'task:changed', { status: 'DONE' });

            expect(mockServer.to).toHaveBeenCalledWith('task:task-123');
            expect(mockServer.emit).toHaveBeenCalledWith('task:changed', { status: 'DONE' });
        });
    });
});
