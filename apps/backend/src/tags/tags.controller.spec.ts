import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';

describe('TagsController', () => {
  let controller: TagsController;
  let tagsService: jest.Mocked<TagsService>;

  beforeEach(async () => {
    const mockTagsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      assignToTask: jest.fn(),
      removeFromTask: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [{ provide: TagsService, useValue: mockTagsService }],
    }).compile();

    controller = module.get<TagsController>(TagsController);
    tagsService = module.get<TagsService>(
      TagsService,
    ) as jest.Mocked<TagsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new tag', async () => {
      const createDto = {
        workspaceId: 'ws-123',
        name: 'Urgent',
        color: '#ef4444',
      };

      const mockTag = {
        id: 'tag-123',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      tagsService.create.mockResolvedValue(mockTag as any);

      const result = await controller.create(createDto);

      expect(tagsService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockTag);
    });

    it('should throw error on invalid data', async () => {
      const createDto = {
        workspaceId: 'ws-123',
        // Missing name
      } as any;

      tagsService.create.mockRejectedValue(new Error('Name is required'));

      await expect(controller.create(createDto)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all tags for workspace', async () => {
      const mockTags = [
        {
          id: 'tag-1',
          name: 'Urgent',
          color: '#ef4444',
          workspaceId: 'ws-123',
        },
        { id: 'tag-2', name: 'Bug', color: '#f59e0b', workspaceId: 'ws-123' },
      ];

      tagsService.findAll.mockResolvedValue(mockTags as any);

      const result = await controller.findAll('ws-123');

      expect(tagsService.findAll).toHaveBeenCalledWith('ws-123');
      expect(result).toEqual(mockTags);
    });

    it('should return empty array if no tags', async () => {
      tagsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll('ws-123');

      expect(tagsService.findAll).toHaveBeenCalledWith('ws-123');
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single tag by ID', async () => {
      const mockTag = {
        id: 'tag-123',
        name: 'Urgent',
        color: '#ef4444',
        workspaceId: 'ws-0987654321',
        createdAt: new Date('2025-01-05T10:00:00Z'),
      };

      tagsService.findOne.mockResolvedValue(mockTag as any);

      const result = await controller.findOne('tag-123');

      expect(tagsService.findOne).toHaveBeenCalledWith('tag-123');
      expect(result).toEqual(mockTag);
    });

    it('should throw NotFoundException if tag not found', async () => {
      tagsService.findOne.mockRejectedValue(
        new NotFoundException('Tag not found'),
      );

      await expect(controller.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not a member of tag workspace', async () => {
      tagsService.findOne.mockRejectedValue(
        new ForbiddenException('Not a member of the tag workspace'),
      );

      await expect(controller.findOne('tag-123')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update tag', async () => {
      const updateDto = {
        name: 'Updated Tag',
        color: '#3b82f6',
      };

      const updatedTag = {
        id: 'tag-123',
        name: 'Updated Tag',
        color: '#3b82f6',
      };

      tagsService.update.mockResolvedValue(updatedTag as any);

      const result = await controller.update('tag-123', updateDto);

      expect(tagsService.update).toHaveBeenCalledWith('tag-123', updateDto);
      expect(result).toEqual(updatedTag);
    });

    it('should update only name', async () => {
      const updateDto = {
        name: 'New Name Only',
      };

      const updatedTag = {
        id: 'tag-123',
        name: 'New Name Only',
        color: '#ef4444',
      };

      tagsService.update.mockResolvedValue(updatedTag as any);

      const result = await controller.update('tag-123', updateDto);

      expect(tagsService.update).toHaveBeenCalledWith('tag-123', updateDto);
      expect(result).toEqual(updatedTag);
    });

    it('should throw NotFoundException if tag not found', async () => {
      const updateDto = {
        name: 'Updated',
      };

      tagsService.update.mockRejectedValue(
        new NotFoundException('Tag not found'),
      );

      await expect(
        controller.update('non-existent', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete tag', async () => {
      tagsService.remove.mockResolvedValue({ success: true } as any);

      const result = await controller.remove('tag-123');

      expect(tagsService.remove).toHaveBeenCalledWith('tag-123');
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if tag not found', async () => {
      tagsService.remove.mockRejectedValue(
        new NotFoundException('Tag not found'),
      );

      await expect(controller.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not owner or admin', async () => {
      tagsService.remove.mockRejectedValue(
        new ForbiddenException('Insufficient permissions'),
      );

      await expect(controller.remove('tag-123')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('assignToTask', () => {
    it('should assign tag to task', async () => {
      const mockResult = {
        tagId: 'tag-123',
        taskId: 'task-123',
        assignedAt: new Date('2025-12-29T10:00:00Z'),
      };

      tagsService.assignToTask.mockResolvedValue(mockResult as any);

      const result = await controller.assignToTask('tag-123', 'task-123');

      expect(tagsService.assignToTask).toHaveBeenCalledWith(
        'tag-123',
        'task-123',
      );
      expect(result).toEqual(mockResult);
    });

    it('should throw NotFoundException if tag or task not found', async () => {
      tagsService.assignToTask.mockRejectedValue(
        new NotFoundException('Tag not found'),
      );

      await expect(
        controller.assignToTask('non-existent', 'task-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not a member of tag workspace', async () => {
      tagsService.assignToTask.mockRejectedValue(
        new ForbiddenException('Not a member of the tag workspace'),
      );

      await expect(
        controller.assignToTask('tag-123', 'task-123'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeFromTask', () => {
    it('should remove tag from task', async () => {
      tagsService.removeFromTask.mockResolvedValue({ success: true } as any);

      const result = await controller.removeFromTask('tag-123', 'task-123');

      expect(tagsService.removeFromTask).toHaveBeenCalledWith(
        'tag-123',
        'task-123',
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if tag or task not found', async () => {
      tagsService.removeFromTask.mockRejectedValue(
        new NotFoundException('Tag not found'),
      );

      await expect(
        controller.removeFromTask('non-existent', 'task-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
