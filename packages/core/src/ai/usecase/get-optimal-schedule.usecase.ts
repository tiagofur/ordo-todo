import { UseCase } from "../../shared/use-case";
import { AIProfile } from "../model/ai-profile.entity";
import { AIProfileRepository } from "../provider/ai-profile.repository";

export interface GetOptimalScheduleInput {
    userId: string;
    topN?: number; // Number of hours to return (default: 5)
}

export interface OptimalScheduleOutput {
    peakHours: Array<{
        hour: number; // 0-23
        score: number; // 0-1
        label: string; // e.g., "9:00 AM"
    }>;
    peakDays: Array<{
        day: number; // 0-6 (0=Sunday)
        score: number; // 0-1
        label: string; // e.g., "Monday"
    }>;
    recommendation: string;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export class GetOptimalScheduleUseCase implements UseCase<GetOptimalScheduleInput, OptimalScheduleOutput> {
    constructor(private readonly aiProfileRepository: AIProfileRepository) {}

    async execute(input: GetOptimalScheduleInput): Promise<OptimalScheduleOutput> {
        const { userId, topN = 5 } = input;

        // Get AI profile for the user
        const profile = await this.aiProfileRepository.findByUserId(userId);

        if (!profile) {
            // Return default recommendation if no profile exists yet
            return {
                peakHours: [],
                peakDays: [],
                recommendation: "Start tracking your work sessions to get personalized productivity insights!",
            };
        }

        // Get top peak hours
        const topPeakHours = this.getTopPeakHours(profile, topN);

        // Get top peak days
        const topPeakDays = this.getTopPeakDays(profile, 3); // Always show top 3 days

        // Generate recommendation
        const recommendation = this.generateRecommendation(profile, topPeakHours, topPeakDays);

        return {
            peakHours: topPeakHours,
            peakDays: topPeakDays,
            recommendation,
        };
    }

    private getTopPeakHours(profile: AIProfile, limit: number): Array<{ hour: number; score: number; label: string }> {
        const peakHours = profile.props.peakHours;

        return Object.entries(peakHours)
            .map(([hour, score]) => ({
                hour: parseInt(hour),
                score,
                label: this.formatHour(parseInt(hour)),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    private getTopPeakDays(profile: AIProfile, limit: number): Array<{ day: number; score: number; label: string }> {
        const peakDays = profile.props.peakDays;

        return Object.entries(peakDays)
            .map(([day, score]) => {
                const dayNum = parseInt(day);
                return {
                    day: dayNum,
                    score,
                    label: DAY_NAMES[dayNum] || "Unknown",
                };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    private formatHour(hour: number): string {
        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:00 ${period}`;
    }

    private generateRecommendation(
        profile: AIProfile,
        topHours: Array<{ hour: number; score: number; label: string }>,
        topDays: Array<{ day: number; score: number; label: string }>
    ): string {
        if (topHours.length === 0 && topDays.length === 0) {
            return "Keep tracking your work sessions to discover your peak productivity times!";
        }

        const parts: string[] = [];

        // Hours recommendation
        if (topHours.length > 0) {
            const bestHour = topHours[0];
            if (bestHour && bestHour.score > 0.7) {
                const hourList = topHours.slice(0, 3).map((h) => h.label).join(", ");
                parts.push(`Your peak productivity hours are ${hourList}.`);
            } else if (bestHour && bestHour.score > 0.5) {
                parts.push(`You work well during ${bestHour.label}.`);
            }
        }

        // Days recommendation
        if (topDays.length > 0) {
            const bestDay = topDays[0];
            if (bestDay && bestDay.score > 0.7) {
                const dayList = topDays.slice(0, 2).map((d) => d.label).join(" and ");
                parts.push(`You're most productive on ${dayList}.`);
            }
        }

        // Task duration insight
        const avgDuration = profile.props.avgTaskDuration;
        if (avgDuration > 0) {
            parts.push(`Your average focused work session is ${avgDuration} minutes.`);
        }

        // Completion rate insight
        const completionRate = profile.props.completionRate;
        if (completionRate >= 0.8) {
            parts.push(`You have an excellent task completion rate of ${Math.round(completionRate * 100)}%!`);
        } else if (completionRate < 0.5) {
            parts.push(`Try breaking tasks into smaller chunks to improve your ${Math.round(completionRate * 100)}% completion rate.`);
        }

        return parts.join(" ") || "Keep working to build your productivity profile!";
    }
}
