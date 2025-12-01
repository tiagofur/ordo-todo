import { TimeSession, SessionType } from "../model/time-session.entity";
import { TimerRepository } from "../provider/timer.repository";
import { TaskRepository } from "../../tasks/provider/task.repository";

export class StartTimerUseCase {
    constructor(
        private timerRepository: TimerRepository,
        private taskRepository: TaskRepository
    ) { }

    async execute(userId: string, taskId?: string, type: SessionType = "WORK"): Promise<TimeSession> {
        // Check if there is already an active session
        const activeSession = await this.timerRepository.findActiveSession(userId);
        if (activeSession) {
            // Automatically stop the previous session as interrupted
            const stoppedSession = activeSession.stop(new Date(), false, true);
            await this.timerRepository.update(stoppedSession);
        }

        const session = TimeSession.create({
            userId,
            taskId,
            startedAt: new Date(),
            type,
        });

        const createdSession = await this.timerRepository.create(session);

        // Update task status to IN_PROGRESS if it's a WORK session and taskId is provided
        if (type === "WORK" && taskId) {
            const task = await this.taskRepository.findById(taskId);
            if (task && task.props.status === "TODO") {
                const updatedTask = task.updateStatus("IN_PROGRESS");
                await this.taskRepository.update(updatedTask);
            }
        }

        return createdSession;
    }
}
