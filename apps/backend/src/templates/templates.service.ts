import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';

@Injectable()
export class TemplatesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateTemplateDto) {
        return this.prisma.taskTemplate.create({
            data: {
                ...dto,
                defaultTags: dto.defaultTags ? (dto.defaultTags as any) : undefined,
            },
        });
    }

    async findAll(workspaceId: string) {
        return this.prisma.taskTemplate.findMany({
            where: {
                workspaceId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        const template = await this.prisma.taskTemplate.findUnique({
            where: { id },
        });

        if (!template) {
            throw new NotFoundException(`Task template with ID ${id} not found`);
        }

        return template;
    }

    async update(id: string, dto: UpdateTemplateDto) {
        await this.findOne(id); // Ensure exists

        return this.prisma.taskTemplate.update({
            where: { id },
            data: {
                ...dto,
                defaultTags: dto.defaultTags ? (dto.defaultTags as any) : undefined,
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id); // Ensure exists

        return this.prisma.taskTemplate.delete({
            where: { id },
        });
    }
}
