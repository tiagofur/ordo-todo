import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
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
import { MemberRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TagGuard } from '../common/guards/tag.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CacheResult,
  CacheInvalidate,
  CacheTTL,
} from '../common/decorators/cache';
import {
  CacheInterceptor,
  CacheInvalidateInterceptor,
} from '../common/decorators/cache';
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
   *
   * SECURITY: TagGuard verifies user is a member of the workspace specified in the DTO.
   * Only OWNER, ADMIN, or MEMBER roles can create tags.
   */
  @Post()
  @UseInterceptors(CacheInvalidateInterceptor)
  @CacheInvalidate('tags')
  @UseGuards(TagGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a member of the workspace',
  })
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  /**
   * Update an existing tag
   *
   * SECURITY: TagGuard verifies user is a member of the tag's workspace.
   * Only OWNER, ADMIN, or MEMBER roles can update tags.
   */
  @Put(':id')
  @UseInterceptors(CacheInvalidateInterceptor)
  @CacheInvalidate('tags')
  @UseGuards(TagGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a member of the tag workspace',
  })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(id, updateTagDto);
  }

  /**
   * Get all tags in a workspace
   *
   * SECURITY: TagGuard verifies user is a member of the workspace specified in query param.
   * Any workspace member (OWNER, ADMIN, MEMBER, VIEWER) can list tags.
   */
  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheResult('tags', CacheTTL.LONG)
  @UseGuards(TagGuard)
  @Roles(
    MemberRole.OWNER,
    MemberRole.ADMIN,
    MemberRole.MEMBER,
    MemberRole.VIEWER,
  )
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a member of the workspace',
  })
  findAll(@Query('workspaceId') workspaceId: string) {
    return this.tagsService.findAll(workspaceId);
  }

  /**
   * Get a single tag by ID
   *
   * SECURITY: TagGuard verifies user is a member of the tag's workspace.
   * Any workspace member (OWNER, ADMIN, MEMBER, VIEWER) can view a tag.
   */
  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheResult('tag', CacheTTL.LONG)
  @UseGuards(TagGuard)
  @Roles(
    MemberRole.OWNER,
    MemberRole.ADMIN,
    MemberRole.MEMBER,
    MemberRole.VIEWER,
  )
  @ApiOperation({
    summary: 'Get a tag by ID',
    description: 'Retrieves a single tag with all its properties',
  })
  @ApiResponse({
    status: 200,
    description: 'Tag retrieved successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        name: 'Urgent',
        color: '#ef4444',
        workspaceId: 'clx0987654321',
        createdAt: '2025-01-05T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a member of the tag workspace',
  })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  /**
   * Assign a tag to a task
   *
   * SECURITY: TagGuard verifies user is a member of the tag's workspace.
   * Both the tag and task must belong to the same workspace (enforced by service layer).
   * Only OWNER, ADMIN, or MEMBER roles can assign tags to tasks.
   */
  @Post(':tagId/tasks/:taskId')
  @UseGuards(TagGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a member of the tag workspace',
  })
  @ApiResponse({ status: 404, description: 'Tag or task not found' })
  assignToTask(@Param('tagId') tagId: string, @Param('taskId') taskId: string) {
    return this.tagsService.assignToTask(tagId, taskId);
  }

  /**
   * Remove a tag from a task
   *
   * SECURITY: TagGuard verifies user is a member of the tag's workspace.
   * Only OWNER, ADMIN, or MEMBER roles can remove tags from tasks.
   */
  @Delete(':tagId/tasks/:taskId')
  @UseGuards(TagGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a member of the tag workspace',
  })
  @ApiResponse({ status: 404, description: 'Tag or task not found' })
  removeFromTask(
    @Param('tagId') tagId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tagsService.removeFromTask(tagId, taskId);
  }

  /**
   * Delete a tag
   *
   * SECURITY: TagGuard verifies user is a member of the tag's workspace.
   * Only OWNER or ADMIN roles can delete tags.
   */
  @Delete(':id')
  @UseInterceptors(CacheInvalidateInterceptor)
  @CacheInvalidate('tags')
  @UseGuards(TagGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a tag',
    description:
      'Permanently deletes a tag from the workspace. Also removes all tag assignments from tasks',
  })
  @ApiResponse({ status: 204, description: 'Tag deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a member of the tag workspace',
  })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
}
