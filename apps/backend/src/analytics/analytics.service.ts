import { Injectable, Inject } from '@nestjs/common';
import type { AnalyticsRepository } from '@ordo-todo/core';
import { GetDailyMetricsUseCase } from '@ordo-todo/core';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject('AnalyticsRepository')
    private readonly analyticsRepository: AnalyticsRepository,
  ) {}

  async getDailyMetrics(userId: string, date?: Date) {
    const getDailyMetricsUseCase = new GetDailyMetricsUseCase(
      this.analyticsRepository,
    );
    const targetDate = date ?? new Date();
    const metrics = await getDailyMetricsUseCase.execute(userId, targetDate);
    return metrics.props;
  }

  async getWeeklyMetrics(userId: string, weekStart?: Date) {
    const startDate = weekStart ?? this.getStartOfWeek(new Date());
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const metrics = await this.analyticsRepository.getRange(
      userId,
      startDate,
      endDate,
    );

    return metrics.map((m) => m.props);
  }

  async getMonthlyMetrics(userId: string, monthStart?: Date) {
    const startDate = monthStart ?? this.getStartOfMonth(new Date());
    const endDate = this.getEndOfMonth(startDate);

    const metrics = await this.analyticsRepository.getRange(
      userId,
      startDate,
      endDate,
    );

    return metrics.map((m) => m.props);
  }

  async getDateRangeMetrics(
    userId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const metrics = await this.analyticsRepository.getRange(
      userId,
      startDate,
      endDate,
    );

    return metrics.map((m) => m.props);
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // Sunday is 0
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getStartOfMonth(date: Date): Date {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getEndOfMonth(date: Date): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d;
  }
}
