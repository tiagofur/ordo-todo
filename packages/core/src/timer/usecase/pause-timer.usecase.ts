import { TimeSession } from "../model/time-session.entity";
import { TimerRepository } from "../provider/timer.repository";

export class PauseTimerUseCase {
    constructor(private timerRepository: TimerRepository) { }

    async execute(userId: string, pauseStartedAt: Date = new Date()): Promise<TimeSession> {
        const activeSession = await this.timerRepository.findActiveSession(userId);
        if (!activeSession) {
            throw new Error("No active timer session found");
        }

        const pausedSession = activeSession.pause(pauseStartedAt);
        return this.timerRepository.update(pausedSession);
    }
}
