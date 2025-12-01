import { TimeSession, SessionType } from "../model/time-session.entity";
import { TimerRepository } from "../provider/timer.repository";

export class SwitchTaskUseCase {
    constructor(private timerRepository: TimerRepository) { }

    async execute(
        userId: string,
        newTaskId: string,
        type: SessionType = "WORK",
        splitReason: string = "TASK_SWITCH"
    ): Promise<{ oldSession: TimeSession; newSession: TimeSession }> {
        // Get current active session
        const activeSession = await this.timerRepository.findActiveSession(userId);
        if (!activeSession) {
            throw new Error("No active timer session found");
        }

        // Stop the current session as "completed" since the work done is valid
        const stoppedSession = activeSession.split(new Date(), true, splitReason);
        await this.timerRepository.update(stoppedSession);

        // Create a new session for the new task
        const newSession = TimeSession.create({
            userId,
            taskId: newTaskId,
            startedAt: new Date(),
            type,
            parentSessionId: stoppedSession.id as string,
        });

        const createdSession = await this.timerRepository.create(newSession);

        return {
            oldSession: stoppedSession,
            newSession: createdSession,
        };
    }
}
