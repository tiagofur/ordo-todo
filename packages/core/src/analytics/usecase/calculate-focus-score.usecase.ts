export interface FocusScoreInput {
    totalWorkSeconds: number;
    totalPauseSeconds: number;
    pauseCount: number;
}

export class CalculateFocusScoreUseCase {
    execute(input: FocusScoreInput): number {
        const { totalWorkSeconds, totalPauseSeconds, pauseCount } = input;

        // If no work time, return 0
        if (totalWorkSeconds <= 0) {
            return 0;
        }

        // Base score: ratio of work time to total time
        const totalTime = totalWorkSeconds + totalPauseSeconds;
        const workRatio = totalWorkSeconds / totalTime;

        // Penalty for frequent pauses (each pause reduces score slightly)
        // Each pause reduces by 2% (max 20% penalty)
        const pausePenalty = Math.min(pauseCount * 0.02, 0.2);

        // Calculate final score (0-1 range)
        let focusScore = workRatio - pausePenalty;

        // Ensure score is between 0 and 1
        focusScore = Math.max(0, Math.min(1, focusScore));

        return focusScore;
    }
}
