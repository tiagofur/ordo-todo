import { Entity, EntityProps } from "../../shared/entity";

export interface DailyMetricsProps extends EntityProps {
    userId: string;
    date: Date;
    tasksCreated: number;
    tasksCompleted: number;
    subtasksCompleted: number;
    minutesWorked: number;
    pomodorosCompleted: number;
    shortBreaksCompleted: number;
    longBreaksCompleted: number;
    breakMinutes: number;
    focusScore?: number;
    createdAt?: Date;
}

export class DailyMetrics extends Entity<DailyMetricsProps> {
    constructor(props: DailyMetricsProps) {
        super({
            ...props,
            tasksCreated: props.tasksCreated ?? 0,
            tasksCompleted: props.tasksCompleted ?? 0,
            subtasksCompleted: props.subtasksCompleted ?? 0,
            minutesWorked: props.minutesWorked ?? 0,
            pomodorosCompleted: props.pomodorosCompleted ?? 0,
            shortBreaksCompleted: props.shortBreaksCompleted ?? 0,
            longBreaksCompleted: props.longBreaksCompleted ?? 0,
            breakMinutes: props.breakMinutes ?? 0,
            createdAt: props.createdAt ?? new Date(),
        });
    }

    static create(props: Omit<DailyMetricsProps, "id" | "createdAt" | "tasksCreated" | "tasksCompleted" | "subtasksCompleted" | "minutesWorked" | "pomodorosCompleted" | "shortBreaksCompleted" | "longBreaksCompleted" | "breakMinutes">): DailyMetrics {
        return new DailyMetrics({
            ...props,
            tasksCreated: 0,
            tasksCompleted: 0,
            subtasksCompleted: 0,
            minutesWorked: 0,
            pomodorosCompleted: 0,
            shortBreaksCompleted: 0,
            longBreaksCompleted: 0,
            breakMinutes: 0,
        });
    }

    incrementTasksCreated(): DailyMetrics {
        return this.clone({ tasksCreated: this.props.tasksCreated + 1 });
    }

    incrementTasksCompleted(): DailyMetrics {
        return this.clone({ tasksCompleted: this.props.tasksCompleted + 1 });
    }

    decrementTasksCompleted(): DailyMetrics {
        return this.clone({ tasksCompleted: Math.max(0, this.props.tasksCompleted - 1) });
    }

    incrementSubtasksCompleted(): DailyMetrics {
        return this.clone({ subtasksCompleted: this.props.subtasksCompleted + 1 });
    }

    decrementSubtasksCompleted(): DailyMetrics {
        return this.clone({ subtasksCompleted: Math.max(0, this.props.subtasksCompleted - 1) });
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

    incrementShortBreaks(): DailyMetrics {
        return this.clone({ shortBreaksCompleted: this.props.shortBreaksCompleted + 1 });
    }

    incrementLongBreaks(): DailyMetrics {
        return this.clone({ longBreaksCompleted: this.props.longBreaksCompleted + 1 });
    }

    addBreakMinutes(minutes: number): DailyMetrics {
        return this.clone({ breakMinutes: this.props.breakMinutes + minutes });
    }
}
