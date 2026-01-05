import { Test, TestingModule } from '@nestjs/testing';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../cache/redis.service';

describe('NotesController', () => {
  let controller: NotesController;
  let notesService: jest.Mocked<NotesService>;

  const mockRequestUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  // Mock RedisService for cache interceptors
  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    delPattern: jest.fn(),
    healthCheck: jest.fn(),
  };

  beforeEach(async () => {
    const mockNotesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        {
          provide: NotesService,
          useValue: mockNotesService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<NotesController>(NotesController);
    notesService = module.get<NotesService>(
      NotesService,
    ) as jest.Mocked<NotesService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new note', async () => {
      const createDto = {
        content: 'Test note',
        workspaceId: 'ws-123',
      };
      const mockNote = {
        id: 'note-123',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      notesService.create.mockResolvedValue(mockNote as any);

      const result = await controller.create(createDto, mockRequestUser);

      expect(notesService.create).toHaveBeenCalledWith(createDto, mockRequestUser.id);
      expect(result).toEqual(mockNote);
    });

    it('should throw error on invalid data', async () => {
      const createDto = {
        workspaceId: 'ws-123',
        // Missing content
      } as any;

      notesService.create.mockRejectedValue(new Error('Content is required'));

      await expect(controller.create(createDto, mockRequestUser)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all notes for workspace', async () => {
      const workspaceId = 'ws-123';
      const mockNotes = [
        {
          id: 'note-1',
          content: 'Note 1',
          workspaceId,
          authorId: mockRequestUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'note-2',
          content: 'Note 2',
          workspaceId,
          authorId: mockRequestUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      notesService.findAll.mockResolvedValue({
        data: mockNotes,
        meta: { total: 2, page: 0, limit: 20, totalPages: 1 },
      } as any);

      const result = await controller.findAll(workspaceId, {} as any, mockRequestUser);

      expect(notesService.findAll).toHaveBeenCalledWith(workspaceId, mockRequestUser.id, expect.any(Object));
      expect(result).toEqual({
        data: mockNotes,
        meta: { total: 2, page: 0, limit: 20, totalPages: 1 },
      });
    });

    it('should return empty array if no notes', async () => {
      const workspaceId = 'ws-123';

      notesService.findAll.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 0, limit: 20, totalPages: 0 },
      } as any);

      const result = await controller.findAll(workspaceId, {} as any, mockRequestUser);

      expect(notesService.findAll).toHaveBeenCalledWith(workspaceId, mockRequestUser.id, expect.any(Object));
      expect(result).toEqual({
        data: [],
        meta: { total: 0, page: 0, limit: 20, totalPages: 0 },
      });
    });

    it('should throw ForbiddenException if user is not member', async () => {
      const workspaceId = 'ws-123';

      notesService.findAll.mockRejectedValue(
        new ForbiddenException('You are not a member of this workspace'),
      );

      await expect(
        controller.findAll(workspaceId, {} as any, mockRequestUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findOne', () => {
    it('should return a single note by ID', async () => {
      const noteId = 'note-123';
      const mockNote = {
        id: noteId,
        content: 'Test note',
        workspaceId: 'ws-0987654321',
        authorId: mockRequestUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      notesService.findOne.mockResolvedValue(mockNote as any);

      const result = await controller.findOne(noteId, mockRequestUser);

      expect(notesService.findOne).toHaveBeenCalledWith(noteId, mockRequestUser.id);
      expect(result).toEqual(mockNote);
    });

    it('should throw NotFoundException if note not found', async () => {
      const noteId = 'non-existent';

      notesService.findOne.mockRejectedValue(
        new NotFoundException('Note with ID non-existent not found'),
      );

      await expect(controller.findOne(noteId, mockRequestUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not a member of note workspace', async () => {
      const noteId = 'note-123';

      notesService.findOne.mockRejectedValue(
        new ForbiddenException('You do not have permission to access this note'),
      );

      await expect(controller.findOne(noteId, mockRequestUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update note', async () => {
      const noteId = 'note-123';
      const updateDto = {
        content: 'Updated note',
      };
      const updatedNote = {
        id: noteId,
        ...updateDto,
        updatedAt: new Date(),
      };

      notesService.update.mockResolvedValue(updatedNote as any);

      const result = await controller.update(noteId, updateDto, mockRequestUser);

      expect(notesService.update).toHaveBeenCalledWith(noteId, updateDto, mockRequestUser.id);
      expect(result).toEqual(updatedNote);
    });

    it('should update only content', async () => {
      const noteId = 'note-123';
      const updateDto = {
        content: 'New content only',
      };
      const updatedNote = {
        id: noteId,
        content: 'New content only',
        color: '#feff9c',
        updatedAt: new Date(),
      };

      notesService.update.mockResolvedValue(updatedNote as any);

      const result = await controller.update(noteId, updateDto, mockRequestUser);

      expect(notesService.update).toHaveBeenCalledWith(noteId, updateDto, mockRequestUser.id);
      expect(result).toEqual(updatedNote);
    });

    it('should throw NotFoundException if note not found', async () => {
      const noteId = 'non-existent';
      const updateDto = {
        content: 'Updated',
      };

      notesService.update.mockRejectedValue(
        new NotFoundException('Note with ID non-existent not found'),
      );

      await expect(
        controller.update(noteId, updateDto, mockRequestUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not author', async () => {
      const noteId = 'note-123';
      const updateDto = {
        content: 'Updated',
      };

      notesService.update.mockRejectedValue(
        new ForbiddenException('Only the note author can update it'),
      );

      await expect(
        controller.update(noteId, updateDto, mockRequestUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete note', async () => {
      const noteId = 'note-123';
      const mockNote = {
        id: noteId,
        content: 'Test note',
        deletedAt: new Date(),
      };

      notesService.remove.mockResolvedValue(mockNote as any);

      const result = await controller.remove(noteId, mockRequestUser);

      expect(notesService.remove).toHaveBeenCalledWith(noteId, mockRequestUser.id);
      expect(result).toEqual(mockNote);
    });

    it('should throw NotFoundException if note not found', async () => {
      const noteId = 'non-existent';

      notesService.remove.mockRejectedValue(
        new NotFoundException('Note with ID non-existent not found'),
      );

      await expect(controller.remove(noteId, mockRequestUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not author', async () => {
      const noteId = 'note-123';

      notesService.remove.mockRejectedValue(
        new ForbiddenException('Only the note author can delete it'),
      );

      await expect(controller.remove(noteId, mockRequestUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
