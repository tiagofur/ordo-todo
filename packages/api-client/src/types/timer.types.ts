export type TimerMode = 'POMODORO' | 'CONTINUOUS' | 'HYBRID';
export type SessionType = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK' | 'CONTINUOUS';

export interface TimeSession {
  id: string;
  taskId: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  type: SessionType;
  wasCompleted: boolean;
  wasInterrupted: boolean;
  pauseCount?: number;
  totalPauseTime?: number;
  currentPauseStart?: Date;
  createdAt: Date;
}

export interface StartTimerDto {
  taskId?: string;
  type?: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK' | 'CONTINUOUS';
}

export interface StopTimerDto {
  wasCompleted?: boolean;
}

export interface PauseTimerDto {
  pauseStartedAt?: Date;
}

export interface ResumeTimerDto {
  pauseStartedAt: Date;
}

export interface SwitchTaskDto {
  newTaskId: string;
  type?: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK' | 'CONTINUOUS';
  splitReason?: string;
}

export interface ActiveTimerResponse extends TimeSession {
  elapsedSeconds: number;
  isPaused: boolean;
}

// Session History Types
export interface GetSessionsParams {
  taskId?: string;
  type?: SessionType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  completedOnly?: boolean;
}

export interface PaginatedSessionsResponse {
  sessions: TimeSession[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Timer Stats Types
export interface GetTimerStatsParams {
  startDate?: string;
  endDate?: string;
}

export interface TimerStatsResponse {
  totalSessions: number;
  totalWorkSessions: number;
  totalBreakSessions: number;
  totalMinutesWorked: number;
  totalBreakMinutes: number;
  pomodorosCompleted: number;
  avgSessionDuration: number;
  avgFocusScore: number;
  totalPauses: number;
  avgPausesPerSession: number;
  totalPauseMinutes: number;
  completionRate: number;
  byType: {
    WORK: { count: number; totalMinutes: number };
    SHORT_BREAK: { count: number; totalMinutes: number };
    LONG_BREAK: { count: number; totalMinutes: number };
    CONTINUOUS: { count: number; totalMinutes: number };
  };
  dailyBreakdown: Array<{
    date: string;
    sessions: number;
    minutesWorked: number;
    pomodorosCompleted: number;
  }>;
}

export interface TaskTimeResponse {
  taskId: string;
  taskTitle?: string;
  totalSessions: number;
  totalMinutes: number;
  completedSessions: number;
  avgSessionDuration: number;

  lastSessionAt?: Date;
}

export interface CreateTimerSessionDto {
  taskId: string;
  startedAt: string | Date;
  endedAt?: string | Date;
  type?: SessionType;
  duration?: number;
}

export interface UpdateTimerSessionDto {
  taskId?: string;
  startedAt?: string | Date;
  endedAt?: string | Date;
  type?: SessionType;
  wasCompleted?: boolean;
}

