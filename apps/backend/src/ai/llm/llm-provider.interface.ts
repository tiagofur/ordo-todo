export const LLM_PROVIDER = 'LLM_PROVIDER';

export type LlmComplexity = 'low' | 'medium' | 'high';

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmChatOptions {
  complexity?: LlmComplexity;
}

export interface ModelStats {
  flash: number;
  thinking: number;
  estimatedCostSavings: string;
}

export interface LlmProvider {
  chat(messages: LlmMessage[], options?: LlmChatOptions): Promise<string>;
  embed(texts: string[]): Promise<number[][]>;
  modelStats(): ModelStats;
}
