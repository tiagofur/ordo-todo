import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CustomFieldsService } from './custom-fields.service';
import {
  CreateCustomFieldDto,
  UpdateCustomFieldDto,
  SetMultipleCustomFieldValuesDto,
} from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class CustomFieldsController {
  constructor(private readonly customFieldsService: CustomFieldsService) {}

  /**
   * GET /api/v1/projects/:projectId/custom-fields
   * Get all custom fields for a project
   */
  @Get('projects/:projectId/custom-fields')
  async getProjectCustomFields(@Param('projectId') projectId: string) {
    return this.customFieldsService.getProjectCustomFields(projectId);
  }

  /**
   * POST /api/v1/projects/:projectId/custom-fields
   * Create a new custom field for a project
   */
  @Post('projects/:projectId/custom-fields')
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
  async deleteCustomField(@Param('id') id: string) {
    return this.customFieldsService.deleteCustomField(id);
  }

  /**
   * GET /api/v1/tasks/:taskId/custom-values
   * Get custom field values for a task
   */
  @Get('tasks/:taskId/custom-values')
  async getTaskCustomValues(@Param('taskId') taskId: string) {
    return this.customFieldsService.getTaskCustomValues(taskId);
  }

  /**
   * PATCH /api/v1/tasks/:taskId/custom-values
   * Set custom field values for a task
   */
  @Patch('tasks/:taskId/custom-values')
  async setTaskCustomValues(
    @Param('taskId') taskId: string,
    @Body() dto: SetMultipleCustomFieldValuesDto,
  ) {
    return this.customFieldsService.setTaskCustomValues(taskId, dto.values);
  }
}
