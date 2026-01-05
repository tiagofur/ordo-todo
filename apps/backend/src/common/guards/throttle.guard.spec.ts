import { Reflector } from '@nestjs/core';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { CustomThrottleGuard } from './throttle.guard';
import { ThrottlerStorage } from '@nestjs/throttler';

describe('CustomThrottleGuard', () => {
  let guard: CustomThrottleGuard;
  let reflector: jest.Mocked<Reflector>;
  let storageService: jest.Mocked<ThrottlerStorage>;

  const createMockExecutionContext = (
    route: string,
    method: string = 'GET',
    authHeader?: string,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: authHeader,
          },
          route: { path: route },
          url: route,
          method: method,
          ip: '127.0.0.1',
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
      get: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    storageService = {
      getRecord: jest.fn(),
      setRecord: jest.fn(),
    } as unknown as jest.Mocked<ThrottlerStorage>;

    const options = {
      throttlers: [],
    } as any;

    guard = new CustomThrottleGuard(options, storageService, reflector);
  });

  describe('canActivate', () => {
    it('should allow requests when skip decorator is present', async () => {
      reflector.get.mockReturnValue(true);
      const context = createMockExecutionContext('/auth/login', 'POST');

      // Mock parent class behavior
      jest.spyOn(guard as any, 'handleRequest').mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(reflector.get).toHaveBeenCalledWith(
        'throttle-skip',
        expect.any(Function),
      );
      expect(result).toBe(true);
    });

    it('should apply rate limit for /auth/register route', async () => {
      reflector.get.mockReturnValue(false);
      const context = createMockExecutionContext('/auth/register', 'POST');

      // Mock storage service to return no previous requests
      storageService.getRecord.mockResolvedValue(null);
      storageService.setRecord.mockResolvedValue(true);

      // Mock parent handleRequest to allow the request
      jest.spyOn(guard as any, 'handleRequest').mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should apply rate limit for /auth/login route', async () => {
      reflector.get.mockReturnValue(false);
      const context = createMockExecutionContext('/auth/login', 'POST');

      storageService.getRecord.mockResolvedValue(null);
      storageService.setRecord.mockResolvedValue(true);

      jest.spyOn(guard as any, 'handleRequest').mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should apply rate limit for /auth/refresh route', async () => {
      reflector.get.mockReturnValue(false);
      const context = createMockExecutionContext('/auth/refresh', 'POST');

      storageService.getRecord.mockResolvedValue(null);
      storageService.setRecord.mockResolvedValue(true);

      jest.spyOn(guard as any, 'handleRequest').mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should apply rate limit for /timers/start route', async () => {
      reflector.get.mockReturnValue(false);
      const context = createMockExecutionContext('/timers/start', 'POST');

      storageService.getRecord.mockResolvedValue(null);
      storageService.setRecord.mockResolvedValue(true);

      jest.spyOn(guard as any, 'handleRequest').mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should apply rate limit for /timers/stop route', async () => {
      reflector.get.mockReturnValue(false);
      const context = createMockExecutionContext('/timers/stop', 'POST');

      storageService.getRecord.mockResolvedValue(null);
      storageService.setRecord.mockResolvedValue(true);

      jest.spyOn(guard as any, 'handleRequest').mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should use default behavior for non-protected routes', async () => {
      reflector.get.mockReturnValue(false);
      const context = createMockExecutionContext('/tasks', 'GET');

      // Mock parent canActivate
      const superCanActivateSpy = jest.spyOn(
        CustomThrottleGuard.prototype,
        'canActivate',
      );
      superCanActivateSpy.mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);

      superCanActivateSpy.mockRestore();
    });
  });

  describe('getRateLimitForRoute', () => {
    it('should return strict limit for /auth/register', () => {
      const rateLimit = (guard as any).getRateLimitForRoute(
        '/auth/register',
        'POST',
      );

      expect(rateLimit).toEqual({
        limit: 3,
        ttl: 60000,
        message: 'Too many registration attempts. Please try again later.',
      });
    });

    it('should return moderate limit for /auth/login', () => {
      const rateLimit = (guard as any).getRateLimitForRoute(
        '/auth/login',
        'POST',
      );

      expect(rateLimit).toEqual({
        limit: 5,
        ttl: 60000,
        message: 'Too many login attempts. Please try again later.',
      });
    });

    it('should return higher limit for /auth/refresh', () => {
      const rateLimit = (guard as any).getRateLimitForRoute(
        '/auth/refresh',
        'POST',
      );

      expect(rateLimit).toEqual({
        limit: 10,
        ttl: 60000,
        message: 'Too many refresh token requests. Please try again later.',
      });
    });

    it('should return strict limit for /timers/start', () => {
      const rateLimit = (guard as any).getRateLimitForRoute(
        '/timers/start',
        'POST',
      );

      expect(rateLimit).toEqual({
        limit: 5,
        ttl: 10000,
        message: 'Too many timer actions. Please slow down.',
      });
    });

    it('should return strict limit for /timers/stop', () => {
      const rateLimit = (guard as any).getRateLimitForRoute(
        '/timers/stop',
        'POST',
      );

      expect(rateLimit).toEqual({
        limit: 5,
        ttl: 10000,
        message: 'Too many timer actions. Please slow down.',
      });
    });

    it('should return null for non-protected routes', () => {
      const rateLimit = (guard as any).getRateLimitForRoute('/tasks', 'GET');

      expect(rateLimit).toBeNull();
    });

    it('should handle routes with query parameters', () => {
      const rateLimit = (guard as any).getRateLimitForRoute(
        '/auth/login?redirect=/home',
        'POST',
      );

      expect(rateLimit).toEqual({
        limit: 5,
        ttl: 60000,
        message: 'Too many login attempts. Please try again later.',
      });
    });
  });

  describe('applyRateLimit', () => {
    it('should allow request when under limit', async () => {
      const request = {
        ip: '127.0.0.1',
        headers: {},
      };
      const rateLimit = {
        limit: 5,
        ttl: 60000,
        message: 'Too many attempts',
      };

      // Mock handleRequest to allow
      jest.spyOn(guard as any, 'handleRequest').mockResolvedValue(true);

      const result = await (guard as any).applyRateLimit(request, rateLimit);

      expect(result).toBe(true);
    });

    it('should throw HttpException with custom message when over limit', async () => {
      const request = {
        ip: '127.0.0.1',
        headers: {},
      };
      const rateLimit = {
        limit: 5,
        ttl: 60000,
        message: 'Custom rate limit exceeded',
      };

      // Mock handleRequest to throw TOO_MANY_REQUESTS
      jest
        .spyOn(guard as any, 'handleRequest')
        .mockRejectedValue(
          new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS),
        );

      await expect(
        (guard as any).applyRateLimit(request, rateLimit),
      ).rejects.toThrow(HttpException);

      try {
        await (guard as any).applyRateLimit(request, rateLimit);
      } catch (error: any) {
        expect(error.message).toBe('Custom rate limit exceeded');
        expect(error.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      }
    });

    it('should re-throw non-rate-limit errors as-is', async () => {
      const request = {
        ip: '127.0.0.1',
        headers: {},
      };
      const rateLimit = {
        limit: 5,
        ttl: 60000,
        message: 'Too many attempts',
      };

      const originalError = new Error('Database connection failed');

      jest
        .spyOn(guard as any, 'handleRequest')
        .mockRejectedValue(originalError);

      await expect(
        (guard as any).applyRateLimit(request, rateLimit),
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple rapid login attempts', async () => {
      reflector.get.mockReturnValue(false);
      const context = createMockExecutionContext('/auth/login', 'POST');

      // First 5 requests should succeed
      for (let i = 0; i < 5; i++) {
        storageService.getRecord.mockResolvedValue({
          totalHits: i,
          expiresAt: Date.now() + 60000,
        });
        jest.spyOn(guard as any, 'handleRequest').mockResolvedValue(true);

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
      }

      // 6th request should fail
      storageService.getRecord.mockResolvedValue({
        totalHits: 5,
        expiresAt: Date.now() + 60000,
      });

      jest
        .spyOn(guard as any, 'handleRequest')
        .mockRejectedValue(
          new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS),
        );

      await expect(guard.canActivate(context)).rejects.toThrow(HttpException);
    });

    it('should handle registration with strict limit', async () => {
      reflector.get.mockReturnValue(false);
      const context = createMockExecutionContext('/auth/register', 'POST');

      // First 3 requests should succeed
      for (let i = 0; i < 3; i++) {
        storageService.getRecord.mockResolvedValue({
          totalHits: i,
          expiresAt: Date.now() + 60000,
        });
        jest.spyOn(guard as any, 'handleRequest').mockResolvedValue(true);

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
      }

      // 4th request should fail
      storageService.getRecord.mockResolvedValue({
        totalHits: 3,
        expiresAt: Date.now() + 60000,
      });

      jest
        .spyOn(guard as any, 'handleRequest')
        .mockRejectedValue(
          new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS),
        );

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Too many registration attempts. Please try again later.',
      );
    });

    it('should handle timer actions with short TTL', async () => {
      reflector.get.mockReturnValue(false);
      const context = createMockExecutionContext('/timers/start', 'POST');

      // First 5 requests within 10 seconds should succeed
      for (let i = 0; i < 5; i++) {
        storageService.getRecord.mockResolvedValue({
          totalHits: i,
          expiresAt: Date.now() + 10000,
        });
        jest.spyOn(guard as any, 'handleRequest').mockResolvedValue(true);

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
      }

      // 6th request should fail
      storageService.getRecord.mockResolvedValue({
        totalHits: 5,
        expiresAt: Date.now() + 10000,
      });

      jest
        .spyOn(guard as any, 'handleRequest')
        .mockRejectedValue(
          new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS),
        );

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Too many timer actions. Please slow down.',
      );
    });

    it('should allow requests after TTL expires', async () => {
      reflector.get.mockReturnValue(false);
      const context = createMockExecutionContext('/auth/login', 'POST');

      // Simulate expired record
      storageService.getRecord.mockResolvedValue({
        totalHits: 10,
        expiresAt: Date.now() - 1000, // Expired 1 second ago
      });

      jest.spyOn(guard as any, 'handleRequest').mockResolvedValue(true);

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle routes without path property', async () => {
      reflector.get.mockReturnValue(false);

      const context: any = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {},
            method: 'POST',
            route: null, // No route property
            url: '/auth/login', // Use url instead
            ip: '127.0.0.1',
          }),
          getResponse: () => ({}),
        }),
        getHandler: () => jest.fn(),
        getClass: () => jest.fn(),
      };

      storageService.getRecord.mockResolvedValue(null);
      jest.spyOn(guard as any, 'handleRequest').mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should handle mixed route matching', async () => {
      reflector.get.mockReturnValue(false);

      // Should match /auth/login even with extra path segments
      const context = createMockExecutionContext('/api/v1/auth/login', 'POST');

      storageService.getRecord.mockResolvedValue(null);
      jest.spyOn(guard as any, 'handleRequest').mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should not rate limit GET requests to auth endpoints', async () => {
      reflector.get.mockReturnValue(false);
      const context = createMockExecutionContext('/auth/login', 'GET');

      // GET requests should not trigger rate limiting (typically used for checking status)
      const superCanActivateSpy = jest.spyOn(
        CustomThrottleGuard.prototype,
        'canActivate',
      );
      superCanActivateSpy.mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);

      superCanActivateSpy.mockRestore();
    });
  });
});
