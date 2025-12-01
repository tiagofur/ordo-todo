import { Entity, EntityProps } from "../../shared/entity";

export type SessionType = "WORK" | "SHORT_BREAK" | "LONG_BREAK" | "CONTINUOUS";

export interface PauseRecord {
    startedAt: Date;
    endedAt: Date;
    duration: number; // in seconds
}



export interface TimeSessionProps extends EntityProps {
    taskId?: string;
    userId: string;
    startedAt: Date;
    endedAt?: Date;
    duration?: number; // in minutes (excludes pause time)
    type: SessionType;
    wasCompleted: boolean;
    wasInterrupted: boolean;
    pauseCount?: number;
    totalPauseTime?: number; // in seconds
    pauseData?: PauseRecord[];
    currentPauseStart?: Date;
    parentSessionId?: string;
    splitReason?: string;
    createdAt?: Date;
}

export class TimeSession extends Entity<TimeSessionProps> {
    constructor(props: TimeSessionProps) {
        super({
            ...props,
            type: props.type ?? "WORK",
            wasCompleted: props.wasCompleted ?? false,
            wasInterrupted: props.wasInterrupted ?? false,
            pauseCount: props.pauseCount ?? 0,
            totalPauseTime: props.totalPauseTime ?? 0,
            pauseData: props.pauseData ?? [],
            createdAt: props.createdAt ?? new Date(),
        });
    }

    static create(props: Omit<TimeSessionProps, "id" | "createdAt" | "wasCompleted" | "wasInterrupted" | "pauseCount" | "totalPauseTime" | "pauseData" | "currentPauseStart">): TimeSession {
        return new TimeSession({
            ...props,
            wasCompleted: false,
            wasInterrupted: false,
            pauseCount: 0,
            totalPauseTime: 0,
            pauseData: [],
            currentPauseStart: undefined,
        });
    }

    pause(pauseStartedAt: Date = new Date()): TimeSession {
        // If already paused, don't pause again or update start time? 
        // For now assume it's valid call.
        return this.clone({
            pauseCount: (this.props.pauseCount ?? 0) + 1,
            currentPauseStart: pauseStartedAt,
        });
    }

    resume(pauseStartedAt: Date, pauseEndedAt: Date = new Date()): TimeSession {
        // Use stored currentPauseStart if available, otherwise use argument
        const actualPauseStart = this.props.currentPauseStart ?? pauseStartedAt;

        const pauseDuration = Math.floor((pauseEndedAt.getTime() - actualPauseStart.getTime()) / 1000);
        const pauseRecord: PauseRecord = {
            startedAt: actualPauseStart,
            endedAt: pauseEndedAt,
            duration: pauseDuration,
        };

        return this.clone({
            totalPauseTime: (this.props.totalPauseTime ?? 0) + pauseDuration,
            pauseData: [...(this.props.pauseData ?? []), pauseRecord],
            currentPauseStart: undefined,
        });
    }

    stop(endedAt: Date = new Date(), wasCompleted: boolean = false, wasInterrupted: boolean = false): TimeSession {
        // If stopped while paused, we need to handle the pending pause.
        // Usually stop implies finishing the session.
        // If paused, the duration should exclude the current pause duration?
        // Or should we consider the session ended at the start of the pause?
        // Let's assume we count time up to 'endedAt', excluding 'totalPauseTime'.
        // If currently paused, we should probably add the current pause to totalPauseTime?
        // Or just ignore the current pause "gap" and say it ended now.

        let extraPauseTime = 0;
        if (this.props.currentPauseStart) {
            // If we stop while paused, the time from pauseStart to now is technically pause time, 
            // but since we are stopping, maybe we just consider the work ended at pauseStart?
            // But 'endedAt' is passed.
            // Let's stick to simple logic: total duration = (endedAt - startedAt) - totalPauseTime.
            // If we are paused, we should probably close the pause first?
            // For simplicity, let's assume the user resumes then stops, or we just calculate active time.

            // If we are paused, the time since pauseStart is NOT work time.
            // So we should add it to totalPauseTime.
            extraPauseTime = Math.floor((endedAt.getTime() - this.props.currentPauseStart.getTime()) / 1000);
        }

        const totalMs = endedAt.getTime() - this.props.startedAt.getTime();
        const totalSeconds = Math.floor(totalMs / 1000);
        const activeSeconds = totalSeconds - (this.props.totalPauseTime ?? 0) - extraPauseTime;
        const durationMinutes = Math.round(activeSeconds / 60);

        return this.clone({
            endedAt,
            duration: durationMinutes,
            wasCompleted,
            wasInterrupted,
            currentPauseStart: undefined, // Clear pause state
            totalPauseTime: (this.props.totalPauseTime ?? 0) + extraPauseTime,
        });
    }

    split(endedAt: Date = new Date(), wasCompleted: boolean = true, splitReason: string = "TASK_SWITCH"): TimeSession {
        let extraPauseTime = 0;
        if (this.props.currentPauseStart) {
            extraPauseTime = Math.floor((endedAt.getTime() - this.props.currentPauseStart.getTime()) / 1000);
        }

        const totalMs = endedAt.getTime() - this.props.startedAt.getTime();
        const totalSeconds = Math.floor(totalMs / 1000);
        const activeSeconds = totalSeconds - (this.props.totalPauseTime ?? 0) - extraPauseTime;
        const durationMinutes = Math.round(activeSeconds / 60);

        return this.clone({
            endedAt,
            duration: durationMinutes,
            wasCompleted,
            wasInterrupted: false,
            splitReason,
            currentPauseStart: undefined,
            totalPauseTime: (this.props.totalPauseTime ?? 0) + extraPauseTime,
        });
    }
}
