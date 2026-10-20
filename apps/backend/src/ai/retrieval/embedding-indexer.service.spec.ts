import { Test, TestingModule } from '@nestjs/testing';
import { EmbeddingIndexerService } from './embedding-indexer.service';
import { PrismaService } from '../../database/prisma.service';
import { LLM_PROVIDER } from '../llm/llm-provider.interface';
import type { LlmProvider } from '../llm/llm-provider.interface';

describe('EmbeddingIndexerService', () => {
  let service: EmbeddingIndexerService;
  const prismaMock = {
    aiEmbedding: {
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
    $executeRaw: jest.fn(),
  };
  const llmMock: jest.Mocked<LlmProvider> = {
    chat: jest.fn(),
    embed: jest.fn(),
    modelStats: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbeddingIndexerService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: LLM_PROVIDER, useValue: llmMock },
      ],
    }).compile();

    service = module.get<EmbeddingIndexerService>(EmbeddingIndexerService);
  });

  describe('indexContent', () => {
    it('upserts the metadata row then writes the vector via raw SQL', async () => {
      llmMock.embed.mockResolvedValue([[0.5, 0.25]]);

      await service.indexContent('TASK', 'task-1', 'hello world');

      expect(llmMock.embed).toHaveBeenCalledWith(['hello world']);
      expect(prismaMock.aiEmbedding.upsert).toHaveBeenCalledWith({
        where: {
          contentType_contentId_chunkIndex: {
            contentType: 'TASK',
            contentId: 'task-1',
            chunkIndex: 0,
          },
        },
        create: {
          contentType: 'TASK',
          contentId: 'task-1',
          chunkIndex: 0,
          content: 'hello world',
        },
        update: { content: 'hello world' },
      });
      expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1);
      const rawValues: unknown[] =
        prismaMock.$executeRaw.mock.calls[0].slice(1);
      expect(rawValues.map(String).join(' ')).toContain('[0.5,0.25]');
    });

    it('truncates content to 8000 chars (documented MVP single-chunk limit)', async () => {
      llmMock.embed.mockResolvedValue([[0.1]]);
      const longText = 'x'.repeat(9000);

      await service.indexContent('NOTE', 'note-1', longText);

      expect(llmMock.embed).toHaveBeenCalledWith(['x'.repeat(8000)]);
      expect(prismaMock.aiEmbedding.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            content: 'x'.repeat(8000),
          }) as unknown,
        }),
      );
    });

    it('writes nothing when the LLM returns an empty embedding', async () => {
      llmMock.embed.mockResolvedValue([[]]);

      await service.indexContent('TASK', 'task-1', 'hello');

      expect(prismaMock.aiEmbedding.upsert).not.toHaveBeenCalled();
      expect(prismaMock.$executeRaw).not.toHaveBeenCalled();
    });

    it('never throws: an LLM failure only warns', async () => {
      llmMock.embed.mockRejectedValue(new Error('boom'));

      await expect(
        service.indexContent('TASK', 'task-1', 'hello'),
      ).resolves.toBeUndefined();
      expect(prismaMock.aiEmbedding.upsert).not.toHaveBeenCalled();
    });

    it('never throws: a prisma failure only warns', async () => {
      llmMock.embed.mockResolvedValue([[0.5]]);
      prismaMock.aiEmbedding.upsert.mockRejectedValue(new Error('db down'));

      await expect(
        service.indexContent('TASK', 'task-1', 'hello'),
      ).resolves.toBeUndefined();
    });
  });

  describe('removeContent', () => {
    it('deletes all chunks for the content', async () => {
      await service.removeContent('TASK', 'task-1');

      expect(prismaMock.aiEmbedding.deleteMany).toHaveBeenCalledWith({
        where: { contentType: 'TASK', contentId: 'task-1' },
      });
    });

    it('never throws: a prisma failure only warns', async () => {
      prismaMock.aiEmbedding.deleteMany.mockRejectedValue(new Error('db down'));

      await expect(
        service.removeContent('TASK', 'task-1'),
      ).resolves.toBeUndefined();
    });
  });
});
