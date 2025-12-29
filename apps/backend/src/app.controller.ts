import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { AppService } from './app.service';
import { PrismaService } from './database/prisma.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

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

  /**
   * Migration utility - fix null completed fields
   * Updates all projects with NULL completed field to false
   */
  @Public()
  @Post('migrate/fix-completed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Fix null completed fields in projects',
    description:
      'Migration utility that updates all projects where the completed field is NULL, setting it to false. Also updates the updatedAt timestamp.',
  })
  @ApiResponse({
    status: 200,
    description: 'Migration completed successfully',
    schema: {
      example: {
        success: true,
        updated: 15,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Migration failed',
    schema: {
      example: {
        success: false,
        error: 'Database connection error',
      },
    },
  })
  async fixCompleted() {
    try {
      const result = await this.prisma.$executeRaw`
        UPDATE "Project" 
        SET completed = false, "updatedAt" = NOW()
        WHERE completed IS NULL
      `;

      return { success: true, updated: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Debug endpoint - list all projects
   * Returns a debug view of all projects with key fields
   */
  @Public()
  @Get('debug/projects')
  @ApiOperation({
    summary: 'Debug - list all projects',
    description:
      'Returns a debug view of all projects in the database. Useful for troubleshooting data issues.',
  })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    schema: {
      example: {
        count: 5,
        projects: [
          {
            id: 'clx1234567890',
            name: 'My Project',
            archived: false,
            completed: false,
            workspaceId: 'workspace123',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Debug query failed',
    schema: {
      example: {
        success: false,
        error: 'Database query failed',
      },
    },
  })
  async debugProjects() {
    try {
      const projects = await this.prisma.project.findMany({
        select: {
          id: true,
          name: true,
          archived: true,
          completed: true,
          workspaceId: true,
        },
      });

      return { count: projects.length, projects };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
