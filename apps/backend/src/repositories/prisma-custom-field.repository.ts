import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import {
    ICustomFieldRepository,
    CustomField,
    CustomFieldValue,
    CustomFieldType,
} from "@ordo-todo/core";

@Injectable()
export class PrismaCustomFieldRepository implements ICustomFieldRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByProject(projectId: string): Promise<CustomField[]> {
        const fields = await this.prisma.client.customField.findMany({
            where: { projectId },
            orderBy: { position: "asc" },
        });

        return fields.map(this.mapToEntity);
    }

    async findById(id: string): Promise<CustomField | null> {
        const field = await this.prisma.client.customField.findUnique({
            where: { id },
        });

        if (!field) return null;
        return this.mapToEntity(field);
    }

    async create(field: CustomField): Promise<CustomField> {
        const created = await this.prisma.client.customField.create({
            data: {
                name: field.name,
                type: field.type,
                projectId: field.projectId,
                description: field.description,
                options: field.options || [],
                isRequired: field.isRequired,
                position: field.position,
            },
        });

        return this.mapToEntity(created);
    }

    async update(field: CustomField): Promise<CustomField> {
        const updated = await this.prisma.client.customField.update({
            where: { id: field.id },
            data: {
                name: field.name,
                description: field.description,
                options: field.options || [],
                isRequired: field.isRequired,
                position: field.position,
            },
        });

        return this.mapToEntity(updated);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.client.customField.delete({
            where: { id },
        });
    }

    async getMaxPosition(projectId: string): Promise<number> {
        const aggregate = await this.prisma.client.customField.aggregate({
            where: { projectId },
            _max: { position: true },
        });

        return aggregate._max.position || 0;
    }

    async findValuesByTask(taskId: string): Promise<CustomFieldValue[]> {
        const values = await this.prisma.client.customFieldValue.findMany({
            where: { taskId },
        });

        return values.map(this.mapValueToEntity);
    }

    async upsertValue(value: CustomFieldValue): Promise<CustomFieldValue> {
        const upserted = await this.prisma.client.customFieldValue.upsert({
            where: {
                fieldId_taskId: {
                    fieldId: value.fieldId,
                    taskId: value.taskId,
                },
            },
            create: {
                fieldId: value.fieldId,
                taskId: value.taskId,
                value: value.value,
            },
            update: {
                value: value.value,
            },
        });

        return this.mapValueToEntity(upserted);
    }

    private mapToEntity(data: any): CustomField {
        return new CustomField(
            data.id,
            data.name,
            data.type as CustomFieldType,
            data.projectId,
            data.description,
            data.options as string[],
            data.isRequired,
            data.position,
            data.createdAt,
            data.updatedAt
        );
    }

    private mapValueToEntity(data: any): CustomFieldValue {
        return new CustomFieldValue(
            data.id,
            data.fieldId,
            data.taskId,
            data.value,
            data.createdAt,
            data.updatedAt
        );
    }
}
