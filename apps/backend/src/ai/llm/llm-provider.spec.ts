import { BadRequestException } from '@nestjs/common';
import { GeminiAIService } from '../gemini-ai.service';
import { GeminiLlmProvider } from './gemini-llm-provider';
import {
  LLM_PROVIDER,
  LlmMessage,
  LlmProvider,
  ModelStats,
} from './llm-provider.interface';
import { MockLlmProvider } from './mock-llm-provider';

describe('LlmProvider contract', () => {
  it('exposes LLM_PROVIDER as its DI token', () => {
    expect(LLM_PROVIDER).toBe('LLM_PROVIDER');
  });

  it('is implemented with exactly chat, embed and modelStats', () => {
    for (const proto of [
      MockLlmProvider.prototype,
      GeminiLlmProvider.prototype,
    ]) {
      const methods = Object.getOwnPropertyNames(proto).filter(
        (m) => m !== 'constructor',
      );
      expect(methods.sort()).toEqual(['chat', 'embed', 'modelStats']);
    }
    // Compile-time conformance to the interface:
    const mock: LlmProvider = new MockLlmProvider();
    expect(mock).toBeDefined();
  });
});

describe('MockLlmProvider', () => {
  let provider: MockLlmProvider;

  beforeEach(() => {
    provider = new MockLlmProvider();
  });

  describe('chat', () => {
    it('echoes the user question', async () => {
      const messages: LlmMessage[] = [
        { role: 'system', content: 'Be helpful.' },
        { role: 'user', content: 'What is due this week?' },
      ];
      await expect(provider.chat(messages)).resolves.toBe(
        'Mock response to: What is due this week?',
      );
    });

    it('echoes the last user message when several are present', async () => {
      const messages: LlmMessage[] = [
        { role: 'user', content: 'First question' },
        { role: 'assistant', content: 'First answer' },
        { role: 'user', content: 'Second question' },
      ];
      await expect(provider.chat(messages)).resolves.toBe(
        'Mock response to: Second question',
      );
    });

    it('truncates the echoed question to 200 chars', async () => {
      const long = 'x'.repeat(250);
      const result = await provider.chat([{ role: 'user', content: long }]);
      expect(result).toBe(`Mock response to: ${'x'.repeat(200)}`);
      expect(result.length).toBe('Mock response to: '.length + 200);
    });

    it('returns a plain mock response when there is no user message', async () => {
      await expect(
        provider.chat([{ role: 'system', content: 'Be helpful.' }]),
      ).resolves.toBe('Mock response');
      await expect(provider.chat([])).resolves.toBe('Mock response');
    });

    it('is deterministic for the same input', async () => {
      const messages: LlmMessage[] = [
        { role: 'user', content: 'Same question' },
      ];
      const first = await provider.chat(messages);
      const second = await provider.chat(messages);
      expect(first).toBe(second);
    });
  });

  describe('embed', () => {
    it('returns one fixed-dimension unit vector per input text', async () => {
      const vectors = await provider.embed(['hello', 'world']);
      expect(vectors).toHaveLength(2);
      for (const v of vectors) {
        expect(v).toHaveLength(768);
        for (const n of v) {
          expect(typeof n).toBe('number');
        }
        const norm = Math.sqrt(v.reduce((sum, n) => sum + n * n, 0));
        expect(norm).toBeCloseTo(1, 5);
      }
    });

    it('is deterministic: same input twice gives equal vectors', async () => {
      const first = await provider.embed(['deterministic text']);
      const second = await provider.embed(['deterministic text']);
      expect(first).toEqual(second);
    });

    it('gives different vectors for different texts', async () => {
      const [a] = await provider.embed(['hello world']);
      const [b] = await provider.embed(['goodbye world']);
      expect(a).not.toEqual(b);
    });

    it('returns [] for empty input', async () => {
      await expect(provider.embed([])).resolves.toEqual([]);
    });
  });

  describe('modelStats', () => {
    it('returns zeroed stats with the exact ModelStats shape', () => {
      const stats: ModelStats = provider.modelStats();
      expect(stats).toEqual({
        flash: 0,
        thinking: 0,
        estimatedCostSavings: '0% requests using cheaper Flash model',
      });
      expect(Object.keys(stats).sort()).toEqual([
        'estimatedCostSavings',
        'flash',
        'thinking',
      ]);
    });
  });
});

describe('GeminiLlmProvider (adapter over GeminiAIService)', () => {
  let gemini: {
    generate: jest.Mock;
    embed: jest.Mock;
    getModelStats: jest.Mock;
  };
  let provider: GeminiLlmProvider;

  beforeEach(() => {
    gemini = {
      generate: jest.fn(),
      embed: jest.fn(),
      getModelStats: jest.fn(),
    };
    provider = new GeminiLlmProvider(gemini as unknown as GeminiAIService);
  });

  describe('chat message mapping', () => {
    it('joins system messages and formats turns as User:/Assistant: lines', async () => {
      gemini.generate.mockResolvedValue('ok');
      const messages: LlmMessage[] = [
        { role: 'system', content: 'You are helpful.' },
        { role: 'system', content: 'Be concise.' },
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' },
        { role: 'user', content: 'What is due?' },
      ];
      await expect(provider.chat(messages)).resolves.toBe('ok');
      expect(gemini.generate).toHaveBeenCalledTimes(1);
      expect(gemini.generate).toHaveBeenCalledWith(
        'You are helpful.\n\nBe concise.',
        'User: Hello\nAssistant: Hi there\nUser: What is due?',
        'low',
      );
    });

    it('passes complexity through to generate', async () => {
      gemini.generate.mockResolvedValue('ok');
      await provider.chat([{ role: 'user', content: 'Hi' }], {
        complexity: 'high',
      });
      expect(gemini.generate).toHaveBeenCalledWith('', 'User: Hi', 'high');
    });

    it('throws BadRequestException on empty messages without calling generate', async () => {
      await expect(provider.chat([])).rejects.toThrow(BadRequestException);
      expect(gemini.generate).not.toHaveBeenCalled();
    });
  });

  describe('embed', () => {
    it('delegates to gemini.embed', async () => {
      gemini.embed.mockResolvedValue([
        [0.1, 0.2],
        [0.3, 0.4],
      ]);
      await expect(provider.embed(['a', 'b'])).resolves.toEqual([
        [0.1, 0.2],
        [0.3, 0.4],
      ]);
      expect(gemini.embed).toHaveBeenCalledTimes(1);
      expect(gemini.embed).toHaveBeenCalledWith(['a', 'b']);
    });
  });

  describe('modelStats', () => {
    it('delegates to gemini.getModelStats preserving the exact shape', () => {
      const stats = {
        flash: 3,
        thinking: 1,
        estimatedCostSavings: '75% requests using cheaper Flash model',
      };
      gemini.getModelStats.mockReturnValue(stats);
      const result: ModelStats = provider.modelStats();
      expect(result).toEqual(stats);
      expect(Object.keys(result).sort()).toEqual([
        'estimatedCostSavings',
        'flash',
        'thinking',
      ]);
    });
  });
});
