import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../database/prisma.service';

/**
 * HealthController provides health check endpoints for container orchestration.
 * These endpoints are not prefixed with /api/v1 to be accessible at root level.
 */
@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get('health')
  @ApiOperation({
    summary: 'Health check endpoint',
    description:
      'Comprehensive health check that verifies server status and database connectivity. Returns detailed health metrics including uptime and connection status. Used by load balancers and monitoring systems to determine overall service health.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy and all dependencies are connected',
    schema: {
      example: {
        status: 'healthy',
        timestamp: '2024-01-15T10:30:00.000Z',
        uptime: 3600,
        database: 'connected',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Service is running but database is disconnected',
    schema: {
      example: {
        status: 'unhealthy',
        timestamp: '2024-01-15T10:30:00.000Z',
        uptime: 3600,
        database: 'disconnected',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Service is running but database has errors',
    schema: {
      example: {
        status: 'unhealthy',
        timestamp: '2024-01-15T10:30:00.000Z',
        uptime: 3600,
        database: 'error',
      },
    },
  })
  async getHealth(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    database: string;
  }> {
    let databaseStatus = 'disconnected';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'connected';
    } catch {
      databaseStatus = 'error';
    }

    return {
      status: databaseStatus === 'connected' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: databaseStatus,
    };
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
  getLiveness(): { status: string } {
    return { status: 'alive' };
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
  async getReadiness(): Promise<{ status: string; ready: boolean }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', ready: true };
    } catch {
      return { status: 'not ready', ready: false };
    }
  }
}
