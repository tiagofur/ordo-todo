import { Test, TestingModule } from '@nestjs/testing';
import { AIService } from './ai.service';
import { GeminiAIService } from './gemini-ai.service';
import { TaskNlParserService } from './task-nl-parser.service';
import { PrismaService } from '../database/prisma.service';

describe('AIService.parseNaturalLanguageTask', () => {
  let service: AIService;
  const mockGemini = {
    parseNaturalLanguageTask: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        { provide: 'AIProfileRepository', useValue: {} },
        { provide: 'ProductivityReportRepository', useValue: {} },
        { provide: 'AnalyticsRepository', useValue: {} },
        { provide: 'TimerRepository', useValue: {} },
        { provide: GeminiAIService, useValue: mockGemini },
        { provide: PrismaService, useValue: {} },
        TaskNlParserService,
      ],
    }).compile();

    service = module.get<AIService>(AIService);
  });

  it('fast:true returns the deterministic result without calling Gemini', async () => {
    const result = await service.parseNaturalLanguageTask(
      'Llamar mañana 15h #trabajo @alta',
      undefined,
      undefined,
      true,
    );

    expect(mockGemini.parseNaturalLanguageTask).not.toHaveBeenCalled();
    expect(result.title).toBe('Llamar');
    expect(result.priority).toBe('HIGH');
    expect(result.projectHint).toBe('trabajo');
    expect(result.dueAt).toBeDefined();
    expect(result.needsConfirmation).toBe(false);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.6);
  });

  it('fast:true flags low-confidence input for confirmation', async () => {
    const result = await service.parseNaturalLanguageTask(
      'xyzzy',
      undefined,
      undefined,
      true,
    );

    expect(mockGemini.parseNaturalLanguageTask).not.toHaveBeenCalled();
    expect(result.title).toBe('xyzzy');
    expect(result.needsConfirmation).toBe(true);
  });

  it('default mode calls Gemini and lets a confident local parse win', async () => {
    mockGemini.parseNaturalLanguageTask.mockResolvedValue({
      title: 'Gemini title',
      priority: 'LOW',
      tags: [],
      confidence: 'MEDIUM',
      reasoning: 'mock',
    });

    const result = await service.parseNaturalLanguageTask(
      'Comprar leche urgente',
    );

    expect(mockGemini.parseNaturalLanguageTask).toHaveBeenCalledWith(
      'Comprar leche urgente',
      'America/Mexico_City',
    );
    expect(result.title).toBe('Comprar leche');
    expect(result.priority).toBe('URGENT');
    expect(result.needsConfirmation).toBe(false);
  });

  it('default mode falls back to Gemini when local confidence is low', async () => {
    mockGemini.parseNaturalLanguageTask.mockResolvedValue({
      title: 'Gemini title',
      priority: 'LOW',
      tags: [],
      confidence: 'MEDIUM',
      reasoning: 'mock',
    });

    const result = await service.parseNaturalLanguageTask('xyzzy');

    expect(result.title).toBe('Gemini title');
    expect(result.priority).toBe('LOW');
    expect(result.needsConfirmation).toBe(true);
  });
});
