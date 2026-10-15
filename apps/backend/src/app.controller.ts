import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Root endpoint - API welcome message
   * Returns a greeting message to confirm the API is running
   */
  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get API welcome message',
    description:
      'Returns a greeting message from the Ordo Todo API. Used to verify the API is running.',
  })
  @ApiResponse({
    status: 200,
    description: 'Welcome message returned successfully',
    schema: {
      example: 'Hello from Ordo Todo API!',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Health check endpoint
   * Returns API status and current timestamp
   */
  @Public()
  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description:
      'Returns the current health status of the API. Useful for monitoring and load balancer health checks.',
  })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2025-12-29T12:00:00.000Z',
      },
    },
  })
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
