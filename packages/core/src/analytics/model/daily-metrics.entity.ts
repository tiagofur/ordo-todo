import { Entity, EntityProps } from "../../shared/entity";

export interface DailyMetricsProps extends EntityProps {
    userId: string;
    date: Date;
    tasksCreated: number;
    tasksCompleted: number;
    minutesWorked: number;
    pomodorosCompleted: number;
    focusScore?: number;
    createdAt?: Date;
}

export class DailyMetrics extends Entity<DailyMetricsProps> {
    constructor(props: DailyMetricsProps) {
        super({
            ...props,
            tasksCreated: props.tasksCreated ?? 0,
            tasksCompleted: props.tasksCompleted ?? 0,
            minutesWorked: props.minutesWorked ?? 0,
            pomodorosCompleted: props.pomodorosCompleted ?? 0,
            createdAt: props.createdAt ?? new Date(),
        });
    }

    static create(props: Omit<DailyMetricsProps, "id" | "createdAt" | "tasksCreated" | "tasksCompleted" | "minutesWorked" | "pomodorosCompleted">): DailyMetrics {
        return new DailyMetrics({
            ...props,
            tasksCreated: 0,
            tasksCompleted: 0,
            minutesWorked: 0,
            pomodorosCompleted: 0,
        });
    }

    incrementTasksCreated(): DailyMetrics {
        return this.clone({ tasksCreated: this.props.tasksCreated + 1 });
    }

    incrementTasksCompleted(): DailyMetrics {
        return this.clone({ tasksCompleted: this.props.tasksCompleted + 1 });
    }

    addMinutesWorked(minutes: number): DailyMetrics {
        return this.clone({ minutesWorked: this.props.minutesWorked + minutes });
    }

    incrementPomodoros(): DailyMetrics {
        return this.clone({ pomodorosCompleted: this.props.pomodorosCompleted + 1 });
    }

    updateFocusScore(score: number): DailyMetrics {
        return this.clone({ focusScore: Math.max(0, Math.min(1, score)) });
    }
}
