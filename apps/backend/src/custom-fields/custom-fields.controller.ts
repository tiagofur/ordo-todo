import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CustomFieldsService } from './custom-fields.service';
import {
  CreateCustomFieldDto,
  UpdateCustomFieldDto,
  SetMultipleCustomFieldValuesDto,
} from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('CustomFields')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class CustomFieldsController {
  constructor(private readonly customFieldsService: CustomFieldsService) {}

  /**
   * GET /api/v1/projects/:projectId/custom-fields
   * Get all custom fields for a project
   */
  @Get('projects/:projectId/custom-fields')
  @ApiOperation({
    summary: 'Get custom fields for a project',
    description:
      'Returns all custom fields defined for a specific project. Includes field definitions (name, type, options) but not actual values.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Custom fields retrieved successfully',
    schema: {
      type: 'array',
      example: [
        {
          id: 'field1',
          name: 'Priority',
          type: 'SELECT',
          description: 'Task priority level',
          options: ['Low', 'Medium', 'High', 'Critical'],
          isRequired: true,
          position: 1,
          projectId: 'project123',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'field2',
          name: 'Estimated Hours',
          type: 'NUMBER',
          description: 'Time estimate for task completion',
          isRequired: false,
          position: 2,
          projectId: 'project123',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getProjectCustomFields(@Param('projectId') projectId: string) {
    return this.customFieldsService.getProjectCustomFields(projectId);
  }

  /**
   * POST /api/v1/projects/:projectId/custom-fields
   * Create a new custom field for a project
   */
  @Post('projects/:projectId/custom-fields')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create custom field',
    description:
      'Creates a new custom field definition for a project. Supported types: TEXT, NUMBER, SELECT, MULTI_SELECT, DATE, URL, EMAIL, CHECKBOX.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 201,
    description: 'Custom field created successfully',
    schema: {
      example: {
        id: 'field1',
        name: 'Priority',
        type: 'SELECT',
        description: 'Task priority level',
        options: ['Low', 'Medium', 'High'],
        isRequired: true,
        position: 1,
        projectId: 'project123',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async createCustomField(
    @Param('projectId') projectId: string,
    @Body() dto: CreateCustomFieldDto,
  ) {
    return this.customFieldsService.createCustomField(projectId, dto);
  }

  /**
   * PATCH /api/v1/custom-fields/:id
   * Update a custom field
   */
  @Patch('custom-fields/:id')
  @ApiOperation({
    summary: 'Update custom field',
    description:
      'Updates an existing custom field definition. All fields are optional. Cannot change field type.',
  })
  @ApiParam({
    name: 'id',
    description: 'Custom field ID',
    example: 'field1',
  })
  @ApiResponse({
    status: 200,
    description: 'Custom field updated successfully',
    schema: {
      example: {
        id: 'field1',
        name: 'Priority',
        type: 'SELECT',
        description: 'Updated priority level',
        options: ['Low', 'Medium', 'High', 'Critical'],
        isRequired: true,
        position: 2,
        projectId: 'project123',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Custom field not found' })
  async updateCustomField(
    @Param('id') id: string,
    @Body() dto: UpdateCustomFieldDto,
  ) {
    return this.customFieldsService.updateCustomField(id, dto);
  }

  /**
   * DELETE /api/v1/custom-fields/:id
   * Delete a custom field
   */
  @Delete('custom-fields/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete custom field',
    description:
      'Deletes a custom field definition. All values for this field across tasks will also be deleted.',
  })
  @ApiParam({
    name: 'id',
    description: 'Custom field ID',
    example: 'field1',
  })
  @ApiResponse({
    status: 204,
    description: 'Custom field deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Custom field not found' })
  async deleteCustomField(@Param('id') id: string) {
    return this.customFieldsService.deleteCustomField(id);
  }

  /**
   * GET /api/v1/tasks/:taskId/custom-values
   * Get custom field values for a task
   */
  @Get('tasks/:taskId/custom-values')
  @ApiOperation({
    summary: 'Get custom field values for a task',
    description:
      'Returns all custom field values for a specific task. Includes both field definition and current value.',
  })
  @ApiParam({
    name: 'taskId',
    description: 'Task ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Custom values retrieved successfully',
    schema: {
      type: 'array',
      example: [
        {
          id: 'value1',
          fieldId: 'field1',
          taskId: 'task123',
          value: 'High',
          field: {
            id: 'field1',
            name: 'Priority',
            type: 'SELECT',
            options: ['Low', 'Medium', 'High'],
          },
        },
        {
          id: 'value2',
          fieldId: 'field2',
          taskId: 'task123',
          value: '8',
          field: {
            id: 'field2',
            name: 'Estimated Hours',
            type: 'NUMBER',
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getTaskCustomValues(@Param('taskId') taskId: string) {
    return this.customFieldsService.getTaskCustomValues(taskId);
  }

  /**
   * PATCH /api/v1/tasks/:taskId/custom-values
   * Set custom field values for a task
   */
  @Patch('tasks/:taskId/custom-values')
  @ApiOperation({
    summary: 'Set custom field values for a task',
    description:
      'Sets multiple custom field values for a task. Updates existing values or creates new ones. Values are stored as strings and parsed based on field type.',
  })
  @ApiParam({
    name: 'taskId',
    description: 'Task ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Custom values updated successfully',
    schema: {
      type: 'array',
      example: [
        {
          id: 'value1',
          fieldId: 'field1',
          taskId: 'task123',
          value: 'High',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-02T12:00:00.000Z',
        },
        {
          id: 'value2',
          fieldId: 'field2',
          taskId: 'task123',
          value: '8',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-02T12:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task or field not found' })
  async setTaskCustomValues(
    @Param('taskId') taskId: string,
    @Body() dto: SetMultipleCustomFieldValuesDto,
  ) {
    return this.customFieldsService.setTaskCustomValues(taskId, dto.values);
  }
}
