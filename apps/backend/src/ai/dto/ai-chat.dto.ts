import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ChatMessageDto {
  @IsString()
  content: string;

  @IsEnum(['user', 'assistant', 'system'])
  @IsOptional()
  role?: 'user' | 'assistant' | 'system' = 'user';
}

export class AIChatDto {
  @IsString()
  message: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  @IsOptional()
  history?: ChatMessageDto[];

  @IsString()
  @IsOptional()
  workspaceId?: string;

  @IsString()
  @IsOptional()
  projectId?: string;
}

export class AIParseTaskDto {
  @IsString()
  input: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}

export class AIWellbeingDto {
  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;
}

export class AIWorkflowSuggestionDto {
  @IsString()
  projectName: string;

  @IsString()
  @IsOptional()
  projectDescription?: string;

  @IsString()
  @IsOptional()
  objectives?: string;
}

export class AIDecomposeTaskDto {
  @IsString()
  taskTitle: string;

  @IsString()
  @IsOptional()
  taskDescription?: string;

  @IsString()
  @IsOptional()
  projectContext?: string;

  @IsOptional()
  maxSubtasks?: number;
}

// Response types
export interface ParsedTaskResult {
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedMinutes?: number;
  tags?: string[];
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  reasoning: string;
}

export interface ChatResponse {
  message: string;
  actions?: {
    type:
      | 'CREATE_TASK'
      | 'UPDATE_TASK'
      | 'COMPLETE_TASK'
      | 'LIST_TASKS'
      | 'CREATE_PROJECT'
      | 'NONE';
    data?: any;
    result?: any;
  }[];
  suggestions?: string[];
}

export interface WellbeingIndicators {
  overallScore: number; // 0-100
  burnoutRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  workLifeBalance: number; // 0-100
  focusQuality: number; // 0-100
  consistencyScore: number; // 0-100
  insights: string[];
  recommendations: string[];
  metrics: {
    avgHoursPerDay: number;
    avgSessionsPerDay: number;
    longestStreak: number;
    weekendWorkPercentage: number;
    lateNightWorkPercentage: number;
  };
}

export interface WorkflowSuggestion {
  phases: {
    name: string;
    description: string;
    suggestedTasks: {
      title: string;
      description?: string;
      estimatedMinutes?: number;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    }[];
  }[];
  estimatedDuration: string;
  tips: string[];
}
