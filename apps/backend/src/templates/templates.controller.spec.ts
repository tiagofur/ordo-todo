import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';

describe('TemplatesController', () => {
  let controller: TemplatesController;
  let templatesService: jest.Mocked<TemplatesService>;

  const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test' };

  beforeEach(async () => {
    const mockTemplatesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createTaskFromTemplate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplatesController],
      providers: [
        { provide: TemplatesService, useValue: mockTemplatesService },
      ],
    }).compile();

    controller = module.get<TemplatesController>(TemplatesController);
    templatesService = module.get<TemplatesService>(
      TemplatesService,
    ) as jest.Mocked<TemplatesService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new template', async () => {
      const createDto = {
        name: 'Weekly Review',
        description: 'Template for weekly review task',
        taskData: {
          title: 'Weekly Review',
          estimatedMinutes: 30,
          priority: 'MEDIUM',
        },
      };
      const mockTemplate = {
        id: 'tmpl-123',
        ...createDto,
        userId: mockUser.id,
      };
      templatesService.create.mockResolvedValue(mockTemplate as any);

      const result = await controller.create(createDto, mockUser);

      expect(templatesService.create).toHaveBeenCalledWith(
        mockUser.id,
        createDto,
      );
      expect(result).toEqual(mockTemplate);
    });
  });

  describe('findAll', () => {
    it('should return all templates for user', async () => {
      const mockTemplates = [
        { id: 'tmpl-1', name: 'Template 1' },
        { id: 'tmpl-2', name: 'Template 2' },
      ];
      templatesService.findAll.mockResolvedValue(mockTemplates as any);

      const result = await controller.findAll(mockUser);

      expect(templatesService.findAll).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockTemplates);
    });
  });

  describe('findOne', () => {
    it('should return template by id', async () => {
      const mockTemplate = { id: 'tmpl-123', name: 'Test Template' };
      templatesService.findById.mockResolvedValue(mockTemplate as any);

      const result = await controller.findOne('tmpl-123', mockUser);

      expect(templatesService.findById).toHaveBeenCalledWith(
        'tmpl-123',
        mockUser.id,
      );
      expect(result).toEqual(mockTemplate);
    });
  });

  describe('update', () => {
    it('should update template', async () => {
      const updateDto = { name: 'Updated Template' };
      const updatedTemplate = { id: 'tmpl-123', name: 'Updated Template' };
      templatesService.update.mockResolvedValue(updatedTemplate as any);

      const result = await controller.update('tmpl-123', updateDto, mockUser);

      expect(templatesService.update).toHaveBeenCalledWith(
        'tmpl-123',
        mockUser.id,
        updateDto,
      );
      expect(result).toEqual(updatedTemplate);
    });
  });

  describe('remove', () => {
    it('should delete template', async () => {
      templatesService.delete.mockResolvedValue(undefined);

      await controller.remove('tmpl-123', mockUser);

      expect(templatesService.delete).toHaveBeenCalledWith(
        'tmpl-123',
        mockUser.id,
      );
    });
  });

  describe('createTask', () => {
    it('should create task from template', async () => {
      const createDto = {
        projectId: 'proj-123',
        dueDate: '2024-01-15',
      };
      const mockTask = { id: 'task-new', title: 'Weekly Review' };
      templatesService.createTaskFromTemplate.mockResolvedValue(
        mockTask as any,
      );

      const result = await controller.createTask(
        'tmpl-123',
        createDto,
        mockUser,
      );

      expect(templatesService.createTaskFromTemplate).toHaveBeenCalledWith(
        'tmpl-123',
        mockUser.id,
        createDto,
      );
      expect(result).toEqual(mockTask);
    });
  });
});
