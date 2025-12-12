import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import {
  CreateCustomFieldDto,
  UpdateCustomFieldDto,
  SetCustomFieldValueDto,
  CustomFieldType,
} from './dto';

@Injectable()
export class CustomFieldsService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.client.customField.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
    });
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

    // Validate options for SELECT types
    if (
      (dto.type === CustomFieldType.SELECT ||
        dto.type === CustomFieldType.MULTI_SELECT) &&
      (!dto.options || dto.options.length === 0)
    ) {
      throw new BadRequestException(
        'SELECT and MULTI_SELECT fields require at least one option',
      );
    }

    // Get max position
    const maxPos = await this.prisma.client.customField.aggregate({
      where: { projectId },
      _max: { position: true },
    });

    return this.prisma.client.customField.create({
      data: {
        name: dto.name,
        type: dto.type,
        description: dto.description,
        options: dto.options,
        isRequired: dto.isRequired ?? false,
        position: dto.position ?? (maxPos._max.position ?? 0) + 1,
        projectId,
      },
    });
  }

  /**
   * Update a custom field
   */
  async updateCustomField(fieldId: string, dto: UpdateCustomFieldDto) {
    const field = await this.prisma.client.customField.findUnique({
      where: { id: fieldId },
    });
    if (!field) {
      throw new NotFoundException('Custom field not found');
    }

    return this.prisma.client.customField.update({
      where: { id: fieldId },
      data: {
        name: dto.name,
        description: dto.description,
        options: dto.options,
        isRequired: dto.isRequired,
        position: dto.position,
      },
    });
  }

  /**
   * Delete a custom field (and all its values)
   */
  async deleteCustomField(fieldId: string) {
    const field = await this.prisma.client.customField.findUnique({
      where: { id: fieldId },
    });
    if (!field) {
      throw new NotFoundException('Custom field not found');
    }

    await this.prisma.client.customField.delete({
      where: { id: fieldId },
    });

    return { success: true };
  }

  /**
   * Get custom field values for a task
   */
  async getTaskCustomValues(taskId: string) {
    return this.prisma.client.customFieldValue.findMany({
      where: { taskId },
      include: {
        field: true,
      },
    });
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
        const field = await this.prisma.client.customField.findUnique({
          where: { id: v.fieldId },
        });
        if (!field) {
          throw new NotFoundException(`Custom field ${v.fieldId} not found`);
        }

        // Validate value based on field type
        this.validateFieldValue(
          field.type as CustomFieldType,
          v.value,
          field.options as string[] | null,
        );

        return this.prisma.client.customFieldValue.upsert({
          where: {
            fieldId_taskId: {
              fieldId: v.fieldId,
              taskId,
            },
          },
          create: {
            fieldId: v.fieldId,
            taskId,
            value: v.value,
          },
          update: {
            value: v.value,
          },
          include: {
            field: true,
          },
        });
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
      case CustomFieldType.MULTI_SELECT:
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
