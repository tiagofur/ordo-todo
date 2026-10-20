import { Test, TestingModule } from '@nestjs/testing';
import { RetrievalService } from './retrieval.service';
import { PrismaService } from '../../database/prisma.service';
import { LLM_PROVIDER } from '../llm/llm-provider.interface';
import type { LlmProvider } from '../llm/llm-provider.interface';

describe('RetrievalService', () => {
  let service: RetrievalService;
  const prismaMock = {
    $queryRaw: jest.fn(),
    task: { findMany: jest.fn() },
    project: { findMany: jest.fn() },
    note: { findMany: jest.fn() },
    comment: { findMany: jest.fn() },
    habit: { findMany: jest.fn() },
  };
  const llmMock: jest.Mocked<LlmProvider> = {
    chat: jest.fn(),
    embed: jest.fn(),
    modelStats: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.task.findMany.mockResolvedValue([]);
    prismaMock.project.findMany.mockResolvedValue([]);
    prismaMock.note.findMany.mockResolvedValue([]);
    prismaMock.comment.findMany.mockResolvedValue([]);
    prismaMock.habit.findMany.mockResolvedValue([]);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetrievalService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: LLM_PROVIDER, useValue: llmMock },
      ],
    }).compile();

    service = module.get<RetrievalService>(RetrievalService);
  });

  it('returns [] for a blank query without touching the LLM', async () => {
    await expect(service.retrieve('user-1', '   ')).resolves.toEqual([]);
    expect(llmMock.embed).not.toHaveBeenCalled();
  });

  it('returns [] when the LLM returns an empty embedding', async () => {
    llmMock.embed.mockResolvedValue([[]]);

    await expect(service.retrieve('user-1', 'hello')).resolves.toEqual([]);
    expect(prismaMock.$queryRaw).not.toHaveBeenCalled();
  });

  it('filters vector candidates by permission: only visible rows become citations', async () => {
    llmMock.embed.mockResolvedValue([[0.5, 0.25]]);
    prismaMock.$queryRaw.mockResolvedValue([
      { contentType: 'TASK', contentId: 'task-visible', content: 'alpha' },
      { contentType: 'TASK', contentId: 'task-foreign', content: 'secret' },
    ]);
    prismaMock.task.findMany.mockResolvedValue([
      { id: 'task-visible', title: 'Visible task' },
    ]);

    const citations = await service.retrieve('user-1', 'alpha');

    expect(citations).toEqual([
      {
        type: 'TASK',
        id: 'task-visible',
        title: 'Visible task',
        excerpt: 'alpha',
      },
    ]);
    expect(prismaMock.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: ['task-visible', 'task-foreign'] },
        }) as unknown,
      }),
    );
  });

  it('respects the limit and preserves vector order', async () => {
    llmMock.embed.mockResolvedValue([[0.5]]);
    prismaMock.$queryRaw.mockResolvedValue([
      { contentType: 'NOTE', contentId: 'n-1', content: 'one' },
      { contentType: 'NOTE', contentId: 'n-2', content: 'two' },
      { contentType: 'NOTE', contentId: 'n-3', content: 'three' },
    ]);
    prismaMock.note.findMany.mockResolvedValue([
      { id: 'n-3', content: 'three' },
      { id: 'n-1', content: 'one' },
      { id: 'n-2', content: 'two' },
    ]);

    const citations = await service.retrieve('user-1', 'q', 2);

    expect(citations.map((c) => c.id)).toEqual(['n-1', 'n-2']);
  });

  it('passes the query vector to the raw SQL as a [..] literal', async () => {
    llmMock.embed.mockResolvedValue([[0.5, 0.25]]);
    prismaMock.$queryRaw.mockResolvedValue([]);

    await service.retrieve('user-1', 'hello');

    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1);
    const rawValues: unknown[] = prismaMock.$queryRaw.mock.calls[0].slice(1);
    expect(rawValues.map(String).join(' ')).toContain('[0.5,0.25]');
  });
});
