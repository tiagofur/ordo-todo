import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  checks: {
    database: HealthIndicator;
    redis: HealthIndicator;
    memory: HealthIndicator;
    disk?: HealthIndicator;
  };
}

export interface HealthIndicator {
  status: 'up' | 'down';
  message?: string;
  responseTime?: number;
  details?: any;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Comprehensive health check that verifies all dependencies
   */
  async getHealthCheck(): Promise<HealthCheckResult> {
    const [dbCheck, redisCheck, memoryCheck] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkMemory(),
    ]);

    const checks = {
      database: dbCheck,
      redis: redisCheck,
      memory: memoryCheck,
    };

    // Determine overall status
    const allUp = Object.values(checks).every((c) => c.status === 'up');
    const someDown = Object.values(checks).some((c) => c.status === 'down');
    const criticalDown =
      checks.database.status === 'down' || checks.redis.status === 'down';

    let status: 'healthy' | 'unhealthy' | 'degraded';
    if (allUp) {
      status = 'healthy';
    } else if (criticalDown) {
      status = 'unhealthy';
    } else {
      status = 'degraded';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    };
  }

  /**
   * Liveness probe - simple check if process is running
   */
  isAlive(): { status: string } {
    return { status: 'alive' };
  }

  /**
   * Readiness probe - check if service can handle requests
   */
  async isReady(): Promise<{ status: string; ready: boolean }> {
    try {
      // Critical dependencies must be up
      const dbCheck = await this.checkDatabase();

      if (dbCheck.status === 'down') {
        return { status: 'not ready', ready: false };
      }

      return { status: 'ready', ready: true };
    } catch (error) {
      this.logger.error('Readiness check failed:', error);
      return { status: 'not ready', ready: false };
    }
  }

  /**
   * Check database connectivity and performance
   */
  private async checkDatabase(): Promise<HealthIndicator> {
    const startTime = Date.now();

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;

      // Warn if response time is slow (> 1s)
      if (responseTime > 1000) {
        return {
          status: 'up',
          message: 'Database connected but slow',
          responseTime,
          details: { warning: 'Response time exceeds 1000ms' },
        };
      }

      return {
        status: 'up',
        message: 'Database connected',
        responseTime,
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return {
        status: 'down',
        message: 'Database unreachable',
        responseTime: Date.now() - startTime,
        details: { error: error.message },
      };
    }
  }

  /**
   * Check Redis connectivity and performance
   */
  private async checkRedis(): Promise<HealthIndicator> {
    const startTime = Date.now();

    try {
      // Simple PING via Redis
      await this.redis.set('health:ping', 'pong', 10);
      const result = await this.redis.get('health:ping');
      const responseTime = Date.now() - startTime;

      if (result !== 'pong') {
        return {
          status: 'down',
          message: 'Redis read/write failed',
          responseTime,
        };
      }

      // Warn if response time is slow (> 100ms for in-memory cache)
      if (responseTime > 100) {
        return {
          status: 'up',
          message: 'Redis connected but slow',
          responseTime,
          details: { warning: 'Response time exceeds 100ms' },
        };
      }

      return {
        status: 'up',
        message: 'Redis connected',
        responseTime,
      };
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return {
        status: 'down',
        message: 'Redis unreachable',
        responseTime: Date.now() - startTime,
        details: { error: error.message },
      };
    }
  }

  /**
   * Check memory usage
   */
  private checkMemory(): HealthIndicator {
    const used = process.memoryUsage();
    const totalMemory = 2 * 1024 * 1024 * 1024; // 2GB default
    const memoryUsagePercent = (used.heapUsed / used.heapTotal) * 100;

    // Warn if memory usage is high (> 80%)
    if (memoryUsagePercent > 80) {
      return {
        status: 'up',
        message: 'High memory usage',
        details: {
          heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
          rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
          usagePercent: `${memoryUsagePercent.toFixed(2)}%`,
          warning: 'Memory usage exceeds 80%',
        },
      };
    }

    return {
      status: 'up',
      message: 'Memory usage normal',
      details: {
        heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
        usagePercent: `${memoryUsagePercent.toFixed(2)}%`,
      },
    };
  }
}
