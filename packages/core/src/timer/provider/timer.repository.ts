import { TimeSession, SessionType } from "../model/time-session.entity";

export interface SessionFilters {
  taskId?: string;
  type?: SessionType;
  startDate?: Date;
  endDate?: Date;
  completedOnly?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedSessions {
  sessions: TimeSession[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SessionStats {
  totalSessions: number;
  totalWorkSessions: number;
  totalBreakSessions: number;
  totalMinutesWorked: number;
  totalBreakMinutes: number;
  pomodorosCompleted: number;
  totalPauses: number;
  totalPauseSeconds: number;
  completedSessions: number;
  byType: {
    WORK: { count: number; totalMinutes: number };
    SHORT_BREAK: { count: number; totalMinutes: number };
    LONG_BREAK: { count: number; totalMinutes: number };
    CONTINUOUS: { count: number; totalMinutes: number };
  };
}

export interface TimerRepository {
  create(session: TimeSession): Promise<TimeSession>;
  update(session: TimeSession): Promise<TimeSession>;
  findById(id: string): Promise<TimeSession | null>;
  findActiveSession(userId: string): Promise<TimeSession | null>;
  findByTaskId(taskId: string): Promise<TimeSession[]>;
  findByUserId(userId: string): Promise<TimeSession[]>;
  findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TimeSession[]>;

  // New methods for history and stats
  findWithFilters(
    userId: string,
    filters: SessionFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedSessions>;
  getStats(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<SessionStats>;
  getTaskTimeStats(
    userId: string,
    taskId: string,
  ): Promise<{
    totalSessions: number;
    totalMinutes: number;
    completedSessions: number;
    lastSessionAt?: Date;
  }>;

  findByUserIdWithTaskAndProject(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<
    Array<{
      id: string;
      startedAt: Date;
      duration: number | null;
      task: {
        id: string;
        project: {
          name: string;
        } | null;
      } | null;
    }>
  >;
}
