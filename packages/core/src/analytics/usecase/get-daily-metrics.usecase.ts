import { DailyMetrics } from "../model/daily-metrics.entity";
import { AnalyticsRepository } from "../provider/analytics.repository";

export class GetDailyMetricsUseCase {
    constructor(private analyticsRepository: AnalyticsRepository) { }

    async execute(userId: string, date: Date = new Date()): Promise<DailyMetrics> {
        // Normalize date to start of day or just use the date part
        // For simplicity, let's assume the repository handles date matching (ignoring time)
        // or we pass a specific date object.

        // Let's normalize to YYYY-MM-DD in the logic if needed, but Date object is standard.
        // We'll rely on the repository to find by "day".

        let metrics = await this.analyticsRepository.findByDate(userId, date);

        if (!metrics) {
            // Return empty metrics for UI to display zeros, but don't persist yet?
            // Or create new?
            // Let's return a draft/new instance without ID.
            metrics = DailyMetrics.create({
                userId,
                date,
            });
        }

        return metrics;
    }
}
