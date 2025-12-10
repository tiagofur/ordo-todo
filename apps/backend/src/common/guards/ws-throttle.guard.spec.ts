import { Test, TestingModule } from '@nestjs/testing';
import { WsThrottleGuard, WsThrottleGuardStrict, WsThrottleGuardRelaxed } from './ws-throttle.guard';
import { ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

describe('WsThrottleGuard', () => {
    let guard: WsThrottleGuard;

    const createMockExecutionContext = (userId: string, socketId = 'socket-123'): ExecutionContext => {
        const mockSocket = {
            id: socketId,
            data: { userId },
        };

        return {
            switchToWs: () => ({
                getClient: () => mockSocket,
            }),
        } as unknown as ExecutionContext;
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [WsThrottleGuard],
        }).compile();

        guard = module.get<WsThrottleGuard>(WsThrottleGuard);
        // Reset the messageCount map for each test
        (guard as any).messageCount = new Map();
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate', () => {
        it('should allow requests under the limit', () => {
            const context = createMockExecutionContext('user-123');

            for (let i = 0; i < 10; i++) {
                expect(guard.canActivate(context)).toBe(true);
            }
        });

        it('should throw WsException when limit is exceeded', () => {
            const context = createMockExecutionContext('user-456');

            // Fill up to limit (default is 50)
            for (let i = 0; i < 50; i++) {
                guard.canActivate(context);
            }

            // Next request should throw
            expect(() => guard.canActivate(context)).toThrow(WsException);
        });

        it('should track different users separately', () => {
            const context1 = createMockExecutionContext('user-1', 'socket-1');
            const context2 = createMockExecutionContext('user-2', 'socket-2');

            // Each user should have their own counter
            for (let i = 0; i < 30; i++) {
                expect(guard.canActivate(context1)).toBe(true);
                expect(guard.canActivate(context2)).toBe(true);
            }
        });

        it('should return true immediately if no userId', () => {
            const context = createMockExecutionContext('');

            expect(guard.canActivate(context)).toBe(true);
        });
    });

    describe('rate limiting reset', () => {
        it('should reset count after time window', async () => {
            // Create guard with very short window for testing
            const shortWindowGuard = new (class extends WsThrottleGuard {
                limit = 5;
                windowMs = 100; // 100ms window
            })();

            const context = createMockExecutionContext('user-test');

            // Use up all allowed messages
            for (let i = 0; i < 5; i++) {
                shortWindowGuard.canActivate(context);
            }

            // Should be rate limited now
            expect(() => shortWindowGuard.canActivate(context)).toThrow(WsException);

            // Wait for window to reset
            await new Promise(resolve => setTimeout(resolve, 150));

            // Should be allowed again
            expect(shortWindowGuard.canActivate(context)).toBe(true);
        });
    });
});

describe('WsThrottleGuardStrict', () => {
    let guard: WsThrottleGuardStrict;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [WsThrottleGuardStrict],
        }).compile();

        guard = module.get<WsThrottleGuardStrict>(WsThrottleGuardStrict);
    });

    it('should have stricter limits', () => {
        expect((guard as any).limit).toBe(20);
        expect((guard as any).windowMs).toBe(60000);
    });
});

describe('WsThrottleGuardRelaxed', () => {
    let guard: WsThrottleGuardRelaxed;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [WsThrottleGuardRelaxed],
        }).compile();

        guard = module.get<WsThrottleGuardRelaxed>(WsThrottleGuardRelaxed);
    });

    it('should have more relaxed limits', () => {
        expect((guard as any).limit).toBe(100);
        expect((guard as any).windowMs).toBe(60000);
    });
});
