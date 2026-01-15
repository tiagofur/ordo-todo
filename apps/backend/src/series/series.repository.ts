import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma, Series } from '@prisma/client';

@Injectable()
export class SeriesRepository {
    constructor(private readonly prisma: PrismaService) { }

    private readonly defaultInclude = {
        contentPieces: {
            where: { isDeleted: false },
            select: {
                id: true,
                title: true,
                status: true,
                episodeNumber: true,
            },
            orderBy: { episodeNumber: 'asc' as const },
        },
        _count: {
            select: { contentPieces: true },
        },
    };

    async create(data: Prisma.SeriesCreateInput): Promise<Series> {
        return this.prisma.series.create({
            data,
            include: this.defaultInclude,
        });
    }

    async findById(id: string, workspaceId: string): Promise<Series | null> {
        return this.prisma.series.findFirst({
            where: { id, workspaceId },
            include: this.defaultInclude,
        });
    }

    async findMany(
        userId: string,
        workspaceId: string,
        options: { isActive?: boolean; skip?: number; take?: number } = {},
    ): Promise<{ items: Series[]; total: number }> {
        const { isActive, skip = 0, take = 50 } = options;

        const where: Prisma.SeriesWhereInput = {
            userId,
            workspaceId,
            ...(isActive !== undefined && { isActive }),
        };

        const [items, total] = await Promise.all([
            this.prisma.series.findMany({
                where,
                include: this.defaultInclude,
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            this.prisma.series.count({ where }),
        ]);

        return { items, total };
    }

    async update(id: string, data: Prisma.SeriesUpdateInput): Promise<Series> {
        return this.prisma.series.update({
            where: { id },
            data,
            include: this.defaultInclude,
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.series.delete({ where: { id } });
    }

    async addContentPiece(seriesId: string, contentPieceId: string, episodeNumber?: number): Promise<void> {
        await this.prisma.contentPiece.update({
            where: { id: contentPieceId },
            data: {
                seriesId,
                episodeNumber,
            },
        });
    }

    async removeContentPiece(contentPieceId: string): Promise<void> {
        await this.prisma.contentPiece.update({
            where: { id: contentPieceId },
            data: {
                seriesId: null,
                episodeNumber: null,
            },
        });
    }

    async getNextEpisodeNumber(seriesId: string): Promise<number> {
        const result = await this.prisma.contentPiece.aggregate({
            where: { seriesId },
            _max: { episodeNumber: true },
        });
        return (result._max.episodeNumber ?? 0) + 1;
    }
}
