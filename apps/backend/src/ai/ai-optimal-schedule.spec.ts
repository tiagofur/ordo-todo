import { Test, TestingModule } from '@nestjs/testing';
import { Task } from '@ordo-todo/core';
import { AIService } from './ai.service';
import { GeminiAIService } from './gemini-ai.service';
import { TaskNlParserService } from './task-nl-parser.service';
import { PrismaService } from '../database/prisma.service';
import { SchedulingService } from '../scheduling/scheduling.service';

// ODD 005 T2: GET ai/optimal-schedule keeps its legacy contract
// (peakHours/peakDays/recommendation) and ADDS dayPlan from the engine.
describe('AIService.getOptimalSchedule (ODD 005 T2 contract)', () => {
  let service: AIService;

  // doDate = today (local) so tasks pass the T2 candidate filter.
  const today = new Date();
  const openTask = (id: string, title: string) =>
    new Task({
      id,
      title,
      status: 'TODO',
      priority: 'HIGH',
      projectId: 'p1',
      ownerId: 'user-123',
      isDeleted: false,
      estimatedMinutes: 60,
      dueDate: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      doDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      energyRequired: 'HIGH',
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        {
          provide: 'AIProfileRepository',
          useValue: { findByUserId: jest.fn().mockResolvedValue(null) },
        },
        { provide: 'ProductivityReportRepository', useValue: {} },
        { provide: 'AnalyticsRepository', useValue: {} },
        { provide: 'TimerRepository', useValue: {} },
        {
          provide: 'TaskRepository',
          useValue: {
            findByOwnerId: jest
              .fn()
              .mockResolvedValue([
                openTask('task-1', 'Write report'),
                openTask('task-2', 'Fix bug'),
              ]),
          },
        },
        { provide: GeminiAIService, useValue: {} },
        { provide: PrismaService, useValue: {} },
        TaskNlParserService,
        SchedulingService,
      ],
    }).compile();

    service = module.get<AIService>(AIService);
  });

  it('keeps peakHours/peakDays/recommendation and adds dayPlan', async () => {
    const result = await service.getOptimalSchedule('user-123');

    // Legacy contract preserved
    expect(result).toHaveProperty('peakHours');
    expect(result).toHaveProperty('peakDays');
    expect(result).toHaveProperty('recommendation');

    // New T2 field
    expect(result).toHaveProperty('dayPlan');
    expect(result.dayPlan.blocks).toHaveLength(2);
    expect(result.dayPlan.blocks[0].taskId).toBe('task-1');
    expect(result.dayPlan.unscheduled).toHaveLength(0);
  });
});
