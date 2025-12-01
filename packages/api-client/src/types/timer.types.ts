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
