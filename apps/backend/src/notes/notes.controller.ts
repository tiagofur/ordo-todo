import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { QueryNoteDto } from './dto/query-note.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import {
  CacheResult,
  CacheInvalidate,
  CacheTTL,
} from '../common/decorators/cache';
import {
  CacheInterceptor,
  CacheInvalidateInterceptor,
} from '../common/decorators/cache';

@ApiTags('notes')
@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @UseInterceptors(CacheInvalidateInterceptor)
  @CacheInvalidate('notes')
  @ApiOperation({
    summary: 'Create a new sticky note',
    description: `
    Creates a new sticky note in a workspace. Sticky notes are visual notes
    that can be positioned on a canvas with x, y coordinates and have custom
    colors and sizes.

    **Default values:**
    - x: 100
    - y: 100
    - width: 300
    - height: 300
    - color: "#feff9c" (yellow)

    **Valid colors:** Any hex color (e.g., "#feff9c", "#ff0000", "#00ff00")

    **Access Control:** All workspace members can create notes.
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Note created successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        content: 'Meeting notes from today',
        x: 100,
        y: 100,
        width: 300,
        height: 300,
        color: '#feff9c',
        workspaceId: 'workspace-123',
        authorId: 'user-123',
        createdAt: '2025-01-05T10:00:00.000Z',
        updatedAt: '2025-01-05T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a workspace member' })
  create(
    @Body() createNoteDto: CreateNoteDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.notesService.create(createNoteDto, user.id);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheResult('notes', CacheTTL.MEDIUM)
  @ApiOperation({
    summary: 'Get all notes for a workspace',
    description: `
    Returns a paginated list of sticky notes for a workspace.
    Supports searching by content and filtering by author.

    **Query parameters:**
    - workspaceId (required): Workspace to get notes from
    - limit: Number of notes per page (default: 20, max: 100)
    - page: Page number (default: 0)
    - search: Search in note content (case-insensitive)
    - authorId: Filter by author ID
    - sortBy: Sort field (createdAt, updatedAt, content)
    - sortOrder: Sort order (asc, desc)

    **Response includes pagination metadata:**
    - data: Array of notes
    - meta.total: Total number of notes
    - meta.page: Current page number
    - meta.limit: Notes per page
    - meta.totalPages: Total number of pages

    **Caching:** Results are cached for 15 minutes.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Notes retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 'note-1',
            content: 'Project deadline tomorrow',
            x: 100,
            y: 100,
            width: 300,
            height: 300,
            color: '#feff9c',
            workspaceId: 'workspace-123',
            authorId: 'user-123',
            createdAt: '2025-01-05T10:00:00.000Z',
            updatedAt: '2025-01-05T11:00:00.000Z',
          },
        ],
        meta: {
          total: 45,
          page: 0,
          limit: 20,
          totalPages: 3,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a workspace member' })
  findAll(
    @Query('workspaceId') workspaceId: string,
    @Query() query: QueryNoteDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.notesService.findAll(workspaceId, user.id, query);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheResult('note', CacheTTL.LONG)
  @ApiOperation({
    summary: 'Get a specific note',
    description: `
    Returns a single sticky note by ID.

    **Access Control:**
    - Note author can always view
    - Workspace members can view

    **Caching:** Results are cached for 1 hour.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Note retrieved successfully',
    schema: {
      example: {
        id: 'note-123',
        content: 'Meeting notes from today',
        x: 100,
        y: 100,
        width: 300,
        height: 300,
        color: '#feff9c',
        workspaceId: 'workspace-123',
        authorId: 'user-123',
        createdAt: '2025-01-05T10:00:00.000Z',
        updatedAt: '2025-01-05T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.notesService.findOne(id, user.id);
  }

  @Patch(':id')
  @UseInterceptors(CacheInvalidateInterceptor)
  @CacheInvalidate('notes')
  @CacheInvalidate('note')
  @ApiOperation({
    summary: 'Update a note',
    description: `
    Updates a sticky note. Only the note author can update notes.

    **Partial updates allowed:** You can update only specific fields.

    **Access Control:** Only the note author can update.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Note updated successfully',
    schema: {
      example: {
        id: 'note-123',
        content: 'Updated content',
        x: 100,
        y: 100,
        width: 300,
        height: 300,
        color: '#feff9c',
        workspaceId: 'workspace-123',
        authorId: 'user-123',
        updatedAt: '2025-01-05T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only author can update' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.notesService.update(id, updateNoteDto, user.id);
  }

  @Delete(':id')
  @UseInterceptors(CacheInvalidateInterceptor)
  @CacheInvalidate('notes')
  @CacheInvalidate('note')
  @ApiOperation({
    summary: 'Delete a note',
    description: `
    Deletes a sticky note permanently. This action cannot be undone.

    **Access Control:** Only the note author can delete.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Note deleted successfully',
    schema: {
      example: {
        id: 'note-123',
        content: 'Deleted note',
        workspaceId: 'workspace-123',
        authorId: 'user-123',
        deletedAt: '2025-01-05T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only author can delete' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.notesService.remove(id, user.id);
  }
}
