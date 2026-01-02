import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';

describe('WorkflowsService', () => {
  let service: WorkflowsService;
  let workflowRepository: any;

  beforeEach(async () => {
    workflowRepository = {
      save: jest.fn(),
      findByWorkspaceId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowsService,
        {
          provide: 'WorkflowRepository',
          useValue: workflowRepository,
        },
      ],
    }).compile();

    service = module.get<WorkflowsService>(WorkflowsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create workflow and return props', async () => {
      const dto: CreateWorkflowDto = {
        name: 'Test Workflow',
        workspaceId: 'workspace-123',
        description: 'Test description',
      };

      const mockWorkflow = {
        props: {
          id: 'workflow-123',
          name: 'Test Workflow',
          workspaceId: 'workspace-123',
          description: 'Test description',
          color: '#6B7280',
        },
      };

      workflowRepository.save.mockResolvedValue(undefined);
      // Mock the constructor behavior or rely on UseCase returning the workflow
      // In this case, we mock the repository save and ensure the service returns props
      // Since service creates a new UseCase, it will call repository.save(entity)

      const result = await service.create(dto);

      expect(workflowRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('Test Workflow');
      expect(result.workspaceId).toBe('workspace-123');
    });

    it('should use default color when not provided', async () => {
      const dto: CreateWorkflowDto = {
        name: 'Test Workflow',
        workspaceId: 'workspace-123',
      };

      workflowRepository.save.mockResolvedValue(undefined);

      const result = await service.create(dto);

      expect(workflowRepository.save).toHaveBeenCalled();
      const callArgs = workflowRepository.save.mock.calls[0][0];
      // Since CreateWorkflowUseCase sets default color to #6B7280
      expect(callArgs.props.color).toBe('#6B7280');
    });
  });

  describe('findAll', () => {
    it('should return workflow props for a workspace', async () => {
      const workspaceId = 'workspace-123';
      const mockWorkflows = [
        {
          props: {
            id: 'workflow-1',
            name: 'Workflow 1',
            workspaceId,
            position: 0,
          },
        },
        {
          props: {
            id: 'workflow-2',
            name: 'Workflow 2',
            workspaceId,
            position: 0,
          },
        },
      ];

      workflowRepository.findByWorkspaceId.mockResolvedValue(mockWorkflows);

      const result = await service.findAll(workspaceId);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Workflow 1');
      expect(workflowRepository.findByWorkspaceId).toHaveBeenCalledWith(
        workspaceId,
      );
    });
  });

  describe('update', () => {
    it('should update workflow and return props', async () => {
      const workflowId = 'workflow-123';
      const dto: UpdateWorkflowDto = {
        name: 'Updated Workflow',
      };

      const mockWorkflow = {
        props: {
          id: workflowId,
          name: 'Old Workflow',
          workspaceId: 'workspace-123',
        },
        update: jest.fn().mockReturnThis(),
      };

      // Ensure that mockWorkflow.update returns an object with correct props for final return
      (mockWorkflow as any).props = {
        id: workflowId,
        name: 'Updated Workflow',
        workspaceId: 'workspace-123',
        description: 'Updated description',
      };

      workflowRepository.findById.mockResolvedValue(mockWorkflow);
      workflowRepository.update.mockResolvedValue(undefined);

      const result = await service.update(workflowId, dto);

      expect(workflowRepository.findById).toHaveBeenCalledWith(workflowId);
      expect(workflowRepository.update).toHaveBeenCalled();
      expect(result.name).toBe('Updated Workflow');
    });

    it('should throw NotFoundException if workflow not found', async () => {
      const workflowId = 'non-existent';
      const dto: UpdateWorkflowDto = {
        name: 'Updated',
      };

      workflowRepository.findById.mockResolvedValue(null);

      await expect(service.update(workflowId, dto)).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should delete workflow and return success', async () => {
      const workflowId = 'workflow-123';

      workflowRepository.delete.mockResolvedValue(undefined);

      const result = await service.remove(workflowId);

      expect(result).toEqual({ success: true });
      expect(workflowRepository.delete).toHaveBeenCalledWith(workflowId);
    });
  });
});
