import { TimeSession } from "../model/time-session.entity";
import { TimerRepository } from "../provider/timer.repository";

export class StopTimerUseCase {
    constructor(private timerRepository: TimerRepository) { }

    async execute(userId: string, wasCompleted: boolean = false): Promise<TimeSession> {
        const activeSession = await this.timerRepository.findActiveSession(userId);
        if (!activeSession) {
            throw new Error("No active timer session found");
        }

        const stoppedSession = activeSession.stop(new Date(), wasCompleted, !wasCompleted);
        return this.timerRepository.update(stoppedSession);
    }
}
