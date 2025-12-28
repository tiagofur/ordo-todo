import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';

describe('TemplatesController', () => {
  let controller: TemplatesController;
  let templatesService: jest.Mocked<TemplatesService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test',
  };

  beforeEach(async () => {
    const mockTemplatesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
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
        workspaceId: 'ws-123',
      };
      const mockTemplate = {
        id: 'tmpl-123',
        ...createDto,
      };
      templatesService.create.mockResolvedValue(mockTemplate as any);

      const result = await controller.create(createDto);

      expect(templatesService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockTemplate);
    });
  });

  describe('findAll', () => {
    it('should return all templates for workspace', async () => {
      const workspaceId = 'ws-123';
      const mockTemplates = [
        { id: 'tmpl-1', name: 'Template 1' },
        { id: 'tmpl-2', name: 'Template 2' },
      ];
      templatesService.findAll.mockResolvedValue(mockTemplates as any);

      const result = await controller.findAll(workspaceId);

      expect(templatesService.findAll).toHaveBeenCalledWith(workspaceId);
      expect(result).toEqual(mockTemplates);
    });
  });

  describe('findOne', () => {
    it('should return template by id', async () => {
      const mockTemplate = { id: 'tmpl-123', name: 'Test Template' };
      templatesService.findOne.mockResolvedValue(mockTemplate as any);

      const result = await controller.findOne('tmpl-123');

      expect(templatesService.findOne).toHaveBeenCalledWith('tmpl-123');
      expect(result).toEqual(mockTemplate);
    });
  });

  describe('update', () => {
    it('should update template', async () => {
      const updateDto = { name: 'Updated Template' };
      const updatedTemplate = { id: 'tmpl-123', name: 'Updated Template' };
      templatesService.update.mockResolvedValue(updatedTemplate as any);

      const result = await controller.update('tmpl-123', updateDto);

      expect(templatesService.update).toHaveBeenCalledWith(
        'tmpl-123',
        updateDto,
      );
      expect(result).toEqual(updatedTemplate);
    });
  });

  describe('remove', () => {
    it('should delete template', async () => {
      templatesService.remove.mockResolvedValue(undefined);

      await controller.remove('tmpl-123');

      expect(templatesService.remove).toHaveBeenCalledWith('tmpl-123');
    });
  });
});
