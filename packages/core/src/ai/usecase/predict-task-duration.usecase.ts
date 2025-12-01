import { UseCase } from "../../shared/use-case";
import { AIProfile } from "../model/ai-profile.entity";
import { AIProfileRepository } from "../provider/ai-profile.repository";

export interface PredictTaskDurationInput {
    userId: string;
    taskTitle?: string;
    taskDescription?: string;
    category?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}

export interface PredictTaskDurationOutput {
    estimatedMinutes: number;
    confidence: "LOW" | "MEDIUM" | "HIGH";
    reasoning: string;
}

export class PredictTaskDurationUseCase implements UseCase<PredictTaskDurationInput, PredictTaskDurationOutput> {
    constructor(private readonly aiProfileRepository: AIProfileRepository) {}

    async execute(input: PredictTaskDurationInput): Promise<PredictTaskDurationOutput> {
        const { userId, taskTitle, taskDescription, category, priority } = input;

        // Get AI profile for the user
        const profile = await this.aiProfileRepository.findByUserId(userId);

        if (!profile) {
            // Return default estimate if no profile exists
            return {
                estimatedMinutes: 30,
                confidence: "LOW",
                reasoning: "Using default estimate of 30 minutes. Complete more tasks to get personalized predictions!",
            };
        }

        // Base estimate from user's average
        let estimatedMinutes = profile.props.avgTaskDuration;
        let confidence: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM";
        const reasoningParts: string[] = [];

        // Adjust based on category preference
        if (category && profile.props.categoryPreferences[category]) {
            const categoryScore = profile.props.categoryPreferences[category];

            if (categoryScore > 0.7) {
                // User is efficient in this category, reduce estimate by 15%
                estimatedMinutes *= 0.85;
                reasoningParts.push(`You're efficient with ${category} tasks (-15%)`);
                confidence = "HIGH";
            } else if (categoryScore < 0.4) {
                // User struggles with this category, increase estimate by 20%
                estimatedMinutes *= 1.2;
                reasoningParts.push(`${category} tasks typically take you longer (+20%)`);
                confidence = "MEDIUM";
            }
        }

        // Adjust based on priority
        if (priority) {
            switch (priority) {
                case "URGENT":
                    // Urgent tasks often take less time due to focus
                    estimatedMinutes *= 0.9;
                    reasoningParts.push("Urgent priority tends to increase focus (-10%)");
                    break;
                case "HIGH":
                    // High priority tasks might be more complex
                    estimatedMinutes *= 1.1;
                    reasoningParts.push("High priority suggests complexity (+10%)");
                    break;
                case "LOW":
                    // Low priority tasks might be simpler
                    estimatedMinutes *= 0.85;
                    reasoningParts.push("Low priority typically means simpler tasks (-15%)");
                    break;
            }
        }

        // Analyze task title/description for complexity indicators
        const text = `${taskTitle || ""} ${taskDescription || ""}`.toLowerCase();

        if (this.containsComplexityKeywords(text, ["refactor", "redesign", "architecture", "migration"])) {
            estimatedMinutes *= 1.5;
            reasoningParts.push("Complex task keywords detected (+50%)");
        } else if (this.containsComplexityKeywords(text, ["fix", "bug", "issue", "debug"])) {
            estimatedMinutes *= 1.2;
            reasoningParts.push("Debugging tasks can be unpredictable (+20%)");
        } else if (this.containsComplexityKeywords(text, ["simple", "quick", "minor", "small"])) {
            estimatedMinutes *= 0.75;
            reasoningParts.push("Simple task indicators found (-25%)");
        }

        // Round to nearest 5 minutes
        estimatedMinutes = Math.round(estimatedMinutes / 5) * 5;

        // Ensure minimum of 10 minutes
        estimatedMinutes = Math.max(10, estimatedMinutes);

        // Build reasoning
        let reasoning = `Based on your average of ${profile.props.avgTaskDuration} minutes`;
        if (reasoningParts.length > 0) {
            reasoning += `. ${reasoningParts.join(". ")}.`;
        } else {
            reasoning += ".";
        }

        // Adjust confidence based on data availability
        if (!category && !priority && !taskTitle && !taskDescription) {
            confidence = "LOW";
        }

        return {
            estimatedMinutes,
            confidence,
            reasoning,
        };
    }

    private containsComplexityKeywords(text: string, keywords: string[]): boolean {
        return keywords.some((keyword) => text.includes(keyword));
    }
}
