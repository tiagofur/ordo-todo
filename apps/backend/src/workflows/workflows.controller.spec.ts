import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';

describe('WorkflowsController', () => {
  let controller: WorkflowsController;
  let workflowsService: jest.Mocked<WorkflowsService>;

  beforeEach(async () => {
    const mockWorkflowsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowsController],
      providers: [
        { provide: WorkflowsService, useValue: mockWorkflowsService },
      ],
    }).compile();

    controller = module.get<WorkflowsController>(WorkflowsController);
    workflowsService = module.get<WorkflowsService>(
      WorkflowsService,
    ) as jest.Mocked<WorkflowsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new workflow', async () => {
      const createDto = {
        workspaceId: 'ws-123',
        name: 'Development',
        description: 'Sprint workflow',
        icon: '🚀',
        color: '#3B82F6',
      };

      const mockWorkflow = {
        id: 'wf-123',
        ...createDto,
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      workflowsService.create.mockResolvedValue(mockWorkflow as any);

      const result = await controller.create(createDto);

      expect(workflowsService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockWorkflow);
    });

    it('should throw error on invalid data', async () => {
      const createDto = {
        workspaceId: 'ws-123',
        // Missing name
      } as any;

      workflowsService.create.mockRejectedValue(new Error('Name is required'));

      await expect(controller.create(createDto)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return workflows for workspace', async () => {
      const mockWorkflows = [
        { id: 'wf-1', name: 'Kanban', projectCount: 5 },
        { id: 'wf-2', name: 'Scrum', projectCount: 3 },
      ];
      workflowsService.findAll.mockResolvedValue(mockWorkflows as any);

      const result = await controller.findAll('ws-123');

      expect(workflowsService.findAll).toHaveBeenCalledWith('ws-123');
      expect(result).toEqual(mockWorkflows);
    });

    it('should return empty array if no workflows', async () => {
      workflowsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll('ws-123');

      expect(workflowsService.findAll).toHaveBeenCalledWith('ws-123');
      expect(result).toEqual([]);
    });

    it('should return all workflows without filter', async () => {
      const mockWorkflows = [
        { id: 'wf-1', name: 'Kanban', workspaceId: 'ws-1' },
        { id: 'wf-2', name: 'Scrum', workspaceId: 'ws-2' },
      ];
      workflowsService.findAll.mockResolvedValue(mockWorkflows as any);

      const result = await controller.findAll(undefined);

      expect(workflowsService.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockWorkflows);
    });
  });

  describe('update', () => {
    it('should update workflow', async () => {
      const updateDto = {
        name: 'Updated Workflow',
        description: 'Updated description',
        icon: '🔄',
        color: '#8B5CF6',
      };

      const updatedWorkflow = {
        id: 'wf-123',
        name: 'Updated Workflow',
        description: 'Updated description',
      };

      workflowsService.update.mockResolvedValue(updatedWorkflow as any);

      const result = await controller.update('wf-123', updateDto);

      expect(workflowsService.update).toHaveBeenCalledWith('wf-123', updateDto);
      expect(result).toEqual(updatedWorkflow);
    });

    it('should update only name', async () => {
      const updateDto = {
        name: 'New Name Only',
      };

      const updatedWorkflow = {
        id: 'wf-123',
        name: 'New Name Only',
        description: 'Original description',
      };

      workflowsService.update.mockResolvedValue(updatedWorkflow as any);

      const result = await controller.update('wf-123', updateDto);

      expect(workflowsService.update).toHaveBeenCalledWith('wf-123', updateDto);
      expect(result).toEqual(updatedWorkflow);
    });

    it('should throw NotFoundException if workflow not found', async () => {
      const updateDto = {
        name: 'Updated',
      };

      workflowsService.update.mockRejectedValue(
        new NotFoundException('Workflow not found'),
      );

      await expect(
        controller.update('non-existent', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete workflow', async () => {
      workflowsService.remove.mockResolvedValue({ success: true } as any);

      const result = await controller.remove('wf-123');

      expect(workflowsService.remove).toHaveBeenCalledWith('wf-123');
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if workflow not found', async () => {
      workflowsService.remove.mockRejectedValue(
        new NotFoundException('Workflow not found'),
      );

      await expect(controller.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error if workflow has projects', async () => {
      workflowsService.remove.mockRejectedValue(
        new Error('Cannot delete workflow with existing projects'),
      );

      await expect(controller.remove('wf-123')).rejects.toThrow();
    });
  });
});
