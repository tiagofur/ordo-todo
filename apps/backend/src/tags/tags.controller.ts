import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@ApiTags('Tags')
@ApiBearerAuth()
@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  /**
   * Create a new tag in a workspace
   * Creates a tag that can be assigned to tasks for organization
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new tag',
    description:
      'Creates a new tag in a workspace that can be assigned to tasks for organization and filtering',
  })
  @ApiResponse({
    status: 201,
    description: 'Tag created successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        name: 'Urgent',
        color: '#ef4444',
        workspaceId: 'clx0987654321',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  /**
   * Update an existing tag
   * Modifies tag name, color, or other properties
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a tag',
    description:
      'Updates an existing tag with new name, color, or other properties',
  })
  @ApiResponse({
    status: 200,
    description: 'Tag updated successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        name: 'High Priority',
        color: '#f97316',
        workspaceId: 'clx0987654321',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(id, updateTagDto);
  }

  /**
   * Get all tags in a workspace
   * Returns list of tags filtered by workspace
   */
  @Get()
  @ApiOperation({
    summary: 'Get all tags',
    description:
      'Retrieves all tags in a workspace. Can filter by workspaceId parameter',
  })
  @ApiResponse({
    status: 200,
    description: 'Tags retrieved successfully',
    schema: {
      example: [
        {
          id: 'clx1234567890',
          name: 'Urgent',
          color: '#ef4444',
          workspaceId: 'clx0987654321',
        },
        {
          id: 'clx1111111111',
          name: 'Work',
          color: '#3b82f6',
          workspaceId: 'clx0987654321',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query('workspaceId') workspaceId: string) {
    return this.tagsService.findAll(workspaceId);
  }

  /**
   * Assign a tag to a task
   * Links a tag to a task for categorization
   */
  @Post(':tagId/tasks/:taskId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Assign tag to task',
    description:
      'Assigns a tag to a task. Links the two entities for categorization and filtering',
  })
  @ApiResponse({
    status: 201,
    description: 'Tag assigned to task successfully',
    schema: {
      example: {
        tagId: 'clx1234567890',
        taskId: 'clx0987654321',
        assignedAt: '2025-12-29T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Tag or task not found' })
  assignToTask(@Param('tagId') tagId: string, @Param('taskId') taskId: string) {
    return this.tagsService.assignToTask(tagId, taskId);
  }

  /**
   * Remove a tag from a task
   * Unlinks a tag from a task
   */
  @Delete(':tagId/tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove tag from task',
    description:
      'Removes a tag assignment from a task. Unlinks the two entities',
  })
  @ApiResponse({
    status: 204,
    description: 'Tag removed from task successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Tag or task not found' })
  removeFromTask(
    @Param('tagId') tagId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tagsService.removeFromTask(tagId, taskId);
  }

  /**
   * Delete a tag
   * Permanently removes a tag from the workspace
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a tag',
    description:
      'Permanently deletes a tag from the workspace. Also removes all tag assignments from tasks',
  })
  @ApiResponse({ status: 204, description: 'Tag deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
}
