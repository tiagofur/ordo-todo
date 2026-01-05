import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { NoteRepository } from '@ordo-todo/core';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

// Mock Note entity
class MockNote {
  id = 'note-123';
  props = {
    content: 'Test note',
    workspaceId: 'workspace-123',
    authorId: 'user-123',
    x: 100,
    y: 100,
    width: 300,
    height: 300,
    color: '#feff9c',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  update(props: Partial<any>) {
    const updated = new MockNote();
    updated.props = { ...this.props, ...props, updatedAt: new Date() };
    updated.id = this.id;
    return updated;
  }
}

describe('NotesService', () => {
  let service: NotesService;
  let noteRepository: jest.Mocked<NoteRepository>;

  const mockNoteRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    findByWorkspaceId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findWorkspaceMember: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: 'NoteRepository',
          useValue: mockNoteRepository,
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
    noteRepository = module.get('NoteRepository');
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
      const mockNote = new MockNote();

      mockNoteRepository.save.mockResolvedValue(mockNote as any);

      const result = await service.create(createNoteDto, userId);

      expect(mockNoteRepository.save).toHaveBeenCalled();
      expect(result.content).toBe(mockNote.props.content);
      expect(result.workspaceId).toBe(mockNote.props.workspaceId);
      expect(result.authorId).toBe(mockNote.props.authorId);
    });
  });

  describe('findAll', () => {
    it('should return all notes for workspace when user is member', async () => {
      const workspaceId = 'workspace-123';
      const userId = 'user-123';
      const query = {
        limit: 20,
        page: 0,
        search: undefined,
        authorId: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
      };
      const mockNotes = [new MockNote(), new MockNote()];

      mockNoteRepository.findWorkspaceMember.mockResolvedValue({
        userId,
        workspaceId,
        role: 'MEMBER',
      });
      mockNoteRepository.findByWorkspaceId.mockResolvedValue({
        data: mockNotes as any,
        total: 2,
        page: 0,
        limit: 20,
        totalPages: 1,
      });

      const result = await service.findAll(workspaceId, userId, query);

      expect(mockNoteRepository.findWorkspaceMember).toHaveBeenCalledWith(
        workspaceId,
        userId,
      );
      expect(result).toEqual({
        data: mockNotes.map((n) => n.props),
        meta: {
          total: 2,
          page: 0,
          limit: 20,
          totalPages: 1,
        },
      });
    });

    it('should throw ForbiddenException when user is not member', async () => {
      const workspaceId = 'workspace-123';
      const userId = 'user-123';
      const query = {
        limit: 20,
        page: 0,
        search: undefined,
        authorId: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
      };

      mockNoteRepository.findWorkspaceMember.mockResolvedValue(null);

      await expect(service.findAll(workspaceId, userId, query)).rejects.toThrow(
        'You are not a member of this workspace',
      );
    });
  });

  describe('findOne', () => {
    it('should return a note when user is author', async () => {
      const noteId = 'note-123';
      const userId = 'user-123';
      const mockNote = new MockNote();
      mockNote.props.authorId = userId;

      mockNoteRepository.findById.mockResolvedValue(mockNote as any);
      mockNoteRepository.findWorkspaceMember.mockResolvedValue({
        userId,
        workspaceId: mockNote.props.workspaceId,
        role: 'MEMBER',
      });

      const result = await service.findOne(noteId, userId);

      expect(result).toEqual(mockNote.props);
    });

    it('should return a note when user is workspace member', async () => {
      const noteId = 'note-123';
      const userId = 'user-456';
      const mockNote = new MockNote();
      mockNote.props.authorId = 'user-123'; // Different author

      mockNoteRepository.findById.mockResolvedValue(mockNote as any);
      mockNoteRepository.findWorkspaceMember.mockResolvedValue({
        userId,
        workspaceId: mockNote.props.workspaceId,
        role: 'MEMBER',
      });

      const result = await service.findOne(noteId, userId);

      expect(result).toEqual(mockNote.props);
    });

    it('should throw NotFoundException when note not found', async () => {
      const noteId = 'non-existent';
      const userId = 'user-123';

      mockNoteRepository.findById.mockResolvedValue(null);
      mockNoteRepository.findWorkspaceMember.mockResolvedValue({
        userId,
        workspaceId: 'workspace-123',
        role: 'MEMBER',
      });

      await expect(service.findOne(noteId, userId)).rejects.toThrow(
        'Note not found',
      );
    });

    it('should throw ForbiddenException when user is not member', async () => {
      const noteId = 'note-123';
      const userId = 'user-456';
      const mockNote = new MockNote();
      mockNote.props.authorId = 'user-123'; // Different author

      mockNoteRepository.findById.mockResolvedValue(mockNote as any);
      mockNoteRepository.findWorkspaceMember.mockResolvedValue(null);

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
      const mockNote = new MockNote();
      mockNote.props.authorId = userId;
      const updatedNote = mockNote.update({ content: 'Updated content' });

      mockNoteRepository.findById.mockResolvedValue(mockNote as any);
      mockNoteRepository.findWorkspaceMember.mockResolvedValue({
        userId,
        workspaceId: mockNote.props.workspaceId,
        role: 'MEMBER',
      });
      mockNoteRepository.update.mockResolvedValue(updatedNote as any);

      const result = await service.update(noteId, updateNoteDto, userId);

      expect(result.content).toBe('Updated content');
    });

    it('should throw ForbiddenException when user is not author', async () => {
      const noteId = 'note-123';
      const userId = 'user-456';
      const updateNoteDto = { content: 'Updated content' };
      const mockNote = new MockNote();
      mockNote.props.authorId = 'user-123'; // Different author

      mockNoteRepository.findById.mockResolvedValue(mockNote as any);
      mockNoteRepository.findWorkspaceMember.mockResolvedValue({
        userId,
        workspaceId: mockNote.props.workspaceId,
        role: 'MEMBER',
      });

      await expect(
        service.update(noteId, updateNoteDto, userId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete note when user is author', async () => {
      const noteId = 'note-123';
      const userId = 'user-123';
      const mockNote = new MockNote();
      mockNote.props.authorId = userId;

      mockNoteRepository.findById.mockResolvedValue(mockNote as any);
      mockNoteRepository.findWorkspaceMember.mockResolvedValue({
        userId,
        workspaceId: mockNote.props.workspaceId,
        role: 'MEMBER',
      });
      mockNoteRepository.delete.mockResolvedValue(mockNote as any);

      const result = await service.remove(noteId, userId);

      expect(result).toEqual({
        id: noteId,
        content: mockNote.props.content,
        workspaceId: mockNote.props.workspaceId,
        authorId: mockNote.props.authorId,
        deletedAt: expect.any(Date),
      });
    });

    it('should throw ForbiddenException when user is not author', async () => {
      const noteId = 'note-123';
      const userId = 'user-456';
      const mockNote = new MockNote();
      mockNote.props.authorId = 'user-123'; // Different author

      mockNoteRepository.findById.mockResolvedValue(mockNote as any);
      mockNoteRepository.findWorkspaceMember.mockResolvedValue({
        userId,
        workspaceId: mockNote.props.workspaceId,
        role: 'MEMBER',
      });

      await expect(service.remove(noteId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
