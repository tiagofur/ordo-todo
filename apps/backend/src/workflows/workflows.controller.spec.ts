import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';

describe('WorkflowsController', () => {
  let controller: WorkflowsController;
  let workflowsService: jest.Mocked<WorkflowsService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test',
  };

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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new workflow', async () => {
      const createDto = {
        workspaceId: 'ws-123',
        name: 'Development',
        stages: [
          { name: 'Backlog', order: 0 },
          { name: 'In Progress', order: 1 },
          { name: 'Done', order: 2 },
        ],
      };
      const mockWorkflow = { id: 'wf-123', ...createDto };
      workflowsService.create.mockResolvedValue(mockWorkflow as any);

      const result = await controller.create(createDto);

      expect(workflowsService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockWorkflow);
    });
  });

  describe('findAll', () => {
    it('should return workflows for workspace', async () => {
      const mockWorkflows = [
        { id: 'wf-1', name: 'Kanban' },
        { id: 'wf-2', name: 'Scrum' },
      ];
      workflowsService.findAll.mockResolvedValue(mockWorkflows as any);

      const result = await controller.findAll('ws-123');

      expect(workflowsService.findAll).toHaveBeenCalledWith('ws-123');
      expect(result).toEqual(mockWorkflows);
    });
  });

  describe('update', () => {
    it('should update workflow', async () => {
      const updateDto = { name: 'Updated Workflow' };
      const updatedWorkflow = { id: 'wf-123', name: 'Updated Workflow' };
      workflowsService.update.mockResolvedValue(updatedWorkflow as any);

      const result = await controller.update('wf-123', updateDto);

      expect(workflowsService.update).toHaveBeenCalledWith('wf-123', updateDto);
      expect(result).toEqual(updatedWorkflow);
    });
  });

  describe('remove', () => {
    it('should delete workflow', async () => {
      workflowsService.remove.mockResolvedValue({ success: true } as any);

      const result = await controller.remove('wf-123');

      expect(workflowsService.remove).toHaveBeenCalledWith('wf-123');
      expect(result).toEqual({ success: true });
    });
  });
});
