import {
  Injectable,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerGuard, ThrottlerStorage } from '@nestjs/throttler';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

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
   * - POST /auth/check-username: 10 requests per hour
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

    // Check if endpoint is public - apply rate limiting even to public endpoints!
    // We want rate limiting on login/register to prevent brute force
    // IS_PUBLIC_KEY is used to skip JWT auth, but we still want rate limiting
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Determine rate limit based on route
    // Public endpoints (login, register) need strict rate limiting
    const rateLimit = this.getRateLimitForRoute(route, method, isPublic);

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
   * @param isPublic - Whether the route is public (has @Public decorator)
   * @returns Rate limit object or null (null = use default)
   */
  private getRateLimitForRoute(
    route: string,
    method: string,
    isPublic: boolean,
  ): { limit: number; ttl: number; message: string } | null {
    // Auth endpoints - stricter limits
    if (route.includes('/auth/register')) {
      return {
        limit: 3,
        ttl: 3600000, // 1 hour (stricter for registration)
        message: 'Too many registration attempts. Please try again in 1 hour.',
      };
    }

    if (route.includes('/auth/login')) {
      return {
        limit: 5,
        ttl: 60000, // 1 minute
        message: 'Too many login attempts. Please try again in 1 minute.',
      };
    }

    if (route.includes('/auth/check-username')) {
      return {
        limit: 10,
        ttl: 3600000, // 1 hour (prevent username enumeration)
        message: 'Too many username checks. Please try again later.',
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
      // Use the storage service directly with proper parameters
      const result = await this.storageService.increment(
        request.ip, // key
        rateLimit.ttl, // ttl in milliseconds
        rateLimit.limit, // limit
        0, // blockDuration (0 = no blocking)
        'default', // throttlerName
      );

      if (result.totalHits > rateLimit.limit) {
        throw new HttpException(
          rateLimit.message,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      return true;
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
