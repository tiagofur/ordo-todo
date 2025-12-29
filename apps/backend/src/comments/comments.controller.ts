import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('Comments')
@ApiBearerAuth()
@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * Create a new comment
   * Adds comment to a task or other entity
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a comment',
    description: 'Creates a new comment on a task or other entity',
  })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        content: 'This task looks great!',
        taskId: 'clx0987654321',
        userId: 'clx1111111111',
        createdAt: '2025-12-29T10:00:00Z',
        updatedAt: '2025-12-29T10:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data (validation failed)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.commentsService.create(createCommentDto, user.id);
  }

  /**
   * Get a specific comment by ID
   * Retrieves comment details including user info
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get a comment',
    description: 'Retrieves a specific comment by ID with full details',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment retrieved successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        content: 'This task looks great!',
        taskId: 'clx0987654321',
        userId: 'clx1111111111',
        user: {
          id: 'clx1111111111',
          username: 'johndoe',
          name: 'John Doe',
        },
        createdAt: '2025-12-29T10:00:00Z',
        updatedAt: '2025-12-29T10:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  /**
   * Update an existing comment
   * Only the comment author can update their own comments
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update a comment',
    description:
      'Updates an existing comment. Only the comment author can update.',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        content: 'Updated comment text',
        taskId: 'clx0987654321',
        userId: 'clx1111111111',
        createdAt: '2025-12-29T10:00:00Z',
        updatedAt: '2025-12-29T11:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data (validation failed)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the comment author',
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.commentsService.update(id, updateCommentDto, user.id);
  }

  /**
   * Delete a comment
   * Only the comment author can delete their own comments
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a comment',
    description:
      'Deletes an existing comment. Only the comment author can delete.',
  })
  @ApiResponse({ status: 204, description: 'Comment deleted successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the comment author',
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.commentsService.remove(id, user.id);
  }
}
