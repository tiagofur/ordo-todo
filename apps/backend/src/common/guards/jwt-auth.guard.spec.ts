import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;
    let reflector: jest.Mocked<Reflector>;

    const createMockExecutionContext = (
        isPublic = false,
        authHeader?: string,
    ): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: {
                        authorization: authHeader,
                    },
                }),
            }),
            getHandler: () => ({}),
            getClass: () => ({}),
        } as unknown as ExecutionContext;
    };

    beforeEach(async () => {
        const mockReflector = {
            getAllAndOverride: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtAuthGuard,
                { provide: Reflector, useValue: mockReflector },
            ],
        }).compile();

        guard = module.get<JwtAuthGuard>(JwtAuthGuard);
        reflector = module.get<Reflector>(Reflector) as jest.Mocked<Reflector>;
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate', () => {
        it('should allow public routes', async () => {
            reflector.getAllAndOverride.mockReturnValue(true);
            const context = createMockExecutionContext(true);

            const result = guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should pass to parent for protected routes with auth header', () => {
            reflector.getAllAndOverride.mockReturnValue(false);
            const context = createMockExecutionContext(false, 'Bearer valid-token');

            // JwtAuthGuard extends AuthGuard('jwt'), so we can't fully test the JWT validation
            // without mocking passport. This just verifies our logic.
            expect(() => guard.canActivate(context)).not.toThrow();
        });
    });

    describe('handleRequest', () => {
        it('should return user when authentication succeeds', () => {
            const mockUser = { id: 'user-123', email: 'test@example.com' };

            const result = guard.handleRequest(null, mockUser, null);

            expect(result).toEqual(mockUser);
        });

        it('should throw UnauthorizedException when no user', () => {
            expect(() => guard.handleRequest(null, null, null)).toThrow(
                UnauthorizedException,
            );
        });

        it('should throw error passed from passport', () => {
            const error = new Error('Token expired');

            expect(() => guard.handleRequest(error, null, null)).toThrow(error);
        });
    });
});
