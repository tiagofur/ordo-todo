import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma, SocialPost, SocialPostStatus, ContentPlatform } from '@prisma/client';

@Injectable()
export class PublishingRepository {
    constructor(private readonly prisma: PrismaService) { }

    private readonly defaultInclude = {
        contentPiece: {
            select: {
                id: true,
                title: true,
                status: true,
            },
        },
    };

    async create(data: Prisma.SocialPostCreateInput): Promise<SocialPost> {
        return this.prisma.socialPost.create({
            data,
            include: this.defaultInclude,
        });
    }

    async createMany(data: Prisma.SocialPostCreateManyInput[]): Promise<number> {
        const result = await this.prisma.socialPost.createMany({
            data,
            skipDuplicates: true,
        });
        return result.count;
    }

    async findById(id: string): Promise<SocialPost | null> {
        return this.prisma.socialPost.findUnique({
            where: { id },
            include: this.defaultInclude,
        });
    }

    async findByContentPiece(contentPieceId: string): Promise<SocialPost[]> {
        return this.prisma.socialPost.findMany({
            where: { contentPieceId },
            include: this.defaultInclude,
            orderBy: { scheduledAt: 'asc' },
        });
    }

    async findScheduled(
        userId: string,
        options: {
            from?: Date;
            to?: Date;
            platform?: ContentPlatform;
            skip?: number;
            take?: number;
        } = {},
    ): Promise<{ items: SocialPost[]; total: number }> {
        const { from, to, platform, skip = 0, take = 50 } = options;

        const where: Prisma.SocialPostWhereInput = {
            userId,
            status: 'SCHEDULED',
            ...(platform && { platform }),
            ...(from && to && {
                scheduledAt: {
                    gte: from,
                    lte: to,
                },
            }),
        };

        const [items, total] = await Promise.all([
            this.prisma.socialPost.findMany({
                where,
                include: this.defaultInclude,
                orderBy: { scheduledAt: 'asc' },
                skip,
                take,
            }),
            this.prisma.socialPost.count({ where }),
        ]);

        return { items, total };
    }

    async findDueForPublishing(): Promise<SocialPost[]> {
        return this.prisma.socialPost.findMany({
            where: {
                status: 'SCHEDULED',
                scheduledAt: { lte: new Date() },
            },
            include: this.defaultInclude,
            orderBy: { scheduledAt: 'asc' },
        });
    }

    async update(id: string, data: Prisma.SocialPostUpdateInput): Promise<SocialPost> {
        return this.prisma.socialPost.update({
            where: { id },
            data,
            include: this.defaultInclude,
        });
    }

    async updateStatus(id: string, status: SocialPostStatus, extra?: {
        platformPostId?: string;
        platformUrl?: string;
        errorMessage?: string;
        publishedAt?: Date;
    }): Promise<SocialPost> {
        return this.prisma.socialPost.update({
            where: { id },
            data: {
                status,
                ...extra,
            },
            include: this.defaultInclude,
        });
    }

    async updateAnalytics(id: string, analytics: {
        views?: number;
        likes?: number;
        comments?: number;
        shares?: number;
    }): Promise<SocialPost> {
        return this.prisma.socialPost.update({
            where: { id },
            data: {
                ...analytics,
                analyticsUpdatedAt: new Date(),
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.socialPost.delete({ where: { id } });
    }

    async getCalendarView(
        userId: string,
        startDate: Date,
        endDate: Date,
    ): Promise<SocialPost[]> {
        return this.prisma.socialPost.findMany({
            where: {
                userId,
                OR: [
                    {
                        scheduledAt: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                    {
                        publishedAt: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                ],
            },
            include: this.defaultInclude,
            orderBy: [
                { scheduledAt: 'asc' },
                { publishedAt: 'asc' },
            ],
        });
    }
}
