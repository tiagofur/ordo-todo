import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { AIService } from './ai.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: RequestUser) {
    return this.aiService.getProfile(user.id);
  }

  @Get('optimal-schedule')
  getOptimalSchedule(
    @CurrentUser() user: RequestUser,
    @Query('topN') topN?: string,
  ) {
    const parsedTopN = topN ? parseInt(topN, 10) : undefined;
    return this.aiService.getOptimalSchedule(user.id, parsedTopN);
  }

  @Get('predict-duration')
  predictTaskDuration(
    @CurrentUser() user: RequestUser,
    @Query('title') title?: string,
    @Query('description') description?: string,
    @Query('category') category?: string,
    @Query('priority') priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
  ) {
    return this.aiService.predictTaskDuration(
      user.id,
      title,
      description,
      category,
      priority,
    );
  }

  @Post('reports/weekly')
  async generateWeeklyReport(
    @CurrentUser() user: RequestUser,
    @Query('weekStart') weekStart?: string,
  ) {
    const parsedWeekStart = weekStart ? new Date(weekStart) : undefined;
    return this.aiService.generateWeeklyReport(user.id, parsedWeekStart);
  }

  @Get('reports')
  getReports(
    @CurrentUser() user: RequestUser,
    @Query('scope') scope?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.aiService.getReports(user.id, {
      scope,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('reports/:id')
  getReport(@Param('id') id: string) {
    return this.aiService.getReport(id);
  }

  @Delete('reports/:id')
  deleteReport(@Param('id') id: string) {
    return this.aiService.deleteReport(id);
  }
}
