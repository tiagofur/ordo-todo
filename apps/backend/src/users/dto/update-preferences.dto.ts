import {
  IsBoolean,
  IsInt,
  IsOptional,
  Min,
  Max,
  IsEnum,
} from 'class-validator';

export enum EnergyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum TimerMode {
  POMODORO = 'POMODORO',
  CONTINUOUS = 'CONTINUOUS',
  HYBRID = 'HYBRID',
}

export class UpdatePreferencesDto {
  // Timer Settings
  @IsEnum(TimerMode)
  @IsOptional()
  timerMode?: TimerMode;

  @IsInt()
  @Min(1)
  @Max(120)
  @IsOptional()
  pomodoroDuration?: number;

  @IsInt()
  @Min(1)
  @Max(60)
  @IsOptional()
  shortBreakDuration?: number;

  @IsInt()
  @Min(1)
  @Max(120)
  @IsOptional()
  longBreakDuration?: number;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  pomodorosUntilLongBreak?: number;

  // Notifications & Sound
  @IsBoolean()
  @IsOptional()
  enableSounds?: boolean;

  @IsBoolean()
  @IsOptional()
  enableNotifications?: boolean;

  // AI General
  @IsBoolean()
  @IsOptional()
  enableAI?: boolean;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  aiAggressiveness?: number;

  // AI Granular Settings
  @IsBoolean()
  @IsOptional()
  aiSuggestTaskDurations?: boolean;

  @IsBoolean()
  @IsOptional()
  aiSuggestPriorities?: boolean;

  @IsBoolean()
  @IsOptional()
  aiSuggestScheduling?: boolean;

  @IsBoolean()
  @IsOptional()
  aiWeeklyReports?: boolean;

  // Energy Profile
  @IsEnum(EnergyLevel)
  @IsOptional()
  morningEnergy?: EnergyLevel;

  @IsEnum(EnergyLevel)
  @IsOptional()
  afternoonEnergy?: EnergyLevel;

  @IsEnum(EnergyLevel)
  @IsOptional()
  eveningEnergy?: EnergyLevel;

  // Privacy Settings
  @IsBoolean()
  @IsOptional()
  shareAnalytics?: boolean;

  @IsBoolean()
  @IsOptional()
  showActivityStatus?: boolean;

  // Email Notifications
  @IsBoolean()
  @IsOptional()
  taskRemindersEmail?: boolean;

  @IsBoolean()
  @IsOptional()
  weeklyDigestEmail?: boolean;

  @IsBoolean()
  @IsOptional()
  marketingEmail?: boolean;

  // Data Retention (null = never delete, else number of days)
  @IsInt()
  @Min(30)
  @IsOptional()
  completedTasksRetention?: number | null;

  @IsInt()
  @Min(30)
  @IsOptional()
  timeSessionsRetention?: number | null;
}
