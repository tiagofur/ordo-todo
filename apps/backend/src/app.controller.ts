import { Controller, Get, Post } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { AppService } from './app.service';
import { PrismaService } from './database/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Post('migrate/fix-completed')
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

  @Public()
  @Get('debug/projects')
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
