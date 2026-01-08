import { Test, TestingModule } from '@nestjs/testing';
import { TeamWorkloadService } from './team-workload.service';
import type {
  ICollaborationRepository,
  TeamWorkloadSummary,
  MemberWorkload,
  WorkloadSuggestion,
} from '@ordo-todo/core';

describe('TeamWorkloadService', () => {
  let service: TeamWorkloadService;
  let repository: jest.Mocked<ICollaborationRepository>;

  const mockWorkloadSummary: TeamWorkloadSummary = {
    workspaceId: 'ws-123',
    workspaceName: 'Test Workspace',
    totalMembers: 3,
    totalTasks: 15,
    totalCompleted: 8,
    totalOverdue: 2,
    averageWorkload: 55,
    membersOverloaded: 1,
    membersUnderutilized: 1,
    membersBalanced: 1,
    redistributionSuggestions: [],
    members: [],
  };

  const mockMemberWorkload: MemberWorkload = {
    userId: 'user-123',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    avatarUrl: null,
    assignedTasks: 5,
    completedTasks: 3,
    overdueTasks: 1,
    inProgressTasks: 2,
    hoursWorkedThisWeek: 20,
    avgHoursPerDay: 4,
    workloadScore: 60,
    workloadLevel: 'BALANCED',
    capacityRemaining: 20,
    trend: 'STABLE',
    currentTask: null,
  };

  const mockSuggestions: WorkloadSuggestion[] = [
    {
      type: 'REDISTRIBUTE',
      priority: 'HIGH',
      description: 'Suggestion 1',
      affectedUsers: ['user-1', 'user-2'],
      action: { type: 'REASSIGN_TASKS', data: {} },
    },
  ];

  beforeEach(async () => {
    const mockRepository = {
      getWorkspaceWorkload: jest.fn(),
      getMemberWorkload: jest.fn(),
      getBalancingSuggestions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamWorkloadService,
        { provide: 'CollaborationRepository', useValue: mockRepository },
      ],
    }).compile();

    service = module.get<TeamWorkloadService>(TeamWorkloadService);
    repository = module.get('CollaborationRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWorkspaceWorkload', () => {
    it('should return workspace workload summary', async () => {
      repository.getWorkspaceWorkload.mockResolvedValue(mockWorkloadSummary);

      const result = await service.getWorkspaceWorkload('ws-123', 'user-123');

      expect(repository.getWorkspaceWorkload).toHaveBeenCalledWith('ws-123');
      expect(result).toEqual(mockWorkloadSummary);
    });
  });

  describe('getMemberWorkload', () => {
    it('should return member workload without workspace filter', async () => {
      repository.getMemberWorkload.mockResolvedValue(mockMemberWorkload);

      const result = await service.getMemberWorkload('user-123');

      expect(repository.getMemberWorkload).toHaveBeenCalledWith(
        'user-123',
        undefined,
      );
      expect(result).toEqual(mockMemberWorkload);
    });

    it('should return member workload with workspace filter', async () => {
      repository.getMemberWorkload.mockResolvedValue(mockMemberWorkload);

      const result = await service.getMemberWorkload('user-123', 'ws-123');

      expect(repository.getMemberWorkload).toHaveBeenCalledWith(
        'user-123',
        'ws-123',
      );
      expect(result).toEqual(mockMemberWorkload);
    });
  });

  describe('getBalancingSuggestions', () => {
    it('should return balancing suggestions', async () => {
      repository.getBalancingSuggestions.mockResolvedValue(mockSuggestions);

      const result = await service.getBalancingSuggestions('ws-123');

      expect(repository.getBalancingSuggestions).toHaveBeenCalledWith('ws-123');
      expect(result).toEqual(mockSuggestions);
    });
  });
});
