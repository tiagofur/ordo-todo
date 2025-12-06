import { IsBoolean, IsInt, IsOptional, Min, Max, IsEnum } from 'class-validator';

export enum EnergyLevel {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
}

export class UpdatePreferencesDto {
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
