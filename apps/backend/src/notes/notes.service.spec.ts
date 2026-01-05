import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('NotesService', () => {
  let service: NotesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    note: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    workspaceMember: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new note', async () => {
      const createNoteDto = {
        content: 'Test note',
        workspaceId: 'workspace-123',
      };
      const userId = 'user-123';
      const mockNote = {
        id: 'note-123',
        ...createNoteDto,
        authorId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.note.create.mockResolvedValue(mockNote);

      const result = await service.create(createNoteDto, userId);

      expect(mockPrismaService.note.create).toHaveBeenCalledWith({
        data: {
          ...createNoteDto,
          authorId: userId,
        },
      });
      expect(result).toEqual(mockNote);
    });
  });

  describe('findAll', () => {
    it('should return all notes for workspace when user is member', async () => {
      const workspaceId = 'workspace-123';
      const userId = 'user-123';
      const mockNotes = [
        {
          id: 'note-1',
          content: 'Note 1',
          workspaceId,
          authorId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'note-2',
          content: 'Note 2',
          workspaceId,
          authorId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.workspaceMember.findUnique.mockResolvedValue({
        workspaceId_userId: { workspaceId, userId },
      });
      mockPrismaService.note.findMany.mockResolvedValue(mockNotes);

      const result = await service.findAll(workspaceId, userId);

      expect(mockPrismaService.workspaceMember.findUnique).toHaveBeenCalledWith({
        where: {
          workspaceId_userId: { workspaceId, userId },
        },
      });
      expect(mockPrismaService.note.findMany).toHaveBeenCalledWith({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockNotes);
    });

    it('should throw ForbiddenException when user is not member', async () => {
      const workspaceId = 'workspace-123';
      const userId = 'user-123';

      mockPrismaService.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(service.findAll(workspaceId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.findAll(workspaceId, userId)).rejects.toThrow(
        'You are not a member of this workspace',
      );
    });

    it('should return empty array if no notes', async () => {
      const workspaceId = 'workspace-123';
      const userId = 'user-123';

      mockPrismaService.workspaceMember.findUnique.mockResolvedValue({
        workspaceId_userId: { workspaceId, userId },
      });
      mockPrismaService.note.findMany.mockResolvedValue([]);

      const result = await service.findAll(workspaceId, userId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return note when user is author', async () => {
      const noteId = 'note-123';
      const userId = 'user-123';
      const mockNote = {
        id: noteId,
        content: 'Test note',
        authorId: userId,
        workspaceId: 'workspace-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.note.findUnique.mockResolvedValue(mockNote);

      const result = await service.findOne(noteId, userId);

      expect(result).toEqual(mockNote);
      expect(mockPrismaService.workspaceMember.findUnique).not.toHaveBeenCalled();
    });

    it('should return note when user is workspace member', async () => {
      const noteId = 'note-123';
      const userId = 'user-456';
      const mockNote = {
        id: noteId,
        content: 'Test note',
        authorId: 'user-123', // Different author
        workspaceId: 'workspace-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.note.findUnique.mockResolvedValue(mockNote);
      mockPrismaService.workspaceMember.findUnique.mockResolvedValue({
        workspaceId_userId: { workspaceId: 'workspace-123', userId },
      });

      const result = await service.findOne(noteId, userId);

      expect(result).toEqual(mockNote);
      expect(mockPrismaService.workspaceMember.findUnique).toHaveBeenCalledWith({
        where: {
          workspaceId_userId: { workspaceId: 'workspace-123', userId },
        },
      });
    });

    it('should throw NotFoundException when note not found', async () => {
      const noteId = 'non-existent';
      const userId = 'user-123';

      mockPrismaService.note.findUnique.mockResolvedValue(null);

      await expect(service.findOne(noteId, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(noteId, userId)).rejects.toThrow(
        'Note with ID non-existent not found',
      );
    });

    it('should throw ForbiddenException when user is not member', async () => {
      const noteId = 'note-123';
      const userId = 'user-456';
      const mockNote = {
        id: noteId,
        content: 'Test note',
        authorId: 'user-123',
        workspaceId: 'workspace-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.note.findUnique.mockResolvedValue(mockNote);
      mockPrismaService.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(service.findOne(noteId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.findOne(noteId, userId)).rejects.toThrow(
        'You do not have permission to access this note',
      );
    });
  });

  describe('update', () => {
    it('should update note when user is author', async () => {
      const noteId = 'note-123';
      const userId = 'user-123';
      const updateNoteDto = { content: 'Updated content' };
      const mockNote = {
        id: noteId,
        content: 'Test note',
        authorId: userId,
        workspaceId: 'workspace-123',
      };
      const updatedNote = { ...mockNote, ...updateNoteDto };

      mockPrismaService.note.findUnique.mockResolvedValue(mockNote);
      mockPrismaService.note.update.mockResolvedValue(updatedNote);

      const result = await service.update(noteId, updateNoteDto, userId);

      expect(result).toEqual(updatedNote);
      expect(mockPrismaService.note.update).toHaveBeenCalledWith({
        where: { id: noteId },
        data: updateNoteDto,
      });
    });

    it('should throw ForbiddenException when user is not author', async () => {
      const noteId = 'note-123';
      const userId = 'user-456';
      const updateNoteDto = { content: 'Updated content' };
      const mockNote = {
        id: noteId,
        content: 'Test note',
        authorId: 'user-123', // Different author
        workspaceId: 'workspace-123',
      };

      mockPrismaService.note.findUnique.mockResolvedValue(mockNote);
      mockPrismaService.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(
        service.update(noteId, updateNoteDto, userId),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrismaService.note.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete note when user is author', async () => {
      const noteId = 'note-123';
      const userId = 'user-123';
      const mockNote = {
        id: noteId,
        content: 'Test note',
        authorId: userId,
        workspaceId: 'workspace-123',
      };

      mockPrismaService.note.findUnique.mockResolvedValue(mockNote);
      mockPrismaService.note.delete.mockResolvedValue(mockNote);

      const result = await service.remove(noteId, userId);

      expect(result).toEqual(mockNote);
      expect(mockPrismaService.note.delete).toHaveBeenCalledWith({
        where: { id: noteId },
      });
    });

    it('should throw ForbiddenException when user is not author', async () => {
      const noteId = 'note-123';
      const userId = 'user-456';
      const mockNote = {
        id: noteId,
        content: 'Test note',
        authorId: 'user-123',
        workspaceId: 'workspace-123',
      };

      mockPrismaService.note.findUnique.mockResolvedValue(mockNote);
      mockPrismaService.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(service.remove(noteId, userId)).rejects.toThrow(
        ForbiddenException,
      );

      expect(mockPrismaService.note.delete).not.toHaveBeenCalled();
    });
  });
});
