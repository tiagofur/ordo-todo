import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { HealthService } from './health.service';

/**
 * HealthController provides health check endpoints for container orchestration.
 * These endpoints are not prefixed with /api/v1 to be accessible at root level.
 */
@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get('health')
  @ApiOperation({
    summary: 'Comprehensive health check endpoint',
    description:
      'Detailed health check that verifies all critical dependencies (database, Redis, memory). Returns overall status, response times, and detailed metrics. Used by monitoring systems, load balancers, and orchestration platforms to determine service health.',
  })
  @ApiResponse({
    status: 200,
    description: 'All health checks completed',
    schema: {
      example: {
        status: 'healthy',
        timestamp: '2024-01-15T10:30:00.000Z',
        uptime: 3600,
        checks: {
          database: {
            status: 'up',
            message: 'Database connected',
            responseTime: 15,
          },
          redis: {
            status: 'up',
            message: 'Redis connected',
            responseTime: 5,
          },
          memory: {
            status: 'up',
            message: 'Memory usage normal',
            details: {
              heapUsed: '128MB',
              heapTotal: '256MB',
              rss: '180MB',
              usagePercent: '50.00%',
            },
          },
        },
      },
    },
  })
  async getHealth() {
    return this.healthService.getHealthCheck();
  }

  @Public()
  @Get('health/live')
  @ApiOperation({
    summary: 'Liveness probe endpoint',
    description:
      'Simple liveness probe that checks if the service process is running. Returns immediately without checking dependencies. Used by Kubernetes liveness probes to restart containers that have become unresponsive. If this endpoint fails, the container should be restarted.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service process is running and alive',
    schema: {
      example: {
        status: 'alive',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  getLiveness() {
    return this.healthService.isAlive();
  }

  @Public()
  @Get('health/ready')
  @ApiOperation({
    summary: 'Readiness probe endpoint',
    description:
      'Readiness probe that checks if the service is ready to accept traffic. Verifies database connectivity and other critical dependencies. Used by Kubernetes readiness probes to route traffic only to ready pods. If this endpoint fails, the container should not receive traffic but should not be restarted.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is ready and all dependencies are available',
    schema: {
      example: {
        status: 'ready',
        ready: true,
      },
    },
  })
  @ApiResponse({
    status: 503,
    description:
      'Service is not ready (database or other dependency unavailable)',
    schema: {
      example: {
        status: 'not ready',
        ready: false,
      },
    },
  })
  async getReadiness() {
    const result = await this.healthService.isReady();
    return result.ready
      ? result
      : new (class extends Error {
          constructor() {
            super('Service not ready');
            this.name = 'ServiceNotReadyError';
          }
        })();
  }
}
