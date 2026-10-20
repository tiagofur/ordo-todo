import { BadRequestException, Injectable } from '@nestjs/common';
import { GeminiAIService } from '../gemini-ai.service';
import type {
  LlmChatOptions,
  LlmMessage,
  LlmProvider,
  ModelStats,
} from './llm-provider.interface';

/**
 * LlmProvider adapter over the existing GeminiAIService (current engine).
 * Maps chat messages onto generate(systemPrompt, userPrompt, complexity).
 */
@Injectable()
export class GeminiLlmProvider implements LlmProvider {
  constructor(private readonly gemini: GeminiAIService) {}

  async chat(
    messages: LlmMessage[],
    options?: LlmChatOptions,
  ): Promise<string> {
    if (messages.length === 0) {
      throw new BadRequestException('messages must not be empty');
    }
    const systemPrompt = messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n\n');
    const userPrompt = messages
      .filter((m) => m.role !== 'system')
      .map(
        (m) => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`,
      )
      .join('\n');
    return this.gemini.generate(
      systemPrompt,
      userPrompt,
      options?.complexity ?? 'low',
    );
  }

  async embed(texts: string[]): Promise<number[][]> {
    return this.gemini.embed(texts);
  }

  modelStats(): ModelStats {
    return this.gemini.getModelStats();
  }
}
