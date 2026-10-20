import { Test, TestingModule } from '@nestjs/testing';
import { AIService } from './ai.service';
import { GeminiAIService } from './gemini-ai.service';
import { TaskNlParserService } from './task-nl-parser.service';
import { PrismaService } from '../database/prisma.service';

/**
 * S4 contract: daily AM/PM reports keep a stable versioned shape. Generating
 * two days in a row with fixtures must diff ONLY in data, never in structure.
 */
describe('AIService.generateDailyReport (S4 stable format)', () => {
  let service: AIService;

  const mockGemini = {
    generateProductivityReport: jest.fn(async () => ({
      summary: 'Daily summary',
      strengths: ['s1'],
      weaknesses: ['w1'],
      recommendations: ['r1'],
      patterns: ['p1'],
      productivityScore: 70,
    })),
  };

  const mockAnalytics = {
    getRange: jest.fn(async () => [
      { props: { minutesWorked: 120, pomodorosCompleted: 4 } },
    ]),
  };
  const mockTimers = {
    findByUserIdAndDateRange: jest.fn(async () => []),
  };
  const mockProfiles = { findByUserId: jest.fn(async () => null) };
  const mockPrisma = {
    task: { count: jest.fn(async () => 3) },
    productivityReport: {
      create: jest.fn(async ({ data }: { data: object }) => ({
        id: 'report-1',
        ...data,
      })),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        { provide: 'AIProfileRepository', useValue: mockProfiles },
        { provide: 'ProductivityReportRepository', useValue: {} },
        { provide: 'AnalyticsRepository', useValue: mockAnalytics },
        { provide: 'TimerRepository', useValue: mockTimers },
        { provide: GeminiAIService, useValue: mockGemini },
        { provide: PrismaService, useValue: mockPrisma },
        TaskNlParserService,
      ],
    }).compile();

    service = module.get<AIService>(AIService);
  });

  function shapeOf(value: unknown): unknown {
    if (Array.isArray(value)) return ['array'];
    if (value !== null && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      return Object.fromEntries(
        Object.keys(record)
          .sort()
          .map((k) => [k, shapeOf(record[k])]),
      );
    }
    return typeof value;
  }

  it('AM: two consecutive days share structure, differ only in data', async () => {
    const day1 = await service.generateDailyReport(
      'user-1',
      'AM',
      new Date('2026-10-19T10:00:00Z'),
    );
    mockPrisma.task.count.mockResolvedValueOnce(5).mockResolvedValueOnce(1);
    const day2 = await service.generateDailyReport(
      'user-1',
      'AM',
      new Date('2026-10-20T10:00:00Z'),
    );

    expect(shapeOf(day1)).toEqual(shapeOf(day2));

    const snap1 =
      mockPrisma.productivityReport.create.mock.calls[0][0].data
        .metricsSnapshot;
    const snap2 =
      mockPrisma.productivityReport.create.mock.calls[1][0].data
        .metricsSnapshot;
    expect(Object.keys(snap1).sort()).toEqual(Object.keys(snap2).sort());
    expect(snap1.format).toBe('daily/v1');
    expect(snap2.format).toBe('daily/v1');
    expect(snap1.date).toBe('2026-10-19');
    expect(snap2.date).toBe('2026-10-20');
    expect(snap1).not.toEqual(snap2);
  });

  it('PM uses DAILY_PM scope and the same snapshot keys as AM', async () => {
    await service.generateDailyReport(
      'user-1',
      'AM',
      new Date('2026-10-19T10:00:00Z'),
    );
    await service.generateDailyReport(
      'user-1',
      'PM',
      new Date('2026-10-19T20:00:00Z'),
    );

    const [amCall, pmCall] = mockPrisma.productivityReport.create.mock.calls;
    expect(amCall[0].data.scope).toBe('DAILY_AM');
    expect(pmCall[0].data.scope).toBe('DAILY_PM');
    expect(Object.keys(amCall[0].data.metricsSnapshot).sort()).toEqual(
      Object.keys(pmCall[0].data.metricsSnapshot).sort(),
    );
    expect(pmCall[0].data.metricsSnapshot.kind).toBe('PM');
  });

  it('persists through the same ProductivityReport table as other scopes', async () => {
    await service.generateDailyReport('user-1', 'AM');
    expect(mockPrisma.productivityReport.create).toHaveBeenCalledTimes(1);
    const data = mockPrisma.productivityReport.create.mock.calls[0][0].data;
    expect(data.userId).toBe('user-1');
    expect(data.summary).toBe('Daily summary');
    expect(typeof data.productivityScore).toBe('number');
  });
});
