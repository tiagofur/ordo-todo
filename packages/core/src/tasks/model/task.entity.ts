import { Entity, EntityProps } from "../../shared/entity";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface TaskProps extends EntityProps {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  startDate?: Date; // When task can be started
  scheduledDate?: Date; // When task is scheduled to be worked on
  scheduledTime?: string; // Time of day scheduled (e.g., "14:30")
  scheduledEndTime?: string; // End time of day (e.g., "15:30")
  isTimeBlocked?: boolean; // Whether task is time blocked in calendar
  completedAt?: Date;
  projectId: string;
  ownerId: string;
  assigneeId?: string | null;
  parentTaskId?: string;
  subTasks?: Task[];
  estimatedTime?: number;
  tags?: any[]; // Using any[] to avoid circular dependency for now, or import Tag
  project?: { id: string; name: string; color: string }; // Project information for display
  assignee?: { id: string; name: string; image?: string }; // Assignee information for display
  owner?: { id: string; name: string; image?: string }; // Owner information for display
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  recurrence?: RecurrenceProps;
}

export interface RecurrenceProps {
  pattern: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
  interval?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: Date;
}

export class Task extends Entity<TaskProps> {
  constructor(props: TaskProps) {
    super({
      ...props,
      status: props.status ?? "TODO",
      priority: props.priority ?? "MEDIUM",
      subTasks: props.subTasks ?? [],
      isDeleted: props.isDeleted ?? false,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });
  }

  static create(
    props: Omit<TaskProps, "id" | "createdAt" | "updatedAt" | "status" | "isDeleted" | "deletedAt">,
  ): Task {
    return new Task({
      ...props,
      status: "TODO",
      priority: props.priority ?? "MEDIUM",
      isDeleted: false,
      deletedAt: undefined,
    });
  }

  complete(): Task {
    return this.clone({
      status: "COMPLETED",
      updatedAt: new Date(),
    });
  }

  updateStatus(status: TaskStatus): Task {
    return this.clone({
      status,
      updatedAt: new Date(),
    });
  }

  update(
    props: Partial<Omit<TaskProps, "id" | "ownerId" | "createdAt">>,
  ): Task {
    return this.clone({
      ...props,
      updatedAt: new Date(),
    });
  }

  softDelete(): Task {
    return this.clone({
      isDeleted: true,
      deletedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  restore(): Task {
    return this.clone({
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: new Date(),
    });
  }
}
