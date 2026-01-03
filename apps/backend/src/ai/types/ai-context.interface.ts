export interface AIContext {
  workspaceId?: string;
  projectId?: string;
  tasks?: AITask[];
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AITask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: Date | string;
}

export interface ProductivityContext {
  dailyMetrics: DailyMetric[];
  sessions: TimeSession[];
  profile: UserProfile;
}

export interface DailyMetric {
  id: string;
  date: Date | string;
  tasksCompleted: number;
  subtasksCompleted: number;
  tasksCreated: number;
  minutesWorked: number;
  focusScore?: number;
}

export interface TimeSession {
  id: string;
  taskId?: string;
  type: string;
  startedAt: Date | string;
  endedAt?: Date | string | null;
  durationMinutes?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferences?: Record<string, unknown>;
}

export interface WeeklyReportContext {
  workspaceId?: string;
  startDate: Date | string;
  endDate: Date | string;
  tasks?: AITask[];
}

export interface WorkflowSuggestion {
  phases: WorkflowPhase[];
  totalEstimatedMinutes: number;
  reasoning: string;
}

export interface WorkflowPhase {
  name: string;
  tasks: WorkflowTask[];
  estimatedMinutes: number;
}

export interface WorkflowTask {
  title: string;
  estimatedMinutes: number;
  priority: string;
}

export interface AIResponse {
  message: string;
  actions?: AIAction[];
  suggestions?: string[];
  modelUsed?: string;
}

export interface AIAction {
  type: string;
  data?: Record<string, unknown>;
  result?: {
    taskId?: string;
    success: boolean;
    error?: string;
  };
}

export interface WellbeingContext {
  dailyMetrics: DailyMetric[];
  sessions: TimeSession[];
}

export interface WellbeingIndicators {
  overallScore: number;
  burnoutRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  workLifeBalance: number;
  focusQuality: number;
  insights: string[];
  recommendations: string[];
  metrics: {
    avgHoursPerDay: number;
    avgTasksPerDay: number;
    avgFocusScore: number;
    weekendWorkPercentage: number;
  };
}
