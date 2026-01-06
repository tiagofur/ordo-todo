export class AIChatDto {
  message: string;
  history?: { role: 'user' | 'assistant' | 'system'; content: string }[];
  workspaceId?: string;
  projectId?: string;
}

export class ChatMessageDto {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class ChatResponse {
  message: string;
  actions: any[];
  suggestions?: string[];
}

export class AIParseTaskDto {
  input: string;
  projectId?: string;
  timezone?: string;
}

export class ParsedTaskResult {
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedMinutes?: number;
  tags: string[];
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  reasoning: string;
}

export class WellbeingIndicators {
  overallScore: number;
  burnoutRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  workLifeBalance: number;
  focusQuality: number;
  consistencyScore: number;
  metrics: {
    avgHoursPerDay: number;
    avgSessionsPerDay: number;
    longestStreak: number;
    weekendWorkPercentage: number;
    lateNightWorkPercentage: number;
  };
  insights?: string[];
  recommendations?: string[];
}

export class AIWorkflowSuggestionDto {
  projectName: string;
  projectDescription: string;
  objectives?: string[];
}

export class WorkflowSuggestion {
  phases: {
    name: string;
    description: string;
    suggestedTasks: {
      title: string;
      description?: string;
      estimatedMinutes?: number;
      priority: 'LOW' | 'MEDIUM' | 'HIGH';
    }[];
  }[];
  estimatedDuration: string;
  tips: string[];
}

export class AIDecomposeTaskDto {
  taskTitle: string;
  taskDescription?: string;
  projectContext?: string;
  maxSubtasks?: number;
}

export class BlogPostGenerationResult {
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown
  category: string;
  tags: string[];
  readTime: number;
}
