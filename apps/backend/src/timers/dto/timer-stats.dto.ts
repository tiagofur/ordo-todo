import { IsOptional, IsDateString } from 'class-validator';

export class GetTimerStatsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export interface TimerStatsResponse {
  // Summary stats
  totalSessions: number;
  totalWorkSessions: number;
  totalBreakSessions: number;
  totalMinutesWorked: number;
  totalBreakMinutes: number;
  pomodorosCompleted: number;

  // Averages
  avgSessionDuration: number; // minutes
  avgFocusScore: number; // 0-100

  // Pause metrics
  totalPauses: number;
  avgPausesPerSession: number;
  totalPauseMinutes: number;

  // Completion rate
  completionRate: number; // 0-1

  // By type breakdown
  byType: {
    WORK: { count: number; totalMinutes: number };
    SHORT_BREAK: { count: number; totalMinutes: number };
    LONG_BREAK: { count: number; totalMinutes: number };
    CONTINUOUS: { count: number; totalMinutes: number };
  };

  // Daily breakdown (last 7 days)
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
