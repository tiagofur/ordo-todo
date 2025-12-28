import { Test, TestingModule } from '@nestjs/testing';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { BurnoutPreventionService } from './burnout-prevention.service';

describe('AIController', () => {
  let controller: AIController;
  let aiService: jest.Mocked<AIService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test',
  };

  beforeEach(async () => {
    const mockAIService = {
      chat: jest.fn(),
      parseNaturalLanguageTask: jest.fn(),
      getWellbeingIndicators: jest.fn(),
      suggestWorkflow: jest.fn(),
      decomposeTask: jest.fn(),
      getProfile: jest.fn(),
      getOptimalSchedule: jest.fn(),
      predictTaskDuration: jest.fn(),
      generateWeeklyReport: jest.fn(),
      generateMonthlyReport: jest.fn(),
      generateProjectReport: jest.fn(),
      getReports: jest.fn(),
      getReport: jest.fn(),
      deleteReport: jest.fn(),
      getModelStats: jest.fn(),
    };

    const mockBurnoutService = {
      analyzeWorkPatterns: jest.fn(),
      analyzeBurnoutRisk: jest.fn(),
      getRestRecommendations: jest.fn(),
      checkForIntervention: jest.fn(),
      generateWeeklyWellbeingSummary: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AIController],
      providers: [
        {
          provide: AIService,
          useValue: mockAIService,
        },
        {
          provide: BurnoutPreventionService,
          useValue: mockBurnoutService,
        },
      ],
    }).compile();

    controller = module.get<AIController>(AIController);
    aiService = module.get<AIService>(AIService) as jest.Mocked<AIService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('chat', () => {
    it('should call aiService.chat with correct parameters', async () => {
      const chatDto = {
        message: 'Hello AI',
        history: [],
        workspaceId: 'ws-123',
        projectId: 'proj-123',
      };
      const expectedResponse = { message: 'Hi there!', actions: [] };
      aiService.chat.mockResolvedValue(expectedResponse);

      const result = await controller.chat(chatDto, mockUser);

      expect(aiService.chat).toHaveBeenCalledWith(
        mockUser.id,
        chatDto.message,
        chatDto.history,
        { workspaceId: chatDto.workspaceId, projectId: chatDto.projectId },
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('parseTask', () => {
    it('should call parseNaturalLanguageTask with correct parameters', async () => {
      const parseDto = {
        input: 'Complete task by tomorrow',
        projectId: 'proj-123',
        timezone: 'America/Mexico_City',
      };
      const expectedResult = { title: 'Complete task', priority: 'MEDIUM' };
      aiService.parseNaturalLanguageTask.mockResolvedValue(
        expectedResult as any,
      );

      const result = await controller.parseTask(parseDto);

      expect(aiService.parseNaturalLanguageTask).toHaveBeenCalledWith(
        parseDto.input,
        parseDto.projectId,
        parseDto.timezone,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getWellbeing', () => {
    it('should call getWellbeingIndicators with date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const expectedResult = { overallScore: 75, burnoutRisk: 'LOW' };
      aiService.getWellbeingIndicators.mockResolvedValue(expectedResult as any);

      const result = await controller.getWellbeing(
        mockUser,
        startDate,
        endDate,
      );

      expect(aiService.getWellbeingIndicators).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(Date),
        expect.any(Date),
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle missing date parameters', async () => {
      const expectedResult = { overallScore: 80, burnoutRisk: 'LOW' };
      aiService.getWellbeingIndicators.mockResolvedValue(expectedResult as any);

      const result = await controller.getWellbeing(mockUser);

      expect(aiService.getWellbeingIndicators).toHaveBeenCalledWith(
        mockUser.id,
        undefined,
        undefined,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('suggestWorkflow', () => {
    it('should call suggestWorkflow with project details', async () => {
      const dto = {
        projectName: 'New App',
        projectDescription: 'Mobile app',
        objectives: 'Launch by Q1',
      };
      const expectedResult = {
        phases: [],
        estimatedDuration: '2 weeks',
        tips: [],
      };
      aiService.suggestWorkflow.mockResolvedValue(expectedResult as any);

      const result = await controller.suggestWorkflow(dto);

      expect(aiService.suggestWorkflow).toHaveBeenCalledWith(
        dto.projectName,
        dto.projectDescription,
        dto.objectives,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('decomposeTask', () => {
    it('should call decomposeTask with task details', async () => {
      const dto = {
        taskTitle: 'Build feature',
        taskDescription: 'Full feature implementation',
        projectContext: 'E-commerce app',
        maxSubtasks: 5,
      };
      const expectedResult = {
        subtasks: [{ title: 'Step 1', order: 1 }],
        reasoning: 'Decomposed',
        totalEstimatedMinutes: 60,
      };
      aiService.decomposeTask.mockResolvedValue(expectedResult as any);

      const result = await controller.decomposeTask(dto);

      expect(aiService.decomposeTask).toHaveBeenCalledWith(
        dto.taskTitle,
        dto.taskDescription,
        dto.projectContext,
        dto.maxSubtasks,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getProfile', () => {
    it('should return user AI profile', async () => {
      const expectedProfile = {
        peakHours: [9, 10, 11],
        avgSessionDuration: 25,
      };
      aiService.getProfile.mockResolvedValue(expectedProfile);

      const result = await controller.getProfile(mockUser);

      expect(aiService.getProfile).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(expectedProfile);
    });
  });

  describe('getModelStats', () => {
    it('should return model usage statistics', () => {
      const expectedStats = {
        flash: 100,
        thinking: 10,
        estimatedCostSavings: '91%',
      };
      aiService.getModelStats.mockReturnValue(expectedStats);

      const result = controller.getModelStats();

      expect(aiService.getModelStats).toHaveBeenCalled();
      expect(result).toEqual(expectedStats);
    });
  });
});
