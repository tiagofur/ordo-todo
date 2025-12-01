import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('daily')
  getDailyMetrics(
    @CurrentUser() user: RequestUser,
    @Query('date') date?: string,
  ) {
    // Convert string date to Date object if provided
    const parsedDate = date ? new Date(date) : undefined;
    return this.analyticsService.getDailyMetrics(user.id, parsedDate);
  }

  @Get('weekly')
  getWeeklyMetrics(
    @CurrentUser() user: RequestUser,
    @Query('weekStart') weekStart?: string,
  ) {
    const parsedDate = weekStart ? new Date(weekStart) : undefined;
    return this.analyticsService.getWeeklyMetrics(user.id, parsedDate);
  }

  @Get('monthly')
  getMonthlyMetrics(
    @CurrentUser() user: RequestUser,
    @Query('monthStart') monthStart?: string,
  ) {
    const parsedDate = monthStart ? new Date(monthStart) : undefined;
    return this.analyticsService.getMonthlyMetrics(user.id, parsedDate);
  }

  @Get('range')
  getDateRangeMetrics(
    @CurrentUser() user: RequestUser,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.analyticsService.getDateRangeMetrics(
      user.id,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
