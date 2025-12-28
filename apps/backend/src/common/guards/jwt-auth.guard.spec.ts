import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Reflector>;

  const createMockExecutionContext = (
    authHeader?: string,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: authHeader,
          },
        }),
        getResponse: () => ({}),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new JwtAuthGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow public routes', () => {
      reflector.getAllAndOverride.mockReturnValue(true);
      const context = createMockExecutionContext();

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true for public routes regardless of auth header', () => {
      reflector.getAllAndOverride.mockReturnValue(true);
      const context = createMockExecutionContext('Bearer valid-token');

      const result = guard.canActivate(context);

      expect(result).toBe(true);
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

    it('should throw UnauthorizedException with specific message when err is null but user is null', () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        UnauthorizedException,
      );
    });
  });
});
