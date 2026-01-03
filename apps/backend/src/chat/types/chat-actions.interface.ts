export interface ChatMessageDto {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date | string;
  metadata?: ChatMetadata;
}

export interface ChatMetadata {
  actions?: AIChatAction[];
  suggestions?: string[];
  modelUsed?: string;
  context?: ChatContext | null;
}

export interface AIChatAction {
  type: string;
  data?: Record<string, unknown>;
  result?: {
    taskId?: string;
    workspaceId?: string;
    success: boolean;
    error?: string;
  };
}

export interface ChatContext {
  workspaceId?: string;
  projectId?: string;
  tasks?: AITask[];
}

export interface AITask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: Date | string;
}

export interface ParsedTask {
  title: string;
  description?: string;
  dueDate?: Date | string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedMinutes?: number;
  tags?: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reasoning: string;
}
