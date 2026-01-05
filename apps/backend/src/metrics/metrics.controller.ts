import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { MetricsService } from '../common/services/metrics.service';

/**
 * Metrics Controller
 *
 * Exposes Prometheus metrics endpoint for monitoring and alerting.
 * Follows OpenMetrics exposition format for Prometheus scraping.
 *
 * @see {@link https://prometheus.io/docs/practices/exposition/ | Prometheus Exposition Format}
 * @see {@link https://docs.nestjs.com/monitoring/configuration | NestJS Monitoring Configuration}
 */
@ApiTags('Metrics')
@Controller()
export class MetricsController {
  constructor(
    @Inject(MetricsService)
    private readonly metricsService: MetricsService,
  ) {}

  /**
   * Exposes all Prometheus metrics
   *
   * Returns metrics in OpenMetrics format for scraping.
   * Metrics include:
   * - HTTP: request duration, request count, error count
   * - Business: tasks created, tasks completed, pomodoros, focus score
   * - Database: query duration, connection pool
   * - System: memory usage, CPU (if available)
   *
   * @returns Promise resolving to Prometheus-formatted metrics string
   *
   * @example
   * ```bash
   * curl http://localhost:3101/metrics
   * ```
   *
   * @since 1.0.0
   */
  @Public()
  @Get('metrics')
  @ApiOperation({
    summary: 'Get application metrics',
    description:
      'Returns all application metrics in Prometheus format. Includes HTTP, business, database, and system KPIs. Can be scraped by Prometheus or other monitoring tools. This endpoint is public and should be protected by network policies.',
  })
  @ApiResponse({
    status: 200,
    description: 'Metrics retrieved successfully',
    content: {
      'text/plain': {
        example:
          '# HELP http_requests_total Total number of HTTP requests\n' +
          '# TYPE http_requests_total counter\n' +
          'http_requests_total{method="GET",route="/api/v1/tasks",status_code="200"} 1523\n' +
          '# HELP http_request_duration_seconds Duration of HTTP requests in seconds\n' +
          '# TYPE http_request_duration_seconds histogram\n' +
          'http_request_duration_seconds_bucket{method="GET",route="/api/v1/tasks",status_code="200",le="0.05"} 52\n',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getMetrics(): Promise<string> {
    return await this.metricsService.getMetrics();
  }
}
