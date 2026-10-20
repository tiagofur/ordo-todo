import { Injectable } from '@nestjs/common';
import type {
  LlmChatOptions,
  LlmMessage,
  LlmProvider,
  ModelStats,
} from './llm-provider.interface';

/**
 * Deterministic in-memory LlmProvider for tests. No network calls.
 *
 * NOTE: the embedding dimension (768) matches text-embedding-004's default
 * output so mock vectors stay compatible with real pgvector(768) columns.
 */
const MOCK_EMBED_DIM = 768;

@Injectable()
export class MockLlmProvider implements LlmProvider {
  private static readonly CHAT_ECHO_LIMIT = 200;

  async chat(
    messages: LlmMessage[],
    _options?: LlmChatOptions,
  ): Promise<string> {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) {
      return 'Mock response';
    }
    return `Mock response to: ${lastUser.content.slice(0, MockLlmProvider.CHAT_ECHO_LIMIT)}`;
  }

  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((text) => deterministicEmbed(text));
  }

  modelStats(): ModelStats {
    return {
      flash: 0,
      thinking: 0,
      estimatedCostSavings: '0% requests using cheaper Flash model',
    };
  }
}

/** Deterministic pseudo-embedding: same text always yields the same unit vector. */
function deterministicEmbed(text: string): number[] {
  // FNV-1a 32-bit hash of the text seeds a mulberry32 PRNG, which fills the
  // fixed dimension with floats in [-1, 1]. Normalized to unit length.
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const rand = mulberry32(hash >>> 0);
  const vector: number[] = [];
  for (let i = 0; i < MOCK_EMBED_DIM; i++) {
    vector.push(rand() * 2 - 1);
  }
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vector.map((v) => v / norm);
}

/** Small seeded PRNG (mulberry32): deterministic floats in [0, 1). */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
