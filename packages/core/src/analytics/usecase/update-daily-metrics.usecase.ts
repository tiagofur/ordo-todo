import { DailyMetrics } from "../model/daily-metrics.entity";
import { AnalyticsRepository } from "../provider/analytics.repository";

export interface UpdateDailyMetricsInput {
    userId: string;
    date: Date;
    tasksCreated?: number;
    tasksCompleted?: number;
    minutesWorked?: number;
    pomodorosCompleted?: number;
    shortBreaksCompleted?: number;
    longBreaksCompleted?: number;
    breakMinutes?: number;
    focusScore?: number;
}

export class UpdateDailyMetricsUseCase {
    constructor(private analyticsRepository: AnalyticsRepository) { }

    async execute(input: UpdateDailyMetricsInput): Promise<DailyMetrics> {
        // Normalize date to start of day (ignore time)
        const normalizedDate = new Date(input.date);
        normalizedDate.setHours(0, 0, 0, 0);

        // Find or create daily metrics
        let metrics = await this.analyticsRepository.findByDate(input.userId, normalizedDate);

        if (!metrics) {
            metrics = DailyMetrics.create({
                userId: input.userId,
                date: normalizedDate,
            });
        }

        // Apply increments
        if (input.tasksCreated) {
            for (let i = 0; i < input.tasksCreated; i++) {
                metrics = metrics.incrementTasksCreated();
            }
        }

        if (input.tasksCompleted) {
            for (let i = 0; i < input.tasksCompleted; i++) {
                metrics = metrics.incrementTasksCompleted();
            }
        }

        if (input.minutesWorked) {
            metrics = metrics.addMinutesWorked(input.minutesWorked);
        }

        if (input.pomodorosCompleted) {
            for (let i = 0; i < input.pomodorosCompleted; i++) {
                metrics = metrics.incrementPomodoros();
            }
        }

        if (input.shortBreaksCompleted) {
            for (let i = 0; i < input.shortBreaksCompleted; i++) {
                metrics = metrics.incrementShortBreaks();
            }
        }

        if (input.longBreaksCompleted) {
            for (let i = 0; i < input.longBreaksCompleted; i++) {
                metrics = metrics.incrementLongBreaks();
            }
        }

        if (input.breakMinutes) {
            metrics = metrics.addBreakMinutes(input.breakMinutes);
        }

        if (input.focusScore !== undefined) {
            metrics = metrics.updateFocusScore(input.focusScore);
        }

        // Save and return
        await this.analyticsRepository.save(metrics);
        return metrics;
    }
}
