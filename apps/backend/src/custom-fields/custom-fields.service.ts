import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import {
  CustomField,
  CustomFieldValue,
  CustomFieldType,
} from '@ordo-todo/core';
import type { ICustomFieldRepository } from '@ordo-todo/core';
import { PrismaService } from '@/database/prisma.service';
import {
  CreateCustomFieldDto,
  UpdateCustomFieldDto,
  SetCustomFieldValueDto,
} from './dto';

@Injectable()
export class CustomFieldsService {
  constructor(
    @Inject('CustomFieldRepository')
    private readonly customFieldRepository: ICustomFieldRepository,
    private readonly prisma: PrismaService, // Keep for existence checks of other entities if needed, or better, use other repositories
  ) {}

  /**
   * Get all custom fields for a project
   */
  async getProjectCustomFields(projectId: string) {
    // Verify project exists
    const project = await this.prisma.client.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.customFieldRepository.findByProject(projectId);
  }

  /**
   * Create a new custom field for a project
   */
  async createCustomField(projectId: string, dto: CreateCustomFieldDto) {
    // Verify project exists
    const project = await this.prisma.client.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const field = CustomField.create({
      name: dto.name,
      type: dto.type as unknown as CustomFieldType,
      projectId,
      description: dto.description,
      options: dto.options,
      isRequired: dto.isRequired,
      position: dto.position,
    });

    if (field.position === 0) {
      const maxPos = await this.customFieldRepository.getMaxPosition(projectId);
      field.position = maxPos + 1;
    }

    return this.customFieldRepository.create(field);
  }

  /**
   * Update a custom field
   */
  async updateCustomField(fieldId: string, dto: UpdateCustomFieldDto) {
    const field = await this.customFieldRepository.findById(fieldId);
    if (!field) {
      throw new NotFoundException('Custom field not found');
    }

    field.update({
      name: dto.name,
      description: dto.description,
      options: dto.options,
      isRequired: dto.isRequired,
      position: dto.position,
    });

    return this.customFieldRepository.update(field);
  }

  /**
   * Delete a custom field (and all its values)
   */
  async deleteCustomField(fieldId: string) {
    const field = await this.customFieldRepository.findById(fieldId);
    if (!field) {
      throw new NotFoundException('Custom field not found');
    }

    await this.customFieldRepository.delete(fieldId);
    return { success: true };
  }

  /**
   * Get custom field values for a task
   */
  async getTaskCustomValues(taskId: string) {
    return this.customFieldRepository.findValuesByTask(taskId);
  }

  /**
   * Set custom field values for a task
   */
  async setTaskCustomValues(taskId: string, values: SetCustomFieldValueDto[]) {
    // Verify task exists
    const task = await this.prisma.client.task.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Upsert each value
    const results = await Promise.all(
      values.map(async (v) => {
        // Verify field exists
        const field = await this.customFieldRepository.findById(v.fieldId);
        if (!field) {
          throw new NotFoundException(`Custom field ${v.fieldId} not found`);
        }

        // Validate value based on field type
        this.validateFieldValue(field.type, v.value, field.options || null);

        const customValue = CustomFieldValue.create({
          fieldId: v.fieldId,
          taskId,
          value: v.value,
        });

        return this.customFieldRepository.upsertValue(customValue);
      }),
    );

    return results;
  }

  /**
   * Validate value based on field type
   */
  private validateFieldValue(
    type: CustomFieldType,
    value: string,
    options: string[] | null,
  ) {
    switch (type) {
      case CustomFieldType.NUMBER:
        if (isNaN(Number(value))) {
          throw new BadRequestException('Invalid number value');
        }
        break;
      case CustomFieldType.SELECT:
        if (options && !options.includes(value)) {
          throw new BadRequestException(
            `Invalid option. Must be one of: ${options.join(', ')}`,
          );
        }
        break;
      case CustomFieldType.MULTI_SELECT: {
        const selectedOptions = value.split(',').map((s) => s.trim());
        if (options) {
          const invalid = selectedOptions.filter((o) => !options.includes(o));
          if (invalid.length > 0) {
            throw new BadRequestException(
              `Invalid options: ${invalid.join(', ')}`,
            );
          }
        }
        break;
      }
      case CustomFieldType.EMAIL:
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          throw new BadRequestException('Invalid email format');
        }
        break;
      case CustomFieldType.URL:
        if (value) {
          try {
            new URL(value);
          } catch {
            throw new BadRequestException('Invalid URL format');
          }
        }
        break;
      case CustomFieldType.CHECKBOX:
        if (!['true', 'false', '1', '0'].includes(value.toLowerCase())) {
          throw new BadRequestException('Checkbox value must be true or false');
        }
        break;
      case CustomFieldType.DATE:
        if (value && isNaN(Date.parse(value))) {
          throw new BadRequestException('Invalid date format');
        }
        break;
    }
  }
}
