import { UseCase } from "../../shared/use-case";
import { TimeSession } from "../../timer/model/time-session.entity";
import { AIProfile } from "../model/ai-profile.entity";
import { AIProfileRepository } from "../provider/ai-profile.repository";

export interface LearnFromSessionInput {
    session: TimeSession;
}

export class LearnFromSessionUseCase implements UseCase<LearnFromSessionInput, AIProfile> {
    constructor(private readonly aiProfileRepository: AIProfileRepository) {}

    async execute(input: LearnFromSessionInput): Promise<AIProfile> {
        const { session } = input;

        // Only learn from completed WORK or CONTINUOUS sessions
        if (!session.props.wasCompleted) {
            throw new Error("Can only learn from completed sessions");
        }
        if (session.props.type !== "WORK" && session.props.type !== "CONTINUOUS") {
            throw new Error("Can only learn from WORK or CONTINUOUS sessions");
        }

        // Get or create AI profile for the user
        const profile = await this.aiProfileRepository.findOrCreate(session.props.userId);

        // Extract temporal information
        const startedAt = session.props.startedAt;
        const hour = startedAt.getHours(); // 0-23
        const dayOfWeek = startedAt.getDay(); // 0-6 (0=Sunday)

        // Calculate productivity score based on:
        // 1. Focus score (fewer pauses = higher score)
        // 2. Completion status (completed = bonus)
        // 3. Duration (longer focused time = better)
        const productivityScore = this.calculateProductivityScore(session);

        // Update peak hours and peak days
        let updatedProfile = profile
            .updatePeakHour(hour, productivityScore)
            .updatePeakDay(dayOfWeek, productivityScore);

        // Update average task duration if this was a task-based session
        if (session.props.taskId && session.props.duration) {
            // For now, we'll just use the current duration
            // In a real scenario, we'd query recent task durations
            updatedProfile = updatedProfile.recalculateAvgDuration([session.props.duration]);
        }

        // Save the updated profile
        return await this.aiProfileRepository.update(updatedProfile);
    }

    /**
     * Calculate productivity score based on session characteristics
     * Returns a value between 0 and 1
     */
    private calculateProductivityScore(session: TimeSession): number {
        const duration = session.props.duration ?? 0; // in minutes
        const pauseCount = session.props.pauseCount ?? 0;
        const totalPauseTime = session.props.totalPauseTime ?? 0; // in seconds
        const wasCompleted = session.props.wasCompleted;

        // Base score starts at 0.5
        let score = 0.5;

        // Bonus for completion (up to +0.2)
        if (wasCompleted) {
            score += 0.2;
        }

        // Duration factor (longer focused work = better, up to +0.2)
        // Sessions of 25-50 minutes are ideal
        if (duration >= 25 && duration <= 50) {
            score += 0.2;
        } else if (duration >= 10 && duration < 25) {
            score += 0.1;
        } else if (duration > 50) {
            // Very long sessions might indicate less focus
            score += 0.1;
        }

        // Pause penalty (fewer pauses = better)
        // Deduct 0.05 per pause, but cap at -0.3
        const pausePenalty = Math.min(pauseCount * 0.05, 0.3);
        score -= pausePenalty;

        // Calculate focus score (work time vs pause time)
        if (duration > 0) {
            const totalSessionTime = (duration * 60) + totalPauseTime; // convert to seconds
            const workTimeRatio = (duration * 60) / totalSessionTime;

            // If work time ratio is high, add bonus (up to +0.2)
            if (workTimeRatio >= 0.9) {
                score += 0.2;
            } else if (workTimeRatio >= 0.8) {
                score += 0.15;
            } else if (workTimeRatio >= 0.7) {
                score += 0.1;
            } else if (workTimeRatio < 0.5) {
                // Penalize if more pause time than work time
                score -= 0.2;
            }
        }

        // Ensure score is between 0 and 1
        return Math.max(0, Math.min(1, score));
    }
}
