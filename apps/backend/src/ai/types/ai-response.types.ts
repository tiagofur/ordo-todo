/**
 * Type-safe interfaces for Google Gemini AI responses
 *
 * This module provides TypeScript types for all AI service responses,
 * eliminating the need for 'any' types and improving type safety.
 */

/**
 * Gemini generate content result structure
 *
 * @example
 * ```typescript
 * const result = await ai.generateContent(...) as GeminiGenerateContentResult;
 * const text = await result.response?.text();
 * ```
 */
export interface GeminiGenerateContentResult {
  response?: {
    text(): Promise<string>;
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
  };
}

/**
 * Parsed task result from natural language
 *
 * @example
 * ```typescript
 * const task: ParsedTaskResult = {
 *   title: 'Complete project documentation',
 *   description: 'Write comprehensive docs for the API',
 *   priority: 'HIGH',
 *   estimatedMinutes: 120,
 *   tags: ['documentation', 'api'],
 *   confidence: 'HIGH',
 *   reasoning: 'Clear intent with specific deliverable',
 * };
 * ```
 */
export interface ParsedTaskResult {
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedMinutes?: number;
  dueDate?: Date | string;
  tags: string[];
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  reasoning: string;
}

/**
 * AI productivity profile analysis
 *
 * @example
 * ```typescript
 * const profile: AIProfileProps = {
 *   focusScore: 0.85,
 *   peakHours: [
 *     { hour: 9, productivity: 0.9 },
 *     { hour: 10, productivity: 0.95 },
 *   ],
 *   strengths: ['Deep work', 'Task completion'],
 *   weaknesses: ['Interruptions', 'Context switching'],
 * };
 * ```
 */
export interface AIProfileProps {
  focusScore: number;
  peakHours: Array<{
    hour: number;
    productivity: number;
  }>;
  strengths: string[];
  weaknesses: string[];
  recommendations?: string[];
}

/**
 * Workflow suggestions from AI
 *
 * @example
 * ```typescript
 * const suggestions: WorkflowSuggestion[] = [
 *   {
 *     type: 'optimization',
 *     title: 'Group similar tasks',
 *     description: 'Batch process similar tasks for efficiency',
 *     impact: 'high',
 *   },
 * ];
 * ```
 */
export interface WorkflowSuggestion {
  type: 'optimization' | 'reorganization' | 'prioritization' | 'automation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  estimatedBenefit?: string;
}

/**
 * AI-generated productivity report
 *
 * @example
 * ```typescript
 * const report: ProductivityReportAI = {
 *   summary: 'Great productivity this week',
 *   strengths: ['Consistent task completion'],
 *   improvements: ['Reduce meeting time'],
 *   score: 0.82,
 * };
 * ```
 */
export interface ProductivityReportAI {
  summary: string;
  strengths: string[];
  improvements: string[];
  score: number;
  trends?: Array<{
    date: Date | string;
    value: number;
  }>;
}

/**
 * Task suggestions based on context
 *
 * @example
 * ```typescript
 * const suggestions: TaskSuggestion[] = [
 *   {
 *     title: 'Review pull requests',
 *     reason: 'You have 3 pending reviews',
 *     priority: 'HIGH',
 *     estimatedMinutes: 30,
 *   },
 * ];
 * ```
 */
export interface TaskSuggestion {
  title: string;
  description?: string;
  reason: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedMinutes?: number;
  context?: string;
}

/**
 * Chat message structure
 *
 * @example
 * ```typescript
 * const message: ChatMessage = {
 *   role: 'user',
 *   content: 'What should I work on today?',
 *   timestamp: new Date(),
 * };
 * ```
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date | string;
  metadata?: Record<string, unknown>;
}

/**
 * Chat conversation with AI
 *
 * @example
 * ```typescript
 * const conversation: ChatConversation = {
 *   id: 'conv-123',
 *   messages: [
 *     { role: 'user', content: 'Hello', timestamp: new Date() },
 *     { role: 'assistant', content: 'Hi there!', timestamp: new Date() },
 *   ],
 *   createdAt: new Date(),
 * };
 * ```
 */
export interface ChatConversation {
  id: string;
  messages: ChatMessage[];
  createdAt: Date | string;
  updatedAt?: Date | string;
}

/**
 * Natural language parse result
 *
 * @example
 * ```typescript
 * const result: NaturalLanguageParseResult = {
 *   intent: 'create_task',
 *   entities: {
 *     title: 'Buy groceries',
 *     priority: 'MEDIUM',
 *   },
 *   confidence: 0.95,
 * };
 * ```
 */
export interface NaturalLanguageParseResult {
  intent: 'create_task' | 'update_task' | 'delete_task' | 'search' | 'unknown';
  entities: Record<string, unknown>;
  confidence: number;
  rawText: string;
}

/**
 * AI scheduling result
 *
 * @example
 * ```typescript
 * const schedule: AIScheduleResult = {
 *   tasks: [
 *     { taskId: 'task-1', scheduledTime: '09:00', duration: 60 },
 *     { taskId: 'task-2', scheduledTime: '10:30', duration: 45 },
 *   ],
 *   optimizationScore: 0.88,
 *   reasoning: 'Grouped high-priority tasks in morning',
 * };
 * ```
 */
export interface AIScheduleResult {
  tasks: Array<{
    taskId: string;
    scheduledTime: string;
    duration: number;
  }>;
  optimizationScore: number;
  reasoning?: string;
  breaks?: Array<{
    startTime: string;
    duration: number;
    type: 'short' | 'long';
  }>;
}

/**
 * Wellbeing indicators from AI analysis
 *
 * @example
 * ```typescript
 * const wellbeing: WellbeingIndicators = {
 *   stressLevel: 'low',
 *   workLifeBalance: 0.75,
 *   recommendations: ['Take more breaks', 'Limit work to 8 hours'],
 * };
 * ```
 */
export interface WellbeingIndicators {
  stressLevel: 'low' | 'medium' | 'high';
  workLifeBalance: number;
  recommendations: string[];
  factors?: Array<{
    name: string;
    impact: 'positive' | 'negative';
    value: number;
  }>;
}

/**
 * Generic success response
 *
 * @example
 * ```typescript
 * const response: SuccessResponse = { success: true };
 * ```
 */
export interface SuccessResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

/**
 * Wellbeing AI analysis response
 *
 * @example
 * ```typescript
 * const wellbeing: WellbeingAIResponse = {
 *   insights: ['Good work-life balance', 'Consistent schedule'],
 *   recommendations: ['Take more breaks', 'Exercise regularly'],
 * };
 * ```
 */
export interface WellbeingAIResponse {
  insights: string[];
  recommendations: string[];
}
