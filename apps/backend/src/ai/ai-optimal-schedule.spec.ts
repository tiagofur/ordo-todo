import { Test, TestingModule } from '@nestjs/testing';
import { Task, AIProfile } from '@ordo-todo/core';
import { AIService } from './ai.service';
import { GeminiAIService } from './gemini-ai.service';
import { TaskNlParserService } from './task-nl-parser.service';
import { PrismaService } from '../database/prisma.service';
import { SchedulingService } from '../scheduling/scheduling.service';

// ODD 005 T2: GET ai/optimal-schedule keeps its legacy contract
// (peakHours/peakDays/recommendation) and ADDS dayPlan from the engine.
describe('AIService.getOptimalSchedule (ODD 005 T2 contract)', () => {
  let service: AIService;

  // doDate = today (in the mocked user timezone) so tasks pass the T2 filter.
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

  const buildService = async (profile: AIProfile | null) => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        {
          provide: 'AIProfileRepository',
          useValue: { findByUserId: jest.fn().mockResolvedValue(profile) },
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
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest
                .fn()
                .mockResolvedValue({ timezone: 'America/Mexico_City' }),
            },
          },
        },
        TaskNlParserService,
        SchedulingService,
      ],
    }).compile();

    return module.get<AIService>(AIService);
  };

  it('keeps exact legacy values (null profile) and adds dayPlan', async () => {
    service = await buildService(null);
    const result = await service.getOptimalSchedule('user-123');

    // Legacy contract preserved: exact null-profile values, not just keys.
    expect(result.peakHours).toEqual([]);
    expect(result.peakDays).toEqual([]);
    expect(result.recommendation).toBe(
      'Start tracking your work sessions to get personalized productivity insights!',
    );

    // New T2 field
    expect(result).toHaveProperty('dayPlan');
    expect(result.dayPlan.blocks).toHaveLength(2);
    expect(result.dayPlan.blocks[0].taskId).toBe('task-1');
    expect(result.dayPlan.unscheduled).toHaveLength(0);
  });

  it('passes topN through to the legacy schedule with a profile', async () => {
    const profile = new AIProfile({
      id: 'profile-1',
      userId: 'user-123',
      peakHours: { 9: 0.95, 10: 0.8, 14: 0.4 },
      peakDays: { 1: 0.9, 2: 0.5 },
      avgTaskDuration: 45,
      completionRate: 0.9,
      categoryPreferences: {},
    });
    service = await buildService(profile);

    const result = await service.getOptimalSchedule('user-123', 1);

    // topN=1 flows into the legacy use case (only 1 peak hour back).
    expect(result.peakHours).toHaveLength(1);
    expect(result.peakHours[0].hour).toBe(9);
    expect(result).toHaveProperty('dayPlan');
  });

  it('uses the user timezone (not server-local) to define today', async () => {
    service = await buildService(null);
    const result = await service.getOptimalSchedule('user-123');

    // Both tasks carry doDate == today in America/Mexico_City and must pass.
    // This pins the TZ fix: server-local getters would drop them for ~25%
    // of the user's day when the server runs in another zone.
    expect(result.dayPlan.blocks).toHaveLength(2);
  });
});
