export interface AIProfile {
  id: string;
  userId: string;
  peakHours: Record<number, number>;
  peakDays: Record<number, number>;
  avgTaskDuration: number;
  completionRate: number;
  categoryPreferences: Record<string, number>;
  updatedAt: Date;
}

export interface ParseTaskRequest {
  input: string;
  projectId?: string;
  timezone?: string;
  fast?: boolean;
}

export interface ParsedTaskInput {
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedMinutes?: number;
  tags: string[];
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  reasoning: string;
  dueAt?: string;
  recurrence?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  projectHint?: string;
  confidenceScore?: number;
  needsConfirmation?: boolean;
}

export interface OptimalScheduleResponse {
  peakHours: Array<{
    hour: number;
    score: number;
    label: string;
  }>;
  peakDays: Array<{
    day: number;
    score: number;
    label: string;
  }>;
  recommendation: string;
}

export interface PredictDurationResponse {
  estimatedMinutes: number;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  reasoning: string;
}

export interface MetricsSnapshot {
  tasksCreated?: number;
  tasksCompleted?: number;
  minutesWorked?: number;
  pomodorosCompleted?: number;
  focusScore?: number;
  sessionsCount?: number;
}

export type ReportScope =
  | "TASK_COMPLETION"
  | "PROJECT_SUMMARY"
  | "PERSONAL_ANALYSIS"
  | "WEEKLY_SCHEDULED"
  | "MONTHLY_SCHEDULED";

export interface ProductivityReport {
  id: string;
  userId: string;
  taskId?: string;
  projectId?: string;
  scope: ReportScope;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  patterns: string[];
  productivityScore: number;
  metricsSnapshot: MetricsSnapshot;
  generatedAt: Date;
  aiModel: string;
}

export interface WeeklyReportResponse extends ProductivityReport {
  isNew: boolean;
}
