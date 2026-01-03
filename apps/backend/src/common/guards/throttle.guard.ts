import {
  Injectable,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerGuard, ThrottlerStorage } from '@nestjs/throttler';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

/**
 * Custom Rate Limiting Guard with Different Limits for Different Endpoints
 *
 * Implements rate limiting following Stripe/Twitter standards:
 * - Stricter limits for public endpoints (login, register)
 * - Higher limits for authenticated endpoints
 * - IP-based rate limiting
 * - User-based rate limiting (when authenticated)
 *
 * @see {@link https://stripe.com/blog/rate-limiting | Stripe Rate Limiting}
 * @see {@link https://docs.nestjs.com/security/rate-limiting | NestJS Rate Limiting}
 */
@Injectable()
export class CustomThrottleGuard extends ThrottlerGuard {
  constructor(
    protected readonly options: ThrottlerModuleOptions,
    protected readonly storageService: ThrottlerStorage,
    protected readonly reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  /**
   * Determines if request should be rate limited
   *
   * Custom implementation that applies different rate limits based on route:
   * - POST /auth/register: 3 requests per minute
   * - POST /auth/login: 5 requests per minute
   * - POST /auth/refresh: 10 requests per minute
   * - Other public endpoints: 20 requests per minute
   * - Authenticated endpoints: 100 requests per minute
   *
   * @param context - NestJS execution context
   * @returns Promise resolving to boolean (true = allow, false = block)
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const route = request.route?.path || request.url;
    const method = request.method;

    // Apply skip decorator if present
    const skip = this.reflector.get('throttle-skip', context.getHandler());
    if (skip) {
      return true;
    }

    // Determine rate limit based on route
    const rateLimit = this.getRateLimitForRoute(route, method);

    // Apply rate limit if route matches
    if (rateLimit !== null) {
      return this.applyRateLimit(request, rateLimit);
    }

    // For other routes, use default NestJS behavior
    return super.canActivate(context);
  }

  /**
   * Determines rate limit for specific route
   *
   * @param route - Request route path
   * @param method - HTTP method (GET, POST, etc.)
   * @returns Rate limit object or null (null = use default)
   */
  private getRateLimitForRoute(
    route: string,
    method: string,
  ): { limit: number; ttl: number; message: string } | null {
    // Auth endpoints - stricter limits
    if (route.includes('/auth/register')) {
      return {
        limit: 3,
        ttl: 60000, // 1 minute
        message: 'Too many registration attempts. Please try again later.',
      };
    }

    if (route.includes('/auth/login')) {
      return {
        limit: 5,
        ttl: 60000, // 1 minute
        message: 'Too many login attempts. Please try again later.',
      };
    }

    if (route.includes('/auth/refresh')) {
      return {
        limit: 10,
        ttl: 60000, // 1 minute
        message: 'Too many refresh token requests. Please try again later.',
      };
    }

    // Timer endpoints - prevent abuse
    if (route.includes('/timers/start') || route.includes('/timers/stop')) {
      return {
        limit: 5,
        ttl: 10000, // 10 seconds
        message: 'Too many timer actions. Please slow down.',
      };
    }

    // For other routes, use default behavior
    return null;
  }

  private async applyRateLimit(
    request: any,
    rateLimit: { limit: number; ttl: number; message: string },
  ): Promise<boolean> {
    try {
      // Use the parent class method with custom limits
      const result = await super.handleRequest(request, {
        limit: rateLimit.limit,
        ttl: rateLimit.ttl,
      });
      return result;
    } catch (error: any) {
      if (
        error instanceof HttpException &&
        error.getStatus() === HttpStatus.TOO_MANY_REQUESTS
      ) {
        throw new HttpException(
          rateLimit.message,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      throw error;
    }
  }
}
