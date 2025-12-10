import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';

describe('WorkflowsController', () => {
    let controller: WorkflowsController;
    let workflowsService: jest.Mocked<WorkflowsService>;

    const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test' };

    beforeEach(async () => {
        const mockWorkflowsService = {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            reorder: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [WorkflowsController],
            providers: [
                { provide: WorkflowsService, useValue: mockWorkflowsService },
            ],
        }).compile();

        controller = module.get<WorkflowsController>(WorkflowsController);
        workflowsService = module.get<WorkflowsService>(WorkflowsService) as jest.Mocked<WorkflowsService>;
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

            const result = await controller.create(createDto, mockUser);

            expect(workflowsService.create).toHaveBeenCalledWith(mockUser.id, createDto);
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

            const result = await controller.findAll('ws-123', mockUser);

            expect(workflowsService.findAll).toHaveBeenCalledWith('ws-123', mockUser.id);
            expect(result).toEqual(mockWorkflows);
        });
    });

    describe('findOne', () => {
        it('should return workflow by id', async () => {
            const mockWorkflow = { id: 'wf-123', name: 'Development', stages: [] };
            workflowsService.findById.mockResolvedValue(mockWorkflow as any);

            const result = await controller.findOne('wf-123', mockUser);

            expect(workflowsService.findById).toHaveBeenCalledWith('wf-123', mockUser.id);
            expect(result).toEqual(mockWorkflow);
        });
    });

    describe('update', () => {
        it('should update workflow', async () => {
            const updateDto = { name: 'Updated Workflow' };
            const updatedWorkflow = { id: 'wf-123', name: 'Updated Workflow' };
            workflowsService.update.mockResolvedValue(updatedWorkflow as any);

            const result = await controller.update('wf-123', updateDto, mockUser);

            expect(workflowsService.update).toHaveBeenCalledWith('wf-123', mockUser.id, updateDto);
            expect(result).toEqual(updatedWorkflow);
        });
    });

    describe('remove', () => {
        it('should delete workflow', async () => {
            workflowsService.delete.mockResolvedValue(undefined);

            await controller.remove('wf-123', mockUser);

            expect(workflowsService.delete).toHaveBeenCalledWith('wf-123', mockUser.id);
        });
    });

    describe('reorder', () => {
        it('should reorder workflow stages', async () => {
            const reorderDto = {
                stages: [
                    { id: 'stage-1', order: 2 },
                    { id: 'stage-2', order: 0 },
                    { id: 'stage-3', order: 1 },
                ],
            };
            const reorderedWorkflow = { id: 'wf-123', stages: reorderDto.stages };
            workflowsService.reorder.mockResolvedValue(reorderedWorkflow as any);

            const result = await controller.reorder('wf-123', reorderDto, mockUser);

            expect(workflowsService.reorder).toHaveBeenCalledWith('wf-123', mockUser.id, reorderDto.stages);
            expect(result).toEqual(reorderedWorkflow);
        });
    });
});
