import { Injectable } from '@nestjs/common';
import { TaskTemplate } from '@ordo-todo/core';
import type { ITaskTemplateRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import {
    TaskTemplate as PrismaTaskTemplate,
    Priority as PrismaPriority,
    Prisma,
} from '@prisma/client';

/**
 * Prisma implementation of the ITaskTemplateRepository interface.
 */
@Injectable()
export class PrismaTaskTemplateRepository implements ITaskTemplateRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<TaskTemplate | null> {
        const template = await this.prisma.taskTemplate.findUnique({
            where: { id },
        });

        return template ? this.toDomain(template) : null;
    }

    async findByWorkspaceId(workspaceId: string): Promise<TaskTemplate[]> {
        const templates = await this.prisma.taskTemplate.findMany({
            where: { workspaceId },
            orderBy: { name: 'asc' },
        });

        return templates.map((t) => this.toDomain(t));
    }

    async create(template: TaskTemplate): Promise<TaskTemplate> {
        const created = await this.prisma.taskTemplate.create({
            data: {
                id: template.id as string,
                name: template.name,
                description: template.props.description,
                icon: template.props.icon,
                titlePattern: template.props.titlePattern,
                defaultPriority: template.props.defaultPriority as PrismaPriority,
                defaultEstimatedMinutes: template.props.defaultEstimatedMinutes,
                defaultDescription: template.props.defaultDescription,
                defaultTags: template.props.defaultTags as Prisma.InputJsonValue,
                workspaceId: template.props.workspaceId,
                isPublic: template.props.isPublic,
            },
        });

        return this.toDomain(created);
    }

    async update(template: TaskTemplate): Promise<TaskTemplate> {
        const updated = await this.prisma.taskTemplate.update({
            where: { id: template.id as string },
            data: {
                name: template.name,
                description: template.props.description,
                icon: template.props.icon,
                titlePattern: template.props.titlePattern,
                defaultPriority: template.props.defaultPriority as PrismaPriority,
                defaultEstimatedMinutes: template.props.defaultEstimatedMinutes,
                defaultDescription: template.props.defaultDescription,
                defaultTags: template.props.defaultTags as Prisma.InputJsonValue,
                isPublic: template.props.isPublic,
            },
        });

        return this.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.taskTemplate.delete({
            where: { id },
        });
    }

    // ============ Domain Mappers ============

    private toDomain(prismaTemplate: PrismaTaskTemplate): TaskTemplate {
        return new TaskTemplate({
            id: prismaTemplate.id,
            name: prismaTemplate.name,
            description: prismaTemplate.description ?? undefined,
            icon: prismaTemplate.icon ?? undefined,
            titlePattern: prismaTemplate.titlePattern ?? undefined,
            defaultPriority: prismaTemplate.defaultPriority as any,
            defaultEstimatedMinutes: prismaTemplate.defaultEstimatedMinutes ?? undefined,
            defaultDescription: prismaTemplate.defaultDescription ?? undefined,
            defaultTags: (prismaTemplate.defaultTags as string[]) ?? undefined,
            workspaceId: prismaTemplate.workspaceId,
            isPublic: prismaTemplate.isPublic,
            createdAt: prismaTemplate.createdAt,
            updatedAt: prismaTemplate.updatedAt,
        });
    }
}
