import { DailyMetrics } from "../model/daily-metrics.entity";

export interface AnalyticsRepository {
  save(metrics: DailyMetrics): Promise<void>;
  findByDate(userId: string, date: Date): Promise<DailyMetrics | null>;
  getRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DailyMetrics[]>;
  getRangeDescending(userId: string, limit: number): Promise<DailyMetrics[]>;
}
