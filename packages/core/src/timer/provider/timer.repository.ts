import { TimeSession } from "../model/time-session.entity";

export interface TimerRepository {
    create(session: TimeSession): Promise<TimeSession>;
    update(session: TimeSession): Promise<TimeSession>;
    findById(id: string): Promise<TimeSession | null>;
    findActiveSession(userId: string): Promise<TimeSession | null>;
    findByTaskId(taskId: string): Promise<TimeSession[]>;
    findByUserId(userId: string): Promise<TimeSession[]>;
}
