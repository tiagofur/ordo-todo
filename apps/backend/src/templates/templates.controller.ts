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
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Templates')
@ApiBearerAuth()
@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  /**
   * Creates a new template
   * Templates provide reusable task structures with default values
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new template',
    description:
      'Creates a new task template with customizable default values for name, description, priority, estimated time, tags, and title patterns. Templates can be public (accessible by all) or private.',
  })
  @ApiResponse({
    status: 201,
    description: 'Template created successfully',
    schema: {
      example: {
        id: 'tmpl1234567890',
        name: 'Weekly Review',
        description: 'Template for weekly review tasks',
        icon: '📋',
        titlePattern: 'Weekly Review - {date}',
        defaultPriority: 'MEDIUM',
        defaultEstimatedMinutes: 30,
        defaultDescription: 'Review progress for the week',
        defaultTags: ['review', 'weekly'],
        workspaceId: 'workspace123',
        isPublic: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  create(@Body() createTemplateDto: CreateTemplateDto) {
    return this.templatesService.create(createTemplateDto);
  }

  /**
   * Gets all templates for a workspace
   * Requires workspaceId query parameter
   */
  @Get()
  @ApiOperation({
    summary: 'Get all templates for a workspace',
    description:
      'Returns all templates in the specified workspace. Both public and private templates owned by the user are included.',
  })
  @ApiQuery({
    name: 'workspaceId',
    description: 'Workspace ID to filter templates',
    required: true,
    example: 'workspace123',
  })
  @ApiResponse({
    status: 200,
    description: 'Templates retrieved successfully',
    schema: {
      type: 'array',
      example: [
        {
          id: 'tmpl1234567890',
          name: 'Weekly Review',
          description: 'Template for weekly review tasks',
          icon: '📋',
          titlePattern: 'Weekly Review - {date}',
          defaultPriority: 'MEDIUM',
          defaultEstimatedMinutes: 30,
          defaultTags: ['review', 'weekly'],
          workspaceId: 'workspace123',
          isPublic: true,
        },
        {
          id: 'tmpl9876543210',
          name: 'Bug Report',
          description: 'Template for bug reports',
          icon: '🐛',
          titlePattern: 'Bug: {description}',
          defaultPriority: 'HIGH',
          defaultEstimatedMinutes: 60,
          defaultTags: ['bug'],
          workspaceId: 'workspace123',
          isPublic: false,
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: 'workspaceId is required' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query('workspaceId') workspaceId: string) {
    if (!workspaceId) {
      throw new BadRequestException('workspaceId is required');
    }
    return this.templatesService.findAll(workspaceId);
  }

  /**
   * Gets a specific template by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get template by ID',
    description:
      'Returns detailed information about a specific template. Includes all default values and template configuration.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID',
    example: 'tmpl1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Template retrieved successfully',
    schema: {
      example: {
        id: 'tmpl1234567890',
        name: 'Weekly Review',
        description: 'Template for weekly review tasks',
        icon: '📋',
        titlePattern: 'Weekly Review - {date}',
        defaultPriority: 'MEDIUM',
        defaultEstimatedMinutes: 30,
        defaultDescription: 'Review progress for the week',
        defaultTags: ['review', 'weekly'],
        workspaceId: 'workspace123',
        isPublic: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  /**
   * Updates an existing template
   * All fields are optional - only provided fields will be updated
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update template',
    description:
      'Updates an existing template. All fields are optional - only provided fields will be modified. Cannot change workspaceId.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID',
    example: 'tmpl1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Template updated successfully',
    schema: {
      example: {
        id: 'tmpl1234567890',
        name: 'Monthly Review',
        description: 'Updated template for monthly review',
        icon: '📊',
        titlePattern: 'Monthly Review - {month} {year}',
        defaultPriority: 'HIGH',
        defaultEstimatedMinutes: 60,
        defaultTags: ['review', 'monthly'],
        workspaceId: 'workspace123',
        isPublic: true,
        updatedAt: '2025-01-01T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  update(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(id, updateTemplateDto);
  }

  /**
   * Deletes a template
   * This is a permanent deletion and cannot be undone
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete template',
    description:
      'Permanently deletes a template. This action cannot be undone. Tasks created from this template will not be affected.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID',
    example: 'tmpl1234567890',
  })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }
}
