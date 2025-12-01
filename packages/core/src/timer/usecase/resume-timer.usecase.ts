import { TimeSession } from "../model/time-session.entity";
import { TimerRepository } from "../provider/timer.repository";

export class ResumeTimerUseCase {
    constructor(private timerRepository: TimerRepository) { }

    async execute(userId: string, pauseStartedAt: Date, pauseEndedAt: Date = new Date()): Promise<TimeSession> {
        const activeSession = await this.timerRepository.findActiveSession(userId);
        if (!activeSession) {
            throw new Error("No active timer session found");
        }

        const resumedSession = activeSession.resume(pauseStartedAt, pauseEndedAt);
        return this.timerRepository.update(resumedSession);
    }
}
