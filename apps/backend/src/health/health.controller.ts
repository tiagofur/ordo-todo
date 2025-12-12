import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../database/prisma.service';

/**
 * HealthController provides health check endpoints for container orchestration.
 * These endpoints are not prefixed with /api/v1 to be accessible at root level.
 */
@Controller()
export class HealthController {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Basic health check - returns 200 if the server is running
     */
    @Public()
    @Get('health')
    async getHealth(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        database: string;
    }> {
        let databaseStatus = 'disconnected';

        try {
            // Try a simple query to verify database connection
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

    /**
     * Liveness probe - just checks if the process is running
     */
    @Public()
    @Get('health/live')
    getLiveness(): { status: string } {
        return { status: 'alive' };
    }

    /**
     * Readiness probe - checks if the app is ready to accept traffic
     */
    @Public()
    @Get('health/ready')
    async getReadiness(): Promise<{ status: string; ready: boolean }> {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return { status: 'ready', ready: true };
        } catch {
            return { status: 'not ready', ready: false };
        }
    }
}
