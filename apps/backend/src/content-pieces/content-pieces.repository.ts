import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma, ContentPiece, ContentPipelineStatus } from '@prisma/client';

export interface FindContentPiecesParams {
    userId: string;
    workspaceId: string;
    status?: ContentPipelineStatus;
    seriesId?: string;
    search?: string;
    skip?: number;
    take?: number;
}

export interface PipelineView {
    scripting: ContentPiece[];
    filming: ContentPiece[];
    editing: ContentPiece[];
    scheduled: ContentPiece[];
    published: ContentPiece[];
}

@Injectable()
export class ContentPiecesRepository {
    constructor(private readonly prisma: PrismaService) { }

    private readonly defaultInclude = {
        series: {
            select: {
                id: true,
                name: true,
                color: true,
            },
        },
        socialPosts: {
            select: {
                id: true,
                platform: true,
                status: true,
                scheduledAt: true,
                publishedAt: true,
            },
        },
        idea: {
            select: {
                id: true,
                title: true,
            },
        },
    };

    async create(data: Prisma.ContentPieceCreateInput): Promise<ContentPiece> {
        return this.prisma.contentPiece.create({
            data,
            include: this.defaultInclude,
        });
    }

    async findById(id: string, workspaceId: string): Promise<ContentPiece | null> {
        return this.prisma.contentPiece.findFirst({
            where: {
                id,
                workspaceId,
                isDeleted: false,
            },
            include: this.defaultInclude,
        });
    }

    async findMany(params: FindContentPiecesParams): Promise<{ items: ContentPiece[]; total: number }> {
        const { userId, workspaceId, status, seriesId, search, skip = 0, take = 50 } = params;

        const where: Prisma.ContentPieceWhereInput = {
            userId,
            workspaceId,
            isDeleted: false,
            ...(status && { status }),
            ...(seriesId && { seriesId }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const [items, total] = await Promise.all([
            this.prisma.contentPiece.findMany({
                where,
                include: this.defaultInclude,
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            this.prisma.contentPiece.count({ where }),
        ]);

        return { items, total };
    }

    async getPipelineView(userId: string, workspaceId: string): Promise<PipelineView> {
        const baseWhere = {
            userId,
            workspaceId,
            isDeleted: false,
        };

        const [scripting, filming, editing, scheduled, published] = await Promise.all([
            this.prisma.contentPiece.findMany({
                where: { ...baseWhere, status: 'SCRIPTING' },
                include: this.defaultInclude,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.contentPiece.findMany({
                where: { ...baseWhere, status: 'FILMING' },
                include: this.defaultInclude,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.contentPiece.findMany({
                where: { ...baseWhere, status: 'EDITING' },
                include: this.defaultInclude,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.contentPiece.findMany({
                where: { ...baseWhere, status: 'SCHEDULED' },
                include: this.defaultInclude,
                orderBy: { scheduledAt: 'asc' },
            }),
            this.prisma.contentPiece.findMany({
                where: { ...baseWhere, status: 'PUBLISHED' },
                include: this.defaultInclude,
                orderBy: { publishedAt: 'desc' },
                take: 20, // Only show recent published
            }),
        ]);

        return { scripting, filming, editing, scheduled, published };
    }

    async update(id: string, data: Prisma.ContentPieceUpdateInput): Promise<ContentPiece> {
        return this.prisma.contentPiece.update({
            where: { id },
            data,
            include: this.defaultInclude,
        });
    }

    async updateStatus(id: string, status: ContentPipelineStatus): Promise<ContentPiece> {
        return this.prisma.contentPiece.update({
            where: { id },
            data: {
                status,
                statusChangedAt: new Date(),
                ...(status === 'PUBLISHED' && { publishedAt: new Date() }),
            },
            include: this.defaultInclude,
        });
    }

    async softDelete(id: string): Promise<void> {
        await this.prisma.contentPiece.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }

    async hardDelete(id: string): Promise<void> {
        await this.prisma.contentPiece.delete({
            where: { id },
        });
    }
}
